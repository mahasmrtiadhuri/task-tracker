import { useEffect, useState, useMemo } from "react";
import { TodoInput } from "./TodoInput";
import { TodoFilter } from "./TodoFilter";
import { Progress } from "@/components/ui/progress";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
} from "@dnd-kit/sortable";
import { DroppableCategory } from "./DroppableCategory";
import {
  Todo,
  FilterType,
  Category,
  Priority,
  CATEGORIES,
  loadTodos,
  saveTodos,
  isOverdue,
  isToday,
  isUpcoming,
  RecurrenceType,
  calculateNextDueDate,
  handleRecurringTask,
  exportToJSON,
  exportToCSV,
  importFromJSON
} from "@/lib/todo";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos());
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [selectedPriority, setSelectedPriority] = useState<Priority | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const completedTasks = todos.filter((todo) => todo.completed).length;
  const totalTasks = todos.length;
  const completionPercentage = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const addTodo = (
    title: string,
    category: Category,
    priority: Priority,
    dueDate?: string,
    recurrence: RecurrenceType = "none"
  ) => {
    const newTodo = {
      id: Date.now(),
      title,
      completed: false,
      category,
      priority,
      dueDate,
      subtasks: [],
      recurrence,
      lastCompleted: undefined,
      nextDueDate: recurrence !== "none" ? calculateNextDueDate(dueDate, recurrence) : undefined
    };
    setTodos((prev) => [...prev, newTodo]);
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id !== id) return todo;

        const updatedTodo = {
          ...todo,
          completed: !todo.completed
        };

        if (updatedTodo.completed) {
          return handleRecurringTask(updatedTodo);
        }

        return updatedTodo;
      })
    );
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const editTodo = (id: number, updates: Partial<Todo>) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? {
          ...todo,
          ...updates,
          nextDueDate: updates.recurrence !== "none" && updates.dueDate
            ? calculateNextDueDate(updates.dueDate, updates.recurrence as RecurrenceType)
            : undefined
        } : todo
      )
    );
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  const toggleSubtask = (todoId: number, subtaskId: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: todo.subtasks.map((subtask) =>
                subtask.id === subtaskId
                  ? { ...subtask, completed: !subtask.completed }
                  : subtask
              ),
            }
          : todo
      )
    );
  };

  const addSubtask = (todoId: number, title: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: [
                ...todo.subtasks,
                { id: Date.now(), title, completed: false },
              ],
            }
          : todo
      )
    );
  };

  const deleteSubtask = (todoId: number, subtaskId: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: todo.subtasks.filter(
                (subtask) => subtask.id !== subtaskId
              ),
            }
          : todo
      )
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // If dropping over another task
    if (typeof activeId === 'number' && typeof overId === 'number') {
      setTodos((items) => {
        const oldIndex = items.findIndex((item) => item.id === activeId);
        const newIndex = items.findIndex((item) => item.id === overId);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    // If dropping over a category
    else if (typeof activeId === 'number' && typeof overId === 'string') {
      setTodos((items) =>
        items.map((todo) =>
          todo.id === activeId
            ? { ...todo, category: overId as Category }
            : todo
        )
      );
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Only handle category changes during dragOver
    if (typeof active.id === 'number' && typeof over.id === 'string') {
      const activeId = active.id;
      const overId = over.id as Category;

      setTodos((items) =>
        items.map((todo) =>
          todo.id === activeId ? { ...todo, category: overId } : todo
        )
      );
    }
  };

  const filteredTodos = useMemo(() => todos
    .filter((todo) => {
      if (searchQuery && !todo.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      if (selectedCategory !== "all" && todo.category !== selectedCategory) {
        return false;
      }

      if (selectedPriority !== "all" && todo.priority !== selectedPriority) {
        return false;
      }

      switch (filter) {
        case "active":
          return !todo.completed;
        case "completed":
          return todo.completed;
        case "overdue":
          return !todo.completed && isOverdue(todo.dueDate);
        case "today":
          return !todo.completed && isToday(todo.dueDate);
        case "upcoming":
          return !todo.completed && isUpcoming(todo.dueDate);
        default:
          return true;
      }
    })
    .sort((a, b) => {
      const getPriorityWeight = (priority: Priority): number => {
        switch (priority) {
          case "high": return 3;
          case "medium": return 2;
          case "low": return 1;
        }
      };

      const priorityDiff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
      if (priorityDiff !== 0) return priorityDiff;

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    }), [todos, filter, selectedCategory, selectedPriority, searchQuery]);

  const groupedTodos = useMemo(() => {
    const filtered = filteredTodos.reduce((acc, todo) => {
      const category = todo.category || "uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(todo);
      return acc;
    }, {} as Record<string, Todo[]>);

    // Ensure all categories exist even if empty
    [...CATEGORIES, "uncategorized"].forEach(category => {
      if (!filtered[category]) {
        filtered[category] = [];
      }
    });

    return filtered;
  }, [filteredTodos]);

  const { toast } = useToast();

  const handleExport = (format: 'json' | 'csv') => {
    try {
      const filename = `tasks-${new Date().toISOString().split('T')[0]}`;
      let content: string;
      let type: string;

      if (format === 'json') {
        content = exportToJSON(todos);
        type = 'application/json';
      } else {
        content = exportToCSV(todos);
        type = 'text/csv';
      }

      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Tasks exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export tasks",
        variant: "destructive",
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedTodos = importFromJSON(content);
        setTodos(prev => [...prev, ...importedTodos]);
        toast({
          title: "Success",
          description: `${importedTodos.length} tasks imported successfully`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to import tasks. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('json')}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export JSON
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('csv')}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        <div className="relative">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Import Tasks"
          />
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import JSON
          </Button>
        </div>
      </div>
      {totalTasks > 0 && (
        <div className="p-4 bg-white rounded-lg border space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-700">Task Progress</span>
            <span className="font-semibold text-primary">
              {completedTasks} of {totalTasks} ({completionPercentage}%)
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2.5" />
        </div>
      )}

      <TodoInput onAdd={addTodo} />

      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Object.entries(groupedTodos).map(([category, todos]) => (
            <DroppableCategory
              key={category}
              category={category as Category | "uncategorized"}
              todos={todos}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
              onToggleSubtask={toggleSubtask}
              onAddSubtask={addSubtask}
              onDeleteSubtask={deleteSubtask}
            />
          ))}
        </div>
      </DndContext>

      {todos.length > 0 && (
        <div className="pt-4 border-t">
          <TodoFilter
            filter={filter}
            onFilterChange={setFilter}
            onClearCompleted={clearCompleted}
            completedCount={completedTasks}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedPriority={selectedPriority}
            onPriorityChange={setSelectedPriority}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>
      )}
    </div>
  );
}