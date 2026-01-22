import express from "express";
import { buildOnePagerRouter } from "./api/onepager.routes";

const app = express();

app.use(express.json());
app.use("/storage", express.static("storage"));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", buildOnePagerRouter());

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`API ayakta: http://localhost:${port}`);
});
