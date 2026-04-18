import { useQuery,useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
  updateTaskStatus,
  generateAITasks,
} from "../api/taskApi";
import toast from "react-hot-toast";

export const useTasks = (projectId) => {
  return useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => getTasks(projectId),
  });
};
export const useCreateTask = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,

    // 🔥 1. قبل از request → اضافه کن به UI
    onMutate: async (newTask) => {
      await queryClient.cancelQueries(["tasks", projectId]);

      const previousTasks = queryClient.getQueryData(["tasks", projectId]);

      // 🆕 ساخت task موقت
      const optimisticTask = {
        id: Date.now(), // temporary id
        title: newTask.title,
        status: newTask.status,
        assigned_to_email: "", // فعلاً خالی
        isOptimistic: true, // برای debug (اختیاری)
      };

      queryClient.setQueryData(["tasks", projectId], (old = []) => [
        ...old,
        optimisticTask,
      ]);

      return { previousTasks };
    },

    // ❌ اگر fail شد → rollback
    onError: (err, newTask, context) => {
      queryClient.setQueryData(
        ["tasks", projectId],
        context.previousTasks
      );
    },

    // 🔄 بعد از response → sync واقعی
    onSettled: () => {
      queryClient.invalidateQueries(["tasks", projectId]);
    },
  });
};


// 🗑 DELETE
export const useDeleteTask = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask, 

    onMutate: async (taskId) => {
      await queryClient.cancelQueries(["tasks", projectId]);

      const previousTasks = queryClient.getQueryData(["tasks", projectId]);

      queryClient.setQueryData(["tasks", projectId], (old = []) =>
        old.filter((t) => t.id !== taskId)
      );
      
      return { previousTasks };
    },

    onError: (err, taskId, context) => {
      queryClient.setQueryData(
        ["tasks", projectId],
        context.previousTasks
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries(["tasks", projectId]);
    },
  });
};

// ✏️ EDIT
export const useUpdateTask = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["tasks", projectId]);
      queryClient.invalidateQueries(["activity", variables.taskId]);
    },
    
    
  });

};

// 🔄 STATUS
export const useUpdateTaskStatus = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTaskStatus,

    // 🔥 1. قبل از request → تغییر status در UI
    onMutate: async ({ taskId, status }) => {
        await queryClient.cancelQueries(["tasks", projectId]);

        const previousTasks = queryClient.getQueryData(["tasks", projectId]);

        queryClient.setQueryData(["tasks", projectId], (old = []) =>
            old.map((task) =>
            task.id === taskId ? { ...task, status } : task
            )
        );

        return { previousTasks };
        },
    // ❌ اگر خطا شد → rollback
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["tasks", projectId],
        context.previousTasks
      );
    },

    // 🔄 بعدش sync با سرور
    onSettled: () => {
      queryClient.invalidateQueries(["tasks", projectId]);
    },
  });
};

import API from "../../../api/axios"; // مسیرتو چک کن

export const useReorderTasks = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tasks) =>
      API.post("tasks/reorder/", tasks),

    onSuccess: (_, variables) => {
      // 🔥 variables = همون tasks که فرستادی

      // activity هر task رو refresh کن
      variables.forEach((t) => {
        queryClient.invalidateQueries(["activity", t.id]);
      });

      // کل tasks رو هم sync کن
      queryClient.invalidateQueries(["tasks", projectId]);
    },
  });
};
export const useTaskActivity = (taskId) => {
  return useQuery({
    queryKey: ["activity", taskId],
    queryFn: async () => {
      const res = await API.get(`tasks/${taskId}/activities/`);
      return res.data;
    },
  });
};
export const useGenerateAITasks = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateAITasks,

    // 🔥 optimistic
    onMutate: async ({ text }) => {
      await queryClient.cancelQueries(["tasks", projectId]);

      const previousTasks = queryClient.getQueryData(["tasks", projectId]);

      // 👇 یه placeholder بساز
      const optimisticTask = {
        id: Date.now(),
        title: "Generating AI tasks...",
        status: "todo",
        isAI: true,
      };

      queryClient.setQueryData(["tasks", projectId], (old = []) => [
        ...old,
        optimisticTask,
      ]);

      return { previousTasks };
    },

    // ❌ rollback
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["tasks", projectId],
        context.previousTasks
      );
      toast.error("AI failed 😢");
    },

    // ✅ sync
    onSettled: () => {
      queryClient.invalidateQueries(["tasks", projectId]);
    },
  });
};