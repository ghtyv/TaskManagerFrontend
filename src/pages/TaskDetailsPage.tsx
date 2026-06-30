import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Layout, Space, Spin, Tag, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router';
import { getTaskById, updateTask, type Task } from '../api/tasks';
import { getUsers, type UserListItem } from '../api/users';
import TaskEditModal, { type TaskEditFormValues } from '../components/tasks/TaskEditModal';
import TaskMeta from '../components/tasks/TaskMeta';
import './TasksPage.css';

const { Content } = Layout;

function getTaskState(open: boolean) {
    return open ? 'Открыта' : 'Закрыта';
}

function getAssigneeLabel(
    assigneeId: number | null,
    usersById: Map<number, string>,
    isUsersLoading: boolean,
) {
    if (assigneeId === null) {
        return 'не назначен';
    }

    if (isUsersLoading) {
        return 'загрузка...';
    }

    return usersById.get(assigneeId) ?? 'неизвестный пользователь';
}

function TaskDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [isUsersLoading, setIsUsersLoading] = useState(true);
    const [usersError, setUsersError] = useState('');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');
    const [updateError, setUpdateError] = useState('');
    const [form] = Form.useForm<TaskEditFormValues>();

    useEffect(() => {
        let isActive = true;

        const loadData = async () => {
            if (!id) {
                setError('Не указан идентификатор задачи.');
                setIsLoading(false);
                setIsUsersLoading(false);
                return;
            }

            setIsLoading(true);
            setIsUsersLoading(true);
            setError('');

            const [taskResult, usersResult] = await Promise.allSettled([getTaskById(id), getUsers()]);

            if (!isActive) {
                return;
            }

            if (taskResult.status === 'fulfilled') {
                setTask(taskResult.value);
            } else {
                setError('Не удалось загрузить задачу.');
            }

            if (usersResult.status === 'fulfilled') {
                setUsers(usersResult.value);
                setUsersError('');
            } else {
                setUsersError('Не удалось загрузить список пользователей.');
            }

            if (isActive) {
                setIsLoading(false);
                setIsUsersLoading(false);
            }
        };

        void loadData();

        return () => {
            isActive = false;
        };
    }, [id]);

    const loadUsers = async () => {
        try {
            setIsUsersLoading(true);
            setUsersError('');
            const nextUsers = await getUsers();
            setUsers(nextUsers);
        } catch {
            setUsersError('Не удалось загрузить список пользователей.');
        } finally {
            setIsUsersLoading(false);
        }
    };

    const usersById = useMemo(
        () => new Map(users.map((user) => [user.id, user.email])),
        [users],
    );

    const openEditModal = () => {
        if (!task) {
            return;
        }

        setUpdateError('');
        form.setFieldsValue({
            title: task.title,
            description: task.description ?? '',
            open: task.open,
            assigneeId: task.assigneeId ?? undefined,
        });
        setIsEditOpen(true);

        if (!users.length && !isUsersLoading) {
            void loadUsers();
        }
    };

    const closeEditModal = () => {
        if (isUpdating) {
            return;
        }

        setIsEditOpen(false);
        setUpdateError('');
        form.resetFields();
    };

    const handleUpdateTask = async () => {
        if (!task) {
            return;
        }

        try {
            const values = await form.validateFields();
            setIsUpdating(true);
            setUpdateError('');

            const updatedTask = await updateTask(task.id, {
                title: values.title.trim(),
                description: values.description?.trim() ? values.description.trim() : null,
                open: values.open,
                assigneeId: values.assigneeId ?? null,
            });

            setTask(updatedTask);
            setIsEditOpen(false);
            form.resetFields();
        } catch (updateTaskError: unknown) {
            if (typeof updateTaskError === 'object' && updateTaskError !== null && 'errorFields' in updateTaskError) {
                return;
            }

            setUpdateError('Не удалось сохранить изменения. Проверьте поля и попробуйте снова.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (task === null && !isLoading && error) {
        return (
            <Layout className="tasks-layout">
                <Content className="task-details">
                    <Space direction="vertical" size={20} className="task-details__stack">
                        <Button onClick={() => navigate('/tasks')}>
                            Назад к задачам
                        </Button>

                        <Card className="tasks-state__panel">
                            <Space direction="vertical" size={16}>
                                <Typography.Text>{error}</Typography.Text>
                                <Button type="primary" onClick={() => navigate('/tasks')}>
                                    Вернуться к задачам
                                </Button>
                            </Space>
                        </Card>
                    </Space>
                </Content>
            </Layout>
        );
    }

    return (
        <Layout className="tasks-layout">
            <Content className="task-details">
                <Space direction="vertical" size={20} className="task-details__stack">
                    <Button onClick={() => navigate('/tasks')}>
                        Назад к задачам
                    </Button>

                    {isLoading ? (
                        <div className="tasks-state">
                            <Spin size="large" />
                        </div>
                    ) : error ? (
                        <Card className="tasks-state__panel">
                            <Space direction="vertical" size={16}>
                                <Typography.Text>{error}</Typography.Text>
                                <Button type="primary" onClick={() => navigate('/tasks')}>
                                    Вернуться к задачам
                                </Button>
                            </Space>
                        </Card>
                    ) : task ? (
                        <Card className="task-details__card">
                            <Space direction="vertical" size={20} className="task-details__content">
                                <div className="task-details__header">
                                    <div className="task-details__header-main">
                                        <Typography.Title level={2} className="task-details__title">
                                            {task.title}
                                        </Typography.Title>
                                        <Tag color={task.open ? 'green' : 'default'}>{getTaskState(task.open)}</Tag>
                                    </div>

                                    <Button type="primary" onClick={openEditModal}>
                                        Изменить
                                    </Button>
                                </div>

                                <div className="task-details__section">
                                    <Typography.Text className="task-details__section-label">
                                        Описание
                                    </Typography.Text>
                                    <Typography.Paragraph className="task-details__description">
                                        {task.description || 'Описание не указано.'}
                                    </Typography.Paragraph>
                                </div>

                                <TaskMeta
                                    id={task.id}
                                    stateLabel={getTaskState(task.open)}
                                    assigneeLabel={getAssigneeLabel(task.assigneeId, usersById, isUsersLoading)}
                                />

                                {usersError ? (
                                    <Typography.Text type="warning" className="task-details__warning">
                                        {usersError}
                                    </Typography.Text>
                                ) : null}
                            </Space>
                        </Card>
                    ) : null}
                </Space>
            </Content>

            <TaskEditModal
                form={form}
                isUsersLoading={isUsersLoading}
                isUpdating={isUpdating}
                open={isEditOpen}
                updateError={updateError}
                users={users}
                usersError={usersError}
                onCancel={closeEditModal}
                onRetryUsers={() => void loadUsers()}
                onSubmit={() => void handleUpdateTask()}
            />
        </Layout>
    );
}

export default TaskDetailsPage;
