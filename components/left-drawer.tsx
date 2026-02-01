"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";
import {
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  X,
  Settings
} from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";

import { AuthButton } from "./auth-button";
import { getTaskSummaries, updateTask, deleteTask, type TaskSummary } from "@/utils/db";

interface LeftDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  currentTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
  onNewTask: () => void;
  onOpenSettings: () => void;
}

// Group tasks by date
function groupTasksByDate(tasks: TaskSummary[]): Record<string, TaskSummary[]> {
  const groups: Record<string, TaskSummary[]> = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  tasks.forEach(task => {
    const taskDate = new Date(task.created_at);
    const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());

    let group: string;
    if (taskDay.getTime() === today.getTime()) {
      group = "Today";
    } else if (taskDay.getTime() === yesterday.getTime()) {
      group = "Yesterday";
    } else if (taskDay.getTime() > weekAgo.getTime()) {
      group = "This Week";
    } else {
      group = "Older";
    }

    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(task);
  });

  return groups;
}

// Task Item Component with actions
function TaskItem({
  task,
  isSelected,
  onSelect,
  onRename,
  onDelete
}: {
  task: TaskSummary;
  isSelected: boolean;
  onSelect: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title || task.service || "Untitled Task");
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleSaveRename = () => {
    if (editTitle.trim()) {
      onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelRename = () => {
    setEditTitle(task.title || task.service || "Untitled Task");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveRename();
    } else if (e.key === "Escape") {
      handleCancelRename();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 py-1 px-2">
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSaveRename}
          className="flex-1 text-sm py-1 px-2 rounded bg-background border border-border focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          onClick={handleSaveRename}
          className="p-1 hover:bg-muted rounded text-green-600 dark:text-green-400"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancelRename}
          className="p-1 hover:bg-muted rounded text-red-600 dark:text-red-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`group relative flex items-center rounded-lg transition-colors duration-200 ${isSelected ? "bg-muted" : "hover:bg-muted/50"
        }`}
    >
      <button
        onClick={onSelect}
        className={`flex-1 text-left text-sm py-2 px-3 truncate ${isSelected ? "text-foreground font-medium" : "text-foreground"
          }`}
      >
        {task.title || task.service || "Untitled Task"}
      </button>

      {/* Actions Menu Button */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1.5 mr-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/10 transition-opacity"
        >
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[120px]"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  setIsEditing(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
              >
                <Pencil className="w-3.5 h-3.5" />
                Rename
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onDelete();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function LeftDrawer({ isOpen, onToggle, currentTaskId, onSelectTask, onNewTask, onOpenSettings }: LeftDrawerProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const taskList = await getTaskSummaries();
      setTasks(taskList);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchTasks();
  }, [fetchTasks]);

  // Refresh tasks when drawer opens
  useEffect(() => {
    if (isOpen && mounted) {
      fetchTasks();
    }
  }, [isOpen, mounted, fetchTasks]);

  const handleRenameTask = async (taskId: string, newTitle: string) => {
    try {
      await updateTask(taskId, { title: newTitle });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, title: newTitle } : t));
    } catch (error) {
      console.error("Error renaming task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const success = await deleteTask(taskId);
      if (success) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        // If the deleted task was selected, clear selection
        if (currentTaskId === taskId) {
          onSelectTask(null);
        }
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const groupedTasks = groupTasksByDate(tasks);
  const groupOrder = ["Today", "Yesterday", "This Week", "Older"];

  return (
    <div className="fixed inset-y-0 left-0 z-50 flex flex-col h-full pointer-events-none">
      <motion.div
        animate={{
          width: isOpen ? 280 : 72,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 300, mass: 1 }}
        className="h-full bg-sidebar-bg text-foreground flex flex-row overflow-hidden border-r border-border pointer-events-auto transition-colors duration-300"
      >
        {/* Rail Content (Always visible icons) */}
        <div className="flex flex-col h-full items-center py-6 w-[72px] flex-shrink-0 bg-sidebar-bg z-20">

          <div className="my-6">
            {mounted && (
              <div className="w-10 h-10 relative flex items-center justify-center">
                <Image
                  src={theme === "dark" ? "/logo/logo-cube-white.png" : "/logo/logo-cube-black.png"}
                  alt="Handl Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 flex-1 w-full px-3 mt-8">
            <button
              onClick={onNewTask}
              className="p-2.5 hover:bg-muted rounded-lg transition-colors duration-200 text-muted-foreground hover:text-foreground group relative flex justify-center"
            >
              <Plus className="w-5 h-5" />
              {!isOpen && <span className="absolute left-14 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">New Chat</span>}
            </button>
          </div>

          <div className="mt-auto flex flex-col gap-4 items-center w-full px-3 mb-4">
            <button
              onClick={onOpenSettings}
              className="p-2.5 hover:bg-muted rounded-lg transition-colors duration-200 text-muted-foreground hover:text-foreground group relative flex justify-center"
            >
              <Settings className="w-5 h-5" />
              {!isOpen && <span className="absolute left-14 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Settings</span>}
            </button>
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2.5 hover:bg-muted rounded-lg transition-colors duration-200 text-muted-foreground hover:text-foreground group relative flex justify-center"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={onToggle}
              className="p-2.5 hover:bg-muted rounded-lg transition-colors duration-200 text-muted-foreground hover:text-foreground flex justify-center"
            >
              {isOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Expanded Panel Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-sidebar-bg">
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full w-full p-6 pt-24"
              >
                <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No tasks yet</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Start a new chat to get started</p>
                    </div>
                  ) : (
                    groupOrder.map(group => {
                      const groupTasks = groupedTasks[group];
                      if (!groupTasks || groupTasks.length === 0) return null;

                      return (
                        <div key={group}>
                          <h3 className="text-xs font-medium text-muted-foreground mb-3 pl-2 uppercase tracking-wider">
                            {group}
                          </h3>
                          <div className="space-y-0.5">
                            {groupTasks.map(task => (
                              <TaskItem
                                key={task.id}
                                task={task}
                                isSelected={currentTaskId === task.id}
                                onSelect={() => onSelectTask(task.id)}
                                onRename={(newTitle) => handleRenameTask(task.id, newTitle)}
                                onDelete={() => handleDeleteTask(task.id)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Auth section at the bottom of the expanded panel */}
                <div className="mt-auto pt-4 border-t border-border">
                  <AuthButton />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
