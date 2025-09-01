import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage, streamChatResponse } from "@/lib/claude-api";
import { ChatBubble } from "./ChatBubble";
import { CodeTerminal } from "./CodeTerminal";
import { Send, Sparkles, Code, Play, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import heroImage from "@/assets/chat-hero.jpg";

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const detectCodeRequest = (message: string): boolean => {
    const codeKeywords = ['code', 'build', 'create app', 'develop', 'program', 'script', 'website', 'api', 'function', 'component'];
    return codeKeywords.some(keyword => message.toLowerCase().includes(keyword));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: inputValue };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    // Check if this is a coding request
    const isCodeRequest = detectCodeRequest(currentInput);
    if (isCodeRequest) {
      setShowTerminal(true);
    }

    try {
      // Add empty assistant message to show loading
      const assistantMessage: ChatMessage = { role: "assistant", content: "" };
      setMessages([...newMessages, assistantMessage]);

      let assistantContent = "";
      
      for await (const chunk of streamChatResponse(newMessages)) {
        assistantContent += chunk;
        
        // Update the last message with streaming content
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { 
            role: "assistant", 
            content: assistantContent 
          };
          return updated;
        });
      }

      // If it was a code request, simulate creating a preview
      if (isCodeRequest) {
        setTimeout(() => {
          setPreviewUrl(`https://preview-${Date.now()}.lovable.dev`);
        }, 2000);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { 
          role: "assistant", 
          content: "Sorry, I encountered an error. Please try again." 
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const MobileMenu = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full bg-card">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">AI Coding Assistant</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 p-4 space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">QUICK ACTIONS</h3>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start" onClick={() => setShowTerminal(!showTerminal)}>
                  <Code className="mr-2 h-4 w-4" />
                  Toggle Terminal
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Play className="mr-2 h-4 w-4" />
                  Run Code
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Sparkles className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </div>
            </div>
            
            {previewUrl && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">PREVIEW</h3>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm mb-2">Live Preview Ready</p>
                  <Button size="sm" className="w-full" onClick={() => window.open(previewUrl)}>
                    Open Preview
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-secondary">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/80 backdrop-blur-sm md:hidden">
        <MobileMenu />
        <h1 className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
          Claude Agent
        </h1>
        <Button variant="ghost" size="icon" onClick={() => setShowTerminal(!showTerminal)}>
          <Code className="h-5 w-5" />
        </Button>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between p-4 border-b bg-card/80 backdrop-blur-sm">
        <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Claude Sonnet 3.7 - AI Coding Assistant
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowTerminal(!showTerminal)}>
            <Code className="mr-2 h-4 w-4" />
            Terminal
          </Button>
          {previewUrl && (
            <Button size="sm" onClick={() => window.open(previewUrl)}>
              <Play className="mr-2 h-4 w-4" />
              Preview
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex flex-col flex-1">
          {/* Hero Section */}
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-4 md:p-8">
              <div className="text-center max-w-4xl mx-auto">
                <div className="relative mb-6 md:mb-8">
                  <img 
                    src={heroImage} 
                    alt="AI Coding Assistant"
                    className="w-full h-48 md:h-64 lg:h-96 object-cover rounded-2xl shadow-elegant"
                  />
                  <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-2xl" />
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 bg-gradient-primary bg-clip-text text-transparent">
                  AI Coding Assistant
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 px-4">
                  Code, build, and deploy with Claude Sonnet 3.7. Live terminal, instant previews, and intelligent assistance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="hero" size="lg" className="shadow-glow">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Coding
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => setShowTerminal(true)}>
                    <Code className="mr-2 h-5 w-5" />
                    Open Terminal
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.length > 0 && (
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="max-w-4xl mx-auto space-y-4 pb-4">
                {messages.map((message, index) => (
                  <ChatBubble
                    key={index}
                    message={message}
                    isLoading={isLoading && index === messages.length - 1 && message.role === "assistant"}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}

          {/* Input Area - Fixed at bottom */}
          <div className="border-t border-border bg-card/95 backdrop-blur-sm p-4 safe-area-bottom">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-2 md:gap-3 items-end">
                <div className="flex-1">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me to code anything..."
                    className="min-h-[44px] bg-muted/50 border-muted-foreground/20 focus:border-ai-primary resize-none"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  variant="chat"
                  size="icon"
                  className="min-h-[44px] min-w-[44px] shadow-glow"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Continue Button for Token Limits */}
              {isLoading && (
                <div className="flex justify-center mt-2">
                  <Button variant="outline" size="sm" disabled>
                    Continue Generation...
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Terminal Sidebar - Desktop */}
        {showTerminal && (
          <div className="hidden md:block w-1/2 border-l border-border">
            <CodeTerminal previewUrl={previewUrl} onPreviewUpdate={setPreviewUrl} />
          </div>
        )}
      </div>

      {/* Terminal Modal - Mobile */}
      {showTerminal && (
        <Sheet open={showTerminal} onOpenChange={setShowTerminal}>
          <SheetContent side="bottom" className="h-[80vh] md:hidden p-0">
            <CodeTerminal previewUrl={previewUrl} onPreviewUpdate={setPreviewUrl} />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}