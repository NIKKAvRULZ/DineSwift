import React from 'react';
import { AppBar, Toolbar, Typography, Container, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const Navbar = () => {
    return (
        <AppBar position="static" sx={{ mb: 4 }}>
            <Container>
                <Toolbar disableGutters>
                    <RestaurantIcon sx={{ mr: 1 }} />
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            textDecoration: 'none',
                            color: 'inherit'
                        }}
                    >
                        DineSwift Restaurant Service
                    </Typography>
                    <Box>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/"
                            sx={{ mr: 1 }}
                        >
                            Restaurants
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar; 