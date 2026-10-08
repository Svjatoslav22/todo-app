import { Request } from "express";

export interface UserTokenPayload {
  id: number;
  email?: string;
  role?: string;
}

export interface AuthRequest extends Request {
  user?: UserTokenPayload;
}

export interface AuditLogOptions {
  action: string;
  details?: string | null;
  userId?: number | string | null;
  ip?: string | null;
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "urgent" | "high" | "medium" | "low" | "none";

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  projectId?: number | null;
  tags?: string[];
  subtasks?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  projectId?: number | null;
  tags?: string[];
  isArchived?: boolean;
}

export interface ReorderItemInput {
  id: number;
  order: number;
  status?: TaskStatus;
}
