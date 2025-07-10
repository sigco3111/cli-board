/**
 * 댓글 작성 명령어
 * 특정 게시물에 댓글을 작성합니다.
 */
import { Command, CommandContext } from '../../../types/commands';
import { createComment, fetchPostById } from '../../../services/firebase/firestore';

const CommentCommand: Command = {
  name: 'comment',
  aliases: ['add-comment', 'reply'],
  description: '게시물에 댓글을 작성합니다.',
  usage: 'comment <게시물ID> <댓글내용>',
  requiresAuth: true,
  
  /**
   * 댓글 작성 명령어 실행 함수
   * @param context 명령어 실행 컨텍스트
   */
  async execute(context: CommandContext): Promise<void> {
    const { args, addOutputItem, user } = context;
    
    // 사용자 인증 확인
    if (!user) {
      addOutputItem({
        type: 'error',
        content: '댓글을 작성하려면 로그인이 필요합니다. login 명령어를 사용해 로그인해주세요.'
      });
      return;
    }
    
    // 인자 검증
    if (!args[0]) {
      addOutputItem({
        type: 'error',
        content: '게시물 ID를 입력해주세요. 사용법: comment <게시물ID> <댓글내용>'
      });
      return;
    }
    
    if (!args[1]) {
      addOutputItem({
        type: 'error',
        content: '댓글 내용을 입력해주세요. 사용법: comment <게시물ID> <댓글내용>'
      });
      return;
    }
    
    const postId = args[0];
    // 첫 번째 인자(게시물 ID) 이후의 모든 인자를 댓글 내용으로 합침
    const commentContent = args.slice(1).join(' ');
    
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
      
      // 댓글 작성 중 메시지
      addOutputItem({
        type: 'text',
        content: '댓글을 작성하는 중입니다...'
      });
      
      // 댓글 생성
      const commentId = await createComment({
        postId,
        content: commentContent,
        author: {
          name: user.displayName || '익명 사용자',
          photoURL: user.photoURL
        },
        authorId: user.uid
      });
      
      // 성공 메시지
      addOutputItem({
        type: 'text',
        content: '✅ 댓글이 성공적으로 작성되었습니다.'
      });
      
      // 작성된 댓글 미리보기
      addOutputItem({
        type: 'text',
        content: `게시물: ${post.title}`
      });
      
      addOutputItem({
        type: 'markdown',
        content: commentContent
      });
      
      // 댓글 ID 표시 (삭제 시 필요)
      addOutputItem({
        type: 'text',
        content: `댓글 ID: ${commentId}`
      });
      
      // 추가 안내
      addOutputItem({
        type: 'text',
        content: '모든 댓글을 보려면 comments 명령어를 사용하세요: comments ' + postId
      });
      
    } catch (error) {
      addOutputItem({
        type: 'error',
        content: error instanceof Error ? error.message : '댓글 작성 중 오류가 발생했습니다.'
      });
    }
  }
};

export default CommentCommand; 