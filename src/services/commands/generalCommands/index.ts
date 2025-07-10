/**
 * 기본 명령어 모듈
 * 기본적인 명령어들을 관리하고 내보내는 모듈입니다.
 */
import { Command } from '../../../types/commands';
import HelpCommand from './HelpCommand';
import ClearCommand from './ClearCommand';
import VersionCommand from './VersionCommand';
import ExitCommand from './ExitCommand';
import HistoryCommand from './HistoryCommand';
import ShortcutsCommand from './ShortcutsCommand';

// 모든 기본 명령어 배열
const generalCommands: Command[] = [
  HelpCommand,
  ClearCommand,
  VersionCommand,
  ExitCommand,
  HistoryCommand,
  ShortcutsCommand
];

export default generalCommands; 