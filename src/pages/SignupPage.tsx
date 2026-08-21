import { useState } from 'react';
import { Alert, Button, Card, Input, Typography } from 'antd';
import { Link, useNavigate } from 'react-router';
import { register } from '../api/auth';
import './LoginPage.css';

function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async () => {
        if (!email || !password || !confirmPassword) {
            setError('Заполните все поля.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Пароли не совпадают.');
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');
            await register({ email, password });
            navigate('/login', {
                replace: true,
                state: { registrationSuccess: true },
            });
        } catch {
            setError('Не удалось зарегистрировать пользователя.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-page__card-wrap">
                <Card className="login-page__card" variant="borderless">
                    <Typography.Title level={2} className="login-page__card-title">
                        Регистрация
                    </Typography.Title>
                    <Typography.Text className="login-page__card-copy">
                        Создайте аккаунт, чтобы начать работу.
                    </Typography.Text>

                    <div className="login-page__form">
                        <label className="login-page__label" htmlFor="signup-email">
                            Email
                        </label>
                        <Input
                            id="signup-email"
                            size="large"
                            value={email}
                            placeholder="Введите email"
                            onChange={(event) => setEmail(event.target.value)}
                            onPressEnter={handleSignup}
                        />

                        <label className="login-page__label" htmlFor="signup-password">
                            Пароль
                        </label>
                        <Input.Password
                            id="signup-password"
                            size="large"
                            value={password}
                            placeholder="Введите пароль"
                            onChange={(event) => setPassword(event.target.value)}
                            onPressEnter={handleSignup}
                        />

                        <label className="login-page__label" htmlFor="signup-confirm-password">
                            Повторите пароль
                        </label>
                        <Input.Password
                            id="signup-confirm-password"
                            size="large"
                            value={confirmPassword}
                            placeholder="Повторите пароль"
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            onPressEnter={handleSignup}
                        />

                        {error ? <Alert title={error} type="error" showIcon /> : null}

                        <Button
                            block
                            type="primary"
                            loading={isSubmitting}
                            className="login-page__submit"
                            onClick={handleSignup}
                        >
                            Зарегистрироваться
                        </Button>
                    </div>

                    <Typography.Paragraph className="login-page__footer">
                        Уже есть аккаунт?{' '}
                        <Link to="/login" className="login-page__footer-link">
                            Войти
                        </Link>
                    </Typography.Paragraph>
                </Card>
            </div>
        </div>
    );
}

export default SignupPage;
