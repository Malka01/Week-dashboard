import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { sendAIMessage } from "../../services/ai.service";
import ReactMarkdown from "react-markdown";
import chatAssistantImage from "../../assets/chat_assistant.png";

const AIChatAssistant = () => {
  const { token } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I can help you analyze team reports. Ask me about blockers, achievements, workload, tasks, or team activity.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: trimmedMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const answer = await sendAIMessage(
        trimmedMessage,
        token
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error.message ||
            "Sorry, I couldn't process your request.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-10 right-10 z-50 flex h-15 w-15 items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-lg transition hover:bg-blue-700"
        aria-label="Open AI Assistant"
      >
        <img
          src={chatAssistantImage}
          alt="AI Chat Assistant"
          className="h-12 w-12 object-contain fixed bottom-12 right-10"
        />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed top-5 right-5 z-50 flex h-[550px] w-[380px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
            <div>
              <h2 className="font-semibold">
                AI Team Assistant
              </h2>
              <p className="text-xs text-blue-100">
                Powered by team reports
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xl hover:text-gray-200"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.map((item, index) => (
              <div
                key={index}
                className={`flex ${
                  item.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
    item.role === "user"
      ? "bg-blue-600 text-white"
      : "bg-white text-gray-800 shadow-sm"
  }`}
>
  {item.role === "assistant" ? (
    <ReactMarkdown
      components={{
        strong: ({ children }) => (
          <strong className="font-semibold">
            {children}
          </strong>
        ),
        ul: ({ children }) => (
          <ul className="my-2 list-disc space-y-1 pl-5">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="my-2 list-decimal space-y-1 pl-5">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li>{children}</li>
        ),
        p: ({ children }) => (
          <p className="mb-2 last:mb-0">
            {children}
          </p>
        ),
      }}
    >
      {item.content}
    </ReactMarkdown>
  ) : (
    item.content
  )}
</div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-white px-3 py-2 text-sm text-gray-500 shadow-sm">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="border-t bg-white p-3"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                placeholder="Ask about your team..."
                disabled={loading}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatAssistant;