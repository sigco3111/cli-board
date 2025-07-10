/**
 * 인증 관련 명령어 모듈
 * 로그인, 로그아웃 등 인증 관련 명령어들을 관리하고 내보내는 모듈입니다.
 */
import { Command } from '../../../types/commands';
import LoginCommand from './LoginCommand';
import LogoutCommand from './LogoutCommand';
import WhoamiCommand from './WhoamiCommand';

// 모든 인증 관련 명령어 배열
const authCommands: Command[] = [
  LoginCommand,
  LogoutCommand,
  WhoamiCommand
];

export default authCommands; 