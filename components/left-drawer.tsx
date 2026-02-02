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
  Settings,
  LogOut,
  User as UserIcon,
  LogIn
} from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

import { getTaskSummaries, updateTask, deleteTask, type TaskSummary } from "@/utils/db";

interface LeftDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  currentTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
  onNewTask: () => void;
  onOpenSettings: () => void;
}

// Layout Constants
const COLLAPSED_WIDTH = 70;
const CONTAINER_PADDING = 12; // p-3 = 12px
const AVAILABLE_WIDTH = COLLAPSED_WIDTH - (CONTAINER_PADDING * 2); // 70 - 24 = 46px
const ICON_COLUMN_WIDTH = AVAILABLE_WIDTH; // Fixed width for icon container
const INNER_ICON_COLUMN_WIDTH = ICON_COLUMN_WIDTH - 10; // For elements with p-[5px] (46 - 10 = 36px)

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
  onDelete,
  isCollapsed
}: {
  task: TaskSummary;
  isSelected: boolean;
  onSelect: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
  isCollapsed: boolean;
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
          className="flex-1 text-sm py-1 px-2 rounded bg-background border border-border focus:outline-none focus:ring-1 focus:ring-ring min-w-0"
        />
        <button
          onClick={handleSaveRename}
          className="p-1 hover:bg-muted rounded text-green-600 dark:text-green-400 flex-shrink-0"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancelRename}
          className="p-1 hover:bg-muted rounded text-red-600 dark:text-red-400 flex-shrink-0"
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

      {/* Actions Menu Button - Only show when not collapsed or hovering */}
      {!isCollapsed && (
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
      )}
    </div>
  );
}

