/**
 * 북마크 추가 명령어
 * 특정 게시물을 북마크에 추가합니다.
 */
import { Command, CommandContext } from '../../../types/commands';
import { addBookmark, fetchPostById } from '../../../services/firebase/firestore';

const BookmarkCommand: Command = {
  name: 'bookmark',
  aliases: ['add-bookmark', 'save'],
  description: '게시물을 북마크에 추가합니다.',
  usage: 'bookmark <게시물ID>',
  requiresAuth: true,
  
  /**
   * 북마크 추가 명령어 실행 함수
   * @param context 명령어 실행 컨텍스트
   */
  async execute(context: CommandContext): Promise<void> {
    const { args, addOutputItem, user } = context;
    
    // 사용자 인증 확인
    if (!user) {
      addOutputItem({
        type: 'error',
        content: '북마크를 추가하려면 로그인이 필요합니다. login 명령어를 사용해 로그인해주세요.'
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
        content: '게시물 ID를 입력해주세요. 사용법: bookmark <게시물ID>'
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
      
      // 북마크 추가
      await addBookmark(user.uid, postId);
      
      addOutputItem({
        type: 'text',
        content: `"${post.title}" 게시물을 북마크에 추가했습니다.`
      });
    } catch (error) {
      console.error('북마크 추가 오류:', error);
      
      // 이미 북마크된 게시물인 경우
      if (error instanceof Error && error.message.includes('이미 북마크된 게시물')) {
        addOutputItem({
          type: 'text',
          content: '이미 북마크에 추가된 게시물입니다.'
        });
        return;
      }
      
      addOutputItem({
        type: 'error',
        content: error instanceof Error ? error.message : '북마크 추가 중 오류가 발생했습니다.'
      });
    }
  }
};

export default BookmarkCommand; 