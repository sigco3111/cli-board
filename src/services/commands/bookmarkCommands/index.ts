/**
 * 북마크 관련 명령어 모음
 * 북마크 추가, 제거, 조회 등의 명령어를 제공합니다.
 */
import { Command } from '../../../types/commands';
import BookmarkCommand from './BookmarkCommand';
import UnbookmarkCommand from './UnbookmarkCommand';
import BookmarksCommand from './BookmarksCommand';

// 북마크 관련 명령어 배열
const bookmarkCommands: Command[] = [
  BookmarkCommand,
  UnbookmarkCommand,
  BookmarksCommand,
];

export default bookmarkCommands; 