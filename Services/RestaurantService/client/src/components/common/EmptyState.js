import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { Link } from 'react-router-dom';

const EmptyState = ({
    title = 'No Data Found',
    message = 'There are no items to display at the moment.',
    actionLabel,
    actionPath,
    icon: CustomIcon
}) => {
    const theme = useTheme();
    const Icon = CustomIcon || RestaurantIcon;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                textAlign: 'center',
                backgroundColor: theme.palette.background.paper,
                borderRadius: theme.shape.borderRadius * 2,
                p: 4,
                gap: 2,
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
            }}
        >
            <Icon 
                sx={{
                    fontSize: 64,
                    color: theme.palette.primary.main,
                    opacity: 0.7,
                    mb: 2
                }}
            />
            <Typography
                variant="h5"
                component="h2"
                sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                }}
            >
                {title}
            </Typography>
            <Typography
                variant="body1"
                sx={{
                    color: theme.palette.text.secondary,
                    maxWidth: '500px',
                    mb: actionLabel ? 2 : 0
                }}
            >
                {message}
            </Typography>
            {actionLabel && actionPath && (
                <Button
                    variant="contained"
                    component={Link}
                    to={actionPath}
                    sx={{
                        mt: 2,
                        borderRadius: '8px',
                        px: 4,
                        py: 1,
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: 'none',
                            backgroundColor: theme.palette.primary.dark,
                        }
                    }}
                >
                    {actionLabel}
                </Button>
            )}
        </Box>
    );
};

export default EmptyState;