/**
 * 게시물 수정 명령어
 * 특정 게시물의 내용을 수정하는 명령어입니다.
 */
import { Command, CommandContext, InputHandler } from '../../../types/commands';
import { fetchPostById, updatePost, fetchCategoriesFromFirestore } from '../../../services/firebase/firestore';

interface EditState {
  step: 'title' | 'content' | 'category' | 'tags';
  postId: string;
  originalPost: any;
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  availableCategories?: { id: string; name: string }[];
}

const EditCommand: Command = {
  name: 'edit',
  aliases: ['modify', 'update'],
  description: '게시물을 수정합니다.',
  usage: 'edit <게시물ID>',
  requiresAuth: true, // 로그인 필요
  
  /**
   * 게시물 수정 명령어 실행 함수
   * @param context 명령어 실행 컨텍스트
   */
  async execute(context: CommandContext): Promise<InputHandler | void> {
    const { args, addOutputItem, user } = context;
    
    // 로그인 확인
    if (!user) {
      addOutputItem({
        type: 'error',
        content: '게시물을 수정하려면 먼저 로그인해야 합니다. login 명령어를 사용하세요.'
      });
      return;
    }
    
    // 게시물 ID 확인
    if (!args[0]) {
      addOutputItem({
        type: 'error',
        content: '게시물 ID를 입력해주세요. 사용법: edit <게시물ID>'
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
          content: '자신이 작성한 게시물만 수정할 수 있습니다.'
        });
        return;
      }
      
      // 수정 상태 초기화
      const state: EditState = {
        step: 'title',
        postId,
        originalPost: post,
        title: post.title,
        content: post.content,
        category: post.category,
        tags: post.tags || []
      };
      
      // 카테고리 목록 미리 가져오기
      const categories = await fetchCategoriesFromFirestore();
      state.availableCategories = categories;
      
      // 게시물 정보 표시
      addOutputItem({
        type: 'text',
        content: `"${post.title}" 게시물을 수정합니다.`
      });
      
      // 1. 제목 수정
      addOutputItem({
        type: 'text',
        content: `현재 제목: ${post.title}\n새 제목을 입력하세요 (그대로 유지하려면 빈 줄 입력):`
      });
      
      // 제목 입력 처리 함수
      const handleTitleInput: InputHandler = (title: string) => {
        if (title.trim()) {
          state.title = title.trim();
        }
        
        state.step = 'content';
        
        // 2. 내용 수정
        addOutputItem({
          type: 'text',
          content: '현재 내용:'
        });
        
        // 현재 내용 표시
        addOutputItem({
          type: 'markdown',
          content: post.content
        });
        
        addOutputItem({
          type: 'text',
          content: '새 내용을 입력하세요 (마크다운 지원, 그대로 유지하려면 빈 줄 입력):'
        });
        
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
          if (line.trim() === '') {
            // 내용이 입력되지 않은 경우 기존 내용 유지
            if (contentLines.length === 0) {
              return handleContentComplete();
            }
            
            // 입력된 내용이 있는 경우 새 내용으로 설정
            const content = contentLines.join('\n');
            state.content = content;
            return handleContentComplete();
          }
          
          // 줄 추가
          contentLines.push(line);
          return handleContentInput;
        };
        
        return handleContentInput;
      };
      
      // 내용 입력 완료 처리 함수
      const handleContentComplete = () => {
        state.step = 'category';
        
        // 3. 카테고리 수정
        const currentCategory = categories.find(cat => cat.id === post.category);
        
        addOutputItem({
          type: 'text',
          content: `현재 카테고리: ${currentCategory?.name || post.category}`
        });
        
        // 카테고리 목록 표시
        addOutputItem({
          type: 'text',
          content: '카테고리 목록:'
        });
        
        categories.forEach((cat, index) => {
          addOutputItem({
            type: 'text',
            content: `${index + 1}. ${cat.name} (${cat.id})`
          });
        });
        
        addOutputItem({
          type: 'text',
          content: '새 카테고리 번호 또는 ID를 입력하세요 (그대로 유지하려면 빈 줄 입력):'
        });
        
        // 카테고리 입력 처리 함수
        const handleCategoryInput: InputHandler = (input: string) => {
          if (input.trim()) {
            // 번호로 입력한 경우
            if (/^\d+$/.test(input.trim())) {
              const index = parseInt(input.trim()) - 1;
              if (index >= 0 && index < categories.length) {
                state.category = categories[index].id;
              } else {
                addOutputItem({
                  type: 'error',
                  content: '유효하지 않은 카테고리 번호입니다. 기존 카테고리를 유지합니다.'
                });
              }
            } 
            // ID로 입력한 경우
            else {
              const category = categories.find(cat => cat.id === input.trim());
              if (category) {
                state.category = category.id;
              } else {
                addOutputItem({
                  type: 'error',
                  content: '유효하지 않은 카테고리 ID입니다. 기존 카테고리를 유지합니다.'
                });
              }
            }
          }
          
          state.step = 'tags';
          
          // 4. 태그 수정
          const currentTags = post.tags && post.tags.length > 0 ? post.tags.join(', ') : '없음';
          
          addOutputItem({
            type: 'text',
            content: `현재 태그: ${currentTags}`
          });
          
          addOutputItem({
            type: 'text',
            content: '새 태그를 입력하세요 (쉼표로 구분, 그대로 유지하려면 빈 줄 입력):'
          });
          
          // 태그 입력 처리 함수 등록
          return handleTagsInput;
        };
        
        return handleCategoryInput;
      };
      
      // 태그 입력 처리 함수
      const handleTagsInput: InputHandler = (tagsInput: string) => {
        if (tagsInput.trim()) {
          // 태그 처리 (쉼표로 구분하여 배열로 변환)
          const tags = tagsInput.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
          
          state.tags = tags;
        }
        
        // 게시물 수정 최종 확인
        addOutputItem({
          type: 'text',
          content: '다음 내용으로 게시물을 수정합니다:'
        });
        
        const categoryName = state.availableCategories?.find(cat => cat.id === state.category)?.name || state.category;
        
        addOutputItem({
          type: 'text',
          content: `제목: ${state.title}\n` +
                   `카테고리: ${categoryName}\n` +
                   `태그: ${state.tags && state.tags.length > 0 ? state.tags.join(', ') : '없음'}\n` +
                   `내용 길이: ${state.content?.length || 0}자`
        });
        
        // 내용 미리보기 표시
        addOutputItem({
          type: 'markdown',
          content: `### 내용 미리보기\n\n${state.content}`
        });
        
        addOutputItem({
          type: 'text',
          content: '게시물을 수정하시겠습니까? (y/n)'
        });
        
        // 확인 입력 처리 함수 등록
        return handleConfirmation;
      };
      
      // 확인 입력 처리 함수
      const handleConfirmation: InputHandler = async (confirmation: string) => {
        if (confirmation.trim().toLowerCase() !== 'y') {
          addOutputItem({
            type: 'text',
            content: '게시물 수정이 취소되었습니다.'
          });
          return;
        }
        
        try {
          // 게시물 수정 처리
          addOutputItem({
            type: 'text',
            content: '게시물을 수정하는 중입니다...'
          });
          
          // 게시물 데이터 준비
          const postData = {
            title: state.title,
            content: state.content,
            category: state.category,
            tags: state.tags
          };
          
          // Firestore에 게시물 수정
          await updatePost(postId, postData, user.uid);
          
          // 성공 메시지 표시
          addOutputItem({
            type: 'text',
            content: '게시물이 성공적으로 수정되었습니다!'
          });
          
          // 게시물 보기 명령어 안내
          addOutputItem({
            type: 'text',
            content: `수정된 게시물 보기: view ${postId}`
          });
          
        } catch (error) {
          addOutputItem({
            type: 'error',
            content: error instanceof Error ? error.message : '게시물 수정 중 오류가 발생했습니다.'
          });
        }
      };
      
      // 첫 번째 입력 핸들러 등록 (제목 수정)
      return handleTitleInput;
      
    } catch (error) {
      addOutputItem({
        type: 'error',
        content: error instanceof Error ? error.message : '게시물 수정 중 오류가 발생했습니다.'
      });
    }
  }
};

export default EditCommand; 