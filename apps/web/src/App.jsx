import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("Loading...");
  const [news, setNews] = useState([]);
  const [query, setQuery] = useState(""); // for search input
  const [loading, setLoading] = useState(false);

  // check backend health
  useEffect(() => {
    fetch("http://localhost:4000/api/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("Error connecting to API"));
  }, []);

  // fetch default news (general headlines)
  useEffect(() => {
    fetch("http://localhost:4000/api/news")
      .then((res) => res.json())
      .then((data) => setNews(data))
      .catch(() => setNews([]));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/news?country=${encodeURIComponent(query)}`);
      const data = await res.json();
      setNews(data);
    } catch (err) {
      console.error("Search failed:", err);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: "1600px", 
      margin: "0 auto", 
      padding: "40px",
      background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
      minHeight: "100vh"
    }}>
      <h1 style={{ textAlign: "center", marginBottom: "10px", color: "#f1f5f9", fontSize:"50px"}}>
        🌍 GeoPulse Dashboard
      </h1>
      <p style={{ textAlign: "center", color: "#94a3b8" }}>
        Backend status: <b>{status}</b>
      </p>

      {/* 🔍 Search bar */}
      <form 
        onSubmit={handleSearch}
        style={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: "10px", 
          marginTop: "30px" 
        }}
      >
        <input
          type="text"
          placeholder="Enter a country (e.g. India, Ukraine)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: "0.4",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid #475569",
            outline: "none",
            fontSize: "16px"
          }}
        />
        <button 
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 20px",
            borderRadius: "12px",
            background: "#2563eb",
            color: "white",
            fontSize: "16px",
            fontWeight: "600",
            border: "none",
            cursor: "pointer"
          }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      <h2 style={{ marginTop: "30px", color: "#f1f5f9" }}>📰 Latest News</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginTop: "15px"
        }}
      >
        {news.map((article) => (
          <div
            key={article.id}
            style={{
              background: "rgba(255,255,255,0.95)",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.10)",
              textAlign: "left",
              transition: "transform 0.2s",
              marginBottom: "15px"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <h3 style={{ margin: "0 0 10px", fontSize: "18px", color: "#1e293b" }}>
              {article.title}
            </h3>

            <p style={{ margin: "0 0 10px", fontSize: "14px", color: "#64748b" }}>
              {article.source} — {new Date(article.publishedAt).toLocaleString()}
            </p>

            {article.summary && (
              <p style={{ fontSize: "15px", color: "#334155", marginTop: "10px" }}>
                {article.summary}
              </p>
            )}

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: "10px",
                fontSize: "14px",
                color: "#2563eb",
                textDecoration: "none",
                fontWeight: "500"
              }}
            >
              Read Full Article →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
