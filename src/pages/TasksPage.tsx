import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Empty, Flex, Form, Input, Layout, List, Segmented, Select, Space, Spin, Typography } from 'antd';
import { useNavigate } from 'react-router';
import { logout } from '../api/auth';
import { createTask, getTasks, type Task } from '../api/tasks';
import { getUsers, type UserListItem } from '../api/users';
import TaskCreateModal, { type TaskCreateFormValues } from '../components/tasks/TaskCreateModal';
import TaskListCard from '../components/tasks/TaskListCard';
import {
    getAssigneeLabel,
    TASK_STATUS_FILTER_OPTIONS,
    type TaskStatusFilter,
} from '../components/tasks/taskPresentation';
import './TasksPage.css';

const { Content, Header } = Layout;
const { Search } = Input;

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
    const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('open');
    const [searchQuery, setSearchQuery] = useState('');
    const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
    const navigate = useNavigate();
    const [form] = Form.useForm<TaskCreateFormValues>();

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
        const closedTasks = tasks.length - openTasks;

        if (statusFilter === 'open') {
            return `${openTasks} открытых задач`;
        }

        if (statusFilter === 'closed') {
            return `${closedTasks} закрытых задач`;
        }

        return `${tasks.length} задач • ${openTasks} открыто • ${closedTasks} закрыто`;
    }, [statusFilter, tasks]);

    const usersById = useMemo(
        () => new Map(users.map((user) => [user.id, user.email])),
        [users],
    );

    const assigneeFilterOptions = useMemo(
        () => [
            { value: 'all', label: 'Все исполнители' },
            { value: 'unassigned', label: 'Без исполнителя' },
            ...users.map((user) => ({
                value: String(user.id),
                label: user.email,
            })),
        ],
        [users],
    );

    const visibleTasks = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return tasks.filter((task) => {
            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'open' && task.open) ||
                (statusFilter === 'closed' && !task.open);

            if (!matchesStatus) {
                return false;
            }

            const matchesAssignee =
                assigneeFilter === 'all' ||
                (assigneeFilter === 'unassigned' && task.assigneeId === null) ||
                String(task.assigneeId) === assigneeFilter;

            if (!matchesAssignee) {
                return false;
            }

            if (!normalizedQuery) {
                return true;
            }

            const assigneeLabel = getAssigneeLabel(task.assigneeId, usersById);
            const haystack = [task.title, task.description ?? '', assigneeLabel].join(' ').toLowerCase();

            return haystack.includes(normalizedQuery);
        });
    }, [assigneeFilter, searchQuery, statusFilter, tasks, usersById]);

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
                <Flex gap={16} justify="space-between" wrap className="tasks-toolbar">
                    <Flex gap={16} wrap className="tasks-toolbar__filters">
                        <Segmented<TaskStatusFilter>
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={TASK_STATUS_FILTER_OPTIONS}
                        />

                        <Select
                            value={assigneeFilter}
                            onChange={setAssigneeFilter}
                            options={assigneeFilterOptions}
                            className="tasks-toolbar__assignee"
                            placeholder="Исполнитель"
                        />
                    </Flex>

                    <Search
                        allowClear
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Поиск"
                        className="tasks-toolbar__search"
                    />
                </Flex>

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
                ) : visibleTasks.length === 0 ? (
                    <div className="tasks-state">
                        <Empty description="По вашему запросу задачи не найдены." />
                    </div>
                ) : (
                    <List
                        grid={{ gutter: 20, xs: 1, lg: 2 }}
                        dataSource={visibleTasks}
                        renderItem={(task) => (
                            <List.Item>
                                <TaskListCard
                                    task={task}
                                    assigneeLabel={getAssigneeLabel(task.assigneeId, usersById)}
                                    onOpen={openTask}
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Content>

            <TaskCreateModal
                createError={createError}
                form={form}
                isCreating={isCreating}
                isUsersLoading={isUsersLoading}
                open={isCreateOpen}
                users={users}
                usersError={usersError}
                onCancel={closeCreateModal}
                onSubmit={() => void handleCreateTask()}
            />
        </Layout>
    );
}

export default TasksPage;
