// The TypeScript definitions below are automatically generated.
// Do not touch them, or risk, your modifications being lost.

export enum Table {
  Call = "call",
  CallerId = "caller_id",
  IncomingNumber = "incoming_number",
  KnexMigrations = "knex_migrations",
  KnexMigrationsLock = "knex_migrations_lock",
  Lead = "lead",
  Phase = "phase",
  PhaseLead = "phase_lead",
  User = "user",
}

export type Tables = {
  "call": Call,
  "caller_id": CallerId,
  "incoming_number": IncomingNumber,
  "knex_migrations": KnexMigrations,
  "knex_migrations_lock": KnexMigrationsLock,
  "lead": Lead,
  "phase": Phase,
  "phase_lead": PhaseLead,
  "user": User,
};

export type Call = {
  id: number;
  user_id: number | null;
  lead_id: number | null;
  duration_ms: number | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  from_number: string;
  to_number: string;
  was_answered: boolean;
  status: string | null;
  twilio_call_sid: string | null;
  disconnected_at: Date | null;
};

export type CallerId = {
  id: number;
  user_id: number | null;
  twilio_sid: string;
  phone_number: string;
  created_at: Date;
  updated_at: Date;
};

export type IncomingNumber = {
  id: number;
  sid: string;
  phone_number: string;
  user_id: number | null;
  friendly_name: string | null;
  description: string | null;
  created_at: Date;
  updated_at: Date;
};

export type KnexMigrations = {
  id: number;
  name: string | null;
  batch: number | null;
  migration_time: Date | null;
};

export type KnexMigrationsLock = {
  index: number;
  is_locked: number | null;
};

export type Lead = {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  source: string | null;
  created_at: Date;
  updated_at: Date;
  user_id: number;
  call_count: number;
  sale_amount: number | null;
  sale_commission: number | null;
  sale_cost: number | null;
  sale_notes: string | null;
  sale_at: Date | null;
  notes: string | null;
};

export type Phase = {
  id: number;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
};

export type PhaseLead = {
  id: number;
  phase_id: number | null;
  lead_id: number | null;
  created_at: Date;
  updated_at: Date;
};

export type User = {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  timezone: string | null;
  phone: string | null;
  created_at: Date;
  updated_at: Date;
  approved_for_beta: boolean | null;
};

