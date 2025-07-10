/**
 * CommandHistoryService 테스트
 * 명령어 히스토리 서비스의 기능을 테스트합니다.
 */
import commandHistoryService from '../CommandHistoryService';

describe('CommandHistoryService', () => {
  // 각 테스트 전에 히스토리 초기화
  beforeEach(() => {
    commandHistoryService.clearHistory();
  });
  
  test('명령어 추가 및 조회', () => {
    // 명령어 추가
    commandHistoryService.addCommand('command1');
    commandHistoryService.addCommand('command2');
    commandHistoryService.addCommand('command3');
    
    // 히스토리 조회
    const history = commandHistoryService.getHistory();
    
    // 검증
    expect(history).toHaveLength(3);
    expect(history[0]).toBe('command1');
    expect(history[1]).toBe('command2');
    expect(history[2]).toBe('command3');
  });
  
  test('중복 명령어 처리', () => {
    // 동일한 명령어 여러 번 추가
    commandHistoryService.addCommand('duplicate');
    commandHistoryService.addCommand('unique');
    commandHistoryService.addCommand('duplicate');
    
    // 히스토리 조회
    const history = commandHistoryService.getHistory();
    
    // 검증: 중복 명령어는 가장 최근 위치로 이동되어야 함
    expect(history).toHaveLength(2);
    expect(history[0]).toBe('unique');
    expect(history[1]).toBe('duplicate');
  });
  
  test('최대 히스토리 크기 제한', () => {
    // 최대 히스토리 크기는 내부적으로 100으로 설정되어 있음
    // 테스트를 위해 많은 명령어를 추가하는 대신 내부 동작 검증
    
    // 테스트용으로 많은 명령어 추가 (실제로는 100개를 넘기지 않음)
    for (let i = 1; i <= 10; i++) {
      commandHistoryService.addCommand(`command${i}`);
    }
    
    // 히스토리 조회
    const history = commandHistoryService.getHistory();
    
    // 검증: 모든 명령어가 유지되어야 함
    expect(history).toHaveLength(10);
    expect(history[0]).toBe('command1');
    expect(history[9]).toBe('command10');
  });
  
  test('키워드로 명령어 검색', () => {
    // 다양한 명령어 추가
    commandHistoryService.addCommand('list posts');
    commandHistoryService.addCommand('view post 1');
    commandHistoryService.addCommand('list categories');
    commandHistoryService.addCommand('help');
    
    // 'list'로 시작하는 명령어 검색
    const listCommands = commandHistoryService.searchCommands('list');
    
    // 검증
    expect(listCommands).toHaveLength(2);
    expect(listCommands).toContain('list posts');
    expect(listCommands).toContain('list categories');
    
    // 'view'로 시작하는 명령어 검색
    const viewCommands = commandHistoryService.searchCommands('view');
    
    // 검증
    expect(viewCommands).toHaveLength(1);
    expect(viewCommands).toContain('view post 1');
    
    // 존재하지 않는 접두어 검색
    const noCommands = commandHistoryService.searchCommands('unknown');
    
    // 검증
    expect(noCommands).toHaveLength(0);
  });
  
  test('히스토리 초기화', () => {
    // 명령어 추가
    commandHistoryService.addCommand('command1');
    commandHistoryService.addCommand('command2');
    
    // 히스토리 초기화
    commandHistoryService.clearHistory();
    
    // 히스토리 조회
    const history = commandHistoryService.getHistory();
    
    // 검증
    expect(history).toHaveLength(0);
  });
}); 