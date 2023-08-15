import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("call", (table) => {
    table.string("twilio_call_sid", 255).defaultTo("").notNullable();
    table.timestamp("disconnected_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("call", (table) => {
    table.dropColumn("twilio_call_sid");
    table.dropColumn("disconnected_at");
  });
}
