import apiClient from './client';

export type UserListItem = {
    id: number;
    email: string;
};

export async function getUsers() {
    const response = await apiClient.get<UserListItem[]>('/users');
    return response.data;
}
