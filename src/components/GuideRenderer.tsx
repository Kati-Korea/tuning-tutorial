'use client';

import React from 'react';
import type {
  ContentBlock,
  HeadingBlock,
  ParagraphBlock,
  ListBlock,
  ImageBlock,
  QuoteBlock,
  TableBlock,
  VideoBlock,
  AdBlock,
} from '@/types/tuning-guide.types';

interface GuideRendererProps {
  blocks: ContentBlock[];
}

export default function GuideRenderer({ blocks }: GuideRendererProps) {
  return (
    <div className="prose prose-lg max-w-none">
      {blocks.map((block, index) => (
        <BlockRenderer key={index} block={block} index={index} />
      ))}
    </div>
  );
}

function BlockRenderer({ block, index }: { block: ContentBlock; index: number }) {
  switch (block.type) {
    case 'heading':
      return <HeadingRenderer block={block} />;
    case 'paragraph':
      return <ParagraphRenderer block={block} />;
    case 'list':
      return <ListRenderer block={block} />;
    case 'image':
      return <ImageRenderer block={block} />;
    case 'quote':
      return <QuoteRenderer block={block} />;
    case 'table':
      return <TableRenderer block={block} />;
    case 'video':
      return <VideoRenderer block={block} />;
    case 'divider':
      return <DividerRenderer />;
    case 'ad':
      return <AdRenderer block={block} index={index} />;
    default:
      return null;
  }
}

// ===== 개별 블록 렌더러 =====

function HeadingRenderer({ block }: { block: HeadingBlock }) {
  const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
  const className = {
    1: 'text-4xl font-bold mt-8 mb-4',
    2: 'text-3xl font-bold mt-6 mb-3',
    3: 'text-2xl font-semibold mt-5 mb-2',
    4: 'text-xl font-semibold mt-4 mb-2',
    5: 'text-lg font-semibold mt-3 mb-2',
    6: 'text-base font-semibold mt-2 mb-1',
  }[block.level];

  return (
    <Tag id={block.id} className={className}>
      {block.content}
    </Tag>
  );
}

function ParagraphRenderer({ block }: { block: ParagraphBlock }) {
  return <p className="my-4 leading-relaxed text-gray-700">{block.content}</p>;
}

function ListRenderer({ block }: { block: ListBlock }) {
  const ListTag = block.style === 'ordered' ? 'ol' : 'ul';
  const listClassName = block.style === 'ordered'
    ? 'list-decimal list-inside my-4 space-y-2'
    : 'list-disc list-inside my-4 space-y-2';

  return (
    <ListTag className={listClassName}>
      {block.items.map((item, i) => (
        <li key={i} className="text-gray-700">
          {item}
        </li>
      ))}
    </ListTag>
  );
}

function ImageRenderer({ block }: { block: ImageBlock }) {
  if (!block.url) {
    return (
      <div className="my-6 p-8 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-center">
        <p className="text-gray-500">이미지 업로드 대기 중...</p>
      </div>
    );
  }

  return (
    <figure className="my-6">
      <img
        src={block.url}
        alt={block.alt || ''}
        className="w-full rounded-lg shadow-md"
      />
      {block.caption && (
        <figcaption className="text-sm text-gray-600 text-center mt-2">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

function QuoteRenderer({ block }: { block: QuoteBlock }) {
  const styleClasses = {
    info: 'bg-blue-50 border-blue-400 text-blue-900',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-900',
    error: 'bg-red-50 border-red-400 text-red-900',
    success: 'bg-green-50 border-green-400 text-green-900',
  }[block.style || 'info'];

  return (
    <blockquote
      className={`my-6 p-4 border-l-4 rounded-r-lg ${styleClasses}`}
    >
      {block.content}
    </blockquote>
  );
}

function TableRenderer({ block }: { block: TableBlock }) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {block.headers.map((header, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-900"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {block.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-sm text-gray-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VideoRenderer({ block }: { block: VideoBlock }) {
  // YouTube URL 파싱
  const getYouTubeEmbedUrl = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const embedUrl = block.provider === 'youtube'
    ? getYouTubeEmbedUrl(block.url)
    : block.url;

  if (!embedUrl) {
    return (
      <div className="my-6 p-8 bg-gray-100 rounded-lg text-center">
        <p className="text-gray-500">비디오를 로드할 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="my-6 aspect-video">
      <iframe
        src={embedUrl}
        className="w-full h-full rounded-lg shadow-md"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function DividerRenderer() {
  return <hr className="my-8 border-t-2 border-gray-200" />;
}

function AdRenderer({ block, index }: { block: AdBlock; index: number }) {
  // 실제 광고 컴포넌트로 교체 예정
  return (
    <div className="my-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg text-center">
      <p className="text-sm text-gray-500 mb-2">광고 영역 ({block.position || 'auto'})</p>
      <div className="h-24 bg-white rounded flex items-center justify-center">
        <span className="text-gray-400">Google AdSense 또는 자체 광고</span>
      </div>
    </div>
  );
}
