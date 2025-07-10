/**
 * ErrorService 테스트
 * 오류 메시지 서비스의 기능을 테스트합니다.
 */
import errorService, { ErrorType } from '../ErrorService';

describe('ErrorService', () => {
  test('기본 오류 메시지 생성', () => {
    // 기본 오류 메시지 생성
    const error = errorService.createError(ErrorType.COMMAND_NOT_FOUND);
    
    // 검증
    expect(error).toHaveProperty('message');
    expect(error).toHaveProperty('code', ErrorType.COMMAND_NOT_FOUND);
    expect(error.message).toBe('명령어를 찾을 수 없습니다.');
    expect(error.hint).toBeDefined();
  });
  
  test('사용자 정의 오류 메시지 생성', () => {
    // 사용자 정의 메시지와 힌트로 오류 생성
    const customMessage = '테스트 오류 메시지';
    const customHint = '테스트 힌트';
    const error = errorService.createError(
      ErrorType.NETWORK_ERROR,
      customMessage,
      customHint
    );
    
    // 검증
    expect(error.message).toBe(customMessage);
    expect(error.hint).toBe(customHint);
    expect(error.code).toBe(ErrorType.NETWORK_ERROR);
  });
  
  test('commandNotFound 함수', () => {
    // 명령어를 찾을 수 없는 오류 생성
    const error = errorService.commandNotFound('test-command');
    
    // 검증
    expect(error.message).toContain('test-command');
    expect(error.code).toBe(ErrorType.COMMAND_NOT_FOUND);
    expect(error.hint).toBeDefined();
    expect(error.hint).toContain('help');
  });
  
  test('invalidArgument 함수', () => {
    // 잘못된 인자 오류 생성
    const error = errorService.invalidArgument('test-command');
    
    // 검증
    expect(error.message).toContain('test-command');
    expect(error.code).toBe(ErrorType.INVALID_ARGUMENT);
    expect(error.hint).toContain('help test-command');
  });
  
  test('missingArgument 함수', () => {
    // 인자 이름 없이 누락된 인자 오류 생성
    const error1 = errorService.missingArgument('test-command');
    
    // 인자 이름과 함께 누락된 인자 오류 생성
    const error2 = errorService.missingArgument('test-command', 'arg-name');
    
    // 검증
    expect(error1.message).toContain('test-command');
    expect(error1.code).toBe(ErrorType.MISSING_ARGUMENT);
    expect(error1.hint).toContain('help test-command');
    
    expect(error2.message).toContain('arg-name');
    expect(error2.code).toBe(ErrorType.MISSING_ARGUMENT);
  });
  
  test('authenticationRequired 함수', () => {
    // 인증 필요 오류 생성
    const error = errorService.authenticationRequired();
    
    // 검증
    expect(error.code).toBe(ErrorType.AUTHENTICATION_REQUIRED);
    expect(error.hint).toContain('login');
  });
  
  test('resourceNotFound 함수', () => {
    // 리소스를 찾을 수 없는 오류 생성
    const error = errorService.resourceNotFound('게시물', '123');
    
    // 검증
    expect(error.message).toContain('게시물');
    expect(error.message).toContain('123');
    expect(error.code).toBe(ErrorType.RESOURCE_NOT_FOUND);
  });
  
  test('networkError 함수', () => {
    // 기본 네트워크 오류 생성
    const error1 = errorService.networkError();
    
    // 세부 정보가 있는 네트워크 오류 생성
    const error2 = errorService.networkError('연결 시간 초과');
    
    // 검증
    expect(error1.code).toBe(ErrorType.NETWORK_ERROR);
    expect(error1.hint).toBeDefined();
    
    expect(error2.message).toContain('연결 시간 초과');
    expect(error2.code).toBe(ErrorType.NETWORK_ERROR);
  });
  
  test('serverError 함수', () => {
    // 기본 서버 오류 생성
    const error1 = errorService.serverError();
    
    // 세부 정보가 있는 서버 오류 생성
    const error2 = errorService.serverError('내부 서버 오류');
    
    // 검증
    expect(error1.code).toBe(ErrorType.SERVER_ERROR);
    expect(error1.hint).toBeDefined();
    
    expect(error2.message).toContain('내부 서버 오류');
    expect(error2.code).toBe(ErrorType.SERVER_ERROR);
  });
  
  test('unknownError 함수', () => {
    // 기본 알 수 없는 오류 생성
    const error = errorService.unknownError(new Error('테스트 오류'));
    
    // 검증
    expect(error.code).toBe(ErrorType.UNKNOWN_ERROR);
    
    // 개발 모드에서는 원본 오류 메시지 포함 (process.env.NODE_ENV 모킹 필요)
    // 여기서는 기본적인 형식만 검증
    expect(error.message).toContain('알 수 없는 오류가 발생했습니다');
  });
}); 