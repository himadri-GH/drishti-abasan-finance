ALTER TABLE `expense_ledger` ADD `status` text DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE `expense_ledger` ADD `void_reason` text;--> statement-breakpoint
ALTER TABLE `expense_ledger` ADD `voided_at` text;--> statement-breakpoint
ALTER TABLE `payment_ledger` ADD `status` text DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE `payment_ledger` ADD `void_reason` text;--> statement-breakpoint
ALTER TABLE `payment_ledger` ADD `voided_at` text;