import { Form, Modal, Typography, type FormInstance } from 'antd';
import type { Dayjs } from 'dayjs';
import type { UserListItem } from '../../api/users';
import { TaskFields, SubtaskFields } from './TaskFields';



export type TaskCreateFormValues = {
    open: boolean;
    subTasks?: TaskCreateFormValues[];
    id?: number;
    title: string;
    description?: string;
    deadline?: Dayjs | null;
    assigneeId?: number | null;
};

type TaskCreateModalProps = {
    isPartiallyCreated?: boolean;
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
    isPartiallyCreated,
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
            width={1000}
            closable={!isCreating}
            maskClosable={!isCreating}
            title="Создать задачу"
            open={open}
            okText="Создать"
            cancelText="Отмена"
            confirmLoading={isCreating}
            onOk={onSubmit}
            onCancel={onCancel}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" initialValues={{ open: true, subTasks: [] }} disabled={isCreating || isPartiallyCreated}>
                <div className="task-form-columns"><section><TaskFields users={users} loading={isUsersLoading} /></section><SubtaskFields users={users} loading={isUsersLoading} /></div>
                {isPartiallyCreated && <Typography.Paragraph type="warning">Задача и подзадачи созданы. Не удалось сохранить выбранные статусы. Нажмите «Создать», чтобы повторить сохранение статусов, или закройте окно: задача останется в проекте.</Typography.Paragraph>}
                {usersError ? (
                    <Typography.Text type="warning" className="task-create__hint">
                        {usersError}
                    </Typography.Text>
                ) : (
                    <Typography.Text className="task-create__hint">
                        Если исполнитель не выбран, задача будет создана без исполнителя.
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
