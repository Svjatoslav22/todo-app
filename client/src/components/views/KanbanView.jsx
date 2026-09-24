"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import {
  ListTodo,
  Clock,
  CheckCircle2,
  Plus,
  Calendar,
  Flag,
  ListChecks,
  GripVertical,
} from "lucide-react";
import { PRIORITY_CONFIG } from "@/components/ui/PrioritySelect";
import { formatDueDate } from "@/components/ui/DatePicker";
import { cn } from "@/lib/utils";

const COLUMNS = [
  {
    id: "todo",
    label: "До виконання",
    icon: ListTodo,
    color: "text-zinc-500",
    badge: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
  },
  {
    id: "in_progress",
    label: "В процесі",
    icon: Clock,
    color: "text-amber-500",
    badge: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
  },
  {
    id: "done",
    label: "Виконано",
    icon: CheckCircle2,
    color: "text-emerald-500",
    badge: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
  },
];

function KanbanCard({ task, onSelectTask, isOverlay = false }) {
  const pConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.none;
  const totalSub = task.subtasks?.length || 0;
  const completedSub = task.subtasks?.filter((s) => s.completed).length || 0;

  return (
    <div
      onClick={() => onSelectTask?.(task)}
      className={cn(
        "group relative rounded-2xl border p-3.5 backdrop-blur-xl shadow-xs transition select-none cursor-pointer",
        isOverlay
          ? "border-indigo-500 bg-white/95 dark:bg-zinc-900/95 shadow-2xl scale-105 rotate-1 ring-2 ring-indigo-500/20"
          : "border-zinc-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
          {task.title}
        </h4>
        <div className="opacity-0 group-hover:opacity-100 transition text-zinc-400 cursor-grab">
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      </div>

      {task.description && (
        <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Meta Footer */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px]">
        {task.priority !== "none" && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold border",
              pConfig.bg
            )}
          >
            <Flag className={cn("h-2.5 w-2.5", pConfig.fill, pConfig.color)} />
            <span>{pConfig.badgeLabel}</span>
          </span>
        )}

        {task.dueDate && (
          <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-medium">
            <Calendar className="h-2.5 w-2.5 text-indigo-500" />
            <span>{formatDueDate(task.dueDate)}</span>
          </span>
        )}

        {totalSub > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-zinc-600 dark:text-zinc-300 font-medium">
            <ListChecks className="h-2.5 w-2.5 text-zinc-400" />
            <span>
              {completedSub}/{totalSub}
            </span>
          </span>
        )}

        {task.tags?.map((t) => (
          <span
            key={t.name || t.id}
            className="text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-950/40 rounded px-1.5 py-0.5 text-[9px]"
          >
            #{t.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function DraggableCard({ task, onSelectTask }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id.toString(),
    data: { task },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(isDragging && "opacity-30 pointer-events-none")}
    >
      <KanbanCard task={task} onSelectTask={onSelectTask} />
    </div>
  );
}

function DroppableColumn({
  column,
  tasks = [],
  onSelectTask,
  onQuickAdd,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const Icon = column.icon;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-3xl border border-zinc-200/80 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-950/40 p-3 min-w-[280px] flex-1 transition-colors duration-150 backdrop-blur-xl",
        isOver && "border-indigo-500/80 bg-indigo-50/20 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 py-1.5 mb-2">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", column.color)} />
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            {column.label}
          </h3>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums",
              column.badge
            )}
          >
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onQuickAdd(column.id)}
          className="rounded-lg p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition"
          title={`Додати в «${column.label}»`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Cards container */}
      <div className="flex-1 space-y-2.5 overflow-y-auto p-1 min-h-[300px]">
        {tasks.map((task) => (
          <DraggableCard
            key={task.id}
            task={task}
            onSelectTask={onSelectTask}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400">
            Перетягніть завдання сюди
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanView({
  tasks = [],
  onSelectTask,
  onUpdateStatus,
  onOpenCreateWithStatus,
}) {
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  function handleDragStart(event) {
    const { active } = event;
    const task = tasks.find((t) => t.id.toString() === active.id);
    if (task) {
      setActiveTask(task);
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = Number.parseInt(active.id, 10);
    const targetStatus = over.id; // column id: 'todo' | 'in_progress' | 'done'

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== targetStatus) {
      onUpdateStatus(taskId, targetStatus);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 overflow-x-auto">
        {COLUMNS.map((column) => {
          const colTasks = tasks.filter((t) => t.status === column.id);
          return (
            <DroppableColumn
              key={column.id}
              column={column}
              tasks={colTasks}
              onSelectTask={onSelectTask}
              onQuickAdd={onOpenCreateWithStatus}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <KanbanCard task={activeTask} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
