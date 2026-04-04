import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

const generateCombinedCode = (spaceFiles: { name: string, content: string }[]) => {
  const htmlFile = spaceFiles.find(f => f.name === 'index.html');
  let html = htmlFile?.content || '<div id="root"></div>';
  
  let bodyContent = html;
  let headContent = '';
  
  if (html.includes('<head')) {
    const headMatch = html.match(/<head[^>]*>([\s\S]*)<\/head>/i);
    if (headMatch) headContent = headMatch[1];
  }
  
  if (html.includes('<body')) {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) bodyContent = bodyMatch[1];
  }

  const cssFiles = spaceFiles.filter(f => f.name.endsWith('.css'));
  const cssContent = cssFiles.map(f => `/* ${f.name} */\n${f.content}`).join('\n\n');

  const jsFiles = spaceFiles.filter(f => f.name.endsWith('.js') || f.name.endsWith('.ts') || f.name.endsWith('.tsx'));
  const scripts = jsFiles.map(f => `
    <script type="module" data-filename="${f.name}">
      ${f.content.replace(/import\s+.*?\s+from\s+['"].*?['"];?/g, '')}
    </script>
  `).join('\n');

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/lucide@latest"></script>
        <script>
          (function() {
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;
            
            const sendToParent = (type, args) => {
              if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                  type: 'PREVIEW_LOG',
                  log: {
                    type,
                    message: args.map(arg => {
                      try {
                        return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                      } catch (e) {
                        return String(arg);
                      }
                    }).join(' '),
                    timestamp: new Date().toLocaleTimeString()
                  }
                }, '*');
              }
            };

            console.log = (...args) => {
              originalLog.apply(console, args);
              sendToParent('log', args);
            };
            console.error = (...args) => {
              originalError.apply(console, args);
              sendToParent('error', args);
            };
            console.warn = (...args) => {
              originalWarn.apply(console, args);
              sendToParent('warn', args);
            };

            window.onerror = (message, source, lineno, colno, error) => {
              sendToParent('error', [message, \`at \${lineno}:\${colno}\`]);
            };
          })();
        </script>
        ${headContent}
        <style>
          ${cssContent}
          body { margin: 0; padding: 0; background: #000; color: #fff; min-height: 100vh; }
          #root { min-height: 100vh; }
          .markdown-body { color: inherit; }
        </style>
      </head>
      <body>
        ${bodyContent}
        ${scripts}
        <script type="module">
          lucide.createIcons();
        </script>
      </body>
    </html>
  `;
};

app.use(express.json({ limit: '50mb' }));

// Dynamic Space Serving (The "Folder" analogy)
app.get('*', async (req, res, next) => {
  const host = req.headers.host || '';
  const url = req.path;
  const slug = url.split('/')[1];

  // Skip reserved paths and files
  const reserved = ['api', 'chat', 'editor', 'dashboard', 'integrations', 'auth', 'domains', 'view', 'static', 'assets', 'favicon', 'manifest', 'logo', 'robots.txt'];
  if (reserved.includes(slug) || url.includes('.') || url.startsWith('/api/')) {
    return next();
  }

  try {
    let query = supabase.from('spaces').select('*');
    const isMainDomain = host.includes('gearstudio.space') || host.includes('vercel.app') || host.includes('localhost');
    
    if (!isMainDomain) {
      query = query.eq('custom_domain', host);
    } else if (slug) {
      query = query.eq('vercel_project_name', slug);
    } else {
      return next();
    }

    const { data: space, error } = await query.single();
    if (error || !space) return next();

    const { data: filesData, error: filesError } = await supabase
      .from('space_files')
      .select('file_name, content')
      .eq('space_id', space.id);

    if (filesError || !filesData) return next();

    const html = generateCombinedCode(filesData.map(f => ({ name: f.file_name, content: f.content })));
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (err) {
    console.error("Space serving error:", err);
    next();
  }
});

// --- Domain Management Endpoints (Spaceship + Vercel) ---

const SPACESHIP_API_KEY = process.env.SPACESHIP_API_KEY;
const SPACESHIP_API_SECRET = process.env.SPACESHIP_API_SECRET;
const SPACESHIP_API_URL = (process.env.SPACESHIP_API_URL || "https://api.spaceship.com/v1").replace(/\/$/, "");

// Check Domain Availability
app.get("/api/domains/check", async (req, res) => {
  const { domain } = req.query;
  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: "Domain name is required." });
  }

  // Basic domain validation
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(domain)) {
    return res.status(400).json({ error: "Invalid domain format. Please enter a valid domain (e.g., example.com)." });
  }

  if (!SPACESHIP_API_KEY || !SPACESHIP_API_SECRET) {
    return res.status(500).json({ error: "Spaceship API credentials not configured." });
  }

  try {
    const response = await fetch(`${SPACESHIP_API_URL}/domains/available`, {
      method: "POST",
      headers: {
        "X-API-Key": SPACESHIP_API_KEY,
        "X-API-Secret": SPACESHIP_API_SECRET,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ domains: [domain] })
    });

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && (contentType.includes("application/json") || contentType.includes("application/problem+json"))) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error("Spaceship API Non-JSON Response:", text);
      return res.status(response.status).json({ 
        error: `Spaceship API returned non-JSON response (${response.status})`,
        details: text 
      });
    }

    if (!response.ok) {
      console.error("Spaceship API Error Status:", response.status);
      console.error("Spaceship API Error Body:", JSON.stringify(data, null, 2));
      return res.status(response.status).json({ 
        error: data.message || data.error || data.detail || `Spaceship API Error (${response.status})`,
        details: data 
      });
    }

    // The response for /domains/available is usually an array of results
    const result = data[0] || data.items?.[0];
    if (!result) {
      return res.status(404).json({ error: "No domain information returned from Spaceship." });
    }

    res.json({
      domain: result.domain,
      available: result.available,
      price: result.price,
      currency: result.currency,
      status: result.status
    });
  } catch (error: any) {
    console.error("Domain check exception:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred while checking domain availability" });
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

  if (!SPACESHIP_API_KEY || !SPACESHIP_API_SECRET) {
    return res.status(500).json({ error: "Spaceship API credentials not configured." });
  }

  try {
    // 1. Register Domain via Spaceship
    // Note: Registration requires contact information. Using placeholders for now.
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
        privacy: true,
        contacts: {
          registrant: {
            firstName: "Gear",
            lastName: "Studio",
            email: "admin@gear.space",
            phone: "+1.1234567890",
            address: "123 Gear St",
            city: "Tech City",
            state: "CA",
            zip: "90210",
            country: "US"
          },
          administrative: {
            firstName: "Gear",
            lastName: "Studio",
            email: "admin@gear.space",
            phone: "+1.1234567890",
            address: "123 Gear St",
            city: "Tech City",
            state: "CA",
            zip: "90210",
            country: "US"
          },
          technical: {
            firstName: "Gear",
            lastName: "Studio",
            email: "admin@gear.space",
            phone: "+1.1234567890",
            address: "123 Gear St",
            city: "Tech City",
            state: "CA",
            zip: "90210",
            country: "US"
          },
          billing: {
            firstName: "Gear",
            lastName: "Studio",
            email: "admin@gear.space",
            phone: "+1.1234567890",
            address: "123 Gear St",
            city: "Tech City",
            state: "CA",
            zip: "90210",
            country: "US"
          }
        }
      })
    });

    let registerData;
    const registerContentType = registerResponse.headers.get("content-type");
    if (registerContentType && (registerContentType.includes("application/json") || registerContentType.includes("application/problem+json"))) {
      registerData = await registerResponse.json();
    } else {
      const text = await registerResponse.text();
      console.error("Spaceship Register Non-JSON Response:", text);
      return res.status(registerResponse.status).json({ 
        error: `Spaceship Register returned non-JSON response (${registerResponse.status})`,
        details: text 
      });
    }

    if (!registerResponse.ok) {
      console.error("Spaceship Register Error:", JSON.stringify(registerData, null, 2));
      return res.status(registerResponse.status).json({ 
        error: registerData.message || registerData.error || registerData.detail || "Registration failed", 
        details: registerData 
      });
    }

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
  const vitePromise = createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(async (req, res, next) => {
    const vite = await vitePromise;
    vite.middlewares(req, res, next);
  });
} else {
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
