import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  donations,
  feedbacks,
  galleryPhotos,
  InsertDonation,
  InsertGalleryPhoto,
  InsertPartner,
  InsertTestimonial,
  InsertTouristSpot,
  InsertUser,
  partners,
  testimonials,
  touristSpots,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
      });
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { ...user };
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  
  if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
  }

  await db.insert(users).values(values).onConflictDoUpdate({
    target: users.openId,
    set: {
      name: user.name,
      email: user.email,
      loginMethod: user.loginMethod,
      lastSignedIn: user.lastSignedIn || new Date(),
      role: values.role,
      origin: user.origin,
      state: user.state,
      country: user.country,
      updatedAt: new Date(),
    }
  });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Tourist Spots ────────────────────────────────────────────────────────────

export async function getAllTouristSpots(filters?: { city?: string; category?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(touristSpots.active, true)];
  if (filters?.city) conditions.push(eq(touristSpots.city, filters.city as any));
  if (filters?.category) conditions.push(eq(touristSpots.category, filters.category as any));
  return db.select().from(touristSpots).where(and(...conditions)).orderBy(desc(touristSpots.featured), touristSpots.name);
}

export async function getFeaturedTouristSpots() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(touristSpots).where(and(eq(touristSpots.active, true), eq(touristSpots.featured, true))).limit(6);
}

export async function getTouristSpotBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(touristSpots).where(eq(touristSpots.slug, slug)).limit(1);
  return result[0];
}

export async function getTouristSpotById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(touristSpots).where(eq(touristSpots.id, id)).limit(1);
  return result[0];
}

export async function getAllTouristSpotsAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(touristSpots).orderBy(desc(touristSpots.createdAt));
}

export async function createTouristSpot(data: InsertTouristSpot) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(touristSpots).values(data);
}

export async function updateTouristSpot(id: number, data: Partial<InsertTouristSpot>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(touristSpots).set(data).where(eq(touristSpots.id, id));
}

export async function deleteTouristSpot(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(touristSpots).set({ active: false }).where(eq(touristSpots.id, id));
}

// ─── Partners ─────────────────────────────────────────────────────────────────

export async function getActivePartners() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(partners)
    .where(
      and(
        eq(partners.active, true),
        sql`(${partners.expiresAt} IS NULL OR ${partners.expiresAt} > NOW())`
      )
    )
    .orderBy(partners.name);
}

export async function getAllPartnersAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(partners).orderBy(desc(partners.createdAt));
}

export async function createPartner(data: InsertPartner) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(partners).values(data);
}

export async function updatePartner(id: number, data: Partial<InsertPartner>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(partners).set(data).where(eq(partners.id, id));
}

export async function deletePartner(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(partners).where(eq(partners.id, id));
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export async function getApprovedTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(testimonials)
    .where(eq(testimonials.approved, true))
    .orderBy(desc(testimonials.createdAt))
    .limit(20);
}

export async function getAllTestimonialsAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
}

export async function createTestimonial(data: InsertTestimonial) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(testimonials).values(data);
}

export async function updateTestimonial(id: number, data: Partial<InsertTestimonial>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(testimonials).set(data).where(eq(testimonials.id, id));
}

export async function deleteTestimonial(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(testimonials).where(eq(testimonials.id, id));
}

// ─── Gallery Photos ───────────────────────────────────────────────────────────

export async function getApprovedGalleryPhotos(spotId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(galleryPhotos.approved, true)];
  if (spotId) conditions.push(eq(galleryPhotos.spotId, spotId));
  return db.select().from(galleryPhotos).where(and(...conditions)).orderBy(desc(galleryPhotos.createdAt)).limit(50);
}

export async function getAllGalleryPhotosAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(galleryPhotos).orderBy(desc(galleryPhotos.createdAt));
}

export async function createGalleryPhoto(data: InsertGalleryPhoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(galleryPhotos).values(data);
}

export async function updateGalleryPhoto(id: number, data: Partial<InsertGalleryPhoto>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(galleryPhotos).set(data).where(eq(galleryPhotos.id, id));
}

export async function deleteGalleryPhoto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(galleryPhotos).where(eq(galleryPhotos.id, id));
}

// ─── Donations ────────────────────────────────────────────────────────────────

export async function createDonation(data: InsertDonation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(donations).values(data);
}

export async function getAllDonationsAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(donations).orderBy(desc(donations.createdAt));
}

// ─── Feedbacks ────────────────────────────────────────────────────────────────

