/**
 * 마크다운 렌더링 컴포넌트
 * CLI 환경에서 마크다운 텍스트를 렌더링합니다.
 */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeRaw from 'rehype-raw';
import 'github-markdown-css/github-markdown-light.css';
import '../../styles/cli-markdown.css';

interface MarkdownRendererProps {
  content: string;
}

/**
 * 마크다운 렌더링 컴포넌트
 * CLI 환경에서 마크다운 텍스트를 HTML로 변환하여 표시합니다.
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="cli-markdown-container">
      <div className="markdown-body cli-markdown">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            [rehypeSanitize, {
              ...defaultSchema,
              attributes: {
                ...defaultSchema.attributes,
                img: [
                  ...(defaultSchema.attributes.img || []),
                  ['src', 'width', 'height', 'alt', 'title']
                ]
              }
            }],
            rehypeRaw
          ]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownRenderer; 