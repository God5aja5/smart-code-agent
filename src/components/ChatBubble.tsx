import { ChatMessage } from "@/lib/claude-api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  message: ChatMessage;
  isLoading?: boolean;
}

export function ChatBubble({ message, isLoading }: ChatBubbleProps) {
  const isUser = message.role === "user";
  
  return (
    <div className={cn(
      "flex gap-3 max-w-4xl",
      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      <Avatar className={cn(
        "h-8 w-8 border-2",
        isUser 
          ? "border-chat-bubble-user bg-chat-bubble-user" 
          : "border-ai-primary bg-ai-primary"
      )}>
        <AvatarFallback className="text-primary-foreground">
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "rounded-2xl px-4 py-3 max-w-[80%] shadow-sm",
        isUser
          ? "bg-chat-bubble-user text-primary-foreground ml-2"
          : "bg-chat-bubble-ai text-foreground mr-2 border border-border"
      )}>
        {isLoading && !message.content ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Claude is thinking...</span>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap m-0 leading-relaxed">
              {message.content}
            </p>
            {isLoading && message.content && (
              <Loader2 className="inline h-3 w-3 animate-spin ml-1 opacity-70" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}