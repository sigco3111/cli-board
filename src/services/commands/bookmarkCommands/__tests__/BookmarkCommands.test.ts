/**
 * 북마크 명령어 테스트
 * 북마크 추가, 제거, 조회 명령어를 테스트합니다.
 */
import BookmarkCommand from '../BookmarkCommand';
import UnbookmarkCommand from '../UnbookmarkCommand';
import BookmarksCommand from '../BookmarksCommand';
import { CommandContext } from '../../../../types/commands';
import * as firestore from '../../../firebase/firestore';

// firestore 모듈 모킹
jest.mock('../../../firebase/firestore', () => ({
  fetchPostById: jest.fn(),
  addBookmark: jest.fn(),
  removeBookmark: jest.fn(),
  isBookmarked: jest.fn(),
  fetchBookmarkedPosts: jest.fn()
}));

describe('BookmarkCommand', () => {
  // 테스트 전에 모든 모의 함수 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockContext: CommandContext = {
    args: ['post123'],
    user: {
      uid: 'user123',
      displayName: '테스트 사용자',
      isAnonymous: false
    },
    addOutputItem: jest.fn()
  };

  test('로그인하지 않은 경우 오류 메시지 표시', async () => {
    await BookmarkCommand.execute({
      ...mockContext,
      user: null
    });

    expect(mockContext.addOutputItem).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        content: expect.stringContaining('로그인이 필요합니다')
      })
    );
  });

  test('게스트(익명) 사용자인 경우 오류 메시지 표시', async () => {
    await BookmarkCommand.execute({
      ...mockContext,
      user: { ...mockContext.user, isAnonymous: true }
    });

    expect(mockContext.addOutputItem).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        content: expect.stringContaining('게스트는 북마크 기능을 사용할 수 없습니다')
      })
    );
  });

  test('게시물 ID가 없는 경우 오류 메시지 표시', async () => {
    await BookmarkCommand.execute({
      ...mockContext,
      args: []
    });

    expect(mockContext.addOutputItem).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        content: expect.stringContaining('게시물 ID를 입력해주세요')
      })
    );
  });

  test('존재하지 않는 게시물인 경우 오류 메시지 표시', async () => {
    (firestore.fetchPostById as jest.Mock).mockResolvedValue(null);

    await BookmarkCommand.execute(mockContext);

    expect(firestore.fetchPostById).toHaveBeenCalledWith('post123');
    expect(mockContext.addOutputItem).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        content: expect.stringContaining('찾을 수 없습니다')
      })
    );
  });

  test('북마크 추가 성공', async () => {
    (firestore.fetchPostById as jest.Mock).mockResolvedValue({
      id: 'post123',
      title: '테스트 게시물'
    });
    (firestore.addBookmark as jest.Mock).mockResolvedValue('bookmark123');

    await BookmarkCommand.execute(mockContext);

    expect(firestore.fetchPostById).toHaveBeenCalledWith('post123');
    expect(firestore.addBookmark).toHaveBeenCalledWith('user123', 'post123');
    expect(mockContext.addOutputItem).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'text',
        content: expect.stringContaining('북마크에 추가했습니다')
      })
    );
  });

  test('이미 북마크된 게시물인 경우 메시지 표시', async () => {
    (firestore.fetchPostById as jest.Mock).mockResolvedValue({
      id: 'post123',
      title: '테스트 게시물'
    });
    (firestore.addBookmark as jest.Mock).mockRejectedValue(
      new Error('이미 북마크된 게시물입니다')
    );

    await BookmarkCommand.execute(mockContext);

    expect(firestore.fetchPostById).toHaveBeenCalledWith('post123');
    expect(firestore.addBookmark).toHaveBeenCalledWith('user123', 'post123');
    expect(mockContext.addOutputItem).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'text',
        content: expect.stringContaining('이미 북마크에 추가된 게시물입니다')
      })
    );
  });
});

