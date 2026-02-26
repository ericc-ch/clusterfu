PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_repositories` (
	`owner` text NOT NULL,
	`repo` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`lastSyncAt` integer DEFAULT 0 NOT NULL,
	`errorMessage` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	PRIMARY KEY(`owner`, `repo`)
);
--> statement-breakpoint
INSERT INTO `__new_repositories`("owner", "repo", "status", "lastSyncAt", "errorMessage", "createdAt", "updatedAt") SELECT "owner", "repo", "status", "lastSyncAt", "errorMessage", "createdAt", "updatedAt" FROM `repositories`;--> statement-breakpoint
DROP TABLE `repositories`;--> statement-breakpoint
ALTER TABLE `__new_repositories` RENAME TO `repositories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;