/**
 * 튜닝 가이드 타입 정의 (팀장님 규칙 적용)
 * - 필드 최소화
 * - levelId, categoryId만 저장
 * - orderNum 제거 (배열 순서 사용)
 * - type은 최소 정보만
 */

import { Timestamp } from 'firebase/firestore';

// ===== 기본 타입 =====
export type LevelId = 'beginner' | 'intermediate' | 'advanced';
export type CategoryId = 'exterior' | 'interior' | 'performance' | 'audio' | 'lighting';
export type GuideStatus = 'draft' | 'published' | 'archived';

// ===== 클라이언트 매핑용 (Firestore에 저장 X) =====
export const LEVEL_NAMES: Record<LevelId, string> = {
  beginner: '초급자',
  intermediate: '중급자',
  advanced: '고급자',
};

export const CATEGORY_NAMES: Record<CategoryId, string> = {
  exterior: '외관 튜닝',
  interior: '내부 튜닝',
  performance: '성능 튜닝',
  audio: '오디오 튜닝',
  lighting: '조명 튜닝',
};

// ===== 콘텐츠 블록 타입 =====
export type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | ImageBlock
  | QuoteBlock
  | TableBlock
  | VideoBlock
  | DividerBlock
  | AdBlock;

export interface HeadingBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
  id?: string; // TOC 앵커용 (선택)
}

export interface ParagraphBlock {
  type: 'paragraph';
  content: string;
}

export interface ListBlock {
  type: 'list';
  style: 'bullet' | 'ordered';
  items: string[];
}

export interface ImageBlock {
  type: 'image';
  url?: string; // 업로드 후 URL
  alt?: string;
  caption?: string;
}

export interface QuoteBlock {
  type: 'quote';
  content: string;
  style?: 'info' | 'warning' | 'error' | 'success';
}

export interface TableBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface VideoBlock {
  type: 'video';
  url: string;
  provider?: 'youtube' | 'vimeo' | 'direct';
}

export interface DividerBlock {
  type: 'divider';
}

export interface AdBlock {
  type: 'ad';
  position?: 'top' | 'middle' | 'bottom' | 'sidebar';
}

// ===== 메인 문서 타입 =====
export interface TuningGuide {
  // 필수 메타데이터 (팀장님 규칙)
  id: string; // {level}_{category}_{slug}
  levelId: LevelId;
  categoryId: CategoryId;
  title: string;
  slug: string;

  // 콘텐츠 블록 (orderNum 제거, 배열 순서 사용)
  blocks: ContentBlock[];

  // 선택 메타데이터
  summary?: string;
  tags?: string[];
  status: GuideStatus;

  // 타임스탬프
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

// ===== 확장된 뷰 모델 (클라이언트 전용) =====
export interface TuningGuideViewModel extends TuningGuide {
  levelName: string; // LEVEL_NAMES에서 매핑
  categoryName: string; // CATEGORY_NAMES에서 매핑
  toc: TocItem[]; // blocks에서 자동 생성
  estimatedReadTime: number; // blocks에서 계산
}

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

// ===== 헬퍼 함수 =====
export function toViewModel(guide: TuningGuide): TuningGuideViewModel {
  return {
    ...guide,
    levelName: LEVEL_NAMES[guide.levelId],
    categoryName: CATEGORY_NAMES[guide.categoryId],
    toc: generateToc(guide.blocks),
    estimatedReadTime: calculateReadTime(guide.blocks),
  };
}

function generateToc(blocks: ContentBlock[]): TocItem[] {
  return blocks
    .filter((block): block is HeadingBlock => block.type === 'heading' && block.level <= 3)
    .map((block, index) => ({
      id: block.id || `heading-${index}`,
      title: block.content,
      level: block.level,
    }));
}

function calculateReadTime(blocks: ContentBlock[]): number {
  const wordCount = blocks
    .filter((b) => b.type === 'paragraph' || b.type === 'heading')
    .reduce((count, block) => {
      if ('content' in block) {
        return count + block.content.length;
      }
      return count;
    }, 0);

  // 한국어 기준: 분당 500자
  return Math.ceil(wordCount / 500);
}
