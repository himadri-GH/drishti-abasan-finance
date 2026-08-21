CREATE TABLE `expense_ledger` (
	`id` text PRIMARY KEY NOT NULL,
	`society_id` text NOT NULL,
	`voucher_no` text NOT NULL,
	`expense_date` text NOT NULL,
	`category` text NOT NULL,
	`is_fixed_expense` integer DEFAULT false NOT NULL,
	`amount` real NOT NULL,
	`paid_to` text NOT NULL,
	`payment_mode` text NOT NULL,
	`reference_no` text,
	`description` text,
	`vendor_id` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`society_id`) REFERENCES `societies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendor_staff`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `expense_ledger_voucher_no_unique` ON `expense_ledger` (`voucher_no`);--> statement-breakpoint
CREATE TABLE `monthly_charges` (
	`id` text PRIMARY KEY NOT NULL,
	`billing_month` text NOT NULL,
	`amount_billed` real NOT NULL,
	`due_date` text NOT NULL,
	`is_paid` integer DEFAULT false NOT NULL,
	`contract_id` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`contract_id`) REFERENCES `ownership_contracts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `monthly_charges_contract_month` ON `monthly_charges` (`contract_id`,`billing_month`);--> statement-breakpoint
CREATE TABLE `owners` (
	`id` text PRIMARY KEY NOT NULL,
	`society_id` text NOT NULL,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`alternate_phone` text,
	`email` text,
	`permanent_address` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`society_id`) REFERENCES `societies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ownership_contracts` (
	`id` text PRIMARY KEY NOT NULL,
	`society_id` text NOT NULL,
	`contract_code` text NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`occupancy_type` text DEFAULT 'SELF_OCCUPIED' NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`monthly_rate` real NOT NULL,
	`opening_balance` real DEFAULT 0 NOT NULL,
	`owner_id` text NOT NULL,
	`property_unit_id` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`society_id`) REFERENCES `societies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_id`) REFERENCES `owners`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`property_unit_id`) REFERENCES `property_units`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payment_ledger` (
	`id` text PRIMARY KEY NOT NULL,
	`receipt_no` text NOT NULL,
	`payment_date` text NOT NULL,
	`amount_received` real NOT NULL,
	`income_category` text NOT NULL,
	`source_type` text NOT NULL,
	`payer_name` text NOT NULL,
	`applied_monthly_rate` real,
	`balance_before_payment` real,
	`month_covered` text,
	`contract_id` text,
	`payment_mode` text NOT NULL,
	`reference_no` text,
	`notes` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`contract_id`) REFERENCES `ownership_contracts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_ledger_receipt_no_unique` ON `payment_ledger` (`receipt_no`);--> statement-breakpoint
CREATE TABLE `property_units` (
	`id` text PRIMARY KEY NOT NULL,
	`society_id` text NOT NULL,
	`unit_code` text NOT NULL,
	`unit_type` text NOT NULL,
	`block` text,
	`floor_number` integer,
	`super_built_area` real,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`society_id`) REFERENCES `societies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `property_units_society_unit_code` ON `property_units` (`society_id`,`unit_code`);--> statement-breakpoint
CREATE TABLE `societies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`registration_no` text,
	`address` text,
	`currency` text DEFAULT 'INR' NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `treasury_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`society_id` text NOT NULL,
	`timestamp` text NOT NULL,
	`transaction_type` text NOT NULL,
	`balance_before` real NOT NULL,
	`amount_changed` real NOT NULL,
	`balance_after` real NOT NULL,
	`payment_id` text,
	`expense_id` text,
	FOREIGN KEY (`society_id`) REFERENCES `societies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`payment_id`) REFERENCES `payment_ledger`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`expense_id`) REFERENCES `expense_ledger`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `vendor_staff` (
	`id` text PRIMARY KEY NOT NULL,
	`society_id` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`phone` text,
	`monthly_salary` real,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`society_id`) REFERENCES `societies`(`id`) ON UPDATE no action ON DELETE no action
);
