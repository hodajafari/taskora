import { useState } from "react";

export default function AITaskGenerator({ onGenerate }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!text.trim()) return;

    setLoading(true);
    await onGenerate(text);
    setLoading(false);
    setText("");
  };

 return (
  <div className="mb-6 bg-white/10 p-4 rounded-2xl border border-white/10">
    
    <div className="relative">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !loading) {
            e.preventDefault(); // ❗ نره خط بعد
            handleClick(); // 🔥 همون دکمه
            }
        }}
        placeholder="✨ Describe your task... AI will break it down"
        className="w-full bg-transparent border border-white/20 p-4 rounded-xl outline-none focus:border-purple-500 transition"
        />

      {loading && (
        <span className="absolute right-3 bottom-3 text-xs text-gray-400 animate-pulse">
          AI is thinking...
        </span>
      )}
    </div>

    <button
      onClick={handleClick}
      disabled={loading}
      className="mt-3 bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-xl transition disabled:opacity-50"
    >
      {loading ? "Generating..." : "Generate with AI"}
    </button>

  </div>
    );
}