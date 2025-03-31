import React from 'react';
import { convertToLKR } from '../../utils/currency';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    IconButton,
    Button,
    Chip,
    Grid,
    useTheme,
    Rating
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import { useNavigate } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';

const MenuItemCard = ({ menuItem, onDelete }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    
    console.log('MenuItemCard render:', {
        name: menuItem.name,
        discount: menuItem.discount,
        price: menuItem.price
    });

    return (
        <Card
            elevation={3}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
            }}
        >
            {menuItem.discount > 0 && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: '#ff3d00',
                        color: 'white',
                        padding: '6px 12px',
                        borderBottomLeftRadius: '8px',
                        fontWeight: 'bold',
                        zIndex: 100,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        fontSize: '0.875rem',
                        transform: 'translateY(0)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {`${menuItem.discount}% OFF`}
                </Box>
            )}
            {menuItem.image && (
                <Box sx={{
                    position: 'relative',
                    paddingTop: '75%', // 4:3 aspect ratio
                    width: '100%'
                }}>
                    <CardMedia
                        component="img"
                        image={menuItem.image}
                        alt={menuItem.name}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            borderTopLeftRadius: theme.shape.borderRadius,
                            borderTopRightRadius: theme.shape.borderRadius,
                            bgcolor: 'background.default'
                        }}
                    />
                </Box>
            )}
            <CardContent sx={{ flexGrow: 1, pb: 2 }}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    mb: 1
                }}>
                    <Typography 
                        variant="h6" 
                        component="h3"
                        sx={{
                            fontWeight: 600,
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {menuItem.name}
                    </Typography>
                    {menuItem.isSpicy && (
                        <LocalFireDepartmentIcon 
                            color="error" 
                            sx={{ ml: 1, fontSize: 20 }}
                        />
                    )}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography
                        variant="h6"
                        color="primary"
                        sx={{ fontWeight: 600 }}
                    >
                        {convertToLKR(menuItem.price)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating
                            value={menuItem.rating}
                            readOnly
                            precision={0.5}
                            size="small"
                            emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({menuItem.rating.toFixed(1)})
                        </Typography>
                    </Box>
                </Box>
                <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    paragraph
                    sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '40px'
                    }}
                >
                    {menuItem.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <Chip 
                        icon={<FastfoodIcon />}
                        label={menuItem.category}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: '6px' }}
                    />
                </Box>
            </CardContent>
            <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
                <Grid container spacing={1}>
                    <Grid item xs={6}>
                        <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            color="info"
                            startIcon={<EditIcon />}
                            onClick={() => navigate(`/edit-menu-item/${menuItem._id}`)}
                            sx={{
                                borderRadius: 1,
                                textTransform: 'none'
                            }}
                        >
                            Edit
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => onDelete(menuItem)}
                            sx={{
                                borderRadius: 1,
                                textTransform: 'none'
                            }}
                        >
                            Delete
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Card>
    );
};

export default MenuItemCard;