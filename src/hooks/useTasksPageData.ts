import { useCallback, useEffect, useState } from 'react';
import { getTasks, type Task } from '../api/tasks';
import { getUsers, type UserListItem } from '../api/users';

function useTasksPageData() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUsersLoading, setIsUsersLoading] = useState(true);
    const [error, setError] = useState('');
    const [usersError, setUsersError] = useState('');

    const refreshAll = useCallback(async () => {
        setIsLoading(true);
        setIsUsersLoading(true);

        const [tasksResult, usersResult] = await Promise.allSettled([getTasks(), getUsers()]);

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

        setIsLoading(false);
        setIsUsersLoading(false);
    }, []);

    const loadUsers = useCallback(async () => {
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
    }, []);

    const prependTask = useCallback((task: Task) => {
        setTasks((currentTasks) => [task, ...currentTasks]);
    }, []);

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

    return {
        error,
        isLoading,
        isUsersLoading,
        loadUsers,
        prependTask,
        refreshAll,
        tasks,
        users,
        usersError,
    };
}

export default useTasksPageData;
