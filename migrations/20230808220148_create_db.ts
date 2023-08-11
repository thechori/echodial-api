import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("user", (table) => {
      table.increments("id").primary();
      table.string("email", 255).notNullable().unique(); // thechori@gmail.com
      table.string("password_hash", 255).notNullable(); // d89fg78dfgdGDFGDF$%$#@#@34sdfs8f
      table.string("first_name", 255).notNullable(); // Raymund
      table.string("last_name", 255).notNullable(); // Teodoro
      table.string("timezone", 255); // America/Chicago or CST?
      table.string("phone", 12); // +18326460869
      //
      table.timestamps(true, true);
    })

    .createTable("caller_id", (table) => {
      table.increments("id").primary(); // 1
      table
        .integer("user_id") // 2
        .unsigned()
        .references("id")
        .inTable("user")
        .notNullable();
      table.string("twilio_sid", 255).notNullable(); // PN63589e2acc45ae058e148736186c7f52
      table.string("phone_number", 12).notNullable(); // +18326460869
      //
      table.timestamps(true, true);
    })

    .createTable("lead", (table) => {
      table.increments("id").primary(); // 1
      table.string("first_name", 255); // Raymund
      table.string("last_name", 255); // Teodoro
      table.string("email", 255); // thechori@gmail.com
      table.string("phone", 12).notNullable(); // +18326460869
      table.string("address1", 255); // 14715 Barryknoll Ln
      table.string("address2", 255); // Apt 129
      table.string("city", 255); // Houston
      table.string("state", 2); // TX
      table.string("zip", 9); // 77079-3151
      table.string("source", 255);
      //
      table.timestamps(true, true);
    })

    .createTable("call", (table) => {
      table.increments("id").primary(); // 1
      table
        .integer("user_id") // 2
        .unsigned()
        .references("id")
        .inTable("user")
        .notNullable();
      table
        .integer("lead_id") // 3
        .unsigned()
        .references("id")
        .inTable("lead")
        .notNullable();
      table
        .integer("duration_ms") // 300000 ms = 5 min
        .notNullable()
        .comment("Duration of the call in milliseconds");
      table.text("notes"); // This lead was a waste of time.
      //
      table.timestamps(true, true);
    })

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
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable("caller_id")
    .dropTable("phase_lead")
    .dropTable("phase")
    .dropTable("call")
    .dropTable("lead")
    .dropTable("user");
}
