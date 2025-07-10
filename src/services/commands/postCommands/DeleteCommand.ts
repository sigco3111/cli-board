/**
 * 게시물 삭제 명령어
 * 특정 게시물을 삭제하는 명령어입니다.
 */
import { Command, CommandContext, InputHandler } from '../../../types/commands';
import { deletePost, fetchPostById } from '../../../services/firebase/firestore';

const DeleteCommand: Command = {
  name: 'delete',
  aliases: ['remove', 'del'],
  description: '게시물을 삭제합니다.',
  usage: 'delete <게시물ID>',
  requiresAuth: true, // 로그인 필요
  
  /**
   * 게시물 삭제 명령어 실행 함수
   * @param context 명령어 실행 컨텍스트
   */
  async execute(context: CommandContext): Promise<InputHandler | void> {
    const { args, addOutputItem, user } = context;
    
    // 로그인 확인
    if (!user) {
      addOutputItem({
        type: 'error',
        content: '게시물을 삭제하려면 먼저 로그인해야 합니다. login 명령어를 사용하세요.'
      });
      return;
    }
    
    // 게시물 ID 확인
    if (!args[0]) {
      addOutputItem({
        type: 'error',
        content: '게시물 ID를 입력해주세요. 사용법: delete <게시물ID>'
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
      
      // 작성자 확인
      if (post.authorId !== user.uid) {
        addOutputItem({
          type: 'error',
          content: '자신이 작성한 게시물만 삭제할 수 있습니다.'
        });
        return;
      }
      
      // 게시물 정보 표시
      addOutputItem({
        type: 'text',
        content: `다음 게시물을 삭제하시겠습니까?\n제목: ${post.title}\n작성일: ${post.date}\n\n삭제하려면 'y'를 입력하세요. 취소하려면 다른 키를 입력하세요.`
      });
      
      // 확인 입력 처리 함수
      const handleConfirmation: InputHandler = async (confirmation: string) => {
        if (confirmation.trim().toLowerCase() !== 'y') {
          addOutputItem({
            type: 'text',
            content: '게시물 삭제가 취소되었습니다.'
          });
          return;
        }
        
        try {
          // 게시물 삭제 처리
          addOutputItem({
            type: 'text',
            content: '게시물을 삭제하는 중입니다...'
          });
          
          await deletePost(postId, user.uid);
          
          // 성공 메시지 표시
          addOutputItem({
            type: 'text',
            content: '게시물이 성공적으로 삭제되었습니다.'
          });
          
        } catch (error) {
          addOutputItem({
            type: 'error',
            content: error instanceof Error ? error.message : '게시물 삭제 중 오류가 발생했습니다.'
          });
        }
      };
      
      // 확인 입력 핸들러 등록
      return handleConfirmation;
      
    } catch (error) {
      addOutputItem({
        type: 'error',
        content: error instanceof Error ? error.message : '게시물 삭제 중 오류가 발생했습니다.'
      });
    }
  }
};

export default DeleteCommand; 