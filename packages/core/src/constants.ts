// Application Constants

// User Roles
export const USER_ROLES = {
  VIEWER: 'viewer',
  CREATOR: 'creator',
  REVIEWER: 'reviewer',
  ADMIN: 'admin',
} as const;

// Clip Status
export const CLIP_STATUS = {
  DRAFT: 'draft',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REMOVED: 'removed',
} as const;

// Review Task Status
export const REVIEW_STATUS = {
  OPEN: 'open',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// Report Status & Reasons
export const REPORT_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  DISMISSED: 'dismissed',
  ACTIONED: 'actioned',
} as const;

export const REPORT_REASONS = {
  SPAM: 'spam',
  INAPPROPRIATE_CONTENT: 'inappropriate_content',
  MISLEADING: 'misleading',
  COPYRIGHT: 'copyright',
  OTHER: 'other',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  CLIP_APPROVED: 'CLIP_APPROVED',
  CLIP_REJECTED: 'CLIP_REJECTED',
  NEW_FOLLOWER: 'NEW_FOLLOWER',
  NEW_LIKE: 'NEW_LIKE',
  NEW_SAVE: 'NEW_SAVE',
} as const;

// Audit Log Actions
export const AUDIT_ACTIONS = {
  USER_ROLE_CHANGE: 'USER_ROLE_CHANGE',
  USER_BAN: 'USER_BAN',
  USER_UNBAN: 'USER_UNBAN',
  CLIP_REMOVE: 'CLIP_REMOVE',
  CLIP_RESTORE: 'CLIP_RESTORE',
  TAG_CREATE: 'TAG_CREATE',
  TAG_UPDATE: 'TAG_UPDATE',
  TAG_DELETE: 'TAG_DELETE',
} as const;

// File Upload Limits
export const UPLOAD_LIMITS = {
  MAX_AUDIO_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_AUDIO_DURATION: 180, // seconds (3 minutes)
  MAX_TITLE_LENGTH: 80,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_BIO_LENGTH: 200,
  MAX_TAGS_PER_CLIP: 5,
} as const;

// Audio Processing
export const AUDIO_CONFIG = {
  OUTPUT_BITRATE: 96, // kbps
  OUTPUT_FORMAT: 'mp3',
  SAMPLE_RATE: 44100,
  WAVEFORM_SAMPLES: 100, // number of data points for waveform
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  UPLOAD: {
    MAX_PER_DAY: 10,
    WINDOW_MS: 24 * 60 * 60 * 1000, // 24 hours
  },
  LIKE: {
    MAX_PER_MINUTE: 30,
    WINDOW_MS: 60 * 1000, // 1 minute
  },
  SAVE: {
    MAX_PER_MINUTE: 30,
    WINDOW_MS: 60 * 1000,
  },
  FOLLOW: {
    MAX_PER_MINUTE: 20,
    WINDOW_MS: 60 * 1000,
  },
  REPORT: {
    MAX_PER_HOUR: 10,
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
  },
  AUTH: {
    MAX_PER_15_MIN: 5,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  },
} as const;

// Play Event Checkpoints (in seconds)
export const PLAY_CHECKPOINTS = {
  START: 0,
  CHECKPOINT_30: 30,
  CHECKPOINT_60: 60,
  CHECKPOINT_90: 90,
  COMPLETE: 0.95, // 95% of total duration
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  FEED_LIMIT: 20,
  SEARCH_LIMIT: 50,
} as const;

// Cache TTL (in seconds)
export const CACHE_TTL = {
  FEED_ANONYMOUS: 60, // 1 minute
  SEARCH_RESULTS: 300, // 5 minutes
  USER_PROFILE: 600, // 10 minutes
  CLIP_DETAILS: 300, // 5 minutes
  TAGS: 3600, // 1 hour
} as const;

// Languages
export const LANGUAGES = {
  EN: 'en',
  AR: 'ar',
} as const;

export const SUPPORTED_LANGUAGES = [LANGUAGES.EN, LANGUAGES.AR] as const;

export const RTL_LANGUAGES = [LANGUAGES.AR] as const;

// Theme
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Audio MIME Types
export const AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/m4a',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
] as const;

// Image MIME Types
export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const;

// Performance Targets
export const PERFORMANCE = {
  FEED_API_P75_MS: 200,
  LCP_TARGET_MS: 2500,
} as const;

// Media Pipeline Steps
export const PIPELINE_STEPS = {
  TRANSCODE: 'transcode',
  TRANSCRIBE: 'transcribe',
  INDEX: 'index',
} as const;

// Job Status
export const JOB_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

// Analytics Events
export const ANALYTICS_EVENTS = {
  FEED_VIEW: 'feed_view',
  CLIP_PLAY_START: 'clip_play_start',
  CLIP_30S: 'clip_30s',
  CLIP_60S: 'clip_60s',
  CLIP_90S: 'clip_90s',
  CLIP_COMPLETE: 'clip_complete',
  LIKE: 'like',
  SAVE: 'save',
  SHARE: 'share',
  FOLLOW: 'follow',
  UPLOAD_SUBMIT: 'upload_submit',
  REVIEW_APPROVE: 'review_approve',
  REVIEW_REJECT: 'review_reject',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to perform this action',
  CLIP_NOT_FOUND: 'Clip not found',
  USER_NOT_FOUND: 'User not found',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed',
  AUDIO_TOO_LONG: 'Audio duration exceeds 3 minutes',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later',
  INTERNAL_ERROR: 'An internal error occurred. Please try again',
  VALIDATION_ERROR: 'Validation error',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CLIP_UPLOADED: 'Clip uploaded successfully',
  CLIP_APPROVED: 'Clip approved successfully',
  CLIP_REJECTED: 'Clip rejected',
  PROFILE_UPDATED: 'Profile updated successfully',
  FOLLOWED: 'You are now following this creator',
  UNFOLLOWED: 'Unfollowed successfully',
  LIKED: 'Clip liked',
  SAVED: 'Clip saved',
  REPORT_SUBMITTED: 'Report submitted successfully',
} as const;

// Default Values
export const DEFAULTS = {
  LANGUAGE: LANGUAGES.EN,
  THEME: THEMES.SYSTEM,
  AVATAR_URL: '/images/default-avatar.png',
  THUMBNAIL_URL: '/images/default-thumbnail.png',
} as const;
