import MetadataIcon from '../components/MetadataIcon';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Flex, Form, Layout, Popconfirm, Space, Spin, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router';
import { deleteTask, deleteSubtask, getTaskById, updateTask, type Task } from '../api/tasks';
import { getUsers, type UserListItem } from '../api/users';
import TaskEditModal, { type TaskEditFormValues } from '../components/tasks/TaskEditModal';
import TaskListCard from '../components/tasks/TaskListCard';
import TaskMeta from '../components/tasks/TaskMeta';
import { getAssigneeLabel, getTaskState } from '../components/tasks/taskPresentation';
import './TasksPage.css';

const { Content } = Layout;

function toDeadlinePayload(deadline: TaskEditFormValues['deadline']) {
    return deadline ? `${deadline.format('YYYY-MM-DD')}T00:00:00` : null;
}

function TaskDetailsPage() {
    const { id, projectId = '' } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [isUsersLoading, setIsUsersLoading] = useState(true);
    const [usersError, setUsersError] = useState('');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [actionError, setActionError] = useState('');
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
            setActionError('');
            setIsEditOpen(false);
            form.resetFields();
            setIsUsersLoading(true);
            setError('');

            const [taskResult, usersResult] = await Promise.allSettled([getTaskById(projectId, id), getUsers()]);

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
    }, [id, projectId, form]);

    const isSubtask = task?.parentTaskId != null;
    const backPath = task?.parentTaskId != null
        ? `/projects/${projectId}/tasks/${task.parentTaskId}`
        : `/projects/${projectId}`;

    const handleDelete = async () => {
        if (!task || isDeleting || isUpdating) return;
        setIsDeleting(true);
        setActionError('');
        try {
            if (task.parentTaskId != null) {
                await deleteSubtask(projectId, task.parentTaskId, task.id);
            } else {
                await deleteTask(projectId, task.id);
            }
            navigate(backPath, { replace: true });
        } catch {
            setActionError('Не удалось удалить задачу. Попробуйте снова.');
        } finally {
            setIsDeleting(false);
        }
    };

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
            subTasks: task.subTasks.map(item => ({ ...item, subTasks: undefined, description: item.description ?? undefined, deadline: item.deadline ? dayjs(item.deadline) : null })),
            title: task.title,
            description: task.description ?? '',
            deadline: task.deadline ? dayjs(task.deadline) : null,
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

            if (task.parentTaskId != null) {
                const parent = await updateTask(projectId, task.parentTaskId, {
                    subTasks: [{ id: task.id, title: values.title.trim(),
                        description: values.description?.trim() || null, open: values.open,
                        deadline: toDeadlinePayload(values.deadline), assigneeId: values.assigneeId ?? null }],
                });
                const updatedSubtask = parent.subTasks.find(item => item.id === task.id);
                if (!updatedSubtask) throw new Error('Updated subtask is missing');
                setTask(updatedSubtask);
                setIsEditOpen(false);
                form.resetFields();
                return;
            }

            const updatedTask = await updateTask(projectId, task.id, {
                subTasks: values.subTasks?.map(item => ({ ...(item.id ? { id: item.id } : {}), title: item.title.trim(), description: item.description?.trim() || null, open: item.open, deadline: toDeadlinePayload(item.deadline), assigneeId: item.assigneeId ?? null })),
                removedSubtaskIds: task.subTasks.filter(item => !values.subTasks?.some(draft => draft.id === item.id)).map(item => item.id),
                title: values.title.trim(),
                description: values.description?.trim() ? values.description.trim() : null,
                open: values.open,
                deadline: toDeadlinePayload(values.deadline),
                assigneeId: values.assigneeId ?? null,
            });

            setTask(updatedTask);
            const newDrafts = values.subTasks?.filter(item => !item.id) ?? [];
            const newTasks = updatedTask.subTasks.filter(item => !task.subTasks.some(old => old.id === item.id));
            if (newDrafts.some(item => item.open === false)) {
                try {
                    setTask(await updateTask(projectId, task.id, { subTasks: newTasks.map((item, i) => ({ id: item.id, open: newDrafts[i]?.open ?? true })) }));
                } catch {
                    setIsEditOpen(false);
                    setUsersError('Изменения сохранены, но статусы новых подзадач остались открытыми. Откройте редактирование и повторите изменение статусов.');
                    return;
                }
            }
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
                        <Button onClick={() => navigate(`/projects/${projectId}`)}>
                            Назад к задачам
                        </Button>

                        <Card className="tasks-state__panel">
                            <Space direction="vertical" size={16}>
                                <Typography.Text>{error}</Typography.Text>
                                <Button type="primary" onClick={() => navigate(`/projects/${projectId}`)}>
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
                    <Space wrap>
                        <Button onClick={() => navigate(backPath)}>
                            {isSubtask ? '← К родительской задаче' : '← К задачам проекта'}
                        </Button>
                        <Button type="link" onClick={() => navigate('/projects')}>Все проекты</Button>
                    </Space>
                    {actionError && <Alert type="error" title={actionError} closable onClose={() => setActionError('')} />}

                    {isLoading ? (
                        <div className="tasks-state">
                            <Spin size="large" />
                        </div>
                    ) : error ? (
                        <Card className="tasks-state__panel">
                            <Space direction="vertical" size={16}>
                                <Typography.Text>{error}</Typography.Text>
                                <Button type="primary" onClick={() => navigate(`/projects/${projectId}`)}>
                                    Вернуться к задачам
                                </Button>
                            </Space>
                        </Card>
                    ) : task ? (
                        <Card className="task-details__card">
                            <Space direction="vertical" size={20} className="task-details__content">
                                <Flex justify="space-between" gap={16} wrap className="task-details__header">
                                    <Flex align="center" gap={12} wrap className="task-details__header-main">
                                        <Typography.Title level={2} className="task-details__title">
                                            {task.title}
                                        </Typography.Title>
                                        <Tag className={`task-status-chip tone-${task.open ? 'gray' : 'green'}`}>{getTaskState(task.open)}</Tag>
                                    </Flex>

                                    <Space wrap>
                                        <Button type="primary" disabled={isDeleting} onClick={openEditModal}>
                                            Изменить
                                        </Button>
                                        <Popconfirm
                                            title={isSubtask ? 'Удалить подзадачу?' : 'Удалить задачу?'}
                                            description={isSubtask ? 'Подзадача больше не будет доступна.' : 'Задача и её подзадачи больше не будут доступны.'}
                                            okText="Удалить" cancelText="Отмена" okButtonProps={{ danger: true, loading: isDeleting }}
                                            disabled={isDeleting || isUpdating}
                                            onConfirm={handleDelete}
                                        >
                                            <Button danger icon={<MetadataIcon type="delete" />} aria-label={isSubtask ? "Удалить подзадачу" : "Удалить задачу"} title={isSubtask ? "Удалить подзадачу" : "Удалить задачу"} loading={isDeleting} disabled={isUpdating} />
                                        </Popconfirm>
                                    </Space>
                                </Flex>

                                <div className="task-details__section">
                                    <Typography.Text className="task-details__section-label">
                                        Описание
                                    </Typography.Text>
                                    <Typography.Paragraph className="task-details__description">
                                        {task.description || 'Описание не указано.'}
                                    </Typography.Paragraph>
                                </div>

                                <TaskMeta
                                    open={task.open}
                                    id={task.id}
                                    deadline={task.deadline}
                                    stateLabel={getTaskState(task.open)}
                                    assigneeLabel={getAssigneeLabel(task.assigneeId, usersById, isUsersLoading)}
                                />

                                {!!task.subTasks.length && <section><Typography.Title level={4}>Подзадачи</Typography.Title><div className="projects-grid">{task.subTasks.map(item => <TaskListCard key={item.id} task={item} assigneeLabel={getAssigneeLabel(item.assigneeId, usersById)} usersById={usersById} onDelete={async () => { await deleteSubtask(projectId, task.id, item.id); setTask(current => current ? { ...current, subTasks: current.subTasks.filter(subtask => subtask.id !== item.id) } : current); }} onOpen={subtaskId => navigate(`/projects/${projectId}/tasks/${subtaskId}`)} />)}</div></section>}
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
                isSubtask={isSubtask}
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
