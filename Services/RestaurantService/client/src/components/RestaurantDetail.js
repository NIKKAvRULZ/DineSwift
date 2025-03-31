import React, { useState, useEffect } from 'react';
import { convertToLKR } from '../utils/currency';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Chip,
    Rating,
    Typography,
    useTheme
} from '@mui/material';
import axios from 'axios';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';

import PageHeader from './common/PageHeader';
import LoadingState from './common/LoadingState';
import EmptyState from './common/EmptyState';
import MenuItemCard from './common/MenuItemCard';
import ConfirmDialog from './common/ConfirmDialog';
import Notification from './common/Notification';

const apiUrl = 'http://localhost:5002';

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

const formatAddress = (address) => {
    if (!address) return '';
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zipCode) parts.push(address.zipCode);
    return parts.join(', ');
};

const RestaurantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [menuItemToDelete, setMenuItemToDelete] = useState(null);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotification({ ...notification, open: false });
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const restaurantResponse = await axios.get(`${apiUrl}/api/restaurants/${id}`);
            setRestaurant(restaurantResponse.data);
            
            const menuResponse = await axios.get(`${apiUrl}/api/restaurants/${id}/menu-items`);
            console.log('Fetched menu items:', menuResponse.data);
            setMenuItems(menuResponse.data);
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching restaurant details:', error);
            const errorMessage = error.response 
                ? `Error ${error.response.status}: ${error.response.data.message || error.message}` 
                : error.message;
            setError(errorMessage);
            setLoading(false);
            showNotification(errorMessage, 'error');
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleBack = () => {
        navigate('/');
    };

    const handleDeleteClick = (menuItem) => {
        setMenuItemToDelete(menuItem);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!menuItemToDelete) return;
        
        try {
            setLoading(true);
            await axios.delete(`${apiUrl}/api/menu-items/${menuItemToDelete._id}`);
            setDeleteDialogOpen(false);
            setMenuItemToDelete(null);
            showNotification('Menu item deleted successfully');
            fetchData();
        } catch (error) {
            console.error('Error deleting menu item:', error);
            const errorMessage = error.response 
                ? `Error ${error.response.status}: ${error.response.data.message || error.message}` 
                : error.message;
            setError(errorMessage);
            showNotification(errorMessage, 'error');
            setLoading(false);
            setDeleteDialogOpen(false);
        }
    };

    if (loading) {
        return <LoadingState message="Loading restaurant details..." />;
    }

    if (error) {
        return (
            <EmptyState
                title="Error Loading Restaurant"
                message={error}
                actionLabel="Back to Restaurants"
                actionPath="/"
            />
        );
    }

    if (!restaurant) {
        return (
            <EmptyState
                title="Restaurant Not Found"
                message="The restaurant you're looking for doesn't exist."
                actionLabel="Back to Restaurants"
                actionPath="/"
            />
        );
    }

    return (
        <Box sx={{ py: 3 }}>
            <PageHeader
                title={restaurant.name}
                showBack
                onBack={handleBack}
                actionLabel="Add Menu Item"
                actionPath={`/add-menu-item/${restaurant._id}`}
                actionIcon={AddIcon}
            />

            {/* Restaurant Image */}
            {restaurant.image && (
                <Box 
                    sx={{ 
                        width: '100%', 
                        height: 300, 
                        mb: 3,
                        borderRadius: 2,
                        overflow: 'hidden'
                    }}
                >
                    <img 
                        src={restaurant.image} 
                        alt={restaurant.name}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                </Box>
            )}

            {/* Restaurant Info */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating
                        value={restaurant.rating}
                        precision={0.5}
                        readOnly
                    />
                    <Typography variant="body1" sx={{ ml: 1, color: theme.palette.text.secondary }}>
                        {labels[restaurant.rating]}
                    </Typography>
                </Box>

                <Typography variant="h6" color="textSecondary" gutterBottom>
                    {restaurant.cuisine}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOnIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    <Typography variant="body1" color="textSecondary">
                        {formatAddress(restaurant.address)}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    <Chip 
                        label={`Min. Order: ${convertToLKR(restaurant.minOrder)}`}
                        color="primary" 
                        variant="outlined" 
                    />
                    <Chip 
                        icon={<AccessTimeIcon />}
                        label={`${restaurant.deliveryTime} mins delivery`} 
                        color="primary" 
                        variant="outlined" 
                    />
                    <Chip 
                        label={restaurant.isOpen ? 'Open' : 'Closed'} 
                        color={restaurant.isOpen ? 'success' : 'error'} 
                    />
                </Box>

                {/* Operating Hours */}
                <Typography variant="h6" gutterBottom>Operating Hours</Typography>
                <Grid container spacing={2}>
                    {Object.entries(restaurant.operatingHours || {}).map(([day, hours]) => (
                        <Grid item xs={12} sm={6} md={4} key={day}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography sx={{ textTransform: 'capitalize' }}>
                                    {day}
                                </Typography>
                                <Typography color="textSecondary">
                                    {hours.open} - {hours.close}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Menu Items */}
            <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
                Menu Items
            </Typography>

            {menuItems.length === 0 ? (
                <EmptyState
                    title="No Menu Items"
                    message="Start adding menu items to your restaurant!"
                    actionLabel="Add Menu Item"
                    actionPath={`/add-menu-item/${restaurant._id}`}
                />
            ) : (
                <Box>
                    {['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Sides', 'Specials'].map((category) => {
                        const categoryItems = menuItems.filter(item => item.category === category);
                        if (categoryItems.length === 0) return null;
                        
                        return (
                            <Box key={category} sx={{ mb: 4 }}>
                                <Typography variant="h6" gutterBottom sx={{ mt: 2, color: theme.palette.primary.main }}>
                                    {category}
                                </Typography>
                                <Grid container spacing={3}>
                                    {categoryItems.map((item) => (
                                        <Grid item xs={12} sm={6} md={4} key={item._id}>
                                            <MenuItemCard
                                                menuItem={item}
                                                onDelete={handleDeleteClick}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        );
                    })}
                </Box>
            )}

            <ConfirmDialog
                open={deleteDialogOpen}
                title="Delete Menu Item"
                message={`Are you sure you want to delete "${menuItemToDelete?.name}"? This action cannot be undone.`}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteDialogOpen(false)}
            />

            <Notification
                open={notification.open}
                message={notification.message}
                severity={notification.severity}
                onClose={handleCloseNotification}
            />
        </Box>
    );
};

export default RestaurantDetail;