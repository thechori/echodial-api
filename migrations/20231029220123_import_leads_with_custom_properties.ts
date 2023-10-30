import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("lead", (table) => {
      table.jsonb("custom_properties"); // [ { name: "favorite_color", "label": "Favorite color", "type": "text", "value": "blue", "group": "contact_details" }, { ... } ]
    })
    .createTable("lead_property_type", (table) => {
      table.increments("id").primary(); // 0
      table.string("name").notNullable(); // single_line_text
      table.string("label").notNullable(); // Single-line text
      table.string("description"); // Basic text input property
    })
    .createTable("lead_property_group", (table) => {
      table.increments("id").primary(); // 0
      table.string("name").notNullable(); // contact_information
      table.string("label").notNullable(); // Contact information
      table.string("description"); // Information about the lead and how to get in contact with them
    })
    .createTable("lead_standard_property", (table) => {
      table.increments("id").primary(); // 1
      table
        .integer("lead_property_group_id") // 2 (Contact details)
        .unsigned()
        .references("id")
        .inTable("lead_property_group")
        .notNullable();
      table
        .integer("lead_property_type_id") // 3 (Single-line text)
        .unsigned()
        .references("id")
        .inTable("lead_property_type")
        .notNullable();
      table.string("name").notNullable(); // first_name
      table.string("label").notNullable(); // First name
      table.string("description"); // First name of the lead
    })
    .createTable("lead_custom_property", (table) => {
      table.increments("id").primary(); // 0
      table
        .integer("user_id") // 1 (thechori@gmail.com)
        .unsigned()
        .references("id")
        .inTable("user")
        .notNullable();
      table
        .integer("lead_property_group_id") // 2 (Contact details)
        .unsigned()
        .references("id")
        .inTable("lead_property_group")
        .notNullable();
      table
        .integer("lead_property_type_id") // 3 (Single-line text)
        .unsigned()
        .references("id")
        .inTable("lead_property_type")
        .notNullable();
      table.string("name").notNullable(); // favorite_color
      table.string("label").notNullable(); // Favorite color
      table.string("description"); // Helpful piece of data for establishing rapport with caller
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("lead", (table) => {
      table.dropColumn("custom_properties");
    })
    .dropTable("lead_standard_property")
    .dropTable("lead_custom_property")
    .dropTable("lead_property_type")
    .dropTable("lead_property_group");
}
