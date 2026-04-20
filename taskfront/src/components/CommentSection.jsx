import { useState, useContext } from "react";
import { Trash2, Pencil, Reply } from "lucide-react";
import { AuthContext } from "../features/auth/AuthContext";

export default function CommentSection({ enableEnterToSend = true }) {
  const { user } = useContext(AuthContext);

  const [text, setText] = useState("");
  const [comments, setComments] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  // ✅ create comment
  const submitComment = () => {
    if (!text.trim()) return;

    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        parent: null,
        user_email: user?.email || "Unknown",
      },
    ]);

    setText("");
  };

  // ✅ reply
  const submitReply = (parentId) => {
    if (!replyText.trim()) return;

    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: replyText,
        parent: parentId,
        user_email: user?.email || "Unknown",
      },
    ]);

    setReplyText("");
    setReplyingTo(null);
  };

  // ✅ edit 
  const startEdit = (c) => {
    setEditingId(c.id);
    setEditText(c.text);
  };

  const saveEdit = () => {
    if (!editText.trim()) return;

    setComments((prev) =>
      prev.map((c) =>
        c.id === editingId ? { ...c, text: editText } : c
      )
    );

    setEditingId(null);
    setEditText("");
  };

  // ✅ delete 
  const deleteComment = (id) => {
    setComments((prev) =>
      prev.filter((c) => c.id !== id && c.parent !== id)
    );
  };

  const rootComments = comments.filter((c) => !c.parent);

  return (
    <div className="mt-3">
      {/* input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm"
        onKeyDown={(e) => {
          if (enableEnterToSend && e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitComment();
          }
        }}
      />

      {/* comments */}
      <div className="mt-4 space-y-3">
        {rootComments.map((c) => {
          const replies = comments.filter((r) => r.parent === c.id);

          return (
            <div key={c.id} className="space-y-2">
              {/* 🔵 COMMENT */}
              <div className="group relative bg-white/5 p-3 rounded-xl">
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => startEdit(c)}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteComment(c.id)}>
                    <Trash2 size={14} />
                  </button>
                  <button onClick={() => setReplyingTo(c.id)}>
                    <Reply size={14} />
                  </button>
                </div>

                <p className="text-xs text-gray-400">{c.user_email}</p>

                {editingId === c.id ? (
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                    autoFocus
                    className="mt-1 bg-white/10 px-2 py-1 rounded-md w-full"
                  />
                ) : (
                  <p className="text-sm mt-1">{c.text}</p>
                )}
              </div>

              {/* 🟡 reply input */}
              {replyingTo === c.id && (
                <div className="ml-6 flex gap-2">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 bg-white/10 px-2 py-1 rounded-md"
                    onKeyDown={(e) =>
                      e.key === "Enter" && submitReply(c.id)
                    }
                  />
                  <button onClick={() => submitReply(c.id)}>
                    Send
                  </button>
                </div>
              )}

              {/* 🟢 replies */}
              <div className="ml-6 space-y-2">
                {replies.map((r) => (
                  <div
                    key={r.id}
                    className="group relative bg-white/5 p-2 rounded-lg"
                  >
                    {/* hover actions برای reply */}
                    <div className="absolute top-1 right-1 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => startEdit(r)}>
                        <Pencil size={12} />
                      </button>

                      <button onClick={() => deleteComment(r.id)}>
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <p className="text-xs text-gray-400">
                      {r.user_email}
                    </p>

                    {editingId === r.id ? (
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && saveEdit()
                        }
                        autoFocus
                        className="mt-1 bg-white/10 px-2 py-1 rounded-md w-full text-sm"
                      />
                    ) : (
                      <p className="text-sm mt-1">{r.text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}