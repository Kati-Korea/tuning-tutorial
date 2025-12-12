import { NextRequest, NextResponse } from 'next/server';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';
import { visit } from 'unist-util-visit';
import { adminDb } from '@/lib/firebase-admin';
import type { Root, Heading } from 'mdast';

/**
 * 위키독스 섹션 인터페이스
 */
interface Section {
  level: number;
  title: string;
  content: string;
  children: Section[];
}

/**
 * Markdown AST를 위키독스 계층 구조로 변환
 */
function parseMarkdownToSections(ast: Root): Section[] {
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let currentContent: string[] = [];

  visit(ast, (node) => {
    // Heading 노드 발견
    if (node.type === 'heading') {
      const headingNode = node as Heading;

      // 이전 섹션이 있으면 content 저장
      if (currentSection) {
        currentSection.content = currentContent.join('\n').trim();
        currentContent = [];
      }

      // 새 섹션 생성
      const title = headingNode.children
        .map((child: any) => child.value || '')
        .join('');

      const newSection: Section = {
        level: headingNode.depth,
        title,
        content: '',
        children: [],
      };

      // 계층 구조 구성
      if (headingNode.depth === 1) {
        // 최상위 섹션
        sections.push(newSection);
        currentSection = newSection;
      } else {
        // 하위 섹션 찾기
        const parentSection = findParentSection(sections, headingNode.depth);
        if (parentSection) {
          parentSection.children.push(newSection);
          currentSection = newSection;
        }
      }
    }
    // Paragraph, List 등 content 수집
    else if (node.type === 'paragraph' || node.type === 'list') {
      const textContent = extractTextFromNode(node);
      if (textContent) {
        currentContent.push(textContent);
      }
    }
  });

  // 마지막 섹션 content 저장
  if (currentSection) {
    currentSection.content = currentContent.join('\n').trim();
  }

  return sections;
}

/**
 * 부모 섹션 찾기 (재귀)
 */
function findParentSection(sections: Section[], targetLevel: number): Section | undefined {
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i];
    if (section.level < targetLevel) {
      // 자식 섹션도 확인
      if (section.children.length > 0) {
        const childParent = findParentSection(section.children, targetLevel);
        if (childParent) return childParent;
      }
      return section;
    }
  }
  return undefined;
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
 * n8n에서 마크다운 텍스트를 받아서 remark로 파싱 + Firestore 저장
 * POST /api/parse-markdown
 */
export async function POST(request: NextRequest) {
  try {
    const { markdown, documentId } = await request.json();

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

    // unified + remark로 파싱
    const processor = unified().use(remarkParse);
    const ast = processor.parse(markdown) as Root;

    // 위키독스 계층 구조로 변환
    const sections = parseMarkdownToSections(ast);

    // HTML 변환 (필요시)
    const htmlProcessor = unified().use(remarkParse).use(remarkHtml);
    const htmlResult = await htmlProcessor.process(markdown);
    const html = String(htmlResult);

    // Firestore에 저장
    const docRef = adminDb.collection('guides').doc(documentId);
    await docRef.set({
      documentId,
      sections,
      html,
      metadata: {
        characterCount: markdown.length,
        wordCount: markdown.split(/\s+/).length,
        sectionsCount: sections.length,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      documentId,
      sections,
      metadata: {
        characterCount: markdown.length,
        wordCount: markdown.split(/\s+/).length,
        sectionsCount: sections.length,
      },
      message: 'Successfully parsed and saved to Firestore',
    });

  } catch (error) {
    console.error('Markdown parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse markdown', details: String(error) },
      { status: 500 }
    );
  }
}
