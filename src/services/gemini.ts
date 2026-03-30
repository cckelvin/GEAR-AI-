import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const apiKey = import.meta.env.VITE_GEAR_API || process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `You are Gear AI, a world-class engineer and product designer. Your goal is to turn natural language into polished, production-ready web applications.

Configure the output for the Gear Studio Preview. The current environment does not have a Node.js server to run a Vite build, so you must generate 'Standalone Browser-Ready' code.

Core Directives:
1. Tech Stack: ONLY use HTML, Tailwind CSS (via CDN), and Lucide Icons (via ESM.sh). DO NOT use React, Vite, or any complex build tools. Your output must be standalone HTML/JS that runs directly in a browser without a build step.
2. Code-First Approach: When asked to build or modify something, prioritize generating code. Do not provide long explanations unless specifically asked.
3. Editor-Centric: You code directly in the user's editor. Your primary output should be the code blocks that update the project files.
4. Standalone Browser-Ready Code:
   - ESM.sh Imports: Use https://esm.sh/ for any external libraries.
     Example: import { createIcons, icons } from 'https://esm.sh/lucide'
   - Single-File Bundle: To ensure the Preview tab renders correctly, wrap the logic into a single block that includes the HTML and the script logic.
   - Tailwind Processing: Use standard Tailwind classes. Assume the preview window has the Tailwind CDN script loaded in the head.
5. Minimal Chat: Keep your chat responses extremely brief. Acknowledge the request, state what you're doing in one sentence, and then provide the code blocks. Do not repeat the code in plain text.
6. Explicit File Labeling: Always provide code in markdown blocks with the file path as a label: \`\`\`language:path/to/file.ext\n[code]\n\`\`\`. For example, \`\`\`html:index.html\n[code]\n\`\`\`. This is CRITICAL for the environment to update the files correctly.
7. Complete Files: Always provide the full content of the file, not just snippets, unless explicitly asked for a diff. This ensures the user's editor is always in a valid state.
8. Context Awareness: You are provided with the current project files. Modify existing files or create new ones as needed to fulfill the user's request.
9. No Mock Data: Build actual API calls, OAuth flows, and database schemas.
10. NO REACT: Do not generate App.tsx or use React syntax. Use standard DOM manipulation (document.getElementById, etc.) for interactivity.

Interaction Style:
- Be concise. State your intent in one sentence, then provide the code.
- Provide ONLY the code blocks for the files that need to be created or updated.
- Do not include any text outside of the code blocks unless absolutely necessary for clarification.
- You are coding directly in the user's editor. The user will see your changes in real-time.`;

export async function generateCodeResponseStream(
  prompt: string, 
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  images?: { data: string, mimeType: string }[],
  files?: { name: string, content: string }[]
) {
  const contents = [...history];
  
  let contextPrompt = prompt;
  if (files && files.length > 0) {
    const filesContext = files.map(f => `File: ${f.name}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n');
    contextPrompt = `Current Project Files:\n${filesContext}\n\nUser Request: ${prompt}`;
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

  const response = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  return response;
}

export async function generateCodeResponse(
  prompt: string, 
  images?: { data: string, mimeType: string }[],
  files?: { name: string, content: string }[],
  history: { role: "user" | "model"; parts: { text: string }[] }[] = []
) {
  const contents = [...history];
  
  let contextPrompt = prompt;
  if (files && files.length > 0) {
    const filesContext = files.map(f => `File: ${f.name}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n');
    contextPrompt = `Current Project Files:\n${filesContext}\n\nUser Request: ${prompt}`;
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

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  return response.text;
}
