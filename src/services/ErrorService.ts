/**
 * 오류 메시지 관리 서비스
 * 애플리케이션 전체에서 일관된 오류 메시지를 제공하기 위한 서비스입니다.
 */

// 오류 유형 정의
export enum ErrorType {
  COMMAND_NOT_FOUND = 'COMMAND_NOT_FOUND',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  MISSING_ARGUMENT = 'MISSING_ARGUMENT',
  AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// 오류 메시지 인터페이스
export interface ErrorMessage {
  message: string;        // 사용자에게 표시할 메시지
  hint?: string;          // 문제 해결을 위한 힌트 (선택 사항)
  code: ErrorType;        // 오류 코드
}

/**
 * 오류 메시지 서비스 클래스
 * 일관된 오류 메시지를 생성하고 관리합니다.
 */
class ErrorService {
  /**
   * 오류 메시지 생성
   * @param type 오류 유형
   * @param customMessage 사용자 정의 메시지 (선택 사항)
   * @param hint 문제 해결 힌트 (선택 사항)
   * @returns 포맷된 오류 메시지 객체
   */
  createError(type: ErrorType, customMessage?: string, hint?: string): ErrorMessage {
    // 기본 메시지 매핑
    const defaultMessages: Record<ErrorType, string> = {
      [ErrorType.COMMAND_NOT_FOUND]: '명령어를 찾을 수 없습니다.',
      [ErrorType.INVALID_ARGUMENT]: '잘못된 인자가 전달되었습니다.',
      [ErrorType.MISSING_ARGUMENT]: '필수 인자가 누락되었습니다.',
      [ErrorType.AUTHENTICATION_REQUIRED]: '이 작업을 수행하려면 로그인이 필요합니다.',
      [ErrorType.PERMISSION_DENIED]: '이 작업을 수행할 권한이 없습니다.',
      [ErrorType.RESOURCE_NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
      [ErrorType.NETWORK_ERROR]: '네트워크 연결에 문제가 발생했습니다.',
      [ErrorType.SERVER_ERROR]: '서버에서 오류가 발생했습니다.',
      [ErrorType.UNKNOWN_ERROR]: '알 수 없는 오류가 발생했습니다.'
    };
    
    // 기본 힌트 매핑
    const defaultHints: Partial<Record<ErrorType, string>> = {
      [ErrorType.COMMAND_NOT_FOUND]: '"help" 명령어로 사용 가능한 명령어 목록을 확인하세요.',
      [ErrorType.INVALID_ARGUMENT]: '"help [명령어]"로 올바른 사용법을 확인하세요.',
      [ErrorType.MISSING_ARGUMENT]: '"help [명령어]"로 필수 인자를 확인하세요.',
      [ErrorType.AUTHENTICATION_REQUIRED]: '"login" 명령어로 로그인하세요.',
      [ErrorType.NETWORK_ERROR]: '인터넷 연결을 확인하고 다시 시도하세요.',
      [ErrorType.SERVER_ERROR]: '잠시 후 다시 시도하세요. 문제가 지속되면 관리자에게 문의하세요.'
    };
    
    // 메시지 생성
    return {
      message: customMessage || defaultMessages[type],
      hint: hint || defaultHints[type],
      code: type
    };
  }
  
  /**
   * 명령어를 찾을 수 없는 경우의 오류 메시지
   * @param command 찾을 수 없는 명령어
   * @returns 오류 메시지 객체
   */
  commandNotFound(command: string): ErrorMessage {
    return this.createError(
      ErrorType.COMMAND_NOT_FOUND,
      `'${command}' 명령어를 찾을 수 없습니다.`,
      `"help" 명령어로 사용 가능한 명령어 목록을 확인하세요. 또는 "${command}" 명령어의 철자를 확인하세요.`
    );
  }
  
  /**
   * 잘못된 인자가 전달된 경우의 오류 메시지
   * @param command 명령어 이름
   * @param hint 추가 힌트 (선택 사항)
   * @returns 오류 메시지 객체
   */
  invalidArgument(command: string, hint?: string): ErrorMessage {
    return this.createError(
      ErrorType.INVALID_ARGUMENT,
      `'${command}' 명령어에 잘못된 인자가 전달되었습니다.`,
      hint || `"help ${command}"로 올바른 사용법을 확인하세요.`
    );
  }
  
  /**
   * 필수 인자가 누락된 경우의 오류 메시지
   * @param command 명령어 이름
   * @param argName 누락된 인자 이름 (선택 사항)
   * @returns 오류 메시지 객체
   */
  missingArgument(command: string, argName?: string): ErrorMessage {
    const message = argName 
      ? `'${command}' 명령어에 필수 인자 '${argName}'이(가) 누락되었습니다.`
      : `'${command}' 명령어에 필수 인자가 누락되었습니다.`;
      
    return this.createError(
      ErrorType.MISSING_ARGUMENT,
      message,
      `"help ${command}"로 필수 인자를 확인하세요.`
    );
  }
  
  /**
   * 인증이 필요한 경우의 오류 메시지
   * @returns 오류 메시지 객체
   */
  authenticationRequired(): ErrorMessage {
    return this.createError(ErrorType.AUTHENTICATION_REQUIRED);
  }
  
  /**
   * 권한이 없는 경우의 오류 메시지
   * @returns 오류 메시지 객체
   */
  permissionDenied(): ErrorMessage {
    return this.createError(ErrorType.PERMISSION_DENIED);
  }
  
  /**
   * 리소스를 찾을 수 없는 경우의 오류 메시지
   * @param resourceType 리소스 유형 (예: '게시물', '댓글')
   * @param resourceId 리소스 ID
   * @returns 오류 메시지 객체
   */
  resourceNotFound(resourceType: string, resourceId: string | number): ErrorMessage {
    return this.createError(
      ErrorType.RESOURCE_NOT_FOUND,
      `${resourceType} ID ${resourceId}을(를) 찾을 수 없습니다.`
    );
  }
  
  /**
   * 네트워크 오류 메시지
   * @param details 추가 세부 정보 (선택 사항)
   * @returns 오류 메시지 객체
   */
  networkError(details?: string): ErrorMessage {
    const message = details 
      ? `네트워크 연결에 문제가 발생했습니다: ${details}`
      : '네트워크 연결에 문제가 발생했습니다.';
      
    return this.createError(ErrorType.NETWORK_ERROR, message);
  }
  
  /**
   * 서버 오류 메시지
   * @param details 추가 세부 정보 (선택 사항)
   * @returns 오류 메시지 객체
   */
  serverError(details?: string): ErrorMessage {
    const message = details 
      ? `서버에서 오류가 발생했습니다: ${details}`
      : '서버에서 오류가 발생했습니다.';
      
    return this.createError(ErrorType.SERVER_ERROR, message);
  }
  
  /**
   * 알 수 없는 오류 메시지
   * @param error 원본 오류 객체
   * @returns 오류 메시지 객체
   */
  unknownError(error: any): ErrorMessage {
    // 개발 모드에서는 원본 오류 메시지 포함
    const isDev = process.env.NODE_ENV === 'development';
    const details = isDev && error?.message ? `: ${error.message}` : '';
    
    return this.createError(
      ErrorType.UNKNOWN_ERROR,
      `알 수 없는 오류가 발생했습니다${details}`
    );
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const errorService = new ErrorService();
export default errorService; 