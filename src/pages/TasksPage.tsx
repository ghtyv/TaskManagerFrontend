import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Empty, Form, Input, Layout, List, Modal, Select, Space, Spin, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router';
import { logout } from '../api/auth';
import { createTask, getTasks, type Task } from '../api/tasks';
import { getUsers, type UserListItem } from '../api/users';
import './TasksPage.css';

const { Content, Header } = Layout;
const { TextArea } = Input;

function getTaskState(open: boolean) {
    return open ? 'Открыта' : 'Закрыта';
}

function getAssigneeLabel(assigneeId: number | null, usersById: Map<number, string>) {
    if (assigneeId === null) {
        return 'не назначен';
    }

    return usersById.get(assigneeId) ?? 'неизвестный пользователь';
}

function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [isUsersLoading, setIsUsersLoading] = useState(true);
    const [error, setError] = useState('');
    const [createError, setCreateError] = useState('');
    const [usersError, setUsersError] = useState('');
    const navigate = useNavigate();
    const [form] = Form.useForm<{
        title: string;
        description?: string;
        assigneeId?: number | null;
    }>();

    const loadTasks = async () => {
        try {
            setIsLoading(true);
            setError('');
            const nextTasks = await getTasks();
            setTasks(nextTasks);
        } catch {
            setError('Не удалось загрузить задачи.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let isActive = true;

        Promise.allSettled([getTasks(), getUsers()])
            .then(([tasksResult, usersResult]) => {
                if (!isActive) {
                    return;
                }

                if (tasksResult.status === 'fulfilled') {
                    setTasks(tasksResult.value);
                    setError('');
                } else {
                    setError('Не удалось загрузить задачи.');
                }

                if (usersResult.status === 'fulfilled') {
                    setUsers(usersResult.value);
                    setUsersError('');
                } else {
                    setUsersError('Не удалось загрузить список пользователей.');
                }
            })
            .finally(() => {
                if (isActive) {
                    setIsLoading(false);
                    setIsUsersLoading(false);
                }
            });

        return () => {
            isActive = false;
        };
    }, []);

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

    const openTask = (taskId: number) => {
        navigate(`/tasks/${taskId}`);
    };

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logout();
        } finally {
            navigate('/login', { replace: true });
        }
    };

    const summary = useMemo(() => {
        const openTasks = tasks.filter((task) => task.open).length;
        return `${tasks.length} задач • ${openTasks} открыто`;
    }, [tasks]);

    const usersById = useMemo(
        () => new Map(users.map((user) => [user.id, user.email])),
        [users],
    );

    const openCreateModal = () => {
        setCreateError('');
        setIsCreateOpen(true);

        if (!users.length && !isUsersLoading) {
            void loadUsers();
        }
    };

    const closeCreateModal = () => {
        if (isCreating) {
            return;
        }

        setIsCreateOpen(false);
        setCreateError('');
        form.resetFields();
    };

    const handleCreateTask = async () => {
        try {
            const values = await form.validateFields();
            setIsCreating(true);
            setCreateError('');

            const createdTask = await createTask({
                title: values.title.trim(),
                description: values.description?.trim() || undefined,
                assigneeId: values.assigneeId ?? null,
            });

            setTasks((currentTasks) => [createdTask, ...currentTasks]);
            setIsCreateOpen(false);
            form.resetFields();
        } catch (createTaskError: unknown) {
            if (typeof createTaskError === 'object' && createTaskError !== null && 'errorFields' in createTaskError) {
                return;
            }

            setCreateError('Не удалось создать задачу. Проверьте поля и попробуйте снова.');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Layout className="tasks-layout">
            <Header className="tasks-header">
                <div>
                    <Typography.Title level={2} className="tasks-header__title">
                        Задачи
                    </Typography.Title>
                    <Typography.Text className="tasks-header__meta">{summary}</Typography.Text>
                </div>

                <Space size={12}>
                    <Button type="primary" onClick={openCreateModal}>
                        Создать задачу
                    </Button>
                    <Button onClick={() => void loadTasks()} disabled={isLoading}>
                        Обновить
                    </Button>
                    <Button
                        danger
                        type="primary"
                        loading={isLoggingOut}
                        onClick={() => void handleLogout()}
                    >
                        Выйти
                    </Button>
                </Space>
            </Header>

            <Content className="tasks-content">
                {isLoading ? (
                    <div className="tasks-state">
                        <Spin size="large" />
                    </div>
                ) : error ? (
                    <div className="tasks-state">
                        <Card className="tasks-state__panel">
                            <Space direction="vertical" size={16}>
                                <Typography.Text>{error}</Typography.Text>
                                <Button type="primary" onClick={() => void loadTasks()}>
                                    Повторить
                                </Button>
                            </Space>
                        </Card>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="tasks-state">
                        <Empty description="Задач пока нет." />
                    </div>
                ) : (
                    <List
                        grid={{ gutter: 20, xs: 1, lg: 2 }}
                        dataSource={tasks}
                        renderItem={(task) => (
                            <List.Item>
                                <Card
                                    hoverable
                                    className="task-card"
                                    onClick={() => openTask(task.id)}
                                    actions={[
                                        <Button
                                            key="open"
                                            type="link"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                openTask(task.id);
                                            }}
                                        >
                                            Открыть
                                        </Button>,
                                    ]}
                                >
                                    <Space direction="vertical" size={14} className="task-card__content">
                                        <Space align="start" className="task-card__heading">
                                            <Typography.Title level={4} className="task-card__title">
                                                {task.title}
                                            </Typography.Title>
                                            <Tag color={task.open ? 'green' : 'default'}>{getTaskState(task.open)}</Tag>
                                        </Space>
                                        <Typography.Paragraph className="task-card__description" ellipsis={{ rows: 3 }}>
                                            {task.description || 'Описание не указано.'}
                                        </Typography.Paragraph>
                                        <Typography.Text className="task-card__meta">
                                            Исполнитель: {getAssigneeLabel(task.assigneeId, usersById)}
                                        </Typography.Text>
                                    </Space>
                                </Card>
                            </List.Item>
                        )}
                    />
                )}
            </Content>

            <Modal
                title="Создать задачу"
                open={isCreateOpen}
                okText="Создать"
                cancelText="Отмена"
                confirmLoading={isCreating}
                onOk={() => void handleCreateTask()}
                onCancel={closeCreateModal}
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
                        <Input maxLength={255} placeholder="Например, Подготовить отчет" />
                    </Form.Item>

                    <Form.Item name="description" label="Описание">
                        <TextArea rows={4} placeholder="Опишите задачу" />
                    </Form.Item>

                    <Form.Item name="assigneeId" label="Исполнитель">
                        <Select
                            allowClear
                            showSearch
                            loading={isUsersLoading}
                            className="task-create__assignee-input"
                            placeholder="Выберите пользователя"
                            optionFilterProp="label"
                            options={users.map((user) => ({
                                value: user.id,
                                label: user.email,
                            }))}
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
        </Layout>
    );
}

export default TasksPage;
