'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { TuningGuideViewModel, TocItem } from '@/types/tuning-guide.types';
import GuideRenderer from './GuideRenderer';

interface Section {
  id: string;
  title: string;
  blocks: any[];
}

interface GuideLayoutProps {
  guide: TuningGuideViewModel;
  prevGuide?: { id: string; title: string } | null;
  nextGuide?: { id: string; title: string } | null;
  allSections?: Section[];
  currentSectionId?: string;
  guideId?: string;
}

export default function GuideLayout({
  guide,
  prevGuide,
  nextGuide,
  allSections,
  currentSectionId,
  guideId
}: GuideLayoutProps) {
  const [isTocOpen, setIsTocOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {guide.levelName}
                </span>
                <span>›</span>
                <span>{guide.categoryName}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{guide.title}</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>📖 {guide.estimatedReadTime}분 소요</span>
              <button
                onClick={() => setIsTocOpen(!isTocOpen)}
                className="lg:hidden px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                {isTocOpen ? '목차 닫기' : '목차 열기'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* 목차 (TOC) - 위키독스 스타일 */}
          <aside
            className={`${
              isTocOpen ? 'block' : 'hidden'
            } lg:block w-64 flex-shrink-0`}
          >
            <div className="sticky top-24">
              <nav className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">
                  목차
                </h2>
                {allSections && guideId ? (
                  <SectionTableOfContents
                    sections={allSections}
                    currentSectionId={currentSectionId}
                    guideId={guideId}
                  />
                ) : (
                  <TableOfContents toc={guide.toc} />
                )}
              </nav>
            </div>
          </aside>

          {/* 메인 콘텐츠 */}
          <main className="flex-1 bg-white rounded-lg shadow-sm p-8">
            <GuideRenderer blocks={guide.blocks} />

            {/* 이전/다음 네비게이션 */}
            {(prevGuide || nextGuide) && (
              <nav className="mt-12 pt-8 border-t">
                <div className="flex items-center justify-between gap-4">
                  {prevGuide ? (
                    <Link
                      href={`/guides/${prevGuide.id}`}
                      className="flex items-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                    >
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      <div className="text-left">
                        <div className="text-xs text-gray-600">이전 튜닝</div>
                        <div className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                          {prevGuide.title}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div></div>
                  )}

                  {nextGuide ? (
                    <Link
                      href={`/guides/${nextGuide.id}`}
                      className="flex items-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                    >
                      <div className="text-right">
                        <div className="text-xs text-gray-600">다음 튜닝</div>
                        <div className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                          {nextGuide.title}
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  ) : (
                    <div></div>
                  )}
                </div>
              </nav>
            )}

            {/* 푸터 메타 정보 */}
            <footer className="mt-8 pt-8 border-t">
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {guide.tags && guide.tags.length > 0 && (
                  <div>
                    <span className="font-semibold">태그:</span>{' '}
                    {guide.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block ml-2 px-2 py-1 bg-gray-100 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="ml-auto text-xs text-gray-500">
                  마지막 수정:{' '}
                  {new Date(guide.updatedAt.toString()).toLocaleDateString('ko-KR')}
                </div>
              </div>
            </footer>
          </main>

          {/* 우측 사이드바 (광고 영역 예비) */}
          <aside className="hidden xl:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h3 className="text-sm font-semibold mb-2 text-gray-700">
                  관련 가이드
                </h3>
                <p className="text-xs text-gray-500">
                  추천 가이드 목록 (추후 구현)
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                <p className="text-xs text-gray-600 mb-2">광고 영역</p>
                <div className="h-64 bg-white rounded flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Google AdSense</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ===== 목차 컴포넌트 =====
function TableOfContents({ toc }: { toc: TocItem[] }) {
  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <ul className="space-y-2">
      {toc.map((item) => (
        <li key={item.id} style={{ paddingLeft: `${(item.level - 1) * 12}px` }}>
          <button
            onClick={() => handleClick(item.id)}
            className={`text-left w-full hover:text-blue-600 transition-colors ${
              item.level === 1
                ? 'font-semibold text-gray-900'
                : item.level === 2
                ? 'font-medium text-gray-700'
                : 'text-gray-600 text-sm'
            }`}
          >
            {item.title}
          </button>
        </li>
      ))}
    </ul>
  );
}

// ===== 섹션 기반 목차 컴포넌트 =====
function SectionTableOfContents({
  sections,
  currentSectionId,
  guideId,
}: {
  sections: Section[];
  currentSectionId?: string;
  guideId: string;
}) {
  const normalizedCurrent = currentSectionId
    ? decodeURIComponent(currentSectionId).normalize('NFC')
    : undefined;
  return (
    <ul className="space-y-2">
      {sections.map((section, index) => {
        const isActive =
          normalizedCurrent && section.id.normalize('NFC') === normalizedCurrent;
        return (
          <li key={section.id}>
            <Link
              href={`/guides/${guideId}/${encodeURIComponent(section.id)}`}
              className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'hover:bg-gray-100 text-gray-700 font-medium'
              }`}
            >
              {index + 1}. {section.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
