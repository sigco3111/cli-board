/**
 * 게시물 관련 명령어 모음
 * 게시물 목록 조회, 상세 보기 등의 명령어를 제공합니다.
 */
import { Command } from '../../../types/commands';
import ListCommand from './ListCommand';
import CategoriesCommand from './CategoriesCommand';
import ViewCommand from './ViewCommand';

// 게시물 관련 명령어 배열
const postCommands: Command[] = [
  ListCommand,
  CategoriesCommand,
  ViewCommand,
];

export default postCommands; 