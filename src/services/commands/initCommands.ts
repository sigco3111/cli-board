/**
 * 명령어 시스템 초기화
 * 애플리케이션의 모든 명령어를 등록하고 초기화하는 모듈입니다.
 */
import commandRegistry from './CommandRegistry';
import generalCommands from './generalCommands';
import authCommands from './authCommands';
import postCommands from './postCommands';
import commentCommands from './commentCommands';
import searchCommands from './searchCommands';
import bookmarkCommands from './bookmarkCommands';

/**
 * 모든 명령어를 초기화하고 레지스트리에 등록하는 함수
 */
export function initializeCommands(): void {
  console.log('명령어 시스템을 초기화합니다...');
  
  // 기본 명령어 등록
  commandRegistry.registerCommands(generalCommands, 'general');
  
  // 인증 관련 명령어 등록
  commandRegistry.registerCommands(authCommands, 'auth');
  
  // 게시물 관련 명령어 등록
  commandRegistry.registerCommands(postCommands, 'post');
  
  // 댓글 관련 명령어 등록
  commandRegistry.registerCommands(commentCommands, 'comment');
  
  // 검색 관련 명령어 등록
  commandRegistry.registerCommands(searchCommands, 'search');
  
  // 북마크 관련 명령어 등록
  commandRegistry.registerCommands(bookmarkCommands, 'bookmark');
  
  // TODO: 추후 다른 카테고리의 명령어들도 등록
  
  console.log('명령어 시스템 초기화 완료');
}

// 기본 내보내기
export default initializeCommands; 