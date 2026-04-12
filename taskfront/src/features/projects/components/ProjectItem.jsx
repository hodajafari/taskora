import { Trash2, Pencil, GripVertical } from "lucide-react";
import { motion } from "framer-motion";

export default function ProjectItem({
  p,
  editingId,
  editText,
  setEditText,
  setEditingId,
  onSave,
  onDelete,
  navigate,
  dragProps,
}) {
  return (
    <motion.div
      ref={dragProps.setNodeRef}
      style={dragProps.style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group relative p-4 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer"
    >
      {/* ✅ EDIT MODE */}
      {editingId === p.id ? (
        <input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          autoFocus
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-600"
          onClick={(e) => e.stopPropagation()}
          onBlur={onSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave();
            if (e.key === "Escape") {
              setEditingId(null);
              setEditText("");
            }
          }}
        />
      ) : (
        <>
          {/* ✅ NORMAL MODE */}
          <p onClick={() => navigate(`/project/${p.id}`)}>
            {p.name}
          </p>

          {/* ✅ ACTIONS (HOVER LIKE YOUR ORIGINAL 😎) */}
          <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 flex gap-2">

            {/* DRAG */}
            <div className="relative group/icon">
              <GripVertical
                {...dragProps.listeners}
                {...dragProps.attributes}
                onClick={(e) => e.stopPropagation()}
                className="cursor-grab text-gray-400 hover:text-blue-400 active:cursor-grabbing"
              />

              <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover/icon:opacity-100 transition-all whitespace-nowrap pointer-events-none">
                Drag
              </span>
            </div>

            {/* EDIT */}
            <div className="relative group/icon">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(p.id);
                  setEditText(p.name);
                }}
              >
                <Pencil size={14} />
              </button>

              <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover/icon:opacity-100 transition-all whitespace-nowrap pointer-events-none">
                Edit
              </span>
            </div>

            {/* DELETE */}
            <div className="relative group/icon">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(p.id);
                }}
              >
                <Trash2 size={14} />
              </button>

              <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover/icon:opacity-100 transition-all whitespace-nowrap pointer-events-none">
                Delete
              </span>
            </div>

          </div>
        </>
      )}
    </motion.div>
  );
}