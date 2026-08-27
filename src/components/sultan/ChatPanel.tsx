import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  time: string;
}

export const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Black Sultan AI online. Ready for commands.", sender: "ai", time: new Date().toLocaleTimeString() },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      text: input,
      sender: "user",
      time: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now() + 1,
        text: getAIResponse(input),
        sender: "ai",
        time: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  const getAIResponse = (msg: string) => {
    const lower = msg.toLowerCase();
    if (lower.includes("status")) return "All systems operational. 4 bots active, 0 threats detected.";
    if (lower.includes("bot")) return "Bots are running optimally. Runner Bot leading with 42 tasks completed.";
    if (lower.includes("coin") || lower.includes("wallet")) return `Current balance: ${Math.floor(Math.random() * 1000 + 15000)} coins. Mining rate: +${Math.floor(Math.random() * 10 + 5)}/s`;
    return "Command received. Processing...";
  };

  return (
    <Card className="p-6 bg-card/80 backdrop-blur flex flex-col h-[400px]">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-6 h-6 text-accent" />
        <h2 className="text-xl font-bold">AI Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs opacity-70 mt-1">{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type command..."
          className="flex-1"
        />
        <Button onClick={sendMessage}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};