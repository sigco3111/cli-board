/**
 * 명령어 히스토리 조회 명령어
 * 이전에 입력한 명령어 목록을 보여줍니다.
 */
import { Command, CommandContext } from '../../../types/commands';
import commandHistoryService from '../../commands/CommandHistoryService';

const HistoryCommand: Command = {
  name: 'history',
  aliases: ['hist', '기록'],
  description: '이전에 입력한 명령어 목록을 보여줍니다.',
  usage: 'history [clear]',
  
  /**
   * 명령어 히스토리 조회 명령어 실행 함수
   * @param context 명령어 실행 컨텍스트
   */
  async execute(context: CommandContext): Promise<void> {
    const { args, addOutputItem } = context;
    
    // history clear 명령어 처리
    if (args[0] === 'clear') {
      commandHistoryService.clearHistory();
      addOutputItem({
        type: 'text',
        content: '명령어 히스토리가 초기화되었습니다.'
      });
      return;
    }
    
    // 명령어 히스토리 가져오기
    const history = commandHistoryService.getHistory();
    
    // 히스토리가 없는 경우
    if (history.length === 0) {
      addOutputItem({
        type: 'text',
        content: '명령어 히스토리가 없습니다.'
      });
      return;
    }
    
    // 히스토리 목록 표시
    addOutputItem({
      type: 'text',
      content: '명령어 히스토리:'
    });
    
    // 최근 명령어부터 표시 (최대 30개)
    const maxDisplay = Math.min(history.length, 30);
    const recentHistory = history.slice(-maxDisplay);
    
    addOutputItem({
      type: 'table',
      content: {
        headers: ['번호', '명령어'],
        rows: recentHistory.map((cmd, index) => [
          (history.length - maxDisplay + index + 1).toString(),
          cmd
        ])
      }
    });
    
    // 사용법 안내
    addOutputItem({
      type: 'text',
      content: '\n히스토리를 초기화하려면 "history clear" 명령어를 사용하세요.\n화살표 위/아래 키로 이전 명령어를 탐색할 수 있습니다.'
    });
  }
};

export default HistoryCommand; 