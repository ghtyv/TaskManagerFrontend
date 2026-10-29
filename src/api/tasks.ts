import apiClient from './client';

export type Task = {
    id: number;
    title: string;
    description: string | null;
    open: boolean;
    deadline: string | null;
    assigneeId: number | null;
    parentTaskId: number | null;
    subTasks: Task[];
};

export type CreateTaskPayload = {
    title: string;
    description?: string;
    deadline?: string | null;
    assigneeId?: number | null;
    subTasks?: CreateTaskPayload[];
};

export type UpdateTaskPayload = {
    title?: string;
    description?: string | null;
    open?: boolean;
    deadline?: string | null;
    assigneeId?: number | null;
    subTasks?: (Omit<UpdateTaskPayload, "subTasks" | "removedSubtaskIds"> & { id?: number })[];
    removedSubtaskIds?: number[];
};

export async function getTasks(projectId: string) {
    const response = await apiClient.get<Task[]>(`/projects/${projectId}/tasks`);
    return response.data;
}

export async function getTaskById(projectId: string, taskId: string) {
    const response = await apiClient.get<Task>(`/projects/${projectId}/tasks/${taskId}`);
    return response.data;
}

export async function createTask(projectId: string, payload: CreateTaskPayload) {
    const response = await apiClient.post<Task>(`/projects/${projectId}/tasks`, payload);
    return response.data;
}

export async function updateTask(projectId: string, taskId: number, payload: UpdateTaskPayload) {
    const response = await apiClient.patch<Task>(`/projects/${projectId}/tasks/${taskId}`, payload);
    return response.data;
}
