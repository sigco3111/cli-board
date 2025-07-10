/**
 * CLI 모드 메인 애플리케이션 컴포넌트
 * CLI 스타일 게시판을 위한 최상위 컴포넌트로, Terminal 컴포넌트를 감싸고 인증 상태를 관리합니다.
 */
import React from 'react';
import { pcColors } from '../../styles/colors';
import Terminal from './Terminal';

interface CLIAppProps {
  user?: any;
  onLogout?: () => Promise<void>;
  onToggleUIMode?: () => void; // UI 모드 전환 함수 추가
}

/**
 * CLI 모드 애플리케이션 컴포넌트
 */
const CLIApp: React.FC<CLIAppProps> = ({
  user,
  onLogout,
  onToggleUIMode,
}) => {
  // 사용자 이름 추출
  const username = user?.displayName || user?.email?.split('@')[0] || '방문자';

  // 로그인된 사용자에 따른 환영 메시지 생성
  const welcomeMessage = `
CLI 스타일 게시판에 오신 것을 환영합니다, ${username}님!
지금은 ${new Date().toLocaleString('ko-KR')}입니다.

사용 가능한 명령어를 보시려면 "help" 또는 "도움말"을 입력하세요.
`;

  return (
    <div
      className="flex flex-col h-screen w-full"
      style={{
        backgroundColor: pcColors.background.primary,
        color: pcColors.text.primary,
      }}
    >
      {/* 터미널 헤더 */}
      <div 
        className="bg-pc-bg-blue py-2 px-4 flex justify-between items-center"
        style={{ backgroundColor: pcColors.background.secondary }}
      >
        <div className="text-pc-text-white font-bold">
          CLI 게시판 v1.0.0
        </div>
        <div className="text-pc-text-cyan">
          {username} - {new Date().toLocaleDateString('ko-KR')}
        </div>
      </div>
      
      {/* 터미널 컨테이너 */}
      <div className="flex-grow overflow-hidden">
        <Terminal 
          welcomeMessage={welcomeMessage} 
          user={user}
          onLogout={onLogout}
          onToggleUIMode={onToggleUIMode}
        />
      </div>
      
      {/* 터미널 푸터 */}
      <div 
        className="bg-pc-bg-blue py-1 px-4 text-center text-pc-text-white text-sm"
        style={{ backgroundColor: pcColors.background.secondary }}
      >
        도움말: help | 종료: exit | 화면 지우기: clear
      </div>
    </div>
  );
};

export default CLIApp; 