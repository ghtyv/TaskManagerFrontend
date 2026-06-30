import { useMemo, useState } from 'react';
import type { Task } from '../api/tasks';
import type { UserListItem } from '../api/users';
import { getAssigneeLabel, type TaskStatusFilter } from '../components/tasks/taskPresentation';

function useTaskFilters(tasks: Task[], users: UserListItem[]) {
    const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('open');
    const [searchQuery, setSearchQuery] = useState('');
    const [assigneeFilter, setAssigneeFilter] = useState<string | number>('all');

    const usersById = useMemo(
        () => new Map(users.map((user) => [user.id, user.email])),
        [users],
    );

    const assigneeFilterOptions = useMemo(
        () => [
            { value: 'all', label: 'Все исполнители' },
            { value: 'unassigned', label: 'Без исполнителя' },
        ],
        [],
    );

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
                task.assigneeId === assigneeFilter;

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

    return {
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
    };
}

export default useTaskFilters;
