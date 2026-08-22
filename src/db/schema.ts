import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
};

export const societies = sqliteTable("societies", {
  id: text("id").primaryKey(), name: text("name").notNull(), registrationNo: text("registration_no"), address: text("address"), currency: text("currency").notNull().default("INR"), ...timestamps,
});
export const blocks = sqliteTable("blocks", {
  id: text("id").primaryKey(), societyId: text("society_id").notNull().references(() => societies.id), name: text("name").notNull(), description: text("description"), status: text("status").notNull().default("ACTIVE"), ...timestamps,
}, (table) => ({ societyBlockUnique: uniqueIndex("blocks_society_name").on(table.societyId, table.name) }));
export const owners = sqliteTable("owners", {
  id: text("id").primaryKey(), societyId: text("society_id").notNull().references(() => societies.id), fullName: text("full_name").notNull(), phone: text("phone").notNull(), alternatePhone: text("alternate_phone"), email: text("email"), permanentAddress: text("permanent_address"), ...timestamps,
});
export const propertyUnits = sqliteTable("property_units", {
  id: text("id").primaryKey(), societyId: text("society_id").notNull().references(() => societies.id), unitCode: text("unit_code").notNull(), unitType: text("unit_type").notNull(), block: text("block"), floorNumber: integer("floor_number"), superBuiltArea: real("super_built_area"), ...timestamps,
}, (table) => ({ unitCodeUnique: uniqueIndex("property_units_society_unit_code").on(table.societyId, table.unitCode) }));
export const ownershipContracts = sqliteTable("ownership_contracts", {
  id: text("id").primaryKey(), societyId: text("society_id").notNull().references(() => societies.id), contractCode: text("contract_code").notNull(), status: text("status").notNull().default("ACTIVE"), occupancyType: text("occupancy_type").notNull().default("SELF_OCCUPIED"), startDate: text("start_date").notNull(), endDate: text("end_date"), monthlyRate: real("monthly_rate").notNull(), openingBalance: real("opening_balance").notNull().default(0), ownerId: text("owner_id").notNull().references(() => owners.id), propertyUnitId: text("property_unit_id").notNull().references(() => propertyUnits.id), ...timestamps,
}, (table) => ({ contractCodeUnique: uniqueIndex("ownership_contracts_contract_code").on(table.contractCode), activeUnitUnique: uniqueIndex("ownership_contracts_active_unit").on(table.propertyUnitId).where(sql`${table.status} = 'ACTIVE'`) }));
export const monthlyCharges = sqliteTable("monthly_charges", {
  id: text("id").primaryKey(), billingMonth: text("billing_month").notNull(), amountBilled: real("amount_billed").notNull(), dueDate: text("due_date").notNull(), isPaid: integer("is_paid", { mode: "boolean" }).notNull().default(false), status: text("status").notNull().default("ACTIVE"), voidReason: text("void_reason"), voidedAt: text("voided_at"), contractId: text("contract_id").notNull().references(() => ownershipContracts.id), ...timestamps,
}, (table) => ({ contractMonthUnique: uniqueIndex("monthly_charges_contract_month").on(table.contractId, table.billingMonth) }));
export const vendorStaff = sqliteTable("vendor_staff", {
  id: text("id").primaryKey(), societyId: text("society_id").notNull().references(() => societies.id), name: text("name").notNull(), role: text("role").notNull(), phone: text("phone"), monthlySalary: real("monthly_salary"), status: text("status").notNull().default("ACTIVE"), ...timestamps,
});
export const paymentLedger = sqliteTable("payment_ledger", {
  id: text("id").primaryKey(), receiptNo: text("receipt_no").notNull().unique(), paymentDate: text("payment_date").notNull(), amountReceived: real("amount_received").notNull(), incomeCategory: text("income_category").notNull(), sourceType: text("source_type").notNull(), payerName: text("payer_name").notNull(), appliedMonthlyRate: real("applied_monthly_rate"), balanceBeforePayment: real("balance_before_payment"), unappliedAmount: real("unapplied_amount").notNull().default(0), monthCovered: text("month_covered"), contractId: text("contract_id").references(() => ownershipContracts.id), paymentMode: text("payment_mode").notNull(), referenceNo: text("reference_no"), notes: text("notes"), status: text("status").notNull().default("ACTIVE"), voidReason: text("void_reason"), voidedAt: text("voided_at"), ...timestamps,
});
export const expenseLedger = sqliteTable("expense_ledger", {
  id: text("id").primaryKey(), societyId: text("society_id").notNull().references(() => societies.id), voucherNo: text("voucher_no").notNull().unique(), expenseDate: text("expense_date").notNull(), category: text("category").notNull(), isFixedExpense: integer("is_fixed_expense", { mode: "boolean" }).notNull().default(false), amount: real("amount").notNull(), paidTo: text("paid_to").notNull(), paymentMode: text("payment_mode").notNull(), referenceNo: text("reference_no"), description: text("description"), vendorId: text("vendor_id").references(() => vendorStaff.id), status: text("status").notNull().default("ACTIVE"), voidReason: text("void_reason"), voidedAt: text("voided_at"), ...timestamps,
});
export const treasurySnapshots = sqliteTable("treasury_snapshots", {
  id: text("id").primaryKey(), societyId: text("society_id").notNull().references(() => societies.id), timestamp: text("timestamp").notNull(), transactionType: text("transaction_type").notNull(), balanceBefore: real("balance_before").notNull(), amountChanged: real("amount_changed").notNull(), balanceAfter: real("balance_after").notNull(), paymentId: text("payment_id").references(() => paymentLedger.id), expenseId: text("expense_id").references(() => expenseLedger.id), reversalOfSnapshotId: text("reversal_of_snapshot_id"),
});
export const paymentAllocations = sqliteTable("payment_allocations", {
  id: text("id").primaryKey(), paymentId: text("payment_id").notNull().references(() => paymentLedger.id), chargeId: text("charge_id").notNull().references(() => monthlyCharges.id), amountApplied: real("amount_applied").notNull(), status: text("status").notNull().default("ACTIVE"), createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
}, (table) => ({ paymentChargeUnique: uniqueIndex("payment_allocations_payment_charge").on(table.paymentId, table.chargeId) }));