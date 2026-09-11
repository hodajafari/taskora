import type { AxiosResponse } from "axios";
import API from "../../../api/axios";

export type TaskStatus = "todo" | "doing" | "done";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  project: number;
  order: number;
  assigned_to: number | null;
  assigned_to_email: string | null;
  position: number;
  created_at: string;
}

export interface CreateTaskPayload {
  title: string;
  project: number;
  status?: TaskStatus;
  order?: number;
  assigned_to?: number | null;
  description?: string;
  position?: number;
}

export interface UpdateTaskPayload {
  taskId: number;
  title: string;
}

export interface UpdateTaskStatusPayload {
  taskId: number;
  status: TaskStatus;
}

export interface GenerateAITasksPayload {
  text: string;
  projectId: number;
}

export type TaskAssigneeRole = "frontend" | "backend" | "devops";

export interface AISuggestion {
  title: string;
  assign: TaskAssigneeRole;
}

export interface AISuggestionsResponse {
  subtasks: AISuggestion[];
}

export interface GeneratedTasksResponse {
  created: string[];
}

type TaskListResponse = Task[] | { results?: Task[] };

export async function getTasks(projectId: string | number): Promise<Task[]> {
  const response = await API.get<TaskListResponse>(`tasks/?project=${projectId}`);

  return Array.isArray(response.data) ? response.data : response.data.results ?? [];
}

export function createTask(data: CreateTaskPayload): Promise<AxiosResponse<Task>> {
  return API.post<Task>("tasks/", data);
}

export function deleteTask(taskId: number): Promise<AxiosResponse<void>> {
  return API.delete<void>(`tasks/${taskId}/`);
}

export function updateTask({ taskId, title }: UpdateTaskPayload): Promise<AxiosResponse<Task>> {
  return API.patch<Task>(`tasks/${taskId}/`, { title });
}

export function updateTaskStatus({
  taskId,
  status,
}: UpdateTaskStatusPayload): Promise<AxiosResponse<Task>> {
  return API.patch<Task>(`tasks/${taskId}/`, { status });
}

export function generateAITasks(
  data: GenerateAITasksPayload,
): Promise<AxiosResponse<GeneratedTasksResponse>> {
  return API.post<GeneratedTasksResponse>("tasks/ai_subtasks/", data);
}

export function suggestAITasks(
  data: Pick<GenerateAITasksPayload, "text">,
): Promise<AxiosResponse<AISuggestionsResponse>> {
  return API.post<AISuggestionsResponse>("tasks/ai_suggest/", data);
}