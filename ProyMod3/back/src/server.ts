import express from "express";
import routes from "./routes";
import "reflect-metadata";
import morgan from "morgan";
import cors from "cors";

const server = express();

server.use(express.json());
server.use(morgan("dev"));
server.use(cors());
server.use(routes);

export default server;
