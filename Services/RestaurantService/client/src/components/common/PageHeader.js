import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PageHeader = ({ 
    title, 
    subtitle, 
    actionLabel, 
    actionIcon: ActionIcon, 
    actionPath, 
    showBack, 
    onBack 
}) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                mb: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
            }}
        >
            {showBack && (
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={onBack}
                    sx={{ 
                        alignSelf: 'flex-start',
                        mb: 1,
                        color: theme.palette.text.secondary,
                        '&:hover': {
                            color: theme.palette.text.primary,
                        }
                    }}
                >
                    Back
                </Button>
            )}
            
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2
                }}
            >
                <Box>
                    <Typography 
                        variant="h4" 
                        component="h1"
                        sx={{ 
                            color: theme.palette.text.primary,
                            fontWeight: 'bold',
                            mb: subtitle ? 0.5 : 0
                        }}
                    >
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography 
                            variant="subtitle1"
                            sx={{ color: theme.palette.text.secondary }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>

                {actionLabel && actionPath && (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={ActionIcon && <ActionIcon />}
                        component={Link}
                        to={actionPath}
                        sx={{
                            boxShadow: 'none',
                            borderRadius: '8px',
                            px: 3,
                            height: '42px',
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
        </Box>
    );
};

export default PageHeader;