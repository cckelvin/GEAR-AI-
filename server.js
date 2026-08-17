
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Environment Variables & Secrets
const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.VITE_GEAR_API || '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const VERCEL_TOKEN = process.env.VERCEL_TOKEN || '';
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || '';
const RENDER_API_KEY = process.env.RENDER_API_KEY || '';
const SPACESHIP_API_KEY = process.env.SPACESHIP_API_KEY || '';
const SPACESHIP_API_SECRET = process.env.SPACESHIP_API_SECRET || '';
const SPACESHIP_API_URL = (process.env.SPACESHIP_API_URL || "https://api.spaceship.com/v1").replace(/\/$/, "");

// GET / - Health Check
app.get('/', (req, res, next) => {
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    return next(); // Fall through to static serving or space serving
  }
  res.send('Gear AI backend is working 🚀');
});

// POST /ask - Gemini API Proxy (backward compatible)
app.post('/ask', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });
  
  const effectiveKey = req.headers['x-gemini-key'] || API_KEY;
  if (!effectiveKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

  try {
    const ai = new GoogleGenAI({ apiKey: effectiveKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: message }] }]
    });
    res.json({ text: response.text });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to generate content" });
  }
});

// POST /api/gemini/generate - Server-side Gemini proxy
app.post('/api/gemini/generate', async (req, res) => {
  const { contents, systemInstruction, model } = req.body;
  const effectiveKey = req.headers['x-gemini-key'] || API_KEY;
  
  if (!effectiveKey) {
    return res.status(500).json({ 
      error: "No Gemini API key found on server. Please add your key in Secrets & Environment or Settings." 
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: effectiveKey });
    const selectedModel = model || "gemini-3-flash-preview";
    
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: contents || [],
      config: {
        systemInstruction: systemInstruction || undefined
      }
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("Gemini Generate Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate content from Gemini" });
  }
});

// POST /api/gemini/stream - Server-side SSE Gemini streaming proxy
app.post('/api/gemini/stream', async (req, res) => {
  const { contents, systemInstruction, model } = req.body;
  const effectiveKey = req.headers['x-gemini-key'] || API_KEY;

  if (!effectiveKey) {
    return res.status(500).json({ 
      error: "No Gemini API key found on server. Please configure your key in Secrets & Environment." 
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: effectiveKey });
    const selectedModel = model || "gemini-3-flash-preview";

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const streamResponse = await ai.models.generateContentStream({
      model: selectedModel,
      contents: contents || [],
      config: {
        systemInstruction: systemInstruction || undefined
      }
    });

    for await (const chunk of streamResponse) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "Failed to stream content from Gemini" });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
});

