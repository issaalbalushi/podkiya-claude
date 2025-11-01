'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatDuration } from '@podkiya/core';
import { usePlayerStore } from '@/lib/store/player-store';
import { motion } from 'framer-motion';
import WaveSurfer from 'wavesurfer.js';

interface AudioPlayerProps {
  clipId: string;
  audioUrl: string;
  title: string;
  onComplete?: () => void;
}

export function AudioPlayer({
  clipId,
  audioUrl,
  title,
  onComplete,
}: AudioPlayerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const { setCurrentClip, recordCheckpoint, playbackRate, setPlaybackRate, setIsPlaying: setGlobalPlaying } =
    usePlayerStore();

  useEffect(() => {
    if (!waveformRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'rgba(168, 85, 247, 0.4)',
      progressColor: 'rgba(124, 58, 237, 1)',
      cursorColor: '#a855f7',
      barWidth: 3,
      barRadius: 3,
      cursorWidth: 2,
      height: 120,
      barGap: 3,
      responsive: true,
    });

    wavesurfer.current.load(audioUrl);

    wavesurfer.current.on('ready', () => {
      setDuration(wavesurfer.current!.getDuration());
    });

    wavesurfer.current.on('audioprocess', () => {
      const time = wavesurfer.current!.getCurrentTime();
      setCurrentTime(time);

      // Track checkpoints
      if (time >= 30 && time < 31) recordCheckpoint(clipId, '30s');
      if (time >= 60 && time < 61) recordCheckpoint(clipId, '60s');
      if (time >= 90 && time < 91) recordCheckpoint(clipId, '90s');
    });

    wavesurfer.current.on('finish', () => {
      setIsPlaying(false);
      setGlobalPlaying(false);
      recordCheckpoint(clipId, 'complete');
      onComplete?.();
    });

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [audioUrl, clipId]);

  const togglePlay = () => {
    wavesurfer.current?.playPause();
    const playing = !isPlaying;
    setIsPlaying(playing);
    setGlobalPlaying(playing);

    if (playing) {
      setCurrentClip({ id: clipId, title, audioUrl });
    }
  };

  const changeSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];

    setPlaybackRate(nextSpeed);
    wavesurfer.current?.setPlaybackRate(nextSpeed);
  };

  const skip = (seconds: number) => {
    if (wavesurfer.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      wavesurfer.current.seekTo(newTime / duration);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    wavesurfer.current?.setVolume(newVolume);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6 p-6 bg-card rounded-3xl border shadow-lg"
    >
      {/* Waveform */}
      <div ref={waveformRef} className="w-full rounded-lg overflow-hidden" />

      {/* Time Display */}
      <div className="flex justify-between text-sm font-medium">
        <span>{formatDuration(Math.floor(currentTime))}</span>
        <span className="text-muted-foreground">{formatDuration(Math.floor(duration))}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => skip(-10)}
          className="rounded-full"
        >
          <SkipBack className="w-5 h-5" />
        </Button>

        <Button
          size="lg"
          onClick={togglePlay}
          className="rounded-full w-16 h-16 shadow-xl hover:scale-105 transition-transform"
        >
          {isPlaying ? (
            <Pause className="w-7 h-7" />
          ) : (
            <Play className="w-7 h-7 ml-1" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => skip(10)}
          className="rounded-full"
        >
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      {/* Speed & Volume */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={changeSpeed}
          className="rounded-full min-w-[60px]"
        >
          {playbackRate}x
        </Button>

        <div className="flex-1 flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={[volume * 100]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="flex-1"
          />
        </div>
      </div>
    </motion.div>
  );
}
