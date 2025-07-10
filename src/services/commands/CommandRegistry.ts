/**
 * 명령어 레지스트리
 * 애플리케이션에서 사용 가능한 모든 명령어를 등록하고 관리하는 클래스입니다.
 */
import { Command, CommandCategory } from '../../types/commands';

class CommandRegistry {
  // 모든 명령어를 저장하는 맵
  private commands: Map<string, Command> = new Map();
  
  // 명령어 별칭을 원래 명령어 이름으로 매핑하는 맵
  private aliases: Map<string, string> = new Map();
  
  // 카테고리별 명령어 맵
  private categorizedCommands: Map<CommandCategory, Command[]> = new Map();
  
  /**
   * 명령어를 레지스트리에 등록합니다.
   * @param command 등록할 명령어 객체
   * @param category 명령어가 속한 카테고리 (기본값: 'general')
   */
  registerCommand(command: Command, category: CommandCategory = 'general') {
    // 1. 명령어를 등록
    this.commands.set(command.name, command);
    
    // 2. 별칭이 있으면 별칭도 등록
    if (command.aliases) {
      command.aliases.forEach(alias => {
        this.aliases.set(alias, command.name);
      });
    }
    
    // 3. 카테고리에 명령어 추가
    const categoryCommands = this.categorizedCommands.get(category) || [];
    categoryCommands.push(command);
    this.categorizedCommands.set(category, categoryCommands);
  }
  
  /**
   * 여러 명령어를 한 번에 레지스트리에 등록합니다.
   * @param commands 등록할 명령어 객체 배열
   * @param category 명령어들이 속한 카테고리 (기본값: 'general')
   */
  registerCommands(commands: Command[], category: CommandCategory = 'general') {
    commands.forEach(command => {
      this.registerCommand(command, category);
    });
  }
  
  /**
   * 명령어 이름 또는 별칭으로 명령어를 조회합니다.
   * @param nameOrAlias 명령어 이름 또는 별칭
   * @returns 명령어 객체 또는 undefined
   */
  getCommand(nameOrAlias: string): Command | undefined {
    // 직접 명령어 맵에서 찾기
    const command = this.commands.get(nameOrAlias);
    if (command) return command;
    
    // 별칭에서 원래 명령어 이름을 찾아 명령어 반환
    const originalName = this.aliases.get(nameOrAlias);
    return originalName ? this.commands.get(originalName) : undefined;
  }
  
  /**
   * 특정 카테고리에 속한 모든 명령어를 반환합니다.
   * @param category 명령어 카테고리
   * @returns 해당 카테고리의 명령어 배열
   */
  getCommandsByCategory(category: CommandCategory): Command[] {
    return this.categorizedCommands.get(category) || [];
  }
  
  /**
   * 모든 명령어를 카테고리별로 반환합니다.
   * @returns 카테고리별 명령어 맵
   */
  getAllCommands(): Map<CommandCategory, Command[]> {
    return this.categorizedCommands;
  }
  
  /**
   * 전체 명령어 개수를 반환합니다.
   * @returns 등록된 전체 명령어 수
   */
  getCommandCount(): number {
    return this.commands.size;
  }
}

// 싱글톤으로 사용하기 위한 인스턴스 생성
const commandRegistry = new CommandRegistry();
export default commandRegistry; 