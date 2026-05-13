-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
DO $$ BEGIN
    CREATE TYPE role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE origin AS ENUM ('brasil', 'estrangeiro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE city AS ENUM ('Belém', 'Ananindeua');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE category AS ENUM ('museu', 'parque', 'monumento', 'gastronomia', 'religioso', 'natureza', 'entretenimento', 'outro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE partner_category AS ENUM ('hotel', 'restaurante', 'sorveteria', 'salao_beleza', 'outro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE feedback_type AS ENUM ('sugestao', 'reclamacao', 'elogio', 'outro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE feedback_status AS ENUM ('novo', 'lido', 'respondido');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabelas
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    "openId" VARCHAR(64) NOT NULL UNIQUE,
    name TEXT,
    email VARCHAR(320),
    "loginMethod" VARCHAR(64),
    role role NOT NULL DEFAULT 'user',
    origin origin NOT NULL DEFAULT 'brasil',
    state VARCHAR(100),
    country VARCHAR(100),
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "lastSignedIn" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tourist_spots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    "shortDescription" VARCHAR(500),
    city city NOT NULL DEFAULT 'Belém',
    category category NOT NULL DEFAULT 'outro',
    address VARCHAR(500) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    "openingHours" VARCHAR(500),
    phone VARCHAR(50),
    website VARCHAR(500),
    "coverImage" TEXT,
    images TEXT,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category partner_category NOT NULL DEFAULT 'outro',
    description TEXT,
    logo TEXT,
    website VARCHAR(500),
    phone VARCHAR(50),
    address VARCHAR(500),
    whatsapp VARCHAR(50),
    "mercadoPagoLink" VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    "expiresAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id),
    "authorName" VARCHAR(255) NOT NULL,
    "authorAvatar" TEXT,
    content TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5,
    "spotId" INTEGER REFERENCES tourist_spots(id),
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_photos (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id),
    "spotId" INTEGER REFERENCES tourist_spots(id),
    url TEXT NOT NULL,
    "storageKey" TEXT,
    caption VARCHAR(500),
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id),
    "donorName" VARCHAR(255),
    amount DECIMAL(10, 2),
    message TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedbacks (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(320) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    rating INTEGER,
    "feedbackType" feedback_type NOT NULL DEFAULT 'sugestao',
    status feedback_status NOT NULL DEFAULT 'novo',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
