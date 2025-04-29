import React, { useState } from 'react';
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
    Select,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
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

const MAX_IMAGES = 5;

const AddMenuItem = () => {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        images: [],
        category: '',
        price: '',
        isSpicy: false,
        discount: 0
    });
    
    const [newImageUrl, setNewImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
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

    const handleAddImage = () => {
        if (newImageUrl.trim()) {
            // Check if already at max images
            if (formData.images.length >= MAX_IMAGES) {
                setErrorMessage(`Maximum of ${MAX_IMAGES} images allowed. Remove an image to add a new one.`);
                return;
            }
            
            // Check if image URL is valid
            try {
                new URL(newImageUrl.trim());
            } catch (e) {
                setErrorMessage('Please enter a valid URL for the image');
                return;
            }
            
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, newImageUrl.trim()]
            }));
            setNewImageUrl('');
            setErrorMessage('');
        }
    };

    const handleRemoveImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setErrorMessage('');

            // Validate that we have at least one image
            if (formData.images.length === 0 && !newImageUrl.trim()) {
                setErrorMessage('Please add at least one image for the menu item');
                setLoading(false);
                return;
            }
            
            // Add the current image URL if it's filled but not yet added to the array
            let finalImages = [...formData.images];
            if (newImageUrl.trim()) {
                try {
                    new URL(newImageUrl.trim());
                    finalImages.push(newImageUrl.trim());
                } catch (e) {
                    setErrorMessage('Please enter a valid URL for the image or clear the field');
                    setLoading(false);
                    return;
                }
            }
            
            // Check max images again
            if (finalImages.length > MAX_IMAGES) {
                setErrorMessage(`Maximum of ${MAX_IMAGES} images allowed. You have ${finalImages.length}`);
                setLoading(false);
                return;
            }

            const submitData = {
                ...formData,
                price: parseFloat(formData.price),
                images: finalImages,
                image: finalImages.length > 0 ? finalImages[0] : ''
            };

            console.log('Submitting menu item:', submitData);
            const response = await axios.post(`${apiUrl}/api/restaurants/${restaurantId}/menu-items`, submitData);
            console.log('Menu item added:', response.data);
            setSuccessMessage('Menu item added successfully!');
            setLoading(false);
            
            setTimeout(() => {
                navigate(`/restaurant/${restaurantId}`);
            }, 2000);
        } catch (error) {
            setLoading(false);
            console.error('Error adding menu item:', error);
            const errorMsg = error.response 
                ? `Error ${error.response.status}: ${error.response.data.message || error.response.data.error || error.message}` 
                : error.message;
            setErrorMessage(errorMsg);
        }
    };
    
    const handleBack = () => {
        navigate(`/restaurant/${restaurantId}`);
    };
    
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
                <Typography variant="h5" component="h2" gutterBottom>
                    Add Menu Item
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
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Images (Max {MAX_IMAGES})
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Image URL"
                                        value={newImageUrl}
                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                        disabled={loading || formData.images.length >= MAX_IMAGES}
                                        placeholder="https://example.com/image.jpg"
                                        helperText={formData.images.length >= MAX_IMAGES ? 
                                            `Maximum of ${MAX_IMAGES} images reached` : 
                                            `${formData.images.length}/${MAX_IMAGES} images added`}
                                    />
                                    <IconButton 
                                        onClick={handleAddImage}
                                        disabled={loading || !newImageUrl.trim() || formData.images.length >= MAX_IMAGES}
                                        color="primary"
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </Box>
                                
                                {/* Preview of all images added */}
                                {formData.images.length > 0 && (
                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                                        {formData.images.map((img, index) => (
                                            <Box 
                                                key={index}
                                                sx={{ 
                                                    position: 'relative',
                                                    width: 100,
                                                    height: 100,
                                                    borderRadius: 1,
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <img 
                                                    src={img} 
                                                    alt={`Preview ${index}`}
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '100%', 
                                                        objectFit: 'cover' 
                                                    }}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/100?text=Error';
                                                    }}
                                                />
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveImage(index)}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        right: 0,
                                                        bgcolor: 'rgba(0,0,0,0.5)',
                                                        color: 'white',
                                                        p: 0.5,
                                                        '&:hover': {
                                                            bgcolor: 'rgba(0,0,0,0.7)',
                                                        }
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                                
                                <List>
                                    {formData.images.map((image, index) => (
                                        <ListItem key={index}>
                                            <ListItemText 
                                                primary={image}
                                                secondary={index === 0 ? "Primary image" : `Image ${index + 1}`}
                                                sx={{
                                                    wordBreak: 'break-all',
                                                    pr: 2
                                                }}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton 
                                                    edge="end" 
                                                    onClick={() => handleRemoveImage(index)}
                                                    disabled={loading}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
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
                                    startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                                    step: "1"
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
                        <Grid item xs={12} md={3}>
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