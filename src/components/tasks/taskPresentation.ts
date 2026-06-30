type UserLabels = Map<number, string>;

export type TaskStatusFilter = 'all' | 'open' | 'closed';

export const TASK_STATUS_FILTER_OPTIONS: Array<{ label: string; value: TaskStatusFilter }> = [
    { label: 'Все', value: 'all' },
    { label: 'Открытые', value: 'open' },
    { label: 'Закрытые', value: 'closed' },
];

export function getTaskState(open: boolean) {
    return open ? 'Открыта' : 'Закрыта';
}

export function getAssigneeLabel(
    assigneeId: number | null,
    usersById: UserLabels,
    isUsersLoading = false,
) {
    if (assigneeId === null) {
        return 'не назначен';
    }

    if (isUsersLoading) {
        return 'загрузка...';
    }

    return usersById.get(assigneeId) ?? 'неизвестный пользователь';
}

export function filterUsersByEmail(input: string, option?: { label?: string | number | null }) {
    const label = option?.label;

    if (typeof label !== 'string') {
        return false;
    }

    return label.toLowerCase().includes(input.trim().toLowerCase());
}
