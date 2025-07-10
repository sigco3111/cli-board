/**
 * CommandAutoCompleteService 테스트
 * 명령어 자동 완성 서비스의 기능을 테스트합니다.
 */
import commandAutoCompleteService from '../CommandAutoCompleteService';
import commandRegistry from '../CommandRegistry';
import commandHistoryService from '../CommandHistoryService';
import { Command } from '../../../types/commands';

// 모킹
jest.mock('../CommandRegistry');
jest.mock('../CommandHistoryService');

describe('CommandAutoCompleteService', () => {
  // 테스트 전에 모킹 설정
  beforeEach(() => {
    // commandRegistry.getAllCommands 모킹
    const mockCommands: Command[][] = [
      [
        {
          name: 'help',
          description: '도움말 표시',
          usage: 'help [command]',
          aliases: ['h', '도움말'],
          execute: jest.fn()
        },
        {
          name: 'history',
          description: '명령어 히스토리 표시',
          usage: 'history',
          aliases: ['hist', '기록'],
          execute: jest.fn()
        }
      ],
      [
        {
          name: 'list',
          description: '게시물 목록 표시',
          usage: 'list',
          aliases: ['ls', '목록'],
          execute: jest.fn()
        }
      ]
    ];
    
    (commandRegistry.getAllCommands as jest.Mock).mockReturnValue(mockCommands);
    
    // commandHistoryService.searchCommands 모킹
    (commandHistoryService.searchCommands as jest.Mock).mockImplementation((prefix) => {
      const historyItems = [
        'help',
        'history',
        'list posts',
        'list categories',
        'view post 1'
      ];
      
      return historyItems.filter(item => item.startsWith(prefix));
    });
  });
  
  // 테스트 후에 모킹 초기화
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('빈 입력에 대한 자동 완성 후보 없음', () => {
    const suggestions = commandAutoCompleteService.getSuggestions('');
    expect(suggestions).toHaveLength(0);
  });
  
  test('명령어 이름 자동 완성 후보 검색', () => {
    // 'h'로 시작하는 명령어 검색
    const hSuggestions = commandAutoCompleteService.getSuggestions('h');
    
    // 검증: help와 history가 포함되어야 함
    expect(hSuggestions).toContain('help');
    expect(hSuggestions).toContain('history');
    expect(hSuggestions).toHaveLength(2);
    
    // 'he'로 시작하는 명령어 검색
    const heSuggestions = commandAutoCompleteService.getSuggestions('he');
    
    // 검증: help만 포함되어야 함
    expect(heSuggestions).toContain('help');
    expect(heSuggestions).toHaveLength(1);
    
    // 'l'로 시작하는 명령어 검색 (list 명령어와 히스토리의 list posts, list categories)
    const lSuggestions = commandAutoCompleteService.getSuggestions('l');
    
    // 검증: list 명령어가 포함되어야 함
    expect(lSuggestions).toContain('list');
    // 참고: 실제 구현에서는 히스토리의 'list posts', 'list categories'도 포함될 수 있음
  });
  
  test('명령어 인자 자동 완성 후보 검색', () => {
    // 'list '로 시작하는 명령어 검색
    const listSuggestions = commandAutoCompleteService.getSuggestions('list ');
    
    // 검증: list로 시작하는 히스토리 명령어가 포함되어야 함
    expect(listSuggestions).toContain('list posts');
    expect(listSuggestions).toContain('list categories');
    // 참고: 실제 구현에서는 'list' 명령어도 포함될 수 있음
    
    // 'list p'로 시작하는 명령어 검색
    const listPSuggestions = commandAutoCompleteService.getSuggestions('list p');
    
    // 검증: 'list posts'만 포함되어야 함
    expect(listPSuggestions).toContain('list posts');
    expect(listPSuggestions).toHaveLength(1);
  });
  
  test('자동 완성 적용 - 단일 후보', () => {
    // 'he'에 대한 자동 완성 (단일 후보: 'help')
    const completed = commandAutoCompleteService.completeCommand('he');
    
    // 검증: 'help'로 완성되어야 함
    expect(completed).toBe('help');
  });
  
  test('자동 완성 적용 - 여러 후보', () => {
    // 'h'에 대한 자동 완성 (여러 후보: 'help', 'history')
    const completed = commandAutoCompleteService.completeCommand('h');
    
    // 검증: 공통 접두어 'h'만 있으므로 null 반환
    expect(completed).toBeNull();
  });
  
  test('자동 완성 적용 - 공통 접두어 있는 경우', () => {
    // commandHistoryService.searchCommands 재정의
    (commandHistoryService.searchCommands as jest.Mock).mockImplementation((prefix) => {
      if (prefix === 'his') {
        return ['history', 'histogram'];
      }
      return [];
    });
    
    // 'his'에 대한 자동 완성 (여러 후보지만 공통 접두어 'histo' 있음)
    const completed = commandAutoCompleteService.completeCommand('his');
    
    // 검증: 공통 접두어 'histo'까지 완성되어야 함
    expect(completed).toBe('histo');
  });
  
  test('자동 완성 적용 - 후보 없음', () => {
    // 'xyz'에 대한 자동 완성 (후보 없음)
    const completed = commandAutoCompleteService.completeCommand('xyz');
    
    // 검증: null 반환
    expect(completed).toBeNull();
  });
}); 