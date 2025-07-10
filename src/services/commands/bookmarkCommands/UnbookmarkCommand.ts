/**
 * 북마크 해제 명령어
 * 북마크에 추가된 게시물을 제거합니다.
 */
import { Command, CommandContext } from '../../../types/commands';
import { removeBookmark, isBookmarked, fetchPostById } from '../../../services/firebase/firestore';

const UnbookmarkCommand: Command = {
  name: 'unbookmark',
  aliases: ['remove-bookmark', 'unsave'],
  description: '북마크에서 게시물을 제거합니다.',
  usage: 'unbookmark <게시물ID>',
  requiresAuth: true,
  
  /**
   * 북마크 해제 명령어 실행 함수
   * @param context 명령어 실행 컨텍스트
   */
  async execute(context: CommandContext): Promise<void> {
    const { args, addOutputItem, user } = context;
    
    // 사용자 인증 확인
    if (!user) {
      addOutputItem({
        type: 'error',
        content: '북마크를 해제하려면 로그인이 필요합니다. login 명령어를 사용해 로그인해주세요.'
      });
      return;
    }
    
    // 게스트(익명) 사용자 확인
    if (user.isAnonymous) {
      addOutputItem({
        type: 'error',
        content: '게스트는 북마크 기능을 사용할 수 없습니다. 로그인 후 이용해주세요.'
      });
      return;
    }
    
    // 게시물 ID 확인
    if (!args[0]) {
      addOutputItem({
        type: 'error',
        content: '게시물 ID를 입력해주세요. 사용법: unbookmark <게시물ID>'
      });
      return;
    }
    
    const postId = args[0];
    
    try {
      // 게시물 존재 확인
      const post = await fetchPostById(postId);
      if (!post) {
        addOutputItem({
          type: 'error',
          content: `ID가 ${postId}인 게시물을 찾을 수 없습니다.`
        });
        return;
      }
      
      // 북마크 상태 확인
      const bookmarked = await isBookmarked(user.uid, postId);
      if (!bookmarked) {
        addOutputItem({
          type: 'text',
          content: '해당 게시물은 북마크에 추가되어 있지 않습니다.'
        });
        return;
      }
      
      // 북마크 제거
      await removeBookmark(user.uid, postId);
      
      addOutputItem({
        type: 'text',
        content: `"${post.title}" 게시물을 북마크에서 제거했습니다.`
      });
    } catch (error) {
      console.error('북마크 해제 오류:', error);
      
      addOutputItem({
        type: 'error',
        content: error instanceof Error ? error.message : '북마크 해제 중 오류가 발생했습니다.'
      });
    }
  }
};

export default UnbookmarkCommand; 