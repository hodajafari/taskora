import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ProjectItem from "../components/ProjectItem";

function SortableItem({ p, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: String(p.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return children({ setNodeRef, style, attributes, listeners });
}

export default function ProjectList({
  projects,
  onDelete,
  navigate,
  editingId,
  editText,
  setEditText,
  setEditingId,
  onSave,
  setProjects,
}) {
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex(
      (i) => String(i.id) === active.id
    );

    const newIndex = projects.findIndex(
      (i) => String(i.id) === over.id
    );

    const newOrder = arrayMove(projects, oldIndex, newIndex);
    setProjects(newOrder);
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={projects.map((p) => String(p.id))}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {projects.map((p) => (
            <SortableItem key={p.id} p={p}>
              {(dragProps) => (
                <ProjectItem
                  p={p}
                  dragProps={dragProps}
                  onDelete={onDelete}
                  navigate={navigate}
                  editingId={editingId}
                  editText={editText}
                  setEditText={setEditText}
                  setEditingId={setEditingId}
                  onSave={onSave}
                />
              )}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}