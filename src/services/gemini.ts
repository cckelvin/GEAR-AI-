import { GoogleGenAI } from "@google/genai";
import { AIModel, FileData } from "../types";

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

export function getEffectiveGroqApiKeys(): string[] {
  const keys: string[] = [];

  if (import.meta.env.VITE_GROQ_API_KEY) keys.push(import.meta.env.VITE_GROQ_API_KEY);

  if (typeof window !== 'undefined') {
    const savedGroqKey = localStorage.getItem('gear_groq_key');
    if (savedGroqKey && savedGroqKey.trim()) keys.push(savedGroqKey.trim());

    // Check current space env variables
    const currentSpaceId = localStorage.getItem('gear_current_space_id');
    if (currentSpaceId) {
      try {
        const storedEnv = localStorage.getItem(`gear_env_${currentSpaceId}`);
        if (storedEnv) {
          const parsed = JSON.parse(storedEnv);
          if (Array.isArray(parsed)) {
            const foundKey = parsed.find(
              (v: any) => v && ['GROQ_API_KEY', 'GROQ_KEY', 'VITE_GROQ_API_KEY'].includes(v.name?.toUpperCase())
            );
            if (foundKey && foundKey.value && foundKey.value.trim()) {
              keys.unshift(foundKey.value.trim());
            }
          }
        }
      } catch (e) {}
    }

    // Check all stored space env variables
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('gear_env_')) {
          const stored = localStorage.getItem(k);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              parsed.forEach((v: any) => {
                if (v && ['GROQ_API_KEY', 'GROQ_KEY'].includes(v.name?.toUpperCase()) && v.value?.trim()) {
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
  activeModel?: AIModel;
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

  let modelModeInstruction = "";

  if (activeModel === 'gearbox') {
    modelModeInstruction = `
MODEL MODE: GEARBOX (Precision Surgical Engineering & Open GPT OSS 120B via Groq)
- GEARBOX is engineered specifically for targeted corrections, small additions, line-level code patches, and structural file/folder/subfolder creation.
- SURGICAL WORKFLOW DIRECTIVE:
  1. Carefully read the user's request and inspect the related workspace files.
  2. Pinpoint the EXACT location and specific lines required to add or modify.
  3. YOU DO NOT NEED TO RETYPE AN ENTIRE FILE FROM SCRATCH FOR SMALL EDITS!
  4. For surgical additions and modifications to existing files, output search-and-replace patch blocks:
     \`\`\`patch:path/to/file.ext
     <<<<<<< SEARCH
     [exact original lines from the file to replace or anchor around]
     =======
     [the new or updated replacement lines]
     >>>>>>>
     \`\`\`
  5. For creating NEW files, folders, and nested subfolders (e.g. \`src/components/Header.js\`, \`api/routes/auth.js\`, \`public/data.json\`, \`styles/theme.css\`), output full labeled file blocks:
     \`\`\`language:path/to/nested/file.ext
     [complete code content]
     \`\`\`
  6. For full comprehensive file rewrites (when requested or needed for a clean overhaul), output the complete labeled code block:
     \`\`\`language:path/to/file.ext
     [complete code content]
     \`\`\`
`;
  } else if (activeModel === 'iconic') {
    modelModeInstruction = `
MODEL MODE: ICONIC GEAR (v0 & Bolt.new Inspired Master Website Architecture Engine)
- ICONIC GEAR is built for full-scale, highly sophisticated, production-grade web application engineering and deep product strategy.
- WORKFLOW DIRECTIVE: PLANNING & EXEMPLAR BENCHMARKING FIRST (LIKE v0 & BOLT AI)
  Before jumping straight into raw code, ICONIC GEAR reasons deeply, benchmarks against gold-standard products, and executes in planned steps.
- STRUCTURE OF EVERY ICONIC RESPONSE:
  1. Deep Reasoning & Benchmark Analysis (<thought>...</thought>)
  2. Step-by-Step Action Plan (v0 / Bolt Style)
  3. Complete, Production-Grade Browser-Ready Code in labeled blocks (\`\`\`html:index.html\`\`\`, \`\`\`css:styles.css\`\`\`, \`\`\`javascript:main.js\`\`\`, etc.)
`;
  } else {
    modelModeInstruction = `
MODEL MODE: IONIC GEAR (Fast Direct Compiler)
- IONIC GEAR is focused on high-speed direct updates, rapid iterations, and instant code execution without preliminary discovery questions.
- Keep responses ultra-direct and focus on instant file generation.
`;
  }

  return `You are ${name}, a world-class engineer and product designer. Your goal is to turn natural language into polished, production-ready web applications.
You are chatting with ${user}. Always address them by this name when appropriate.

${modelModeInstruction}

Persona/Tone Instructions:
- ${toneInstruction}
- ${lengthInstruction}
- ${emojiInstruction}
${customRules ? `- Additional Custom Rules from ${user}: "${customRules}"` : ""}

CRITICAL MEMORY & CODE PRESERVATION DIRECTIVE (APPLIES TO ALL MODELS):
- STRICT CODE RETENTION: When modifying an existing file or making a correction, you MUST PRESERVE all existing features, UI elements, event listeners, functions, styling, and imports.
- NEVER drop, truncate, comment out with placeholders (e.g. "// rest of code here"), or forget previously implemented code.
- Always build cumulatively on top of the existing codebase. Every modification is an enhancement to the existing code.

Configure the output for the Gear Studio Preview. The current environment does not have a Node.js server to run a Vite build, so you must generate 'Standalone Browser-Ready' code.

Core Directives:
1. Tech Stack: ONLY use HTML, Tailwind CSS (via CDN), and Lucide Icons (via ESM.sh). DO NOT use React, Vite, or any complex build tools. Your output must be standalone HTML/JS that runs directly in a browser without a build step.
2. Code-First Approach: When asked to build or modify something, prioritize generating code. Do not provide long explanations unless specifically asked.
3. Editor-Centric: You code directly in the user's editor. Your primary output should be the code blocks that update the space files.
4. Modularity & Nested Folders:
   - Split spaces into logical files and subfolders (e.g., index.html, styles.css, main.js, src/components/navbar.js, src/utils/helpers.js).
   - Use <script type="module" src="main.js"></script> in index.html to import logic.
   - Use <link rel="stylesheet" href="styles.css"> for custom CSS.
5. Standalone Browser-Ready Code:
   - ESM.sh Imports: Use https://esm.sh/ for any external libraries.
     Example: import { createIcons, icons } from 'https://esm.sh/lucide'
   - Tailwind Processing: Use standard Tailwind classes. Assume the preview window has the Tailwind CDN script loaded in the head.
6. Explicit File Labeling (MANDATORY): Always provide code in markdown blocks with the file path as a label:
   • Full files: \`\`\`language:path/to/file.ext\n[code]\n\`\`\`
   • Surgical patches: \`\`\`patch:path/to/file.ext\n<<<<<<< SEARCH\n...\n=======\n...\n>>>>>>>\n\`\`\`
7. Context Awareness & Strict Space Isolation: You are provided with the current space files and active space context. You must ONLY modify or refer to the current space's architecture.
8. CRITICAL: INBUILT ENVIRONMENT & SECRETS CALLING (MANDATORY):
   - Gear Studio automatically injects all workspace environment variables and secrets into runtime via \`process.env\`, \`window.ENV\`, \`import.meta.env\`, and \`window.getSecret('KEY_NAME')\`.
   - When building features that require API keys, credentials, backend tokens, or endpoints (such as Gemini API, Groq, OpenAI, ElevenLabs, Supabase, Firebase, Stripe, OpenWeather, Mapbox, GitHub, etc.):
     • NEVER leave empty strings (e.g. \`const apiKey = ""\`) or dummy placeholder text (e.g. \`const apiKey = "YOUR_API_KEY_HERE"\`).
     • ALWAYS access the key dynamically using the inbuilt environment calling methods:
       \`const apiKey = process.env.API_KEY || window.ENV?.API_KEY || window.getSecret('API_KEY');\`
       \`const geminiApiKey = process.env.GEMINI_API_KEY || window.ENV?.GEMINI_API_KEY || window.getSecret('GEMINI_API_KEY');\`
       \`const groqApiKey = process.env.GROQ_API_KEY || window.ENV?.GROQ_API_KEY || window.getSecret('GROQ_API_KEY');\`
       \`const supabaseUrl = process.env.SUPABASE_URL || window.ENV?.SUPABASE_URL || window.getSecret('SUPABASE_URL');\`
   - When making AI calls in user code, use standard browser REST fetch with dynamic keys.
9. Built-in Integrations:
   - Built-in integrations include Gemini AI, Groq, Lucide Icons, and Tailwind CSS.
   - For databases, suggest Supabase or Firebase. For deployment, suggest Render or Vercel.
10. NO REACT: Do not generate App.tsx or use React syntax. Use standard DOM manipulation (document.getElementById, etc.) for interactivity.
11. Debugging & Logs: Analyze preview console logs to identify errors (syntax errors, failed network requests, or logic bugs) and provide fixes directly.
12. Gemini Multimodal File & Image Analysis:
   - When the user uploads an image, UI mockup, screenshot, wireframe, or diagram:
     • Deep Visual Inspection: Inspect layout grid, spatial padding, flex hierarchies, typography scale, exact hex colors, and micro-details.
     • 1:1 Pixel-Accurate UI Translation: Faithfully convert visual designs from the image directly into standalone HTML and Tailwind CSS.
     • OCR & Content Transcription: Accurately extract all visible text, headers, badges, form inputs, buttons, and icons (map to Lucide icons).
     • Code-First Output: Immediately output runnable code in labeled blocks.

Interaction Style:
- ALWAYS include the filename in the code block label (e.g., \`\`\`html:index.html\`\`\`, \`\`\`patch:main.js\`\`\`).`;
}

export const SYSTEM_INSTRUCTION = getSystemInstruction();

/**
 * Applies surgical patch blocks (<<<<<<< SEARCH ... ======= ... >>>>>>>) to an existing file's content
 */
export function applySurgicalPatch(originalContent: string, patchText: string): string {
  const patchBlockRegex = /<<<<<<< SEARCH\r?\n([\s\S]*?)\r?\n=======\r?\n([\s\S]*?)\r?\n>>>>>>>/g;
  let result = originalContent;
  let match: RegExpExecArray | null;
  let appliedAny = false;

  while ((match = patchBlockRegex.exec(patchText)) !== null) {
    const searchBlock = match[1];
    const replaceBlock = match[2];

    if (result.includes(searchBlock)) {
      result = result.replace(searchBlock, replaceBlock);
      appliedAny = true;
    } else {
      // Normalized whitespace matching
      const searchLines = searchBlock.split(/\r?\n/).map(l => l.trimEnd());
      const resultLines = result.split(/\r?\n/);
      
      let foundIndex = -1;
      for (let i = 0; i <= resultLines.length - searchLines.length; i++) {
        let matches = true;
        for (let j = 0; j < searchLines.length; j++) {
          if (resultLines[i + j].trimEnd() !== searchLines[j]) {
            matches = false;
            break;
          }
        }
        if (matches) {
          foundIndex = i;
          break;
        }
      }

      if (foundIndex !== -1) {
        const replaceLines = replaceBlock.split(/\r?\n/);
        resultLines.splice(foundIndex, searchLines.length, ...replaceLines);
        result = resultLines.join('\n');
        appliedAny = true;
      }
    }
  }

  // Also support [SEARCH] ... [REPLACE] format
  if (!appliedAny) {
    const altPatchRegex = /\[SEARCH\]\r?\n([\s\S]*?)\r?\n\[REPLACE\]\r?\n([\s\S]*?)(?=\[SEARCH\]|$)/g;
    while ((match = altPatchRegex.exec(patchText)) !== null) {
      const searchBlock = match[1].trim();
      const replaceBlock = match[2].trim();
      if (result.includes(searchBlock)) {
        result = result.replace(searchBlock, replaceBlock);
        appliedAny = true;
      }
    }
  }

  return result;
}

export async function generateCodeResponseStream(
  prompt: string, 
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  images?: { data: string, mimeType: string, name?: string }[],
  files?: FileData[],
  settings?: {
    assistantName?: string;
    userName?: string;
    tone?: string;
    length?: string;
    emojiLevel?: string;
    customRules?: string;
    activeModel?: AIModel;
  },
  envVars?: { name: string, value: string }[],
  spaceInfo?: { spaceId?: string, spaceName?: string }
) {
  const activeModel = settings?.activeModel || 'iconic';
  const contents = [...history];
  
  let contextPrompt = prompt;
  if (files && files.length > 0) {
    const filesContext = files.map(f => `File: ${f.name} (${f.content.split('\n').length} lines)\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n');
    contextPrompt = `[ACTIVE PROJECT CONTEXT - Space: "${spaceInfo?.spaceName || 'Active Workspace'}"]\nTotal Workspace Files: ${files.length}\nFiles List: ${files.map(f => f.name).join(', ')}\n\nCurrent Workspace Content:\n${filesContext}\n\n[PERSISTENT MEMORY DIRECTIVE]: Preserve all existing working code, features, and structure. Apply additions or targeted modifications cleanly.\n\nUser Request: ${prompt || 'Analyze and build the requested application.'}`;
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
Whenever writing code that accesses APIs, backend services, or secrets (e.g. Gemini, Groq, Supabase, OpenAI, Weather APIs, Stripe), ALWAYS access them via 'process.env.KEY_NAME', 'window.ENV?.KEY_NAME', or 'window.getSecret("KEY_NAME")' so the user can easily supply them in the Environment & Secrets tab.`;
  }

  if (images && images.length > 0) {
    contextPrompt = `[MULTIMODAL FILE & VISION ANALYSIS]: ${images.length} file/image attachment(s) provided. Perform deep visual and structural analysis (UI layout, typography, colors, component hierarchy, text OCR, interactions) and generate/update the workspace code accordingly.\n\n` + contextPrompt;
  }

  const systemInstruction = getSystemInstruction(settings);

  // ROUTE 1: GEARBOX (Groq API - Open GPT OSS 120B / LLaMA 3.3 70B)
  if (activeModel === 'gearbox') {
    const groqKeys = getEffectiveGroqApiKeys();
    const effectiveGroqKey = groqKeys[0] || '';

    // Convert contents & prompt into OpenAI-compatible format
    const groqMessages: { role: 'system' | 'user' | 'assistant', content: string }[] = [];
    
    history.forEach(h => {
      groqMessages.push({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.parts.map(p => p.text).join('\n')
      });
    });

    groqMessages.push({
      role: 'user',
      content: contextPrompt
    });

    try {
      const serverRes = await fetch('/api/groq/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(effectiveGroqKey ? { 'x-groq-key': effectiveGroqKey } : {})
        },
        body: JSON.stringify({
          messages: groqMessages,
          systemInstruction,
          model: "openai/gpt-oss-120b"
        })
      });

      if (!serverRes.ok) {
        const errData = await serverRes.json().catch(() => ({}));
        throw new Error(errData.error || `Groq proxy returned ${serverRes.status}`);
      }

      async function* groqSseIterator() {
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

      return groqSseIterator();
    } catch (groqErr: any) {
      console.warn("Groq streaming failed, attempting fallback to Gemini...", groqErr);
    }
  }

  // ROUTE 2: GEMINI (Ionic & Iconic Gear or Groq fallback)
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
  files?: FileData[],
  history: { role: "user" | "model"; parts: { text: string }[] }[] = [],
  settings?: {
    assistantName?: string;
    userName?: string;
    tone?: string;
    length?: string;
    emojiLevel?: string;
    customRules?: string;
    activeModel?: AIModel;
  },
  envVars?: { name: string, value: string }[],
  spaceInfo?: { spaceId?: string, spaceName?: string }
) {
  const activeModel = settings?.activeModel || 'iconic';
  const contents = [...history];
  
  let contextPrompt = prompt;
  if (files && files.length > 0) {
    const filesContext = files.map(f => `File: ${f.name} (${f.content.split('\n').length} lines)\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n');
    contextPrompt = `[ACTIVE PROJECT CONTEXT - Space: "${spaceInfo?.spaceName || 'Active Workspace'}"]\nTotal Workspace Files: ${files.length}\nFiles List: ${files.map(f => f.name).join(', ')}\n\nCurrent Workspace Content:\n${filesContext}\n\n[PERSISTENT MEMORY DIRECTIVE]: Preserve all existing working code, features, and structure. Apply additions or targeted modifications cleanly.\n\nUser Request: ${prompt || 'Analyze and build the requested application.'}`;
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
Whenever writing code that accesses APIs, backend services, or secrets (e.g. Gemini, Groq, Supabase, OpenAI, Weather APIs, Stripe), ALWAYS access them via 'process.env.KEY_NAME', 'window.ENV?.KEY_NAME', or 'window.getSecret("KEY_NAME")' so the user can easily supply them in the Environment & Secrets tab.`;
  }

  if (images && images.length > 0) {
    contextPrompt = `[MULTIMODAL FILE & VISION ANALYSIS]: ${images.length} file/image attachment(s) provided. Perform deep visual and structural analysis (UI layout, typography, colors, component hierarchy, text OCR, interactions) and generate/update the workspace code accordingly.\n\n` + contextPrompt;
  }

  const systemInstruction = getSystemInstruction(settings);

  // ROUTE 1: GEARBOX (Groq)
  if (activeModel === 'gearbox') {
    const groqKeys = getEffectiveGroqApiKeys();
    const effectiveGroqKey = groqKeys[0] || '';

    const groqMessages: { role: 'system' | 'user' | 'assistant', content: string }[] = [];
    history.forEach(h => {
      groqMessages.push({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.parts.map(p => p.text).join('\n')
      });
    });
    groqMessages.push({ role: 'user', content: contextPrompt });

    try {
      const serverRes = await fetch('/api/groq/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(effectiveGroqKey ? { 'x-groq-key': effectiveGroqKey } : {})
        },
        body: JSON.stringify({
          messages: groqMessages,
          systemInstruction,
          model: "openai/gpt-oss-120b"
        })
      });
      if (serverRes.ok) {
        const data = await serverRes.json();
        return data.text;
      }
    } catch (e) {
      console.warn("Groq non-streaming generate failed, falling back to Gemini...", e);
    }
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
