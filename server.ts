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

  // --- Domain Management Endpoints (Spaceship + Vercel) ---

  const SPACESHIP_API_KEY = process.env.SPACESHIP_API_KEY;
  const SPACESHIP_API_SECRET = process.env.SPACESHIP_API_SECRET;
  const SPACESHIP_API_URL = process.env.SPACESHIP_API_URL || "https://api.spaceship.com/v1";

  // Check Domain Availability
  app.get("/api/domains/check", async (req, res) => {
    const { domain } = req.query;
    if (!domain || typeof domain !== 'string') {
      return res.status(400).json({ error: "Domain name is required." });
    }

    if (!SPACESHIP_API_KEY || !SPACESHIP_API_SECRET) {
      return res.status(500).json({ error: "Spaceship API credentials not configured." });
    }

    try {
      const response = await fetch(`${SPACESHIP_API_URL}/domains/check`, {
        method: "POST",
        headers: {
          "X-API-Key": SPACESHIP_API_KEY,
          "X-API-Secret": SPACESHIP_API_SECRET,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ items: [domain] })
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);

      const result = data.items?.[0];
      res.json({
        domain: result.domain,
        available: result.available,
        price: result.price,
        currency: result.currency
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to check domain availability" });
    }
  });

  // Purchase and Configure Domain
  app.post("/api/domains/buy", async (req, res) => {
    const { domain, vercelProjectId } = req.body;
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
    const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

    if (!domain || !vercelProjectId) {
      return res.status(400).json({ error: "Domain and Vercel Project ID are required." });
    }

    try {
      // 1. Register Domain via Spaceship
      const registerResponse = await fetch(`${SPACESHIP_API_URL}/domains/register`, {
        method: "POST",
        headers: {
          "X-API-Key": SPACESHIP_API_KEY!,
          "X-API-Secret": SPACESHIP_API_SECRET!,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          domain: domain,
          years: 1,
          privacy: true
        })
      });

      const registerData = await registerResponse.json();
      if (!registerResponse.ok) return res.status(registerResponse.status).json({ error: "Registration failed", details: registerData });

      // 2. Configure DNS on Spaceship (Point to Vercel)
      // Vercel IP: 76.76.21.21
      await fetch(`${SPACESHIP_API_URL}/domains/${domain}/dns`, {
        method: "PUT",
        headers: {
          "X-API-Key": SPACESHIP_API_KEY!,
          "X-API-Secret": SPACESHIP_API_SECRET!,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          records: [
            { type: "A", name: "@", value: "76.76.21.21", ttl: 3600 },
            { type: "CNAME", name: "www", value: "cname.vercel-dns.com", ttl: 3600 }
          ]
        })
      });

      // 3. Attach Domain to Vercel Project
      const vercelResponse = await fetch(`https://api.vercel.com/v9/projects/${vercelProjectId}/domains${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${VERCEL_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: domain })
      });

      const vercelData = await vercelResponse.json();
      if (!vercelResponse.ok) return res.status(vercelResponse.status).json({ error: "Vercel attachment failed", details: vercelData });

      res.json({
        success: true,
        domain: domain,
        vercelStatus: vercelData
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to complete domain workflow" });
    }
  });

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
