import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Vercel Deployment Endpoint
  app.post("/api/deploy", async (req, res) => {
    const { name, files } = req.body;
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
    const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

    if (!VERCEL_TOKEN) {
      return res.status(500).json({ error: "VERCEL_TOKEN is not configured in environment variables." });
    }

    try {
      // Prepare files for Vercel API
      // Vercel expects an array of objects with 'file' (path) and 'data' (content)
      const vercelFiles = files.map((f: { name: string, content: string }) => ({
        file: f.name,
        data: f.content
      }));

      const response = await fetch(`https://api.vercel.com/v13/deployments${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${VERCEL_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name || "gear-studio-deployment",
          files: vercelFiles,
          projectSettings: {
            framework: null // Standalone HTML/JS
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      res.json({
        url: `https://${data.url}`,
        id: data.id,
        inspectUrl: data.inspectorUrl
      });
    } catch (error: any) {
      console.error("Deployment error:", error);
      res.status(500).json({ error: error.message || "Failed to deploy to Vercel" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
