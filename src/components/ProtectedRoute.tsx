import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { Navigate, Outlet } from 'react-router';
import { getCurrentUser } from '../api/auth';

function ProtectedRoute() {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        let isActive = true;

        const checkAuthorization = async () => {
            try {
                await getCurrentUser();

                if (isActive) {
                    setIsAuthorized(true);
                }
            } catch {
                if (isActive) {
                    setIsAuthorized(false);
                }
            }
        };

        void checkAuthorization();

        return () => {
            isActive = false;
        };
    }, []);

    if (isAuthorized === null) {
        return (
            <div
                style={{
                    minHeight: '100svh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Spin size="large" />
            </div>
        );
    }

    if (!isAuthorized) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
