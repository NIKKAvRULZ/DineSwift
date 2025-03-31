import React from 'react';
import { Box } from '@mui/material';

const ScaleInOut = ({ children, scale = 1.02, duration = 0.2 }) => {
    return (
        <Box
            sx={{
                transition: `transform ${duration}s ease-in-out`,
                '&:hover': {
                    transform: `scale(${scale})`,
                },
                height: '100%',
                display: 'block',
                '& > *': {
                    height: '100%'
                }
            }}
        >
            {children}
        </Box>
    );
};

export default ScaleInOut;