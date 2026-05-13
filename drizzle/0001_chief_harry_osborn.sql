CREATE TABLE `donations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`donorName` varchar(255),
	`amount` decimal(10,2),
	`message` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `donations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gallery_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`spotId` int,
	`url` text NOT NULL,
	`storageKey` text,
	`caption` varchar(500),
	`approved` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gallery_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` enum('hotel','restaurante','sorveteria','salao_beleza','outro') NOT NULL DEFAULT 'outro',
	`description` text,
	`logo` text,
	`website` varchar(500),
	`phone` varchar(50),
	`address` varchar(500),
	`whatsapp` varchar(50),
	`mercadoPagoLink` varchar(500),
	`active` boolean NOT NULL DEFAULT true,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`authorName` varchar(255) NOT NULL,
	`authorAvatar` text,
	`content` text NOT NULL,
	`rating` int NOT NULL DEFAULT 5,
	`spotId` int,
	`approved` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tourist_spots` (
	`id` int AUTO_INCREMENT NOT NULL,
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
	`featured` boolean NOT NULL DEFAULT false,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tourist_spots_id` PRIMARY KEY(`id`),
	CONSTRAINT `tourist_spots_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `donations` ADD CONSTRAINT `donations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gallery_photos` ADD CONSTRAINT `gallery_photos_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gallery_photos` ADD CONSTRAINT `gallery_photos_spotId_tourist_spots_id_fk` FOREIGN KEY (`spotId`) REFERENCES `tourist_spots`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `testimonials` ADD CONSTRAINT `testimonials_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `testimonials` ADD CONSTRAINT `testimonials_spotId_tourist_spots_id_fk` FOREIGN KEY (`spotId`) REFERENCES `tourist_spots`(`id`) ON DELETE no action ON UPDATE no action;