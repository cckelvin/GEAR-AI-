import { AIModel, FileData } from "../types";

export function getEffectiveGeminiApiKeys(): string[] {
  const keys: string[] = [];

  if (import.meta.env.VITE_GEMINI_API_KEY) keys.push(import.meta.env.VITE_GEMINI_API_KEY);
  if (import.meta.env.VITE_GEAR_API) keys.push(import.meta.env.VITE_GEAR_API);

  if (typeof window !== 'undefined') {
    // Check current space env variables
    const currentSpaceId = localStorage.getItem('gear_current_space_id');
    if (currentSpaceId) {
      try {
        const storedEnv = localStorage.getItem(`gear_env_${currentSpaceId}`);
        if (storedEnv) {
          const parsed = JSON.parse(storedEnv);
          if (Array.isArray(parsed)) {
            const foundKey = parsed.find(
              (v: any) => v && ['GEMINI_API_KEY', 'GEMINI_KEY', 'VITE_GEMINI_API_KEY', 'API_KEY', 'GEAR_API'].includes(v.name?.toUpperCase())
            );
            if (foundKey && foundKey.value && foundKey.value.trim()) {
              keys.unshift(foundKey.value.trim());
            }
          }
        }
      } catch (e) {}
    }

    // Check all stored space env variables and localStorage
    try {
      const localGeminiKey = localStorage.getItem('gear_gemini_key') || localStorage.getItem('gear_api_key');
      if (localGeminiKey) keys.push(localGeminiKey.trim());

      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('gear_env_')) {
          const stored = localStorage.getItem(k);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              parsed.forEach((v: any) => {
                if (v && ['GEMINI_API_KEY', 'GEMINI_KEY', 'API_KEY'].includes(v.name?.toUpperCase()) && v.value?.trim()) {
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

export function getEffectiveApiKeys(): string[] {
  return getEffectiveGeminiApiKeys();
}

export function getEffectiveGroqApiKeys(): string[] {
  return getEffectiveGeminiApiKeys();
}

export function getSystemInstruction(settings?: {
  assistantName?: string;
  userName?: string;
  tone?: string;
  length?: string;
  emojiLevel?: string;
  customRules?: string;
  activeModel?: AIModel;
}): string {
  const assistant = settings?.assistantName || "Gear Studio AI";
  const user = settings?.userName || "Developer";
  const customRules = settings?.customRules || "";

  return `You are ${assistant}, an expert full-stack software engineer and collaborative coding assistant pairing with ${user}.

CONVERSATIONAL ASSISTANT & EXECUTION GUIDELINES:
1. Conversational & Direct:
   - Always respond directly to what the user is asking.
   - When a user asks a question, reports an issue, or asks why something is not working (e.g. "why is it not working"), answer conversationally and explain the diagnosis naturally before/while resolving it:
     For example: "Lemme check that... okay, the reason why you're seeing [specific behavior/random characters] in the code is because [clear reason]. I'll fix that by [clear reconfiguration/solution]..."
   - NO SCOPE DECLARATION: NEVER output "Scope Declaration", "**What I can build**", or "**What I can't do from here**" headers or canned boilerplate disclaimers.

2. Code Generation in Blocks:
   - When providing, creating, or modifying code, ALWAYS format it in structured markdown blocks clearly labeled with the exact file path:
     \`\`\`html:index.html
     <!-- code -->
     \`\`\`
     \`\`\`css:styles.css
     /* styling */
     \`\`\`
     \`\`\`javascript:main.js
     // logic
     \`\`\`
     \`\`\`json:data.json
     {}
     \`\`\`
   - For targeted updates or surgical fixes to existing files, you may also use patch blocks:
     \`\`\`patch:path/to/file.ext
     <<<<<<< SEARCH
     ...
     =======
     ...
     >>>>>>>
     \`\`\`

3. Step Marker Syntax:
   - Before outputting code blocks, use brief natural progress indicators or step tags:
     \`[step: Description of action]\` or \`📄 Creating path/to/file.ext\`
   - The workspace UI automatically visualizes these as clean collapsible step groups.

4. Multi-File Architecture:
   - Organize code into clean modular files:
     • index.html: HTML skeleton with containers, Tailwind CDN, Lucide icons, and module script tags.
     • styles.css: Custom CSS, layout styles, and animations.
     • main.js: App initialization, state management, event listeners, and module imports.
     • src/components/*.js: Reusable UI component modules.
     • src/utils/*.js: Helper functions and API utilities.
   - Do NOT dump all application logic into a single monolithic file.

5. Strict Code Retention:
   - When modifying an existing file or making a fix, PRESERVE all existing working features, UI elements, event listeners, functions, and styling.
   - NEVER drop code or replace working sections with "// rest of code here".

6. Standalone Browser-Ready Runtime:
   - Use HTML, Tailwind CSS, and Lucide icons (via ESM.sh: \`https://esm.sh/lucide\`).
   - Run directly in the browser preview without compilation steps.
   - Do NOT generate React/JSX (\`App.tsx\`). Use standard web APIs and DOM manipulation for interactivity.
${customRules ? `\nAdditional Custom Rules: "${customRules}"` : ''}`;
}

export const SYSTEM_INSTRUCTION = getSystemInstruction();

/**
 * Applies surgical patch blocks (<<<<<<< SEARCH ... ======= ... >>>>>>>) to an existing file's content
 */
export function applySurgicalPatch(originalContent: string, patchText: string): string {
  const patchBlockRegex = /<<<<<<< SEARCH\r?\n([\s\S]*?)\r?\n=======\r?\n([\s\S]*?)\r?\n>>>>>>>/g;
  let result = originalContent;
  let match: RegExpExecArray | null;

  while ((match = patchBlockRegex.exec(patchText)) !== null) {
    const searchBlock = match[1];
    const replaceBlock = match[2];

    if (result.includes(searchBlock)) {
      result = result.replace(searchBlock, replaceBlock);
    } else {
      const searchLines = searchBlock.split(/\r?\n/).map(l => l.trimEnd());
      const resultLines = result.split(/\r?\n/);
      
      let foundIndex = -1;
      for (let i = 0; i <= resultLines.length - searchLines.length; i++) {
        let matchLines = true;
        for (let j = 0; j < searchLines.length; j++) {
          if (resultLines[i + j].trimEnd() !== searchLines[j]) {
            matchLines = false;
            break;
          }
        }
        if (matchLines) {
          foundIndex = i;
          break;
        }
      }

      if (foundIndex !== -1) {
        const before = resultLines.slice(0, foundIndex);
        const after = resultLines.slice(foundIndex + searchLines.length);
        result = [...before, replaceBlock, ...after].join('\n');
      }
    }
  }

  return result;
}

export async function generateCodeResponseStream(
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
): Promise<AsyncIterable<{ text: string }>> {
  const activeModel = settings?.activeModel || 'iconic';
  // Target model is 'ionic' (Gemini 3 Flash) or 'iconic' (Gemini 3.1 Flash Lite main, Gemini 3.5 Flash Lite fallback)
  const targetModel = activeModel;

  let contextPrompt = prompt;
  if (files && files.length > 0) {
    const filesContext = files.map(f => `File: ${f.name} (${f.content.split('\n').length} lines)\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n');
    contextPrompt = `[ACTIVE PROJECT CONTEXT - Space: "${spaceInfo?.spaceName || 'Active Workspace'}"]\nTotal Workspace Files: ${files.length}\nFiles List: ${files.map(f => f.name).join(', ')}\n\nCurrent Workspace Content:\n${filesContext}\n\n[PERSISTENT MEMORY & MULTI-FILE ARCHITECTURE MANDATE]:\n• Preserve existing working code, features, and structure cleanly.\n• PUSH CODE INTO SEPARATE DEDICATED FILES: Split features into modular files (index.html, styles.css, main.js, src/components/*.js, src/utils/*.js). Never dump monolithic code into a single file.\n• Output each file in a labeled code block (\`\`\`language:path/to/file.ext).\n\nUser Request: ${prompt || 'Analyze and build the requested application.'}`;
  } else if (spaceInfo?.spaceName) {
    contextPrompt = `[ACTIVE PROJECT CONTEXT - Space: "${spaceInfo.spaceName}"]\n\n[MULTI-FILE ARCHITECTURE MANDATE]: PUSH CODE INTO SEPARATE FILES across index.html, styles.css, main.js, and modular files in src/components/ and src/utils/. Output each file in a labeled block.\n\nUser Request: ${prompt || 'Analyze and build the requested application.'}`;
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
Whenever writing code that accesses APIs, backend services, or secrets, ALWAYS access them via 'process.env.KEY_NAME', 'window.ENV?.KEY_NAME', or 'window.getSecret("KEY_NAME")' so the user can supply them in the Environment & Secrets tab.`;
  }

  if (images && images.length > 0) {
    contextPrompt = `[MULTIMODAL FILE & VISION ANALYSIS]: ${images.length} file/image attachment(s) provided. Perform visual and structural analysis (UI layout, typography, colors, component hierarchy, text OCR, interactions) and generate/update the workspace code accordingly.\n\n` + contextPrompt;
  }

  const systemInstruction = getSystemInstruction(settings);
  const geminiKeys = getEffectiveGeminiApiKeys();
  const effectiveGeminiKey = geminiKeys[0] || '';

  const messagesPayload: { role: string; content: string }[] = [];
  history.forEach(h => {
    const role = h.role === 'model' ? 'model' : 'user';
    const text = h.parts.map(p => p.text).join('\n');
    if (text) {
      messagesPayload.push({ role, content: text });
    }
  });
  messagesPayload.push({ role: 'user', content: contextPrompt });

  // 1. Try server streaming endpoint with Gemini models
  const endpoints = ['/api/gemini/stream', '/api/groq/stream'];
  for (const endpoint of endpoints) {
    try {
      const serverRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(effectiveGeminiKey ? { 'x-gemini-key': effectiveGeminiKey } : {})
        },
        body: JSON.stringify({
          messages: messagesPayload,
          systemInstruction,
          model: targetModel
        })
      });

      if (serverRes.ok) {
        async function* serverStreamIterator() {
          const reader = serverRes.body?.getReader();
          if (!reader) return;
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                const dataStr = trimmed.slice(6).trim();
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
        return serverStreamIterator();
      }
    } catch (e: any) {
      console.warn(`Server streaming via ${endpoint} failed:`, e?.message || e);
    }
  }

  // 2. Direct client fallback with effectiveGeminiKey
  if (effectiveGeminiKey) {
    const directModels = activeModel === 'ionic'
      ? ['gemini-3-flash-preview', 'gemini-3.8-flash', 'gemini-3.5-flash']
      : ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'];

    for (const mod of directModels) {
      try {
        const contents = messagesPayload.map(m => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

        const directRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${mod}:streamGenerateContent?alt=sse&key=${effectiveGeminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
          })
        });

        if (directRes.ok) {
          async function* directStreamIterator() {
            const reader = directRes.body?.getReader();
            if (!reader) return;
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('data: ')) {
                  const dataStr = trimmed.slice(6).trim();
                  if (dataStr === '[DONE]') return;
                  try {
                    const parsed = JSON.parse(dataStr);
                    const delta = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    if (delta) {
                      yield { text: delta };
                    }
                  } catch (e) {}
                }
              }
            }
          }
          return directStreamIterator();
        }
      } catch (err) {
        console.warn(`Direct streaming with ${mod} failed:`, err);
      }
    }
  }

  throw new Error("Gemini Intelligence Engine is unavailable. Please check your Gemini API key in secrets.");
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
): Promise<string> {
  const activeModel = settings?.activeModel || 'iconic';
  const targetModel = activeModel;

  let contextPrompt = prompt;
  if (files && files.length > 0) {
    const filesContext = files.map(f => `File: ${f.name} (${f.content.split('\n').length} lines)\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n');
    contextPrompt = `[ACTIVE PROJECT CONTEXT - Space: "${spaceInfo?.spaceName || 'Active Workspace'}"]\nTotal Workspace Files: ${files.length}\nFiles List: ${files.map(f => f.name).join(', ')}\n\nCurrent Workspace Content:\n${filesContext}\n\n[PERSISTENT MEMORY & MULTI-FILE ARCHITECTURE MANDATE]:\n• Preserve existing working code, features, and structure cleanly.\n• PUSH CODE INTO SEPARATE DEDICATED FILES: Split features into modular files (index.html, styles.css, main.js, src/components/*.js, src/utils/*.js). Never dump monolithic code into a single file.\n• Output each file in a labeled code block (\`\`\`language:path/to/file.ext).\n\nUser Request: ${prompt || 'Analyze and build the requested application.'}`;
  } else if (spaceInfo?.spaceName) {
    contextPrompt = `[ACTIVE PROJECT CONTEXT - Space: "${spaceInfo.spaceName}"]\n\n[MULTI-FILE ARCHITECTURE MANDATE]: PUSH CODE INTO SEPARATE FILES across index.html, styles.css, main.js, and modular files in src/components/ and src/utils/. Output each file in a labeled block.\n\nUser Request: ${prompt || 'Analyze and build the requested application.'}`;
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
Whenever writing code that accesses APIs, backend services, or secrets, ALWAYS access them via 'process.env.KEY_NAME', 'window.ENV?.KEY_NAME', or 'window.getSecret("KEY_NAME")' so the user can easily supply them in the Environment & Secrets tab.`;
  }

  if (images && images.length > 0) {
    contextPrompt = `[MULTIMODAL FILE & VISION ANALYSIS]: ${images.length} file/image attachment(s) provided. Perform visual and structural analysis (UI layout, typography, colors, component hierarchy, text OCR, interactions) and generate/update the workspace code accordingly.\n\n` + contextPrompt;
  }

  const systemInstruction = getSystemInstruction(settings);
  const geminiKeys = getEffectiveGeminiApiKeys();
  const effectiveGeminiKey = geminiKeys[0] || '';

  const messagesPayload: { role: string; content: string }[] = [];
  history.forEach(h => {
    const role = h.role === 'model' ? 'model' : 'user';
    const text = h.parts.map(p => p.text).join('\n');
    if (text) {
      messagesPayload.push({ role, content: text });
    }
  });
  messagesPayload.push({ role: 'user', content: contextPrompt });

  // 1. Try server generate endpoint with Gemini models
  const endpoints = ['/api/gemini/generate', '/api/groq/generate'];
  for (const endpoint of endpoints) {
    try {
      const serverRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(effectiveGeminiKey ? { 'x-gemini-key': effectiveGeminiKey } : {})
        },
        body: JSON.stringify({
          messages: messagesPayload,
          systemInstruction,
          model: targetModel
        })
      });

      if (serverRes.ok) {
        const data = await serverRes.json();
        return data.text || '';
      }
    } catch (e) {
      console.warn(`Server generate via ${endpoint} failed:`, e);
    }
  }

  // 2. Direct client fallback with effectiveGeminiKey
  if (effectiveGeminiKey) {
    const directModels = activeModel === 'ionic'
      ? ['gemini-3-flash-preview', 'gemini-3.8-flash', 'gemini-3.5-flash']
      : ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'];

    for (const mod of directModels) {
      try {
        const contents = messagesPayload.map(m => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

        const directRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${mod}:generateContent?key=${effectiveGeminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
          })
        });

        if (directRes.ok) {
          const directData = await directRes.json();
          return directData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } catch (directErr) {
        console.warn(`Direct generate with ${mod} failed:`, directErr);
      }
    }
  }

  throw new Error("Unable to reach the Gemini Intelligence Engine. Please verify your Gemini API key in secrets.");
}
