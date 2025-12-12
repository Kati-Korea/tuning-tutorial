'use client';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownRendererProps {
    content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <div className="prose prose-lg max-w-none">
            <ReactMarkdown
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                    // 커스텀 컴포넌트
                    h1: ({ node, ...props }) => (
                        <h1 className="text-4xl font-bold mb-4" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                        <h2 className="text-3xl font-bold mb-3 mt-8" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                        <h3 className="text-2xl font-bold mb-2 mt-6" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                        <p className="mb-4 leading-7" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                        <ul className="list-disc list-inside mb-4" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                        <ol className="list-decimal list-inside mb-4" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                        <li className="mb-2" {...props} />
                    ),
                    img: ({ node, ...props }) => (
                        <img className="rounded-lg my-4" {...props} alt={props.alt || ''} />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}