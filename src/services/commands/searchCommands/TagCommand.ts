/**
 * 태그 명령어
 * 특정 태그가 포함된 게시물을 검색합니다.
 */
import { Command, CommandContext } from '../../../types/commands';
import { fetchPostsByTag, fetchPosts } from '../../../services/firebase/firestore';

const TagCommand: Command = {
  name: 'tag',
  aliases: ['tags', 'tag-search'],
  description: '특정 태그가 포함된 게시물을 검색합니다.',
  usage: 'tag <태그명>',
  
  /**
   * 태그 명령어 실행 함수
   * @param context 명령어 실행 컨텍스트
   */
  async execute(context: CommandContext): Promise<void> {
    const { args, addOutputItem } = context;
    
    // 태그 이름이 없는 경우 모든 태그 목록 표시
    if (!args[0]) {
      try {
        addOutputItem({
          type: 'text',
          content: '모든 태그 목록을 가져오는 중...'
        });
        
        // 모든 게시물에서 태그 추출
        const allPosts = await fetchPosts();
        const tagCounts = new Map<string, number>();
        
        // 각 게시물의 태그를 카운트
        allPosts.forEach(post => {
          if (post.tags && post.tags.length > 0) {
            post.tags.forEach(tag => {
              const count = tagCounts.get(tag) || 0;
              tagCounts.set(tag, count + 1);
            });
          }
        });
        
        // 태그가 없는 경우
        if (tagCounts.size === 0) {
          addOutputItem({
            type: 'text',
            content: '현재 등록된 태그가 없습니다.'
          });
          return;
        }
        
        // 태그 목록을 배열로 변환하고 사용 빈도순으로 정렬
        const sortedTags = Array.from(tagCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([tag, count]) => [tag, count.toString()]);
        
        // 태그 목록 표시
        addOutputItem({
          type: 'text',
          content: `총 ${tagCounts.size}개의 태그가 있습니다.`
        });
        
        // 테이블 형식으로 태그 목록 표시
        addOutputItem({
          type: 'table',
          content: {
            headers: ['태그', '게시물 수'],
            rows: sortedTags
          }
        });
        
        // 태그 검색 안내
        addOutputItem({
          type: 'text',
          content: '\n특정 태그로 게시물을 검색하려면: tag <태그명>'
        });
        
        return;
      } catch (error) {
        addOutputItem({
          type: 'error',
          content: error instanceof Error ? error.message : '태그 목록을 가져오는 중 오류가 발생했습니다.'
        });
        return;
      }
    }
    
    // 특정 태그로 검색
    const tagName = args[0].toLowerCase();
    
    try {
      // 검색 중 메시지
      addOutputItem({
        type: 'text',
        content: `"${tagName}" 태그 검색 중...`
      });
      
      // 태그로 게시물 검색
      const taggedPosts = await fetchPostsByTag(tagName);
      
      // 검색 결과가 없는 경우
      if (taggedPosts.length === 0) {
        addOutputItem({
          type: 'text',
          content: `"${tagName}" 태그를 가진 게시물이 없습니다.`
        });
        return;
      }
      
      // 검색 결과 표시
      addOutputItem({
        type: 'text',
        content: `"${tagName}" 태그 검색 결과: ${taggedPosts.length}개의 게시물을 찾았습니다.`
      });
      
      // 테이블 형식으로 결과 표시
      addOutputItem({
        type: 'table',
        content: {
          headers: ['ID', '제목', '작성자', '날짜'],
          rows: taggedPosts.map(post => [
            post.id,
            post.title,
            post.author.name,
            formatDate(post.date)
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
        content: error instanceof Error ? error.message : '태그 검색 중 오류가 발생했습니다.'
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

export default TagCommand; 