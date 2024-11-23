import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Define the type for chat messages
type ChatMessage = {
  type: "user" | "bot"; // Type is either "user" or "bot"
  message: string; // The message content
};

const App = () => {
  const [userInput, setUserInput] = useState<string>(""); // State for user input
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      type: "bot",
      message: "Hi there! How can I help you today?",
    },
  ]); // State for chat history

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string; // Secure API key usage
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const sendMessage = async (messageText: string) => {
    if (messageText.trim() === "") return;

    // Add user message and "typing..." bot message to chat history
    setChatHistory((prev) => [
      ...prev,
      { type: "user", message: messageText },
      { type: "bot", message: "Typing..." },
    ]);

    setUserInput(""); // Clear input field

    try {
      const prompt = messageText;
      const result = await model.generateContent(prompt);
      const text = result.response.text() || "No response available"; // Adjust based on actual response structure

      // Replace "Typing..." with the actual response
      setChatHistory((prev) => [
        ...prev.slice(0, -1), // Remove the last "Typing..." message
        { type: "bot", message: text },
      ]);
    } catch (e) {
      console.error("Error occurred while fetching", e);

      // Replace "Typing..." with an error message
      setChatHistory((prev) => [
        ...prev.slice(0, -1), // Remove the last "Typing..." message
        { type: "bot", message: "Oops! Something went wrong. Please try again." },
      ]);
    }
  };

  return (
    <div style={{ position: "relative", height: "800px", width: "100vw" }}>
      <MainContainer>
        <ChatContainer>
          <MessageList>
            {chatHistory.map((elt, i) => (
              <Message
                key={i}
                model={{
                  message: elt.message,
                  sender: elt.type,
                  sentTime: "just now",
                  direction: elt.type === "user" ? "outgoing" : "incoming",
                  position: "normal", // Default message position
                }}
              />
            ))}
          </MessageList>
          <MessageInput
            placeholder="Type message here"
            value={userInput}
            onChange={(value) => setUserInput(value)}
            onSend={() => sendMessage(userInput)}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default App;
