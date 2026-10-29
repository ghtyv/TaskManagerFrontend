import { Tooltip } from 'antd';
import type { Task } from '../../api/tasks';
import { deadlineHint, formatTaskDeadline, getDeadlineTone, getTaskState } from './taskPresentation';
export default function SubtaskProgress({ tasks }: { tasks: Task[] }) {
    if (!tasks.length) return null;
    const closed = tasks.filter(task => !task.open).length;
    return <div className="subtask-progress"><div className="subtask-progress__segments" role="group" aria-label="Состояния подзадач">{tasks.map(task => <Tooltip key={task.id} title={`${task.title} · ${getTaskState(task.open)}${task.deadline ? ` · ${formatTaskDeadline(task.deadline)} ${deadlineHint(task.open, task.deadline)}` : ''}`}><span tabIndex={0} aria-label={`${task.title}: ${getTaskState(task.open)}`} className={`subtask-progress__segment tone-${getDeadlineTone(task.open, task.deadline)}`} /></Tooltip>)}</div><small>{closed} из {tasks.length} ({Math.round(closed / tasks.length * 100)}%)</small></div>;
}
