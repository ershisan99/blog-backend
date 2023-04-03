import * as bcrypt from "bcrypt";
import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sign } from "jsonwebtoken";
import { AuthenticatedRequest } from "../../types";
const prisma = new PrismaClient();

export default class UserController {
  public getAllUsers = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> => {
    try {
      const users = await prisma.user.findMany();
      return res.status(200).json({
        message: "Success",
        users,
      });
    } catch (e) {
      console.error(e);
      res.status(500).send({
        success: false,
        message: e.toString(),
      });
    }
  };
  public me = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> => {
    try {
      const userId = req.auth.userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Not authorized",
        });
      }

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (e) {
      console.error(e);
      res.status(500).send({
        success: false,
        message: e.toString(),
      });
    }
  };
  public getUserById = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> => {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (e) {
      console.error(e);
      res.status(500).send({
        success: false,
        message: e.toString(),
      });
    }
  };

  public createUser = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> => {
    try {
      const { email, password, username } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          username,
        },
      });

      return res.status(201).json({
        success: true,
        user: newUser,
      });
    } catch (e) {
      console.error(e);
      res.status(500).send({
        success: false,
        message: e.toString(),
      });
    }
  };

  public updateUser = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> => {
    try {
      const { id } = req.params;
      const { email, username } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: {
          email,
          username,
        },
      });

      return res.status(200).json({
        success: true,
        user: updatedUser,
      });
    } catch (e) {
      console.error(e);
      res.status(500).send({
        success: false,
        message: e.toString(),
      });
    }
  };

  public deleteUser = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      await prisma.post.deleteMany({
        where: { authorId: parseInt(id) },
      });

      await prisma.user.delete({
        where: { id: parseInt(id) },
      });

      return res.status(200).json({
        success: true,
        message: "User and their posts deleted successfully",
      });
    } catch (e) {
      console.error(e);
      res.status(500).send({
        success: false,
        message: e.toString(),
      });
    }
  };
  public login = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid password",
        });
      }
      const token = sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        success: true,
        message: "Logged in successfully",
        token,
      });
    } catch (e) {
      console.error(e);
      res.status(500).send({
        success: false,
        message: e.toString(),
      });
    }
  };
}
