DROP TABLE `invitations`;--> statement-breakpoint
DROP TABLE `members`;--> statement-breakpoint
DROP TABLE `organizations`;--> statement-breakpoint
ALTER TABLE `sessions` DROP COLUMN `impersonatedBy`;--> statement-breakpoint
ALTER TABLE `sessions` DROP COLUMN `activeOrganizationId`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `role`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `banned`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `banReason`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `banExpires`;