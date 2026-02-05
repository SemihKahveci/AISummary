import "dotenv/config";
import express from "express";
import cors from "cors";
import { buildOnePagerRouter } from "./api/onepager.routes";
import { buildChatRouter } from "./api/chat.routes";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? "*";
app.use(
  cors({
    origin: corsOrigin === "*" ? "*" : corsOrigin.split(","),
    methods: ["GET", "POST"],
  })
);
app.use(express.json());
app.use("/storage", express.static("storage"));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", buildOnePagerRouter());
app.use("/api", buildChatRouter());

const port = Number(process.env.PORT ?? 5055);
app.listen(port, () => {
  console.log(`API ayakta: http://localhost:${port}`);
});
