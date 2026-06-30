import { useState } from 'react';
import { Button, Card, Empty, Flex, Form, Input, Layout, List, Segmented, Space, Spin, Typography } from 'antd';
import { useNavigate } from 'react-router';
import { logout } from '../api/auth';
import { createTask } from '../api/tasks';
import AssigneeSelect from '../components/tasks/AssigneeSelect';
import TaskCreateModal, { type TaskCreateFormValues } from '../components/tasks/TaskCreateModal';
import TaskListCard from '../components/tasks/TaskListCard';
import {
    getAssigneeLabel,
    TASK_STATUS_FILTER_OPTIONS,
} from '../components/tasks/taskPresentation';
import useTaskFilters from '../hooks/useTaskFilters';
import useTasksPageData from '../hooks/useTasksPageData';
import './TasksPage.css';

const { Content, Header } = Layout;
const { Search } = Input;

function TasksPage() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const navigate = useNavigate();
    const [form] = Form.useForm<TaskCreateFormValues>();
    const {
        error,
        isLoading,
        isUsersLoading,
        loadUsers,
        prependTask,
        refreshAll,
        tasks,
        users,
        usersError,
    } = useTasksPageData();
    const {
        assigneeFilter,
        assigneeFilterOptions,
        searchQuery,
        setAssigneeFilter,
        setSearchQuery,
        setStatusFilter,
        statusFilter,
        summary,
        usersById,
        visibleTasks,
    } = useTaskFilters(tasks, users);

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

            prependTask(createdTask);
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
                    <Button onClick={() => void refreshAll()} disabled={isLoading}>
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
                        <Segmented
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={TASK_STATUS_FILTER_OPTIONS}
                        />

                        <AssigneeSelect
                            className="tasks-toolbar__assignee"
                            extraOptions={assigneeFilterOptions}
                            isLoading={isUsersLoading}
                            onChange={setAssigneeFilter}
                            placeholder="Исполнитель"
                            users={users}
                            value={assigneeFilter}
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
                                <Button type="primary" onClick={() => void refreshAll()}>
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
