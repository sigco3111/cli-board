/**
 * 화면 지우기 명령어
 * 터미널 화면의 출력을 모두 지우는 명령어입니다.
 */
import { Command, CommandContext } from '../../../types/commands';

/**
 * 화면 지우기 명령어 구현
 */
const ClearCommand: Command = {
  name: 'clear',
  aliases: ['cls', '화면지우기', '지우기'],
  description: '터미널 화면을 지웁니다.',
  usage: 'clear',
  
  /**
   * 화면 지우기 명령어 실행 함수
   */
  execute(context: CommandContext): void {
    const { clearOutput, addOutputItem } = context;
    
    if (clearOutput) {
      // clearOutput 함수가 제공된 경우 호출
      clearOutput();
    } else {
      // clearOutput 함수가 없는 경우 오류 메시지 표시
      addOutputItem({
        type: 'error',
        content: '화면 지우기 기능을 사용할 수 없습니다.'
      });
    }
  }
};

export default ClearCommand; 