describe('UnbookmarkCommand', () => {
  // 테스트 전에 모든 모의 함수 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockContext: CommandContext = {
    args: ['post123'],
    user: {
      uid: 'user123',
      displayName: '테스트 사용자',
      isAnonymous: false
    },
    addOutputItem: jest.fn()
  };

  test('로그인하지 않은 경우 오류 메시지 표시', async () => {
    await UnbookmarkCommand.execute({
      ...mockContext,
      user: null
    });

    expect(mockContext.addOutputItem).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        content: expect.stringContaining('로그인이 필요합니다')
      })
    );
  });

  test('게스트(익명) 사용자인 경우 오류 메시지 표시', async () => {
    await UnbookmarkCommand.execute({
      ...mockContext,
      user: { ...mockContext.user, isAnonymous: true }
    });

    expect(mockContext.addOutputItem).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        content: expect.stringContaining('게스트는 북마크 기능을 사용할 수 없습니다')
      })
    );
  });

  test('게시물 ID가 없는 경우 오류 메시지 표시', async () => {
    await UnbookmarkCommand.execute({
      ...mockContext,
      args: []
    });

    expect(mockContext.addOutputItem).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        content: expect.stringContaining('게시물 ID를 입력해주세요')
      })
    );
  });

  test('존재하지 않는 게시물인 경우 오류 메시지 표시', async () => {
    (firestore.fetchPostById as jest.Mock).mockResolvedValue(null);

    await UnbookmarkCommand.execute(mockContext);

    expect(firestore.fetchPostById).toHaveBeenCalledWith('post123');
    expect(mockContext.addOutputItem).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        content: expect.stringContaining('찾을 수 없습니다')
      })
    );
  });

  test('북마크되지 않은 게시물인 경우 메시지 표시', async () => {
    (firestore.fetchPostById as jest.Mock).mockResolvedValue({
      id: 'post123',
      title: '테스트 게시물'
    });
    (firestore.isBookmarked as jest.Mock).mockResolvedValue(false);

    await UnbookmarkCommand.execute(mockContext);

    expect(firestore.fetchPostById).toHaveBeenCalledWith('post123');
    expect(firestore.isBookmarked).toHaveBeenCalledWith('user123', 'post123');
    expect(mockContext.addOutputItem).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'text',
        content: expect.stringContaining('북마크에 추가되어 있지 않습니다')
      })
    );
  });

  test('북마크 해제 성공', async () => {
    (firestore.fetchPostById as jest.Mock).mockResolvedValue({
      id: 'post123',
      title: '테스트 게시물'
    });
    (firestore.isBookmarked as jest.Mock).mockResolvedValue(true);
    (firestore.removeBookmark as jest.Mock).mockResolvedValue(undefined);

    await UnbookmarkCommand.execute(mockContext);

    expect(firestore.fetchPostById).toHaveBeenCalledWith('post123');
    expect(firestore.isBookmarked).toHaveBeenCalledWith('user123', 'post123');
    expect(firestore.removeBookmark).toHaveBeenCalledWith('user123', 'post123');
    expect(mockContext.addOutputItem).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'text',
        content: expect.stringContaining('북마크에서 제거했습니다')
      })
    );
  });
});

describe('BookmarksCommand', () => {
  // 테스트 전에 모든 모의 함수 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockContext: CommandContext = {
    args: [],
    user: {
      uid: 'user123',
      displayName: '테스트 사용자',
      isAnonymous: false
    },
    addOutputItem: jest.fn()
  };

  test('로그인하지 않은 경우 오류 메시지 표시', async () => {
    await BookmarksCommand.execute({
      ...mockContext,
      user: null
    });

    expect(mockContext.addOutputItem).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        content: expect.stringContaining('로그인이 필요합니다')
      })
    );
  });

  test('게스트(익명) 사용자인 경우 오류 메시지 표시', async () => {
    await BookmarksCommand.execute({
      ...mockContext,
      user: { ...mockContext.user, isAnonymous: true }
    });

    expect(mockContext.addOutputItem).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        content: expect.stringContaining('게스트는 북마크 기능을 사용할 수 없습니다')
      })
    );
  });

  test('북마크된 게시물이 없는 경우 메시지 표시', async () => {
    (firestore.fetchBookmarkedPosts as jest.Mock).mockResolvedValue([]);

    await BookmarksCommand.execute(mockContext);

    expect(firestore.fetchBookmarkedPosts).toHaveBeenCalledWith('user123');
    expect(mockContext.addOutputItem).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'text',
        content: expect.stringContaining('북마크한 게시물이 없습니다')
      })
    );
  });

  test('북마크 목록 조회 성공', async () => {
    const mockPosts = [
      {
        id: 'post123',
        title: '테스트 게시물 1',
        author: '작성자 1',
        date: new Date('2023-01-01')
      },
      {
        id: 'post456',
        title: '테스트 게시물 2',
        author: '작성자 2',
        date: new Date('2023-01-02')
      }
    ];
    (firestore.fetchBookmarkedPosts as jest.Mock).mockResolvedValue(mockPosts);

    await BookmarksCommand.execute(mockContext);

    expect(firestore.fetchBookmarkedPosts).toHaveBeenCalledWith('user123');
    expect(mockContext.addOutputItem).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'table',
        content: expect.objectContaining({
          headers: ['ID', '제목', '작성자', '작성일'],
          rows: expect.any(Array)
        })
      })
    );
    // 사용법 안내도 표시되는지 확인
    expect(mockContext.addOutputItem).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'text',
        content: expect.stringContaining('view <게시물ID>')
      })
    );
  });
}); 