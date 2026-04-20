import { useState, memo, useEffect } from "react";
import API from "../api/axios";
import { useParams } from "react-router-dom";
import {
  DndContext,
  closestCorners,
  useDraggable,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Trash2, Pencil,GripVertical, Activity, MessageCircle,Check , X   } from "lucide-react";

import CommentSection from "../components/CommentSection";
import ActivityTimeline from "../components/ActivityTimeline";

import {
  useTasks,
  useCreateTask,
  useDeleteTask,
  useUpdateTask,
  useReorderTasks,
} from "../features/tasks/hooks/useTasks";

import AITaskGenerator from "../features/tasks/AITaskGenerator";
import { useGenerateAITasks } from "../features/tasks/hooks/useTasks";
import { suggestAITasks } from "../features/tasks/api/taskApi";

const MemoComment = memo(CommentSection);

export default function ProjectPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [panelType, setPanelType] = useState(null);
  const [title, setTitle] = useState("");
  const [assigned, setAssigned] = useState("");
  const [activeTask, setActiveTask] = useState(null);
  
  // ===== PROJECKT =====
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await API.get(`projects/${id}/`);
      return res.data;
    },
  });
  // ===== TASKS =====
  const { data: tasks = [], isLoading } = useTasks(id);

  // ===== USERS =====
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await API.get("users/");
      return res.data;
    },
  });

  // ===== MUTATIONS =====
  const createMutation = useCreateTask(id);
  const deleteMutation = useDeleteTask(id);
  const editMutation = useUpdateTask(id);
  const reorderMutation = useReorderTasks(id);
  const aiMutation = useGenerateAITasks(id);

  const updateTask = (taskId, title) => {
    editMutation.mutate({ taskId, title });
  };

  // ===== SORT =====
  const getTasks = (status) =>
    tasks
      .filter((t) => t.status === status)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  
  
const [aiSuggestions, setAiSuggestions] = useState([]);
const [showAll, setShowAll] = useState(false);
const getUserByRole = (role) => {
  return users.find((u) => u.role === role)?.id || null;
};

useEffect(() => {
  if (!title.trim()) {
    setAiSuggestions([]);
    setShowAll(false);
    return;
  }
  
  const delay = setTimeout(async () => {
    try {
      const res = await suggestAITasks({ text: title });
      console.log(res.data.subtasks);
      setAiSuggestions(
  (res.data.subtasks || [])
    .filter((t) => !t.title.toLowerCase().startsWith("analyze"))
    .map((t, idx) => ({
      title: t.title,
       id: idx + "_" + t.title,
      checked: false,
      assignedTo: getUserByRole(t.assign),
    }))
);

    } catch (err) {
      console.log(err);
    }
  }, 500);

  return () => clearTimeout(delay);
}, [title]);

const handleAddSelected = () => {
  const selected = aiSuggestions.filter((t) => t.checked);

  selected.forEach((task) => {
    createMutation.mutate({
      title: task.title,
      project: Number(id),
      assigned_to: task.assignedTo || null,
      status: "todo",
      order: 0,
    });
  });

  setAiSuggestions([]); 
};

const handleGenerateAI = async (text) => {
  try {
    const res = await suggestAITasks({
      text,
    });
    console.log("AI subtasks:", res.data.subtasks); 
    setAiSuggestions(
  (res.data.subtasks || [])
    .filter((t) => !t.title.toLowerCase().startsWith("analyze")) 
    .map((t, idx) => ({
      title: t.title,
      id: idx + "_" + t.title,
      checked: false,
      assignedTo: getUserByRole(t.assign),
    }))
);
  setShowAll(false);
  } catch (err) {
    console.log(err);
  }
};

if (isLoading) return <p className="p-6">Loading...</p>;


