import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Square, Terminal, Globe, Code, FileText, Loader2 } from "lucide-react";

interface CodeTerminalProps {
  previewUrl: string;
  onPreviewUpdate: (url: string) => void;
}

export function CodeTerminal({ previewUrl, onPreviewUpdate }: CodeTerminalProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "Welcome to AI Code Terminal v1.0.0",
    "Type commands or let AI run them automatically...",
    ""
  ]);
  const [currentCommand, setCurrentCommand] = useState("");
  const terminalRef = useRef<HTMLDivElement>(null);

  const simulateCommand = async (command: string) => {
    setIsRunning(true);
    setTerminalOutput(prev => [...prev, `$ ${command}`]);
    
    // Simulate command execution with delays
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const responses: { [key: string]: string[] } = {
      "npm install": [
        "📦 Installing dependencies...",
        "✅ react@18.3.1",
        "✅ typescript@5.0.0", 
        "✅ vite@4.4.0",
        "🎉 Installation complete!"
      ],
      "npm run build": [
        "🔨 Building project...",
        "✅ Compiled successfully",
        "📁 dist/index.html",
        "📁 dist/assets/",
        "🚀 Build complete!"
      ],
      "npm run dev": [
        "🔥 Starting development server...",
        "📡 Local: http://localhost:5173",
        "🌐 Network: http://192.168.1.100:5173",
        "✨ Ready in 1.2s"
      ],
      "git init": [
        "🔧 Initialized empty Git repository",
        "📋 Created .git directory"
      ],
      "default": [
        "⚡ Command executed successfully",
        `✅ Process completed with exit code 0`
      ]
    };

    const response = responses[command] || responses["default"];
    
    for (const line of response) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setTerminalOutput(prev => [...prev, line]);
    }
    
    setTerminalOutput(prev => [...prev, ""]);
    setIsRunning(false);

    // Simulate preview URL generation for dev server
    if (command === "npm run dev" && !previewUrl) {
      setTimeout(() => {
        onPreviewUpdate(`https://preview-${Date.now()}.lovable.dev`);
      }, 1000);
    }
  };

  const runAutomaticSequence = async () => {
    const commands = ["npm install", "npm run build", "npm run dev"];
    
    for (const command of commands) {
      await simulateCommand(command);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-ai-primary" />
          <span className="font-semibold">AI Terminal</span>
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
            Auto Build
          </Button>
          {previewUrl && (
            <Button
              size="sm"
              onClick={() => window.open(previewUrl)}
              className="bg-ai-primary hover:bg-ai-primary/90"
            >
              <Globe className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="terminal" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="terminal" className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Terminal
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Code Editor
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="terminal" className="flex-1 flex flex-col mt-0">
          <ScrollArea className="flex-1 p-4" ref={terminalRef}>
            <div className="font-mono text-sm space-y-1 text-foreground">
              {terminalOutput.map((line, index) => (
                <div key={index} className={`${line.startsWith('$') ? 'text-ai-primary font-bold' : ''} ${line.includes('✅') ? 'text-green-400' : ''} ${line.includes('🚀') || line.includes('🎉') ? 'text-ai-accent' : ''}`}>
                  {line}
                </div>
              ))}
              {isRunning && (
                <div className="flex items-center gap-2 text-ai-primary">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Running...</span>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => simulateCommand("npm install")}
                disabled={isRunning}
              >
                Install
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => simulateCommand("npm run build")}
                disabled={isRunning}
              >
                Build
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => simulateCommand("npm run dev")}
                disabled={isRunning}
              >
                Run Dev
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code" className="flex-1 flex flex-col mt-0">
          <div className="flex-1 p-4 bg-muted/20">
            <div className="h-full bg-background rounded border p-4 font-mono text-sm">
              <div className="text-muted-foreground mb-2">// AI Generated Code</div>
              <div className="text-ai-primary">import</div> <span className="text-foreground">React</span> <span className="text-ai-primary">from</span> <span className="text-green-400">'react'</span><span className="text-foreground">;</span>
              <br /><br />
              <span className="text-ai-primary">function</span> <span className="text-yellow-400">App</span><span className="text-foreground">() {`{`}</span>
              <br />
              <span className="ml-4 text-ai-primary">return</span> <span className="text-foreground">(</span>
              <br />
              <span className="ml-8 text-muted-foreground">&lt;div className=</span><span className="text-green-400">"app"</span><span className="text-muted-foreground">&gt;</span>
              <br />
              <span className="ml-12 text-muted-foreground">&lt;h1&gt;</span><span className="text-foreground">Hello World!</span><span className="text-muted-foreground">&lt;/h1&gt;</span>
              <br />
              <span className="ml-8 text-muted-foreground">&lt;/div&gt;</span>
              <br />
              <span className="ml-4 text-foreground">);</span>
              <br />
              <span className="text-foreground">{`}`}</span>
              <br /><br />
              <span className="text-ai-primary">export default</span> <span className="text-foreground">App;</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="files" className="flex-1 flex flex-col mt-0">
          <div className="flex-1 p-4">
            <div className="space-y-2 text-sm">
              <div className="font-semibold text-muted-foreground mb-3">PROJECT FILES</div>
              
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                <FileText className="h-4 w-4 text-ai-primary" />
                <span>src/App.tsx</span>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                <FileText className="h-4 w-4 text-ai-secondary" />
                <span>src/main.tsx</span>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>package.json</span>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>vite.config.ts</span>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                <FileText className="h-4 w-4 text-green-400" />
                <span>index.html</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}