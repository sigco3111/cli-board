/**
 * 로그아웃 명령어
 * 현재 로그인된 사용자를 로그아웃하는 명령어입니다.
 */
import { Command, CommandContext } from '../../../types/commands';

/**
 * 로그아웃 명령어 구현
 */
const LogoutCommand: Command = {
  name: 'logout',
  aliases: ['로그아웃', 'signout'],
  description: '현재 로그인된 계정에서 로그아웃합니다.',
  usage: 'logout',
  
  /**
   * 로그아웃 명령어 실행 함수
   */
  async execute(context: CommandContext): Promise<void> {
    const { addOutputItem, user, logout } = context;
    
    // 로그인되지 않은 상태인 경우
    if (!user) {
      addOutputItem({
        type: 'error',
        content: '로그인되어 있지 않습니다.'
      });
      return;
    }
    
    // 로그아웃 함수가 제공되지 않은 경우
    if (!logout) {
      addOutputItem({
        type: 'error',
        content: '로그아웃 기능을 사용할 수 없습니다.'
      });
      return;
    }
    
    try {
      addOutputItem({
        type: 'text',
        content: '로그아웃 중입니다. 잠시만 기다려주세요...'
      });
      
      // 로그아웃 실행
      await logout();
      
      addOutputItem({
        type: 'text',
        content: '성공적으로 로그아웃되었습니다.'
      });
      
    } catch (error) {
      // 로그아웃 중 오류 발생
      addOutputItem({
        type: 'error',
        content: `로그아웃 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      });
    }
  }
};

export default LogoutCommand; 