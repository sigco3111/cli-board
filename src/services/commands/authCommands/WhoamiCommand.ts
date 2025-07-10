/**
 * 사용자 정보 확인 명령어
 * 현재 로그인된 사용자의 정보를 표시하는 명령어입니다.
 */
import { Command, CommandContext } from '../../../types/commands';

/**
 * 사용자 정보 확인 명령어 구현
 */
const WhoamiCommand: Command = {
  name: 'whoami',
  aliases: ['me', '내정보', '사용자정보'],
  description: '현재 로그인된 사용자 정보를 표시합니다.',
  usage: 'whoami',
  
  /**
   * 사용자 정보 확인 명령어 실행 함수
   */
  execute(context: CommandContext): void {
    const { addOutputItem, user } = context;
    
    // 로그인되지 않은 상태인 경우
    if (!user) {
      addOutputItem({
        type: 'error',
        content: '로그인되어 있지 않습니다. 로그인하려면 "login" 명령어를 사용하세요.'
      });
      return;
    }
    
    // 사용자 정보 표시
    const userInfo = [
      `사용자 이름: ${user.displayName || '이름 없음'}`,
      user.email ? `이메일: ${user.email}` : '',
      `계정 유형: ${user.isAnonymous ? '게스트 (익명)' : '일반 사용자'}`,
      `사용자 ID: ${user.uid}`,
      user.photoURL ? `프로필 이미지: ${user.photoURL}` : ''
    ].filter(Boolean).join('\n');
    
    addOutputItem({
      type: 'text',
      content: userInfo
    });
  }
};

export default WhoamiCommand; 