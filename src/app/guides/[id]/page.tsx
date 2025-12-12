import { adminDb } from '@/lib/firebase-admin';
import { notFound, redirect } from 'next/navigation';
import type { TuningGuide, ContentBlock } from '@/types/tuning-guide.types';

interface GuidePageProps {
  params: Promise<{ id: string }>;
}

async function getGuide(id: string) {
  try {
    const docRef = adminDb.collection('guides').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as TuningGuide;
  } catch (error) {
    console.error('Error fetching guide:', error);
    return null;
  }
}

// 같은 카테고리의 가이드 목록 가져오기
// 섹션별로 블록 분할 (section 페이지와 동일한 로직)
function splitIntoSections(blocks: ContentBlock[]) {
  const sections: Array<{
    id: string;
    title: string;
    blocks: ContentBlock[];
  }> = [];

  let currentSection: ContentBlock[] = [];
  let currentSectionId = 'intro'; // 기본값: intro
  let currentSectionTitle = '소개'; // 기본값: 소개

  blocks.forEach((block, index) => {
    if (block.type === 'heading' && (block.level === 1 || block.level === 2)) {
      // 이전 섹션 저장 (비어있지 않은 경우)
      if (currentSection.length > 0) {
        sections.push({
          id: currentSectionId || `section-${sections.length}`,
          title: currentSectionTitle || `섹션 ${sections.length + 1}`,
          blocks: currentSection,
        });
      }

      // 새 섹션 시작
      currentSectionId = block.id || `section-${sections.length}`;
      currentSectionTitle = block.content;
      currentSection = [block];
    } else {
      currentSection.push(block);
    }
  });

  // 마지막 섹션 저장
  if (currentSection.length > 0) {
    sections.push({
      id: currentSectionId || `section-${sections.length}`,
      title: currentSectionTitle || `섹션 ${sections.length + 1}`,
      blocks: currentSection,
    });
  }

  return sections;
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { id } = await params;
  const guide = await getGuide(id);

  if (!guide) {
    notFound();
  }

  // 섹션별로 블록 분할
  const sections = splitIntoSections(guide.blocks);

  // 디버깅 로그
  console.log('=== DEBUG ===');
  console.log('Guide ID:', id);
  console.log('Sections count:', sections.length);
  if (sections.length > 0) {
    console.log('First section ID:', sections[0].id);
    console.log('First section title:', sections[0].title);
  }
  console.log('Total blocks:', guide.blocks.length);
  console.log('=============');

  // 첫 번째 섹션이 있으면 해당 섹션으로 리다이렉트
  if (sections.length > 0 && sections[0].id) {
    redirect(`/guides/${id}/${encodeURIComponent(sections[0].id)}`);
  }

  // 섹션이 없으면 404
  notFound();
}