// Integrated Auth Component to fit sidebar
function SidebarAuth({ isOpen }: { isOpen: boolean }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) return <div className="h-10 w-full animate-pulse rounded-lg bg-muted/50" />;

  if (user) {
    return (
      <div className={`flex flex-row items-center gap-0 p-[5px] rounded-xl transition-all duration-300 w-full`}>
        {/* Fixed Width Leading Column for Avatar */}
        <div style={{ width: INNER_ICON_COLUMN_WIDTH }} className="flex-shrink-0 flex items-center justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-medium text-white shadow-md overflow-hidden">
            {user.user_metadata.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata.full_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon className="h-5 w-5" />
            )}
          </div>
        </div>

        {/* User Info (Revealed when open) */}
        <div className="flex-1 overflow-hidden min-w-0">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col pl-3"
              >
                <span className="truncate text-sm font-semibold text-foreground">
                  {user.user_metadata.full_name || user.email}
                </span>
                <span className="truncate text-xs text-muted-foreground w-32">
                  {user.email}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sign Out (Only when open, or maybe icon when closed? kept it simple) */}
        <AnimatePresence>
          {isOpen && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleSignOut}
              className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-red-500 transition-colors ml-1 mr-1"
            >
              <LogOut className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Sign In State (also needs to match the grid)
  return (
    <button
      onClick={handleSignIn}
      className={`group relative flex items-center gap-0 overflow-hidden rounded-xl bg-primary text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] w-full p-[5px]`}
    >
      {isOpen && <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 transition-opacity group-hover:opacity-100" />}

      {/* Fixed Icon Column */}
      <div style={{ width: INNER_ICON_COLUMN_WIDTH }} className="flex-shrink-0 flex items-center justify-center h-9">
        <LogIn className="h-4 w-4" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="whitespace-nowrap text-sm font-medium pl-3"
          >
            Sign in
          </motion.span>
        )}
      </AnimatePresence>
    </button>
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

  // Refresh tasks when drawer opens or when task ID changes (implying new task)
  useEffect(() => {
    fetchTasks();
  }, [isOpen, mounted, fetchTasks, currentTaskId]);

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
    <motion.div
      initial={false}
      // Apple-like spring animation
      animate={{
        width: isOpen ? 320 : COLLAPSED_WIDTH,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 40,
        mass: 1
      }}
      className={`fixed left-4 top-4 bottom-4 z-50 flex flex-col bg-sidebar-bg border border-border/50 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl`}
      style={{ padding: CONTAINER_PADDING }}
    >
      {/* 1. Header: Logo: Logo (Expanded) vs Toggle (Collapsed) */}
      <div className={`flex items-center w-full mb-4 flex-shrink-0 h-9 relative`}>
        <AnimatePresence mode="popLayout" initial={false}>
          {!isOpen ? (
            /* Collapsed: Show Only Open Button (Replacing Logo) */
            <motion.button
              key="open-toggle"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              onClick={onToggle}
              style={{ width: ICON_COLUMN_WIDTH }}
              className="flex items-center justify-center p-2 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground absolute left-0 top-0 h-9"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </motion.button>
          ) : (
            /* Expanded: Show Logo (Left) + Close Button (Right) */
            <>
              <motion.div
                key="logo"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0 }}
                style={{ width: ICON_COLUMN_WIDTH }}
                className="flex-shrink-0 flex items-center justify-center absolute left-0 top-0 h-9"
              >
                {mounted && (
                  <div className="w-8 h-8 relative flex items-center justify-center">
                    <Image
                      src={theme === "dark" ? "/logo/logo-cube-white.png" : "/logo/logo-cube-black.png"}
                      alt="Handl Logo"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                )}
              </motion.div>

              <motion.button
                key="close-toggle"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onClick={onToggle}
                className="absolute right-0 top-0 p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground"
              >
                <PanelLeftClose className="w-5 h-5" />
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>


      {/* 2. Primary Action: New Chat */}
      <div className={`w-full flex-shrink-0`}>
        <button
          onClick={onNewTask}
          className={`flex items-center gap-0 p-[5px] rounded-2xl transition-all duration-200 group relative w-full
                 ${isOpen
              ? "bg-foreground text-background hover:opacity-90 shadow-md"
              : "bg-transparent hover:bg-muted text-foreground"
            }
            `}
        >
          {/* Fixed Icon Column */}
          <div style={{ width: INNER_ICON_COLUMN_WIDTH }} className="flex-shrink-0 flex items-center justify-center h-10">
            <Plus className={`w-5 h-5 ${isOpen ? "text-background" : "text-foreground"}`} />
          </div>

          {/* Text expands */}
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-medium whitespace-nowrap overflow-hidden pl-3"
              >
                New Chat
              </motion.span>
            )}
          </AnimatePresence>
          {/* Tooltip for collapsed state */}
          {!isOpen && (
            <span className="absolute left-16 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[60] pointer-events-none">
              New Chat
            </span>
          )}
        </button>
      </div>

      {/* 3. Scrollable Content (History) */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-hide mt-4 mb-2">
        {!isOpen ? (
          // Empty when collapsed
          null
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-6 pb-4 px-1"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 px-2">
                <p className="text-sm text-muted-foreground">No history</p>
              </div>
            ) : (
              groupOrder.map(group => {
                const groupTasks = groupedTasks[group];
                if (!groupTasks || groupTasks.length === 0) return null;

                return (
                  <div key={group}>
                    <h3 className="text-xs font-bold text-muted-foreground/60 mb-2 pl-3 uppercase tracking-wider">
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
                          isCollapsed={!isOpen}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </div>

      {/* 4. Footer: Settings, Theme, Auth */}
      <div className={`mt-auto w-full flex flex-col gap-2 ${isOpen ? "border-t border-border/40 pt-4" : ""}`}>

        {/* Theme Button */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`flex items-center gap-0 w-full p-[5px] rounded-xl transition-all duration-200 group relative hover:bg-muted text-muted-foreground hover:text-foreground`}
          >
            {/* Fixed Icon Column */}
            <div style={{ width: INNER_ICON_COLUMN_WIDTH }} className="flex-shrink-0 flex items-center justify-center h-8">
              {theme === "dark" ? <Sun className={`w-5 h-5`} /> : <Moon className={`w-5 h-5`} />}
            </div>

            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 text-left font-medium whitespace-nowrap overflow-hidden text-sm pl-3"
                >
                  Theme
                </motion.span>
              )}
            </AnimatePresence>
            {!isOpen && <span className="absolute left-16 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[60] pointer-events-none">Theme</span>}
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className={`flex items-center gap-0 w-full p-[5px] rounded-xl transition-all duration-200 group relative hover:bg-muted text-muted-foreground hover:text-foreground`}
        >
          {/* Fixed Icon Column */}
          <div style={{ width: INNER_ICON_COLUMN_WIDTH }} className="flex-shrink-0 flex items-center justify-center h-8">
            <Settings className={`w-5 h-5`} />
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 text-left font-medium whitespace-nowrap overflow-hidden text-sm pl-3"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
          {!isOpen && <span className="absolute left-16 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[60] pointer-events-none">Settings</span>}
        </button>

        {/* Auth Profile */}
        <div className="mt-1 w-full">
          <SidebarAuth isOpen={isOpen} />
        </div>
      </div>

    </motion.div>
  );
}
