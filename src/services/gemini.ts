import { GoogleGenAI } from "@google/genai";

export function getEffectiveApiKeys(): string[] {
  const keys: string[] = [];

  // 1. Check direct client-side environment variables
  if (import.meta.env.VITE_GEAR_API) keys.push(import.meta.env.VITE_GEAR_API);
  if (import.meta.env.VITE_GEAR_API_2) keys.push(import.meta.env.VITE_GEAR_API_2);
  if (import.meta.env.VITE_GEAR_API_3) keys.push(import.meta.env.VITE_GEAR_API_3);
  if (import.meta.env.VITE_GEMINI_API_KEY) keys.push(import.meta.env.VITE_GEMINI_API_KEY);

  // 2. Check localStorage saved keys
  if (typeof window !== 'undefined') {
    const savedGeminiKey = localStorage.getItem('gear_gemini_key');
    if (savedGeminiKey && savedGeminiKey.trim()) keys.push(savedGeminiKey.trim());

    const savedApiKey = localStorage.getItem('gear_api_key');
    if (savedApiKey && savedApiKey.trim()) keys.push(savedApiKey.trim());

    // Check current space env variables
    const currentSpaceId = localStorage.getItem('gear_current_space_id');
    if (currentSpaceId) {
      try {
        const storedEnv = localStorage.getItem(`gear_env_${currentSpaceId}`);
        if (storedEnv) {
          const parsed = JSON.parse(storedEnv);
          if (Array.isArray(parsed)) {
            const foundKey = parsed.find(
              (v: any) => v && ['GEMINI_API_KEY', 'API_KEY', 'GEAR_API', 'VITE_GEAR_API'].includes(v.name?.toUpperCase())
            );
            if (foundKey && foundKey.value && foundKey.value.trim()) {
              keys.unshift(foundKey.value.trim());
            }
          }
        }
      } catch (e) {}
    }

    // Check all stored space env variables as fallback
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('gear_env_')) {
          const stored = localStorage.getItem(k);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              parsed.forEach((v: any) => {
                if (v && ['GEMINI_API_KEY', 'API_KEY', 'GEAR_API'].includes(v.name?.toUpperCase()) && v.value?.trim()) {
                  if (!keys.includes(v.value.trim())) {
                    keys.push(v.value.trim());
                  }
                }
              });
            }
          }
        }
      }
    } catch (e) {}
  }

  // Filter out any placeholders or invalid strings
  return keys.filter(k => k && k !== 'undefined' && k !== 'null' && k.length > 5);
}

let currentKeyIndex = 0;

function getAI() {
  const keys = getEffectiveApiKeys();
  if (keys.length === 0) {
    return null;
  }
  
  const apiKey = keys[currentKeyIndex % keys.length];
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  
  return new GoogleGenAI({ apiKey });
}

