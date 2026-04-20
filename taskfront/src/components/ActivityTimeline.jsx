import { useTaskActivity } from "../features/tasks/hooks/useTasks";
import { formatDistanceToNow } from "date-fns";


const renderChange = (log) => {
  if (!log) return null;

  const { action, changes } = log;

  // 🟢 create
  if (action === "created") {
    return "created the task";
  }

  // 🔴 delete
  if (action === "deleted") {
    return "deleted the task";
  }

  // 🔵 status
  if (action === "status_changed" && changes?.status) {
    return (
      <>
        changed status from{" "}
        <span className="text-yellow-400 font-medium">
          {changes.status.from}
        </span>{" "}
        →{" "}
        <span className="text-green-400 font-medium">
          {changes.status.to}
        </span>
      </>
    );
  }

  // 🟣 title edit
  if (action === "updated" && changes?.title) {
    return (
      <>
        renamed task to{" "}
        <span className="text-blue-300 font-medium">
          {changes.title.to}
        </span>
      </>
    );
  }

  // 🟠 assign
  if (action === "assigned") {
    return "assigned the task";
  }

  // ⚪ reorder
  if (action === "reordered") {
    return "reordered the task";
  }


  if (action === "updated") {
    return "updated the task";
  }

  return action;
};
export default function ActivityTimeline({ taskId }) {
  const { data: logs = [], isLoading } = useTaskActivity(taskId);

  if (isLoading) return null;

  if (logs.length === 0) {
    return (
      <div className="mt-4 border-t border-white/10 pt-3">
        <p className="text-xs text-gray-500">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-white/10 pt-3">
      <h4 className="text-sm text-gray-400 mb-3">Activity</h4>

      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 items-start">

            {/* 🔵 Avatar */}
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
              {log.user_email?.[0]?.toUpperCase() || "S"}
            </div>

            {/* 🧾 Content */}
            <div className="flex-1 text-xs text-gray-300 leading-relaxed">
              <div>
                <span className="text-blue-300 font-medium">
                  {log.user_email || "System"}
                </span>{" "}
                {renderChange(log)}
              </div>

              {/* ⏱ Time */}
              <div className="text-[10px] text-gray-500 mt-1">
                {formatDistanceToNow(new Date(log.created_at), {
                  addSuffix: true,
                })}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}