/**
 * 명령어 처리기
 * 사용자 입력 명령어를 파싱하고 실행하는 모듈입니다.
 */
import { CommandContext } from '../../types/commands';
import commandRegistry from './CommandRegistry';
import commandHistoryService from './CommandHistoryService';
import errorService from '../ErrorService';

/**
 * 명령어 처리 클래스
 * 명령어 문자열을 파싱하고 해당 명령어를 실행합니다.
 */
class CommandProcessor {
  /**
   * 명령어 문자열을 처리하는 메인 함수
   * @param commandStr 처리할 명령어 문자열
   * @param addOutputItem 출력 항목 추가 함수
   * @param clearOutput 출력 초기화 함수
   * @param user 현재 사용자 정보
   * @param onLogout 로그아웃 처리 함수
   */
  async processCommand(
    commandStr: string, 
    addOutputItem: (item: any) => void, 
    clearOutput: () => void,
    user: any = null,
    logout?: () => Promise<void>
  ): Promise<void> {
    try {
      // 명령어 문자열이 비어있으면 무시
      if (!commandStr.trim()) {
        return;
      }
      
      // 명령어 히스토리에 추가
      commandHistoryService.addCommand(commandStr);
      
      // 명령어와 인자 파싱
      const { commandName, args } = this.parseCommand(commandStr);
      
      // 명령어 객체 찾기
      const command = commandRegistry.getCommand(commandName);
      
      // 명령어가 존재하지 않는 경우
      if (!command) {
        const errorMsg = errorService.commandNotFound(commandName);
        addOutputItem({
          type: 'error',
          content: errorMsg.message,
          hint: errorMsg.hint
        });
        return;
      }
      
      // 인증이 필요한 명령어인 경우 로그인 상태 확인
      if (command.requiresAuth && !user) {
        const errorMsg = errorService.authenticationRequired();
        addOutputItem({
          type: 'error',
          content: errorMsg.message,
          hint: errorMsg.hint
        });
        return;
      }
      
      // 명령어 실행 컨텍스트 생성
      const context: CommandContext = {
        args,
        addOutputItem,
        clearOutput,
        user,
        logout
      };
      
      // 명령어 실행
      await command.execute(context);
      
    } catch (error) {
      // 오류 처리
      console.error('명령어 처리 중 오류 발생:', error);
      
      const errorMsg = errorService.unknownError(error);
      addOutputItem({
        type: 'error',
        content: errorMsg.message,
        hint: errorMsg.hint
      });
    }
  }
  
  /**
   * 명령어 문자열을 파싱하여 명령어 이름과 인자 배열로 분리
   * @param commandStr 파싱할 명령어 문자열
   * @returns 명령어 이름과 인자 배열
   */
  private parseCommand(commandStr: string): { commandName: string; args: string[] } {
    // 명령어 문자열 분할 (큰따옴표로 묶인 인자 처리)
    const parts: string[] = [];
    let currentPart = '';
    let inQuotes = false;
    
    for (let i = 0; i < commandStr.length; i++) {
      const char = commandStr[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ' ' && !inQuotes) {
        if (currentPart) {
          parts.push(currentPart);
          currentPart = '';
        }
      } else {
        currentPart += char;
      }
    }
    
    if (currentPart) {
      parts.push(currentPart);
    }
    
    // 명령어 이름과 인자 분리
    const commandName = parts[0]?.toLowerCase() || '';
    const args = parts.slice(1);
    
    return { commandName, args };
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const commandProcessor = new CommandProcessor();
export default commandProcessor; 