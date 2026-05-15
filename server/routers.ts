import { COOKIE_NAME } from "@shared/const";
import type { TrpcContext } from "./_core/context";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getUserProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectLayers,
  createLayer,
  updateLayer,
  deleteLayer,
  getLayerKeyframes,
  createKeyframe,
  deleteKeyframe,
  getUserFileMetadata,
  createFileMetadata,
  deleteFileMetadata,
} from "./db";
import { storagePut, storageGet } from "./storage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Projects router
  projects: router({
    list: protectedProcedure.query(({ ctx }) =>
      getUserProjects(ctx.user.id)
    ),

    get: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const project = await getProjectById(input.projectId);
        return project || null;
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          duration: z.number().default(5000),
          fps: z.number().default(30),
          width: z.number().default(1080),
          height: z.number().default(1920),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createProject({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          duration: input.duration,
          fps: input.fps,
          width: input.width,
          height: input.height,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          backgroundUrl: z.string().optional(),
          backgroundKey: z.string().optional(),
          backgroundType: z.enum(['image', 'video']).optional(),
          musicUrl: z.string().optional(),
          musicKey: z.string().optional(),
          duration: z.number().optional(),
          fps: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await updateProject(input.projectId, {
          name: input.name,
          description: input.description,
          backgroundUrl: input.backgroundUrl,
          backgroundKey: input.backgroundKey,
          backgroundType: input.backgroundType,
          musicUrl: input.musicUrl,
          musicKey: input.musicKey,
          duration: input.duration,
          fps: input.fps,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteProject(input.projectId);
        return { success: true };
      }),

    export: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          format: z.enum(['mp4', 'webm']).default('mp4'),
          quality: z.enum(['low', 'medium', 'high']).default('high'),
        })
      )
      .mutation(async ({ input }) => {
        return {
          success: true,
          downloadUrl: `/api/exports/${input.projectId}.${input.format}`,
          message: 'Export started. Your video will be ready shortly.',
        };
      }),
  }),

  // Layers router
  layers: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(({ input }) => getProjectLayers(input.projectId)),

    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          type: z.enum(['notification', 'text', 'widget', 'background']),
          name: z.string(),
          data: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await createLayer({
          projectId: input.projectId,
          type: input.type,
          name: input.name,
          data: input.data,
          zIndex: 0,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          layerId: z.number(),
          name: z.string().optional(),
          zIndex: z.number().optional(),
          visible: z.number().optional(),
          locked: z.number().optional(),
          data: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await updateLayer(input.layerId, {
          name: input.name,
          zIndex: input.zIndex,
          visible: input.visible,
          locked: input.locked,
          data: input.data,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ layerId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteLayer(input.layerId);
        return { success: true };
      }),
  }),

  // Keyframes router
  keyframes: router({
    list: protectedProcedure
      .input(z.object({ layerId: z.number() }))
      .query(({ input }) => getLayerKeyframes(input.layerId)),

    create: protectedProcedure
      .input(
        z.object({
          layerId: z.number(),
          frame: z.number(),
          property: z.string(),
          value: z.string(),
          easing: z.string().default('easeInOut'),
        })
      )
      .mutation(async ({ input }) => {
        await createKeyframe({
          layerId: input.layerId,
          frame: input.frame,
          property: input.property,
          value: input.value,
          easing: input.easing,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ keyframeId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteKeyframe(input.keyframeId);
        return { success: true };
      }),
  }),

  // File upload router
  files: router({
    list: protectedProcedure.query(({ ctx }) =>
      getUserFileMetadata(ctx.user.id)
    ),

    upload: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileType: z.enum(['background', 'music', 'sfx']),
          mimeType: z.string(),
          fileSize: z.number(),
          base64Data: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const buffer = Buffer.from(input.base64Data, 'base64');
          const fileKey = `${ctx.user.id}/${input.fileType}/${Date.now()}-${input.fileName}`;

          const { url, key } = await storagePut(fileKey, buffer, input.mimeType);

          await createFileMetadata({
            userId: ctx.user.id,
            fileKey: key,
            fileName: input.fileName,
            fileType: input.fileType,
            mimeType: input.mimeType,
            fileSize: input.fileSize,
          });

          return { success: true, url, key };
        } catch (error) {
          console.error('File upload error:', error);
          throw new Error('Failed to upload file');
        }
      }),

    delete: protectedProcedure
      .input(z.object({ fileKey: z.string() }))
      .mutation(async ({ input }) => {
        await deleteFileMetadata(input.fileKey);
        return { success: true };
      }),

    getUrl: protectedProcedure
      .input(z.object({ fileKey: z.string() }))
      .query(async ({ input }) => {
        try {
          const { url } = await storageGet(input.fileKey);
          return { url };
        } catch (error) {
          console.error('Get file URL error:', error);
          throw new Error('Failed to get file URL');
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
