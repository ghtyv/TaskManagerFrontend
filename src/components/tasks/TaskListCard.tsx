import { Button, Card, Space, Tag, Typography } from 'antd';
import type { Task } from '../../api/tasks';
import SubtaskProgress from './SubtaskProgress';
import { deadlineHint, getDeadlineTone, formatTaskDeadline, getTaskState } from './taskPresentation';

type TaskListCardProps = {
    assigneeLabel: string;
    task: Task;
    onOpen: (taskId: number) => void;
};

function TaskListCard({ assigneeLabel, task, onOpen }: TaskListCardProps) {
    return (
        <Card
            hoverable
            className="task-card"
            onClick={() => onOpen(task.id)}
            actions={[
                <Button
                    key="open"
                    type="link"
                    onClick={(event) => {
                        event.stopPropagation();
                        onOpen(task.id);
                    }}
                >
                    Открыть
                </Button>,
            ]}
        >
            <Space direction="vertical" size={14} className="task-card__content">
                <Space align="start" className="task-card__heading">
                    <Typography.Title level={4} className="task-card__title" ellipsis={{ rows: 2 }}>
                        {task.title}
                    </Typography.Title>
                    <Tag color={task.open ? 'default' : 'green'}>{getTaskState(task.open)}</Tag>
                </Space>
                <Typography.Paragraph className="task-card__description" ellipsis={{ rows: 2 }}>
                    {task.description || 'Описание не указано.'}
                </Typography.Paragraph>
                <SubtaskProgress tasks={task.subTasks ?? []} />
                <Space wrap>
                    <Tag className={`tone-${task.open ? getDeadlineTone(true, task.deadline) : 'gray'}`}><span aria-hidden>▦</span> {formatTaskDeadline(task.deadline)}</Tag>
                    {deadlineHint(task.open, task.deadline) && <Tag className={`tone-${getDeadlineTone(true, task.deadline)}`}>{deadlineHint(task.open, task.deadline)}</Tag>}
                    <Tag><span aria-hidden>♙</span> {assigneeLabel}</Tag>
                </Space>
            </Space>
        </Card>
    );
}

export default TaskListCard;
