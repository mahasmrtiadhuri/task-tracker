import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TodoItem } from "./TodoItem";
import { Todo } from "@/lib/todo";
import { GripVertical } from "lucide-react";

interface SortableTodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, updates: Partial<Todo>) => void;
  onToggleSubtask: (todoId: number, subtaskId: number) => void;
  onAddSubtask: (todoId: number, title: string) => void;
  onDeleteSubtask: (todoId: number, subtaskId: number) => void;
}

export function SortableTodoItem(props: SortableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 px-2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <TodoItem {...props} />
    </div>
  );
}
