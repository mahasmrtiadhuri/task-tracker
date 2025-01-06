import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X, Edit2, Save, XCircle, Plus, Minus, Repeat } from "lucide-react";
import { Todo, isOverdue, getPriorityColor, Category, Priority, CATEGORIES, PRIORITIES, Subtask, RecurrenceType, RECURRENCE_TYPES } from "@/lib/todo";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, updates: Partial<Todo>) => void;
  onToggleSubtask: (todoId: number, subtaskId: number) => void;
  onAddSubtask: (todoId: number, title: string) => void;
  onDeleteSubtask: (todoId: number, subtaskId: number) => void;
}

export function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editCategory, setEditCategory] = useState<Category>(todo.category as Category || "other");
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority);
  const [editDate, setEditDate] = useState<Date | undefined>(
    todo.dueDate ? new Date(todo.dueDate) : undefined
  );
  const [editRecurrence, setEditRecurrence] = useState<RecurrenceType>(todo.recurrence || "none");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const handleSave = () => {
    onEdit(todo.id, {
      title: editTitle.trim(),
      category: editCategory,
      priority: editPriority,
      dueDate: editDate?.toISOString(),
      recurrence: editRecurrence,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditCategory(todo.category as Category || "other");
    setEditPriority(todo.priority);
    setEditDate(todo.dueDate ? new Date(todo.dueDate) : undefined);
    setEditRecurrence(todo.recurrence || "none");
    setIsEditing(false);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      onAddSubtask(todo.id, newSubtaskTitle.trim());
      setNewSubtaskTitle("");
    }
  };

  const isTaskOverdue = isOverdue(todo.dueDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.2,
        type: "spring",
        stiffness: 500,
        damping: 25
      }}
      whileHover={{ scale: 1.02 }}
      className="flex flex-col gap-2 p-3 bg-white rounded-lg shadow-sm border transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <motion.div
            whileTap={{ scale: 0.9 }}
          >
            <Checkbox
              checked={todo.completed}
              onCheckedChange={() => onToggle(todo.id)}
              className="h-5 w-5"
            />
          </motion.div>
          {isEditing ? (
            <div className="flex-1 space-y-3">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Task title"
                className="flex-1"
              />
              <div className="flex gap-2 flex-wrap">
                <Select
                  value={editCategory}
                  onValueChange={(value) => setEditCategory(value as Category)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={editPriority}
                  onValueChange={(value) => setEditPriority(value as Priority)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={editRecurrence}
                  onValueChange={(value) => setEditRecurrence(value as RecurrenceType)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Repeat" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRENCE_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !editDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editDate ? format(editDate, "PP") : <span>Pick a due date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editDate}
                      onSelect={setEditDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ) : (
            <motion.div
              className="flex flex-col gap-1 min-w-0"
              initial={false}
              animate={{
                opacity: todo.completed ? 0.6 : 1,
                scale: todo.completed ? 0.98 : 1
              }}
              transition={{ duration: 0.2 }}
            >
              <span
                className={`text-sm ${
                  todo.completed ? "text-gray-400 line-through" : "text-gray-700"
                }`}
              >
                {todo.title}
              </span>
              <motion.div
                className="flex items-center gap-2 flex-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {todo.category && (
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Badge variant="secondary" className="capitalize">
                      {todo.category}
                    </Badge>
                  </motion.div>
                )}
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Badge
                    variant="outline"
                    className={`capitalize ${getPriorityColor(todo.priority)}`}
                  >
                    {todo.priority}
                  </Badge>
                </motion.div>
                {todo.recurrence !== "none" && (
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 bg-blue-50 text-blue-600"
                    >
                      <Repeat className="h-3 w-3" />
                      <span className="capitalize">{todo.recurrence}</span>
                    </Badge>
                  </motion.div>
                )}
                {todo.dueDate && (
                  <motion.span
                    initial={false}
                    animate={{
                      color: isTaskOverdue && !todo.completed ? "#ef4444" : "#6b7280",
                      scale: isTaskOverdue && !todo.completed ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-medium"
                  >
                    Due: {format(new Date(todo.dueDate), "PP")}
                  </motion.span>
                )}
              </motion.div>
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isEditing ? (
            <motion.div className="flex items-center gap-1">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  disabled={!editTitle.trim()}
                  className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-500 transition-colors"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div className="flex items-center gap-1">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(todo.id)}
                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        <motion.div
          className="pl-8 space-y-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          {todo.subtasks?.map((subtask, index) => (
            <motion.div
              key={subtask.id}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div whileTap={{ scale: 0.9 }}>
                <Checkbox
                  checked={subtask.completed}
                  onCheckedChange={() => onToggleSubtask(todo.id, subtask.id)}
                  className="h-4 w-4"
                />
              </motion.div>
              <span
                className={`text-sm ${
                  subtask.completed ? "text-gray-400 line-through" : "text-gray-600"
                }`}
              >
                {subtask.title}
              </span>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="ml-auto"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteSubtask(todo.id, subtask.id)}
                  className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </Button>
              </motion.div>
            </motion.div>
          ))}

          <motion.form
            onSubmit={handleAddSubtask}
            className="flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Add a subtask..."
              className="h-8 text-sm"
            />
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="h-8 px-2 hover:bg-green-50 hover:text-green-500 transition-colors"
                disabled={!newSubtaskTitle.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.form>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}