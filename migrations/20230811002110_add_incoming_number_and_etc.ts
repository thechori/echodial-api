import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("incoming_number", (table) => {
      table.increments("id").primary();
      table.string("sid", 255).notNullable().unique(); // PNb48b90626e4f24e675756a75e766ef52@gmail.com
      table.string("phone_number", 255).notNullable(); // +18322088992
      table
        .integer("user_id") // 2
        .unsigned()
        .references("id")
        .inTable("user");
      // .notNullable(); // Allowing null, this will indicate it belongs to EchoDial for misc purposes
      table.string("friendly_name", 255); // SMS Alert Line
      table.string("description", 255); // This number is used to send SMS alerts to users
      //
      table.timestamps(true, true);
    })

    .alterTable("user", (table) => {
      table
        .boolean("approved_for_beta") // This flag will dictate if a user is allowed to use our beta product
        .defaultTo(false);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable("incoming_number")
    .alterTable("user", (table) => {
      table.dropColumn("approved_for_beta");
    });
}
