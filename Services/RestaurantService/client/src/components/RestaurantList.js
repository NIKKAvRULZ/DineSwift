import React, { useState, useEffect } from 'react';
import { 
    Box,
    Grid,
    useTheme
} from '@mui/material';
import axios from 'axios';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RestaurantIcon from '@mui/icons-material/Restaurant';

import PageHeader from './common/PageHeader';
import LoadingState from './common/LoadingState';
import EmptyState from './common/EmptyState';
import RestaurantCard from './common/RestaurantCard';
import ConfirmDialog from './common/ConfirmDialog';
import Notification from './common/Notification';

const apiUrl = 'http://localhost:5002';

const RestaurantList = () => {
    const theme = useTheme();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [restaurantToDelete, setRestaurantToDelete] = useState(null);
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

    useEffect(() => {
        fetchRestaurants();
    }, []);
    
    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${apiUrl}/api/restaurants`);
            setRestaurants(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            const errorMessage = error.response 
                ? `Error ${error.response.status}: ${error.response.data.message || error.message}` 
                : error.message;
            setError(errorMessage);
            showNotification(errorMessage, 'error');
            setLoading(false);
        }
    };

    const handleDeleteClick = (restaurant) => {
        setRestaurantToDelete(restaurant);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!restaurantToDelete) return;
        
        try {
            setLoading(true);
            await axios.delete(`${apiUrl}/api/restaurants/${restaurantToDelete._id}`);
            setDeleteDialogOpen(false);
            setRestaurantToDelete(null);
            showNotification('Restaurant deleted successfully');
            fetchRestaurants();
        } catch (error) {
            console.error('Error deleting restaurant:', error);
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
        return <LoadingState message="Loading restaurants..." />;
    }

    if (error) {
        return (
            <EmptyState
                title="Error Loading Restaurants"
                message={error}
                icon={RestaurantIcon}
            />
        );
    }

    if (!loading && !error && restaurants.length === 0) {
        return (
            <EmptyState
                title="No Restaurants Found"
                message="Get started by adding your first restaurant!"
                actionLabel="Add Restaurant"
                actionPath="/add-restaurant"
                icon={RestaurantIcon}
            />
        );
    }

    return (
        <Box sx={{ py: 3 }}>
            <PageHeader
                title="Restaurants"
                subtitle="Manage your restaurant listings"
                actionLabel="Add Restaurant"
                actionPath="/add-restaurant"
                actionIcon={AddCircleIcon}
            />
            
            <Grid container spacing={3}>
                {restaurants.map((restaurant) => (
                    <Grid item xs={12} sm={6} md={4} key={restaurant._id}>
                        <RestaurantCard 
                            restaurant={restaurant}
                            onDelete={handleDeleteClick}
                        />
                    </Grid>
                ))}
            </Grid>

            <ConfirmDialog
                open={deleteDialogOpen}
                title="Delete Restaurant"
                message={`Are you sure you want to delete "${restaurantToDelete?.name}"? This will also delete all associated menu items and cannot be undone.`}
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

export default RestaurantList;