import {
  boolean,
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  serial,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const originEnum = pgEnum("origin", ["brasil", "estrangeiro"]);
export const cityEnum = pgEnum("city", ["Belém", "Ananindeua"]);
export const categoryEnum = pgEnum("category", [
  "museu",
  "parque",
  "monumento",
  "gastronomia",
  "religioso",
  "natureza",
  "entretenimento",
  "outro",
]);
export const partnerCategoryEnum = pgEnum("partner_category", [
  "hotel",
  "restaurante",
  "sorveteria",
  "salao_beleza",
  "outro",
]);
export const feedbackTypeEnum = pgEnum("feedback_type", [
  "sugestao",
  "reclamacao",
  "elogio",
  "outro",
]);
export const feedbackStatusEnum = pgEnum("feedback_status", ["novo", "lido", "respondido"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  origin: originEnum("origin").default("brasil").notNull(),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const touristSpots = pgTable("tourist_spots", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  shortDescription: varchar("shortDescription", { length: 500 }),
  city: cityEnum("city").notNull().default("Belém"),
  category: categoryEnum("category").notNull().default("outro"),
  address: varchar("address", { length: 500 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  openingHours: varchar("openingHours", { length: 500 }),
  phone: varchar("phone", { length: 50 }),
  website: varchar("website", { length: 500 }),
  coverImage: text("coverImage"),
  images: text("images"), // JSON array of image URLs
  featured: boolean("featured").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TouristSpot = typeof touristSpots.$inferSelect;
export type InsertTouristSpot = typeof touristSpots.$inferInsert;

export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: partnerCategoryEnum("category").notNull().default("outro"),
  description: text("description"),
  logo: text("logo"),
  website: varchar("website", { length: 500 }),
  phone: varchar("phone", { length: 50 }),
  address: varchar("address", { length: 500 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  mercadoPagoLink: varchar("mercadoPagoLink", { length: 500 }),
  active: boolean("active").default(true).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id),
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorAvatar: text("authorAvatar"),
  content: text("content").notNull(),
  rating: integer("rating").notNull().default(5),
  spotId: integer("spotId").references(() => touristSpots.id),
  approved: boolean("approved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

export const galleryPhotos = pgTable("gallery_photos", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id),
  spotId: integer("spotId").references(() => touristSpots.id),
  url: text("url").notNull(),
  storageKey: text("storageKey"),
  caption: varchar("caption", { length: 500 }),
  approved: boolean("approved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GalleryPhoto = typeof galleryPhotos.$inferSelect;
export type InsertGalleryPhoto = typeof galleryPhotos.$inferInsert;

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id),
  donorName: varchar("donorName", { length: 255 }),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  message: text("message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = typeof donations.$inferInsert;

export const feedbacks = pgTable("feedbacks", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  message: text("message").notNull(),
  rating: integer("rating"),
  feedbackType: feedbackTypeEnum("feedbackType").notNull().default("sugestao"),
  status: feedbackStatusEnum("status").notNull().default("novo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = typeof feedbacks.$inferInsert;
