import asyncHandler from "express-async-handler";

// Display list of all Customers
export const getStripeCustomers = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Customer list");
});
