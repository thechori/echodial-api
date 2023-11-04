// The TypeScript definitions below are automatically generated.
// Do not touch them, or risk, your modifications being lost.

export enum Table {
  Bucket = "bucket",
  BucketLead = "bucket_lead",
  Call = "call",
  CallerId = "caller_id",
  IncomingNumber = "incoming_number",
  KnexMigrations = "knex_migrations",
  KnexMigrationsLock = "knex_migrations_lock",
  Lead = "lead",
  LeadCustomProperty = "lead_custom_property",
  LeadPropertyGroup = "lead_property_group",
  LeadPropertyType = "lead_property_type",
  LeadStandardProperty = "lead_standard_property",
  LeadStatus = "lead_status",
  PasswordResetToken = "password_reset_token",
  User = "user",
}

export type Tables = {
  "bucket": Bucket,
  "bucket_lead": BucketLead,
  "call": Call,
  "caller_id": CallerId,
  "incoming_number": IncomingNumber,
  "knex_migrations": KnexMigrations,
  "knex_migrations_lock": KnexMigrationsLock,
  "lead": Lead,
  "lead_custom_property": LeadCustomProperty,
  "lead_property_group": LeadPropertyGroup,
  "lead_property_type": LeadPropertyType,
  "lead_standard_property": LeadStandardProperty,
  "lead_status": LeadStatus,
  "password_reset_token": PasswordResetToken,
  "user": User,
};

export type Bucket = {
  id: number;
  user_id: number;
  name: string;
  description: string;
  min_call_count: number | null;
  max_call_count: number | null;
  min_answer_count: number | null;
  max_answer_count: number | null;
  min_interest_level: number | null;
  max_interest_level: number | null;
  has_appointment: boolean | null;
  requests_follow_up: boolean | null;
  not_interested: boolean | null;
  sold: boolean | null;
  archived: boolean | null;
  created_before: Date | null;
  created_after: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type BucketLead = {
  id: number;
  bucket_id: number;
  lead_id: number;
  bucket_id_manually_assigned: number | null;
  created_at: Date;
  updated_at: Date;
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
  answer_count: number | null;
  interest_level: number | null;
  appointment_at: Date | null;
  not_interested_reason: string | null;
  archived_at: Date | null;
  status: string | null;
  do_not_call: boolean | null;
  contact_made: boolean | null;
  bad_number: boolean | null;
  left_message: boolean | null;
  custom_properties: unknown | null;
};

export type LeadCustomProperty = {
  id: number;
  user_id: number;
  lead_property_group_id: number;
  lead_property_type_id: number;
  name: string;
  label: string;
  description: string | null;
};

export type LeadPropertyGroup = {
  id: number;
  name: string;
  label: string;
  description: string | null;
};

export type LeadPropertyType = {
  id: number;
  name: string;
  label: string;
  description: string | null;
};

export type LeadStandardProperty = {
  id: number;
  lead_property_group_id: number;
  lead_property_type_id: number;
  name: string;
  label: string;
  description: string | null;
};

export type LeadStatus = {
  id: number;
  value: string;
  description: string | null;
  label: string;
};

export type PasswordResetToken = {
  id: number;
  user_id: number;
  token: string | null;
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

