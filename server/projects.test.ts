import { describe, it, expect, beforeEach, vi } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: 'test',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: 'https',
      headers: {},
    } as TrpcContext['req'],
    res: {} as TrpcContext['res'],
  };

  return ctx;
}

describe('Projects Router', () => {
  describe('projects.create', () => {
    it('should create a new project', async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.projects.create({
        name: 'Test Project',
        description: 'A test project',
        duration: 5000,
        fps: 30,
      });

      expect(result).toEqual({ success: true });
    });

    it('should create project with default values', async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.projects.create({
        name: 'Default Project',
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe('projects.list', () => {
    it('should list user projects', async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      // Create a project first
      await caller.projects.create({
        name: 'Project 1',
      });

      const projects = await caller.projects.list();
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBeGreaterThan(0);
    });
  });

  describe('projects.update', () => {
    it('should update project properties', async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      // Create a project
      await caller.projects.create({
        name: 'Original Name',
      });

      const projects = await caller.projects.list();
      const projectId = projects[0]?.id;

      if (projectId) {
        const result = await caller.projects.update({
          projectId,
          name: 'Updated Name',
          duration: 10000,
        });

        expect(result).toEqual({ success: true });
      }
    });
  });
});

describe('Layers Router', () => {
  let projectId: number;

  beforeEach(async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    await caller.projects.create({
      name: 'Test Project for Layers',
    });

    const projects = await caller.projects.list();
    projectId = projects[0]?.id || 1;
  });

  describe('layers.create', () => {
    it('should create a notification layer', async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.layers.create({
        projectId,
        type: 'notification',
        name: 'Test Notification',
      });

      expect(result).toEqual({ success: true });
    });

    it('should create a text layer', async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.layers.create({
        projectId,
        type: 'text',
        name: 'Test Text',
      });

      expect(result).toEqual({ success: true });
    });

    it('should create a widget layer', async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.layers.create({
        projectId,
        type: 'widget',
        name: 'Test Widget',
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe('layers.list', () => {
    it('should list project layers', async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      // Create a layer first
      await caller.layers.create({
        projectId,
        type: 'notification',
        name: 'Layer 1',
      });

      const layers = await caller.layers.list({ projectId });
      expect(Array.isArray(layers)).toBe(true);
      expect(layers.length).toBeGreaterThan(0);
    });
  });

  describe('layers.update', () => {
    it('should update layer properties', async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      // Create a layer
      await caller.layers.create({
        projectId,
        type: 'notification',
        name: 'Original Name',
      });

      const layers = await caller.layers.list({ projectId });
      const layerId = layers[0]?.id;

      if (layerId) {
        const result = await caller.layers.update({
          layerId,
          name: 'Updated Name',
          visible: 0,
        });

        expect(result).toEqual({ success: true });
      }
    });
  });
});

describe('Files Router', () => {
  describe('files.upload', () => {
    it('should handle file upload', async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      // Mock base64 data (small test image)
      const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const result = await caller.files.upload({
        fileName: 'test.png',
        fileType: 'background',
        mimeType: 'image/png',
        fileSize: 68,
        base64Data,
      });

      expect(result.success).toBe(true);
      expect(result.url).toBeDefined();
      expect(result.key).toBeDefined();
    });
  });

  describe('files.list', () => {
    it('should list user files', async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const files = await caller.files.list();
      expect(Array.isArray(files)).toBe(true);
    });
  });
});
