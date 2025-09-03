const GEMINI_API_KEY = "AIzaSyCTXlV4jwcQdd8VxE2vDDjPA6NLSqQ6JxQ";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

// Code extraction and file management
export interface ExtractedCode {
  filename: string;
  content: string;
  language: string;
}

// Enhanced mock responses for coding-focused platform
const mockResponses = {
  greeting: [
    "Hello! I'm Gemini 2.0 Flash, your AI coding assistant. ",
    "I'm here to help you build amazing applications with code generation, debugging, and live previews.\n\n",
    "I can help you create React components, Node.js APIs, databases, and deploy full-stack applications. ",
    "What would you like to build today?"
  ],
  coding: [
    "I'll help you build that! Let me create the code structure and set up a live preview for you.\n\n",
    "```tsx\n// Component.tsx\nimport React from 'react';\n\nconst Component = () => {\n  return (\n    <div className=\"p-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white\">\n      <h1 className=\"text-4xl font-bold mb-4\">Hello Vibe Coder!</h1>\n      <p className=\"text-xl\">Built with Gemini 2.0 Flash ⚡</p>\n    </div>\n  );\n};\n\nexport default Component;\n```\n\n",
    "```tsx\n// App.tsx\nimport React from 'react';\nimport Component from './Component';\n\nfunction App() {\n  return (\n    <div className=\"min-h-screen bg-gray-100\">\n      <Component />\n    </div>\n  );\n}\n\nexport default App;\n```\n\n",
    "✅ Files created! Check the terminal for live updates and use the preview button to see your app."
  ],
  general: [
    "That's a great question! As Gemini 2.0 Flash, I can help you with coding, development, and much more. ",
    "I specialize in full-stack development, AI integrations, and creating beautiful user interfaces. ",
    "What specific project or feature would you like to work on?"
  ]
};

// Extract code blocks from AI response
export function extractCodeFromResponse(response: string): ExtractedCode[] {
  const codeBlocks: ExtractedCode[] = [];
  const codeBlockRegex = /```(\w+)?\n(.*?)\n```/gs;
  let match;

  while ((match = codeBlockRegex.exec(response)) !== null) {
    const language = match[1] || 'javascript';
    const content = match[2];
    
    // Try to extract filename from comments
    const filenameMatch = content.match(/\/\/\s*([A-Za-z0-9_./-]+\.(tsx?|jsx?|css|html|json))/);
    let filename = 'generated-file';
    
    if (filenameMatch) {
      filename = filenameMatch[1];
    } else {
      // Generate filename based on language
      const extensions: { [key: string]: string } = {
        'tsx': '.tsx',
        'typescript': '.ts', 
        'jsx': '.jsx',
        'javascript': '.js',
        'css': '.css',
        'html': '.html',
        'json': '.json'
      };
      filename = `generated-${Date.now()}${extensions[language] || '.txt'}`;
    }
    
    codeBlocks.push({
      filename,
      content: content.trim(),
      language
    });
  }
  
  return codeBlocks;
}

async function* mockStreamResponse(message: string): AsyncGenerator<string> {
  // Detect message type and choose appropriate response
  let responseArray = mockResponses.general;
  
  if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
    responseArray = mockResponses.greeting;
  } else if (message.toLowerCase().includes("code") || message.toLowerCase().includes("build") || 
             message.toLowerCase().includes("create") || message.toLowerCase().includes("app") ||
             message.toLowerCase().includes("website") || message.toLowerCase().includes("api")) {
    responseArray = mockResponses.coding;
  }

  // Stream the response
  for (const sentence of responseArray) {
    const words = sentence.split(' ');
    for (let i = 0; i < words.length; i++) {
      const chunk = (i === 0 ? words[i] : ' ' + words[i]);
      yield chunk;
      // Realistic typing speed
      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 70));
    }
    // Small pause between sentences
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export async function* streamChatResponse(messages: ChatMessage[]): AsyncGenerator<string> {
  const userMessage = messages[messages.length - 1]?.content || "";
  
  // Try Gemini API first, fallback to mock if it fails
  try {
    console.log("Attempting Gemini API call...");
    
    // Convert messages to Gemini format
    const geminiMessages = messages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    const payload = {
      contents: geminiMessages,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}&alt=sse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
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
            
            if (content !== "[DONE]" && content) {
              try {
                const obj = JSON.parse(content) as GeminiResponse;
                const text = obj.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  yield text;
                }
              } catch (err) {
                // Ignore parse errors for malformed chunks
                console.log("Parse error:", err);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.log("Gemini API call failed, using enhanced mock response:", error);
    
    // Fallback to enhanced mock response
    yield* mockStreamResponse(userMessage);
  }
}