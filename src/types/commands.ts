/**
 * 명령어 처리 시스템 타입 정의
 * 명령어 처리와 관련된 인터페이스와 타입을 정의합니다.
 */

import { OutputItem } from '../components/cli/OutputDisplay';

/**
 * 입력 핸들러 타입
 * 사용자 입력을 처리하는 함수 타입입니다.
 * 다음 입력을 처리할 핸들러를 반환하거나, 입력 처리를 종료합니다.
 */
export type InputHandler = (input: string) => Promise<InputHandler | void> | InputHandler | void;

/**
 * 명령어 실행 컨텍스트
 * 명령어가 실행될 때 필요한 상태와 함수들을 포함합니다.
 */
export interface CommandContext {
  // 명령어 매개변수
  args: string[];
  // 로그인된 사용자 정보
  user?: any;
  // 출력 아이템 추가 함수
  addOutputItem: (item: OutputItem) => void;
  // 터미널 히스토리 클리어 함수 
  clearOutput?: () => void;
  // 로그아웃 함수
  logout?: () => Promise<void>;
}

/**
 * 명령어 인터페이스
 * 모든 명령어 구현체가 따라야 하는 인터페이스입니다.
 */
export interface Command {
  // 명령어 이름 (실행할 때 입력하는 명령어)
  name: string;
  // 명령어 별칭 (동일한 기능을 실행하는 다른 이름)
  aliases?: string[];
  // 명령어 설명
  description: string;
  // 명령어 사용법
  usage: string;
  // 명령어 실행 함수
  execute: (context: CommandContext) => Promise<InputHandler | void> | InputHandler | void;
  // 관리자 권한 필요 여부
  requiresAuth?: boolean;
}

/**
 * 명령어 카테고리 타입
 * 명령어 그룹을 구분하기 위한 카테고리입니다.
 */
export type CommandCategory = 
  | 'general'    // 일반 명령어
  | 'post'       // 게시물 관련 명령어
  | 'comment'    // 댓글 관련 명령어
  | 'auth'       // 인증 관련 명령어
  | 'bookmark'   // 북마크 관련 명령어
  | 'search';    // 검색 관련 명령어 