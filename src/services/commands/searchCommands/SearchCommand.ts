/**
 * 검색 명령어
 * 게시물 제목, 내용, 작성자 등을 검색합니다.
 */
import { Command, CommandContext } from '../../../types/commands';
import { fetchPosts } from '../../../services/firebase/firestore';
import { UIPost } from '../../../types';

const SearchCommand: Command = {
  name: 'search',
  aliases: ['find', 'lookup'],
  description: '게시물을 검색합니다.',
  usage: 'search <검색어>',
  
  /**
   * 검색 명령어 실행 함수
   * @param context 명령어 실행 컨텍스트
   */
  async execute(context: CommandContext): Promise<void> {
    const { args, addOutputItem } = context;
    
    // 검색어 확인
    if (!args[0]) {
      addOutputItem({
        type: 'error',
        content: '검색어를 입력해주세요. 사용법: search <검색어>'
      });
      return;
    }
    
    const searchTerm = args.join(' ').toLowerCase();
    
    try {
      // 검색 중 메시지
      addOutputItem({
        type: 'text',
        content: `"${searchTerm}" 검색 중...`
      });
      
      // 모든 게시물 가져오기
      const allPosts = await fetchPosts();
      
      // 클라이언트 측 검색 (Firestore에서는 전체 텍스트 검색이 제한적)
      const filteredPosts = allPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.author.name.toLowerCase().includes(searchTerm) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
      
      // 검색 결과가 없는 경우
      if (filteredPosts.length === 0) {
        addOutputItem({
          type: 'text',
          content: `"${searchTerm}"에 대한 검색 결과가 없습니다.`
        });
        
        // 검색 팁 제공
        addOutputItem({
          type: 'text',
          content: '검색 팁: 다른 검색어를 시도하거나, 태그로 검색하려면 tag 명령어를 사용해보세요.'
        });
        return;
      }
      
      // 검색 결과 표시
      addOutputItem({
        type: 'text',
        content: `"${searchTerm}" 검색 결과: ${filteredPosts.length}개의 게시물을 찾았습니다.`
      });
      
      // 테이블 형식으로 결과 표시
      addOutputItem({
        type: 'table',
        content: {
          headers: ['ID', '제목', '작성자', '날짜', '태그'],
          rows: filteredPosts.map(post => [
            post.id,
            post.title,
            post.author.name,
            formatDate(post.date),
            post.tags ? post.tags.join(', ') : ''
          ])
        }
      });
      
      // 게시물 상세 보기 안내
      addOutputItem({
        type: 'text',
        content: '\n게시물을 자세히 보려면 view 명령어를 사용하세요: view <게시물ID>'
      });
      
    } catch (error) {
      addOutputItem({
        type: 'error',
        content: error instanceof Error ? error.message : '검색 중 오류가 발생했습니다.'
      });
    }
  }
};

/**
 * 날짜 포맷팅 함수
 * @param dateStr ISO 형식의 날짜 문자열
 * @returns 포맷팅된 날짜 문자열
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
}

export default SearchCommand; 