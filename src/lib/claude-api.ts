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

// Mock responses for demo (since CORS blocks direct API calls from browser)
const mockResponses = [
  "Hello! I'm Claude Sonnet 3.7, an AI assistant created by Anthropic. ",
  "I'm here to help you with a wide variety of tasks including answering questions, ",
  "writing, analysis, math, coding, creative projects, and much more.\n\n",
  "How can I assist you today? Feel free to ask me anything you'd like to know or ",
  "discuss any topic that interests you. I'm designed to be helpful, harmless, and honest ",
  "in all my interactions."
];

async function* mockStreamResponse(message: string): AsyncGenerator<string> {
  // Simulate different responses based on user input
  let responseText = "";
  
  if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
    responseText = "Hello! I'm Claude Sonnet 3.7. Nice to meet you! I'm an AI assistant created by Anthropic. How can I help you today?";
  } else if (message.toLowerCase().includes("how are you")) {
    responseText = "I'm doing well, thank you for asking! As an AI, I'm always ready to help and engage in conversation. What would you like to talk about?";
  } else if (message.toLowerCase().includes("what can you do")) {
    responseText = "I can help with many tasks including: writing and editing, analysis and research, math and calculations, coding and programming, creative projects, answering questions, and having conversations on various topics. What specific area interests you?";
  } else {
    responseText = `That's an interesting question about "${message}". I'm Claude Sonnet 3.7, and I'd be happy to help you explore this topic further. Could you provide more context about what specifically you'd like to know?`;
  }

  // Simulate streaming by breaking the response into chunks
  const words = responseText.split(' ');
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? words[i] : ' ' + words[i]);
    yield chunk;
    // Add realistic delay between chunks
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
  }
}

export async function* streamChatResponse(messages: ChatMessage[]): AsyncGenerator<string> {
  const userMessage = messages[messages.length - 1]?.content || "";
  
  // Try real API first, fallback to mock if CORS fails
  try {
    console.log("Attempting real API call...");
    
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
      throw new Error(`API Error: ${response.status}`);
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
  } catch (error) {
    console.log("API call failed, using mock response:", error);
    
    // Fallback to mock response
    yield* mockStreamResponse(userMessage);
  }
}