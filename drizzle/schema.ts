import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Project and composition tables
export const projects = mysqlTable('projects', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  backgroundUrl: varchar('backgroundUrl', { length: 512 }),
  backgroundKey: varchar('backgroundKey', { length: 512 }),
  backgroundType: mysqlEnum('backgroundType', ['image', 'video']).default('image'),
  musicUrl: varchar('musicUrl', { length: 512 }),
  musicKey: varchar('musicKey', { length: 512 }),
  duration: int('duration').default(5000), // milliseconds
  fps: int('fps').default(30),
  width: int('width').default(1080),
  height: int('height').default(1920),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// Layer types for different elements
export const layers = mysqlTable('layers', {
  id: int('id').autoincrement().primaryKey(),
  projectId: int('projectId').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  type: mysqlEnum('type', ['notification', 'text', 'widget', 'background']).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  zIndex: int('zIndex').default(0),
  visible: int('visible').default(1), // boolean as int
  locked: int('locked').default(0), // boolean as int
  data: text('data'), // JSON stringified layer-specific data
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Layer = typeof layers.$inferSelect;
export type InsertLayer = typeof layers.$inferInsert;

// Animation keyframes for layers
export const keyframes = mysqlTable('keyframes', {
  id: int('id').autoincrement().primaryKey(),
  layerId: int('layerId').notNull().references(() => layers.id, { onDelete: 'cascade' }),
  frame: int('frame').notNull(), // frame number
  property: varchar('property', { length: 64 }).notNull(), // 'scale', 'opacity', 'translateY', 'blur', etc.
  value: varchar('value', { length: 255 }).notNull(), // numeric or string value
  easing: varchar('easing', { length: 64 }).default('easeInOut'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type Keyframe = typeof keyframes.$inferSelect;
export type InsertKeyframe = typeof keyframes.$inferInsert;

// File metadata for tracking uploads
export const fileMetadata = mysqlTable('fileMetadata', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull().references(() => users.id),
  fileKey: varchar('fileKey', { length: 512 }).notNull().unique(),
  fileName: varchar('fileName', { length: 255 }).notNull(),
  fileType: varchar('fileType', { length: 64 }).notNull(), // 'background', 'music', 'sfx'
  mimeType: varchar('mimeType', { length: 128 }).notNull(),
  fileSize: int('fileSize').notNull(),
  duration: int('duration'), // for audio/video files
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type FileMetadata = typeof fileMetadata.$inferSelect;
export type InsertFileMetadata = typeof fileMetadata.$inferInsert;