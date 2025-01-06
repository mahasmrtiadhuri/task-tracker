import { useDroppable } from "@dnd-kit/core";
import { Todo, Category } from "@/lib/todo";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTodoItem } from "./SortableTodoItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface DroppableCategoryProps {
  category: Category | "uncategorized";
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, updates: Partial<Todo>) => void;
  onToggleSubtask: (todoId: number, subtaskId: number) => void;
  onAddSubtask: (todoId: number, title: string) => void;
  onDeleteSubtask: (todoId: number, subtaskId: number) => void;
}

export function DroppableCategory({
  category,
  todos,
  onToggle,
  onDelete,
  onEdit,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
}: DroppableCategoryProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: category,
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.2,
        type: "spring",
        stiffness: 500,
        damping: 30
      }}
    >
      <Card 
        className={`bg-background/50 backdrop-blur-sm transition-shadow duration-200 ${
          isOver ? "ring-2 ring-primary shadow-lg" : ""
        }`}
      >
        <CardHeader className="py-3">
          <CardTitle className="text-lg capitalize flex items-center justify-between">
            <motion.span
              initial={false}
              animate={{
                scale: isOver ? 1.05 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {category}
            </motion.span>
            <motion.span 
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              ({todos.length})
            </motion.span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <motion.div 
            ref={setNodeRef} 
            className="space-y-2 min-h-[50px] rounded-lg"
            initial={false}
            animate={{
              backgroundColor: isOver ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0)",
            }}
            style={{
              transition: "background-color 0.2s ease-in-out"
            }}
          >
            <SortableContext items={todos} strategy={verticalListSortingStrategy}>
              <AnimatePresence mode="popLayout">
                {todos.map((todo, index) => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 500,
                      damping: 25
                    }}
                  >
                    <SortableTodoItem
                      todo={todo}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      onToggleSubtask={onToggleSubtask}
                      onAddSubtask={onAddSubtask}
                      onDeleteSubtask={onDeleteSubtask}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </SortableContext>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}