export async function createFeedback(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(feedbacks).values(data);
}

export async function getAllFeedbacksAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(feedbacks).orderBy(desc(feedbacks.createdAt));
}

export async function updateFeedbackStatus(id: number, status: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(feedbacks).set({ status, updatedAt: new Date() }).where(eq(feedbacks.id, id));
}

export async function deleteFeedback(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(feedbacks).where(eq(feedbacks.id, id));
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

export async function seedTouristSpots() {
  const db = await getDb();
  if (!db) return;

  const existing = await db.select({ id: touristSpots.id }).from(touristSpots).limit(1);
  if (existing.length > 0) return;

  const spots: InsertTouristSpot[] = [
    {
      name: "Estação das Docas",
      slug: "estacao-das-docas",
      description: "A Estação das Docas é um complexo turístico e gastronômico localizado à beira do Rio Guamá, em Belém. Inaugurado em 2000, o espaço ocupa três antigos armazéns do Porto de Belém, construídos no início do século XX. O local reúne restaurantes, bares, lojas de artesanato, teatro e espaço cultural, com uma bela vista para a Baía do Guajará. É um dos pontos mais visitados da capital paraense, especialmente ao entardecer.",
      shortDescription: "Complexo gastronômico e cultural à beira do Rio Guamá, nos históricos armazéns do Porto de Belém.",
      city: "Belém",
      category: "entretenimento",
      address: "Bvd. Castilhos França, s/n - Campina, Belém - PA, 66010-020",
      latitude: "-1.4500",
      longitude: "-48.5000",
      openingHours: "Seg a Dom: 10h às 24h",
      phone: "(91) 3212-5525",
      website: "https://www.estacaodasdocas.com.br",
      coverImage: "https://images.unsplash.com/photo-1590076214667-c0f3c7e9027d?auto=format&fit=crop&q=80&w=1200",
      images: JSON.stringify(["https://images.unsplash.com/photo-1590076214667-c0f3c7e9027d?auto=format&fit=crop&q=80&w=1200"]),
      featured: true,
      active: true,
    },
    {
      name: "Mangal das Garças",
      slug: "mangal-das-garcas",
      description: "O Mangal das Garças é um parque ecológico e cultural situado às margens do Rio Guamá, em Belém. O parque abriga um borboletário, um viveiro de pássaros, um farol com vista panorâmica e um restaurante premiado. É um refúgio de natureza no coração da cidade.",
      shortDescription: "Parque ecológico com borboletário, viveiro de pássaros e vista panorâmica do Rio Guamá.",
      city: "Belém",
      category: "natureza",
      address: "R. Carneiro da Rocha, s/n - Cidade Velha, Belém - PA, 66020-160",
      latitude: "-1.4644",
      longitude: "-48.5044",
      openingHours: "Ter a Dom: 09h às 18h",
      phone: "(91) 3242-5052",
      website: "https://www.mangaldasgarcas.com.br",
      coverImage: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&q=80&w=1200",
      images: JSON.stringify(["https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&q=80&w=1200"]),
      featured: true,
      active: true,
    },
    {
      name: "Museu Paraense Emílio Goeldi",
      slug: "museu-emilio-goeldi",
      description: "O Museu Paraense Emílio Goeldi é a mais antiga instituição de pesquisa da região amazônica. Seu Parque Zoobotânico, localizado no centro de Belém, combina pesquisa científica com educação ambiental, abrigando diversas espécies da fauna e flora amazônicas em um ambiente histórico e preservado.",
      shortDescription: "Instituição científica e parque zoobotânico com fauna e flora amazônicas.",
      city: "Belém",
      category: "museu",
      address: "Av. Magalhães Barata, 376 - São Brás, Belém - PA, 66040-170",
      latitude: "-1.4528",
      longitude: "-48.4764",
      openingHours: "Qua a Dom: 09h às 15h",
      phone: "(91) 3194-1100",
      website: "https://www.gov.br/museugoeldi",
      coverImage: "https://images.unsplash.com/photo-1565118531796-763e5082d113?auto=format&fit=crop&q=80&w=1200",
      images: JSON.stringify(["https://images.unsplash.com/photo-1565118531796-763e5082d113?auto=format&fit=crop&q=80&w=1200"]),
      featured: true,
      active: true,
    }
  ];

  for (const spot of spots) {
    await db.insert(touristSpots).values(spot).onConflictDoNothing();
  }
}
