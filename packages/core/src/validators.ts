import { z } from 'zod';

// Constants for validation
export const MAX_TITLE_LENGTH = 80;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_BIO_LENGTH = 200;
export const MAX_AUDIO_DURATION = 180; // 3 minutes
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_TAGS_PER_CLIP = 5;

// User Validators
export const userRoleSchema = z.enum(['viewer', 'creator', 'reviewer', 'admin']);

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(MAX_BIO_LENGTH).optional(),
  avatarUrl: z.string().url().optional(),
  languagePref: z.string().length(2).optional(), // ISO 639-1
});

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: userRoleSchema,
  action: z.enum(['add', 'remove']),
});

// Clip Validators
export const clipStatusSchema = z.enum(['draft', 'in_review', 'approved', 'rejected', 'removed']);

export const createClipSchema = z.object({
  title: z.string().min(1).max(MAX_TITLE_LENGTH),
  description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
  language: z.string().length(2), // ISO 639-1
  tagIds: z.array(z.string().uuid()).min(1).max(MAX_TAGS_PER_CLIP),
});

export const updateClipSchema = z.object({
  clipId: z.string().uuid(),
  title: z.string().min(1).max(MAX_TITLE_LENGTH).optional(),
  description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
  tagIds: z.array(z.string().uuid()).min(1).max(MAX_TAGS_PER_CLIP).optional(),
});

export const uploadAudioSchema = z.object({
  file: z.custom<File>(),
  clipId: z.string().uuid(),
});

// Tag Validators
export const createTagSchema = z.object({
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  label_en: z.string().min(1).max(50),
  label_ar: z.string().min(1).max(50),
});

export const updateTagSchema = z.object({
  tagId: z.string().uuid(),
  label_en: z.string().min(1).max(50).optional(),
  label_ar: z.string().min(1).max(50).optional(),
});

// Review Validators
export const reviewActionSchema = z.object({
  clipId: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  notes: z.string().max(500).optional(),
});

export const reviewFiltersSchema = z.object({
  language: z.string().length(2).optional(),
  tagId: z.string().uuid().optional(),
  creatorId: z.string().uuid().optional(),
  status: z.enum(['open', 'approved', 'rejected']).optional(),
});

// Report Validators
export const reportReasonSchema = z.enum([
  'spam',
  'inappropriate_content',
  'misleading',
  'copyright',
  'other',
]);

export const createReportSchema = z.object({
  clipId: z.string().uuid(),
  reason: reportReasonSchema,
  notes: z.string().max(500).optional(),
});

export const updateReportStatusSchema = z.object({
  reportId: z.string().uuid(),
  status: z.enum(['pending', 'reviewed', 'dismissed', 'actioned']),
  adminNotes: z.string().max(500).optional(),
});

// Social Validators
export const likeClipSchema = z.object({
  clipId: z.string().uuid(),
});

export const saveClipSchema = z.object({
  clipId: z.string().uuid(),
});

export const followUserSchema = z.object({
  userId: z.string().uuid(),
});

// Feed Validators
export const feedFiltersSchema = z.object({
  language: z.string().length(2).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  creatorId: z.string().uuid().optional(),
  followingOnly: z.boolean().optional(),
  cursor: z.string().optional(), // for pagination
  limit: z.number().min(1).max(50).optional().default(20),
});

// Search Validators
export const searchQuerySchema = z.object({
  query: z.string().min(1).max(200),
  language: z.string().length(2).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  creatorId: z.string().uuid().optional(),
  limit: z.number().min(1).max(50).optional().default(20),
  page: z.number().min(0).optional().default(0),
});

// Play Event Validators
export const recordPlayEventSchema = z.object({
  clipId: z.string().uuid(),
  checkpoint: z.enum(['start', '30s', '60s', '90s', 'complete']),
});

// Notification Validators
export const notificationTypeSchema = z.enum([
  'CLIP_APPROVED',
  'CLIP_REJECTED',
  'NEW_FOLLOWER',
  'NEW_LIKE',
  'NEW_SAVE',
]);

export const markNotificationReadSchema = z.object({
  notificationId: z.string().uuid(),
});

export const markAllNotificationsReadSchema = z.object({
  beforeDate: z.date().optional(),
});

// Admin Validators
export const banUserSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().max(500),
});

export const unbanUserSchema = z.object({
  userId: z.string().uuid(),
});

export const removeClipSchema = z.object({
  clipId: z.string().uuid(),
  reason: z.string().max(500),
});

export const restoreClipSchema = z.object({
  clipId: z.string().uuid(),
});

// Analytics Validators
export const analyticsEventSchema = z.object({
  event: z.enum([
    'feed_view',
    'clip_play_start',
    'clip_30s',
    'clip_60s',
    'clip_90s',
    'clip_complete',
    'like',
    'save',
    'share',
    'follow',
    'upload_submit',
    'review_approve',
    'review_reject',
  ]),
  properties: z.record(z.unknown()).optional(),
});

export const adminStatsFiltersSchema = z.object({
  period: z.enum(['7d', '30d', '90d']).optional().default('7d'),
});

// Pagination Validators
export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).optional().default(20),
});

// File Upload Validators
export const audioFileSchema = z.object({
  type: z.enum(['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/m4a']),
  size: z.number().max(MAX_FILE_SIZE),
  name: z.string(),
});

export const imageFileSchema = z.object({
  type: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  size: z.number().max(5 * 1024 * 1024), // 5MB
  name: z.string(),
});

// Language Validators
export const languageSchema = z.enum(['en', 'ar']); // Extensible

// Settings Validators
export const updateSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  languagePref: languageSchema.optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});
