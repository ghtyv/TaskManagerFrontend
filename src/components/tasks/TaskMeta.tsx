import { Descriptions, Space, Tag, Typography } from 'antd';
import { deadlineHint, getDeadlineTone, formatTaskDeadline } from './taskPresentation';

type TaskMetaProps = {
    assigneeLabel: string;
    deadline: string | null;
    id: number;
    stateLabel: string;
    open: boolean;
};

function TaskMeta({ assigneeLabel, deadline, id, stateLabel, open }: TaskMetaProps) {
    return (
        <Space direction="vertical" size={10} className="task-details__meta">
            <Typography.Text className="task-details__section-label">
                Сведения о задаче
            </Typography.Text>
            <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label="ID задачи">{id}</Descriptions.Item>
                <Descriptions.Item label="Статус">{stateLabel}</Descriptions.Item>
                <Descriptions.Item label="Срок выполнения">
                    <Tag className={`tone-${open ? getDeadlineTone(true, deadline) : 'gray'}`}>▦ {formatTaskDeadline(deadline)}</Tag>
                    {deadlineHint(open, deadline) && <Tag className={`tone-${getDeadlineTone(true, deadline)}`}>{deadlineHint(open, deadline)}</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Исполнитель">{assigneeLabel}</Descriptions.Item>
            </Descriptions>
        </Space>
    );
}

export default TaskMeta;
