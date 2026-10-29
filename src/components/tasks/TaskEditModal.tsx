import { Button, Form, Modal, Typography, type FormInstance } from 'antd';
import type { Dayjs } from 'dayjs';
import type { UserListItem } from '../../api/users';
import { TaskFields, SubtaskFields } from './TaskFields';
import type { TaskCreateFormValues } from './TaskCreateModal';



export type TaskEditFormValues = {
    subTasks?: TaskCreateFormValues[];
    title: string;
    description?: string;
    deadline?: Dayjs | null;
    open: boolean;
    assigneeId?: number | null;
};

type TaskEditModalProps = {
    isSubtask?: boolean;
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
    isSubtask = false,
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
            width={isSubtask ? 520 : 1000}
            closable={!isUpdating}
            maskClosable={!isUpdating}
            title={isSubtask ? "Изменить подзадачу" : "Изменить задачу"}
            open={open}
            okText="Сохранить"
            cancelText="Отмена"
            confirmLoading={isUpdating}
            onOk={onSubmit}
            onCancel={onCancel}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" disabled={isUpdating}>
                <div className={isSubtask ? undefined : "task-form-columns"}><section><TaskFields users={users} loading={isUsersLoading} /></section>{!isSubtask && <SubtaskFields users={users} loading={isUsersLoading} />}</div>
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
