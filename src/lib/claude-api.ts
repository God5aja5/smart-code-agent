const API_KEY = "9f34d61b969a4d41535bfa7cce27a1d6401d1e21538d3ae5e653471ef1196816";
const API_URL = "https://api-anthropic-proxy.vercel.app/v1/chat/completions";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  choices: Array<{
    delta: {
      content: string;
    };
  }>;
}

export async function* streamChatResponse(messages: ChatMessage[]): AsyncGenerator<string> {
  const payload = {
    model: "sonnet-3.7",
    messages,
    stream: true,
    isReasoningEnabled: true
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`API Error: ${await response.text()}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder("utf-8");
  
  if (!reader) {
    throw new Error("Failed to get response reader");
  }

  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    
    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      
      for (const line of chunk.split("\n")) {
        if (line.startsWith("data: ")) {
          const content = line.replace("data: ", "").trim();
          
          if (content !== "[DONE]") {
            try {
              const obj = JSON.parse(content) as ChatResponse;
              const text = obj.choices[0]?.delta?.content;
              if (text) {
                yield text;
              }
            } catch (err) {
              // Ignore parse errors for malformed chunks
            }
          }
        }
      }
    }
  }
}