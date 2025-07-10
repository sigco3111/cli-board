/**
 * CommandProcessor 테스트
 * 명령어 처리기의 기능을 테스트합니다.
 */
import commandProcessor from '../CommandProcessor';
import commandRegistry from '../CommandRegistry';
import commandHistoryService from '../CommandHistoryService';
import errorService from '../../ErrorService';

// 모킹
jest.mock('../CommandRegistry');
jest.mock('../CommandHistoryService');
jest.mock('../../ErrorService');

describe('CommandProcessor', () => {
  // 테스트에 사용할 변수들
  let mockAddOutputItem: jest.Mock;
  let mockClearOutput: jest.Mock;
  let mockUser: any;
  let mockLogout: jest.Mock;
  
  // 각 테스트 전에 실행
  beforeEach(() => {
    // 모킹 함수 초기화
    mockAddOutputItem = jest.fn();
    mockClearOutput = jest.fn();
    mockUser = { id: 'test-user-id', name: 'Test User' };
    mockLogout = jest.fn();
    
    // 모킹된 모듈 초기화
    (commandRegistry.getCommand as jest.Mock).mockReset();
    (commandHistoryService.addCommand as jest.Mock).mockReset();
    
    // errorService 모킹
    (errorService.commandNotFound as jest.Mock).mockReturnValue({
      message: '명령어를 찾을 수 없습니다.',
      hint: '도움말을 확인하세요.',
      code: 'COMMAND_NOT_FOUND'
    });
    
    (errorService.authenticationRequired as jest.Mock).mockReturnValue({
      message: '인증이 필요합니다.',
      hint: '로그인하세요.',
      code: 'AUTHENTICATION_REQUIRED'
    });
    
    (errorService.unknownError as jest.Mock).mockReturnValue({
      message: '알 수 없는 오류가 발생했습니다.',
      hint: '다시 시도하세요.',
      code: 'UNKNOWN_ERROR'
    });
  });
  
  test('빈 명령어 처리', async () => {
    // 빈 명령어 실행
    await commandProcessor.processCommand('', mockAddOutputItem, mockClearOutput);
    
    // 검증: 아무 작업도 수행하지 않아야 함
    expect(mockAddOutputItem).not.toHaveBeenCalled();
    expect(commandHistoryService.addCommand).not.toHaveBeenCalled();
    expect(commandRegistry.getCommand).not.toHaveBeenCalled();
  });
  
  test('존재하지 않는 명령어 처리', async () => {
    // commandRegistry.getCommand가 null 반환하도록 설정
    (commandRegistry.getCommand as jest.Mock).mockReturnValue(null);
    
    // 존재하지 않는 명령어 실행
    await commandProcessor.processCommand('unknown-command', mockAddOutputItem, mockClearOutput);
    
    // 검증
    expect(commandHistoryService.addCommand).toHaveBeenCalledWith('unknown-command');
    expect(commandRegistry.getCommand).toHaveBeenCalledWith('unknown-command');
    expect(errorService.commandNotFound).toHaveBeenCalledWith('unknown-command');
    expect(mockAddOutputItem).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error'
    }));
  });
  
  test('인증이 필요한 명령어 처리 (로그인하지 않은 경우)', async () => {
    // 인증이 필요한 명령어 모킹
    const mockCommand = {
      name: 'auth-command',
      requiresAuth: true,
      execute: jest.fn()
    };
    
    (commandRegistry.getCommand as jest.Mock).mockReturnValue(mockCommand);
    
    // 로그인하지 않은 상태로 명령어 실행
    await commandProcessor.processCommand('auth-command', mockAddOutputItem, mockClearOutput, null);
    
    // 검증
    expect(commandHistoryService.addCommand).toHaveBeenCalledWith('auth-command');
    expect(commandRegistry.getCommand).toHaveBeenCalledWith('auth-command');
    expect(errorService.authenticationRequired).toHaveBeenCalled();
    expect(mockCommand.execute).not.toHaveBeenCalled();
    expect(mockAddOutputItem).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error'
    }));
  });
  
  test('명령어 정상 실행', async () => {
    // 일반 명령어 모킹
    const mockCommand = {
      name: 'test-command',
      requiresAuth: false,
      execute: jest.fn()
    };
    
    (commandRegistry.getCommand as jest.Mock).mockReturnValue(mockCommand);
    
    // 명령어 실행
    await commandProcessor.processCommand('test-command arg1 arg2', mockAddOutputItem, mockClearOutput);
    
    // 검증
    expect(commandHistoryService.addCommand).toHaveBeenCalledWith('test-command arg1 arg2');
    expect(commandRegistry.getCommand).toHaveBeenCalledWith('test-command');
    expect(mockCommand.execute).toHaveBeenCalledWith(expect.objectContaining({
      args: ['arg1', 'arg2'],
      addOutputItem: mockAddOutputItem,
      clearOutput: mockClearOutput
    }));
  });
  
  test('명령어 실행 중 오류 처리', async () => {
    // 실행 중 오류를 발생시키는 명령어 모킹
    const mockError = new Error('테스트 오류');
    const mockCommand = {
      name: 'error-command',
      requiresAuth: false,
      execute: jest.fn().mockRejectedValue(mockError)
    };
    
    (commandRegistry.getCommand as jest.Mock).mockReturnValue(mockCommand);
    
    // 명령어 실행
    await commandProcessor.processCommand('error-command', mockAddOutputItem, mockClearOutput);
    
    // 검증
    expect(commandHistoryService.addCommand).toHaveBeenCalledWith('error-command');
    expect(commandRegistry.getCommand).toHaveBeenCalledWith('error-command');
    expect(mockCommand.execute).toHaveBeenCalled();
    expect(errorService.unknownError).toHaveBeenCalledWith(mockError);
    expect(mockAddOutputItem).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error'
    }));
  });
  
  test('인용부호로 묶인 인자 파싱', async () => {
    // 일반 명령어 모킹
    const mockCommand = {
      name: 'test-command',
      requiresAuth: false,
      execute: jest.fn()
    };
    
    (commandRegistry.getCommand as jest.Mock).mockReturnValue(mockCommand);
    
    // 인용부호로 묶인 인자가 있는 명령어 실행
    await commandProcessor.processCommand('test-command "인용된 인자" 일반인자', mockAddOutputItem, mockClearOutput);
    
    // 검증
    expect(commandHistoryService.addCommand).toHaveBeenCalledWith('test-command "인용된 인자" 일반인자');
    expect(mockCommand.execute).toHaveBeenCalledWith(expect.objectContaining({
      args: ['인용된 인자', '일반인자']
    }));
  });
}); 