import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Grid, 
    Card, 
    CardContent, 
    Typography, 
    CardActions, 
    Button,
    Box,
    Alert,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const apiUrl = 'http://localhost:5002';

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [restaurantToDelete, setRestaurantToDelete] = useState(null);

    useEffect(() => {
        fetchRestaurants();
    }, []);
    
    const fetchRestaurants = async () => {
        try {
            console.log('Fetching restaurants from API');
            setLoading(true);
            setError(null);
            const response = await axios.get(`${apiUrl}/api/restaurants`);
            console.log('Response data:', response.data);
            setRestaurants(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            const errorMessage = error.response 
                ? `Error ${error.response.status}: ${error.response.data.message || error.message}` 
                : error.message;
            setError(errorMessage);
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
            // Refresh the restaurant list
            fetchRestaurants();
        } catch (error) {
            console.error('Error deleting restaurant:', error);
            const errorMessage = error.response 
                ? `Error ${error.response.status}: ${error.response.data.message || error.message}` 
                : error.message;
            setError(errorMessage);
            setLoading(false);
            setDeleteDialogOpen(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setRestaurantToDelete(null);
    };

    return (
        <Container maxWidth="xl" disableGutters sx={{ px: 2 }}>
            <Box sx={{ my: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
                        <RestaurantIcon sx={{ mr: 1 }} />
                        Restaurants
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddCircleIcon />}
                        component={Link}
                        to="/add-restaurant"
                        size="large"
                    >
                        Add New Restaurant
                    </Button>
                </Box>
                
                {loading && (
                    <Box display="flex" justifyContent="center" my={4}>
                        <CircularProgress />
                    </Box>
                )}
                
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                
                {!loading && !error && restaurants.length === 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        No restaurants found. Try adding a restaurant first.
                    </Alert>
                )}
                
                <Grid container spacing={3}>
                    {restaurants.map((restaurant) => (
                        <Grid item xs={12} sm={12} md={6} lg={4} key={restaurant._id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h5" component="h2">
                                        {restaurant.name}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        {restaurant.location}
                                    </Typography>
                                    <Typography variant="body2" component="p">
                                        Menu Items: {restaurant.menuItems?.length || 0}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                                    <Button 
                                        size="small" 
                                        component={Link} 
                                        to={`/restaurant/${restaurant._id}`}
                                        variant="outlined"
                                    >
                                        View Details
                                    </Button>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button 
                                            size="small" 
                                            component={Link}
                                            to={`/add-menu-item/${restaurant._id}`}
                                            color="primary"
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                        >
                                            Add Menu
                                        </Button>
                                        <Button 
                                            size="small"
                                            component={Link}
                                            to={`/edit-restaurant/${restaurant._id}`}
                                            color="info"
                                            variant="contained"
                                            startIcon={<EditIcon />}
                                        >
                                            Edit
                                        </Button>
                                        <Button 
                                            size="small"
                                            color="error"
                                            variant="contained"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleDeleteClick(restaurant)}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
            
            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirm Restaurant Deletion"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete the restaurant "{restaurantToDelete?.name}"? 
                        This will also delete all associated menu items and cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} color="primary">Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default RestaurantList; 