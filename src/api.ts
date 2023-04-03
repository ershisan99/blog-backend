import * as cors from "cors";
import * as express from "express";
import * as helmet from "helmet";
import * as morgan from "morgan";
import * as nocache from "nocache";
import { expressjwt } from "express-jwt";
import { router } from "./api-v1/";
import * as errorHandler from "./helpers/errorHandler";
import home from "./home";

class App {
  public express: express.Application;

  constructor() {
    this.express = express();
    this.setMiddlewares();
    this.setRoutes();
    this.catchErrors();
  }
  private setMiddlewares(): void {
    this.express.use(cors());
    this.express.use(morgan("dev"));
    this.express.use(nocache());
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: true }));
    this.express.use(
      expressjwt({
        secret: process.env.JWT_SECRET as string,
        algorithms: ["HS256"],
        requestProperty: "auth",
      }).unless({ path: ["/v1/users/login", "/v1/users/register"] })
    );
    this.express.use(helmet());
    this.express.use(express.static("public"));
  }

  private setRoutes(): void {
    this.express.use("/", home);
    this.express.use("/v1", router);
  }

  private catchErrors(): void {
    this.express.use(errorHandler.notFound);
    this.express.use(errorHandler.internalServerError);
  }
}

export default new App().express;
