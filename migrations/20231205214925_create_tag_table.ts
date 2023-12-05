import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("lead_tag", (table) => {
    table.increments("id").primary(); // 0
    table
      .integer("user_id") // 1 (thechori@gmail.com)
      .unsigned()
      .references("id")
      .inTable("user")
      .notNullable();
    table.string("name").notNullable();
    table.string("label").notNullable();
    table.string("color").notNullable(); //hex string
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("lead_tag");
}
