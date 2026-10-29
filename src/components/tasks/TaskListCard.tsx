import { Card, Tag, Typography } from 'antd';
import type { UserListItem } from '../../api/users';
import type { Task } from '../../api/tasks';
import MetadataIcon from '../MetadataIcon';
import DeleteIconButton from '../DeleteIconButton';
import SubtaskProgress from './SubtaskProgress';
import { deadlineHint, getDeadlineTone, formatTaskDeadline, getTaskState } from './taskPresentation';

type TaskListCardProps = {
    assigneeLabel: string;
    task: Task;
    usersById?: Map<number, UserListItem['email']>;
    onOpen: (taskId: number) => void;
    onDelete: () => Promise<void>;
};

function TaskListCard({ assigneeLabel, task, usersById, onOpen, onDelete }: TaskListCardProps) {
    const deletionLabel = task.parentTaskId != null ? 'Удалить подзадачу' : 'Удалить задачу';
    return <Card hoverable className="task-card task-card--interactive">
        <button className="task-card__open-surface" aria-label={`Открыть ${task.parentTaskId != null ? 'подзадачу' : 'задачу'}: ${task.title}`} onClick={() => onOpen(task.id)} />
        <div className="task-card__aligned-content">
            <div className="task-card__aligned-heading">
                <Typography.Title level={4} className="task-card__title" ellipsis={{ rows: 2 }}>{task.title}</Typography.Title>
                <Tag className={`task-status-chip tone-${task.open ? 'gray' : 'green'}`}>{getTaskState(task.open)}</Tag>
            </div>
            <Typography.Paragraph className="task-card__description" ellipsis={{ rows: 2 }}>{task.description || 'Описание не указано.'}</Typography.Paragraph>
            <div className="task-card__progress-slot" onClick={() => onOpen(task.id)}>
                <SubtaskProgress tasks={task.subTasks ?? []} usersById={usersById} />
            </div>
            <div className="task-card__dates">
                <Tag className={`tone-${task.open ? getDeadlineTone(true, task.deadline) : 'gray'}`}><MetadataIcon type="calendar" /> {formatTaskDeadline(task.deadline)}</Tag>
                {deadlineHint(task.open, task.deadline) && <Tag className={`tone-${getDeadlineTone(true, task.deadline)}`}>{deadlineHint(task.open, task.deadline)}</Tag>}
            </div>
            <div className="task-card__footer">
                <Tag className="person-chip"><MetadataIcon type="user" /> {assigneeLabel}</Tag>
                <div className="task-card__controls">
                    <DeleteIconButton label={deletionLabel} description={`«${task.title}» больше не будет доступна.`} onDelete={onDelete} />
                    <span className="task-card__arrow" aria-hidden="true"><MetadataIcon type="arrow" /></span>
                </div>
            </div>
        </div>
    </Card>;
}

export default TaskListCard;
