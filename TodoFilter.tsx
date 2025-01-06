import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterType, Category, CATEGORIES, Priority, PRIORITIES } from "@/lib/todo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TodoFilterProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onClearCompleted: () => void;
  completedCount: number;
  selectedCategory: Category | "all";
  onCategoryChange: (category: Category | "all") => void;
  selectedPriority: Priority | "all";
  onPriorityChange: (priority: Priority | "all") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function TodoFilter({
  filter,
  onFilterChange,
  onClearCompleted,
  completedCount,
  selectedCategory,
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
  searchQuery,
  onSearchChange,
}: TodoFilterProps) {
  const filters: FilterType[] = ["all", "active", "completed", "overdue", "today", "upcoming"];

  return (
    <div className="space-y-3">
      <Input
        type="text"
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full"
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {filters.map((f) => (
            <Button
              key={f}
              variant={filter === f ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onFilterChange(f)}
              className={`capitalize ${f === 'overdue' ? 'text-red-500 hover:text-red-600' : ''}`}
            >
              {f}
            </Button>
          ))}
        </div>

        {completedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCompleted}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            Clear completed
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Category:</span>
          <Select
            value={selectedCategory}
            onValueChange={(value) => onCategoryChange(value as Category | "all")}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="capitalize">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Priority:</span>
          <Select
            value={selectedPriority}
            onValueChange={(value) => onPriorityChange(value as Priority | "all")}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {PRIORITIES.map((priority) => (
                <SelectItem key={priority} value={priority} className="capitalize">
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}