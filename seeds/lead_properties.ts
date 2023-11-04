import { Knex } from "knex";
//
import {
  LeadPropertyGroup,
  LeadPropertyType,
  LeadStandardProperty,
} from "../src/types";

export async function seed(knex: Knex): Promise<void> {
  // Delete relationships first
  await knex("lead_standard_property").del();

  // Delete primary entities
  await knex("lead_property_group").del();
  await knex("lead_property_type").del();

  const leadPropertyGroups: Omit<LeadPropertyGroup, "id">[] = [
    {
      name: "contact_details",
      label: "Contact details",
      description: "Information about the lead",
    },
    {
      name: "activity_details",
      label: "Activity details",
      description: "Information regarding outreach to the lead",
    },
    {
      name: "deal_information",
      label: "Deal information",
      description: "Information about the deal with the lead",
    },
  ];

  const leadPropertyGroupResultIds: Pick<LeadPropertyGroup, "id">[] =
    await knex("lead_property_group")
      .insert(leadPropertyGroups)
      .returning("id");

  console.log("leadPropertyGroupResultIds", leadPropertyGroupResultIds);

  const leadPropertyTypes: Omit<LeadPropertyType, "id">[] = [
    {
      name: "text",
      label: "Text",
      description: "E.g., 'Some descriptive information'",
    },
    { name: "currency", label: "Currency", description: "E.g., $45.12" },
    { name: "date", label: "Date", description: "E.g., 12/20/1988 11:11 AM" },
    { name: "boolean", label: "Boolean", description: "E.g., true or false" },
    { name: "integer", label: "Number (whole)", description: "E.g., 45" },
    {
      name: "float",
      label: "Number (with decimal)",
      description: "E.g., 45.12",
    },
  ];

  const leadPropertyTypeResultIds: Pick<LeadPropertyType, "id">[] = await knex(
    "lead_property_type"
  )
    .insert(leadPropertyTypes)
    .returning("id");

  const leadStandardProperties: Omit<LeadStandardProperty, "id">[] = [
    {
      name: "first_name",
      label: "First name",
      description: "First name of the lead",
      lead_property_group_id: leadPropertyGroupResultIds[0].id,
      lead_property_type_id: leadPropertyTypeResultIds[0].id,
    },
    {
      name: "last_name",
      label: "Last name",
      description: "Last name of the lead",
      lead_property_group_id: leadPropertyGroupResultIds[0].id,
      lead_property_type_id: leadPropertyTypeResultIds[0].id,
    },
    {
      name: "email",
      label: "Email",
      description: "Email address of the lead",
      lead_property_group_id: leadPropertyGroupResultIds[0].id,
      lead_property_type_id: leadPropertyTypeResultIds[0].id,
    },
    {
      name: "phone",
      label: "Phone",
      description: "Phone number of the lead",
      lead_property_group_id: leadPropertyGroupResultIds[0].id,
      lead_property_type_id: leadPropertyTypeResultIds[0].id,
    },
    {
      name: "address1",
      label: "Street address or P.O. Box",
      description: "Street address of the lead",
      lead_property_group_id: leadPropertyGroupResultIds[0].id,
      lead_property_type_id: leadPropertyTypeResultIds[0].id,
    },
    {
      name: "address2",
      label: "Apt, suite, unit, building, floor, etc.",
      description:
        "Optional address details which may include which unit or apt",
      lead_property_group_id: leadPropertyGroupResultIds[0].id,
      lead_property_type_id: leadPropertyTypeResultIds[0].id,
    },
    {
      name: "city",
      label: "City",
      description: "City location of the lead",
      lead_property_group_id: leadPropertyGroupResultIds[0].id,
      lead_property_type_id: leadPropertyTypeResultIds[0].id,
    },
    {
      name: "state",
      label: "State",
      description: "State location of the lead",
      lead_property_group_id: leadPropertyGroupResultIds[0].id,
      lead_property_type_id: leadPropertyTypeResultIds[0].id,
    },
    {
      name: "zip",
      label: "ZIP code",
      description: "Zipcode of the lead",
      lead_property_group_id: leadPropertyGroupResultIds[0].id,
      lead_property_type_id: leadPropertyTypeResultIds[0].id,
    },
    {
      name: "source",
      label: "Source",
      description: "Origin of the lead import data (e.g., LeadPro)",
      lead_property_group_id: leadPropertyGroupResultIds[0].id,
      lead_property_type_id: leadPropertyTypeResultIds[0].id,
    },
    {
      name: "sale_amount",
      label: "Sale amount",
      description: "Total amount of the sale",
      lead_property_group_id: leadPropertyGroupResultIds[2].id,
      lead_property_type_id: leadPropertyTypeResultIds[1].id,
    },
    {
      name: "sale_commission",
      label: "Sale commission",
      description: "Total commission of the sale",
      lead_property_group_id: leadPropertyGroupResultIds[2].id,
      lead_property_type_id: leadPropertyTypeResultIds[1].id,
    },
    {
      name: "sale_cost",
      label: "Sale cost",
      description: "Total cost of the sale",
      lead_property_group_id: leadPropertyGroupResultIds[2].id,
      lead_property_type_id: leadPropertyTypeResultIds[1].id,
    },
    {
      name: "sale_notes",
      label: "Sale notes",
      description: "Notes regarding the sale",
      lead_property_group_id: leadPropertyGroupResultIds[2].id,
      lead_property_type_id: leadPropertyTypeResultIds[0].id,
    },
    {
      name: "sale_at",
      label: "Sale at",
      description: "Date of the sale",
      lead_property_group_id: leadPropertyGroupResultIds[2].id,
      lead_property_type_id: leadPropertyTypeResultIds[2].id,
    },
    {
      name: "notes",
      label: "Notes",
      description: "General notes regarding the lead",
      lead_property_group_id: leadPropertyGroupResultIds[0].id,
      lead_property_type_id: leadPropertyTypeResultIds[0].id,
    },
    {
      name: "interest_level",
      label: "Interest level",
      description: "Total cost of the sale",
      lead_property_group_id: leadPropertyGroupResultIds[1].id,
      lead_property_type_id: leadPropertyTypeResultIds[4].id,
    },
    {
      name: "appointment_at",
      label: "Appointment at",
      description: "Date of the next appointment",
      lead_property_group_id: leadPropertyGroupResultIds[1].id,
      lead_property_type_id: leadPropertyTypeResultIds[2].id,
    },
    {
      name: "not_interested_reason",
      label: "Not interested reason",
      description: "Reason why the lead is not interested",
      lead_property_group_id: leadPropertyGroupResultIds[1].id,
      lead_property_type_id: leadPropertyTypeResultIds[0].id,
    },
    {
      name: "status",
      label: "Status",
      description: "Status of the lead",
      lead_property_group_id: leadPropertyGroupResultIds[0].id,
      lead_property_type_id: leadPropertyTypeResultIds[0].id,
    },
    {
      name: "do_not_call",
      label: "Do not call (DNC)",
      description: "If the lead is marked as a Do Not Call (DNS) contact",
      lead_property_group_id: leadPropertyGroupResultIds[0].id,
      lead_property_type_id: leadPropertyTypeResultIds[3].id,
    },
    {
      name: "contact_made",
      label: "Contact made",
      description: "If contact was successfully made with the lead",
      lead_property_group_id: leadPropertyGroupResultIds[1].id,
      lead_property_type_id: leadPropertyTypeResultIds[3].id,
    },
    {
      name: "bad_number",
      label: "Bad number",
      description: "If the phone number was bad",
      lead_property_group_id: leadPropertyGroupResultIds[1].id,
      lead_property_type_id: leadPropertyTypeResultIds[3].id,
    },
    {
      name: "left_message",
      label: "Left message",
      description: "If a voicemail was left for the lead",
      lead_property_group_id: leadPropertyGroupResultIds[1].id,
      lead_property_type_id: leadPropertyTypeResultIds[3].id,
    },
  ];

  const leadStandardPropertyResults = await knex(
    "lead_standard_property"
  ).insert(leadStandardProperties);
}
