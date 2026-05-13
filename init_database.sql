-- Script de Inicialização do Banco de Dados para "Turista no Pará"
-- Compatível com MySQL, Neon (via TiDB/MySQL compatibility) e TiDB Cloud

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `openId` varchar(64) NOT NULL,
  `name` text,
  `email` varchar(320),
  `loginMethod` varchar(64),
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_openId_unique` (`openId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Pontos Turísticos
CREATE TABLE IF NOT EXISTS `tourist_spots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `shortDescription` varchar(500),
  `city` enum('Belém','Ananindeua') NOT NULL DEFAULT 'Belém',
  `category` enum('museu','parque','monumento','gastronomia','religioso','natureza','entretenimento','outro') NOT NULL DEFAULT 'outro',
  `address` varchar(500) NOT NULL,
  `latitude` decimal(10,7),
  `longitude` decimal(10,7),
  `openingHours` varchar(500),
  `phone` varchar(50),
  `website` varchar(500),
  `coverImage` text,
  `images` text,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tourist_spots_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Empresas Parceiras
CREATE TABLE IF NOT EXISTS `partners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `category` enum('hotel','restaurante','sorveteria','salao_beleza','outro') NOT NULL DEFAULT 'outro',
  `description` text,
  `logo` text,
  `website` varchar(500),
  `phone` varchar(50),
  `address` varchar(500),
  `whatsapp` varchar(50),
  `mercadoPagoLink` varchar(500),
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `expiresAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Depoimentos
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `authorName` varchar(255) NOT NULL,
  `authorAvatar` text,
  `content` text NOT NULL,
  `rating` int NOT NULL DEFAULT '5',
  `spotId` int DEFAULT NULL,
  `approved` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `testimonials_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `testimonials_spotId_tourist_spots_id_fk` FOREIGN KEY (`spotId`) REFERENCES `tourist_spots` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Galeria de Fotos
CREATE TABLE IF NOT EXISTS `gallery_photos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `spotId` int DEFAULT NULL,
  `url` text NOT NULL,
  `storageKey` text,
  `caption` varchar(500),
  `approved` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `gallery_photos_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `gallery_photos_spotId_tourist_spots_id_fk` FOREIGN KEY (`spotId`) REFERENCES `tourist_spots` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Doações
CREATE TABLE IF NOT EXISTS `donations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `donorName` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `message` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `donations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alterar tabela de usuários para adicionar origem, estado e país
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `origin` enum('brasil','estrangeiro') NOT NULL DEFAULT 'brasil' AFTER `role`;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `state` varchar(100) AFTER `origin`;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `country` varchar(100) AFTER `state`;

-- Tabela de Feedback dos Usuários
CREATE TABLE IF NOT EXISTS `feedbacks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(320) NOT NULL,
  `subject` varchar(500) NOT NULL,
  `message` text NOT NULL,
  `rating` int DEFAULT NULL,
  `feedbackType` enum('sugestao','reclamacao','elogio','outro') NOT NULL DEFAULT 'sugestao',
  `status` enum('novo','lido','respondido') NOT NULL DEFAULT 'novo',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `feedbacks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INSERIR USUÁRIO ADMINISTRADOR PADRÃO
-- Substitua o 'admin-user' pelo seu identificador se necessário
INSERT INTO `users` (`openId`, `name`, `email`, `role`) 
VALUES ('admin-user', 'Administrador', 'admin@exemplo.com', 'admin')
ON DUPLICATE KEY UPDATE `role` = 'admin';
