'use client';

import { useState, useEffect } from 'react';
import { Heart, Bookmark, MessageCircle, Share2, UserPlus, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSocialStore } from '@/lib/store/social-store';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  clipId: string;
  initialCount: number;
  variant?: 'default' | 'vertical';
  className?: string;
}

export function LikeButton({ clipId, initialCount, variant = 'default', className }: LikeButtonProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { isLiked, toggleLike } = useSocialStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const liked = isMounted && isLiked(clipId);
  const count = initialCount + (liked ? 1 : 0);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(clipId);
  };

  if (variant === 'vertical') {
    return (
      <button
        onClick={handleClick}
        className={cn('flex flex-col items-center gap-1 group', className)}
      >
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center transition-all',
          liked ? 'bg-red-500 text-white' : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
        )}>
          <Heart className={cn('w-6 h-6', liked && 'fill-current')} />
        </div>
        <span className="text-white text-xs font-semibold">{count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count}</span>
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn(liked ? 'text-red-500' : '', className)}
    >
      <Heart
        className="w-4 h-4 mr-1"
        fill={liked ? 'currentColor' : 'none'}
      />
      {count}
    </Button>
  );
}

interface SaveButtonProps {
  clipId: string;
  variant?: 'default' | 'vertical';
  className?: string;
}

export function SaveButton({ clipId, variant = 'default', className }: SaveButtonProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { isSaved, toggleSave } = useSocialStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const saved = isMounted && isSaved(clipId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave(clipId);
  };

  if (variant === 'vertical') {
    return (
      <button
        onClick={handleClick}
        className={cn('flex flex-col items-center gap-1 group', className)}
      >
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center transition-all',
          saved ? 'bg-blue-500 text-white' : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
        )}>
          <Bookmark className={cn('w-6 h-6', saved && 'fill-current')} />
        </div>
        <span className="text-white text-xs font-semibold">{saved ? 'Saved' : 'Save'}</span>
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn(saved ? 'text-blue-500' : '', className)}
    >
      <Bookmark
        className="w-4 h-4"
        fill={saved ? 'currentColor' : 'none'}
      />
    </Button>
  );
}

interface CommentButtonProps {
  clipId: string;
  variant?: 'default' | 'vertical';
  className?: string;
  onOpenComments?: () => void;
}

export function CommentButton({ clipId, variant = 'default', className, onOpenComments }: CommentButtonProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { getCommentCount } = useSocialStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const count = isMounted ? getCommentCount(clipId) : 0;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenComments?.();
  };

  if (variant === 'vertical') {
    return (
      <button
        onClick={handleClick}
        className={cn('flex flex-col items-center gap-1 group', className)}
      >
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 flex items-center justify-center transition-all">
          <MessageCircle className="w-6 h-6" />
        </div>
        <span className="text-white text-xs font-semibold">{count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count}</span>
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={className}
    >
      <MessageCircle className="w-4 h-4 mr-1" />
      {count > 0 && count}
    </Button>
  );
}

interface ShareButtonProps {
  clipId: string;
  clipTitle: string;
  variant?: 'default' | 'vertical';
  className?: string;
}

export function ShareButton({ clipId, clipTitle, variant = 'default', className }: ShareButtonProps) {
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareData = {
      title: clipTitle,
      text: `Check out "${clipTitle}" on Podkiya`,
      url: `${window.location.origin}/clip/${clipId}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url);
      // TODO: Show toast notification
    }
  };

  if (variant === 'vertical') {
    return (
      <button
        onClick={handleClick}
        className={cn('flex flex-col items-center gap-1 group', className)}
      >
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 flex items-center justify-center transition-all">
          <Share2 className="w-6 h-6" />
        </div>
        <span className="text-white text-xs font-semibold">Share</span>
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={className}
    >
      <Share2 className="w-4 h-4 mr-1" />
      Share
    </Button>
  );
}

interface FollowButtonProps {
  creatorId: string;
  creatorName: string;
  variant?: 'default' | 'compact';
  className?: string;
}

export function FollowButton({ creatorId, creatorName, variant = 'default', className }: FollowButtonProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { isFollowing, toggleFollow } = useSocialStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const following = isMounted && isFollowing(creatorId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFollow(creatorId);
  };

  if (variant === 'compact') {
    return (
      <Button
        variant={following ? 'outline' : 'default'}
        size="sm"
        onClick={handleClick}
        className={cn('rounded-full', className)}
      >
        {following ? (
          <>
            <UserCheck className="w-4 h-4 mr-1" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-1" />
            Follow
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={following ? 'outline' : 'default'}
      onClick={handleClick}
      className={cn('w-full rounded-full', className)}
    >
      {following ? (
        <>
          <UserCheck className="w-4 h-4 mr-2" />
          Following {creatorName}
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          Follow {creatorName}
        </>
      )}
    </Button>
  );
}
