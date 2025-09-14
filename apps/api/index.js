import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { summarizeWithGemini } from "./gemini.js";  

dotenv.config({ path: "./.env" });
console.log("ENV CHECK -> GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Loaded ✅" : "Missing ❌");
console.log("ENV CHECK -> NEWS_API_KEY:", process.env.NEWS_API_KEY ? "Loaded ✅" : "Missing ❌");

console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
const app = express();
const PORT = 4000;

app.use(cors({ origin: "http://localhost:5173" }));

// health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// real news route with summarization
app.get("/api/news", async (req, res) => {
  try {
    const { country } = req.query;

    // build URL depending on search or default
    let url;
    if (country) {
      // search by country keyword (e.g. "India")
      url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        country
      )}&language=en&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`;
    } else {
      // default: top general headlines
      url = `https://newsapi.org/v2/top-headlines?language=en&category=general&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!data.articles) {
      return res.status(500).json({ error: "No articles returned from API" });
    }

    // only take 5 articles
    const articles = data.articles.slice(0, 5);

    // summarize each article with Gemini
    const summarised = await Promise.all(
      articles.map(async (article, idx) => {
        const textToSummarize =
          article.description || article.content || article.title;

        let summary = "Summary not available.";
        try {
          summary = await summarizeWithGemini(textToSummarize);
        } catch (e) {
          console.error("Failed to summarize article #", idx, e);
        }

        return {
          id: idx + 1,
          title: article.title,
          source: article.source.name,
          publishedAt: article.publishedAt,
          url: article.url,
          summary,
        };
      })
    );

    res.json(summarised);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});


app.listen(PORT, () => {
  console.log(`GeoPulse API running at http://localhost:${PORT}`);
});
