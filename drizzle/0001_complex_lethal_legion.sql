CREATE TABLE `fileMetadata` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileType` varchar(64) NOT NULL,
	`mimeType` varchar(128) NOT NULL,
	`fileSize` int NOT NULL,
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fileMetadata_id` PRIMARY KEY(`id`),
	CONSTRAINT `fileMetadata_fileKey_unique` UNIQUE(`fileKey`)
);
--> statement-breakpoint
CREATE TABLE `keyframes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`layerId` int NOT NULL,
	`frame` int NOT NULL,
	`property` varchar(64) NOT NULL,
	`value` varchar(255) NOT NULL,
	`easing` varchar(64) DEFAULT 'easeInOut',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `keyframes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `layers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`type` enum('notification','text','widget','background') NOT NULL,
	`name` varchar(255) NOT NULL,
	`zIndex` int DEFAULT 0,
	`visible` int DEFAULT 1,
	`locked` int DEFAULT 0,
	`data` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `layers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`backgroundUrl` varchar(512),
	`backgroundKey` varchar(512),
	`backgroundType` enum('image','video') DEFAULT 'image',
	`musicUrl` varchar(512),
	`musicKey` varchar(512),
	`duration` int DEFAULT 5000,
	`fps` int DEFAULT 30,
	`width` int DEFAULT 1080,
	`height` int DEFAULT 1920,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `fileMetadata` ADD CONSTRAINT `fileMetadata_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `keyframes` ADD CONSTRAINT `keyframes_layerId_layers_id_fk` FOREIGN KEY (`layerId`) REFERENCES `layers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `layers` ADD CONSTRAINT `layers_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;