const visibleSuggestions = showAll
  ? aiSuggestions
  : aiSuggestions.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617] text-white p-6">
      <div className="mb-8">
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {project?.name}
            </h1>
            <p className="text-gray-400 mt-1">
              Manage your tasks with AI assistance 
            </p>

            {project?.description && (
              <p className="text-gray-400 text-sm mt-1">
                {project.description}
              </p>
            )}
          </div>
      </div>
      {/* ===== AI GENERATOR ===== */}
      <AITaskGenerator
        onGenerate={handleGenerateAI}
        loading={aiMutation.isLoading}
      />
      
      {/* ===== CREATE ===== */}
    <div className="flex gap-3 mb-8 bg-white/10 p-4 rounded-2xl border border-white/10">
      <div className="flex gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task..."
          className="flex-1 bg-transparent border border-white/20 p-3 rounded-xl outline-none"
        />

        <select
          value={assigned}
          onChange={(e) => setAssigned(e.target.value)}
          className="bg-[#1e293b] text-white border border-white/20 p-3 rounded-xl"
        >
          <option value="">Assign user</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.email}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            if (!title.trim()) return;

            createMutation.mutate({
              title: title.trim(),
              project: Number(id),
              status: "todo",
              order: 0,
              ...(assigned && { assigned_to: Number(assigned) }),
            });

            setTitle("");
            setAssigned("");
          }}
          className="bg-blue-600 hover:bg-blue-500 px-5 rounded-xl"
        >
          Add
        </button>
      </div>
      {/* 🔥 AI SUGGESTIONS */}   
{aiSuggestions.length > 0 && (
  <div className="relative mt-4 bg-black/40 p-4 rounded-2xl border border-white/10 backdrop-blur">
    <button
      onClick={() => setAiSuggestions([])}
      className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
    >
      <X size={18} />
    </button>
    <p className="text-sm text-gray-400 mb-3 flex items-center gap-2">
      ✨ AI Suggestions
    </p>

    {visibleSuggestions.map((item) => (
      <div
        key={item.id}
        onClick={() => {
          const updated =  aiSuggestions.map((t) =>
           t.id === item.id
          ? { ...t, checked: !t.checked }
          : t
          );
          setAiSuggestions(updated);
        }}
        className={`
          flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer transition-all
          ${item.checked 
            ? "bg-purple-500/20 border border-gray-500/40" 
            : "hover:bg-white/10 border border-transparent"}
        `}
      >
        {/* LEFT */}
        <div className="flex items-center gap-3 flex-1">

          {/* CHECK ICON */}
          <div className={`
            w-5 h-5 flex items-center justify-center rounded-md border transition
            ${item.checked 
              ? "bg-blue-500 border-blue-500" 
              : "border-white/20"}
          `}>
            {item.checked && <Check size={14} />}
          </div>

          {/* TITLE */}
          <span className={`
            transition
            ${item.checked ? "line-through opacity-50" : ""}
          `}>
            {item.title}
          </span>
        </div>

        {/* ASSIGN */}
        <select
          value={item.assignedTo || ""}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            const updated = aiSuggestions.map((t) =>
            t.id === item.id
              ? { ...t, assignedTo: Number(e.target.value) }
              : t
          );
            setAiSuggestions(updated);
          }}
          className="bg-[#1e293b] text-white border border-white/20 p-3 rounded-xl"
        >
          <option value="">Assign</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.email}
            </option>
          ))}
        </select>
      </div>
    ))}
    {aiSuggestions.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition"
        >
          {showAll ? "Show less" : "Show more"}
        </button>
      )}
    <button
      onClick={handleAddSelected}
      className="mt-4 w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-xl transition shadow-lg shadow-blue-500/20"
    >
      Add Selected
    </button>

  </div>
  
)}      
</div>

      {/* ===== BOARD ===== */}
      <DndContext
        collisionDetection={closestCorners }
        onDragStart={(event) => {
          const task = tasks.find(
            (t) => t.id === Number(event.active.id)
          );
          setActiveTask(task);
        }}
        onDragEnd={(event) => {
          const { active, over } = event;
          setActiveTask(null);
          if (!over) return;

          const activeId = Number(active.id);
          const activeTask = tasks.find((t) => t.id === activeId);

          const isOverColumn = ["todo", "doing", "done"].includes(over.id);

          const newStatus = isOverColumn
            ? over.id
            : tasks.find((t) => t.id === Number(over.id))?.status;

          if (!newStatus) return;

          const columnTasks = tasks
            .filter((t) => t.status === newStatus)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

          const filtered = columnTasks.filter(
            (t) => t.id !== activeTask.id
          );

          let newIndex;

            if (isOverColumn) {
              newIndex = filtered.length;
            } else {
              const overIndex = filtered.findIndex(
                (t) => t.id === Number(over.id)
              );

              if (overIndex === -1) {
                newIndex = filtered.length;
              } else {
                newIndex = overIndex;
              }
            }

          filtered.splice(newIndex, 0, {
            ...activeTask,
            status: newStatus,
          });

          const updated = filtered.map((t, index) => ({
            ...t,
            order: index,
          }));

          queryClient.setQueryData(["tasks", id], (old = []) => {
            const other = old.filter(
              (t) => t.status !== newStatus && t.id !== activeTask.id
            );
            return [...other, ...updated];
          });

          reorderMutation.mutate(
            updated.map((t) => ({
              id: t.id,
              order: t.order,
              status: t.status,
            }))
          );
        }}
      >
        <div className="flex gap-6">
          {/* ===== COLUMNS ===== */}
          <div className="flex-1 grid md:grid-cols-3 gap-6">
            <Column
              id="todo"
              title="Todo"
              tasks={getTasks("todo")}
              deleteTask={deleteMutation.mutate}
              updateTask={updateTask}
              onSelect={setSelectedTask}
              setPanelType={setPanelType} 
            />
            <Column
              id="doing"
              title="Doing"
              tasks={getTasks("doing")}
              deleteTask={deleteMutation.mutate}
              updateTask={updateTask}
              onSelect={setSelectedTask}
              setPanelType={setPanelType} 
            />
            <Column
              id="done"
              title="Done"
              tasks={getTasks("done")}
              deleteTask={deleteMutation.mutate}
              updateTask={updateTask}
              onSelect={setSelectedTask}
              setPanelType={setPanelType} 
            />
          </div>

          {/* ===== SIDE PANEL ===== */}
          {selectedTask && (
            <div className="w-[350px] bg-[#020617] border border-white/10 rounded-2xl p-4">
              
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">
                  {selectedTask.title}
                </h2>
                <button onClick={() => {
                  setSelectedTask(null);
                  setPanelType(null);
                }}>
                  ✕
                </button>
              </div>

              {panelType === "comment" && (
                <MemoComment taskId={selectedTask.id} enableEnterToSend />
              )}

              {panelType === "activity" && (
                <ActivityTimeline taskId={selectedTask.id} />
              )}

            </div>
          )}

        {/* ===== DRAG OVERLAY ===== */}
        <DragOverlay>
          {activeTask && (
            <div className="bg-white/20 p-4 rounded-xl w-[260px]">
              {activeTask.title}
            </div>
          )}
        </DragOverlay>
        </div>
      </DndContext>
    </div>
  );
}

