/**
 * 출력 디스플레이 컴포넌트
 * 명령어 실행 결과를 다양한 형식으로 표시하는 컴포넌트입니다.
 */
import React from 'react';
import { pcColors } from '../../styles/colors';
import MarkdownRenderer from './MarkdownRenderer';

// 출력 항목의 기본 타입
export interface OutputItem {
  id?: string;
  type: 'text' | 'command' | 'error' | 'table' | 'markdown' | 'react';
  content: any;
  hint?: string; // 힌트 메시지 (선택 사항)
}

// 테이블 형식의 출력을 위한 타입
export interface TableOutput {
  headers: string[];
  rows: any[][];
}

interface OutputDisplayProps {
  items: OutputItem[];
}

/**
 * 출력 디스플레이 컴포넌트
 * 다양한 유형의 명령어 실행 결과를 표시합니다.
 */
const OutputDisplay: React.FC<OutputDisplayProps> = ({ items }) => {
  /**
   * 명령어 출력 항목 렌더링 함수
   */
  const renderOutputItem = (item: OutputItem) => {
    const { type, content, hint } = item;

    switch (type) {
      case 'command':
        // 사용자가 입력한 명령어 표시
        return (
          <div className="text-green-500 font-bold">$ {content}</div>
        );
      case 'error':
        // 오류 메시지 표시 (힌트 포함)
        return (
          <div>
            <div className="text-red-500">{content}</div>
            {hint && (
              <div className="text-yellow-500 text-sm mt-1 ml-2">
                💡 {hint}
              </div>
            )}
          </div>
        );
      case 'table':
        // 테이블 형식 데이터 표시
        const tableData = content as TableOutput;
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  {tableData.headers.map((header, index) => (
                    <th key={index} className="py-2 px-4 text-left text-gray-300">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-800">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="py-2 px-4">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {hint && (
              <div className="text-yellow-500 text-sm mt-1">
                💡 {hint}
              </div>
            )}
          </div>
        );
      case 'markdown':
        // 마크다운 렌더링
        return (
          <div>
            <MarkdownRenderer content={content} />
            {hint && (
              <div className="text-yellow-500 text-sm mt-1">
                💡 {hint}
              </div>
            )}
          </div>
        );
      case 'react':
        // React 컴포넌트 직접 렌더링
        return (
          <div>
            {content}
            {hint && (
              <div className="text-yellow-500 text-sm mt-1">
                💡 {hint}
              </div>
            )}
          </div>
        );
      case 'text':
      default:
        // 일반 텍스트 표시 (줄바꿈 지원)
        return (
          <div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
            {hint && (
              <div className="text-yellow-500 text-sm mt-1">
                💡 {hint}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-1">
      {items.map((item, index) => (
        <div key={item.id || index} className="py-1">
          {renderOutputItem(item)}
        </div>
      ))}
    </div>
  );
};

export default OutputDisplay; 