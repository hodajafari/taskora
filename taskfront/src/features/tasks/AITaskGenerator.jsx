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
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="مثلاً: Build login system with JWT"
        className="w-full bg-transparent border border-white/20 p-3 rounded-xl outline-none"
      />

      <button
        onClick={handleClick}
        disabled={loading}
        className="mt-3 bg-purple-600 hover:bg-purple-500 px-5 py-2 rounded-xl"
      >
        {loading ? "Generating..." : "Generate with AI"}
      </button>
    </div>
  );
}