import { notFound } from 'next/navigation';
import GuideLayout from '@/components/GuideLayout';
import { toViewModel } from '@/types/tuning-guide.types';
import type { TuningGuide } from '@/types/tuning-guide.types';

// 임시 목 데이터 (실제로는 Firestore에서 가져옴)
const MOCK_GUIDE: TuningGuide = {
  id: 'beginner_exterior_decal-guide',
  levelId: 'beginner',
  categoryId: 'exterior',
  title: '데칼 튜닝 가이드',
  slug: 'decal-guide',
  summary: '차량 외부에 그래픽 디자인을 적용하여 개성을 표현하는 데칼 튜닝 가이드',
  tags: ['데칼', '외관', '초보자', 'DIY'],
  status: 'published',
  blocks: [
    {
      type: 'heading',
      level: 1,
      content: '1) 데칼 튜닝 가이드',
      id: 'intro',
    },
    {
      type: 'paragraph',
      content:
        '데칼 튜닝은 차량 외부에 그래픽 디자인을 적용하여 개성을 표현하는 작업입니다. 데칼은 차량의 스타일을 변화시키고, 브랜드를 홍보하며, 차체를 보호하는 등 여러 목적으로 활용할 수 있는 효과적인 튜닝 방법입니다.',
    },
    {
      type: 'ad',
      position: 'top',
    },
    {
      type: 'heading',
      level: 2,
      content: '1. 개요 및 주요 기능',
      id: 'overview',
    },
    {
      type: 'paragraph',
      content:
        '데칼 튜닝은 차량의 외부에 그래픽 필름을 부착하여 다양한 색상과 무늬, 텍스트를 통해 스타일을 변화시키는 작업입니다. 이 튜닝을 통해 차주의 개성을 표현하고 차량을 독특하게 꾸밀 수 있습니다.',
    },
    {
      type: 'heading',
      level: 2,
      content: '2. 데칼 튜닝의 필요성',
      id: 'necessity',
    },
    {
      type: 'paragraph',
      content: '데칼 튜닝은 다음과 같은 이유로 필요합니다:',
    },
    {
      type: 'list',
      style: 'bullet',
      items: [
        '개성 표현: 데칼을 사용하면 차주가 원하는 스타일로 자동차 외관을 꾸밀 수 있습니다.',
        '브랜드 홍보: 기업 차량의 경우 로고와 메시지를 부착하면 이동하는 동안 자연스럽게 브랜드 홍보 효과를 얻을 수 있습니다.',
        '차체 보호: 자외선, 작은 긁힘, 돌 튀김 등으로부터 차량 페인트를 보호합니다.',
      ],
    },
    {
      type: 'quote',
      content: '💡 팁: 처음 시도하는 경우 작은 데칼부터 시작하는 것을 추천합니다!',
      style: 'info',
    },
    {
      type: 'heading',
      level: 2,
      content: '3. 준비물 및 도구',
      id: 'tools',
    },
    {
      type: 'list',
      style: 'ordered',
      items: [
        '데칼 필름 (원하는 디자인)',
        '스퀴지 (공기 빼기용)',
        '커터칼 또는 가위',
        '세척제 및 마른 천',
      ],
    },
    {
      type: 'image',
      url: '/images/decal-tools.jpg',
      alt: '데칼 시공 도구',
      caption: '데칼 시공에 필요한 기본 도구들',
    },
    {
      type: 'ad',
      position: 'middle',
    },
    {
      type: 'heading',
      level: 2,
      content: '4. 시공 절차',
      id: 'procedure',
    },
    {
      type: 'table',
      headers: ['단계', '작업 내용', '소요 시간'],
      rows: [
        ['1단계', '차량 표면 세척 및 건조', '10-15분'],
        ['2단계', '데칼 위치 확인 및 가배치', '5-10분'],
        ['3단계', '데칼 부착 및 공기 제거', '15-20분'],
        ['4단계', '마무리 및 확인', '5분'],
      ],
    },
    {
      type: 'divider',
    },
    {
      type: 'heading',
      level: 2,
      content: '5. 주의사항',
      id: 'caution',
    },
    {
      type: 'quote',
      content:
        '⚠️ 경고: 데칼 시공 전 반드시 차량 표면을 깨끗이 세척해야 합니다. 먼지나 이물질이 있으면 접착력이 떨어집니다.',
      style: 'warning',
    },
    {
      type: 'paragraph',
      content:
        '데칼 튜닝은 비교적 간단한 작업이지만, 꼼꼼하게 준비하고 시공하면 더욱 완성도 높은 결과를 얻을 수 있습니다.',
    },
  ],
  createdAt: '2025-12-12T01:53:32+09:00',
  updatedAt: '2025-12-12T01:53:32+09:00',
};

export default async function GuidePage({ params }: { params: { id: string } }) {
  // 실제로는 Firestore에서 가져옴:
  // const guide = await fetchGuideById(params.id);
  // if (!guide) return notFound();

  const guide = params.id === MOCK_GUIDE.id ? MOCK_GUIDE : null;
  if (!guide) return notFound();

  const viewModel = toViewModel(guide);

  return <GuideLayout guide={viewModel} />;
}

// SSG용 경로 생성 (선택사항)
export async function generateStaticParams() {
  // 실제로는 Firestore에서 모든 가이드 ID 가져옴
  return [{ id: 'beginner_exterior_decal-guide' }];
}
