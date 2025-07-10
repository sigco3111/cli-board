/**
 * 검색 관련 명령어 모음
 * 게시물 검색 및 태그 검색 명령어를 제공합니다.
 */
import { Command } from '../../../types/commands';
import SearchCommand from './SearchCommand';
import TagCommand from './TagCommand';

// 검색 관련 명령어 배열
const searchCommands: Command[] = [
  SearchCommand,
  TagCommand,
];

export default searchCommands; 