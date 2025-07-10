/**
 * 댓글 관련 명령어 모음
 * 댓글 작성, 조회, 삭제 등의 명령어를 제공합니다.
 */
import { Command } from '../../../types/commands';
import CommentCommand from './CommentCommand';
import CommentsCommand from './CommentsCommand';
import CommentDeleteCommand from './CommentDeleteCommand';

// 댓글 관련 명령어 배열
const commentCommands: Command[] = [
  CommentCommand,
  CommentsCommand,
  CommentDeleteCommand,
];

export default commentCommands; 