import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

const LoadingState = ({ message = 'Loading...' }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '300px',
                gap: 2,
                backgroundColor: theme.palette.background.paper,
                borderRadius: theme.shape.borderRadius * 2,
                p: 4,
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
            }}
        >
            <CircularProgress 
                size={48}
                sx={{
                    color: theme.palette.primary.main,
                    '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                    },
                }}
            />
            <Typography
                variant="h6"
                color="textSecondary"
                sx={{
                    fontWeight: 500,
                    textAlign: 'center',
                }}
            >
                {message}
            </Typography>
        </Box>
    );
};

export default LoadingState;