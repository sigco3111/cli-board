/**
 * 로그인 명령어
 * 사용자 인증을 처리하는 명령어입니다.
 */
import { Command, CommandContext } from '../../../types/commands';
import { signInWithGoogle, signInAnonymously } from '../../firebase/auth';

/**
 * 로그인 명령어 구현
 */
const LoginCommand: Command = {
  name: 'login',
  aliases: ['로그인', 'signin'],
  description: '사용자 계정으로 로그인합니다.',
  usage: 'login [google|guest]',
  
  /**
   * 로그인 명령어 실행 함수
   */
  async execute(context: CommandContext): Promise<void> {
    const { args, addOutputItem, user } = context;
    
    // 이미 로그인된 상태인 경우
    if (user) {
      addOutputItem({
        type: 'text',
        content: `이미 ${user.displayName}님으로 로그인되어 있습니다. 다른 계정으로 로그인하려면 먼저 'logout' 명령어로 로그아웃하세요.`
      });
      return;
    }
    
    // 로그인 방식 확인
    const loginMethod = args[0]?.toLowerCase() || 'google';
    
    try {
      addOutputItem({
        type: 'text',
        content: '로그인 중입니다. 잠시만 기다려주세요...'
      });
      
      let loggedInUser;
      
      // 로그인 방식에 따라 처리
      if (loginMethod === 'guest' || loginMethod === '게스트') {
        loggedInUser = await signInAnonymously();
        
        if (loggedInUser) {
          addOutputItem({
            type: 'text',
            content: `게스트로 로그인되었습니다. 게스트는 제한된 기능만 사용할 수 있습니다.`
          });
        }
      } else {
        // 기본값은 구글 로그인
        loggedInUser = await signInWithGoogle();
        
        if (loggedInUser) {
          addOutputItem({
            type: 'text',
            content: `${loggedInUser.displayName}님으로 로그인되었습니다.`
          });
        }
      }
      
      // 로그인 실패 시
      if (!loggedInUser) {
        addOutputItem({
          type: 'error',
          content: '로그인에 실패했습니다. 다시 시도해주세요.'
        });
      }
      
    } catch (error) {
      // 로그인 중 오류 발생
      addOutputItem({
        type: 'error',
        content: `로그인 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      });
    }
  }
};

export default LoginCommand; 