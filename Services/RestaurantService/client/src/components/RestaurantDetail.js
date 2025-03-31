import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Container,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    ListItemAvatar,
    Avatar,
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
    DialogTitle,
    Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import axios from 'axios';

const apiUrl = 'http://localhost:5002';

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
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [menuItemToDelete, setMenuItemToDelete] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const restaurantResponse = await axios.get(`${apiUrl}/api/restaurants/${id}`);
            setRestaurant(restaurantResponse.data);
            
            const menuResponse = await axios.get(`${apiUrl}/api/restaurants/${id}/menu-items`);
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
        <Container maxWidth="xl" disableGutters sx={{ px: 2 }}>
            <Box sx={{ my: 4 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{ mb: 2 }}
                >
                    Back to Restaurants
                </Button>
                
                <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
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

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                            <Typography variant="h4" component="h1" gutterBottom>
                                {restaurant.name}
                            </Typography>
                            <Typography variant="h6" color="textSecondary" gutterBottom>
                                {restaurant.cuisine}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                <Chip 
                                    label={`Min. Order: $${restaurant.minOrder}`} 
                                    color="primary" 
                                    variant="outlined" 
                                />
                                <Chip 
                                    label={`${restaurant.deliveryTime} mins delivery`} 
                                    color="primary" 
                                    variant="outlined" 
                                />
                                <Chip 
                                    label={restaurant.isOpen ? 'Open' : 'Closed'} 
                                    color={restaurant.isOpen ? 'success' : 'error'} 
                                />
                            </Box>
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

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Address
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    {formatAddress(restaurant.address)}
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Box>
                                <Typography variant="h6" gutterBottom>Operating Hours</Typography>
                                {Object.entries(restaurant.operatingHours || {}).map(([day, hours]) => (
                                    <Typography key={day} variant="body2" sx={{ mb: 0.5 }}>
                                        <strong style={{ textTransform: 'capitalize' }}>{day}:</strong>
                                        {' '}{hours.open} - {hours.close}
                                    </Typography>
                                ))}
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
                                Menu Items
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="primary"
                                startIcon={<AddIcon />}
                                component={Link}
                                to={`/add-menu-item/${restaurant._id}`}
                                size="medium"
                            >
                                Add Menu Item
                            </Button>
                        </Box>
                        
                        {menuItems.length === 0 ? (
                            <Typography color="textSecondary">
                                No menu items available. Add some menu items to get started!
                            </Typography>
                        ) : (
                            <Grid container spacing={2}>
                                {menuItems.map((item) => (
                                    <Grid item xs={12} sm={6} md={4} key={item._id}>
                                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            {item.image && (
                                                <CardMedia
                                                    component="img"
                                                    height="140"
                                                    image={item.image}
                                                    alt={item.name}
                                                />
                                            )}
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <Typography variant="h6" component="h3">
                                                        {item.name}
                                                    </Typography>
                                                    {item.isSpicy && (
                                                        <LocalFireDepartmentIcon color="error" />
                                                    )}
                                                </Box>
                                                <Typography variant="subtitle1" color="primary" gutterBottom>
                                                    ${item.price.toFixed(2)}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    {item.description}
                                                </Typography>
                                                <Chip 
                                                    icon={<FastfoodIcon />}
                                                    label={item.category}
                                                    size="small"
                                                    sx={{ mt: 1 }}
                                                />
                                            </CardContent>
                                            <Box sx={{ p: 2, mt: 'auto' }}>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={6}>
                                                        <Button
                                                            fullWidth
                                                            size="small"
                                                            onClick={() => navigate(`/edit-menu-item/${item._id}`)}
                                                            startIcon={<EditIcon />}
                                                            variant="outlined"
                                                            color="info"
                                                        >
                                                            Edit
                                                        </Button>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Button
                                                            fullWidth
                                                            size="small"
                                                            onClick={() => handleDeleteClick(item)}
                                                            startIcon={<DeleteIcon />}
                                                            variant="outlined"
                                                            color="error"
                                                        >
                                                            Delete
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
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