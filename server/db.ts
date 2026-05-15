import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, projects, layers, keyframes, fileMetadata, InsertProject, InsertLayer, InsertKeyframe, InsertFileMetadata } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Project queries
export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
}

export async function getProjectById(projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  return result[0];
}

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(projects).values(data);
  return true;
}

export async function updateProject(projectId: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(projects).set(data).where(eq(projects.id, projectId));
}

export async function deleteProject(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.delete(projects).where(eq(projects.id, projectId));
}

// Layer queries
export async function getProjectLayers(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(layers).where(eq(layers.projectId, projectId)).orderBy(layers.zIndex);
}

export async function createLayer(data: InsertLayer) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(layers).values(data);
}

export async function updateLayer(layerId: number, data: Partial<InsertLayer>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(layers).set(data).where(eq(layers.id, layerId));
}

export async function deleteLayer(layerId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.delete(layers).where(eq(layers.id, layerId));
}

// Keyframe queries
export async function getLayerKeyframes(layerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(keyframes).where(eq(keyframes.layerId, layerId)).orderBy(keyframes.frame);
}

export async function createKeyframe(data: InsertKeyframe) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(keyframes).values(data);
}

export async function deleteKeyframe(keyframeId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.delete(keyframes).where(eq(keyframes.id, keyframeId));
}

// File metadata queries
export async function getUserFileMetadata(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fileMetadata).where(eq(fileMetadata.userId, userId)).orderBy(desc(fileMetadata.createdAt));
}

export async function createFileMetadata(data: InsertFileMetadata) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(fileMetadata).values(data);
}

export async function deleteFileMetadata(fileKey: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.delete(fileMetadata).where(eq(fileMetadata.fileKey, fileKey));
}
