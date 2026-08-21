import apiClient from './client';

type LoginPayload = {
    email: string;
    password: string;
};

type RegisterPayload = {
    email: string;
    password: string;
};

export async function login({ email, password }: LoginPayload) {
    const payload = new URLSearchParams();
    payload.append('email', email);
    payload.append('password', password);

    return apiClient.post('/auth/login', payload, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
}

export async function register({ email, password }: RegisterPayload) {
    const payload = new URLSearchParams();
    payload.append('email', email);
    payload.append('password', password);

    return apiClient.post('/auth/registration', payload, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
}

export async function getCurrentUser() {
    return apiClient.get('/auth/me');
}

export async function logout() {
    return apiClient.delete('/auth/logout');
}
