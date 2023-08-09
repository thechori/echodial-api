// The TypeScript definitions below are automatically generated.
// Do not touch them, or risk, your modifications being lost.

export enum Table {
  Call = "call",
  CallerId = "caller_id",
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
  "knex_migrations": KnexMigrations,
  "knex_migrations_lock": KnexMigrationsLock,
  "lead": Lead,
  "phase": Phase,
  "phase_lead": PhaseLead,
  "user": User,
};

export type Call = {
  id: number;
  user_id: number;
  lead_id: number;
  duration_ms: number;
  notes: string | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type CallerId = {
  id: number;
  user_id: number;
  twilio_sid: string;
  phone_number: string;
  created_at: Date | null;
  updated_at: Date | null;
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
  created_at: Date | null;
  updated_at: Date | null;
};

export type Phase = {
  id: number;
  name: string;
  description: string;
  created_at: Date | null;
  updated_at: Date | null;
};

export type PhaseLead = {
  id: number;
  phase_id: number;
  lead_id: number;
  created_at: Date | null;
  updated_at: Date | null;
};

export type User = {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  timezone: string | null;
  phone: string;
  created_at: Date | null;
  updated_at: Date | null;
};

