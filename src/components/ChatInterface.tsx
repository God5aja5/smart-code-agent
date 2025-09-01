import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage, streamChatResponse } from "@/lib/claude-api";
import { ChatBubble } from "./ChatBubble";
import { Send, Sparkles } from "lucide-react";
import heroImage from "@/assets/chat-hero.jpg";

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: inputValue };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

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
    } catch (error) {
      console.error("Chat error:", error);
      // Remove the empty assistant message and add error message
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

  return (
    <div className="flex flex-col h-screen bg-gradient-secondary">
      {/* Hero Section */}
      {messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="relative mb-8">
              <img 
                src={heroImage} 
                alt="AI Chat Interface"
                className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-elegant"
              />
              <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-2xl" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Claude Sonnet 3.7
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Experience the power of advanced AI conversation with streaming responses and intelligent reasoning
            </p>
            <Button variant="hero" size="lg" className="shadow-glow">
              <Sparkles className="mr-2 h-5 w-5" />
              Start Chatting
            </Button>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      {messages.length > 0 && (
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="max-w-4xl mx-auto space-y-4">
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

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message Claude Sonnet 3.7..."
            className="flex-1 bg-muted/50 border-muted-foreground/20 focus:border-ai-primary"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            variant="chat"
            size="icon"
            className="shadow-glow"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}