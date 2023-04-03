import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  auth: {
    userId: number;
    email: string;
    role: string;
  };
}
