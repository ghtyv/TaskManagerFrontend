import {useState} from 'react';
import axios from 'axios';
import {useNavigate} from "react-router";

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            if (!email || !password) {
                setError('Please enter both email and password.');
                return;
            }

            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);

            await axios.post('http://localhost:8080/auth/login', formData
            );

            navigate('/tasks');
        } catch (error) {
            setError('Invalid email or password.');
        }
    };

    return (
        <div>
            <h1>Login Page</h1>

            <input
                placeholder='Email address' id='email' value={email} type='email'
                onChange={(event) => setEmail(event.target.value)} />

            <input
                placeholder='Password' id='password' type='password' value={password}
                onChange={(event) => setPassword(event.target.value)} />

            {error && <p>{error}</p>} {/* Render error message if exists */}

            <button style={{ height:'50px',width: '100%' }}
                    type="button"
                    onClick={handleLogin}>Sign in</button>
            <div>
                <p>Not a member? <a href="/signup">Register</a></p>
            </div>
        </div>
    );
}

export default LoginPage;