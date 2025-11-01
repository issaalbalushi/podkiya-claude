import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CurrentClip {
  id: string;
  title: string;
  audioUrl: string;
}

interface Checkpoint {
  clipId: string;
  checkpoint: '30s' | '60s' | '90s' | 'complete';
  timestamp: number;
}

interface PlayerState {
  currentClip: CurrentClip | null;
  isPlaying: boolean;
  volume: number;
  playbackRate: number;
  checkpoints: Checkpoint[];

  setCurrentClip: (clip: CurrentClip | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  recordCheckpoint: (clipId: string, checkpoint: '30s' | '60s' | '90s' | 'complete') => void;
  hasReachedCheckpoint: (clipId: string, checkpoint: string) => boolean;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentClip: null,
      isPlaying: false,
      volume: 1,
      playbackRate: 1,
      checkpoints: [],

      setCurrentClip: (clip) => set({ currentClip: clip }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setVolume: (volume) => set({ volume }),
      setPlaybackRate: (rate) => set({ playbackRate: rate }),

      recordCheckpoint: (clipId, checkpoint) => {
        const { checkpoints } = get();
        const exists = checkpoints.some(
          (c) => c.clipId === clipId && c.checkpoint === checkpoint
        );

        if (!exists) {
          set({
            checkpoints: [
              ...checkpoints,
              { clipId, checkpoint, timestamp: Date.now() },
            ],
          });
        }
      },

      hasReachedCheckpoint: (clipId, checkpoint) => {
        const { checkpoints } = get();
        return checkpoints.some(
          (c) => c.clipId === clipId && c.checkpoint === checkpoint
        );
      },
    }),
    {
      name: 'podkiya-player',
    }
  )
);
