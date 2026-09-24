"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Plus,
  Trash2,
  Archive,
  ArchiveRestore,
  RotateCcw,
  Tag as TagIcon,
} from "lucide-react";
import Button from "@/components/ui/Button";
import CustomSelect from "@/components/ui/CustomSelect";
import DatePicker from "@/components/ui/DatePicker";
import PrioritySelect from "@/components/ui/PrioritySelect";
import Badge from "@/components/ui/Badge";
import { triggerConfetti } from "@/lib/celebrate";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "todo", label: "До виконання" },
  { value: "in_progress", label: "В процесі" },
  { value: "done", label: "Виконано" },
];

export default function TaskSlideOver({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onRestore,
}) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState(task?.status || "todo");
  const [priority, setPriority] = useState(task?.priority || "none");
  const [dueDate, setDueDate] = useState(task?.dueDate || null);
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newTagInput, setNewTagInput] = useState("");
  const [tags, setTags] = useState(task?.tags || []);

  if (!task) return null;

  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const totalSubtasks = subtasks.length;
  const subtasksPercent =
    totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  function handleSaveField(fields) {
    onUpdate({
      id: task.id,
      ...fields,
    });
  }

  function handleToggleSubtask(subtaskId) {
    const nextSubtasks = subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    setSubtasks(nextSubtasks);
    handleSaveField({ subtasks: nextSubtasks });

    const allNowDone = nextSubtasks.every((s) => s.completed);
    if (allNowDone && nextSubtasks.length > 0) {
      triggerConfetti();
    }
  }

  function handleAddSubtask(e) {
    e?.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const nextSubtasks = [
      ...subtasks,
      { id: Date.now(), title: newSubtaskTitle.trim(), completed: false },
    ];
    setSubtasks(nextSubtasks);
    setNewSubtaskTitle("");
    handleSaveField({ subtasks: nextSubtasks });
  }

  function handleDeleteSubtask(subtaskId) {
    const nextSubtasks = subtasks.filter((st) => st.id !== subtaskId);
    setSubtasks(nextSubtasks);
    handleSaveField({ subtasks: nextSubtasks });
  }

  function handleAddTag(e) {
    e?.preventDefault();
    if (!newTagInput.trim()) return;
    const tagName = newTagInput.trim().replace(/^#/, "");
    if (!tags.some((t) => t.name?.toLowerCase() === tagName.toLowerCase())) {
      const nextTags = [...tags, { name: tagName, color: "indigo" }];
      setTags(nextTags);
      handleSaveField({ tags: nextTags });
    }
    setNewTagInput("");
  }

  function handleRemoveTag(tagName) {
    const nextTags = tags.filter((t) => t.name !== tagName);
    setTags(nextTags);
    handleSaveField({ tags: nextTags });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="w-screen max-w-lg border-l border-zinc-200/80 dark:border-white/10 bg-white/95 dark:bg-zinc-950/95 shadow-2xl backdrop-blur-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/60 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-zinc-400">
                    TASK-{task.id}
                  </span>
                  {task.isArchived && (
                    <Badge variant="purple">Архів</Badge>
                  )}
                  {task.isDeleted && (
                    <Badge variant="rose">В корзині</Badge>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    aria-label="Закрити"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Title (Inline Editable) */}
                <div>
                  <textarea
                    rows={2}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => handleSaveField({ title })}
                    placeholder="Назва завдання..."
                    className="w-full text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 bg-transparent outline-none resize-none border-b border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Properties Grid */}
                <div className="rounded-2xl border border-zinc-200/70 dark:border-white/5 bg-zinc-50/60 dark:bg-zinc-900/40 p-4 space-y-3">
                  {/* Status */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                      Статус
                    </span>
                    <CustomSelect
                      value={status}
                      onChange={(next) => {
                        setStatus(next);
                        handleSaveField({ status: next });
                      }}
                      options={STATUS_OPTIONS}
                      size="sm"
                    />
                  </div>

                  {/* Priority */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                      Пріоритет
                    </span>
                    <PrioritySelect
                      value={priority}
                      onChange={(next) => {
                        setPriority(next);
                        handleSaveField({ priority: next });
                      }}
                      size="sm"
                    />
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                      Дедлайн
                    </span>
                    <DatePicker
                      value={dueDate}
                      onChange={(next) => {
                        setDueDate(next);
                        handleSaveField({ dueDate: next });
                      }}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Subtasks Section with Progress Bar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Підзадачі ({completedSubtasks}/{totalSubtasks})
                    </h4>
                    {totalSubtasks > 0 && (
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {subtasksPercent}%
                      </span>
                    )}
                  </div>

                  {/* Animated Progress Bar */}
                  {totalSubtasks > 0 && (
                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${subtasksPercent}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}

                  {/* Subtask items checklist */}
                  <div className="space-y-1.5">
                    {subtasks.map((st) => (
                      <div
                        key={st.id}
                        className="group flex items-center justify-between gap-2 rounded-xl p-2 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleSubtask(st.id)}
                          className="flex items-center gap-2.5 flex-1 text-left"
                        >
                          <span
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition",
                              st.completed
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "border-zinc-300 dark:border-zinc-700"
                            )}
                          >
                            {st.completed && <Check className="h-3 w-3 stroke-[3]" />}
                          </span>
                          <span
                            className={cn(
                              "text-xs transition",
                              st.completed
                                ? "line-through text-zinc-400 dark:text-zinc-500"
                                : "text-zinc-800 dark:text-zinc-200"
                            )}
                          >
                            {st.title}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSubtask(st.id)}
                          className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-zinc-400 hover:text-rose-500 transition"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}

                    {/* Add new subtask form */}
                    <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Додати підзадачу (натисніть Enter)..."
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        className="flex-1 rounded-xl border border-zinc-200 dark:border-white/10 bg-transparent px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:border-indigo-500"
                      />
                      <Button
                        type="submit"
                        variant="secondary"
                        size="xs"
                        disabled={!newSubtaskTitle.trim()}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </form>
                  </div>
                </div>

                {/* Description / Notes Section */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Опис та нотатки
                  </h4>
                  <textarea
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={() => handleSaveField({ description })}
                    placeholder="Додайте детальний опис завдання, списки або markdown..."
                    className="w-full rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-3.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none backdrop-blur-md transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none leading-relaxed"
                  />
                </div>

                {/* Tags Section */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                    <TagIcon className="h-3.5 w-3.5" />
                    <span>Теги</span>
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag.id || tag.name}
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/40 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300"
                      >
                        #{tag.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag.name)}
                          className="hover:text-rose-500 ml-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <form onSubmit={handleAddTag} className="inline-flex">
                      <input
                        type="text"
                        placeholder="+ додати #тег"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        className="w-24 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-0.5 text-xs text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 outline-none focus:border-indigo-500"
                      />
                    </form>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Actions */}
              <div className="px-6 py-4 border-t border-zinc-200/60 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {task.isDeleted ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRestore(task.id)}
                      leftIcon={<RotateCcw className="h-3.5 w-3.5 text-emerald-500" />}
                    >
                      Відновити
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleSaveField({ isArchived: !task.isArchived })
                      }
                      leftIcon={
                        task.isArchived ? (
                          <ArchiveRestore className="h-3.5 w-3.5" />
                        ) : (
                          <Archive className="h-3.5 w-3.5" />
                        )
                      }
                    >
                      {task.isArchived ? "Розархівувати" : "В архів"}
                    </Button>
                  )}
                </div>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(task.id)}
                  leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                >
                  {task.isDeleted ? "Очистити остаточно" : "В корзину"}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
