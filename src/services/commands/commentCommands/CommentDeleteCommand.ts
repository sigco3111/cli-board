/**
 * 댓글 삭제 명령어
 * 작성한 댓글을 삭제합니다.
 */
import { Command, CommandContext } from '../../../types/commands';
import { deleteComment } from '../../../services/firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase/config';

// 컬렉션 이름 상수
const COMMENTS_COLLECTION = 'comments';

const CommentDeleteCommand: Command = {
  name: 'comment-delete',
  aliases: ['delete-comment', 'remove-comment'],
  description: '작성한 댓글을 삭제합니다.',
  usage: 'comment-delete <댓글ID>',
  requiresAuth: true,
  
  /**
   * 댓글 삭제 명령어 실행 함수
   * @param context 명령어 실행 컨텍스트
   */
  async execute(context: CommandContext): Promise<void> {
    const { args, addOutputItem, user } = context;
    
    // 사용자 인증 확인
    if (!user) {
      addOutputItem({
        type: 'error',
        content: '댓글을 삭제하려면 로그인이 필요합니다. login 명령어를 사용해 로그인해주세요.'
      });
      return;
    }
    
    // 인자 검증
    if (!args[0]) {
      addOutputItem({
        type: 'error',
        content: '댓글 ID를 입력해주세요. 사용법: comment-delete <댓글ID>'
      });
      return;
    }
    
    const commentId = args[0];
    
    try {
      // 댓글 존재 여부 및 게시물 ID 확인
      addOutputItem({
        type: 'text',
        content: '댓글을 확인하는 중입니다...'
      });
      
      // 댓글 문서 참조
      const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
      const commentSnap = await getDoc(commentRef);
      
      // 댓글이 존재하지 않는 경우
      if (!commentSnap.exists()) {
        addOutputItem({
          type: 'error',
          content: `ID가 ${commentId}인 댓글을 찾을 수 없습니다.`
        });
        return;
      }
      
      // 댓글 데이터 가져오기
      const commentData = commentSnap.data();
      const postId = commentData.postId;
      
      // 댓글 작성자 확인
      if (commentData.authorId !== user.uid) {
        addOutputItem({
          type: 'error',
          content: '자신이 작성한 댓글만 삭제할 수 있습니다.'
        });
        return;
      }
      
      // 삭제 확인 메시지
      addOutputItem({
        type: 'text',
        content: '댓글을 삭제하는 중입니다...'
      });
      
      // 댓글 삭제
      await deleteComment(commentId, postId, user.uid);
      
      // 성공 메시지
      addOutputItem({
        type: 'text',
        content: '✅ 댓글이 성공적으로 삭제되었습니다.'
      });
      
      // 추가 안내
      addOutputItem({
        type: 'text',
        content: `게시물의 모든 댓글을 보려면 comments ${postId} 명령어를 사용하세요.`
      });
      
    } catch (error) {
      addOutputItem({
        type: 'error',
        content: error instanceof Error ? error.message : '댓글 삭제 중 오류가 발생했습니다.'
      });
    }
  }
};

export default CommentDeleteCommand; 