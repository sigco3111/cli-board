/**
 * 댓글 조회 명령어
 * 특정 게시물의 댓글 목록을 조회합니다.
 */
import { Command, CommandContext } from '../../../types/commands';
import { fetchCommentsByPostId, fetchPostById } from '../../../services/firebase/firestore';

const CommentsCommand: Command = {
  name: 'comments',
  aliases: ['comment-list', 'show-comments'],
  description: '게시물의 댓글 목록을 조회합니다.',
  usage: 'comments <게시물ID>',
  
  /**
   * 댓글 조회 명령어 실행 함수
   * @param context 명령어 실행 컨텍스트
   */
  async execute(context: CommandContext): Promise<void> {
    const { args, addOutputItem } = context;
    
    // 게시물 ID 확인
    if (!args[0]) {
      addOutputItem({
        type: 'error',
        content: '게시물 ID를 입력해주세요. 사용법: comments <게시물ID>'
      });
      return;
    }
    
    const postId = args[0];
    
    try {
      // 게시물 존재 확인
      addOutputItem({
        type: 'text',
        content: '게시물을 확인하는 중입니다...'
      });
      
      const post = await fetchPostById(postId);
      
      if (!post) {
        addOutputItem({
          type: 'error',
          content: `ID가 ${postId}인 게시물을 찾을 수 없습니다.`
        });
        return;
      }
      
      // 댓글 로딩 메시지
      addOutputItem({
        type: 'text',
        content: `"${post.title}" 게시물의 댓글을 불러오는 중입니다...`
      });
      
      // 댓글 목록 조회
      const comments = await fetchCommentsByPostId(postId);
      
      // 댓글이 없는 경우
      if (comments.length === 0) {
        addOutputItem({
          type: 'text',
          content: '이 게시물에는 아직 댓글이 없습니다.'
        });
        
        // 댓글 작성 안내
        addOutputItem({
          type: 'text',
          content: '댓글을 작성하려면 다음 명령어를 사용하세요: comment <게시물ID> <댓글내용>'
        });
        return;
      }
      
      // 댓글 목록 헤더
      addOutputItem({
        type: 'text',
        content: `총 ${comments.length}개의 댓글이 있습니다.`
      });
      
      // 댓글 목록 표시
      comments.forEach((comment, index) => {
        addOutputItem({
          type: 'text',
          content: `\n[${index + 1}] ${comment.author.name} (${comment.date})`
        });
        
        addOutputItem({
          type: 'markdown',
          content: comment.content
        });
        
        // 댓글 ID 표시 (삭제 시 필요)
        addOutputItem({
          type: 'text',
          content: `댓글 ID: ${comment.id}`
        });
      });
      
      // 댓글 작성 및 삭제 안내
      addOutputItem({
        type: 'text',
        content: '\n댓글을 작성하려면: comment <게시물ID> <댓글내용>'
      });
      
      addOutputItem({
        type: 'text',
        content: '댓글을 삭제하려면: comment-delete <댓글ID>'
      });
      
    } catch (error) {
      addOutputItem({
        type: 'error',
        content: error instanceof Error ? error.message : '댓글을 불러오는 중 오류가 발생했습니다.'
      });
    }
  }
};

export default CommentsCommand; 