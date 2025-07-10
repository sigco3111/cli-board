/**
 * KeyboardShortcutsService 테스트
 * 키보드 단축키 서비스의 기능을 테스트합니다.
 */
import keyboardShortcutsService, { KeyboardShortcutsService, Shortcut } from '../KeyboardShortcutsService';

describe('KeyboardShortcutsService', () => {
  // 각 테스트 전에 이벤트 리스너 모킹
  beforeEach(() => {
    // window.addEventListener 모킹
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
    
    // 테스트 전에 모든 단축키 제거
    const shortcuts = keyboardShortcutsService.getAllShortcuts();
    shortcuts.forEach(shortcut => {
      keyboardShortcutsService.unregisterShortcut(shortcut.key, shortcut.ctrlKey, shortcut.altKey, shortcut.shiftKey, shortcut.metaKey);
    });
  });

  // 각 테스트 후에 모킹 초기화
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('단축키 등록 및 조회', () => {
    // 테스트용 단축키 객체
    const testShortcut: Shortcut = {
      key: 'F1',
      description: '도움말 표시',
      action: jest.fn()
    };

    // 단축키 등록
    keyboardShortcutsService.registerShortcut(testShortcut);
    
    // 등록된 단축키 조회
    const shortcuts = keyboardShortcutsService.getAllShortcuts();
    
    // 검증
    expect(shortcuts).toHaveLength(1);
    expect(shortcuts[0].key).toBe('F1');
    expect(shortcuts[0].description).toBe('도움말 표시');
    expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  test('동일한 단축키 등록 시 덮어쓰기', () => {
    // 첫 번째 단축키 등록
    const firstShortcut: Shortcut = {
      key: 'F1',
      description: '첫 번째 설명',
      action: jest.fn()
    };
    
    // 두 번째 단축키 등록 (동일한 키)
    const secondShortcut: Shortcut = {
      key: 'F1',
      description: '두 번째 설명',
      action: jest.fn()
    };
    
    // 단축키 등록
    keyboardShortcutsService.registerShortcut(firstShortcut);
    keyboardShortcutsService.registerShortcut(secondShortcut);
    
    // 등록된 단축키 조회
    const shortcuts = keyboardShortcutsService.getAllShortcuts();
    
    // 검증: 단축키는 하나만 있고, 두 번째 설명으로 덮어써졌어야 함
    expect(shortcuts).toHaveLength(1);
    expect(shortcuts[0].description).toBe('두 번째 설명');
  });

  test('단축키 제거', () => {
    // 테스트용 단축키 객체
    const testShortcut: Shortcut = {
      key: 'F1',
      description: '도움말 표시',
      action: jest.fn()
    };
    
    // 단축키 등록 확인
    keyboardShortcutsService.registerShortcut(testShortcut);
    let shortcuts = keyboardShortcutsService.getAllShortcuts();
    expect(shortcuts).toHaveLength(1);
    
    // 단축키 제거
    keyboardShortcutsService.unregisterShortcut('F1');
    
    // 등록된 단축키 조회
    shortcuts = keyboardShortcutsService.getAllShortcuts();
    
    // 검증: 단축키가 제거되었는지 확인
    expect(shortcuts.filter(s => s.key === 'F1')).toHaveLength(0);
  });

  test('단축키 문자열 표현 생성', () => {
    // 다양한 단축키 조합 테스트
    const shortcut1: Shortcut = {
      key: 'F1',
      description: '테스트',
      action: jest.fn()
    };
    
    const shortcut2: Shortcut = {
      key: 'a',
      ctrlKey: true,
      description: '테스트',
      action: jest.fn()
    };
    
    const shortcut3: Shortcut = {
      key: 's',
      ctrlKey: true,
      altKey: true,
      shiftKey: true,
      description: '테스트',
      action: jest.fn()
    };
    
    // 검증
    expect(KeyboardShortcutsService.getShortcutString(shortcut1)).toBe('F1');
    expect(KeyboardShortcutsService.getShortcutString(shortcut2)).toBe('Ctrl+A');
    expect(KeyboardShortcutsService.getShortcutString(shortcut3)).toBe('Ctrl+Alt+Shift+S');
  });
}); 