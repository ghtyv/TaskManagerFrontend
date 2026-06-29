import { useState } from 'react';
import { Alert, Button, Card, ConfigProvider, Input, Typography } from 'antd';
import { Link, useNavigate } from 'react-router';
import { login } from '../api/auth';
import './LoginPage.css';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Введите логин и пароль.');
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');
            await login({ email, password });
            navigate('/tasks');
        } catch {
            setError('Неверный логин или пароль.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#b55a1f',
                    borderRadius: 14,
                    fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
                },
            }}
        >
            <div className="login-page">
                <div className="login-page__card-wrap">
                    <Card className="login-page__card" variant="borderless">
                        <Typography.Title level={2} className="login-page__card-title">
                            Вход
                        </Typography.Title>
                        <Typography.Text className="login-page__card-copy">
                            Войдите, чтобы продолжить.
                        </Typography.Text>

                        <div className="login-page__form">
                            <label className="login-page__label" htmlFor="email">
                                Логин
                            </label>
                            <Input
                                id="email"
                                size="large"
                                value={email}
                                placeholder="Введите логин"
                                onChange={(event) => setEmail(event.target.value)}
                                onPressEnter={handleLogin}
                            />

                            <label className="login-page__label" htmlFor="password">
                                Пароль
                            </label>
                            <Input.Password
                                id="password"
                                size="large"
                                value={password}
                                placeholder="Введите пароль"
                                onChange={(event) => setPassword(event.target.value)}
                                onPressEnter={handleLogin}
                            />

                            {error ? <Alert title={error} type="error" showIcon /> : null}

                            <Button
                                block
                                type="primary"
                                loading={isSubmitting}
                                className="login-page__submit"
                                onClick={handleLogin}
                            >
                                Войти
                            </Button>
                        </div>

                        <Typography.Paragraph className="login-page__footer">
                            Нет аккаунта?{' '}
                            <Link to="/signup" className="login-page__footer-link">
                                Зарегистрироваться
                            </Link>
                        </Typography.Paragraph>
                    </Card>
                </div>
            </div>
        </ConfigProvider>
    );
}

export default LoginPage;
