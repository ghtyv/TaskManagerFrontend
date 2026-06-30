import { Form, Input, Modal, Typography, type FormInstance } from 'antd';
import type { UserListItem } from '../../api/users';
import AssigneeSelect from './AssigneeSelect';

const { TextArea } = Input;

export type TaskCreateFormValues = {
    title: string;
    description?: string;
    assigneeId?: number | null;
};

type TaskCreateModalProps = {
    createError: string;
    form: FormInstance<TaskCreateFormValues>;
    isCreating: boolean;
    isUsersLoading: boolean;
    open: boolean;
    users: UserListItem[];
    usersError: string;
    onCancel: () => void;
    onSubmit: () => void;
};

function TaskCreateModal({
    createError,
    form,
    isCreating,
    isUsersLoading,
    open,
    users,
    usersError,
    onCancel,
    onSubmit,
}: TaskCreateModalProps) {
    return (
        <Modal
            title="Создать задачу"
            open={open}
            okText="Создать"
            cancelText="Отмена"
            confirmLoading={isCreating}
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
                    <Input maxLength={255} placeholder="Название" />
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

                {usersError ? (
                    <Typography.Text type="warning" className="task-create__hint">
                        {usersError}
                    </Typography.Text>
                ) : (
                    <Typography.Text className="task-create__hint">
                        Если исполнитель не выбран, задача будет создана без назначения.
                    </Typography.Text>
                )}

                {createError ? (
                    <Typography.Text type="danger" className="task-create__error">
                        {createError}
                    </Typography.Text>
                ) : null}
            </Form>
        </Modal>
    );
}

export default TaskCreateModal;
