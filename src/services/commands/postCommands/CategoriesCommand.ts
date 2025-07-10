/**
 * 카테고리 목록 조회 명령어
 * 게시판의 모든 카테고리 목록을 조회합니다.
 */
import { Command, CommandContext } from '../../../types/commands';
import { fetchCategoriesFromFirestore } from '../../../services/firebase/firestore';
import { OutputItem, TableOutput } from '../../../components/cli/OutputDisplay';

const CategoriesCommand: Command = {
  name: 'categories',
  aliases: ['category', 'cat'],
  description: '게시판 카테고리 목록을 조회합니다.',
  usage: 'categories',
  
  /**
   * 카테고리 목록을 조회하고 출력합니다.
   * @param context 명령어 실행 컨텍스트
   */
  async execute(context: CommandContext): Promise<void> {
    const { addOutputItem } = context;
    
    try {
      // 로딩 메시지 표시
      addOutputItem({
        type: 'text',
        content: '카테고리 목록을 불러오는 중입니다...'
      });
      
      // Firestore에서 카테고리 목록 가져오기
      const categories = await fetchCategoriesFromFirestore();
      
      // 결과 메시지 표시
      addOutputItem({
        type: 'text',
        content: `총 ${categories.length}개의 카테고리가 있습니다.`
      });
      
      if (categories.length === 0) {
        addOutputItem({
          type: 'text',
          content: '표시할 카테고리가 없습니다.'
        });
        return;
      }
      
      // 카테고리 목록 테이블로 표시
      const tableData: TableOutput = {
        headers: ['ID', '이름', '아이콘'],
        rows: categories.map(cat => [
          cat.id,
          cat.name,
          cat.icon || '-'
        ])
      };
      
      addOutputItem({
        type: 'table',
        content: tableData
      });
      
      // 사용법 안내
      addOutputItem({
        type: 'text',
        content: '특정 카테고리의 게시물 조회: list <카테고리ID>'
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

export default CategoriesCommand; 