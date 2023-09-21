import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable("phase_lead")
    .dropTable("phase")
    .createTable("bucket", (table) => {
      table.increments("id").primary(); // 1
      table
        .integer("user_id") // 1
        .unsigned()
        .references("id")
        .inTable("user")
        .notNullable();
      table.string("name", 255).notNullable(); // Fresh leads
      table.string("description", 255).notNullable(); // These are brand new leads from ABC Leads (1-10 days old)
      table.integer("min_call_count"); // 0
      table.integer("max_call_count"); // NULL
      table.integer("min_answer_count"); // NULL
      table.integer("max_answer_count"); // 0
      table.integer("min_interest_level"); // 1
      table.integer("max_interest_level"); // NULL
      table.boolean("has_appointment"); // TRUE
      table.boolean("requests_follow_up"); // FALSE
      table.boolean("not_interested"); // TRUE
      table.boolean("sold"); // FALSE
      table.boolean("archived"); // FALSE
      table.timestamp("created_before"); // Date
      table.timestamp("created_after"); // Date
      //
      table.timestamps(true, true);
    })
    .alterTable("lead", (table) => {
      table.integer("answer_count"); // 0
      table.integer("interest_level"); // 4 (out of 5) -- arbitrary numbers users can assign
      table.timestamp("appointment_at"); // Date
      table.text("not_interested_reason"); // Already owns insurance
      table.timestamp("archived_at"); // Date
    })
    .createTable("bucket_lead", (table) => {
      table.increments("id").primary(); // 0
      table
        .integer("bucket_id") // 1
        .unsigned()
        .references("id")
        .inTable("bucket")
        .notNullable();
      table
        .integer("lead_id") // 2
        .unsigned()
        .references("id")
        .inTable("lead")
        .notNullable();
      table
        .integer("bucket_id_manually_assigned") // NULL or 1
        .unsigned()
        .references("id")
        .inTable("bucket");
      //
      table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable("bucket_lead")
    .dropTable("bucket")
    .createTable("phase", (table) => {
      table.increments("id").primary(); // 1
      table.string("name", 255).notNullable(); // Fresh leads
      table.string("description", 255).notNullable(); // These are brand new leads from ABC Leads (1-10 days old)
      //
      table.timestamps(true, true);
    })
    .createTable("phase_lead", (table) => {
      table.increments("id").primary(); // 1
      table
        .integer("phase_id") // 2
        .unsigned()
        .references("id")
        .inTable("phase")
        .notNullable();
      table
        .integer("lead_id") // 3
        .unsigned()
        .references("id")
        .inTable("lead")
        .notNullable();
      //
      table.timestamps(true, true);
    })
    .alterTable("lead", (table) => {
      table.dropColumn("interest_level");
      table.dropColumn("answer_count");
      table.dropColumn("appointment_at");
      table.dropColumn("not_interested_reason");
      table.dropColumn("archived_at");
    });
}
