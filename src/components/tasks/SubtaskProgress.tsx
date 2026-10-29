import { useState } from 'react';
import { Tag, Tooltip } from 'antd';
import type { Task } from '../../api/tasks';
import MetadataIcon from '../MetadataIcon';
import { deadlineHint, formatTaskDeadline, getAssigneeLabel, getDeadlineTone, getTaskState } from './taskPresentation';

export default function SubtaskProgress({ tasks, usersById = new Map() }: { tasks: Task[]; usersById?: Map<number, string> }) {
    const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
    const task = tasks.find(item => item.id === activeTaskId) ?? tasks[0];
    if (!task) return null;
    const closed = tasks.filter(task => !task.open).length;
    return <div className="subtask-progress">
        <Tooltip trigger={['hover', 'focus']} mouseEnterDelay={0.08} mouseLeaveDelay={0.12}
            color="#fff" classNames={{ root: 'subtask-tooltip' }} title={
                <div className="subtask-tooltip__content">
                    <strong>{task.title}</strong>
                    <Tag className={`tone-${task.open ? 'gray' : 'green'}`}>{getTaskState(task.open)}</Tag>
                    <Tag className={`tone-${task.open ? getDeadlineTone(true, task.deadline) : 'gray'}`}><MetadataIcon type="calendar" /> {formatTaskDeadline(task.deadline)}</Tag>
                    {deadlineHint(task.open, task.deadline) && <Tag className={`tone-${getDeadlineTone(true, task.deadline)}`}>{deadlineHint(task.open, task.deadline)}</Tag>}
                    <Tag className="person-chip"><MetadataIcon type="user" /> {getAssigneeLabel(task.assigneeId, usersById)}</Tag>
                </div>
            }>
                <div className="subtask-progress__segments" role="group" aria-label="Состояния подзадач">
                    {tasks.map(item => <span key={item.id} tabIndex={0}
                        onMouseEnter={() => setActiveTaskId(item.id)}
                        onFocus={() => setActiveTaskId(item.id)}
                        aria-label={`${item.title}: ${getTaskState(item.open)}`}
                        className={`subtask-progress__segment tone-${getDeadlineTone(item.open, item.deadline)}`} />)}
                </div>
        </Tooltip>
        <small>{closed} из {tasks.length} ({Math.round(closed / tasks.length * 100)}%)</small>
    </div>;
}
