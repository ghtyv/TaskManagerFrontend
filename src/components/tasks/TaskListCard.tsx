import { Button, Card, Space, Tag, Typography } from 'antd';
import type { Task } from '../../api/tasks';
import { formatTaskDeadline, getTaskState } from './taskPresentation';

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
                    <Tag color={task.open ? 'green' : 'default'}>{getTaskState(task.open)}</Tag>
                </Space>
                <Typography.Paragraph className="task-card__description" ellipsis={{ rows: 2 }}>
                    {task.description || 'Описание не указано.'}
                </Typography.Paragraph>
                <Space direction="vertical" size={4} className="task-card__meta-list">
                    <Typography.Text className="task-card__meta">
                        Срок: {formatTaskDeadline(task.deadline)}
                    </Typography.Text>
                    <Typography.Text className="task-card__meta">
                        Исполнитель: {assigneeLabel}
                    </Typography.Text>
                </Space>
            </Space>
        </Card>
    );
}

export default TaskListCard;
