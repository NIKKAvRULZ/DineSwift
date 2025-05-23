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
    Select,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
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

const EditMenuItem = () => {
    const { id } = useParams();
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

                // Normalize images
                let imageArray = [];
                if (menuItem.images && Array.isArray(menuItem.images) && menuItem.images.length > 0) {
                    imageArray = menuItem.images;
                } else if (menuItem.image) {
                    imageArray = [menuItem.image];
                }

                // Set form data with proper handling of null/undefined values
                setFormData({
                    name: menuItem.name || '',
                    description: menuItem.description || '',
                    images: imageArray,
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

    const handleAddImage = () => {
        if (newImageUrl.trim()) {
            // Check if already at max images (reuse MAX_IMAGES constant from AddMenuItem)
            const MAX_IMAGES = 5;
            if (formData.images.length >= MAX_IMAGES) {
                setErrorMessage(`Maximum of ${MAX_IMAGES} images allowed. Remove an image to add a new one.`);
                return;
            }
            
            // Check if image URL is valid
            try {
                // More permissive URL validation
                let url = newImageUrl.trim();
                // Add https:// if missing protocol
                if (!/^https?:\/\//i.test(url)) {
                    url = 'https://' + url;
                }
                
                new URL(url);
                
                // Create a new array with the new image
                const updatedImages = [...formData.images, url];
                
                setFormData(prev => ({
                    ...prev,
                    images: updatedImages
                }));
                setNewImageUrl('');
                setErrorMessage('');
                
                console.log('Updated images array:', updatedImages);
            } catch (e) {
                setErrorMessage('Please enter a valid URL for the image');
                return;
            }
        }
    };

    const handleRemoveImage = (index) => {
        // Create a new array without the image at the specified index
        const updatedImages = formData.images.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            images: updatedImages
        }));
        console.log('After removal, images array:', updatedImages);
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
                    let url = newImageUrl.trim();
                    // Add https:// if missing protocol
                    if (!/^https?:\/\//i.test(url)) {
                        url = 'https://' + url;
                    }
                    new URL(url);
                    finalImages.push(url);
                } catch (e) {
                    setErrorMessage('Please enter a valid URL for the image or clear the field');
                    setLoading(false);
                    return;
                }
            }
            
            // Check max images again
            const MAX_IMAGES = 5;
            if (finalImages.length > MAX_IMAGES) {
                setErrorMessage(`Maximum of ${MAX_IMAGES} images allowed. You have ${finalImages.length}`);
                setLoading(false);
                return;
            }

            // Log image data to console for debugging
            console.log('Images to be submitted:', finalImages);
            console.log('Images array type:', Array.isArray(finalImages) ? 'Array' : typeof finalImages);

            // Create a new object explicitly with an images array
            const submitData = {
                name: formData.name,
                description: formData.description,
                category: formData.category,
                price: parseFloat(formData.price),
                isSpicy: formData.isSpicy,
                discount: formData.discount,
                images: finalImages,
                image: finalImages.length > 0 ? finalImages[0] : ''
            };
            
            console.log('Submitting menu item update:', JSON.stringify(submitData));
            const response = await axios.put(`${apiUrl}/api/menu-items/${id}`, submitData);
            console.log('Menu item updated:', response.data);
            setSuccessMessage('Menu item updated successfully!');
            setLoading(false);
            
            setTimeout(() => {
                navigate(`/restaurant/${restaurantId}`);
            }, 2000);
        } catch (error) {
            setLoading(false);
            console.error('Error updating menu item:', error);
            const errorMsg = error.response 
                ? `Error ${error.response.status}: ${error.response.data.message || error.response.data.error || error.message}` 
                : error.message;
            setErrorMessage(errorMsg);
        }
    };
    
    const handleBack = () => {
        navigate(`/restaurant/${restaurantId}`);
    };
    
    if (fetchLoading) {
        return (
            <Container maxWidth="md">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
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
                <Typography variant="h5" component="h2" gutterBottom>
                    Edit Menu Item
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <Grid container spacing={3}>
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
                                    Images
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Image URL"
                                        value={newImageUrl}
                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                        disabled={loading}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <IconButton 
                                        onClick={handleAddImage}
                                        disabled={loading || !newImageUrl.trim()}
                                        color="primary"
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </Box>
                                <List>
                                    {formData.images.map((image, index) => (
                                        <ListItem key={index}>
                                            <ListItemText 
                                                primary={image}
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
                                    inputProps: { step: "1", min: "0" }
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