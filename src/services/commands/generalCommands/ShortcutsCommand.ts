/**
 * 단축키 목록 조회 명령어
 * 사용 가능한 단축키 목록을 보여줍니다.
 */
import { Command, CommandContext } from '../../../types/commands';
import keyboardShortcutsService, { Shortcut } from '../../KeyboardShortcutsService';

// KeyboardShortcutsService 클래스 타입 가져오기
import { KeyboardShortcutsService } from '../../KeyboardShortcutsService';

const ShortcutsCommand: Command = {
  name: 'shortcuts',
  aliases: ['shortcut', '단축키'],
  description: '사용 가능한 단축키 목록을 보여줍니다.',
  usage: 'shortcuts',
  
  /**
   * 단축키 목록 조회 명령어 실행 함수
   * @param context 명령어 실행 컨텍스트
   */
  async execute(context: CommandContext): Promise<void> {
    const { addOutputItem } = context;
    
    // 등록된 단축키 목록 가져오기
    const shortcuts = keyboardShortcutsService.getAllShortcuts();
    
    // 단축키가 없는 경우
    if (shortcuts.length === 0) {
      addOutputItem({
        type: 'text',
        content: '등록된 단축키가 없습니다.'
      });
      return;
    }
    
    // 단축키 목록 표시
    addOutputItem({
      type: 'text',
      content: '사용 가능한 단축키 목록:'
    });
    
    // 단축키를 테이블 형식으로 출력
    const tableData = {
      headers: ['단축키', '설명'],
      rows: shortcuts.map((shortcut: Shortcut) => [
        KeyboardShortcutsService.getShortcutString(shortcut),
        shortcut.description
      ])
    };
    
    addOutputItem({
      type: 'table',
      content: tableData
    });
  }
};

export default ShortcutsCommand; 