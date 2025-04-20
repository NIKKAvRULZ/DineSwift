import React from 'react';
import { convertToLKR } from '../../utils/currency';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    Chip,
    Button,
    Rating,
    IconButton,
    Grid,
    useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FastfoodIcon from '@mui/icons-material/Fastfood';

const labels = {
    0: 'Unrated',
    0.5: 'Poor',
    1: 'Poor+',
    1.5: 'Fair',
    2: 'Fair+',
    2.5: 'Good',
    3: 'Good+',
    3.5: 'Very Good',
    4: 'Very Good+',
    4.5: 'Excellent',
    5: 'Excellent+'
};

const RestaurantCard = ({ restaurant, onDelete }) => {
    const theme = useTheme();

    const formatAddress = (address) => {
        if (!address) return '';
        const parts = [];
        if (address.street) parts.push(address.street);
        if (address.city) parts.push(address.city);
        return parts.join(', ');
    };

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'visible'
            }}
        >
            {restaurant.menuItems?.some(item => item.discount > 0) && (
                <Chip
                    label="Today’s Offer"
                    color="error"
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        fontWeight: 'bold',
                        zIndex: 10,
                        fontSize: '0.875rem',
                        boxShadow: 3,
                        '& .MuiChip-label': {
                            px: 1,
                        }
                    }}
                />
            )}
            {restaurant.image && (
                <CardMedia
                    component="img"
                    height="200"
                    image={restaurant.image}
                    alt={restaurant.name}
                    sx={{
                        objectFit: 'cover',
                        borderTopLeftRadius: theme.shape.borderRadius,
                        borderTopRightRadius: theme.shape.borderRadius,
                    }}
                />
            )}
            <CardContent sx={{ flexGrow: 1, pb: 0 }}>
                <Typography 
                    variant="h6" 
                    component="h2" 
                    gutterBottom
                    sx={{ 
                        fontWeight: 600,
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}
                >
                    {restaurant.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating
                        value={restaurant.rating}
                        precision={0.5}
                        size="small"
                        readOnly
                    />
                    <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ ml: 1 }}
                    >
                        {labels[restaurant.rating]}
                    </Typography>
                </Box>
                <Typography 
                    variant="subtitle1" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}
                >
                    {restaurant.cuisine}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon sx={{ mr: 1, fontSize: 'small', color: theme.palette.text.secondary }} />
                    <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {formatAddress(restaurant.address)}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip 
                        size="small"
                        label={`${convertToLKR(restaurant.minOrder)} min`}
                        color="primary" 
                        variant="outlined"
                    />
                    <Chip
                        size="small"
                        icon={<AccessTimeIcon />}
                        label={`${restaurant.deliveryTime} min`}
                        variant="outlined"
                    />
                    <Chip
                        size="small"
                        label={restaurant.isOpen ? 'Open' : 'Closed'}
                        color={restaurant.isOpen ? 'success' : 'error'}
                    />
                </Box>
            </CardContent>
            <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Button 
                            fullWidth
                            component={Link} 
                            to={`/restaurant/${restaurant._id}`}
                            variant="outlined"
                        >
                            View Details
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                                size="small"
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                component={Link}
                                to={`/add-menu-item/${restaurant._id}`}
                                sx={{ flex: 1 }}
                            >
                                Add Menu
                            </Button>
                            <IconButton 
                                size="small"
                                component={Link}
                                to={`/edit-restaurant/${restaurant._id}`}
                                color="info"
                                sx={{ 
                                    border: `1px solid ${theme.palette.info.main}`,
                                    borderRadius: 1
                                }}
                            >
                                <EditIcon />
                            </IconButton>
                            <IconButton 
                                size="small"
                                onClick={() => onDelete(restaurant)}
                                color="error"
                                sx={{ 
                                    border: `1px solid ${theme.palette.error.main}`,
                                    borderRadius: 1
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Card>
    );
};

export default RestaurantCard;