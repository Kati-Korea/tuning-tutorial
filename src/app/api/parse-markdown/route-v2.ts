import { NextRequest, NextResponse } from 'next/server';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import { adminDb } from '@/lib/firebase-admin';
import type { Root, Heading, Paragraph, List } from 'mdast';
import type { ContentBlock } from '@/types/tuning-guide.types';

/**
 * Markdown AST를 블록 배열로 변환 (팀장님 규칙 적용)
 */
function parseMarkdownToBlocks(ast: Root): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let currentList: any = null;

  visit(ast, (node) => {
    // ===== 1. Heading =====
    if (node.type === 'heading') {
      currentList = null;
      const headingNode = node as Heading;
      const content = extractTextFromNode(headingNode);
      const id = slugify(content);

      blocks.push({
        type: 'heading',
        level: headingNode.depth as 1 | 2 | 3 | 4 | 5 | 6,
        content,
        id,
      });
    }

    // ===== 2. Paragraph =====
    else if (node.type === 'paragraph') {
      currentList = null;
      const paragraphNode = node as Paragraph;
      const content = extractTextFromNode(paragraphNode);

      if (content.trim()) {
        blocks.push({
          type: 'paragraph',
          content,
        });
      }
    }

    // ===== 3. List =====
    else if (node.type === 'list') {
      const listNode = node as List;
      const items: string[] = [];

      // 리스트 아이템 추출
      listNode.children.forEach((item: any) => {
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

      currentList = null;
    }
  });

  return blocks;
}

/**
 * AST 노드에서 텍스트 추출 (재귀)
 */
function extractTextFromNode(node: any): string {
  if (node.type === 'text') return node.value;
  if (node.children) {
    return node.children.map((child: any) => extractTextFromNode(child)).join('');
  }
  return '';
}

/**
 * 텍스트를 slug로 변환
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

/**
 * 광고 블록 자동 삽입
 */
function insertAdBlocks(blocks: ContentBlock[]): ContentBlock[] {
  const result: ContentBlock[] = [];
  let h2Count = 0;
  const totalBlocks = blocks.length;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    result.push(block);

    // 첫 번째 H2 다음에 top 광고
    if (block.type === 'heading' && block.level === 2) {
      h2Count++;
      if (h2Count === 1) {
        result.push({ type: 'ad', position: 'top' });
      }
    }

    // 중간 지점에 middle 광고
    if (i === Math.floor(totalBlocks * 0.5)) {
      result.push({ type: 'ad', position: 'middle' });
    }
  }

  // 마지막에 bottom 광고
  result.push({ type: 'ad', position: 'bottom' });

  return result;
}

/**
 * n8n에서 마크다운 텍스트를 받아서 블록 배열로 파싱 + Firestore 저장
 * POST /api/parse-markdown
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      markdown,
      documentId,
      levelId = 'beginner',
      categoryId = 'exterior',
      slug,
      title,
      summary,
      tags = [],
    } = body;

    // ===== 필수 필드 검증 =====
    if (!markdown || typeof markdown !== 'string') {
      return NextResponse.json(
        { error: 'markdown field is required' },
        { status: 400 }
      );
    }

    if (!documentId || typeof documentId !== 'string') {
      return NextResponse.json(
        { error: 'documentId field is required' },
        { status: 400 }
      );
    }

    // ===== Markdown 파싱 =====
    const processor = unified().use(remarkParse);
    const ast = processor.parse(markdown) as Root;

    // ===== 블록 배열로 변환 =====
    const blocks = parseMarkdownToBlocks(ast);

    // ===== 광고 자동 삽입 =====
    const blocksWithAds = insertAdBlocks(blocks);

    // ===== 제목/요약 자동 추출 =====
    const autoTitle =
      title ||
      blocks.find((b) => b.type === 'heading' && b.level === 1)?.content ||
      'Untitled';

    const autoSummary =
      summary ||
      blocks.find((b) => b.type === 'paragraph')?.content?.substring(0, 200) ||
      '';

    // ===== ID 생성 =====
    const id = `${levelId}_${categoryId}_${slug || documentId}`;

    // ===== 최종 문서 구조 (팀장님 규칙 적용) =====
    const guide = {
      id,
      levelId,
      categoryId,
      title: autoTitle,
      slug: slug || documentId,
      summary: autoSummary,
      tags,
      status: 'published',
      blocks: blocksWithAds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // ===== Firestore 저장 =====
    await adminDb.collection('guides').doc(id).set(guide);

    console.log(`✅ Firestore 저장 완료: ${id}`);
    console.log(`   제목: ${guide.title}`);
    console.log(`   블록 수: ${guide.blocks.length}`);

    // ===== 응답 =====
    return NextResponse.json({
      success: true,
      documentId: id,
      title: guide.title,
      blocksCount: guide.blocks.length,
      message: 'Successfully parsed and saved to Firestore',
    });

  } catch (error) {
    console.error('❌ Markdown parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse markdown', details: String(error) },
      { status: 500 }
    );
  }
}
