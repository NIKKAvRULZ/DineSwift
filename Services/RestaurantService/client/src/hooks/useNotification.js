import { useState } from 'react';

const useNotification = () => {
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const showNotification = (message, severity = 'success') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const hideNotification = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotification(prev => ({
            ...prev,
            open: false
        }));
    };

    return {
        notification,
        showNotification,
        hideNotification
    };
};

export default useNotification;