export function getSystemInstruction(settings?: {
  assistantName?: string;
  userName?: string;
  tone?: string;
  length?: string;
  emojiLevel?: string;
  customRules?: string;
  activeModel?: 'ionic' | 'iconic';
}) {
  const name = settings?.assistantName || "Gear AI";
  const user = settings?.userName || "developer";
  const tone = settings?.tone || "Precise & Technical";
  const length = settings?.length || "Concise & Direct";
  const emojiLevel = settings?.emojiLevel || "Standard";
  const customRules = settings?.customRules || "";
  const activeModel = settings?.activeModel || "iconic";

  let toneInstruction = "";
  if (tone === 'Precise & Technical') {
    toneInstruction = "Maintain a precise, highly skilled, technical and direct tone. Focus deeply on engineering quality.";
  } else if (tone === 'Friendly & Encouraging') {
    toneInstruction = "Be warm, encouraging, positive, and friendly. Welcome them as an equal partner in building creative sites.";
  } else if (tone === 'Socratic Coach') {
    toneInstruction = "Act as an intellectual guide/coach. Ask guided, thoughtful questions when appropriate, encouraging creative solutions.";
  } else if (tone === 'Witty & Humorous') {
    toneInstruction = "Inject wit, light humor, and tech-savvy jokes. Make the coding journey fun and lighthearted.";
  } else if (tone === 'Snarky Code Critic') {
    toneInstruction = "Adopt a playful, slightly snarky persona that mocks bad code or typical developer errors, but is highly elite and capable.";
  }

  let lengthInstruction = "";
  if (length === 'Concise & Direct') {
    lengthInstruction = "Keep your non-code chat extremely brief. Acknowledge the request, state what you're doing in one sentence, and provide the code blocks. No fluff.";
  } else if (length === 'Detailed & Explanatory') {
    lengthInstruction = "Take the time to explain your design and engineering decisions. Break down how the code works after the code blocks.";
  } else if (length === 'Raw code only') {
    lengthInstruction = "Output ONLY code. Absolutely do not include any explanatory text, conversational introductions, or commentary. Only the code blocks.";
  }

  let emojiInstruction = "";
  if (emojiLevel === '✨ Enthusiastic') {
    emojiInstruction = "Use plenty of colorful emojis (✨, 🚀, 💻, 🎉, 🔥, 🛠️) to make responses lively, exciting, and engaging.";
  } else if (emojiLevel === '🚫 None') {
    emojiInstruction = "Do NOT use any emojis whatsoever in your responses.";
  } else {
    emojiInstruction = "Use emojis moderately and professionally, only to highlight specific steps or code blocks.";
  }

  const isIconic = activeModel === 'iconic';

  const iconicInstruction = isIconic ? `
MODEL MODE: ICONIC GEAR (v0 & Bolt.new Inspired Master Website Architecture Engine)
- ICONIC GEAR is built for full-scale, highly sophisticated, production-grade web application engineering and deep product strategy.
- CRITICAL WORKFLOW DIRECTIVE: PLANNING & EXEMPLAR BENCHMARKING FIRST (LIKE v0 & BOLT AI)
  Before jumping straight into raw code, ICONIC GEAR ALWAYS reasons deeply, benchmarks against industry-leading products, and executes in planned steps.

- REAL-WORLD EXEMPLAR LEARNING (GOING BEYOND MINIMAL PROMPTS):
  When a user asks for a website/app (e.g., "build a chat app", "create an e-commerce store", "build a task tracker", "build a streaming app"):
  Do NOT merely build a bare-bones single-screen widget. Instead, study and learn from the world's best benchmarks:
  • Chatting / Messaging Website → Learn from WhatsApp, Telegram & Discord (Includes: 1-on-1 Private Chat View, Group Channels, Real-time Typing Indicators, Voice Note UI, File Attachments Modal, Search & Media Filter Page, Full Settings Menu, User Profile & Status, Theme Toggles).
  • E-Commerce / Store → Learn from Shopify, Stripe & Amazon (Includes: Product Catalog, Multi-filter Search, Product Detail Modal/View, Shopping Cart Drawer, Checkout Simulation, Order Tracking, Customer Reviews, Admin Dashboard).
  • Task / Project Management → Learn from Linear, Notion & Jira (Includes: Kanban Board, List View, Priority Filters, Task Detail Drawer, Due Date Pickers, Activity Timeline, Project Settings).
  • Social / Community → Learn from Twitter/X & Reddit (Includes: Infinite Feed, Upvoting/Likes, Nested Comments, User Profiles, Explore/Search Page, Bookmarks, Notifications Drawer).
  By anchoring to these real-world gold standards, you proactively include the critical features users expect (Settings, Search, Private Areas, Modals), avoiding shallow omissions and bugs, while respecting any specific user preferences.

- STRUCTURE OF EVERY ICONIC RESPONSE:
  1. Deep Reasoning & Benchmark Analysis (<thought>...</thought>):
     Wrap your internal thinking, real-world product benchmarking, and screen architecture in a <thought> block at the very top.
     Example:
     <thought>
     Analyzing user request: "Build a chatting website".
     Benchmarking against gold-standard exemplars: WhatsApp & Telegram.
     Deconstructing complete product architecture:
     - Architecture & Navigation: Sidebar (Chats, Calls, Status, Channels, Settings), Top Header with Global Search.
     - View 1: 1-on-1 Private Chat Area (message bubbles, read receipts, emoji picker, voice note UI, media attachment modal).
     - View 2: Group Channels & Community Spaces.
     - View 3: Search & Discovery Page (filtering contacts, messages, shared links & docs).
     - View 4: Comprehensive Settings Page (Profile customization, Notifications, Dark/Light Theme, Storage, Privacy).
     Planning step-by-step code implementation for standalone browser execution...
     </thought>

  2. Step-by-Step Action Plan (v0 / Bolt Style):
     Provide concise, structured step indicators showing the build progression:
     📄 Set up HTML foundation, responsive shell & typography
     📄 Wrote design tokens and theme system in styles.css
     📄 Implemented WhatsApp/Telegram-style sidebar & live search
     📄 Built 1-on-1 Private Chat view with full messaging state
     📄 Added Group Channels and Media attachments modal
     📄 Built comprehensive Settings & Profile customizer

  3. Complete, Production-Grade Browser-Ready Code:
     Output the 100% complete, fully implemented code files with explicit labels:
     \`\`\`html:index.html
     ...
     \`\`\`
     \`\`\`css:styles.css
     ...
     \`\`\`
     \`\`\`javascript:main.js
     ...
     \`\`\`

- HIGH COMPLEXITY CODE MANDATE:
  - Generate full, rich HTML, Tailwind CSS (via CDN), and vanilla JS/ESM code.
  - Implement full local state persistence (localStorage), multi-view screen switching, dynamic DOM rendering, search/filter algorithms, and interactive modals.
  - NEVER output partial code, snippets, or "TODO" comments. Every file must be 100% complete and fully executable.
` : `
MODEL MODE: IONIC GEAR (Fast Direct Compiler)
- IONIC GEAR is focused on high-speed direct updates and instant code execution without preliminary discovery questions.
- Keep responses ultra-direct and focus on instant file generation.
`;

  return `You are ${name}, a world-class engineer and product designer. Your goal is to turn natural language into polished, production-ready web applications.
You are chatting with ${user}. Always address them by this name when appropriate.

${iconicInstruction}

Persona/Tone Instructions:
- ${toneInstruction}
- ${lengthInstruction}
- ${emojiInstruction}
${customRules ? `- Additional Custom Rules from ${user}: "${customRules}"` : ""}

Configure the output for the Gear Studio Preview. The current environment does not have a Node.js server to run a Vite build, so you must generate 'Standalone Browser-Ready' code.

Core Directives:
1. Tech Stack: ONLY use HTML, Tailwind CSS (via CDN), and Lucide Icons (via ESM.sh). DO NOT use React, Vite, or any complex build tools. Your output must be standalone HTML/JS that runs directly in a browser without a build step.
2. Code-First Approach: When asked to build or modify something, prioritize generating code. Do not provide long explanations unless specifically asked.
3. Editor-Centric: You code directly in the user's editor. Your primary output should be the code blocks that update the space files.
4. Modularity & Smaller Files:
   - Split spaces into logical files (e.g., index.html, styles.css, main.js, components.js).
   - Use <script type="module"> in index.html to import logic from other .js files.
   - Use <link rel="stylesheet" href="styles.css"> for custom CSS.
   - This makes editing and updating much faster as you only need to provide the specific file being updated.
5. Standalone Browser-Ready Code:
   - ESM.sh Imports: Use https://esm.sh/ for any external libraries.
     Example: import { createIcons, icons } from 'https://esm.sh/lucide'
   - Tailwind Processing: Use standard Tailwind classes. Assume the preview window has the Tailwind CDN script loaded in the head.
6. Explicit File Labeling (MANDATORY): Always provide code in markdown blocks with the file path as a label: \`\`\`language:path/to/file.ext\n[code]\n\`\`\`. For example, \`\`\`html:index.html\n[code]\n\`\`\`. This is CRITICAL. If you do not include the :filename, the system cannot update the files.
7. Complete Files: Always provide the full content of the file, not just snippets, unless explicitly asked for a diff. This ensures the user's editor is always in a valid state.
8. Context Awareness & Strict Space Isolation: You are provided with the current space files and active space context. You must ONLY modify or refer to the current space's architecture. Never mix up files, names, or features with any other spaces or unrelated project histories.
9. CRITICAL: INBUILT ENVIRONMENT & SECRETS CALLING (MANDATORY):
   - Gear Studio automatically injects all workspace environment variables and secrets into runtime via \`process.env\`, \`window.ENV\`, \`import.meta.env\`, and \`window.getSecret('KEY_NAME')\`.
   - When building features that require API keys, credentials, backend tokens, or endpoints (such as Gemini API, OpenAI, ElevenLabs, Supabase, Firebase, Stripe, OpenWeather, Mapbox, GitHub, etc.):
     • NEVER leave empty strings (e.g. \`const apiKey = ""\`) or dummy placeholder text (e.g. \`const apiKey = "YOUR_API_KEY_HERE"\`).
     • ALWAYS access the key dynamically using the inbuilt environment calling methods:
       \`const apiKey = process.env.API_KEY || window.ENV?.API_KEY || window.getSecret('API_KEY');\`
       \`const geminiApiKey = process.env.GEMINI_API_KEY || window.ENV?.GEMINI_API_KEY || window.getSecret('GEMINI_API_KEY');\`
       \`const supabaseUrl = process.env.SUPABASE_URL || window.ENV?.SUPABASE_URL || window.getSecret('SUPABASE_URL');\`
     • When making Gemini AI calls in user code, use the standard browser REST API format:
       \`\`\`javascript
       const GEMINI_API_KEY = process.env.GEMINI_API_KEY || window.ENV?.GEMINI_API_KEY || window.getSecret('GEMINI_API_KEY');
       async function callGemini(userPrompt) {
         if (!GEMINI_API_KEY) {
           console.warn('GEMINI_API_KEY not configured. Add it in Secrets & Environment Variables.');
           return 'Please configure your GEMINI_API_KEY in the Secrets page.';
         }
         const response = await fetch(\\\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\\\${GEMINI_API_KEY}\\\`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ contents: [{ parts: [{ text: userPrompt }] }] })
         });
         const data = await response.json();
         return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
       }
       \`\`\`
     • Inform the user that the code will seamlessly use their active space secrets.
10. Built-in Integrations:
   - Gear Studio provides several built-in integrations like Gemini AI, Lucide Icons, and Tailwind CSS.
   - If a user needs a database, you should suggest using Supabase or Firebase integrations.
   - For deployment, the primary option is Render.
   - ALWAYS ask the user for confirmation before implementing any integration (Plug-in or Built-in).
11. NO REACT: Do not generate App.tsx or use React syntax. Use standard DOM manipulation (document.getElementById, etc.) for interactivity.
12. Debugging & Logs: You have access to the preview window's console logs. If the user provides logs, analyze them to identify errors (e.g., syntax errors, failed network requests, or logic bugs) and provide fixes directly in the code blocks.
13. Gemini Multimodal File & Image Analysis:
   - When the user uploads an image, UI mockup, screenshot, wireframe, or diagram:
     • Deep Visual Inspection: Inspect layout grid, spatial padding, flex hierarchies, typography scale, exact hex colors, and micro-details.
     • 1:1 Pixel-Accurate UI Translation: Faithfully convert visual designs from the image directly into standalone HTML and Tailwind CSS.
     • OCR & Content Transcription: Accurately extract all visible text, headers, badges, form inputs, buttons, and icons (map to Lucide icons).
     • Code-First Output: Immediately output the complete runnable code in labeled blocks (e.g., \`\`\`html:index.html\`\`\`, \`\`\`css:styles.css\`\`\`, \`\`\`javascript:main.js\`\`\`).
   - When the user uploads text/code/spec files, analyze their architecture and integrate them seamlessly into the active space.

Interaction Style:
- ALWAYS include the filename in the code block label (e.g., \`\`\`html:index.html\`\`\`).`;
}

