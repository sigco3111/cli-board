/**
 * 명령어 히스토리 관리 서비스
 * 사용자가 입력한 명령어 기록을 저장하고 관리합니다.
 */

// 로컬 스토리지 키 상수
const COMMAND_HISTORY_KEY = 'cli_command_history';
const MAX_HISTORY_SIZE = 100; // 최대 저장 명령어 수

/**
 * 명령어 히스토리 관리 클래스
 * 로컬 스토리지를 활용하여 명령어 히스토리를 영구 저장합니다.
 */
class CommandHistoryService {
  private history: string[] = [];
  
  constructor() {
    this.loadHistory();
  }
  
  /**
   * 로컬 스토리지에서 명령어 히스토리 로드
   */
  private loadHistory(): void {
    try {
      const savedHistory = localStorage.getItem(COMMAND_HISTORY_KEY);
      if (savedHistory) {
        this.history = JSON.parse(savedHistory);
      }
    } catch (error) {
      console.error('명령어 히스토리 로드 오류:', error);
      this.history = [];
    }
  }
  
  /**
   * 로컬 스토리지에 명령어 히스토리 저장
   */
  private saveHistory(): void {
    try {
      localStorage.setItem(COMMAND_HISTORY_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.error('명령어 히스토리 저장 오류:', error);
    }
  }
  
  /**
   * 명령어를 히스토리에 추가
   * @param command 추가할 명령어
   */
  addCommand(command: string): void {
    // 빈 명령어는 추가하지 않음
    if (!command.trim()) return;
    
    // 중복 명령어 제거 (이미 있는 경우 제거 후 새로 추가)
    this.history = this.history.filter(cmd => cmd !== command);
    
    // 명령어 추가
    this.history.push(command);
    
    // 최대 크기 제한
    if (this.history.length > MAX_HISTORY_SIZE) {
      this.history = this.history.slice(this.history.length - MAX_HISTORY_SIZE);
    }
    
    // 저장
    this.saveHistory();
  }
  
  /**
   * 전체 명령어 히스토리 반환
   * @returns 명령어 히스토리 배열
   */
  getHistory(): string[] {
    return [...this.history];
  }
  
  /**
   * 특정 키워드로 시작하는 명령어 검색
   * @param prefix 검색할 접두어
   * @returns 검색된 명령어 배열
   */
  searchCommands(prefix: string): string[] {
    if (!prefix) return [];
    return this.history.filter(cmd => cmd.startsWith(prefix));
  }
  
  /**
   * 명령어 히스토리 초기화
   */
  clearHistory(): void {
    this.history = [];
    this.saveHistory();
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const commandHistoryService = new CommandHistoryService();
export default commandHistoryService; 