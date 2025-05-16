import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    useTheme,
    TextField,
    MenuItem,
    Stack
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
    const [searchTerm, setSearchTerm] = useState('');
    const [cuisines, setCuisines] = useState([]);
    const [selectedCuisine, setSelectedCuisine] = useState('');
    const [selectedRating, setSelectedRating] = useState('');
    
    const ratingOptions = [
        { value: '', label: 'All Ratings' },
        { value: '4', label: '4+ Stars' },
        { value: '3', label: '3+ Stars' },
        { value: '2', label: '2+ Stars' },
        { value: '1', label: '1+ Star' }
    ];
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Update restaurants when filters change
    useEffect(() => {
        fetchRestaurants();
    }, [searchTerm, selectedCuisine, selectedRating]);

    // Initial data fetch
    useEffect(() => {
        fetchCuisines();
    }, []);

    // Handle filter changes - just update state, useEffect will trigger the fetch
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCuisineChange = (e) => {
        setSelectedCuisine(e.target.value);
    };

    const handleRatingChange = (e) => {
        setSelectedRating(e.target.value);
    };

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

    const fetchCuisines = async () => {
        try {
            // Updated URL to match the backend route definition
            const response = await axios.get(`${apiUrl}/api/cuisines`);
            console.log('Fetched cuisines:', response.data);
            setCuisines(response.data);
        } catch (error) {
            console.error('Error fetching cuisines:', error);
            showNotification('Error fetching cuisines', 'error');
        }
    };

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            setError(null);
            
            let url = `${apiUrl}/api/restaurants`;
            const params = new URLSearchParams();
            
            if (searchTerm) {
                params.append('search', searchTerm);
            }
            if (selectedCuisine) {
                params.append('cuisine', selectedCuisine);
                console.log('Filtering by cuisine:', selectedCuisine);
            }
            if (selectedRating) {
                params.append('minRating', selectedRating);
            }
            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
            }

            console.log('Fetching restaurants with URL:', url);
            const response = await axios.get(url);
            
            // Trust the server-side filtering and use the response directly
            let filteredRestaurants = response.data;
        
            // Log the results for debugging
            console.log(`Server returned ${filteredRestaurants.length} restaurants`);
        
            if (selectedCuisine && filteredRestaurants.length === 0) {
                console.log(`No restaurants found with cuisine: ${selectedCuisine}`);
                showNotification(`No restaurants found with cuisine: ${selectedCuisine}`, 'info');
            }
            setRestaurants(filteredRestaurants);
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

            <Box sx={{ mb: 3 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        fullWidth
                        label="Search restaurants"
                        variant="outlined"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Type to search..."
                        size="small"
                    />
                    <TextField
                        select
                        label="Filter by cuisine"
                        value={selectedCuisine}
                        onChange={handleCuisineChange}
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: 160 }}
                    >
                        <MenuItem value="">All Cuisines</MenuItem>
                        {cuisines.map((cuisine) => (
                            <MenuItem key={cuisine} value={cuisine}>
                                {cuisine}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Filter by rating"
                        value={selectedRating}
                        onChange={handleRatingChange}
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: 160 }}
                    >
                        {ratingOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Stack>
            </Box>
            
            <Grid container spacing={3}>
                {loading ? (
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', my: 4 }}>
                            <LoadingState message="Loading restaurants..." />
                        </Box>
                    </Grid>
                ) : (
                    restaurants.map((restaurant) => (
                        <Grid item xs={12} sm={6} md={4} key={restaurant._id}>
                            <RestaurantCard
                                restaurant={restaurant}
                                onDelete={handleDeleteClick}
                            />
                        </Grid>
                    ))
                )}
            </Grid>

            <ConfirmDialog
                open={deleteDialogOpen}
                title="Delete Restaurant"
                message={
                    <>
                        <Box sx={{ mb: 2 }}>
                            Are you sure you want to delete "<strong>{restaurantToDelete?.name}</strong>"?
                        </Box>
                        <Box sx={{ color: 'warning.main', mb: 1 }}>
                            This action will:
                        </Box>
                        <ul>
                            <li>Remove all restaurant data</li>
                            <li>Delete all associated menu items</li>
                            <li>Remove any related reviews</li>
                        </ul>
                        <Box sx={{ mt: 2, color: 'error.main', fontWeight: 'bold' }}>
                            This action cannot be undone.
                        </Box>
                    </>
                }
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteDialogOpen(false)}
                confirmButtonText="Delete Restaurant"
                confirmButtonColor="error"
                cancelButtonText="Cancel"
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