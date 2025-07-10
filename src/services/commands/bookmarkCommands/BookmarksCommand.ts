/**
 * 북마크 목록 조회 명령어
 * 사용자가 북마크한 게시물 목록을 조회합니다.
 */
import { Command, CommandContext } from '../../../types/commands';
import { fetchBookmarkedPosts } from '../../../services/firebase/firestore';
import { formatDate } from '../../../utils/formatDate';

const BookmarksCommand: Command = {
  name: 'bookmarks',
  aliases: ['my-bookmarks', 'show-bookmarks'],
  description: '북마크한 게시물 목록을 조회합니다.',
  usage: 'bookmarks',
  requiresAuth: true,
  
  /**
   * 북마크 목록 조회 명령어 실행 함수
   * @param context 명령어 실행 컨텍스트
   */
  async execute(context: CommandContext): Promise<void> {
    const { addOutputItem, user } = context;
    
    // 사용자 인증 확인
    if (!user) {
      addOutputItem({
        type: 'error',
        content: '북마크 목록을 조회하려면 로그인이 필요합니다. login 명령어를 사용해 로그인해주세요.'
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
    
    try {
      addOutputItem({
        type: 'text',
        content: '북마크 목록을 불러오는 중...'
      });
      
      // 북마크한 게시물 목록 조회
      const bookmarkedPosts = await fetchBookmarkedPosts(user.uid);
      
      if (bookmarkedPosts.length === 0) {
        addOutputItem({
          type: 'text',
          content: '북마크한 게시물이 없습니다.'
        });
        return;
      }
      
      // 테이블 형식으로 북마크 목록 표시
      addOutputItem({
        type: 'table',
        content: {
          headers: ['ID', '제목', '작성자', '작성일'],
          rows: bookmarkedPosts.map(post => [
            post.id,
            post.title,
            post.author,
            formatDate(post.date)
          ])
        }
      });
      
      // 사용법 안내
      addOutputItem({
        type: 'text',
        content: '\n게시물을 조회하려면 view <게시물ID> 명령어를 사용하세요.\n북마크를 해제하려면 unbookmark <게시물ID> 명령어를 사용하세요.'
      });
    } catch (error) {
      console.error('북마크 목록 조회 오류:', error);
      
      addOutputItem({
        type: 'error',
        content: error instanceof Error ? error.message : '북마크 목록을 불러오는 중 오류가 발생했습니다.'
      });
    }
  }
};

export default BookmarksCommand; 