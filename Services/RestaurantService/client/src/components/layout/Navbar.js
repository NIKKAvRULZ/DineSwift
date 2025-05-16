import React from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    IconButton, 
    Box, 
    Button,
    Container,
    useScrollTrigger,
    Slide
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { Link, useLocation } from 'react-router-dom';

const HideOnScroll = (props) => {
    const { children } = props;
    const trigger = useScrollTrigger();

    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
};

const Navbar = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <HideOnScroll>
            <AppBar 
                position="sticky" 
                sx={{ 
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: 'none',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <IconButton
                            component={Link}
                            to="/"
                            sx={{ mr: 2 }}
                            color="primary"
                        >
                            <RestaurantIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            component={Link}
                            to="/"
                            sx={{
                                flexGrow: 1,
                                textDecoration: 'none',
                                color: 'text.primary',
                                fontWeight: 600
                            }}
                        >
                            Restaurant Manager
                        </Typography>
                        {/* Add Restaurant button removed */}
                    </Toolbar>
                </Container>
            </AppBar>
        </HideOnScroll>
    );
};

export default Navbar;
