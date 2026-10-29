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

export function formatTaskDeadline(deadline: string | null) {
    if (!deadline) {
        return 'не указан';
    }

    const [datePart] = deadline.split('T');
    const [year, month, day] = datePart.split('-');

    if (!year || !month || !day) {
        return deadline;
    }

    return `${day}.${month}.${year}`;
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

// Сравнивайте календарные даты, а не количество прошедших часов (переход на летнее или зимнее время не должен влиять на подсчёт дней).
export function getRemainingDays(deadline: string, now = new Date()) {
    const [year, month, day] = deadline.slice(0, 10).split('-').map(Number);
    return Math.round((Date.UTC(year, month - 1, day) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
}
export function getDeadlineTone(open: boolean, deadline: string | null, now = new Date()) {
    if (!open) return 'green';
    if (!deadline) return 'gray';
    const days = getRemainingDays(deadline, now);
    return days <= 1 ? 'red' : days <= 5 ? 'yellow' : 'gray';
}
function daysLabel(count: number) {
    return count % 10 === 1 && count % 100 !== 11 ? 'день' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? 'дня' : 'дней';
}
export function deadlineHint(open: boolean, deadline: string | null) {
    if (!open || !deadline) return '';
    const days = getRemainingDays(deadline);
    if (days < 0) return `${-days} ${daysLabel(-days)} назад`;
    if (days === 0) return 'Срок сегодня';
    return `Осталось ${days} ${daysLabel(days)}`;
}
