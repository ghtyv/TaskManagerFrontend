import apiClient from './client';

type LoginPayload = {
    email: string;
    password: string;
};

export async function login({ email, password }: LoginPayload) {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    return apiClient.post('/auth/login', formData);
}

export async function getCurrentUser() {
    return apiClient.get('/auth/me');
}

export async function logout() {
    return apiClient.delete('/auth/logout');
}
