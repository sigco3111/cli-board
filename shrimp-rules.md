# CLI 스타일 게시판 개발 가이드라인

## 프로젝트 개요

### 목적 및 범위
- 기존 PC통신 스타일 게시판을 CLI(Command Line Interface) 스타일로 리뉴얼
- 게시물 상세 보기와 작성 시 마크다운 형식 지원 유지
- 설정 기능은 제거 (사용자 요구사항에 따름)
- 화면을 단계별로 볼 수 있는 사용자 경험 제공

### 기술 스택
- React + TypeScript
- Firebase (Authentication, Firestore)
- React Markdown (마크다운 렌더링)
- 기존 PC통신 스타일 컴포넌트 일부 재활용

## 프로젝트 구조

### 주요 폴더 구조
```
src/
  components/
    cli/                    # 새로 추가되는 CLI 관련 컴포넌트
      Terminal.tsx          # 메인 터미널 컴포넌트
      CommandInput.tsx      # 명령어 입력 컴포넌트
      CommandProcessor.tsx  # 명령어 처리 로직
      OutputDisplay.tsx     # 명령어 실행 결과 표시
      MarkdownRenderer.tsx  # CLI용 마크다운 렌더러
      commands/             # 명령어 구현 폴더
        index.ts            # 명령어 등록 및 내보내기
        help.ts             # 도움말 명령어
        post.ts             # 게시물 관련 명령어
        comment.ts          # 댓글 관련 명령어
        auth.ts             # 인증 관련 명령어
        etc...
  hooks/                    # 기존 훅 재활용 및 CLI용 훅 추가
    useCommandHistory.ts    # 명령어 히스토리 관리
    useCommandExecution.ts  # 명령어 실행 로직
  services/                 # 기존 서비스 재활용
    firebase/               # Firebase 연동 코드
    commands/               # 명령어 서비스
      CommandRegistry.ts    # 명령어 등록 및 관리
```

### 기존 코드 활용
- `src/hooks/useAuth.ts`, `usePosts.tsx`, `useComments.ts`, `useBookmarks.ts` 등 데이터 관련 훅 재활용
- `src/services/firebase/` 폴더의 Firebase 연동 코드 재활용
- `src/components/pc-components/` 폴더의 일부 컴포넌트(AsciiArt, TextBox 등) 필요시 CLI 스타일에 맞게 수정하여 재활용

## 코드 표준

### 명명 규칙
- 컴포넌트: PascalCase (예: `Terminal`, `CommandInput`)
- 훅: camelCase, 'use' 접두사 (예: `useCommandHistory`)
- 명령어 처리 함수: camelCase, 'handle' 접두사 (예: `handleListCommand`)
- 명령어 결과 타입: PascalCase, 'Result' 접미사 (예: `ListCommandResult`)

### 코드 스타일
- 각 컴포넌트 파일 상단에 간략한 설명 주석 필수
- 복잡한 로직에는 한국어 주석으로 설명 추가
- 명령어 처리 함수는 입력과 출력 타입을 명확히 정의

### 명령어 처리 규칙
- 모든 명령어는 `CommandRegistry`에 등록
- 명령어 처리 함수는 표준화된 형식으로 구현:
```typescript
// 명령어 처리 함수 표준 형식
const handleCommand = async (
  args: string[],  // 명령어 인자
  options: Record<string, any>,  // 명령어 옵션
  context: CommandContext  // 실행 컨텍스트(현재 사용자, 상태 등)
): Promise<CommandResult> => {
  // 명령어 처리 로직
  return {
    success: true,  // 성공 여부
    message: "명령어가 성공적으로 실행되었습니다.",  // 메시지
    data: {}  // 결과 데이터
  };
};
```

## CLI 인터페이스 구현

### 터미널 UI
- 어두운 배경에 밝은 텍스트의 고전적인 터미널 외관
- 명령어 입력 영역과 출력 영역을 시각적으로 구분
- 스크롤 가능한 출력 영역
- 사용자 프롬프트에 현재 상태 표시 (예: `user@board:category$`)

### 명령어 입력 시스템
- CommandInput 컴포넌트에서 사용자 입력 처리
- 입력된 명령어는 CommandProcessor로 전달하여 파싱 및 실행
- 명령어 자동 완성 기능 (Tab 키)
- 명령어 히스토리 탐색 기능 (위/아래 화살표)

### 명령어 형식
- 기본 형식: `command [subcommand] [arguments] [--options]`
- 예시:
  - `help`: 도움말 표시
  - `list -c tech`: tech 카테고리 게시물 목록 조회
  - `view 123`: ID가 123인 게시물 상세 보기
  - `write -t "제목" -c tech`: tech 카테고리에 "제목"으로 새 게시물 작성 시작

### 출력 형식
- 일반 텍스트: 간단한 메시지나 도움말
- 테이블: 게시물 목록 등의 데이터
- 마크다운: 게시물 내용 표시
- 에러 메시지: 오류 발생 시 명확한 메시지 표시

## 명령어 체계

### 기본 명령어
- `help [command]`: 전체 또는 특정 명령어 도움말 표시
- `clear`: 화면 지우기
- `version`: 애플리케이션 버전 정보 표시
- `exit`: 로그아웃 또는 애플리케이션 종료

### 사용자 인증 명령어
- `login`: 로그인
- `logout`: 로그아웃
- `whoami`: 현재 로그인한 사용자 정보 표시

### 게시물 관련 명령어
- `list [category]`: 게시물 목록 표시 (카테고리 옵션)
- `view <id>`: 특정 ID의 게시물 상세 내용 보기
- `write`: 새 게시물 작성 모드 진입
- `edit <id>`: 특정 ID의 게시물 수정
- `delete <id>`: 특정 ID의 게시물 삭제

