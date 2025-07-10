/**
 * 키보드 단축키 서비스
 * 애플리케이션 전체에서 사용할 수 있는 키보드 단축키를 관리합니다.
 */

// 단축키 타입 정의
export interface Shortcut {
  key: string;          // 키 이름 (예: 'F1', 'Escape')
  ctrlKey?: boolean;    // Ctrl 키 필요 여부
  altKey?: boolean;     // Alt 키 필요 여부
  shiftKey?: boolean;   // Shift 키 필요 여부
  metaKey?: boolean;    // Meta(Command) 키 필요 여부
  description: string;  // 단축키 설명
  action: () => void;   // 실행할 함수
}

/**
 * 키보드 단축키 서비스 클래스
 * 단축키 등록 및 이벤트 처리를 담당합니다.
 */
export class KeyboardShortcutsService {
  private shortcuts: Shortcut[] = [];
  private isListening: boolean = false;
  
  /**
   * 단축키 등록
   * @param shortcut 등록할 단축키 객체
   */
  registerShortcut(shortcut: Shortcut): void {
    // 이미 등록된 단축키인지 확인
    const existingIndex = this.shortcuts.findIndex(s => 
      s.key === shortcut.key && 
      s.ctrlKey === shortcut.ctrlKey && 
      s.altKey === shortcut.altKey && 
      s.shiftKey === shortcut.shiftKey &&
      s.metaKey === shortcut.metaKey
    );
    
    // 이미 등록된 단축키면 덮어쓰기
    if (existingIndex !== -1) {
      this.shortcuts[existingIndex] = shortcut;
    } else {
      this.shortcuts.push(shortcut);
    }
    
    // 리스너가 아직 등록되지 않았으면 등록
    if (!this.isListening) {
      this.startListening();
    }
  }
  
  /**
   * 단축키 제거
   * @param key 키 이름
   * @param ctrlKey Ctrl 키 필요 여부
   * @param altKey Alt 키 필요 여부
   * @param shiftKey Shift 키 필요 여부
   * @param metaKey Meta 키 필요 여부
   */
  unregisterShortcut(
    key: string, 
    ctrlKey: boolean = false, 
    altKey: boolean = false, 
    shiftKey: boolean = false,
    metaKey: boolean = false
  ): void {
    // 기존 배열을 새로운 배열로 필터링하여 해당 단축키 제거
    this.shortcuts = this.shortcuts.filter(s => 
      !(s.key === key && 
        Boolean(s.ctrlKey) === Boolean(ctrlKey) && 
        Boolean(s.altKey) === Boolean(altKey) && 
        Boolean(s.shiftKey) === Boolean(shiftKey) &&
        Boolean(s.metaKey) === Boolean(metaKey))
    );
    
    // 단축키가 없으면 리스너 제거
    if (this.shortcuts.length === 0) {
      this.stopListening();
    }
  }
  
  /**
   * 모든 단축키 가져오기
   * @returns 등록된 모든 단축키 목록
   */
  getAllShortcuts(): Shortcut[] {
    return [...this.shortcuts];
  }
  
  /**
   * 단축키 리스너 시작
   */
  private startListening(): void {
    if (this.isListening) return;
    
    window.addEventListener('keydown', this.handleKeyDown);
    this.isListening = true;
  }
  
  /**
   * 단축키 리스너 중지
   */
  private stopListening(): void {
    if (!this.isListening) return;
    
    window.removeEventListener('keydown', this.handleKeyDown);
    this.isListening = false;
  }
  
  /**
   * 키 이벤트 처리 함수
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    // 입력 필드에서는 단축키 무시 (입력 방해 방지)
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target as HTMLElement)?.isContentEditable
    ) {
      return;
    }
    
    // 일치하는 단축키 찾기
    const matchingShortcut = this.shortcuts.find(s => 
      s.key === event.key &&
      !!s.ctrlKey === event.ctrlKey &&
      !!s.altKey === event.altKey &&
      !!s.shiftKey === event.shiftKey &&
      !!s.metaKey === event.metaKey
    );
    
    // 단축키가 있으면 실행
    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
    }
  };
  
  /**
   * 단축키 문자열 표현 생성
   * @param shortcut 단축키 객체
   * @returns 단축키 문자열 표현 (예: "Ctrl+Alt+S")
   */
  static getShortcutString(shortcut: Shortcut): string {
    const parts = [];
    
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.altKey) parts.push('Alt');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.metaKey) parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Win');
    
    parts.push(shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key);
    
    return parts.join('+');
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const keyboardShortcutsService = new KeyboardShortcutsService();
export default keyboardShortcutsService; 