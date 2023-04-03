import { Router } from "express";

import users from "./users/users.route";
import posts from "./posts/posts.route";
import { expressjwt } from "express-jwt";

export const router: Router = Router();

router.use("/users", users);
router.use("/posts", posts);
