import { Router } from "express";
import Controller from "./users.controller";

const users: Router = Router();
const controller = new Controller();

// Retrieve all Users
users.get("/", controller.getAllUsers);
users.post("/login", controller.login);
users.get("/me", controller.me);
users.get("/", controller.getAllUsers);
users.get("/:id", controller.getUserById);
users.post("/register", controller.createUser);
users.put("/:id", controller.updateUser);
users.delete("/:id", controller.deleteUser);
export default users;
