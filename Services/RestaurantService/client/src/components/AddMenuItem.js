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
    InputAdornment,
    IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import axios from 'axios';

const apiUrl = 'http://localhost:5002';

const AddMenuItem = () => {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
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
        const fetchRestaurant = async () => {
            try {
                setFetchLoading(true);
                const response = await axios.get(`${apiUrl}/api/restaurants/${restaurantId}`);
                setRestaurant(response.data);
                setFetchLoading(false);
            } catch (error) {
                console.error('Error fetching restaurant:', error);
                setErrorMessage('Could not fetch restaurant details');
                setFetchLoading(false);
            }
        };
        
        fetchRestaurant();
    }, [restaurantId]);
    
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
            
            console.log('Submitting menu item data:', data);
            const response = await axios.post(`${apiUrl}/api/restaurants/${restaurantId}/menu-items`, data);
            console.log('Menu item added:', response.data);
            
            setSuccessMessage('Menu item added successfully!');
            setFormData({ name: '', price: '' });
            setLoading(false);
            
            // Navigate back to restaurant detail after 2 seconds
            setTimeout(() => {
                navigate(`/restaurant/${restaurantId}`);
            }, 2000);
        } catch (error) {
            setLoading(false);
            console.error('Error adding menu item:', error);
            const errorMsg = error.response 
                ? `Error ${error.response.status}: ${error.response.data.message || error.message}` 
                : error.message;
            setErrorMessage(errorMsg);
        }
    };
    
    const handleBack = () => {
        navigate(`/restaurant/${restaurantId}`);
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
    
    if (!restaurant) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 2 }}>
                    Restaurant not found
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
                    <FastfoodIcon sx={{ mr: 1 }} />
                    Add Menu Item to {restaurant.name}
                </Typography>
                
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
                        {loading ? <CircularProgress size={24} /> : 'Add Menu Item'}
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

export default AddMenuItem; 