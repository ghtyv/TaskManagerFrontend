import { useEffect, useState } from 'react';
import { Alert, Breadcrumb, Select, Tag, Button, Card, Empty, Flex, Form, Input, Layout, List, Segmented, Space, Spin, Typography } from 'antd';
import { Link, useNavigate, useParams } from 'react-router';
import { logout } from '../api/auth';
import { createTask, updateTask, type Task } from '../api/tasks';
import AssigneeSelect from '../components/tasks/AssigneeSelect';
import TaskCreateModal, { type TaskCreateFormValues } from '../components/tasks/TaskCreateModal';
import TaskListCard from '../components/tasks/TaskListCard';
import {
    getAssigneeLabel,
    TASK_STATUS_FILTER_OPTIONS,
} from '../components/tasks/taskPresentation';
import useTaskFilters from '../hooks/useTaskFilters';
import useTasksPageData from '../hooks/useTasksPageData';
import { getProject, type Project } from '../api/projects';
import './TasksPage.css';

const { Content, Header } = Layout;
const { Search } = Input;

function toDeadlinePayload(deadline: TaskCreateFormValues['deadline']) {
    return deadline ? `${deadline.format('YYYY-MM-DD')}T00:00:00` : null;
}

function TasksPage() {
    const { projectId = '' } = useParams();
    const [project, setProject] = useState<Project | null>(null);
    const [projectError, setProjectError] = useState('');
    const [pendingStatus, setPendingStatus] = useState<{ task: Task; values: TaskCreateFormValues } | null>(null);
    useEffect(() => {
        let active = true;
        getProject(projectId).then(p => { if (active) { setProject(p); setProjectError(''); } }).catch(() => { if (active) setProjectError('Не удалось загрузить проект.'); });
        return () => { active = false; };
    }, [projectId]);
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
    } = useTasksPageData(projectId);
    const {
        sortOrder, setSortOrder,
        assigneeFilter,
        assigneeFilterOptions,
        searchQuery,
        setAssigneeFilter,
        setSearchQuery,
        setStatusFilter,
        statusFilter,

        usersById,
        visibleTasks,
    } = useTaskFilters(tasks, users);

    const openTask = (taskId: number) => {
        navigate(`/projects/${projectId}/tasks/${taskId}`);
    };

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logout();
            navigate('/login', { replace: true });
        } catch {
            setProjectError('Не удалось выйти. Повторите попытку.');
        } finally { setIsLoggingOut(false); }
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

        if (pendingStatus) { void refreshAll(); setPendingStatus(null); }
        setIsCreateOpen(false);
        setCreateError('');
        form.resetFields();
    };

    const handleCreateTask = async () => {
        try {
            const values = pendingStatus?.values ?? await form.validateFields();
            setIsCreating(true);
            setCreateError('');
            const payload = (item: TaskCreateFormValues) => ({ title: item.title.trim(), description: item.description?.trim() || undefined, deadline: toDeadlinePayload(item.deadline), assigneeId: item.assigneeId ?? null });
            let createdTask = pendingStatus?.task ?? await createTask(projectId, { ...payload(values), subTasks: values.subTasks?.map(payload) });
            if (values.open === false || values.subTasks?.some(item => item.open === false)) {
                setPendingStatus({ task: createdTask, values });
                createdTask = await updateTask(projectId, createdTask.id, { open: values.open, subTasks: createdTask.subTasks.map((item, index) => ({ id: item.id, open: values.subTasks?.[index]?.open ?? true })) });
            }
            prependTask(createdTask);
            setPendingStatus(null);
            setIsCreateOpen(false);
            form.resetFields();
        } catch (createTaskError: unknown) {
            if (typeof createTaskError === 'object' && createTaskError !== null && 'errorFields' in createTaskError) {
                return;
            }

            setCreateError('Не удалось завершить сохранение. Если задача уже создана, повторная попытка сохранит её статусы без дубликата.');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Layout className="tasks-layout">
            <Header className="tasks-header">
                <div>
                    <Breadcrumb items={[{ title: <Link to="/projects">Проекты</Link> }, { title: project?.title ?? 'Проект' }, { title: 'Задачи' }]} />
                    <Flex gap={12} align="center" wrap><Typography.Title level={2} className="tasks-header__title">
                        {project?.title ?? "Проект"}
                    </Typography.Title>{project && <><Tag color={project.open ? 'green' : 'default'}>{project.open ? 'Открыт' : 'Закрыт'}</Tag><Tag>♙ Руководитель: {project.leadId === null ? 'не назначен' : usersById.get(project.leadId) ?? `пользователь #${project.leadId}`}</Tag></>}</Flex>
                    <Typography.Text className="tasks-header__meta">{project?.description || 'Описание не указано.'}</Typography.Text>
                </div>

                <Space size={12} wrap>
                    <Button type="primary" disabled={!project || !!projectError} onClick={openCreateModal}>
                        Создать задачу
                    </Button>
                    <Button onClick={() => { void refreshAll(); void getProject(projectId).then(p => { setProject(p); setProjectError(''); }).catch(() => setProjectError('Не удалось загрузить проект.')); }} disabled={isLoading}>
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
                {projectError && <Alert type="error" title={projectError} />}
                {usersError && <Alert type="warning" title={usersError} />}
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

                    <Select value={sortOrder} onChange={setSortOrder} options={[{ value: "current", label: "Сначала актуальные" }, { value: "deadline", label: "По сроку" }, { value: "title", label: "По названию" }]} />
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
                        className="tasks-grid"
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
                isPartiallyCreated={!!pendingStatus}
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
