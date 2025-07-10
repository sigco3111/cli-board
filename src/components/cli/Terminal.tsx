/**
 * CLI 스타일 터미널 컴포넌트
 * 전체 터미널 UI를 감싸는 컨테이너 컴포넌트로, 명령어 입력과 결과 출력 영역을 포함합니다.
 */
import React, { useState, useRef, useEffect } from 'react';
import { pcColors } from '../../styles/colors';
import CommandInput from './CommandInput';
import OutputDisplay, { OutputItem } from './OutputDisplay';
import commandProcessor from '../../services/commands/CommandProcessor';
import { initializeCommands } from '../../services/commands/initCommands';
import keyboardShortcutsService from '../../services/KeyboardShortcutsService';

interface TerminalProps {
  className?: string;
  welcomeMessage?: string;
  user?: any;
  onLogout?: () => Promise<void>;
  onToggleUIMode?: () => void; // UI 모드 전환 함수 추가
}

/**
 * 터미널 컴포넌트
 * CLI 스타일의 인터페이스를 제공하는 최상위 컴포넌트입니다.
 */
const Terminal: React.FC<TerminalProps> = ({
  className = '',
  welcomeMessage = '환영합니다! CLI 스타일 게시판에 접속하셨습니다.\n도움말을 보시려면 "help" 또는 "도움말"을 입력하세요.',
  user,
  onLogout,
  onToggleUIMode,
}) => {
  // 명령어 실행 결과 목록
  const [outputItems, setOutputItems] = useState<OutputItem[]>([
    { id: 'welcome', type: 'text', content: welcomeMessage }
  ]);
  
  // 터미널 컨테이너에 대한 참조
  const terminalRef = useRef<HTMLDivElement>(null);
  
  /**
   * 명령어 시스템 초기화
   */
  useEffect(() => {
    initializeCommands();
    
    // 종료 이벤트 리스너 등록
    const handleExit = () => {
      if (onToggleUIMode) {
        if (window.confirm('PC 모드로 전환하시겠습니까?')) {
          // UI 모드 전환 함수 호출
          onToggleUIMode();
        }
      } else {
        if (window.confirm('CLI 모드를 종료하시겠습니까?')) {
          // 종료 처리 로직 (현재는 콘솔 로그만 출력)
          console.log('CLI 모드를 종료합니다.');
        }
      }
    };
    
    window.addEventListener('cli-exit', handleExit);
    
    // 단축키 등록
    registerShortcuts();
    
    return () => {
      window.removeEventListener('cli-exit', handleExit);
      // 단축키 정리는 필요 없음 (싱글톤이므로 앱 종료 시까지 유지)
    };
  }, [onToggleUIMode]);
  
  /**
   * 기본 단축키 등록
   */
  const registerShortcuts = () => {
    // F1: 도움말
    keyboardShortcutsService.registerShortcut({
      key: 'F1',
      description: '도움말 표시',
      action: () => handleCommand('help')
    });
    
    // Escape: 화면 지우기
    keyboardShortcutsService.registerShortcut({
      key: 'Escape',
      description: '화면 지우기',
      action: () => handleCommand('clear')
    });
    
    // Ctrl+H: 명령어 히스토리 표시
    keyboardShortcutsService.registerShortcut({
      key: 'h',
      ctrlKey: true,
      description: '명령어 히스토리 표시',
      action: () => handleCommand('history')
    });
    
    // Ctrl+L: 화면 지우기 (Unix 터미널 스타일)
    keyboardShortcutsService.registerShortcut({
      key: 'l',
      ctrlKey: true,
      description: '화면 지우기',
      action: () => handleCommand('clear')
    });
    
    // F2: 단축키 목록 표시
    keyboardShortcutsService.registerShortcut({
      key: 'F2',
      description: '단축키 목록 표시',
      action: () => handleCommand('shortcuts')
    });
    
    // Ctrl+Q: 종료
    keyboardShortcutsService.registerShortcut({
      key: 'q',
      ctrlKey: true,
      description: '종료',
      action: () => {
        const event = new Event('cli-exit');
        window.dispatchEvent(event);
      }
    });
  };
  
  /**
   * 명령어 실행 결과를 출력 목록에 추가하는 함수
   */
  const addOutputItem = (newItem: OutputItem) => {
    setOutputItems(prev => [...prev, { ...newItem, id: Date.now().toString() }]);
  };

  /**
   * 출력 내용을 모두 지우는 함수
   */
  const clearOutput = () => {
    setOutputItems([]);
  };

  /**
   * 명령어 실행 처리 함수
   * 입력된 명령어를 처리하고 결과를 출력합니다.
   */
  const handleCommand = async (command: string) => {
    // 명령어 입력 항목 추가
    addOutputItem({
      type: 'command',
      content: command
    });
    
    // 명령어 처리
    await commandProcessor.processCommand(
      command, 
      addOutputItem, 
      clearOutput, 
      user,
      onLogout
    );
  };

  /**
   * 출력 결과가 업데이트될 때마다 스크롤을 최하단으로 이동
   */
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [outputItems]);

  return (
    <div 
      ref={terminalRef}
      className={`bg-black text-pc-text-white font-pc flex flex-col h-full overflow-y-auto p-4 ${className}`}
      style={{
        backgroundColor: pcColors.background.primary,
        color: pcColors.text.primary,
        fontFamily: "'Courier New', monospace",
      }}
    >
      <OutputDisplay items={outputItems} />
      <CommandInput onSubmit={handleCommand} />
    </div>
  );
};

export default Terminal; 