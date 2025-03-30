import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Switch
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

const apiUrl = 'http://localhost:5002';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const AddRestaurant = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        cuisine: '',
        image: '',
        deliveryTime: 30,
        minOrder: 0,
        isOpen: true,
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: ''
        },
        operatingHours: {
            monday: { open: '09:00', close: '22:00' },
            tuesday: { open: '09:00', close: '22:00' },
            wednesday: { open: '09:00', close: '22:00' },
            thursday: { open: '09:00', close: '22:00' },
            friday: { open: '09:00', close: '22:00' },
            saturday: { open: '09:00', close: '22:00' },
            sunday: { open: '09:00', close: '22:00' }
        }
    });

    // Separate state for coordinates
    const [coordinates, setCoordinates] = useState({
        longitude: 0,
        latitude: 0
    });
    
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleOperatingHoursChange = (day, type, value) => {
        setFormData(prev => ({
            ...prev,
            operatingHours: {
                ...prev.operatingHours,
                [day]: {
                    ...prev.operatingHours[day],
                    [type]: value
                }
            }
        }));
    };

    const handleCoordinatesChange = (type, value) => {
        const numValue = parseFloat(value) || 0;
        setCoordinates(prev => ({
            ...prev,
            [type]: numValue
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setErrorMessage('');

            // Combine formData with location data
            const submitData = {
                ...formData,
                location: {
                    type: 'Point',
                    coordinates: [coordinates.longitude, coordinates.latitude]
                }
            };

            console.log('Submitting restaurant data:', submitData);
            const response = await axios.post(`${apiUrl}/api/restaurants`, submitData);
            console.log('Restaurant added:', response.data);
            setSuccessMessage('Restaurant added successfully!');
            setLoading(false);
            
            // Navigate back to restaurant list after 2 seconds
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            setLoading(false);
            console.error('Error adding restaurant:', error);
            const errorMsg = error.response 
                ? `Error ${error.response.status}: ${error.response.data.message || error.message}` 
                : error.message;
            setErrorMessage(errorMsg);
        }
    };

    const handleBack = () => {
        navigate('/');
    };
    
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
            
            <Paper elevation={3} sx={{ p: 3, my: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Add New Restaurant
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
                                label="Cuisine Type"
                                name="cuisine"
                                value={formData.cuisine}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                placeholder="e.g., Italian, Chinese, Indian"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Image URL"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                placeholder="https://example.com/restaurant-image.jpg"
                            />
                        </Grid>
                        
                        {/* Business Details */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Business Details</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Delivery Time (minutes)"
                                name="deliveryTime"
                                type="number"
                                value={formData.deliveryTime}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">min</InputAdornment>
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Minimum Order Amount"
                                name="minOrder"
                                type="number"
                                value={formData.minOrder}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isOpen}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            isOpen: e.target.checked
                                        }))}
                                        name="isOpen"
                                        disabled={loading}
                                    />
                                }
                                label="Restaurant is Open"
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
                                name="address.street"
                                value={formData.address.street}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="City"
                                name="address.city"
                                value={formData.address.city}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="State"
                                name="address.state"
                                value={formData.address.state}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="ZIP Code"
                                name="address.zipCode"
                                value={formData.address.zipCode}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </Grid>

                        {/* Location Coordinates */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Location Coordinates</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Longitude"
                                type="number"
                                value={coordinates.longitude}
                                onChange={(e) => handleCoordinatesChange('longitude', e.target.value)}
                                required
                                disabled={loading}
                                inputProps={{
                                    step: 'any'
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Latitude"
                                type="number"
                                value={coordinates.latitude}
                                onChange={(e) => handleCoordinatesChange('latitude', e.target.value)}
                                required
                                disabled={loading}
                                inputProps={{
                                    step: 'any'
                                }}
                            />
                        </Grid>

                        {/* Operating Hours */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Operating Hours</Typography>
                        </Grid>
                        {DAYS_OF_WEEK.map((day) => (
                            <Grid item xs={12} key={day}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Typography sx={{ minWidth: 100, textTransform: 'capitalize' }}>
                                        {day}
                                    </Typography>
                                    <TextField
                                        label="Opening Time"
                                        type="time"
                                        value={formData.operatingHours[day].open}
                                        onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                                        disabled={loading}
                                        InputLabelProps={{ shrink: true }}
                                        inputProps={{ step: 300 }}
                                        sx={{ flex: 1 }}
                                    />
                                    <TextField
                                        label="Closing Time"
                                        type="time"
                                        value={formData.operatingHours[day].close}
                                        onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                                        disabled={loading}
                                        InputLabelProps={{ shrink: true }}
                                        inputProps={{ step: 300 }}
                                        sx={{ flex: 1 }}
                                    />
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                    
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        sx={{ mt: 3 }}
                        fullWidth
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Add Restaurant'}
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

export default AddRestaurant;