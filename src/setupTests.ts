/**
 * 테스트 설정 파일
 * Jest 테스트 실행 전에 설정되는 환경 구성입니다.
 */
import '@testing-library/jest-dom';

// 전역 모킹 설정
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  };
};

// 콘솔 경고 무시 설정 (필요한 경우 주석 해제)
// const originalConsoleError = console.error;
// console.error = (...args) => {
//   if (/Warning.*not wrapped in act/.test(args[0])) {
//     return;
//   }
//   originalConsoleError(...args);
// };

// localStorage 모킹
class LocalStorageMock {
  store: Record<string, string>;
  
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

Object.defineProperty(window, 'localStorage', {
  value: new LocalStorageMock(),
});

// 필요한 경우 추가 전역 모킹 설정 