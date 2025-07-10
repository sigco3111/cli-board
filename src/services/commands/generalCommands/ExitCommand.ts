/**
 * 종료 명령어
 * CLI 모드를 종료하고 기본 모드로 전환하는 명령어입니다.
 */
import { Command, CommandContext } from '../../../types/commands';

/**
 * 종료 명령어 구현
 */
const ExitCommand: Command = {
  name: 'exit',
  aliases: ['quit', '종료', '나가기'],
  description: 'CLI 모드를 종료합니다.',
  usage: 'exit',
  
  /**
   * 종료 명령어 실행 함수
   */
  execute(context: CommandContext): void {
    const { addOutputItem } = context;
    
    // 종료 메시지 출력
    addOutputItem({
      type: 'text',
      content: '시스템을 종료합니다. 감사합니다!'
    });
    
    // 실제 종료 처리는 애플리케이션 상태에서 처리해야 하므로
    // 여기서는 이벤트를 발생시키거나 콜백을 호출하는 방식으로 구현해야 함
    // 현재는 메시지만 출력
    
    // 이벤트를 발생시켜 부모 컴포넌트에서 처리하도록 함
    const exitEvent = new CustomEvent('cli-exit');
    window.dispatchEvent(exitEvent);
  }
};

export default ExitCommand; 