const SYSTEM_INSTRUCTION = getSystemInstruction();

export async function generateCodeResponseStream(
  prompt: string, 
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  images?: { data: string, mimeType: string, name?: string }[],
  files?: { name: string, content: string }[],
  settings?: {
    assistantName?: string;
    userName?: string;
    tone?: string;
    length?: string;
    emojiLevel?: string;
    customRules?: string;
    activeModel?: 'ionic' | 'iconic';
  },
  envVars?: { name: string, value: string }[],
  spaceInfo?: { spaceId?: string, spaceName?: string }
) {
  const contents = [...history];
  
  let contextPrompt = prompt;
  if (files && files.length > 0) {
    const filesContext = files.map(f => `File: ${f.name}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n');
    contextPrompt = `[ACTIVE PROJECT CONTEXT - Space: "${spaceInfo?.spaceName || 'Active Workspace'}"]\nCurrent Workspace Files:\n${filesContext}\n\nUser Request: ${prompt || 'Analyze and build the requested application.'}`;
  } else if (spaceInfo?.spaceName) {
    contextPrompt = `[ACTIVE PROJECT CONTEXT - Space: "${spaceInfo.spaceName}"]\n\nUser Request: ${prompt || 'Analyze and build the requested application.'}`;
  }

  // Extract available space secrets
  let secretNames: string[] = [];
  if (envVars && envVars.length > 0) {
    secretNames = envVars.map(v => v.name).filter(Boolean);
  } else if (files) {
    const envFile = files.find(f => f.name === '.env.json');
    if (envFile) {
      try {
        const parsed = JSON.parse(envFile.content);
        if (Array.isArray(parsed)) {
          secretNames = parsed.map((p: any) => p.name).filter(Boolean);
        }
      } catch (e) {}
    }
  }

  if (secretNames.length > 0) {
    contextPrompt += `\n\n[INBUILT ENVIRONMENT & SECRETS READY IN RUNTIME]:
The active space has these environment variables/secrets configured and auto-injected:
${secretNames.map(s => `• ${s} -> accessible via: process.env.${s} || window.ENV?.${s} || window.getSecret('${s}')`).join('\n')}

MANDATORY CODING DIRECTIVE:
When writing or updating JavaScript code that uses these keys or APIs, ALWAYS call them via 'process.env.VARIABLE_NAME' or 'window.getSecret("VARIABLE_NAME")'.
DO NOT leave placeholder strings or empty values. The runtime injects these values directly.`;
  } else {
    contextPrompt += `\n\n[INBUILT ENVIRONMENT CALLING CONVENTION]:
Whenever writing code that accesses APIs, backend services, or secrets (e.g. Gemini, Supabase, OpenAI, Weather APIs, Stripe), ALWAYS access them via 'process.env.KEY_NAME', 'window.ENV?.KEY_NAME', or 'window.getSecret("KEY_NAME")' so the user can easily supply them in the Environment & Secrets tab.`;
  }

  if (images && images.length > 0) {
    contextPrompt = `[GEMINI MULTIMODAL FILE & VISION ANALYSIS]: ${images.length} file/image attachment(s) provided. Perform deep visual and structural analysis (UI layout, typography, colors, component hierarchy, text OCR, interactions) and generate/update the workspace code accordingly.\n\n` + contextPrompt;
  }

  const userParts: any[] = [{ text: contextPrompt }];
  if (images) {
    images.forEach(img => {
      userParts.push({
        inlineData: {
          data: img.data,
          mimeType: img.mimeType
        }
      });
    });
  }
  
  contents.push({ role: "user", parts: userParts });
  const systemInstruction = getSystemInstruction(settings);

  // 1. Try client-side SDK first if a client key exists
  const ai = getAI();
  if (ai) {
    try {
      const response = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents,
        config: {
          systemInstruction,
        },
      });
      return response;
    } catch (clientErr: any) {
      console.warn("Client-side Gemini call failed, trying server-side proxy...", clientErr);
    }
  }

  // 2. Server-side streaming fallback
  const firstKey = getEffectiveApiKeys()[0] || '';
  const serverRes = await fetch('/api/gemini/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(firstKey ? { 'x-gemini-key': firstKey } : {})
    },
    body: JSON.stringify({
      contents,
      systemInstruction,
      model: "gemini-3-flash-preview"
    })
  });

  if (!serverRes.ok) {
    const errData = await serverRes.json().catch(() => ({}));
    throw new Error(errData.error || `Server returned ${serverRes.status}: Failed to generate AI response. Please check your API key in Secrets & Environment.`);
  }

  // Create an async iterable matching the GoogleGenAI stream response format
  async function* sseIterator() {
    const reader = serverRes.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.replace('data: ', '').trim();
          if (dataStr === '[DONE]') return;
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.text) {
              yield { text: parsed.text };
            }
          } catch (e) {}
        }
      }
    }
  }

  return sseIterator();
}

export async function generateCodeResponse(
  prompt: string, 
  images?: { data: string, mimeType: string, name?: string }[],
  files?: { name: string, content: string }[],
  history: { role: "user" | "model"; parts: { text: string }[] }[] = [],
  settings?: {
    assistantName?: string;
    userName?: string;
    tone?: string;
    length?: string;
    emojiLevel?: string;
    customRules?: string;
    activeModel?: 'ionic' | 'iconic';
  },
  envVars?: { name: string, value: string }[],
  spaceInfo?: { spaceId?: string, spaceName?: string }
) {
  const contents = [...history];
  
  let contextPrompt = prompt;
  if (files && files.length > 0) {
    const filesContext = files.map(f => `File: ${f.name}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n');
    contextPrompt = `[ACTIVE PROJECT CONTEXT - Space: "${spaceInfo?.spaceName || 'Active Workspace'}"]\nCurrent Workspace Files:\n${filesContext}\n\nUser Request: ${prompt || 'Analyze and build the requested application.'}`;
  } else if (spaceInfo?.spaceName) {
    contextPrompt = `[ACTIVE PROJECT CONTEXT - Space: "${spaceInfo.spaceName}"]\n\nUser Request: ${prompt || 'Analyze and build the requested application.'}`;
  }

  // Extract available space secrets
  let secretNames: string[] = [];
  if (envVars && envVars.length > 0) {
    secretNames = envVars.map(v => v.name).filter(Boolean);
  } else if (files) {
    const envFile = files.find(f => f.name === '.env.json');
    if (envFile) {
      try {
        const parsed = JSON.parse(envFile.content);
        if (Array.isArray(parsed)) {
          secretNames = parsed.map((p: any) => p.name).filter(Boolean);
        }
      } catch (e) {}
    }
  }

  if (secretNames.length > 0) {
    contextPrompt += `\n\n[INBUILT ENVIRONMENT & SECRETS READY IN RUNTIME]:
The active space has these environment variables/secrets configured and auto-injected:
${secretNames.map(s => `• ${s} -> accessible via: process.env.${s} || window.ENV?.${s} || window.getSecret('${s}')`).join('\n')}

MANDATORY CODING DIRECTIVE:
When writing or updating JavaScript code that uses these keys or APIs, ALWAYS call them via 'process.env.VARIABLE_NAME' or 'window.getSecret("VARIABLE_NAME")'.
DO NOT leave placeholder strings or empty values. The runtime injects these values directly.`;
  } else {
    contextPrompt += `\n\n[INBUILT ENVIRONMENT CALLING CONVENTION]:
Whenever writing code that accesses APIs, backend services, or secrets (e.g. Gemini, Supabase, OpenAI, Weather APIs, Stripe), ALWAYS access them via 'process.env.KEY_NAME', 'window.ENV?.KEY_NAME', or 'window.getSecret("KEY_NAME")' so the user can easily supply them in the Environment & Secrets tab.`;
  }

  if (images && images.length > 0) {
    contextPrompt = `[GEMINI MULTIMODAL FILE & VISION ANALYSIS]: ${images.length} file/image attachment(s) provided. Perform deep visual and structural analysis (UI layout, typography, colors, component hierarchy, text OCR, interactions) and generate/update the workspace code accordingly.\n\n` + contextPrompt;
  }

  const userParts: any[] = [{ text: contextPrompt }];
  if (images) {
    images.forEach(img => {
      userParts.push({
        inlineData: {
          data: img.data,
          mimeType: img.mimeType
        }
      });
    });
  }
  
  contents.push({ role: "user", parts: userParts });
  const systemInstruction = getSystemInstruction(settings);

  // 1. Try client SDK first
  const ai = getAI();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
        config: {
          systemInstruction,
        },
      });
      return response.text;
    } catch (clientErr: any) {
      console.warn("Client Gemini direct call failed, falling back to server...", clientErr);
    }
  }

  // 2. Server fallback
  const firstKey = getEffectiveApiKeys()[0] || '';
  const serverRes = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(firstKey ? { 'x-gemini-key': firstKey } : {})
    },
    body: JSON.stringify({
      contents,
      systemInstruction,
      model: "gemini-3-flash-preview"
    })
  });

  const data = await serverRes.json();
  if (!serverRes.ok) {
    throw new Error(data.error || "Failed to generate AI response. Please ensure a valid API key is configured.");
  }
  return data.text;
}
