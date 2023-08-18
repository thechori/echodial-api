import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("call", (table) => {
      table.dropForeign("user_id");
      table
        .integer("user_id")
        .unsigned()
        .references("id")
        .inTable("user")
        .onDelete("SET NULL") // Mark user_id as NULL when User is deleted
        .alter();
      table.dropForeign("lead_id");
      table
        .integer("lead_id")
        .unsigned()
        .references("id")
        .inTable("lead")
        .onDelete("SET NULL") // Mark lead_id as NULL when Lead is deleted
        .alter();
    })

    .alterTable("phase_lead", (table) => {
      table.dropForeign("phase_id");
      table
        .integer("phase_id")
        .unsigned()
        .references("id")
        .inTable("phase")
        .onDelete("CASCADE") // Delete all PhaseLeads when a Phase is deleted
        .alter();
      table.dropForeign("lead_id");
      table
        .integer("lead_id")
        .unsigned()
        .references("id")
        .inTable("lead")
        .onDelete("CASCADE") // Delete all PhaseLeads when a Lead is deleted
        .alter();
    })
    .alterTable("caller_id", (table) => {
      table.dropForeign("user_id");
      table
        .integer("user_id")
        .unsigned()
        .references("id")
        .inTable("user")
        .onDelete("CASCADE") // Delete all CallerIds when a User is deleted
        .alter();
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("call", (table) => {
      table
        .integer("user_id")
        .unsigned()
        .references("id")
        .inTable("user")
        .notNullable()
        .alter();
      table
        .integer("lead_id")
        .unsigned()
        .references("id")
        .inTable("lead")
        .notNullable()
        .alter();
    })
    .alterTable("phase_lead", (table) => {
      table
        .integer("phase_id")
        .unsigned()
        .references("id")
        .inTable("phase")
        .notNullable()
        .alter();
      table
        .integer("lead_id")
        .unsigned()
        .references("id")
        .inTable("lead")
        .notNullable()
        .alter();
    })
    .alterTable("caller_id", (table) => {
      table
        .integer("user_id")
        .unsigned()
        .references("id")
        .inTable("user")
        .notNullable();
    });
}
