
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Environment Variables
const API_KEY = process.env.API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
const SPACESHIP_API_KEY = process.env.SPACESHIP_API_KEY;
const SPACESHIP_API_SECRET = process.env.SPACESHIP_API_SECRET;
const SPACESHIP_API_URL = (process.env.SPACESHIP_API_URL || "https://api.spaceship.com/v1").replace(/\/$/, "");

// GET / - Health Check
app.get('/', (req, res, next) => {
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    return next(); // Fall through to static serving or space serving
  }
  res.send('Gear AI backend is working 🚀');
});

// POST /ask - Gemini API Proxy
app.post('/ask', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });
  if (!API_KEY) return res.status(500).json({ error: "API_KEY not configured" });

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', supabase: !!SUPABASE_URL });
});

app.get('/api/domains/check', async (req, res) => {
  const domain = req.query.domain;
  if (!domain) return res.status(400).json({ error: "Domain name is required." });
  
  try {
    const response = await fetch(`${SPACESHIP_API_URL}/domains/available`, {
      method: "POST",
      headers: {
        "X-API-Key": SPACESHIP_API_KEY || '',
        "X-API-Secret": SPACESHIP_API_SECRET || '',
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ domains: [domain] })
    });
    const data = await response.json();
    const result = data[0] || data.items?.[0];
    res.status(response.status).json(result || { error: "No data" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/deploy', async (req, res) => {
  const { name, files } = req.body;
  const vercelFiles = files.map(f => ({ file: f.name, data: f.content }));
  
  try {
    const response = await fetch(`https://api.vercel.com/v13/deployments${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name || "gear-studio-deployment",
        files: vercelFiles,
        projectSettings: { framework: null }
      })
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files from the Vite build directory
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Dynamic Space Serving (The "Folder" approach)
app.get('*', async (req, res, next) => {
  const host = req.headers.host || '';
  const pathName = req.path;
  const slug = pathName.split('/')[1];
  const reserved = ['api', 'chat', 'editor', 'dashboard', 'integrations', 'auth', 'domains', 'view', 'static', 'assets', 'favicon', 'manifest', 'logo', 'robots.txt', 'ask'];

  if (!reserved.includes(slug) && !pathName.includes('.') && SUPABASE_URL) {
    try {
      const isMainDomain = host.includes('gearstudio.space') || host.includes('onrender.com') || host.includes('localhost');
      let filter = isMainDomain ? `vercel_project_name=eq.${slug}` : `custom_domain=eq.${host}`;
      
      const spaceRes = await fetch(`${SUPABASE_URL}/rest/v1/spaces?${filter}&select=*`, {
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
      });
      const spaces = await spaceRes.json();
      const space = spaces[0];

      if (space) {
        const filesRes = await fetch(`${SUPABASE_URL}/rest/v1/space_files?space_id=eq.${space.id}&select=file_name,content`, {
          headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
        });
        const filesData = await filesRes.json();
        
        const html = generateCombinedCode(filesData);
        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(html);
      }
    } catch (error) {
      console.error("Space Serving Error:", error);
    }
  }

  // Fallback to index.html for SPA routing
  res.sendFile(path.join(distPath, 'index.html'));
});

function generateCombinedCode(spaceFiles) {
  const htmlFile = spaceFiles.find(f => f.file_name === 'index.html');
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

  const cssFiles = spaceFiles.filter(f => f.file_name.endsWith('.css'));
  const cssContent = cssFiles.map(f => `/* ${f.file_name} */\n${f.content}`).join('\n\n');

  const jsFiles = spaceFiles.filter(f => f.file_name.endsWith('.js') || f.file_name.endsWith('.ts') || f.file_name.endsWith('.tsx'));
  const scripts = jsFiles.map(f => `
    <script type="module" data-filename="${f.file_name}">
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
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
