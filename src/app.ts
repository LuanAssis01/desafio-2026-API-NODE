import express from "express";

import { errorHandler } from "./middlewares/error-handler";
import { notFoundHandler } from "./middlewares/not-found-handler";
import { routes } from "./routes";

export const app = express();

app.use(express.json());

app.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    service: "desafio-2026-api-node",
  });
});

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);
