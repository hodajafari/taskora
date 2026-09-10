import type { AxiosResponse } from "axios";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

import API from "../../../api/axios";
import {
  createTask,
  deleteTask,
  generateAITasks,
  getTasks,
  updateTask,
  updateTaskStatus,
  type CreateTaskPayload,
  type GenerateAITasksPayload,
  type GeneratedTasksResponse,
  type Task,
  type TaskStatus,
  type UpdateTaskPayload,
  type UpdateTaskStatusPayload,
} from "../api/taskApi";

type ProjectId = string | number;
type TaskQueryKey = readonly ["tasks", ProjectId];
type ActivityQueryKey = readonly ["activity", number];

interface OptimisticTask {
  id: number;
  title: string;
  status?: TaskStatus;
  assigned_to_email?: string | null;
  isOptimistic?: true;
  isAI?: true;
}

type TaskCache = Array<Task | OptimisticTask>;

interface TaskMutationContext {
  previousTasks: TaskCache | undefined;
}

interface ReorderTaskPayload {
  id: number;
  order: number;
  status: TaskStatus;
}

interface ReorderTasksResponse {
  status: "ok";
}

type TaskActivityAction =
  | "created"
  | "updated"
  | "deleted"
  | "status_changed"
  | "assigned"
  | "reordered";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

interface TaskActivity {
  id: number;
  action: TaskActivityAction;
  changes: JsonValue;
  created_at: string;
  user_email: string | null;
}

const getTaskQueryKey = (projectId: ProjectId): TaskQueryKey => [
  "tasks",
  projectId,
];

const getActivityQueryKey = (taskId: number): ActivityQueryKey => [
  "activity",
  taskId,
];

export const useTasks = (
  projectId: ProjectId,
): UseQueryResult<TaskCache, Error> => {
  return useQuery<TaskCache, Error>({
    queryKey: getTaskQueryKey(projectId),
    queryFn: () => getTasks(projectId),
  });
};

export const useCreateTask = (
  projectId: ProjectId,
): UseMutationResult<
  AxiosResponse<Task>,
  Error,
  CreateTaskPayload,
  TaskMutationContext
> => {
  const queryClient = useQueryClient();
  const queryKey = getTaskQueryKey(projectId);

  return useMutation<
    AxiosResponse<Task>,
    Error,
    CreateTaskPayload,
    TaskMutationContext
  >({
    mutationFn: createTask,

    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey });

      const previousTasks = queryClient.getQueryData<TaskCache>(queryKey);

      const optimisticTask: OptimisticTask = {
        id: Date.now(),
        title: newTask.title,
        status: newTask.status,
        assigned_to_email: "",
        isOptimistic: true,
      };

      queryClient.setQueryData<TaskCache>(queryKey, (old) => [
        ...(old ?? []),
        optimisticTask,
      ]);

      return { previousTasks };
    },

    onError: (_error, _newTask, context) => {
      if (context) {
        queryClient.setQueryData<TaskCache>(
          queryKey,
          context.previousTasks,
        );
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useDeleteTask = (
  projectId: ProjectId,
): UseMutationResult<
  AxiosResponse<void>,
  Error,
  number,
  TaskMutationContext
> => {
  const queryClient = useQueryClient();
  const queryKey = getTaskQueryKey(projectId);

  return useMutation<
    AxiosResponse<void>,
    Error,
    number,
    TaskMutationContext
  >({
    mutationFn: deleteTask,

    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey });

      const previousTasks = queryClient.getQueryData<TaskCache>(queryKey);

      queryClient.setQueryData<TaskCache>(queryKey, (old) =>
        (old ?? []).filter((task) => task.id !== taskId),
      );

      return { previousTasks };
    },

    onError: (_error, _taskId, context) => {
      if (context) {
        queryClient.setQueryData<TaskCache>(
          queryKey,
          context.previousTasks,
        );
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useUpdateTask = (
  projectId: ProjectId,
): UseMutationResult<AxiosResponse<Task>, Error, UpdateTaskPayload> => {
  const queryClient = useQueryClient();
  const queryKey = getTaskQueryKey(projectId);

  return useMutation<AxiosResponse<Task>, Error, UpdateTaskPayload>({
    mutationFn: updateTask,

    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({
        queryKey: getActivityQueryKey(variables.taskId),
      });
    },
  });
};

export const useUpdateTaskStatus = (
  projectId: ProjectId,
): UseMutationResult<
  AxiosResponse<Task>,
  Error,
  UpdateTaskStatusPayload,
  TaskMutationContext
> => {
  const queryClient = useQueryClient();
  const queryKey = getTaskQueryKey(projectId);

  return useMutation<
    AxiosResponse<Task>,
    Error,
    UpdateTaskStatusPayload,
    TaskMutationContext
  >({
    mutationFn: updateTaskStatus,

    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousTasks = queryClient.getQueryData<TaskCache>(queryKey);

      queryClient.setQueryData<TaskCache>(queryKey, (old) =>
        (old ?? []).map((task) =>
          task.id === taskId ? { ...task, status } : task,
        ),
      );

      return { previousTasks };
    },

    onError: (_error, _variables, context) => {
      if (context) {
        queryClient.setQueryData<TaskCache>(
          queryKey,
          context.previousTasks,
        );
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useReorderTasks = (
  projectId: ProjectId,
): UseMutationResult<
  AxiosResponse<ReorderTasksResponse>,
  Error,
  ReorderTaskPayload[]
> => {
  const queryClient = useQueryClient();
  const queryKey = getTaskQueryKey(projectId);

  return useMutation<
    AxiosResponse<ReorderTasksResponse>,
    Error,
    ReorderTaskPayload[]
  >({
    mutationFn: (tasks) => API.post<ReorderTasksResponse>("tasks/reorder/", tasks),

    onSuccess: (_data, variables) => {
      variables.forEach((task) => {
        void queryClient.invalidateQueries({
          queryKey: getActivityQueryKey(task.id),
        });
      });

      void queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useTaskActivity = (
  taskId: number,
): UseQueryResult<TaskActivity[], Error> => {
  return useQuery<TaskActivity[], Error>({
    queryKey: getActivityQueryKey(taskId),
    queryFn: async () => {
      const response = await API.get<TaskActivity[]>(
        `tasks/${taskId}/activities/`,
      );

      return response.data;
    },
  });
};

export const useGenerateAITasks = (
  projectId: ProjectId,
): UseMutationResult<
  AxiosResponse<GeneratedTasksResponse>,
  Error,
  GenerateAITasksPayload,
  TaskMutationContext
> => {
  const queryClient = useQueryClient();
  const queryKey = getTaskQueryKey(projectId);

  return useMutation<
    AxiosResponse<GeneratedTasksResponse>,
    Error,
    GenerateAITasksPayload,
    TaskMutationContext
  >({
    mutationFn: generateAITasks,

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousTasks = queryClient.getQueryData<TaskCache>(queryKey);

      const optimisticTask: OptimisticTask = {
        id: Date.now(),
        title: "Generating AI tasks...",
        status: "todo",
        isAI: true,
      };

      queryClient.setQueryData<TaskCache>(queryKey, (old) => [
        ...(old ?? []),
        optimisticTask,
      ]);

      return { previousTasks };
    },

    onError: (_error, _variables, context) => {
      if (context) {
        queryClient.setQueryData<TaskCache>(
          queryKey,
          context.previousTasks,
        );
      }

      toast.error("AI failed 😢");
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
};