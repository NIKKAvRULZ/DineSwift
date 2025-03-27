import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Container,
    Alert,
    Snackbar,
    CircularProgress,
    InputAdornment
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import axios from 'axios';

const apiUrl = 'http://localhost:5002';

const EditMenuItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [menuItem, setMenuItem] = useState(null);
    const [restaurant, setRestaurant] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
    });
    
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    useEffect(() => {
        const fetchMenuItem = async () => {
            try {
                setFetchLoading(true);
                const response = await axios.get(`${apiUrl}/api/menu-items/${id}`);
                const { name, price, restaurantId } = response.data;
                
                setMenuItem(response.data);
                setFormData({ 
                    name, 
                    price: price.toString()
                });
                
                // Get restaurant details
                if (restaurantId && restaurantId._id) {
                    const restaurantResponse = await axios.get(`${apiUrl}/api/restaurants/${restaurantId._id}`);
                    setRestaurant(restaurantResponse.data);
                }
                
                setFetchLoading(false);
            } catch (error) {
                console.error('Error fetching menu item:', error);
                setErrorMessage('Could not fetch menu item details');
                setFetchLoading(false);
            }
        };
        
        fetchMenuItem();
    }, [id]);
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate price is a number
        if (isNaN(parseFloat(formData.price))) {
            setErrorMessage('Price must be a valid number');
            return;
        }
        
        try {
            setLoading(true);
            setErrorMessage('');
            
            const data = { 
                ...formData, 
                price: parseFloat(formData.price) 
            };
            
            console.log('Updating menu item data:', data);
            const response = await axios.put(`${apiUrl}/api/menu-items/${id}`, data);
            console.log('Menu item updated:', response.data);
            
            setSuccessMessage('Menu item updated successfully!');
            setLoading(false);
            
            // Navigate back to restaurant detail after 2 seconds
            setTimeout(() => {
                if (restaurant) {
                    navigate(`/restaurant/${restaurant._id}`);
                } else if (menuItem && menuItem.restaurantId) {
                    navigate(`/restaurant/${menuItem.restaurantId._id || menuItem.restaurantId}`);
                } else {
                    navigate('/');
                }
            }, 2000);
        } catch (error) {
            setLoading(false);
            console.error('Error updating menu item:', error);
            const errorMsg = error.response 
                ? `Error ${error.response.status}: ${error.response.data.message || error.message}` 
                : error.message;
            setErrorMessage(errorMsg);
        }
    };
    
    const handleBack = () => {
        if (restaurant) {
            navigate(`/restaurant/${restaurant._id}`);
        } else if (menuItem && menuItem.restaurantId) {
            navigate(`/restaurant/${menuItem.restaurantId._id || menuItem.restaurantId}`);
        } else {
            navigate('/');
        }
    };
    
    if (fetchLoading) {
        return (
            <Container>
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }
    
    if (!menuItem) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 2 }}>
                    Menu item not found
                </Alert>
                <Button
                    variant="contained"
                    onClick={() => navigate('/')}
                    sx={{ mt: 2 }}
                >
                    Back to Restaurant List
                </Button>
            </Container>
        );
    }
    
    return (
        <Container maxWidth="sm">
            <Box sx={{ my: 4 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{ mb: 2 }}
                >
                    Back to Restaurant
                </Button>
            </Box>
            
            <Paper elevation={3} sx={{ p: 3, my: 2 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <EditIcon sx={{ mr: 1 }} />
                    <FastfoodIcon sx={{ mr: 1 }} />
                    Edit Menu Item
                </Typography>
                
                {restaurant && (
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        Restaurant: {restaurant.name}
                    </Typography>
                )}
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                        fullWidth
                        label="Item Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        margin="normal"
                        disabled={loading}
                    />
                    
                    <TextField
                        fullWidth
                        label="Price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        margin="normal"
                        disabled={loading}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">$</InputAdornment>
                            )
                        }}
                    />
                    
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        sx={{ mt: 3 }}
                        fullWidth
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Update Menu Item'}
                    </Button>
                </Box>
            </Paper>
            
            <Snackbar 
                open={!!successMessage} 
                autoHideDuration={6000} 
                onClose={() => setSuccessMessage('')}
            >
                <Alert severity="success" onClose={() => setSuccessMessage('')}>
                    {successMessage}
                </Alert>
            </Snackbar>
            
            <Snackbar 
                open={!!errorMessage} 
                autoHideDuration={6000} 
                onClose={() => setErrorMessage('')}
            >
                <Alert severity="error" onClose={() => setErrorMessage('')}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default EditMenuItem; 