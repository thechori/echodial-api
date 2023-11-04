import asyncHandler from "express-async-handler";

// Display list of all Customers
export const getStripeSubscriptions = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Subscriptions list");
});