// ===== COLUMN =====
const Column = memo(({ id, title, tasks, deleteTask, updateTask, onSelect , setPanelType}) => {
  const { setNodeRef } = useDroppable({
    id,
    data: { type: "column" }, 
  });


  return (
    <div
      ref={setNodeRef}
      className="bg-white/10 p-4 rounded-2xl min-h-[300px]"
    >
      <h3 className="mb-4 font-semibold">{title}</h3>

      {tasks.length === 0 && (
        <p className="text-gray-400 text-sm">No tasks</p>
      )}

      {tasks.map((task) => (
        <Task
          key={task.id}
          task={task}
          deleteTask={deleteTask}
          updateTask={updateTask}
          onSelect={onSelect}
          setPanelType={setPanelType} 
        />
      ))}
    </div>
  );
});

// ===== TASK =====
const Task = memo(({ task, deleteTask, updateTask, onSelect, setPanelType }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });
  const { setNodeRef: setDropRef } = useDroppable({
  id: task.id,
  data: { type: "task" },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(task.title);

  useEffect(() => {
    setNewTitle(task.title);
  }, [task.title]);

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0  : 1,
  };

  const saveEdit = () => {
    if (newTitle.trim() === task.title) {
      setIsEditing(false);
      return;
    }

    updateTask(task.id, newTitle);
    setIsEditing(false);
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);   // draggable
        setDropRef(node);   // droppable 🔥
      }}
      style={style}
      className="group relative bg-white/10 p-4 mb-3 rounded-xl cursor-pointer"
    >
      {/* ACTIONS + DRAG */}
      {/* RIGHT: ACTIONS */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">

        {/* ACTIVITY */}
        <div className="relative group/icon">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(task);
              setPanelType("activity");
            }}
          >
            <Activity size={14} />
          </button>

          <span className="
            absolute top-full mt-1 left-1/2 -translate-x-1/2
            text-xs bg-black text-white px-2 py-1 rounded
            opacity-0 group-hover/icon:opacity-100
            transition-all whitespace-nowrap pointer-events-none
          ">
            Activity
          </span>
        </div>

        
        <div className="relative group/icon">
          <GripVertical
            {...listeners}
            {...attributes}
            onClick={(e) => e.stopPropagation()}
            className="
              cursor-grab text-gray-400
              hover:text-blue-400
              active:cursor-grabbing
            "
          />

          {/* TOOLTIP */}
          <span className="
            absolute top-full mt-1 left-1/2 -translate-x-1/2
            text-xs bg-black text-white px-2 py-1 rounded
            opacity-0 group-hover/icon:opacity-100
            transition-all whitespace-nowrap pointer-events-none
          ">
            Drag
          </span>
        </div>
      
        {/* COMMENT */}
        <div className="relative group/icon">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(task);
              setPanelType("comment");
            }}
          >
            <MessageCircle size={14} />
          </button>

          <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover/icon:opacity-100 transition-all whitespace-nowrap pointer-events-none">
            Comment
          </span>
        </div>

        {/* EDIT */}
        <div className="relative group/icon">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
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
              deleteTask(task.id);
            }}
          >
            <Trash2 size={14} />
          </button>

          <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover/icon:opacity-100 transition-all whitespace-nowrap pointer-events-none">
            Delete
          </span>
        </div>

      </div>
      {/* CONTENT */}
      {isEditing ? (
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          autoFocus
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              saveEdit();
            }
          }}
          onBlur={saveEdit}
          className="w-full bg-black/40 p-2 rounded text-white"
        />
      ) : (
        <p className="cursor-default">
          {task.title}
        </p>
      )}

      {/* ASSIGNED */}
      {task.assigned_to_email && (
        <div className="mt-2 text-xs text-blue-300">
          {task.assigned_to_email}
        </div>
      )}
    </div>
  );
});