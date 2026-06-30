import { Button, Form, Input, Modal, Switch, Typography, type FormInstance } from 'antd';
import type { UserListItem } from '../../api/users';
import AssigneeSelect from './AssigneeSelect';

const { TextArea } = Input;

export type TaskEditFormValues = {
    title: string;
    description?: string;
    open: boolean;
    assigneeId?: number | null;
};

type TaskEditModalProps = {
    form: FormInstance<TaskEditFormValues>;
    isUsersLoading: boolean;
    isUpdating: boolean;
    open: boolean;
    updateError: string;
    users: UserListItem[];
    usersError: string;
    onCancel: () => void;
    onRetryUsers: () => void;
    onSubmit: () => void;
};

function TaskEditModal({
    form,
    isUsersLoading,
    isUpdating,
    open,
    updateError,
    users,
    usersError,
    onCancel,
    onRetryUsers,
    onSubmit,
}: TaskEditModalProps) {
    return (
        <Modal
            title="Изменить задачу"
            open={open}
            okText="Сохранить"
            cancelText="Отмена"
            confirmLoading={isUpdating}
            onOk={onSubmit}
            onCancel={onCancel}
            destroyOnHidden
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="title"
                    label="Название"
                    rules={[
                        { required: true, whitespace: true, message: 'Введите название задачи.' },
                    ]}
                >
                    <Input maxLength={255} />
                </Form.Item>

                <Form.Item name="description" label="Описание">
                    <TextArea rows={4} placeholder="Опишите задачу" />
                </Form.Item>

                <Form.Item name="assigneeId" label="Исполнитель">
                    <AssigneeSelect
                        allowClear
                        className="task-create__assignee-input"
                        isLoading={isUsersLoading}
                        onChange={(value) => form.setFieldValue('assigneeId', value)}
                        placeholder="Выберите пользователя"
                        users={users}
                        value={form.getFieldValue('assigneeId')}
                    />
                </Form.Item>

                <Form.Item name="open" label="Статус задачи" valuePropName="checked">
                    <Switch />
                </Form.Item>

                {usersError ? (
                    <div className="task-edit-modal__users-error">
                        <Typography.Text type="warning" className="task-create__hint">
                            {usersError}
                        </Typography.Text>
                        <Button type="link" onClick={onRetryUsers}>
                            Повторить загрузку пользователей
                        </Button>
                    </div>
                ) : null}

                {updateError ? (
                    <Typography.Text type="danger" className="task-create__error">
                        {updateError}
                    </Typography.Text>
                ) : null}
            </Form>
        </Modal>
    );
}

export default TaskEditModal;
