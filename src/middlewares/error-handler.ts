import { Request, Response } from "express";

export const errorHandler = (err: any, req: Request, res: Response) => {
  const statusCode = res.statusCode ? res.statusCode : 500;

  res.status(statusCode);

  res.json({
    message: err.message,
    stack: err.stack,
  });
};
