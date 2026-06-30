import apiClient from './client';

export type Task = {
    id: number;
    title: string;
    description: string | null;
    open: boolean;
    assigneeId: number | null;
};

export type CreateTaskPayload = {
    title: string;
    description?: string;
    assigneeId?: number | null;
};

export type UpdateTaskPayload = {
    title: string;
    description: string | null;
    open: boolean;
    assigneeId: number | null;
};

export async function getTasks() {
    const response = await apiClient.get<Task[]>('/tasks');
    return response.data;
}

export async function getTaskById(taskId: string) {
    const response = await apiClient.get<Task>(`/tasks/${taskId}`);
    return response.data;
}

export async function createTask(payload: CreateTaskPayload) {
    const response = await apiClient.post<Task>('/tasks', payload);
    return response.data;
}

export async function updateTask(taskId: number, payload: UpdateTaskPayload) {
    const response = await apiClient.patch<Task>(`/tasks/${taskId}`, payload);
    return response.data;
}
