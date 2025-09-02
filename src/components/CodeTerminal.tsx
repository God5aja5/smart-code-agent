import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Terminal, Globe, Code, FileText, Loader2, Save, Download, Upload, GitBranch } from "lucide-react";

interface CodeTerminalProps {
  previewUrl: string;
  onPreviewUpdate: (url: string) => void;
}

interface FileItem {
  name: string;
  type: "file" | "folder";
  content?: string;
  language?: string;
}

export function CodeTerminal({ previewUrl, onPreviewUpdate }: CodeTerminalProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "🚀 Gemini Vibe Coder Terminal v2.0.0",
    "💫 AI-powered development environment ready",
    "📁 Project workspace initialized",
    ""
  ]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [activeFile, setActiveFile] = useState("App.tsx");
  const [files, setFiles] = useState<FileItem[]>([
    { name: "src", type: "folder" },
    { name: "App.tsx", type: "file", language: "typescript", content: `import React from 'react';\nimport './App.css';\n\nfunction App() {\n  return (\n    <div className="App">\n      <header className="App-header">\n        <h1>Hello Vibe Coder!</h1>\n        <p>Built with Gemini 2.0 Flash</p>\n      </header>\n    </div>\n  );\n}\n\nexport default App;` },
    { name: "main.tsx", type: "file", language: "typescript", content: `import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App.tsx'\nimport './index.css'\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n)` },
    { name: "package.json", type: "file", language: "json", content: `{\n  "name": "vibe-coder-app",\n  "private": true,\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "preview": "vite preview"\n  },\n  "dependencies": {\n    "react": "^18.3.1",\n    "react-dom": "^18.3.1"\n  },\n  "devDependencies": {\n    "@vitejs/plugin-react": "^4.0.0",\n    "vite": "^4.4.0"\n  }\n}` },
    { name: "index.html", type: "file", language: "html", content: `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Vibe Coder App</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>` }
  ]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;
    
    setIsRunning(true);
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    setTerminalOutput(prev => [...prev, `$ ${command}`]);
    
    // Simulate command execution with enhanced responses
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const responses: { [key: string]: string[] } = {
      "npm install": [
        "📦 Installing dependencies...",
        "⬇️  react@18.3.1",
        "⬇️  typescript@5.0.0", 
        "⬇️  vite@4.4.0",
        "⬇️  @vitejs/plugin-react@4.0.0",
        "🔧 Building dependency tree...",
        "✅ Added 847 packages in 12.3s",
        "🎉 Installation complete!"
      ],
      "npm run build": [
        "🔨 Building for production...",
        "📦 Bundling with Vite...",
        "🔍 Analyzing bundle size...",
        "✅ dist/index.html                2.1 kB",
        "✅ dist/assets/index-a1b2c3d4.js  143.2 kB │ gzip: 46.1 kB",
        "✅ dist/assets/index-e5f6g7h8.css  5.8 kB │ gzip: 1.9 kB",
        "🚀 Build completed in 8.7s",
        "💫 Ready for deployment!"
      ],
      "npm run dev": [
        "🔥 Starting Vite development server...",
        "🌐 Vite v4.4.0 ready in 1.2s",
        "📡 ➜ Local:   http://localhost:5173/",
        "📡 ➜ Network: http://192.168.1.100:5173/",
        "✨ Server ready - watching for changes..."
      ],
      "git init": [
        "🔧 Initialized empty Git repository in /project/.git/",
        "📋 Default branch set to 'main'",
        "✅ Repository ready for commits"
      ],
      "git add .": [
        "📁 Staging all files...",
        "✅ Files staged for commit"
      ],
      "git commit -m": [
        "💾 Creating commit...",
        "✅ [main abc1234] Initial commit",
        "📝 4 files changed, 127 insertions(+)"
      ],
      "yarn install": [
        "🧶 Installing with Yarn...",
        "📦 Resolving packages...",
        "✅ Done in 8.4s"
      ],
      "ls": [
        "📁 src/",
        "📄 package.json",
        "📄 vite.config.ts", 
        "📄 index.html",
        "📄 README.md"
      ],
      "help": [
        "🤖 Gemini Vibe Coder Terminal Commands:",
        "📦 npm install - Install dependencies",
        "🔨 npm run build - Build for production", 
        "🔥 npm run dev - Start dev server",
        "🌿 git init - Initialize repository",
        "📁 ls - List files",
        "🧹 clear - Clear terminal",
        "❓ help - Show this help"
      ],
      "clear": [],
      "default": [
        "⚡ Executing command...",
        `✅ '${command}' completed successfully`,
        "🔄 Process finished with exit code 0"
      ]
    };

    let response = responses[command] || responses["default"];
    
    // Special handling for commands with arguments
    if (command.startsWith("git commit -m")) {
      response = responses["git commit -m"];
    }
    
    if (command === "clear") {
      setTerminalOutput([
        "🚀 Gemini Vibe Coder Terminal v2.0.0",
        "💫 AI-powered development environment ready",
        ""
      ]);
      setIsRunning(false);
      return;
    }
    
    for (const line of response) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setTerminalOutput(prev => [...prev, line]);
    }
    
    setTerminalOutput(prev => [...prev, ""]);
    setIsRunning(false);

    // Auto-generate preview URL for dev server
    if (command === "npm run dev" && !previewUrl) {
      setTimeout(() => {
        onPreviewUpdate(`https://vibe-app-${Date.now()}.lovable.dev`);
      }, 1000);
    }
  };

  const runAutomaticSequence = async () => {
    const commands = ["npm install", "npm run build", "npm run dev"];
    
    for (const command of commands) {
      await executeCommand(command);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand.trim() && !isRunning) {
      executeCommand(currentCommand.trim());
      setCurrentCommand("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand("");
      }
    }
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === "folder") return "📁";
    if (file.name.endsWith(".tsx") || file.name.endsWith(".ts")) return "⚛️";
    if (file.name.endsWith(".json")) return "📋";
    if (file.name.endsWith(".html")) return "🌐";
    if (file.name.endsWith(".css")) return "🎨";
    return "📄";
  };

  const getLanguageFromFile = (filename: string): string => {
    if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return 'typescript';
    if (filename.endsWith('.jsx') || filename.endsWith('.js')) return 'javascript';
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.json')) return 'json';
    return 'text';
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-ai-primary" />
          <span className="font-semibold">Vibe Coder IDE</span>
          <Badge variant="secondary" className="bg-ai-primary/10 text-ai-primary">
            v2.0
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={runAutomaticSequence}
            disabled={isRunning}
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Quick Setup
          </Button>
          {previewUrl && (
            <Button
              size="sm"
              onClick={() => window.open(previewUrl)}
              className="bg-ai-primary hover:bg-ai-primary/90 shadow-glow"
            >
              <Globe className="h-4 w-4 mr-2" />
              Live Preview
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="terminal" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger value="terminal" className="flex items-center gap-2 data-[state=active]:bg-ai-primary/10">
            <Terminal className="h-4 w-4" />
            Terminal
          </TabsTrigger>
          <TabsTrigger value="editor" className="flex items-center gap-2 data-[state=active]:bg-ai-primary/10">
            <Code className="h-4 w-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2 data-[state=active]:bg-ai-primary/10">
            <FileText className="h-4 w-4" />
            Files
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2 data-[state=active]:bg-ai-primary/10">
            <Globe className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="terminal" className="flex-1 flex flex-col mt-0">
          <ScrollArea className="flex-1 p-4 bg-black/5" ref={terminalRef}>
            <div className="font-mono text-sm space-y-1 text-foreground min-h-[300px]">
              {terminalOutput.map((line, index) => (
                <div 
                  key={index} 
                  className={`
                    ${line.startsWith('$') ? 'text-ai-primary font-bold' : ''}
                    ${line.includes('✅') ? 'text-green-500' : ''}
                    ${line.includes('🚀') || line.includes('🎉') || line.includes('💫') ? 'text-ai-accent font-semibold' : ''}
                    ${line.includes('📦') || line.includes('🔨') ? 'text-blue-400' : ''}
                    ${line.includes('⬇️') ? 'text-gray-400 ml-4' : ''}
                    ${line.includes('🔧') || line.includes('📡') ? 'text-yellow-400' : ''}
                  `}
                >
                  {line}
                </div>
              ))}
              {isRunning && (
                <div className="flex items-center gap-2 text-ai-primary animate-pulse">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Processing...</span>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-muted/20">
            <form onSubmit={handleCommandSubmit} className="flex gap-2 mb-3">
              <div className="flex-1 flex items-center bg-background rounded border px-3 py-2">
                <span className="text-ai-primary mr-2 font-mono">$</span>
                <Input
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type command..."
                  className="border-0 bg-transparent p-0 font-mono focus-visible:ring-0"
                  disabled={isRunning}
                />
              </div>
              <Button 
                type="submit" 
                size="sm" 
                disabled={!currentCommand.trim() || isRunning}
                className="bg-ai-primary hover:bg-ai-primary/90"
              >
                Run
              </Button>
            </form>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => executeCommand("npm install")}
                disabled={isRunning}
              >
                Install
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => executeCommand("npm run build")}
                disabled={isRunning}
              >
                Build
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => executeCommand("npm run dev")}
                disabled={isRunning}
              >
                Dev Server
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => executeCommand("clear")}
                disabled={isRunning}
              >
                Clear
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="editor" className="flex-1 flex flex-col mt-0">
          <div className="flex items-center gap-2 p-2 border-b bg-muted/20">
            {files.filter(f => f.type === "file").map((file) => (
              <Button
                key={file.name}
                variant={activeFile === file.name ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveFile(file.name)}
                className={`text-xs ${activeFile === file.name ? 'bg-ai-primary/20 border-ai-primary' : ''}`}
              >
                {getFileIcon(file)} {file.name}
              </Button>
            ))}
          </div>
          
          <div className="flex-1 p-4 bg-muted/10">
            <div className="h-full bg-background rounded border p-4 font-mono text-sm overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="text-muted-foreground text-xs">
                  {activeFile} - {getLanguageFromFile(activeFile)}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
              
              <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                {files.find(f => f.name === activeFile)?.content || "// File content will appear here"}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="files" className="flex-1 flex flex-col mt-0">
          <div className="flex-1 p-4 bg-muted/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted-foreground">PROJECT FILES</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Upload className="h-3 w-3 mr-1" />
                  Upload
                </Button>
                <Button size="sm" variant="outline">
                  <GitBranch className="h-3 w-3 mr-1" />
                  Git
                </Button>
              </div>
            </div>
            
            <div className="space-y-1 text-sm">
              {files.map((file, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded hover:bg-muted/50 cursor-pointer transition-colors ${
                    file.name === activeFile ? 'bg-ai-primary/10 border border-ai-primary/20' : ''
                  }`}
                  onClick={() => file.type === "file" && setActiveFile(file.name)}
                >
                  <span className="text-lg">{getFileIcon(file)}</span>
                  <span className="flex-1">{file.name}</span>
                  {file.type === "file" && (
                    <Badge variant="secondary" className="text-xs">
                      {getLanguageFromFile(file.name)}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gradient-subtle rounded border-ai-primary/20 border">
              <h4 className="font-medium mb-2 text-ai-primary">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Code className="h-3 w-3 mr-2" />
                  New Component
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-3 w-3 mr-2" />
                  New File
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <GitBranch className="h-3 w-3 mr-2" />
                  Clone Repository
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="flex-1 flex flex-col mt-0">
          <div className="flex-1 p-4 bg-muted/10">
            {previewUrl ? (
              <div className="h-full space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-ai-primary" />
                    <span className="font-medium">Live Preview</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => window.open(previewUrl)}>
                      Open in New Tab
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
                
                <div className="h-full bg-background rounded border p-2">
                  <iframe
                    src={previewUrl}
                    className="w-full h-full rounded"
                    title="Live Preview"
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div className="space-y-4">
                  <Globe className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-medium mb-2">No Preview Available</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start the development server to see your app preview
                    </p>
                    <Button 
                      onClick={() => executeCommand("npm run dev")}
                      disabled={isRunning}
                      className="bg-ai-primary hover:bg-ai-primary/90"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Dev Server
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}