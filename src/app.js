import express from "express";
import "../crons";
import path from "path";
import { mongoConnection } from "../model/connection";
import handleError from "./common/middlewares/error-handler.middleware";
import fs from "fs";
import session from "express-session";
import routes from "../routes/index";
import swagger from "./common/config/swagger.config";
import passport from "passport";
import "./common/config/jwt-strategy";
import ioConnection from "./chat/chat.connection";
import cors from "cors";
import "../seeder/index";
const MongoStore = require("connect-mongo");

require("dotenv").config();

const app = express();
mongoConnection();

const corsOptions = { origin: process.env.ALLOW_ORIGIN };
app.use(cors(corsOptions));

app.set("view engine", "ejs");
app.set("views", path.join(`${__dirname}../../src`, "views"));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "../public")));
app.use("/media", express.static(path.join(__dirname, "../media")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (process.env.ENV === "local") {
  app.use(
    session({
      secret: "hjs89d",
      resave: "false",
      store: MongoStore.create({
        mongoUrl: process.env.DB_MONGO_URL,
      }),
      saveUninitialized: "true",
    })
  );
} else {
  app.use(
    session({
      secret: "hjs89d",
      resave: "false",
      saveUninitialized: "true",
    })
  );
}
app.use("/api/documentation", swagger);
app.use("/", routes);
app.use(handleError);

const isSecure = process.env.IS_SECURE === "true";

if (isSecure) {
  let options;
  const environment = process.env.ENV || "local";

  if (environment == "production") {
    options = {
      key: fs.readFileSync(`${process.env.SSL_CERT_BASE_PATH}/private.key`),
      cert: fs.readFileSync(`${process.env.SSL_CERT_BASE_PATH}/cert.crt`),
    };
  } else {
    options = {
      key: fs.readFileSync(`${process.env.SSL_CERT_BASE_PATH}/privkey.pem`),
      cert: fs.readFileSync(`${process.env.SSL_CERT_BASE_PATH}/cert.pem`),
      ca: [
        fs.readFileSync(`${process.env.SSL_CERT_BASE_PATH}/cert.pem`),
        fs.readFileSync(`${process.env.SSL_CERT_BASE_PATH}/fullchain.pem`),
      ],
    };
  }

  var https = require("https").Server(options, app);
  ioConnection.attach(https);
  https.listen(process.env.PORT, () => {
    console.log(`Https server is running on ${process.env.BASE_URL}`);
  });
} else {
  var http = require("http").Server(app);
  ioConnection.attach(http);
  http.listen(process.env.PORT, () => {
    console.log(`listening at ${process.env.BASE_URL}`);
  });
}
