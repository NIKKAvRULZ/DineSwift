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
    Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

const apiUrl = 'http://localhost:5002';

const EditRestaurant = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        description: '',
        openingHours: '',
        closingHours: '',
        phoneNumber: '',
        email: '',
        address: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                setFetchLoading(true);
                const response = await axios.get(`${apiUrl}/api/restaurants/${id}`);
                console.log('Restaurant data received:', response.data);
                
                // Apply defaults to missing fields
                const restaurantData = response.data;
                
                setFormData({ 
                    name: restaurantData.name || '', 
                    location: restaurantData.location || '', 
                    description: restaurantData.description || '', 
                    openingHours: restaurantData.openingHours || '', 
                    closingHours: restaurantData.closingHours || '', 
                    phoneNumber: restaurantData.phoneNumber || '', 
                    email: restaurantData.email || '', 
                    address: restaurantData.address || '' 
                });
                
                console.log('Form data set:', formData);
                setFetchLoading(false);
            } catch (error) {
                console.error('Error fetching restaurant:', error);
                setErrorMessage('Could not fetch restaurant details');
                setFetchLoading(false);
            }
        };
        
        fetchRestaurant();
    }, [id]);
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setErrorMessage('');
            console.log('Updating restaurant data:', formData);
            const response = await axios.put(`${apiUrl}/api/restaurants/${id}`, formData);
            console.log('Restaurant updated:', response.data);
            setSuccessMessage('Restaurant updated successfully!');
            setLoading(false);
            
            // Navigate back to restaurant list after 2 seconds
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            setLoading(false);
            console.error('Error updating restaurant:', error);
            const errorMsg = error.response 
                ? `Error ${error.response.status}: ${error.response.data.message || error.message}` 
                : error.message;
            setErrorMessage(errorMsg);
        }
    };
    
    const handleBack = () => {
        navigate('/');
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
                    Back to Restaurants
                </Button>
            </Box>
            
            <Paper elevation={3} sx={{ p: 3, my: 2 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <EditIcon sx={{ mr: 1 }} />
                    Edit Restaurant
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <Grid container spacing={3}>
                        {/* Basic Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Basic Information</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Restaurant Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
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

                        {/* Operating Hours */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Operating Hours</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Opening Hours"
                                name="openingHours"
                                value={formData.openingHours}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="e.g., 9:00 AM"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Closing Hours"
                                name="closingHours"
                                value={formData.closingHours}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="e.g., 10:00 PM"
                            />
                        </Grid>

                        {/* Contact Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Contact Information</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="e.g., +94 77 123 4567"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="e.g., info@restaurant.com"
                            />
                        </Grid>

                        {/* Address */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Address</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Street Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                disabled={loading}
                            />
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
                        {loading ? <CircularProgress size={24} /> : 'Update Restaurant'}
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

export default EditRestaurant; 