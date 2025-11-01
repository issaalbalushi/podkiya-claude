import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Comment {
  id: string;
  clipId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: number;
}

interface SocialState {
  // Likes
  likedClips: Set<string>;
  toggleLike: (clipId: string) => void;
  isLiked: (clipId: string) => boolean;

  // Saves
  savedClips: Set<string>;
  toggleSave: (clipId: string) => void;
  isSaved: (clipId: string) => boolean;

  // Follows
  followedCreators: Set<string>;
  toggleFollow: (creatorId: string) => void;
  isFollowing: (creatorId: string) => boolean;

  // Comments
  comments: Comment[];
  addComment: (clipId: string, text: string, userId: string, userName: string, userAvatar?: string) => void;
  getComments: (clipId: string) => Comment[];
  getCommentCount: (clipId: string) => number;

  // Session tracking
  sessionStartTime: number | null;
  sessionClipsCompleted: number;
  startSession: () => void;
  endSession: () => void;
  incrementSessionClips: () => void;
  getSessionDuration: () => number;
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      // Likes
      likedClips: new Set<string>(),
      toggleLike: (clipId: string) => {
        const likedClips = new Set(get().likedClips);
        if (likedClips.has(clipId)) {
          likedClips.delete(clipId);
        } else {
          likedClips.add(clipId);
        }
        set({ likedClips });
      },
      isLiked: (clipId: string) => get().likedClips.has(clipId),

      // Saves
      savedClips: new Set<string>(),
      toggleSave: (clipId: string) => {
        const savedClips = new Set(get().savedClips);
        if (savedClips.has(clipId)) {
          savedClips.delete(clipId);
        } else {
          savedClips.add(clipId);
        }
        set({ savedClips });
      },
      isSaved: (clipId: string) => get().savedClips.has(clipId),

      // Follows
      followedCreators: new Set<string>(),
      toggleFollow: (creatorId: string) => {
        const followedCreators = new Set(get().followedCreators);
        if (followedCreators.has(creatorId)) {
          followedCreators.delete(creatorId);
        } else {
          followedCreators.add(creatorId);
        }
        set({ followedCreators });
      },
      isFollowing: (creatorId: string) => get().followedCreators.has(creatorId),

      // Comments
      comments: [],
      addComment: (clipId: string, text: string, userId: string, userName: string, userAvatar?: string) => {
        const newComment: Comment = {
          id: `${Date.now()}-${Math.random()}`,
          clipId,
          userId,
          userName,
          userAvatar,
          text,
          timestamp: Date.now(),
        };
        set({ comments: [...get().comments, newComment] });
      },
      getComments: (clipId: string) => {
        return get().comments.filter((c) => c.clipId === clipId);
      },
      getCommentCount: (clipId: string) => {
        return get().comments.filter((c) => c.clipId === clipId).length;
      },

      // Session tracking
      sessionStartTime: null,
      sessionClipsCompleted: 0,
      startSession: () => {
        set({ sessionStartTime: Date.now(), sessionClipsCompleted: 0 });
      },
      endSession: () => {
        set({ sessionStartTime: null, sessionClipsCompleted: 0 });
      },
      incrementSessionClips: () => {
        set({ sessionClipsCompleted: get().sessionClipsCompleted + 1 });
      },
      getSessionDuration: () => {
        const { sessionStartTime } = get();
        if (!sessionStartTime) return 0;
        return Math.floor((Date.now() - sessionStartTime) / 1000); // seconds
      },
    }),
    {
      name: 'podkiya-social',
      // Custom serialization for Sets
      partialize: (state) => ({
        likedClips: Array.from(state.likedClips),
        savedClips: Array.from(state.savedClips),
        followedCreators: Array.from(state.followedCreators),
        comments: state.comments,
      }),
      // Custom deserialization for Sets
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.likedClips = new Set(state.likedClips as unknown as string[]);
          state.savedClips = new Set(state.savedClips as unknown as string[]);
          state.followedCreators = new Set(state.followedCreators as unknown as string[]);
        }
      },
    }
  )
);
