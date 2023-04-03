import { Router } from "express";
import Controller from "./posts.controller";

const posts: Router = Router();
const controller = new Controller();

posts.get("/", controller.getAllPosts);
posts.get("/:id", controller.getPostById);
posts.post("/", controller.createPost);
posts.put("/:id", controller.updatePost);
posts.delete("/:id", controller.deletePost);
export default posts;
