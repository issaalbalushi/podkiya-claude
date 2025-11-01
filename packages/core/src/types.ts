// User & Authentication Types
export type UserRole = 'viewer' | 'creator' | 'reviewer' | 'admin';

export type User = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  languagePref: string;
  createdAt: Date;
  roles: UserRole[];
};

// Clip Types
export type ClipStatus = 'draft' | 'in_review' | 'approved' | 'rejected' | 'removed';

export type Clip = {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  language: string;
  durationSec: number;
  audioUrl: string | null;
  waveformJsonUrl: string | null;
  thumbUrl: string | null;
  status: ClipStatus;
  rejectionReason: string | null;
  createdAt: Date;
  publishedAt: Date | null;
  creator?: User;
  tags?: Tag[];
  transcript?: Transcript;
  _count?: {
    likes: number;
    saves: number;
    plays: number;
  };
};

// Tag Types
export type Tag = {
  id: string;
  slug: string;
  label_en: string;
  label_ar: string;
  createdAt: Date;
};

// Transcript Types
export type Transcript = {
  id: string;
  clipId: string;
  text: string;
  language: string;
  wordsJsonUrl: string | null;
  createdAt: Date;
};

export type TranscriptWord = {
  word: string;
  start: number;
  end: number;
  confidence: number;
};

// Review Types
export type ReviewTaskStatus = 'open' | 'approved' | 'rejected';

export type ReviewTask = {
  id: string;
  clipId: string;
  reviewerId: string | null;
  status: ReviewTaskStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  clip?: Clip;
  reviewer?: User;
};

// Report Types
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'actioned';
export type ReportReason =
  | 'spam'
  | 'inappropriate_content'
  | 'misleading'
  | 'copyright'
  | 'other';

export type Report = {
  id: string;
  reporterId: string;
  clipId: string;
  reason: ReportReason;
  notes: string | null;
  status: ReportStatus;
  createdAt: Date;
  reporter?: User;
  clip?: Clip;
};

// Social Types
export type Like = {
  userId: string;
  clipId: string;
  createdAt: Date;
};

export type Save = {
  userId: string;
  clipId: string;
  createdAt: Date;
};

export type Follow = {
  followerId: string;
  followingUserId: string;
  createdAt: Date;
  follower?: User;
  following?: User;
};

// Play Event Types
export type PlayEvent = {
  id: string;
  userId: string | null;
  clipId: string;
  startedAt: Date;
  c30: boolean;
  c60: boolean;
  c90: boolean;
  completed: boolean;
};

// Notification Types
export type NotificationType =
  | 'CLIP_APPROVED'
  | 'CLIP_REJECTED'
  | 'NEW_FOLLOWER'
  | 'NEW_LIKE'
  | 'NEW_SAVE';

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  dataJson: Record<string, unknown>;
  readAt: Date | null;
  createdAt: Date;
};

// Audit Log Types
export type AuditLogAction =
  | 'USER_ROLE_CHANGE'
  | 'USER_BAN'
  | 'USER_UNBAN'
  | 'CLIP_REMOVE'
  | 'CLIP_RESTORE'
  | 'TAG_CREATE'
  | 'TAG_UPDATE'
  | 'TAG_DELETE';

export type AuditLog = {
  id: string;
  actorUserId: string;
  action: AuditLogAction;
  targetType: string;
  targetId: string;
  dataJson: Record<string, unknown>;
  createdAt: Date;
  actor?: User;
};

// Upload Types
export type UploadClipInput = {
  title: string;
  description?: string;
  language: string;
  tagIds: string[];
  audioFile: File;
  thumbnailFile?: File;
};

// Feed Types
export type FeedFilter = {
  language?: string;
  tagIds?: string[];
  creatorId?: string;
  followingOnly?: boolean;
};

export type FeedClip = Clip & {
  creator: User;
  tags: Tag[];
  isLiked?: boolean;
  isSaved?: boolean;
  _count: {
    likes: number;
    saves: number;
  };
};

// Search Types
export type SearchFilters = {
  query: string;
  language?: string;
  tagIds?: string[];
  creatorId?: string;
};

export type SearchResult = {
  clipId: string;
  title: string;
  description: string | null;
  creatorName: string;
  creatorId: string;
  language: string;
  tags: string[];
  thumbnailUrl: string | null;
  durationSec: number;
  transcriptSnippet?: string;
};

// Analytics Types
export type AnalyticsEvent =
  | 'feed_view'
  | 'clip_play_start'
  | 'clip_30s'
  | 'clip_60s'
  | 'clip_90s'
  | 'clip_complete'
  | 'like'
  | 'save'
  | 'share'
  | 'follow'
  | 'upload_submit'
  | 'review_approve'
  | 'review_reject';

export type TopClip = {
  clip: Clip;
  playCount: number;
  completionRate: number;
  likeCount: number;
  saveCount: number;
};

export type AdminStats = {
  totalClips: number;
  totalUsers: number;
  totalCreators: number;
  pendingReviews: number;
  approvalRate: number;
  avgTimeToPublish: number; // in hours
  topClips7d: TopClip[];
  topClips30d: TopClip[];
  creatorActivity: {
    userId: string;
    userName: string;
    uploadsCount: number;
    approvedCount: number;
    totalPlays: number;
  }[];
};

// Job Types
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type MediaPipelineStep =
  | 'transcode'
  | 'transcribe'
  | 'index';

export type MediaPipelineStatus = {
  clipId: string;
  currentStep: MediaPipelineStep | null;
  transcode: JobStatus;
  transcribe: JobStatus;
  index: JobStatus;
  error?: string;
};

// Waveform Types
export type WaveformData = {
  samples: number[];
  duration: number;
  sampleRate: number;
};

// Rate Limiting Types
export type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
};
