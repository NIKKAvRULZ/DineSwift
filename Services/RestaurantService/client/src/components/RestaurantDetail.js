import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Divider,
    Paper,
    Alert,
    CircularProgress,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

const apiUrl = 'http://localhost:5002';

const RestaurantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [menuItemToDelete, setMenuItemToDelete] = useState(null);

    const fetchData = async () => {
        try {
            console.log(`Fetching restaurant details for ID: ${id}`);
            setLoading(true);
            setError(null);
            
            const restaurantResponse = await axios.get(`${apiUrl}/api/restaurants/${id}`);
            console.log('Restaurant data:', restaurantResponse.data);
            setRestaurant(restaurantResponse.data);
            
            const menuResponse = await axios.get(`${apiUrl}/api/restaurants/${id}/menu-items`);
            console.log('Menu items data:', menuResponse.data);
            setMenuItems(menuResponse.data);
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching restaurant details:', error);
            const errorMessage = error.response 
                ? `Error ${error.response.status}: ${error.response.data.message || error.message}` 
                : error.message;
            setError(errorMessage);
            setLoading(false);
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
            // Refresh the data
            fetchData();
        } catch (error) {
            console.error('Error deleting menu item:', error);
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
        setMenuItemToDelete(null);
    };

    if (loading) {
        return (
            <Container>
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
                <Button
                    variant="contained"
                    onClick={handleBack}
                    sx={{ mt: 2 }}
                >
                    Back to Restaurant List
                </Button>
            </Container>
        );
    }

    if (!restaurant) {
        return (
            <Container>
                <Alert severity="warning" sx={{ mt: 2 }}>
                    Restaurant not found
                </Alert>
                <Button
                    variant="contained"
                    onClick={handleBack}
                    sx={{ mt: 2 }}
                >
                    Back to Restaurant List
                </Button>
            </Container>
        );
    }

    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{ mb: 2 }}
                >
                    Back to Restaurants
                </Button>
                
                <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                            <Typography variant="h4" component="h1" gutterBottom>
                                {restaurant.name}
                            </Typography>
                            <Typography variant="h6" color="textSecondary" gutterBottom>
                                {restaurant.location}
                            </Typography>
                        </Box>
                        <Button 
                            variant="contained" 
                            color="info"
                            startIcon={<EditIcon />}
                            component={Link}
                            to={`/edit-restaurant/${restaurant._id}`}
                        >
                            Edit Restaurant
                        </Button>
                    </Box>
                </Paper>

                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5" gutterBottom>
                                Menu Items
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="primary"
                                startIcon={<AddIcon />}
                                component={Link}
                                to={`/add-menu-item/${restaurant._id}`}
                            >
                                Add Menu Item
                            </Button>
                        </Box>
                        
                        {menuItems.length === 0 ? (
                            <Typography color="textSecondary">
                                No menu items available. Add some menu items to get started!
                            </Typography>
                        ) : (
                            <List>
                                {menuItems.map((item, index) => (
                                    <React.Fragment key={item._id}>
                                        <ListItem>
                                            <ListItemText
                                                primary={item.name}
                                                secondary={`$${item.price.toFixed(2)}`}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton 
                                                    edge="end" 
                                                    aria-label="edit"
                                                    onClick={() => navigate(`/edit-menu-item/${item._id}`)}
                                                    color="info"
                                                    sx={{ mr: 1 }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton 
                                                    edge="end" 
                                                    aria-label="delete"
                                                    onClick={() => handleDeleteClick(item)}
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        {index < menuItems.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </CardContent>
                </Card>
            </Box>
            
            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirm Menu Item Deletion"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete the menu item "{menuItemToDelete?.name}"? 
                        This action cannot be undone.
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

export default RestaurantDetail; 