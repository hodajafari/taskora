

export function renderChange(log) {
  const c = log.changes || {};

  switch (log.action) {
    case "created":
      return "created this task";

    case "deleted":
      return "deleted this task";

    case "status_changed":
      return `moved from "${c.status?.from}" to "${c.status?.to}"`;

    case "assigned":
      return "changed assignee";

    case "updated":
      if (c.title) {
        return `renamed task`;
      }
      return "updated task";

    case "reordered":
      return "reordered tasks";

    default:
      return log.action;
  }
}