### 댓글 관련 명령어
- `comment <post_id> "<content>"`: 특정 게시물에 댓글 작성
- `comments <post_id>`: 특정 게시물의 댓글 목록 보기
- `comment-delete <comment_id>`: 특정 댓글 삭제

### 검색 및 필터링 명령어
- `search <keyword>`: 키워드로 게시물 검색
- `tags`: 사용 가능한 태그 목록 표시
- `tag <tag_name>`: 특정 태그가 있는 게시물 목록 표시

### 북마크 관련 명령어
- `bookmark <id>`: 특정 게시물 북마크
- `unbookmark <id>`: 특정 게시물 북마크 해제
- `bookmarks`: 북마크한 게시물 목록 표시

## 마크다운 처리

### 마크다운 렌더링
- MarkdownRenderer 컴포넌트를 통해 마크다운을 HTML로 변환하여 표시
- CLI 환경에 맞는 스타일링 적용 (폰트, 색상, 간격 등)
- 코드 블록, 테이블, 이미지 등의 마크다운 요소 지원

### 마크다운 에디터
- 게시물 작성/수정 시 사용할 간단한 마크다운 에디터 구현
- 기본적인 마크다운 문법 가이드 제공
- 에디터 내에서의 키보드 단축키 지원 (굵게, 기울임 등)

### 미리보기 기능
- 작성 중인 마크다운의 실시간 렌더링 미리보기 제공
- 분할 화면 또는 토글 방식으로 에디터와 미리보기 전환

## 데이터 관리

### Firebase 연동
- 기존 Firebase 연동 코드(`src/services/firebase/`) 재활용
- 명령어 처리 로직과 데이터 접근 로직 분리
- 데이터 접근은 기존 훅(`useAuth`, `usePosts` 등)을 통해 수행

### 데이터 모델
- 기존 데이터 모델 유지 (DATABASE-SCHEMA.md 참조)
  - posts: 게시물 정보
  - comments: 댓글 정보
  - bookmarks: 북마크 정보
  - users: 사용자 정보
  - settings: 설정 정보 (일부 제거 예정)

### 캐싱 및 최적화
- 자주 사용되는 데이터는 로컬 캐싱
- 페이지네이션을 통한 대용량 데이터 효율적 로딩
- 명령어 실행 결과의 캐싱 및 재사용

## 사용자 경험

### 명령어 자동 완성
- Tab 키를 통한 명령어 자동 완성
- 명령어, 하위 명령어, 인자 등 다양한 수준의 자동 완성 지원
- 컨텍스트에 따른 지능형 자동 완성 (예: 카테고리 목록에서 자동 완성)

### 명령어 히스토리
- 위/아래 화살표 키를 통한 이전/다음 명령어 탐색
- 세션 간 히스토리 저장 및 로드
- 히스토리 검색 기능 (Ctrl+R)

### 오류 처리
- 명확한 오류 메시지 제공
- 명령어 형식 오류 시 올바른 사용법 안내
- 네트워크 오류, 권한 부족 등 다양한 예외 상황 처리

### 상태 표시
- 현재 위치(카테고리) 표시
- 로그인 상태 표시
- 명령어 실행 중 로딩 상태 표시

## 개발 로드맵

### 1단계: 기본 터미널 UI 및 명령어 처리 시스템
- Terminal, CommandInput, OutputDisplay 컴포넌트 구현
- CommandProcessor, CommandRegistry 구현
- 기본 명령어(help, clear, version, exit) 구현

### 2단계: 사용자 인증 시스템
- 로그인/로그아웃 명령어 구현
- 사용자 정보 표시 기능 구현
- 권한 기반 명령어 접근 제어 시스템 구현

### 3단계: 게시물 목록 및 조회 기능
- 게시물 목록 조회 명령어(list) 구현
- 카테고리 기반 필터링 기능 구현
- 게시물 상세 조회 명령어(view) 구현
- 마크다운 렌더링 기능 통합

### 4단계: 게시물 작성 및 관리 기능
- 게시물 작성 명령어(write) 및 에디터 구현
- 게시물 수정 및 삭제 기능 구현
- 마크다운 에디터 및 미리보기 기능 구현

### 5단계: 댓글 시스템
- 댓글 조회 기능 구현
- 댓글 작성 기능 구현
- 댓글 수정 및 삭제 기능 구현

### 6단계: 검색 및 필터링 기능
- 키워드 기반 검색 기능 구현
- 태그 기반 필터링 기능 구현
- 고급 검색 옵션 구현

### 7단계: 사용자 경험 개선
- 명령어 자동 완성 기능 강화
- 명령어 히스토리 기능 구현
- 오류 메시지 및 피드백 개선
- UI/UX 최적화

## 금지 사항

### 구현하지 않을 기능
- 설정 기능 (사용자 요구사항에 따라 제거)
- 복잡한 GUI 요소
- 실시간 알림 시스템
- 관리자 기능 (별도 구현 필요시 논의)

### 개발 방식 제한
- 일반적인 웹 UI 요소(버튼, 폼 등) 사용 금지
- REST API 직접 호출 지양 (기존 서비스 레이어 활용)
- 복잡한 상태 관리 라이브러리 도입 지양 (기존 훅 활용)
- 단일 파일에 과도한 코드 집중 금지 (모듈화 필수)

## 테스트 및 배포

### 테스트 전략
- 각 명령어별 단위 테스트 작성
- 주요 컴포넌트에 대한 통합 테스트
- 전체 CLI 인터페이스에 대한 E2E 테스트

### 배포 프로세스
- Firebase Hosting을 통한 배포
- 배포 전 빌드 및 테스트 자동화
- 점진적 기능 릴리스 (단계별 개발 계획에 따름) 