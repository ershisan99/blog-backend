import { Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { AuthenticatedRequest } from "../../types";

const prisma = new PrismaClient();

export default class PostController {
  public getAllPosts = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> => {
    try {
      const posts = await prisma.post.findMany();
      return res.status(200).json({
        message: "Success",
        posts,
      });
    } catch (e) {
      console.error(e);
      res.status(500).send({
        success: false,
        message: e.toString(),
      });
    }
  };

  public getPostById = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> => {
    try {
      const { id } = req.params;
      const post = await prisma.post.findUnique({
        where: { id: parseInt(id) },
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      return res.status(200).json({
        success: true,
        post,
      });
    } catch (e) {
      console.error(e);
      res.status(500).send({
        success: false,
        message: e.toString(),
      });
    }
  };

  public createPost = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> => {
    try {
      const { title, content } = req.body;
      const authorId = req.auth.userId;

      const newPost = await prisma.post.create({
        data: {
          title,
          content,
          authorId,
        },
      });

      return res.status(201).json({
        success: true,
        post: newPost,
      });
    } catch (e) {
      console.error(e);
      res.status(500).send({
        success: false,
        message: e.toString(),
      });
    }
  };

  public updatePost = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> => {
    try {
      const { id } = req.params;
      const { title, content, published } = req.body;
      const authorId = req.auth.userId;

      const post = await prisma.post.findUnique({
        where: { id: parseInt(id) },
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      if (post.authorId !== authorId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this post",
        });
      }

      const updatedPost = await prisma.post.update({
        where: { id: parseInt(id) },
        data: {
          title,
          content,
          published,
        },
      });

      return res.status(200).json({
        success: true,
        post: updatedPost,
      });
    } catch (e) {
      console.error(e);
      res.status(500).send({
        success: false,
        message: e.toString(),
      });
    }
  };

  public deletePost = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<any> => {
    try {
      const { id } = req.params;
      const authorId = req.auth.userId;

      const post = await prisma.post.findUnique({
        where: { id: parseInt(id) },
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      if (post.authorId !== authorId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this post",
        });
      }

      await prisma.post.delete({
        where: { id: parseInt(id) },
      });

      return res.status(200).json({
        success: true,
        message: "Post deleted successfully",
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
