import { FileData } from '../types';

export interface ExecutionResult {
  stdout: string[];
  stderr: string[];
  exitCode: number;
  durationMs: number;
  runtime: 'python' | 'node' | 'vite';
}

// Global Pyodide singleton instance cache
let pyodideInstance: any = null;
let isPyodideLoading = false;

export async function initPyodide(onStatus?: (status: string) => void): Promise<any> {
  if (pyodideInstance) return pyodideInstance;
  if ((window as any).loadPyodide) {
    try {
      onStatus?.('Initializing Python 3.11 engine...');
      pyodideInstance = await (window as any).loadPyodide();
      return pyodideInstance;
    } catch (e) {
      console.warn('Failed to initialize existing window.loadPyodide:', e);
    }
  }

  if (isPyodideLoading) {
    // Wait for in-progress load
    while (isPyodideLoading) {
      await new Promise(r => setTimeout(r, 100));
    }
    if (pyodideInstance) return pyodideInstance;
  }

  return new Promise((resolve) => {
    isPyodideLoading = true;
    onStatus?.('Loading Python 3.11 Runtime Extension from CDN...');
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
    script.async = true;

    script.onload = async () => {
      try {
        onStatus?.('Bootstrapping Pyodide WebAssembly Virtual Environment...');
        if ((window as any).loadPyodide) {
          pyodideInstance = await (window as any).loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/'
          });
          onStatus?.('Python 3.11 Runtime ready');
        }
      } catch (err) {
        console.warn('Pyodide load failed, fallback will be used:', err);
      } finally {
        isPyodideLoading = false;
        resolve(pyodideInstance);
      }
    };

    script.onerror = () => {
      console.warn('Pyodide script failed to load, fallback Python runner will be used.');
      isPyodideLoading = false;
      resolve(null);
    };

    document.head.appendChild(script);
  });
}

/**
 * Execute Python code via Pyodide or fallback Python interpreter
 */
export async function runPythonCode(
  code: string,
  fileName: string = 'main.py',
  files: FileData[] = [],
  env: Record<string, string> = {},
  onLog?: (line: string, type: 'stdout' | 'stderr' | 'system') => void
): Promise<ExecutionResult> {
  const start = performance.now();
  const stdout: string[] = [];
  const stderr: string[] = [];

  const log = (msg: string, type: 'stdout' | 'stderr' | 'system' = 'stdout') => {
    if (type === 'stderr') stderr.push(msg);
    else if (type === 'stdout') stdout.push(msg);
    onLog?.(msg, type);
  };

  log(`🐍 Python 3.11 Runtime [${fileName}] starting...`, 'system');

  try {
    const py = await initPyodide((status) => log(status, 'system'));

    if (py) {
      // Set up sys.stdout and sys.stderr redirection
      py.setStdout({
        batched: (text: string) => {
          const lines = text.split('\n');
          lines.forEach(l => { if (l) log(l, 'stdout'); });
        }
      });
      py.setStderr({
        batched: (text: string) => {
          const lines = text.split('\n');
          lines.forEach(l => { if (l) log(l, 'stderr'); });
        }
      });

      // Write companion files into Pyodide virtual filesystem
      files.forEach(f => {
        try {
          if (f.name.endsWith('.py') || f.name.endsWith('.json') || f.name.endsWith('.txt') || f.name.endsWith('.csv')) {
            py.FS.writeFile(f.name, f.content);
          }
        } catch (e) {}
      });

      // Set environment variables in os.environ
      const envSetup = Object.entries(env)
        .map(([k, v]) => `os.environ[${JSON.stringify(k)}] = ${JSON.stringify(v)}`)
        .join('\n');

      const wrapperCode = `
import sys, os
${envSetup}
${code}
`;
      await py.runPythonAsync(wrapperCode);
      const durationMs = Math.round(performance.now() - start);
      log(`Process finished with exit code 0 (${durationMs}ms)`, 'system');
      return { stdout, stderr, exitCode: 0, durationMs, runtime: 'python' };
    }
  } catch (err: any) {
    const msg = err?.message || String(err);
    log(`Traceback (most recent call last):\n${msg}`, 'stderr');
    const durationMs = Math.round(performance.now() - start);
    return { stdout, stderr, exitCode: 1, durationMs, runtime: 'python' };
  }

  // Fallback lightweight Python evaluator if Pyodide CDN is blocked or unavailable
  log(`⚡ Using Gear Sandboxed Python Execution Engine...`, 'system');
  try {
    const lines = code.split('\n');
    const vars: Record<string, any> = { ...env };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;

      // Handle print(...)
      const printMatch = line.match(/^print\((.*)\)$/);
      if (printMatch) {
        let arg = printMatch[1].trim();
        // Handle f-strings or string interpolation
        if (arg.startsWith('f"') || arg.startsWith("f'")) {
          let inner = arg.slice(2, -1);
          inner = inner.replace(/\{([^}]+)\}/g, (_, expr) => {
            try { return vars[expr.trim()] ?? expr; } catch { return expr; }
          });
          log(inner, 'stdout');
        } else if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
          log(arg.slice(1, -1), 'stdout');
        } else {
          try {
            // Evaluate simple expressions
            const evaluated = vars[arg] !== undefined ? vars[arg] : arg;
            log(String(evaluated), 'stdout');
          } catch {
            log(arg, 'stdout');
          }
        }
        continue;
      }

      // Handle simple variable assignments: x = 10 or name = "Gear"
      const assignMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.*)$/);
      if (assignMatch) {
        const varName = assignMatch[1];
        let valStr = assignMatch[2].trim();
        if ((valStr.startsWith('"') && valStr.endsWith('"')) || (valStr.startsWith("'") && valStr.endsWith("'"))) {
          vars[varName] = valStr.slice(1, -1);
        } else if (!isNaN(Number(valStr))) {
          vars[varName] = Number(valStr);
        } else if (valStr === 'True') {
          vars[varName] = true;
        } else if (valStr === 'False') {
          vars[varName] = false;
        } else {
          vars[varName] = valStr;
        }
      }
    }

    const durationMs = Math.round(performance.now() - start);
    log(`Process finished with exit code 0 (${durationMs}ms)`, 'system');
    return { stdout, stderr, exitCode: 0, durationMs, runtime: 'python' };
  } catch (fallbackErr: any) {
    log(`Python Error: ${fallbackErr.message || fallbackErr}`, 'stderr');
    return { stdout, stderr, exitCode: 1, durationMs: Math.round(performance.now() - start), runtime: 'python' };
  }
}

