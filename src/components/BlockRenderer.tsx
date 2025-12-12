'use client';

/**
 * 팀장님 스키마의 Block 타입을 렌더링하는 컴포넌트
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

interface BlockRendererProps {
  blocks: Block[];
}

export default function BlockRenderer({ blocks }: BlockRendererProps) {
  return (
    <div className="prose prose-lg max-w-none">
      {blocks.map((block, index) => (
        <BlockComponent key={index} block={block} index={index} />
      ))}
    </div>
  );
}

function BlockComponent({ block, index }: { block: Block; index: number }) {
  switch (block.type) {
    case 'heading':
      return <HeadingComponent block={block} />;
    case 'paragraph':
      return <ParagraphComponent block={block} />;
    case 'list':
      return <ListComponent block={block} />;
    case 'image':
      return <ImageComponent block={block} />;
    case 'quote':
      return <QuoteComponent block={block} />;
    case 'divider':
      return <DividerComponent />;
    case 'ad':
      return <AdComponent block={block} index={index} />;
    default:
      return null;
  }
}

function HeadingComponent({ block }: { block: HeadingBlock }) {
  const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag id={block.id} className="font-bold text-gray-900 mt-8 mb-4">
      {block.content}
    </Tag>
  );
}

function ParagraphComponent({ block }: { block: ParagraphBlock }) {
  return <p className="text-gray-700 mb-4 leading-relaxed">{block.content}</p>;
}

function ListComponent({ block }: { block: ListBlock }) {
  const Tag = block.style === 'ordered' ? 'ol' : 'ul';
  const listClass = block.style === 'ordered'
    ? 'list-decimal list-inside mb-4'
    : 'list-disc list-inside mb-4';

  return (
    <Tag className={listClass}>
      {block.items.map((item, idx) => (
        <li key={idx} className="text-gray-700 mb-2">
          {item}
        </li>
      ))}
    </Tag>
  );
}

function ImageComponent({ block }: { block: ImageBlock }) {
  if (!block.url) return null;

  return (
    <figure className="my-6">
      <img
        src={block.url}
        alt={block.alt || ''}
        className="rounded-lg shadow-md w-full"
      />
      {block.caption && (
        <figcaption className="text-center text-sm text-gray-600 mt-2">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

function QuoteComponent({ block }: { block: QuoteBlock }) {
  const styleColors = {
    info: 'bg-blue-50 border-blue-400 text-blue-900',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-900',
    error: 'bg-red-50 border-red-400 text-red-900',
    success: 'bg-green-50 border-green-400 text-green-900',
  };

  const colorClass = styleColors[block.style || 'info'];

  return (
    <blockquote className={`border-l-4 pl-4 py-3 my-4 ${colorClass}`}>
      {block.content}
    </blockquote>
  );
}

function DividerComponent() {
  return <hr className="my-8 border-gray-300" />;
}

function AdComponent({ block, index }: { block: AdBlock; index: number }) {
  return (
    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 my-6 text-center">
      <p className="text-gray-500">
        광고 위치: {block.position || 'middle'} (블록 #{index + 1})
      </p>
    </div>
  );
}