// POST /api/secrets/test - Test secret/key connectivity
app.post('/api/secrets/test', async (req, res) => {
  const { type, key, secret } = req.body;
  
  if (!key) {
    return res.status(400).json({ success: false, error: "Key value is required for testing." });
  }

  try {
    if (type === 'gemini' || type === 'ai') {
      const ai = new GoogleGenAI({ apiKey: key });
      const test = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Respond with the word: connected"
      });
      return res.json({ success: true, message: "Gemini API key is verified and operational!" });
    }

    if (type === 'spaceship') {
      const response = await fetch(`${SPACESHIP_API_URL}/domains/available`, {
        method: "POST",
        headers: {
          "X-API-Key": key,
          "X-API-Secret": secret || '',
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ domains: ["example-test-connection.com"] })
      });
      if (response.ok || response.status === 200 || response.status === 400) {
        return res.json({ success: true, message: "Spaceship credentials successfully connected!" });
      } else {
        const data = await response.json().catch(() => ({}));
        return res.status(400).json({ success: false, error: data.message || `Spaceship responded with status ${response.status}` });
      }
    }

    if (type === 'render') {
      const response = await fetch(`https://api.render.com/v1/services?limit=1`, {
        headers: { "Authorization": `Bearer ${key}` }
      });
      if (response.ok) {
        return res.json({ success: true, message: "Render API key connected successfully!" });
      } else {
        return res.status(400).json({ success: false, error: "Render API key invalid or unauthorized." });
      }
    }

    return res.json({ success: true, message: "Key configured successfully." });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message || "Connection test failed" });
  }
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    supabase: !!SUPABASE_URL,
    hasGeminiKey: !!API_KEY,
    hasSpaceshipKey: !!SPACESHIP_API_KEY
  });
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
  const { name, files, platform } = req.body;
  
  if (platform === 'render') {
    if (!RENDER_API_KEY) return res.status(500).json({ error: "RENDER_API_KEY not configured" });
    
    try {
      // Render typically deploys from GitHub. 
      // For a "direct" deploy, we might just be triggering a deploy of an existing service
      // or providing instructions. For now, let's assume we're triggering a deploy.
      const response = await fetch(`https://api.render.com/v1/services`, {
        headers: {
          "Authorization": `Bearer ${RENDER_API_KEY}`,
          "Accept": "application/json"
        }
      });
      const services = await response.json();
      const service = services.find(s => s.service.name === name);
      
      if (service) {
        const deployRes = await fetch(`https://api.render.com/v1/services/${service.service.id}/deploys`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RENDER_API_KEY}`,
            "Content-Type": "application/json"
          }
        });
        const deployData = await deployRes.json();
        return res.json({ url: service.service.serviceDetails.url, inspectUrl: `https://dashboard.render.com/static/${service.service.id}` });
      } else {
        return res.status(404).json({ error: "Render service not found. Please create it first in the Render dashboard." });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Default to Vercel for now if no platform or vercel
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

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  // Serve static files from the Vite build directory
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  
  // Fallback to index.html for SPA routing
  app.get('*', (req, res, next) => {
    // Skip if it's a space slug
    const pathName = req.path;
    const slug = pathName.split('/')[1];
    const reserved = ['api', 'chat', 'editor', 'dashboard', 'integrations', 'auth', 'domains', 'view', 'static', 'assets', 'favicon', 'manifest', 'logo', 'robots.txt', 'ask'];
    if (!reserved.includes(slug) && !pathName.includes('.') && SUPABASE_URL) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

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

  // Load environment variables from .env.json if present
  const envObj = {};
  const envFile = spaceFiles.find(f => f.file_name === '.env.json');
  if (envFile) {
    try {
      const parsed = JSON.parse(envFile.content);
      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          if (item && item.name && item.value) {
            envObj[item.name] = item.value;
          }
        });
      }
    } catch (e) {}
  }

  // Strip redundant script tags pointing to workspace files
  const localFileNames = spaceFiles.map(f => f.file_name);
  const cleanWorkspaceScriptTags = (contentStr) => {
    let res = contentStr;
    localFileNames.forEach(fn => {
      if (!fn) return;
      const escaped = fn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`<script[^>]*src=['"](?:\\.\\/)?${escaped}['"][^>]*>[\\s\\S]*?<\\/script>`, 'gi');
      res = res.replace(regex, '');
    });
    res = res.replace(/import\.meta\.env/g, '(window.importMetaEnv || window.process.env || window.ENV)');
    return res;
  };

  headContent = cleanWorkspaceScriptTags(headContent);
  bodyContent = cleanWorkspaceScriptTags(bodyContent);

  const cssFiles = spaceFiles.filter(f => f.file_name.endsWith('.css'));
  const cssContent = cssFiles.map(f => `/* ${f.file_name} */\n${f.content}`).join('\n\n');

  const jsFiles = spaceFiles.filter(f => f.file_name.endsWith('.js') || f.file_name.endsWith('.ts') || f.file_name.endsWith('.tsx'));
  const scripts = jsFiles.map(f => `
    <script type="module" data-filename="${f.file_name}">
      ${f.content
        .replace(/import\s+.*?\s+from\s+['"].*?['"];?/g, '')
        .replace(/import\.meta\.env/g, '(window.importMetaEnv || window.process.env || window.ENV)')
      }
    </script>
  `).join('\n');

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script>
          (function() {
            var env = ${JSON.stringify(envObj)};
            
            // Polyfill process and process.env
            window.process = window.process || {};
            window.process.env = Object.assign({}, window.process.env || {}, env);
            globalThis.process = window.process;
            
            // Polyfill importMetaEnv
            window.importMetaEnv = Object.assign({}, window.importMetaEnv || {}, env);
            globalThis.importMetaEnv = window.importMetaEnv;
            
            // Polyfill window.ENV and window.__ENV__
            window.ENV = Object.assign({}, window.ENV || {}, env);
            window.__ENV__ = Object.assign({}, window.__ENV__ || {}, env);
            globalThis.ENV = window.ENV;
            globalThis.__ENV__ = window.__ENV__;
            
            // Universal secret getter helpers for project code
            window.getSecret = function(name, fallback) {
              if (!name) return '';
              return (window.process?.env && window.process.env[name]) || window.ENV[name] || fallback || '';
            };
            window.getEnv = window.getSecret;
            globalThis.getSecret = window.getSecret;
            globalThis.getEnv = window.getEnv;
            
            // Expose directly on global scope
            var reserved = ['location', 'document', 'window', 'top', 'parent', 'self', 'length', 'name', 'status', 'origin', 'history', 'customElements'];
            for (var k in env) {
              if (k && !reserved.includes(k)) {
                try {
                  window[k] = env[k];
                  globalThis[k] = env[k];
                } catch(e) {}
              }
            }
            
            var secretKeys = Object.keys(env);
            if (secretKeys.length > 0) {
              console.log('⚡ [Gear Live Environment] ' + secretKeys.length + ' secret(s) injected into runtime:', secretKeys);
            }
            
            try {
              window.dispatchEvent(new CustomEvent('gear:env-ready', { detail: env }));
            } catch(e) {}
          })();
        </script>
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