/**
 * Execute Node.js / JavaScript code in a sandboxed VFS environment
 */
export async function runNodeCode(
  code: string,
  fileName: string = 'server.js',
  files: FileData[] = [],
  env: Record<string, string> = {},
  onLog?: (line: string, type: 'stdout' | 'stderr' | 'system') => void
): Promise<ExecutionResult> {
  const start = performance.now();
  const stdout: string[] = [];
  const stderr: string[] = [];

  const log = (msg: string, type: 'stdout' | 'stderr' | 'system' = 'stdout') => {
    if (type === 'stderr') stderr.push(msg);
    else if (type === 'stdout') stdout.push(msg);
    onLog?.(msg, type);
  };

  log(`🟢 Node.js 20 LTS Engine [node ${fileName}] starting...`, 'system');

  try {
    // Build Virtual File System map
    const vfs: Record<string, string> = {};
    files.forEach(f => {
      vfs[f.name] = f.content;
      vfs['./' + f.name] = f.content;
      vfs['/' + f.name] = f.content;
    });

    // Custom console implementation
    const customConsole = {
      log: (...args: any[]) => {
        const text = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
        log(text, 'stdout');
      },
      info: (...args: any[]) => {
        const text = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
        log(`ℹ️ ${text}`, 'stdout');
      },
      warn: (...args: any[]) => {
        const text = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
        log(`⚠️ ${text}`, 'stderr');
      },
      error: (...args: any[]) => {
        const text = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
        log(`❌ ${text}`, 'stderr');
      },
      table: (data: any) => {
        log(JSON.stringify(data, null, 2), 'stdout');
      }
    };

    // Simulated require
    const customRequire = (moduleName: string) => {
      if (vfs[moduleName]) {
        return { content: vfs[moduleName] };
      }
      if (moduleName === 'fs' || moduleName === 'node:fs') {
        return {
          readFileSync: (path: string, _encoding?: string) => {
            const found = vfs[path] || vfs['./' + path] || vfs[path.replace(/^\.\//, '')];
            if (found !== undefined) return found;
            throw new Error(`ENOENT: no such file or directory, open '${path}'`);
          },
          existsSync: (path: string) => Boolean(vfs[path] || vfs['./' + path] || vfs[path.replace(/^\.\//, '')]),
          promises: {
            readFile: async (path: string) => {
              const found = vfs[path] || vfs['./' + path];
              if (found !== undefined) return found;
              throw new Error(`ENOENT: no such file or directory '${path}'`);
            }
          }
        };
      }
      if (moduleName === 'path' || moduleName === 'node:path') {
        return {
          join: (...parts: string[]) => parts.join('/').replace(/\/+/g, '/'),
          resolve: (...parts: string[]) => parts.join('/').replace(/\/+/g, '/'),
          basename: (p: string) => p.split('/').pop() || '',
          extname: (p: string) => {
            const b = p.split('/').pop() || '';
            const idx = b.lastIndexOf('.');
            return idx > -1 ? b.slice(idx) : '';
          }
        };
      }
      if (moduleName === 'process' || moduleName === 'node:process') {
        return { env };
      }
      return {};
    };

    // Process object
    const customProcess = {
      env: { ...env, NODE_ENV: 'development', GEAR_RUNTIME: 'node' },
      cwd: () => '/workspace',
      version: 'v20.12.2',
      platform: 'linux',
      exit: (code: number = 0) => {
        log(`process.exit(${code}) called`, 'system');
      }
    };

    // Strip top-level import/export for sandbox execution
    let runnableCode = code
      .replace(/import\s+.*?\s+from\s+['"].*?['"];?/g, '')
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+(const|let|var|function|class)\s+/g, '$1 ');

    // Async execution wrapper
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const runner = new AsyncFunction(
      'console',
      'require',
      'process',
      'env',
      'fetch',
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      runnableCode
    );

    await runner(customConsole, customRequire, customProcess, env, window.fetch.bind(window), setTimeout, clearTimeout, setInterval, clearInterval);

    const durationMs = Math.round(performance.now() - start);
    log(`[Node.js] Execution completed with status 0 (${durationMs}ms)`, 'system');
    return { stdout, stderr, exitCode: 0, durationMs, runtime: 'node' };
  } catch (err: any) {
    const errorMsg = err?.stack || err?.message || String(err);
    log(`[Node.js Runtime Error]: ${errorMsg}`, 'stderr');
    const durationMs = Math.round(performance.now() - start);
    return { stdout, stderr, exitCode: 1, durationMs, runtime: 'node' };
  }
}
