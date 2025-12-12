import { adminDb } from '@/lib/firebase-admin';
import GuideLayout from '@/components/GuideLayout';
import { notFound } from 'next/navigation';
import { toViewModel } from '@/types/tuning-guide.types';
import type { TuningGuide, ContentBlock } from '@/types/tuning-guide.types';

interface SectionPageProps {
  params: Promise<{ id: string; section: string }>;
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

// 섹션별로 블록 분할
function splitIntoSections(blocks: ContentBlock[]) {
  const sections: Array<{
    id: string;
    title: string;
    blocks: ContentBlock[];
  }> = [];

  let currentSection: ContentBlock[] = [];
  let currentSectionId = 'intro'; // 기본값: intro
  let currentSectionTitle = '소개'; // 기본값: 소개

  blocks.forEach((block) => {
    // H1 또는 H2를 섹션의 시작으로 간주
    if (block.type === 'heading' && (block.level === 1 || block.level === 2)) {
      // 이전 섹션 저장
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

export default async function SectionPage({ params }: SectionPageProps) {
  const { id, section } = await params;
  // Normalize section param for reliable matching (Korean, unicode forms)
  const targetSectionId = decodeURIComponent(section).normalize('NFC');
  const guide = await getGuide(id);

  if (!guide) {
    notFound();
  }

  // 섹션별로 블록 분할
  const sections = splitIntoSections(guide.blocks);

  // 디버깅 로그
  console.log('=== SECTION DEBUG ===');
  console.log('Requested section (raw):', section);
  console.log('Requested section (decoded NFC):', targetSectionId);
  console.log('Requested section (encoded):', encodeURIComponent(targetSectionId));
  console.log('Requested section length:', targetSectionId.length);
  console.log('\nAvailable sections:');
  sections.forEach((s, i) => {
    console.log(`  [${i}] id: "${s.id}" (len: ${s.id.length})`);
    console.log(`      title: "${s.title}"`);
    console.log(`      match: ${s.id.normalize('NFC') === targetSectionId}`);
  });
  console.log('====================');

  // 현재 섹션 찾기
  const currentSectionIndex = sections.findIndex(
    (s) => s.id.normalize('NFC') === targetSectionId
  );

  if (currentSectionIndex === -1) {
    notFound();
  }

  const currentSection = sections[currentSectionIndex];

  // 현재 섹션의 블록만 포함하는 가이드 생성
  const sectionGuide: TuningGuide = {
    ...guide,
    blocks: currentSection.blocks,
  };

  const guideViewModel = toViewModel(sectionGuide);

  // 이전/다음 섹션 계산
  const prevSection = currentSectionIndex > 0 ? sections[currentSectionIndex - 1] : null;
  const nextSection = currentSectionIndex < sections.length - 1 ? sections[currentSectionIndex + 1] : null;

  const prevGuide = prevSection ? { id: `${id}/${prevSection.id}`, title: prevSection.title } : null;
  const nextGuide = nextSection ? { id: `${id}/${nextSection.id}`, title: nextSection.title } : null;

  return (
    <GuideLayout
      guide={guideViewModel}
      prevGuide={prevGuide}
      nextGuide={nextGuide}
      allSections={sections}
      currentSectionId={section}
      guideId={id}
    />
  );
}
