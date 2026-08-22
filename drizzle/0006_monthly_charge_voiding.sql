ALTER TABLE `monthly_charges` ADD `status` text DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE `monthly_charges` ADD `void_reason` text;--> statement-breakpoint
ALTER TABLE `monthly_charges` ADD `voided_at` text;
