/**
 * 버전 정보 명령어
 * 애플리케이션의 버전 정보를 표시하는 명령어입니다.
 */
import { Command, CommandContext } from '../../../types/commands';

// 버전 정보 (실제로는 package.json에서 가져오는 것이 좋습니다)
const APP_VERSION = '1.0.0';
const APP_NAME = 'CLI 스타일 게시판';
const BUILD_DATE = new Date().toLocaleDateString('ko-KR');

/**
 * 버전 정보 명령어 구현
 */
const VersionCommand: Command = {
  name: 'version',
  aliases: ['ver', '버전'],
  description: '애플리케이션의 버전 정보를 표시합니다.',
  usage: 'version',
  
  /**
   * 버전 정보 명령어 실행 함수
   */
  execute(context: CommandContext): void {
    const { addOutputItem } = context;
    
    // 버전 정보 텍스트 생성
    const versionText = [
      `${APP_NAME} v${APP_VERSION}`,
      `빌드 날짜: ${BUILD_DATE}`,
      ``,
      `Copyright © ${new Date().getFullYear()} 컴퓨터 터미널 게시판 서비스.`,
      `모든 권리 보유.`
    ].join('\n');
    
    // 버전 정보 출력
    addOutputItem({
      type: 'text',
      content: versionText
    });
  }
};

export default VersionCommand; 