import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("lead", (table) => {
      table.string("status", 50).defaultTo("new");
      table.boolean("do_not_call").defaultTo(false);
      table.boolean("contact_made").defaultTo(null);
      table.boolean("bad_number").defaultTo(false);
      table.boolean("left_message").defaultTo(false);
    })
    .createTable("lead_status", (table) => {
      table.increments("id").primary();
      table.string("value", 50).notNullable();
      table.string("label", 50).notNullable();
      table.string("description", 255);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("lead", (table) => {
      table.dropColumn("status");
      table.dropColumn("do_not_call");
      table.dropColumn("contact_made");
      table.dropColumn("bad_number");
      table.dropColumn("left_message");
    })
    .dropTable("lead_status");
}
