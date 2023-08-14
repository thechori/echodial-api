import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("call", (table) => {
      table.string("from_number", 16).notNullable(); // +18326460869
      table.string("to_number", 16).notNullable(); // +13467871111
      table.boolean("was_answered").notNullable().defaultTo(false); // true
      table.string("status", 100); // Closed
      // Mark duration as nullable (when we first create the record, we do not have this value)
      table.integer("duration_ms").nullable().alter();
    })
    .alterTable("lead", (table) => {
      table
        .integer("user_id") // 2
        .unsigned()
        .references("id")
        .inTable("user")
        .notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("call", (table) => {
      table.dropColumn("from_number");
      table.dropColumn("to_number");
      table.dropColumn("was_answered");
      table.dropColumn("status");
      table
        .integer("duration_ms")
        .notNullable()
        .defaultTo(0)
        .comment("Duration of the call in milliseconds")
        .alter();
    })
    .alterTable("lead", (table) => {
      table.dropColumn("user_id");
    });
}
