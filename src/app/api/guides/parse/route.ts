import { NextRequest, NextResponse } from 'next/server';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import { adminDb } from '@/lib/firebase-admin';
import type { Root, Heading, Paragraph, List, ListItem } from 'mdast';

/**
 * 팀장님 스키마에 맞는 블록 타입 정의
 */
type Block =
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | ImageBlock
  | QuoteBlock
  | DividerBlock
  | AdBlock;

interface HeadingBlock {
  type: 'heading';
  level: number;
  content: string;
  id?: string;
}

interface ParagraphBlock {
  type: 'paragraph';
  content: string;
}

interface ListBlock {
  type: 'list';
  style: 'bullet' | 'ordered';
  items: string[];
}

interface ImageBlock {
  type: 'image';
  url?: string;
  alt?: string;
  caption?: string;
}

interface QuoteBlock {
  type: 'quote';
  content: string;
  style?: 'info' | 'warning' | 'error' | 'success';
}

interface DividerBlock {
  type: 'divider';
}

interface AdBlock {
  type: 'ad';
  position?: 'top' | 'middle' | 'bottom' | 'sidebar';
}

/**
 * 튜닝 가이드 최종 구조
 */
interface TuningGuide {
  id: string;
  levelId: 'beginner' | 'intermediate' | 'advanced';
  categoryId: string;
  title: string;
  slug: string;
  summary?: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  blocks: Block[];
}

/**
 * AST 노드에서 텍스트 추출
 */
function extractTextFromNode(node: any): string {
  if (node.type === 'text') return node.value;
  if (node.children) {
    return node.children.map((child: any) => extractTextFromNode(child)).join('');
  }
  return '';
}

/**
 * 제목을 slug로 변환
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w가-힣-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Google Docs 텍스트를 Markdown으로 변환
 */
function textToMarkdown(text: string): string {
  const lines = text.split('\n');
  let markdown = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      markdown += '\n';
      continue;
    }

    // 1) 제목 - 숫자)
    if (/^\d+\)\s/.test(trimmed)) {
      markdown += `# ${trimmed.replace(/^\d+\)\s/, '')}\n\n`;
    }
    // 2) 부제목 - 숫자.
    else if (/^\d+\.\s/.test(trimmed)) {
      markdown += `## ${trimmed.replace(/^\d+\.\s/, '')}\n\n`;
    }
    // 3) 리스트 - 불릿
    else if (/^[-∙•]\s/.test(trimmed)) {
      markdown += `- ${trimmed.replace(/^[-∙•]\s*/, '')}\n`;
    }
    // 4) 일반 문단
    else {
      markdown += `${trimmed}\n\n`;
    }
  }

  return markdown;
}

/**
 * Markdown AST를 팀장님 스키마의 blocks 배열로 변환
 */
function astToBlocks(ast: Root): Block[] {
  const blocks: Block[] = [];

  visit(ast, (node) => {
    // Heading
    if (node.type === 'heading') {
      const headingNode = node as Heading;
      const content = extractTextFromNode(headingNode);
      blocks.push({
        type: 'heading',
        level: headingNode.depth,
        content,
        id: slugify(content),
      });
    }
    // Paragraph
    else if (node.type === 'paragraph') {
      const paragraphNode = node as Paragraph;
      const content = extractTextFromNode(paragraphNode);
      if (content.trim()) {
        blocks.push({
          type: 'paragraph',
          content: content.trim(),
        });
      }
    }
    // List
    else if (node.type === 'list') {
      const listNode = node as List;
      const items: string[] = [];

      listNode.children.forEach((item) => {
        if (item.type === 'listItem') {
          const itemText = extractTextFromNode(item);
          if (itemText.trim()) {
            items.push(itemText.trim());
          }
        }
      });

      if (items.length > 0) {
        blocks.push({
          type: 'list',
          style: listNode.ordered ? 'ordered' : 'bullet',
          items,
        });
      }
    }
    // Image
    else if (node.type === 'image') {
      const imageNode = node as any;
      blocks.push({
        type: 'image',
        url: imageNode.url || undefined,
        alt: imageNode.alt || undefined,
        caption: imageNode.title || undefined,
      });
    }
  });

  return blocks;
}

/**
 * n8n에서 Google Docs 텍스트를 받아서 스키마 형식으로 변환 + Firestore 저장
 * POST /api/guides/parse
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      levelId,
      categoryId,
      title,
      slug,
      summary,
      tags,
      status = 'published',
    } = body;

    // 필수 필드 검증
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'text field is required' },
        { status: 400 }
      );
    }

    if (!levelId || !['beginner', 'intermediate', 'advanced'].includes(levelId)) {
      return NextResponse.json(
        { error: 'levelId must be beginner, intermediate, or advanced' },
        { status: 400 }
      );
    }

    if (!categoryId || typeof categoryId !== 'string') {
      return NextResponse.json(
        { error: 'categoryId field is required' },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'title field is required' },
        { status: 400 }
      );
    }

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'slug field is required' },
        { status: 400 }
      );
    }

    // 1. Google Docs 텍스트 → Markdown 변환
    const markdown = textToMarkdown(text);

    // 2. Markdown → AST 파싱
    const processor = unified().use(remarkParse);
    const ast = processor.parse(markdown) as Root;

    // 3. AST → blocks 배열 변환
    const blocks = astToBlocks(ast);

    // 4. 최종 JSON 구조 생성
    const id = `${levelId}_${categoryId}_${slug}`;
    const now = new Date().toISOString();

    const guide: any = {
      id,
      levelId: levelId as 'beginner' | 'intermediate' | 'advanced',
      categoryId,
      title,
      slug,
      status: status as 'draft' | 'published' | 'archived',
      createdAt: now,
      updatedAt: now,
      blocks,
    };

    // Optional 필드들은 값이 있을 때만 추가
    if (summary) guide.summary = summary;
    if (tags && tags.length > 0) guide.tags = tags;

    // 5. Firestore에 저장
    const docRef = adminDb.collection('guides').doc(id);
    await docRef.set(guide);

    console.log(`✅ Firestore 저장 완료: guides/${id}`);

    return NextResponse.json({
      success: true,
      guide,
      message: `Successfully parsed and saved to Firestore: guides/${id}`,
    });

  } catch (error) {
    console.error('Guide parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse guide', details: String(error) },
      { status: 500 }
    );
  }
}
