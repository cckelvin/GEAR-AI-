import { GoogleGenAI } from "@google/genai";

const apiKeys = [
  import.meta.env.VITE_GEAR_API,
  import.meta.env.VITE_GEAR_API_2,
  import.meta.env.VITE_GEAR_API_3,
  process.env.GEMINI_API_KEY
].filter(Boolean) as string[];

let currentKeyIndex = 0;

function getAI() {
  if (apiKeys.length === 0) {
    throw new Error("No Gemini API keys configured. Please set GEMINI_API_KEY in your environment.");
  }
  
  // Try to find a valid key, skipping any that might be "undefined" as a string
  let apiKey = apiKeys[currentKeyIndex];
  let attempts = 0;
  while ((!apiKey || apiKey === "undefined") && attempts < apiKeys.length) {
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    apiKey = apiKeys[currentKeyIndex];
    attempts++;
  }

  if (!apiKey || apiKey === "undefined") {
    throw new Error("No valid Gemini API keys found.");
  }

  // Rotate for next time
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  
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
MODEL MODE: ICONIC GEAR (Full Intelligence & Master Website Builder Engine)
- ICONIC GEAR is built for full-scale, highly sophisticated, production-grade website engineering and deep product strategy.
- CRITICAL DIRECTIVE: TAKING TIME & DEEP THOUGHT
  Do NOT hurry or generate minimal placeholder code. Take your time to analyze every detail of the user's vision, architecting a complete, rich, multi-screen web application.
  
- Google AI Studio Thought Process (MANDATORY):
  ALWAYS wrap your internal reasoning, product analysis, database/state architecture, and step-by-step engineering plan inside a <thought>...</thought> block at the very beginning of your response.
  For example:
  <thought>
  Analyzing request: User wants a full featured social chat application.
  Deconstructing requirements & domain expectations (like WhatsApp / Messenger / Discord):
  - Screen 1: Splash / Onboarding & Persona selector
  - Screen 2: Friends list & Active Status feed
  - Screen 3: Private 1-on-1 Chat view with typing indicators, media attachment simulations, and voice note UI
  - Screen 4: Group Channels & Public Community Rooms
  - Screen 5: Settings, Dark/Light theme toggles, and User Profile
  
  Formulating discovery strategy:
  1. Purpose & Target Audience
  2. Visual Aesthetic & Theme (e.g., Cyberpunk, Minimalist Light, Dark Luxury)
  3. Key Features & Realtime expectations
  4. Asset & Branding preferences
  
  Mapping out full interface architecture and preparing rich, production-level modular HTML/JS/CSS...
  </thought>

- Discovery & Clarification Stage:
  When the user presents a broad or ambitious website concept (e.g. "build a chat app", "create an e-commerce platform", "build a project manager"):
  1. Output your <thought> reasoning block first.
  2. Ask 3-4 precise, intelligent questions to clarify their exact vision (Purpose, Aesthetic, Core Features, Assets).
  3. Provide a clear, visual mapped-out interface flow diagram using ASCII/Markdown format:
     Splash Screen
     ├── Onboarding / Auth
     ├── Main Workspace / Feed
     │   ├── Private Chat (/open private chat)
     │   ├── Group Channels (/group)
     │   └── User Settings & Profile
  4. Immediately follow up with the COMPLETE, production-ready, highly complex code files (\`index.html\`, \`main.js\`, \`styles.css\`) so the app is instantly usable and interactive in the preview!

- HIGH COMPLEXITY CODE MANDATE:
  - Generate full, feature-rich HTML, Tailwind CSS, and vanilla JS/ESM code.
  - Implement full local state persistence (localStorage / state stores), interactive event handlers, dynamic DOM rendering, animations, modal dialogs, search/filter logic, responsive navigation, and complete sample data.
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
8. Context Awareness: You are provided with the current space files. Modify existing files or create new ones as needed to fulfill the user's request.
9. No Mock Data: Build actual API calls, OAuth flows, and database schemas.
10. Built-in Integrations:
   - Gear Studio provides several built-in integrations like Gemini AI, Lucide Icons, and Tailwind CSS.
   - If a user needs a database, you should suggest using Supabase or Firebase integrations.
   - For deployment, the primary option is Render.
   - ALWAYS ask the user for confirmation before implementing any integration (Plug-in or Built-in).
11. NO REACT: Do not generate App.tsx or use React syntax. Use standard DOM manipulation (document.getElementById, etc.) for interactivity.
12. Debugging & Logs: You have access to the preview window's console logs. If the user provides logs, analyze them to identify errors (e.g., syntax errors, failed network requests, or logic bugs) and provide fixes directly in the code blocks.
13. File Analysis: When a user uploads a file, analyze its content thoroughly. If it's a code file, use it as a reference or integrate it into the project. If it's a text file, use the information within to guide your design or logic.

Interaction Style:
- ALWAYS include the filename in the code block label (e.g., \`\`\`html:index.html\`).`;
}

const SYSTEM_INSTRUCTION = getSystemInstruction();

export async function generateCodeResponseStream(
  prompt: string, 
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  images?: { data: string, mimeType: string }[],
  files?: { name: string, content: string }[],
  settings?: {
    assistantName?: string;
    userName?: string;
    tone?: string;
    length?: string;
    emojiLevel?: string;
    customRules?: string;
    activeModel?: 'ionic' | 'iconic';
  }
) {
  const contents = [...history];
  
  let contextPrompt = prompt;
  if (files && files.length > 0) {
    const filesContext = files.map(f => `File: ${f.name}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n');
    contextPrompt = `Current Space Files:\n${filesContext}\n\nUser Request: ${prompt}`;
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
  const ai = getAI();

  const response = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents,
    config: {
      systemInstruction: getSystemInstruction(settings),
    },
  });

  return response;
}

export async function generateCodeResponse(
  prompt: string, 
  images?: { data: string, mimeType: string }[],
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
  }
) {
  const contents = [...history];
  
  let contextPrompt = prompt;
  if (files && files.length > 0) {
    const filesContext = files.map(f => `File: ${f.name}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n');
    contextPrompt = `Current Space Files:\n${filesContext}\n\nUser Request: ${prompt}`;
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
  const ai = getAI();

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents,
    config: {
      systemInstruction: getSystemInstruction(settings),
    },
  });

  return response.text;
}
