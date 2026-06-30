import { Descriptions, Space, Typography } from 'antd';

type TaskMetaProps = {
    assigneeLabel: string;
    id: number;
    stateLabel: string;
};

function TaskMeta({ assigneeLabel, id, stateLabel }: TaskMetaProps) {
    return (
        <Space direction="vertical" size={10} className="task-details__meta">
            <Typography.Text className="task-details__section-label">
                Сведения о задаче
            </Typography.Text>
            <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label="ID задачи">{id}</Descriptions.Item>
                <Descriptions.Item label="Статус">{stateLabel}</Descriptions.Item>
                <Descriptions.Item label="Исполнитель">{assigneeLabel}</Descriptions.Item>
            </Descriptions>
        </Space>
    );
}

export default TaskMeta;
