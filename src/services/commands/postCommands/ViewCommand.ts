/**
 * 게시물 상세 조회 명령어
 * 특정 게시물의 상세 내용과 댓글을 조회합니다.
 */
import { Command, CommandContext } from '../../../types/commands';
import { fetchPostById, fetchCommentsByPostId } from '../../../services/firebase/firestore';
import { OutputItem } from '../../../components/cli/OutputDisplay';

const ViewCommand: Command = {
  name: 'view',
  aliases: ['show', 'read'],
  description: '게시물 상세 내용을 조회합니다.',
  usage: 'view <게시물ID>',
  
  /**
   * 게시물 상세 내용과 댓글을 조회하고 출력합니다.
   * @param context 명령어 실행 컨텍스트
   */
  async execute(context: CommandContext): Promise<void> {
    const { args, addOutputItem } = context;
    
    // 게시물 ID가 제공되지 않은 경우
    if (!args[0]) {
      addOutputItem({
        type: 'error',
        content: '게시물 ID를 입력해주세요. 사용법: view <게시물ID>'
      });
      return;
    }
    
    const postId = args[0];
    
    try {
      // 로딩 메시지 표시
      addOutputItem({
        type: 'text',
        content: '게시물을 불러오는 중입니다...'
      });
      
      // 게시물 상세 정보 가져오기
      const post = await fetchPostById(postId);
      
      // 게시물이 없는 경우
      if (!post) {
        addOutputItem({
          type: 'error',
          content: `ID가 '${postId}'인 게시물을 찾을 수 없습니다.`
        });
        return;
      }
      
      // 게시물 정보 출력
      addOutputItem({
        type: 'text',
        content: `제목: ${post.title}\n` +
                 `작성자: ${post.author.name}\n` +
                 `카테고리: ${post.category}\n` +
                 `작성일: ${new Date(post.date).toLocaleString('ko-KR')}\n` +
                 `태그: ${post.tags.length > 0 ? post.tags.join(', ') : '없음'}`
      });
      
      // 게시물 내용을 마크다운으로 출력
      addOutputItem({
        type: 'markdown',
        content: post.content
      });
      
      // 댓글 목록 가져오기
      addOutputItem({
        type: 'text',
        content: '댓글을 불러오는 중입니다...'
      });
      
      const comments = await fetchCommentsByPostId(postId);
      
      // 댓글 정보 출력
      addOutputItem({
        type: 'text',
        content: `댓글 ${comments.length}개`
      });
      
      if (comments.length === 0) {
        addOutputItem({
          type: 'text',
          content: '아직 댓글이 없습니다.'
        });
      } else {
        // 댓글 목록 출력
        comments.forEach((comment, index) => {
          addOutputItem({
            type: 'text',
            content: `[${index + 1}] ${comment.author.name} (${new Date(comment.date).toLocaleString('ko-KR')})\n${comment.content}`
          });
        });
      }
      
      // 사용 가능한 명령어 안내
      addOutputItem({
        type: 'text',
        content: '\n사용 가능한 명령어:\n' +
                 'comment <게시물ID> <내용> - 댓글 작성\n' +
                 'bookmark <게시물ID> - 북마크 추가'
      });
      
    } catch (error) {
      // 오류 발생 시 오류 메시지 표시
      addOutputItem({
        type: 'error',
        content: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      });
    }
  }
};

export default ViewCommand; 