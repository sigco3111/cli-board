/**
 * 게시물 작성 명령어
 * 새 게시물을 작성하는 명령어입니다.
 */
import { Command, CommandContext, InputHandler } from '../../../types/commands';
import { createPost } from '../../../services/firebase/firestore';
import { fetchCategoriesFromFirestore } from '../../../services/firebase/firestore';

interface WriteState {
  step: 'category' | 'title' | 'content' | 'tags';
  category?: string;
  title?: string;
  content?: string;
  tags?: string[];
  availableCategories?: { id: string; name: string }[];
}

const WriteCommand: Command = {
  name: 'write',
  aliases: ['post', 'create'],
  description: '새 게시물을 작성합니다.',
  usage: 'write',
  requiresAuth: true, // 로그인 필요
  
  /**
   * 게시물 작성 명령어 실행 함수
   * @param context 명령어 실행 컨텍스트
   */
  async execute(context: CommandContext): Promise<InputHandler | void> {
    const { addOutputItem, user } = context;
    
    // 로그인 확인
    if (!user) {
      addOutputItem({
        type: 'error',
        content: '게시물을 작성하려면 먼저 로그인해야 합니다. login 명령어를 사용하세요.'
      });
      return;
    }
    
    // 작성 상태 초기화
    const state: WriteState = {
      step: 'category'
    };
    
    try {
      // 1. 카테고리 선택
      addOutputItem({
        type: 'text',
        content: '카테고리를 불러오는 중입니다...'
      });
      
      // 카테고리 목록 가져오기
      const categories = await fetchCategoriesFromFirestore();
      state.availableCategories = categories;
      
      // 카테고리 목록 표시
      addOutputItem({
        type: 'text',
        content: '게시물을 작성할 카테고리를 선택하세요:'
      });
      
      categories.forEach((cat, index) => {
        addOutputItem({
          type: 'text',
          content: `${index + 1}. ${cat.name} (${cat.id})`
        });
      });
      
      // 카테고리 입력 받기
      addOutputItem({
        type: 'text',
        content: '카테고리 번호 또는 ID를 입력하세요 (기본값: general):'
      });
      
      // 카테고리 선택 처리 함수
      const handleCategorySelection: InputHandler = async (input: string) => {
        let selectedCategory = 'general'; // 기본값
        
        if (input.trim()) {
          // 번호로 입력한 경우
          if (/^\d+$/.test(input.trim())) {
            const index = parseInt(input.trim()) - 1;
            if (index >= 0 && index < categories.length) {
              selectedCategory = categories[index].id;
            } else {
              addOutputItem({
                type: 'error',
                content: '유효하지 않은 카테고리 번호입니다. 기본 카테고리(general)로 설정합니다.'
              });
            }
          } 
          // ID로 입력한 경우
          else {
            const category = categories.find(cat => cat.id === input.trim());
            if (category) {
              selectedCategory = category.id;
            } else {
              addOutputItem({
                type: 'error',
                content: '유효하지 않은 카테고리 ID입니다. 기본 카테고리(general)로 설정합니다.'
              });
            }
          }
        }
        
        state.category = selectedCategory;
        state.step = 'title';
        
        // 선택한 카테고리 표시
        const categoryName = categories.find(cat => cat.id === selectedCategory)?.name || selectedCategory;
        addOutputItem({
          type: 'text',
          content: `선택한 카테고리: ${categoryName} (${selectedCategory})`
        });
        
        // 2. 제목 입력 받기
        addOutputItem({
          type: 'text',
          content: '게시물 제목을 입력하세요:'
        });
        
        // 제목 입력 처리 함수 등록
        return handleTitleInput;
      };
      
      // 제목 입력 처리 함수
      const handleTitleInput: InputHandler = (title: string) => {
        if (!title.trim()) {
          addOutputItem({
            type: 'error',
            content: '제목을 입력해주세요.'
          });
          return handleTitleInput; // 다시 입력 받기
        }
        
        state.title = title.trim();
        state.step = 'content';
        
        // 3. 내용 입력 받기
        addOutputItem({
          type: 'text',
          content: '게시물 내용을 입력하세요 (마크다운 지원):'
        });
        
        // 내용 입력 안내
        addOutputItem({
          type: 'text',
          content: '여러 줄 입력이 가능합니다. 입력을 마치려면 빈 줄에서 Enter를 누르세요.'
        });
        
        // 마크다운 도움말
        addOutputItem({
          type: 'text',
          content: '마크다운 문법: # 제목, ## 부제목, **굵게**, *기울임*, `코드`, [링크](URL), ![이미지](URL), - 목록, 1. 번호 목록, > 인용, ```코드 블록```'
        });
        
        // 내용 입력 처리 함수 등록
        let contentLines: string[] = [];
        
        // 내용 입력 처리 함수
        const handleContentInput: InputHandler = (line: string) => {
          // 빈 줄이면 입력 종료
          if (line.trim() === '' && contentLines.length > 0) {
            const content = contentLines.join('\n');
            return handleContentComplete(content);
          }
          
          // 줄 추가
          contentLines.push(line);
          return handleContentInput;
        };
        
        return handleContentInput;
      };
      
      // 내용 입력 완료 처리 함수
      const handleContentComplete = (content: string) => {
        if (!content.trim()) {
          addOutputItem({
            type: 'error',
            content: '내용을 입력해주세요.'
          });
          // 내용 입력 다시 시작
          let contentLines: string[] = [];
          const handleContentInput: InputHandler = (line: string) => {
            if (line.trim() === '' && contentLines.length > 0) {
              const content = contentLines.join('\n');
              return handleContentComplete(content);
            }
            contentLines.push(line);
            return handleContentInput;
          };
          return handleContentInput;
        }
        
        state.content = content;
        state.step = 'tags';
        
        // 4. 태그 입력 받기
        addOutputItem({
          type: 'text',
          content: '태그를 입력하세요 (쉼표로 구분, 예: 태그1,태그2,태그3):'
        });
        
        // 태그 입력 처리 함수 등록
        return handleTagsInput;
      };
      
      // 태그 입력 처리 함수
      const handleTagsInput: InputHandler = async (tagsInput: string) => {
        // 태그 처리 (쉼표로 구분하여 배열로 변환)
        const tags = tagsInput.split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
        
        state.tags = tags;
        
        // 게시물 작성 최종 확인
        addOutputItem({
          type: 'text',
          content: '다음 내용으로 게시물을 작성합니다:'
        });
        
        addOutputItem({
          type: 'text',
          content: `카테고리: ${state.availableCategories?.find(cat => cat.id === state.category)?.name || state.category}\n` +
                   `제목: ${state.title}\n` +
                   `태그: ${tags.length > 0 ? tags.join(', ') : '없음'}\n` +
                   `내용 길이: ${state.content?.length || 0}자`
        });
        
        // 내용 미리보기 표시
        addOutputItem({
          type: 'markdown',
          content: `### 내용 미리보기\n\n${state.content}`
        });
        
        addOutputItem({
          type: 'text',
          content: '게시물을 저장하시겠습니까? (y/n)'
        });
        
        // 확인 입력 처리 함수 등록
        return handleConfirmation;
      };
      
      // 확인 입력 처리 함수
      const handleConfirmation: InputHandler = async (confirmation: string) => {
        if (confirmation.trim().toLowerCase() !== 'y') {
          addOutputItem({
            type: 'text',
            content: '게시물 작성이 취소되었습니다.'
          });
          return;
        }
        
        try {
          // 게시물 저장 처리
          addOutputItem({
            type: 'text',
            content: '게시물을 저장하는 중입니다...'
          });
          
          // 게시물 데이터 준비
          const postData = {
            title: state.title!,
            content: state.content!,
            category: state.category!,
            tags: state.tags || [],
            author: {
              name: user.displayName || '익명'
            },
            authorId: user.uid
          };
          
          // Firestore에 게시물 저장
          const postId = await createPost(postData);
          
          // 성공 메시지 표시
          addOutputItem({
            type: 'text',
            content: `게시물이 성공적으로 작성되었습니다! (ID: ${postId})`
          });
          
          // 게시물 보기 명령어 안내
          addOutputItem({
            type: 'text',
            content: `작성한 게시물 보기: view ${postId}`
          });
          
        } catch (error) {
          addOutputItem({
            type: 'error',
            content: error instanceof Error ? error.message : '게시물 저장 중 오류가 발생했습니다.'
          });
        }
      };
      
      // 첫 번째 입력 핸들러 등록 (카테고리 선택)
      return handleCategorySelection;
      
    } catch (error) {
      addOutputItem({
        type: 'error',
        content: error instanceof Error ? error.message : '게시물 작성 중 오류가 발생했습니다.'
      });
    }
  }
};

export default WriteCommand; 