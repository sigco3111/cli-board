/**
 * CLI 환경에서 사용할 텍스트 에디터 컴포넌트
 * 게시물 작성 및 수정에 사용됩니다.
 */
import React, { useState, useEffect, useRef } from 'react';
import { pcColors } from '../../styles/colors';

interface TextEditorProps {
  initialValue?: string;
  onSubmit: (text: string) => void;
  onCancel: () => void;
  placeholder?: string;
  height?: string;
  isMarkdown?: boolean;
}

/**
 * CLI 환경에서 사용할 텍스트 에디터 컴포넌트
 */
const TextEditor: React.FC<TextEditorProps> = ({
  initialValue = '',
  onSubmit,
  onCancel,
  placeholder = '내용을 입력하세요...',
  height = '300px',
  isMarkdown = false
}) => {
  // 에디터 상태
  const [text, setText] = useState(initialValue);
  // 에디터 참조
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 컴포넌트 마운트 시 에디터에 포커스
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter 또는 Cmd+Enter: 제출
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit(text);
    }
    
    // Esc: 취소
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
    
    // Tab: 들여쓰기
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      
      // 탭 문자 삽입
      const newText = text.substring(0, start) + '  ' + text.substring(end);
      setText(newText);
      
      // 커서 위치 조정
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // 마크다운 도움말
  const markdownHelp = isMarkdown ? (
    <div className="text-xs mt-2 text-gray-400">
      <p>마크다운 문법을 지원합니다:</p>
      <p># 제목, ## 부제목, **굵게**, *기울임*, `코드`, [링크](URL), ![이미지](URL)</p>
      <p>- 목록, 1. 번호 목록, &gt; 인용, ```코드 블록```</p>
    </div>
  ) : null;

  return (
    <div className="w-full">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full p-2 bg-transparent border border-gray-700 rounded focus:outline-none focus:border-gray-500"
        style={{ 
          height, 
          color: pcColors.text.primary,
          fontFamily: 'monospace',
          resize: 'vertical'
        }}
      />
      
      {markdownHelp}
      
      <div className="flex justify-between mt-2 text-sm">
        <div>
          <span className="text-gray-400">
            {text.length} 글자
          </span>
        </div>
        <div>
          <button
            onClick={() => onCancel()}
            className="px-3 py-1 mr-2 bg-gray-800 hover:bg-gray-700 rounded"
          >
            취소 (ESC)
          </button>
          <button
            onClick={() => onSubmit(text)}
            className="px-3 py-1 bg-blue-700 hover:bg-blue-600 rounded"
            disabled={!text.trim()}
          >
            저장 (Ctrl+Enter)
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextEditor; 