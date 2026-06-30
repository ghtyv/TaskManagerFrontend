import { Descriptions, Typography } from 'antd';

type TaskMetaProps = {
    assigneeLabel: string;
    id: number;
    stateLabel: string;
};

function TaskMeta({ assigneeLabel, id, stateLabel }: TaskMetaProps) {
    return (
        <div className="task-details__meta">
            <Typography.Text className="task-details__section-label">
                Сведения о задаче
            </Typography.Text>
            <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label="ID задачи">{id}</Descriptions.Item>
                <Descriptions.Item label="Статус">{stateLabel}</Descriptions.Item>
                <Descriptions.Item label="Исполнитель">{assigneeLabel}</Descriptions.Item>
            </Descriptions>
        </div>
    );
}

export default TaskMeta;
