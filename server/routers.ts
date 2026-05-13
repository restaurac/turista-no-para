import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { sdk } from "./_core/sdk";
import {
  createDonation,
  createGalleryPhoto,
  createPartner,
  createTestimonial,
  createTouristSpot,
  deleteGalleryPhoto,
  deletePartner,
  deleteTouristSpot,
  deleteTestimonial,
  getAllDonationsAdmin,
  getAllGalleryPhotosAdmin,
  getAllPartnersAdmin,
  getAllTestimonialsAdmin,
  getAllTouristSpotsAdmin,
  getActivePartners,
  getApprovedGalleryPhotos,
  getApprovedTestimonials,
  getAllTouristSpots,
  getFeaturedTouristSpots,
  getTouristSpotBySlug,
  seedTouristSpots,
  updateGalleryPhoto,
  updatePartner,
  updateTestimonial,
  updateTouristSpot,
  createFeedback,
  getAllFeedbacksAdmin,
  updateFeedbackStatus,
  deleteFeedback,
  upsertUser,
} from "./db";
import { storagePut } from "./storage";

// Admin guard middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@turistanopara.com.br";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
        const ownerOpenId = process.env.OWNER_OPEN_ID || "admin-user";

        if (input.email === adminEmail && input.password === adminPassword) {
          await upsertUser({
            openId: ownerOpenId,
            name: "Administrador",
            email: input.email,
            role: "admin",
            lastSignedIn: new Date(),
          });

          const sessionToken = await sdk.createSessionToken(ownerOpenId, {
            name: "Administrador",
            expiresInMs: ONE_YEAR_MS,
          });

          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
          
          return { success: true };
        }

        throw new TRPCError({ code: "UNAUTHORIZED", message: "Credenciais inválidas" });
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Tourist Spots ──────────────────────────────────────────────────────────
  spots: router({
    list: publicProcedure
      .input(z.object({ city: z.string().optional(), category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getAllTouristSpots(input);
      }),

    featured: publicProcedure.query(async () => {
      return getFeaturedTouristSpots();
    }),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const spot = await getTouristSpotBySlug(input.slug);
        if (!spot) throw new TRPCError({ code: "NOT_FOUND" });
        return spot;
      }),

    seed: publicProcedure.mutation(async () => {
      await seedTouristSpots();
      return { success: true };
    }),

    // Admin
    adminList: adminProcedure.query(async () => getAllTouristSpotsAdmin()),

    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          slug: z.string().min(1),
          description: z.string().min(1),
          shortDescription: z.string().optional(),
          city: z.enum(["Belém", "Ananindeua"]),
          category: z.enum(["museu", "parque", "monumento", "gastronomia", "religioso", "natureza", "entretenimento", "outro"]),
          address: z.string().min(1),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
          openingHours: z.string().optional(),
          phone: z.string().optional(),
          website: z.string().optional(),
          coverImage: z.string().optional(),
          images: z.string().optional(),
          featured: z.boolean().default(false),
        })
      )
      .mutation(async ({ input }) => {
        await createTouristSpot({ ...input, active: true });
        return { success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          shortDescription: z.string().optional(),
          city: z.enum(["Belém", "Ananindeua"]).optional(),
          category: z.enum(["museu", "parque", "monumento", "gastronomia", "religioso", "natureza", "entretenimento", "outro"]).optional(),
          address: z.string().optional(),
          openingHours: z.string().optional(),
          phone: z.string().optional(),
          website: z.string().optional(),
          coverImage: z.string().optional(),
          featured: z.boolean().optional(),
          active: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateTouristSpot(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteTouristSpot(input.id);
        return { success: true };
      }),
  }),

  // ─── Partners ───────────────────────────────────────────────────────────────
  partners: router({
    list: publicProcedure.query(async () => getActivePartners()),

    adminList: adminProcedure.query(async () => getAllPartnersAdmin()),

    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          category: z.enum(["hotel", "restaurante", "sorveteria", "salao_beleza", "outro"]),
          description: z.string().optional(),
          logo: z.string().optional(),
          website: z.string().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
          whatsapp: z.string().optional(),
          mercadoPagoLink: z.string().optional(),
          expiresAt: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await createPartner({ ...input, active: true });
        return { success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          category: z.enum(["hotel", "restaurante", "sorveteria", "salao_beleza", "outro"]).optional(),
          description: z.string().optional(),
          logo: z.string().optional(),
          website: z.string().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
          whatsapp: z.string().optional(),
          active: z.boolean().optional(),
          expiresAt: z.date().nullable().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updatePartner(id, data as Parameters<typeof updatePartner>[1]);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deletePartner(input.id);
        return { success: true };
      }),
  }),

  // ─── Testimonials ───────────────────────────────────────────────────────────
  testimonials: router({
    list: publicProcedure.query(async () => getApprovedTestimonials()),

    adminList: adminProcedure.query(async () => getAllTestimonialsAdmin()),

    create: publicProcedure
      .input(
        z.object({
          authorName: z.string().min(1),
          content: z.string().min(10).max(1000),
          rating: z.number().min(1).max(5),
          spotId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Basic content moderation
        const forbidden = /\b(merda|porra|caralho|puta|fodase|política|político|presidente|eleição)\b/i;
        if (forbidden.test(input.content)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Seu depoimento contém palavras não permitidas." });
        }
        await createTestimonial({
          ...input,
          userId: ctx.user?.id,
          authorAvatar: ctx.user?.email ? undefined : undefined,
          approved: false,
        });
        return { success: true, message: "Depoimento enviado! Aguardando aprovação do administrador." };
      }),

    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await updateTestimonial(input.id, { approved: true });
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteTestimonial(input.id);
        return { success: true };
      }),
  }),

  // ─── Gallery ────────────────────────────────────────────────────────────────
  gallery: router({
    list: publicProcedure
      .input(z.object({ spotId: z.number().optional() }).optional())
      .query(async ({ input }) => getApprovedGalleryPhotos(input?.spotId)),

    adminList: adminProcedure.query(async () => getAllGalleryPhotosAdmin()),

    upload: protectedProcedure
      .input(
        z.object({
          base64: z.string(),
          mimeType: z.string(),
          caption: z.string().optional(),
          spotId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const ext = input.mimeType.split("/")[1] || "jpg";
        const key = `gallery/${ctx.user.id}-${Date.now()}.${ext}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await createGalleryPhoto({
          userId: ctx.user.id,
          spotId: input.spotId,
          url,
          storageKey: key,
          caption: input.caption,
          approved: false,
        });
        return { success: true, message: "Foto enviada! Aguardando aprovação do administrador." };
      }),

    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await updateGalleryPhoto(input.id, { approved: true });
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteGalleryPhoto(input.id);
        return { success: true };
      }),
  }),

  // ─── Donations ──────────────────────────────────────────────────────────────
  donations: router({
    register: publicProcedure
      .input(
        z.object({
          donorName: z.string().optional(),
          amount: z.string().optional(),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await createDonation({
          userId: ctx.user?.id,
          donorName: input.donorName,
          amount: input.amount,
          message: input.message,
        });
        return { success: true };
      }),

    adminList: adminProcedure.query(async () => getAllDonationsAdmin()),
  }),

  // ─── Feedback ───────────────────────────────────────────────────────────────
  feedbacks: router({
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          subject: z.string().min(1),
          message: z.string().min(1),
          feedbackType: z.enum(["sugestao", "reclamacao", "elogio", "outro"]).default("sugestao"),
          rating: z.number().min(1).max(5).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await createFeedback({
          userId: ctx.user?.id,
          name: input.name,
          email: input.email,
          subject: input.subject,
          message: input.message,
          feedbackType: input.feedbackType,
          rating: input.rating,
        });
        return { success: true };
      }),

    adminList: adminProcedure.query(async () => getAllFeedbacksAdmin()),

    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["novo", "lido", "respondido"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateFeedbackStatus(input.id, input.status);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteFeedback(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
