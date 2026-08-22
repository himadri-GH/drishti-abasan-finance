CREATE TABLE `payment_allocations` (
	`id` text PRIMARY KEY NOT NULL,
	`payment_id` text NOT NULL,
	`charge_id` text NOT NULL,
	`amount_applied` real NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`payment_id`) REFERENCES `payment_ledger`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`charge_id`) REFERENCES `monthly_charges`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_allocations_payment_charge` ON `payment_allocations` (`payment_id`,`charge_id`);--> statement-breakpoint
ALTER TABLE `payment_ledger` ADD `unapplied_amount` real DEFAULT 0 NOT NULL;