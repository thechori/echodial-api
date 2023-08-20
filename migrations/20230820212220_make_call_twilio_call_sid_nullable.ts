import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("call", (table) => {
    table.string("twilio_call_sid", 255).nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("call", (table) => {
    table.string("twilio_call_sid", 255).defaultTo("").notNullable().alter();
  });
}
