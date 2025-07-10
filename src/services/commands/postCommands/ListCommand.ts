/**
 * 게시물 목록 조회 명령어
 * 카테고리별 또는 전체 게시물 목록을 조회합니다.
 */
import { Command, CommandContext } from '../../../types/commands';
import { fetchPosts, fetchPostsByCategory } from '../../../services/firebase/firestore';
import { UIPost } from '../../../types';
import { OutputItem, TableOutput } from '../../../components/cli/OutputDisplay';

const ListCommand: Command = {
  name: 'list',
  aliases: ['ls', 'posts'],
  description: '게시물 목록을 조회합니다.',
  usage: 'list [카테고리ID]',
  
  /**
   * 게시물 목록을 조회하고 출력합니다.
   * @param context 명령어 실행 컨텍스트
   */
  async execute(context: CommandContext): Promise<void> {
    const { args, addOutputItem } = context;
    const category = args[0]; // 첫 번째 인자가 카테고리 ID
    
    try {
      // 로딩 메시지 표시
      addOutputItem({
        type: 'text',
        content: '게시물을 불러오는 중입니다...'
      });
      
      // 카테고리 유무에 따라 적절한 함수 호출
      const posts: UIPost[] = category 
        ? await fetchPostsByCategory(category)
        : await fetchPosts();
      
      // 결과 메시지 표시
      addOutputItem({
        type: 'text',
        content: category 
          ? `'${category}' 카테고리의 게시물 ${posts.length}개를 찾았습니다.` 
          : `전체 게시물 ${posts.length}개를 찾았습니다.`
      });
      
      // 게시물이 없는 경우
      if (posts.length === 0) {
        addOutputItem({
          type: 'text',
          content: '표시할 게시물이 없습니다.'
        });
        return;
      }
      
      // 게시물 목록 테이블로 표시
      const tableData: TableOutput = {
        headers: ['ID', '제목', '작성자', '카테고리', '날짜'],
        rows: posts.map(post => [
          post.id,
          post.isNew ? `${post.title} [New]` : post.title,
          post.author.name,
          post.category,
          new Date(post.date).toLocaleDateString('ko-KR')
        ])
      };
      
      addOutputItem({
        type: 'table',
        content: tableData
      });
      
      // 사용법 안내
      addOutputItem({
        type: 'text',
        content: '게시물 상세 조회: view <게시물ID>'
      });
      
    } catch (error) {
      // 오류 발생 시 오류 메시지 표시
      addOutputItem({
        type: 'error',
        content: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
};

export default ListCommand; 