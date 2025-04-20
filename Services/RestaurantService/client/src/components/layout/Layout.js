import React from 'react';
import { Box, Container, useTheme } from '@mui/material';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundColor: theme.palette.background.default,
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Navbar />
            <Box
                component="main"
                sx={{
                    flex: 1,
                    py: 4,
                    backgroundColor: theme.palette.grey[50],
                }}
            >
                <Container maxWidth="xl" sx={{ height: '100%' }}>
                    {children}
                </Container>
            </Box>
            <Box
                component="footer"
                sx={{
                    py: 3,
                    px: 2,
                    mt: 'auto',
                    backgroundColor: theme.palette.background.paper,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    textAlign: 'center',
                    color: theme.palette.text.secondary,
                }}
            >
                © {new Date().getFullYear()} Restaurant Manager. All rights reserved.
            </Box>
        </Box>
    );
};

export default Layout;