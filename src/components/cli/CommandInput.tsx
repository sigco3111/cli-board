/**
 * 명령어 입력 컴포넌트
 * 사용자로부터 명령어 입력을 받아 처리하는 컴포넌트입니다.
 */
import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { pcColors } from '../../styles/colors';
import commandHistoryService from '../../services/commands/CommandHistoryService';
import commandAutoCompleteService from '../../services/commands/CommandAutoCompleteService';

interface CommandInputProps {
  onSubmit: (command: string) => void;
  prompt?: string;
  disabled?: boolean;
}

/**
 * 명령어 입력 컴포넌트
 * CLI 스타일의 명령어 입력을 처리합니다.
 */
const CommandInput: React.FC<CommandInputProps> = ({
  onSubmit,
  prompt = '>',
  disabled = false,
}) => {
  // 입력 텍스트 상태
  const [inputValue, setInputValue] = useState<string>('');
  // 명령어 히스토리와 히스토리 탐색 위치
  const [historyIndex, setHistoryIndex] = useState(-1);
  // 자동 완성 제안 상태
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // 입력 요소에 대한 참조
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * 명령어 제출 처리 함수
   */
  const handleSubmit = () => {
    if (!inputValue.trim() || disabled) return;
    
    // 명령어 제출
    onSubmit(inputValue);
    
    // 명령어 히스토리에 추가
    commandHistoryService.addCommand(inputValue);
    
    // 입력 필드 초기화 및 히스토리 인덱스 리셋
    setInputValue('');
    setHistoryIndex(-1);
    setShowSuggestions(false);
  };

  /**
   * 키보드 이벤트 처리 함수
   * - Enter: 명령어 제출
   * - 위/아래 화살표: 명령어 히스토리 탐색
   * - Tab: 자동 완성
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        handleSubmit();
        break;
      case 'ArrowUp':
        e.preventDefault();
        navigateHistory('up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        navigateHistory('down');
        break;
      case 'Tab':
        e.preventDefault();
        handleAutoComplete();
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  /**
   * 명령어 히스토리 탐색 함수
   */
  const navigateHistory = (direction: 'up' | 'down') => {
    const history = commandHistoryService.getHistory();
    if (history.length === 0) return;

    let newIndex;
    if (direction === 'up') {
      // 위 화살표: 이전 명령어로 이동
      newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
    } else {
      // 아래 화살표: 다음 명령어로 이동
      newIndex = historyIndex > 0 ? historyIndex - 1 : -1;
    }

    setHistoryIndex(newIndex);
    setInputValue(newIndex >= 0 ? history[history.length - 1 - newIndex] : '');
    setShowSuggestions(false);
  };
  
  /**
   * 자동 완성 처리 함수
   */
  const handleAutoComplete = () => {
    if (!inputValue.trim()) return;
    
    // 자동 완성 제안 가져오기
    const newSuggestions = commandAutoCompleteService.getSuggestions(inputValue);
    
    if (newSuggestions.length === 0) {
      // 제안 없음
      setShowSuggestions(false);
    } else if (newSuggestions.length === 1) {
      // 단일 제안: 바로 적용
      setInputValue(newSuggestions[0]);
      setShowSuggestions(false);
    } else {
      // 여러 제안: 목록 표시
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
      
      // 공통 접두어 적용
      const completed = commandAutoCompleteService.completeCommand(inputValue);
      if (completed) {
        setInputValue(completed);
      }
    }
  };
  
  /**
   * 제안 항목 선택 처리 함수
   */
  const selectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  /**
   * 입력 변경 시 자동 완성 제안 업데이트
   */
  useEffect(() => {
    if (inputValue.trim()) {
      const newSuggestions = commandAutoCompleteService.getSuggestions(inputValue);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue]);

  /**
   * 입력 필드에 자동 포커스
   */
  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  return (
    <div className="relative">
      <div className="flex flex-row items-center mt-2">
        <span 
          className="text-pc-text-yellow mr-2"
          style={{ color: pcColors.text.accent }}
        >
          {prompt}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="flex-grow bg-transparent outline-none border-none text-pc-text-white"
          style={{ 
            color: pcColors.text.primary,
            caretColor: pcColors.text.accent,
          }}
          autoFocus
        />
      </div>
      
      {/* 자동 완성 제안 목록 */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          className="absolute left-0 mt-1 w-full max-h-40 overflow-y-auto z-10 rounded"
          style={{ 
            backgroundColor: pcColors.background.secondary,
            border: `1px solid ${pcColors.border.primary}`
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-2 py-1 cursor-pointer hover:bg-gray-700"
              onClick={() => selectSuggestion(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommandInput; 