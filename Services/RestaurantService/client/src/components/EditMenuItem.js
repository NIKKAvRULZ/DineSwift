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
    Grid,
    InputAdornment,
    FormControlLabel,
    Switch,
    MenuItem,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

const apiUrl = 'http://localhost:5002';

const CATEGORIES = [
    'Appetizers',
    'Main Course',
    'Desserts',
    'Beverages',
    'Sides',
    'Specials'
];

const EditMenuItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        category: '',
        price: '',
        isSpicy: false,
        discount: 0
    });
    
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [restaurantId, setRestaurantId] = useState(null);

    useEffect(() => {
        const fetchMenuItem = async () => {
            try {
                setFetchLoading(true);
                const response = await axios.get(`${apiUrl}/api/menu-items/${id}`);
                console.log('Fetched menu item:', response.data);
                const menuItem = response.data;
                
                // Handle restaurantId properly whether it's populated or not
                let restId;
                if (typeof menuItem.restaurantId === 'object' && menuItem.restaurantId !== null) {
                    restId = menuItem.restaurantId._id;
                } else {
                    restId = menuItem.restaurantId;
                }
                setRestaurantId(restId);
                console.log('Restaurant ID set to:', restId);

                // Set form data with proper handling of null/undefined values
                setFormData({
                    name: menuItem.name || '',
                    description: menuItem.description || '',
                    image: menuItem.image || '',
                    category: menuItem.category || '',
                    price: menuItem.price?.toString() || '',
                    isSpicy: Boolean(menuItem.isSpicy),
                    discount: menuItem.discount || 0
                });
                
                setFetchLoading(false);
            } catch (error) {
                console.error('Error fetching menu item:', error);
                const errorMsg = error.response 
                    ? `Error ${error.response.status}: ${error.response.data.message || error.message}` 
                    : error.message;
                setErrorMessage(errorMsg);
                setFetchLoading(false);
            }
        };
        
        fetchMenuItem();
    }, [id]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSwitchChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.checked
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setErrorMessage('');

            // Validate required fields
            if (!formData.name || !formData.category || !formData.price) {
                setErrorMessage('Name, category, and price are required');
                setLoading(false);
                return;
            }

            const submitData = {
                ...formData,
                price: parseFloat(formData.price),
                isSpicy: Boolean(formData.isSpicy)
            };

            console.log('Updating menu item:', submitData);
            const response = await axios.put(`${apiUrl}/api/menu-items/${id}`, submitData);
            console.log('Menu item updated:', response.data);
            setSuccessMessage('Menu item updated successfully!');
            setLoading(false);
            
            // Navigate back to restaurant details after 2 seconds
            setTimeout(() => {
                if (restaurantId) {
                    navigate(`/restaurant/${restaurantId}`);
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
        if (restaurantId) {
            console.log('Navigating back to restaurant:', restaurantId);
            navigate(`/restaurant/${restaurantId}`);
        } else {
            console.log('No restaurant ID found, navigating to home');
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
    
    return (
        <Container maxWidth="md">
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
                    Edit Menu Item
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <Grid container spacing={3}>
                        {/* Basic Information */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Item Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    name="category"
                                    value={formData.category}
                                    label="Category"
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    {CATEGORIES.map((category) => (
                                        <MenuItem key={category} value={category}>
                                            {category}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                multiline
                                rows={3}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Image URL"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="https://example.com/image.jpg"
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Price"
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    inputProps: { step: "0.01", min: "0" }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Discount"
                                name="discount"
                                type="number"
                                value={formData.discount}
                                onChange={handleChange}
                                disabled={loading}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    inputProps: {
                                        min: 0,
                                        max: 100
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.isSpicy}
                                            onChange={handleSwitchChange}
                                            name="isSpicy"
                                            disabled={loading}
                                            color="error"
                                        />
                                    }
                                    label="Spicy Item"
                                />
                            </Box>
                        </Grid>
                    </Grid>
                    
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