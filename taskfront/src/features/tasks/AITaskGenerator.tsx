import { useState, type ChangeEvent, type JSX, type KeyboardEvent } from "react";

interface AITaskGeneratorProps {
  onGenerate: (text: string) => Promise<void>;
}

export default function AITaskGenerator({
  onGenerate,
}: AITaskGeneratorProps): JSX.Element {
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    setText(event.target.value);
  };

  const handleClick = async (): Promise<void> => {
    if (!text.trim()) return;

    setLoading(true);
    await onGenerate(text);
    setLoading(false);
    setText("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === "Enter" && !event.shiftKey && !loading) {
      event.preventDefault();
      void handleClick();
    }
  };

  return (
    <div className="mb-6 bg-white/10 p-4 rounded-2xl border border-white/10">
      <div className="relative">
        <textarea
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
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
        onClick={() => void handleClick()}
        disabled={loading}
        className="mt-3 bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-xl transition disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate with AI"}
      </button>
    </div>
  );
}