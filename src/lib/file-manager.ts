// Real file management system for Vibe Coder
import { ExtractedCode } from './gemini-api';

export interface FileItem {
  name: string;
  type: "file" | "folder";
  content?: string;
  language?: string;
  path?: string;
}

class FileManager {
  private files: Map<string, FileItem> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Initialize with default project structure
    this.initializeProject();
  }

  private initializeProject() {
    const defaultFiles: FileItem[] = [
      {
        name: "package.json",
        type: "file",
        language: "json",
        path: "package.json",
        content: JSON.stringify({
          name: "vibe-coder-project",
          private: true,
          version: "1.0.0",
          type: "module",
          scripts: {
            dev: "vite",
            build: "vite build",
            preview: "vite preview"
          },
          dependencies: {
            react: "^18.3.1",
            "react-dom": "^18.3.1"
          },
          devDependencies: {
            "@vitejs/plugin-react": "^4.0.0",
            "@types/react": "^18.0.0",
            "@types/react-dom": "^18.0.0",
            typescript: "^5.0.0",
            vite: "^4.4.0"
          }
        }, null, 2)
      },
      {
        name: "index.html",
        type: "file", 
        language: "html",
        path: "index.html",
        content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vibe Coder Project</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
      },
      {
        name: "vite.config.ts",
        type: "file",
        language: "typescript", 
        path: "vite.config.ts",
        content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
})`
      },
      {
        name: "src",
        type: "folder",
        path: "src"
      },
      {
        name: "main.tsx",
        type: "file",
        language: "typescript",
        path: "src/main.tsx",
        content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
      },
      {
        name: "App.tsx",
        type: "file",
        language: "typescript",
        path: "src/App.tsx", 
        content: `import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🚀 Vibe Coder
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Built with Gemini 2.0 Flash
        </p>
        <div className="text-sm text-gray-500">
          Ready to code! 
        </div>
      </div>
    </div>
  )
}

export default App`
      },
      {
        name: "index.css",
        type: "file",
        language: "css",
        path: "src/index.css",
        content: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  width: 100%;
  min-height: 100vh;
}`
      }
    ];

    defaultFiles.forEach(file => {
      this.files.set(file.path || file.name, file);
    });
  }

  // Create or update file
  createFile(filename: string, content: string, language?: string): void {
    const path = filename.startsWith('src/') ? filename : `src/${filename}`;
    
    const file: FileItem = {
      name: filename.split('/').pop() || filename,
      type: "file",
      content,
      language: language || this.getLanguageFromExtension(filename),
      path
    };

    this.files.set(path, file);
    this.notifyListeners();
  }

  // Get file content
  getFile(path: string): FileItem | undefined {
    return this.files.get(path);
  }

  // Get all files as array
  getAllFiles(): FileItem[] {
    return Array.from(this.files.values()).sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  // Update file content
  updateFile(path: string, content: string): void {
    const file = this.files.get(path);
    if (file) {
      file.content = content;
      this.notifyListeners();
    }
  }

  // Delete file
  deleteFile(path: string): void {
    this.files.delete(path);
    this.notifyListeners();
  }

  // Auto-create files from code blocks
  createFilesFromCode(codeBlocks: ExtractedCode[]): string[] {
    const createdFiles: string[] = [];
    
    codeBlocks.forEach(block => {
      this.createFile(block.filename, block.content, block.language);
      createdFiles.push(block.filename);
    });

    return createdFiles;
  }

  // Generate project bundle for live preview
  generateProjectBundle(): { [path: string]: string } {
    const bundle: { [path: string]: string } = {};
    
    this.files.forEach((file, path) => {
      if (file.type === 'file' && file.content) {
        bundle[path] = file.content;
      }
    });

    return bundle;
  }

  private getLanguageFromExtension(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap: { [key: string]: string } = {
      'tsx': 'typescript',
      'ts': 'typescript',
      'jsx': 'javascript', 
      'js': 'javascript',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown'
    };
    return langMap[ext || ''] || 'text';
  }

  // Subscribe to changes
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }
}

// Global file manager instance
export const fileManager = new FileManager();