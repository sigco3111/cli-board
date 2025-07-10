/**
 * 도움말 명령어
 * 사용 가능한 명령어 목록과 사용법을 보여주는 명령어입니다.
 */
import { Command, CommandContext, CommandCategory } from '../../../types/commands';
import commandRegistry from '../CommandRegistry';

/**
 * 특정 명령어에 대한 상세 도움말 표시
 */
const showCommandHelp = (command: Command, addOutputItem: CommandContext['addOutputItem']): void => {
  const aliases = command.aliases?.length 
    ? `(별칭: ${command.aliases.join(', ')})` 
    : '';
  
  const helpText = [
    `명령어: ${command.name} ${aliases}`,
    `설명: ${command.description}`,
    `사용법: ${command.usage}`,
    command.requiresAuth ? '* 이 명령어는 로그인이 필요합니다.' : ''
  ].filter(Boolean).join('\n');
  
  addOutputItem({
    type: 'text',
    content: helpText
  });
};

/**
 * 전체 명령어 목록 표시
 */
const showAllCommands = (addOutputItem: CommandContext['addOutputItem']): void => {
  const allCommands = commandRegistry.getAllCommands();
  
  // 카테고리 이름을 한국어로 매핑
  const categoryNames: Record<CommandCategory, string> = {
    general: '기본 명령어',
    post: '게시물 관련 명령어',
    comment: '댓글 관련 명령어',
    auth: '인증 관련 명령어',
    bookmark: '북마크 관련 명령어',
    search: '검색 관련 명령어'
  };
  
  // 헤더 메시지
  addOutputItem({
    type: 'text',
    content: '사용 가능한 명령어 목록:'
  });
  
  // 카테고리별 명령어 목록 표시
  allCommands.forEach((commands, category) => {
    if (commands.length === 0) return;
    
    addOutputItem({
      type: 'text',
      content: `\n[ ${categoryNames[category]} ]`
    });
    
    // 테이블 형식으로 명령어 목록 출력
    const tableData = {
      headers: ['명령어', '설명'],
      rows: commands.map(cmd => [
        cmd.name + (cmd.aliases?.length ? ` (${cmd.aliases.join(', ')})` : ''),
        cmd.description
      ])
    };
    
    addOutputItem({
      type: 'table',
      content: tableData
    });
  });
  
  // 사용법 안내
  addOutputItem({
    type: 'text',
    content: '\n자세한 사용법은 "help [명령어]" 형식으로 확인할 수 있습니다.'
  });
};

/**
 * 도움말 명령어 구현
 */
const HelpCommand: Command = {
  name: 'help',
  aliases: ['도움말', '도움', '?'],
  description: '사용 가능한 명령어 목록을 표시합니다.',
  usage: 'help [명령어]',
  
  /**
   * 도움말 명령어 실행 함수
   */
  execute(context: CommandContext): void {
    const { args, addOutputItem } = context;
    
    // 특정 명령어에 대한 도움말 요청인 경우
    if (args.length > 0) {
      const commandName = args[0].toLowerCase();
      const command = commandRegistry.getCommand(commandName);
      
      if (command) {
        // 명령어가 존재하면 상세 도움말 표시
        showCommandHelp(command, addOutputItem);
      } else {
        // 명령어가 없으면 오류 메시지 표시
        addOutputItem({
          type: 'error',
          content: `'${commandName}' 명령어를 찾을 수 없습니다.`
        });
      }
      
      return;
    }
    
    // 명령어 카테고리별 도움말 표시
    showAllCommands(addOutputItem);
  }
};

export default HelpCommand; 