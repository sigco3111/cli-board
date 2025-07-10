/**
 * 명령어 자동 완성 서비스
 * 명령어 입력 시 자동 완성 기능을 제공합니다.
 */
import { Command, CommandCategory } from '../../types/commands';
import commandRegistry from './CommandRegistry';
import commandHistoryService from './CommandHistoryService';

/**
 * 명령어 자동 완성 클래스
 * 명령어 레지스트리와 히스토리를 활용하여 자동 완성 후보를 제공합니다.
 */
class CommandAutoCompleteService {
  /**
   * 명령어 자동 완성 후보 검색
   * @param input 현재 입력 텍스트
   * @returns 자동 완성 후보 배열
   */
  getSuggestions(input: string): string[] {
    if (!input.trim()) return [];
    
    // 입력 텍스트 분석
    const parts = input.trim().split(' ');
    const firstWord = parts[0];
    
    // 명령어 이름 자동 완성 (첫 단어인 경우)
    if (parts.length === 1) {
      return this.getCommandNameSuggestions(firstWord);
    }
    
    // 명령어 인자 자동 완성 (두 번째 단어 이상인 경우)
    return this.getArgumentSuggestions(firstWord, input);
  }
  
  /**
   * 명령어 이름 자동 완성 후보 검색
   * @param prefix 명령어 접두어
   * @returns 자동 완성 후보 배열
   */
  private getCommandNameSuggestions(prefix: string): string[] {
    if (!prefix) return [];
    
    // 1. 등록된 명령어에서 검색
    const categorizedCommands = commandRegistry.getAllCommands();
    const registeredCommands: string[] = [];
    
    // 모든 카테고리의 명령어를 검색
    categorizedCommands.forEach((commands: Command[]) => {
      commands.forEach((cmd: Command) => {
        // 명령어 이름이 접두어로 시작하는 경우 추가
        if (cmd.name.startsWith(prefix)) {
          registeredCommands.push(cmd.name);
        }
        
        // 별칭이 접두어로 시작하는 경우 명령어 이름 추가
        if (cmd.aliases) {
          cmd.aliases.forEach((alias: string) => {
            if (alias.startsWith(prefix)) {
              registeredCommands.push(cmd.name);
            }
          });
        }
      });
    });
    
    // 2. 명령어 히스토리에서 검색
    const historyCommands = commandHistoryService.searchCommands(prefix);
    
    // 중복 제거 및 결합
    const allSuggestions = [...new Set([...registeredCommands, ...historyCommands])];
    
    return allSuggestions;
  }
  
  /**
   * 명령어 인자 자동 완성 후보 검색
   * @param commandName 명령어 이름
   * @param fullInput 전체 입력 텍스트
   * @returns 자동 완성 후보 배열
   */
  private getArgumentSuggestions(commandName: string, fullInput: string): string[] {
    // 현재는 히스토리에서만 검색
    // 향후 명령어별 특화된 자동 완성 로직 추가 가능
    return commandHistoryService.searchCommands(fullInput);
  }
  
  /**
   * 자동 완성 적용
   * @param input 현재 입력 텍스트
   * @returns 자동 완성된 텍스트 또는 null (자동 완성 불가능한 경우)
   */
  completeCommand(input: string): string | null {
    const suggestions = this.getSuggestions(input);
    
    if (suggestions.length === 0) {
      return null;
    }
    
    // 단일 후보가 있는 경우 바로 적용
    if (suggestions.length === 1) {
      return suggestions[0];
    }
    
    // 여러 후보가 있는 경우 공통 접두어 찾기
    const commonPrefix = this.findCommonPrefix(suggestions);
    
    // 공통 접두어가 현재 입력보다 길면 자동 완성
    if (commonPrefix.length > input.length) {
      return commonPrefix;
    }
    
    return null;
  }
  
  /**
   * 여러 문자열의 공통 접두어 찾기
   * @param strings 문자열 배열
   * @returns 공통 접두어
   */
  private findCommonPrefix(strings: string[]): string {
    if (strings.length === 0) return '';
    if (strings.length === 1) return strings[0];
    
    let prefix = strings[0];
    
    for (let i = 1; i < strings.length; i++) {
      let j = 0;
      while (j < prefix.length && j < strings[i].length && prefix[j] === strings[i][j]) {
        j++;
      }
      prefix = prefix.substring(0, j);
      if (prefix === '') break;
    }
    
    return prefix;
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const commandAutoCompleteService = new CommandAutoCompleteService();
export default commandAutoCompleteService; 