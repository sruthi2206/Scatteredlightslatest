import { pgTable, text, serial, integer, boolean, timestamp, json, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  isAdmin: boolean("is_admin").default(false),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  interests: text("interests").array(),
  lights: integer("lights").default(0),
  referralCode: text("referral_code").unique(),
  referredBy: text("referred_by"),
  phoneNumber: text("phone_number"),
  secretDiaryPin: text("secret_diary_pin"),
  premiumExpiryDate: timestamp("premium_expiry_date"),
  googleId: text("google_id").unique(),
  resetToken: text("reset_token"),
  resetTokenExpires: timestamp("reset_token_expires"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  avatarUrl: true,
  bio: true,
  interests: true,
  lights: true,
  referralCode: true,
  referredBy: true,
  phoneNumber: true,
  premiumExpiryDate: true,
  googleId: true,
});

// Chakra Profile model
export const chakraProfiles = pgTable("chakra_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  crownChakra: numeric("crown_chakra", { precision: 3, scale: 1 }).notNull(),
  thirdEyeChakra: numeric("third_eye_chakra", { precision: 3, scale: 1 }).notNull(),
  throatChakra: numeric("throat_chakra", { precision: 3, scale: 1 }).notNull(),
  heartChakra: numeric("heart_chakra", { precision: 3, scale: 1 }).notNull(),
  solarPlexusChakra: numeric("solar_plexus_chakra", { precision: 3, scale: 1 }).notNull(),
  sacralChakra: numeric("sacral_chakra", { precision: 3, scale: 1 }).notNull(),
  rootChakra: numeric("root_chakra", { precision: 3, scale: 1 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertChakraProfileSchema = createInsertSchema(chakraProfiles).pick({
  userId: true,
  crownChakra: true,
  thirdEyeChakra: true,
  throatChakra: true,
  heartChakra: true,
  solarPlexusChakra: true,
  sacralChakra: true,
  rootChakra: true,
}).extend({
  crownChakra: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  thirdEyeChakra: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  throatChakra: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  heartChakra: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  solarPlexusChakra: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  sacralChakra: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  rootChakra: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
});

// Journal Entries model
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  gratitude: text("gratitude").array(),
  affirmation: text("affirmation"),
  shortTermGoals: text("short_term_goals").array(),
  longTermVision: text("long_term_vision"),
  language: text("language").default("english"),
  sentimentScore: integer("sentiment_score"),
  emotionTags: text("emotion_tags").array(),
  chakraTags: text("chakra_tags").array(),
  aiInsights: text("ai_insights"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  userId: true,
  content: true,
  gratitude: true,
  affirmation: true,
  shortTermGoals: true,
  longTermVision: true,
  language: true,
  sentimentScore: true,
  emotionTags: true,
  chakraTags: true,
  aiInsights: true,
});

// Emotion Tracking model
export const emotionTracking = pgTable("emotion_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  emotion: text("emotion").notNull(),
  intensity: integer("intensity").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmotionTrackingSchema = createInsertSchema(emotionTracking).pick({
  userId: true,
  emotion: true,
  intensity: true,
  note: true,
});

// Coach Conversations model
export const coachConversations = pgTable("coach_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  coachType: text("coach_type").notNull(),
  messages: json("messages").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCoachConversationSchema = createInsertSchema(coachConversations).pick({
  userId: true,
  coachType: true,
  messages: true,
});

// Healing Rituals model
export const healingRituals = pgTable("healing_rituals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  targetChakra: text("target_chakra"),
  targetEmotion: text("target_emotion"),
  instructions: text("instructions").notNull(),
  featuredImage: text("featured_image"),
  mainImageUrl: text("main_image_url"),
  thumbnailUrl: text("thumbnail_url"),
  courseUrl: text("course_url"),
  videoUrl: text("video_url"),
  duration: text("duration"),
  // Lesson 1 fields
  lesson1Title: text("lesson1_title"),
  lesson1Description: text("lesson1_description"),
  lesson1VideoUrl: text("lesson1_video_url"),
  lesson1Duration: text("lesson1_duration"),
  // Lesson 2 fields
  lesson2Title: text("lesson2_title"),
  lesson2Description: text("lesson2_description"),
  lesson2VideoUrl: text("lesson2_video_url"),
  lesson2Duration: text("lesson2_duration"),
  // Lesson 3 fields
  lesson3Title: text("lesson3_title"),
  lesson3Description: text("lesson3_description"),
  lesson3VideoUrl: text("lesson3_video_url"),
  lesson3Duration: text("lesson3_duration"),
  zoomLink: text("zoom_link"),
  eventDate: timestamp("event_date"),
  isFeatured: boolean("is_featured").default(false),
  status: text("status").default("published"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertHealingRitualSchema = createInsertSchema(healingRituals).pick({
  name: true,
  description: true,
  type: true,
  targetChakra: true,
  targetEmotion: true,
  instructions: true,
  featuredImage: true,
  mainImageUrl: true,
  thumbnailUrl: true,
  courseUrl: true,
  videoUrl: true,
  duration: true,
  // Lesson fields
  lesson1Title: true,
  lesson1Description: true,
  lesson1VideoUrl: true,
  lesson1Duration: true,
  lesson2Title: true,
  lesson2Description: true,
  lesson2VideoUrl: true,
  lesson2Duration: true,
  lesson3Title: true,
  lesson3Description: true,
  lesson3VideoUrl: true,
  lesson3Duration: true,
  zoomLink: true,
  eventDate: true,
  isFeatured: true,
  status: true,
});

// User Recommendations model
export const userRecommendations = pgTable("user_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  ritualId: integer("ritual_id").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserRecommendationSchema = createInsertSchema(userRecommendations).pick({
  userId: true,
  ritualId: true,
  completed: true,
});

// Community Events model
export const communityEvents = pgTable("community_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  featuredImage: text("featured_image"),
  eventDate: timestamp("event_date").notNull(),
  eventTime: text("event_time").notNull(),
  duration: integer("duration"), // in minutes
  isVirtual: boolean("is_virtual").default(true),
  isFree: boolean("is_free").default(false),
  zoomLink: text("zoom_link"),
  videoUrl: text("video_url"),
  maxAttendees: integer("max_attendees"),
  status: text("status").default("upcoming"), // upcoming, ongoing, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCommunityEventSchema = createInsertSchema(communityEvents).pick({
  title: true,
  description: true,
  featuredImage: true,
  eventDate: true,
  eventTime: true,
  duration: true,
  isVirtual: true,
  isFree: true,
  zoomLink: true,
  videoUrl: true,
  maxAttendees: true,
  status: true,
});

// Event Attendees model
export const eventAttendees = pgTable("event_attendees", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  registrationDate: timestamp("registration_date").defaultNow(),
  attended: boolean("attended").default(false),
});

export const insertEventAttendeeSchema = createInsertSchema(eventAttendees).pick({
  eventId: true,
  userId: true,
  attended: true,
});

// Media Library model
export const mediaLibrary = pgTable("media_library", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // image, video, document
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  altText: text("alt_text"),
  uploadedById: integer("uploaded_by_id").notNull(),
  uploadDate: timestamp("upload_date").defaultNow(),
});

export const insertMediaSchema = createInsertSchema(mediaLibrary).pick({
  fileName: true,
  fileType: true,
  fileUrl: true,
  fileSize: true,
  altText: true,
  uploadedById: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ChakraProfile = typeof chakraProfiles.$inferSelect;
export type InsertChakraProfile = z.infer<typeof insertChakraProfileSchema>;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

export type EmotionTracking = typeof emotionTracking.$inferSelect;
export type InsertEmotionTracking = z.infer<typeof insertEmotionTrackingSchema>;

export type CoachConversation = typeof coachConversations.$inferSelect;
export type InsertCoachConversation = z.infer<typeof insertCoachConversationSchema>;

export type HealingRitual = typeof healingRituals.$inferSelect;
export type InsertHealingRitual = z.infer<typeof insertHealingRitualSchema>;

export type UserRecommendation = typeof userRecommendations.$inferSelect;
export type InsertUserRecommendation = z.infer<typeof insertUserRecommendationSchema>;

export type CommunityEvent = typeof communityEvents.$inferSelect;
export type InsertCommunityEvent = z.infer<typeof insertCommunityEventSchema>;

export type EventAttendee = typeof eventAttendees.$inferSelect;
export type InsertEventAttendee = z.infer<typeof insertEventAttendeeSchema>;

export type MediaItem = typeof mediaLibrary.$inferSelect;
export type InsertMediaItem = z.infer<typeof insertMediaSchema>;

// Community Posts model
export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).pick({
  userId: true,
  content: true,
  mediaUrl: true,
});

// Post Reactions model (likes)
export const postReactions = pgTable("post_reactions", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  type: text("type").default("like"), // For future: like, heart, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPostReactionSchema = createInsertSchema(postReactions).pick({
  postId: true,
  userId: true,
  type: true,
});

// Post Comments model
export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPostCommentSchema = createInsertSchema(postComments).pick({
  postId: true,
  userId: true,
  content: true,
});

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;

export type PostReaction = typeof postReactions.$inferSelect;
export type InsertPostReaction = z.infer<typeof insertPostReactionSchema>;

export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;

// Token Usage Tracking model
export const tokenUsage = pgTable("token_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  coachType: text("coach_type").notNull(), // life, emotional, spiritual
  promptTokens: integer("prompt_tokens").notNull(),
  completionTokens: integer("completion_tokens").notNull(),
  totalTokens: integer("total_tokens").notNull(),
  cost: integer("cost"), // in cents (e.g., 150 = $1.50)
  model: text("model").default("gpt-4o"), // track which model was used
  conversationId: integer("conversation_id"), // link to coach conversation
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTokenUsageSchema = createInsertSchema(tokenUsage).pick({
  userId: true,
  coachType: true,
  promptTokens: true,
  completionTokens: true,
  totalTokens: true,
  cost: true,
  model: true,
  conversationId: true,
});

// User Token Quotas model
export const userTokenQuotas = pgTable("user_token_quotas", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  monthlyQuota: integer("monthly_quota").default(500000), // tokens per month
  currentUsage: integer("current_usage").default(0), // tokens used this month
  lastResetDate: timestamp("last_reset_date").defaultNow(),
  quotaResetDay: integer("quota_reset_day").default(1), // day of month to reset quota
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserTokenQuotaSchema = createInsertSchema(userTokenQuotas).pick({
  userId: true,
  monthlyQuota: true,
  currentUsage: true,
  lastResetDate: true,
  quotaResetDay: true,
  isActive: true,
});

export type TokenUsage = typeof tokenUsage.$inferSelect;
export type InsertTokenUsage = z.infer<typeof insertTokenUsageSchema>;

export type UserTokenQuota = typeof userTokenQuotas.$inferSelect;
export type InsertUserTokenQuota = z.infer<typeof insertUserTokenQuotaSchema>;
