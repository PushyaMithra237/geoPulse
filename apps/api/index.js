import express from "express";
import cors from "cors";

const app = express();
const PORT = 4000;

// enable CORS for frontend (http://localhost:5173)
app.use(cors({ origin: "http://localhost:5173" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`GeoPulse API running at http://localhost:${PORT}`);
});
