import React, { useState, useEffect } from 'react';
import { convertToLKR } from '../../utils/currency';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    IconButton,
    Button,
    Chip,
    Grid,
    useTheme,
    Rating,
    Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import { useNavigate } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import axios from 'axios';
import Notification from './Notification';

const apiUrl = 'http://localhost:5002';

const MenuItemCard = ({ menuItem, onDelete, onRatingChange }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [userRating, setUserRating] = useState(null);
    const [isRating, setIsRating] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    
    // Properly normalize images from different sources
    const getProcessedImages = () => {
        // First check for images array
        if (menuItem.images && Array.isArray(menuItem.images) && menuItem.images.length > 0) {
            return menuItem.images.filter(img => Boolean(img));
        }
        // Then fallback to single image if no array or empty array
        if (menuItem.image && typeof menuItem.image === 'string' && menuItem.image.trim() !== '') {
            return [menuItem.image];
        }
        // Return empty array if no images found
        return [];
    };
    
    const images = getProcessedImages();
    
    // Reset currentImageIndex when images change
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [menuItem._id]);
    
    // Log images for debugging
    useEffect(() => {
        console.log(`Menu item "${menuItem.name}" has ${images.length} images:`, images);
    }, [menuItem.name, images]);

    const handleNextImage = (e) => {
        e.stopPropagation(); // Prevent event bubbling
        if (images.length <= 1) return;
        setCurrentImageIndex(prev => (prev + 1) % images.length);
    };

    const handlePrevImage = (e) => {
        e.stopPropagation(); // Prevent event bubbling
        if (images.length <= 1) return;
        setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleRatingChange = async (event, newValue) => {
        if (!newValue) return;
        
        try {
            setIsRating(true);
            
            // Optimistically update UI for better user experience
            const previousRating = menuItem.rating;
            const previousRatingCount = menuItem.ratingCount;
            
            // Calculate optimistic new rating
            let newRatingCount = menuItem.ratingCount || 0;
            if (!userRating) newRatingCount += 1;  // Only increase if this is a new rating
            
            const oldRatingTotal = previousRating * previousRatingCount;
            let newRatingTotal;
            
            if (userRating) {
                // Adjust the total when updating an existing rating
                newRatingTotal = oldRatingTotal - userRating + newValue;
            } else {
                // Add the new rating to the total
                newRatingTotal = oldRatingTotal + newValue;
            }
            
            const optimisticRating = newRatingCount > 0 ? newRatingTotal / newRatingCount : 0;
            
            // Log changes
            console.log('Optimistic rating update:', {
                menuItem: menuItem.name,
                oldRating: previousRating,
                oldCount: previousRatingCount,
                newRating: optimisticRating,
                newCount: newRatingCount,
                userRating: newValue
            });
            
            // Update UI immediately
            const updatedMenuItem = {
                ...menuItem,
                rating: optimisticRating,
                ratingCount: newRatingCount
            };
            
            // Notify parent component of the optimistic update
            if (onRatingChange) {
                onRatingChange(menuItem._id, updatedMenuItem);
            }
            
            // Set local user rating state
            setUserRating(newValue);
            
            // Submit to server
            const response = await axios.post(`${apiUrl}/api/restaurants/${menuItem.restaurantId}/menu-items/${menuItem._id}/rate`, {
                rating: newValue
            });
            
            console.log('Rating updated on server:', response.data);
            
            // Update with the actual server response
            if (response.data && response.data.menuItem) {
                // Update the parent component with the confirmed server data
                if (onRatingChange) {
                    onRatingChange(menuItem._id, response.data.menuItem);
                }
            }
            
            // Show success notification
            showNotification('Rating submitted successfully', 'success');
        } catch (error) {
            console.error('Error submitting rating:', error);
            showNotification('Error submitting rating. Please try again.', 'error');
            
            // Revert the optimistic update on error
            if (onRatingChange) {
                onRatingChange(menuItem._id, menuItem);
            }
        } finally {
            setIsRating(false);
        }
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotification({ ...notification, open: false });
    };

    return (
        <>
            <Card
                elevation={3}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                }}
            >
                {menuItem.discount > 0 && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            backgroundColor: '#ff3d00',
                            color: 'white',
                            padding: '6px 12px',
                            borderBottomLeftRadius: '8px',
                            fontWeight: 'bold',
                            zIndex: 100,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            fontSize: '0.875rem',
                            transform: 'translateY(0)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {`${menuItem.discount}% OFF`}
                    </Box>
                )}
                
                {/* Image Slideshow */}
                <Box sx={{
                    position: 'relative',
                    paddingTop: '75%', // 4:3 aspect ratio
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.05)'
                }}>
                    {images.length > 0 ? (
                        <>
                            <CardMedia
                                component="img"
                                image={images[currentImageIndex]}
                                alt={menuItem.name}
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderTopLeftRadius: theme.shape.borderRadius,
                                    borderTopRightRadius: theme.shape.borderRadius
                                }}
                                onError={(e) => {
                                    console.error('Image failed to load:', images[currentImageIndex]);
                                    e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                                }}
                            />
                            
                            {/* Navigation arrows - only show when multiple images */}
                            {images.length > 1 && (
                                <>
                                    <IconButton
                                        onClick={handlePrevImage}
                                        sx={{
                                            position: 'absolute',
                                            left: 8,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            },
                                            zIndex: 2
                                        }}
                                        size="small"
                                    >
                                        <NavigateBeforeIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={handleNextImage}
                                        sx={{
                                            position: 'absolute',
                                            right: 8,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            },
                                            zIndex: 2
                                        }}
                                        size="small"
                                    >
                                        <NavigateNextIcon />
                                    </IconButton>
                                    
                                    {/* Dots indicator for images */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: 8,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            display: 'flex',
                                            gap: 1,
                                            zIndex: 2
                                        }}
                                    >
                                        {images.map((_, index) => (
                                            <Box
                                                key={index}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentImageIndex(index);
                                                }}
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    backgroundColor: index === currentImageIndex 
                                                        ? theme.palette.primary.main 
                                                        : 'rgba(255, 255, 255, 0.7)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        transform: 'scale(1.2)',
                                                    },
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </>
                            )}
                            
                            {/* Image counter */}
                            {images.length > 1 && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                        color: 'white',
                                        borderRadius: '4px',
                                        padding: '2px 6px',
                                        fontSize: '0.75rem',
                                        zIndex: 2
                                    }}
                                >
                                    {currentImageIndex + 1} / {images.length}
                                </Box>
                            )}
                        </>
                    ) : (
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'text.secondary',
                            borderTopLeftRadius: theme.shape.borderRadius,
                            borderTopRightRadius: theme.shape.borderRadius
                        }}>
                            <Typography variant="body2">No image available</Typography>
                        </Box>
                    )}
                </Box>
                
                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                        variant="h6"
                        component="h2"
                        gutterBottom
                        sx={{
                            fontWeight: 600,
                            mb: 1,
                            color: theme.palette.text.primary
                        }}
                    >
                        {menuItem.name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography
                            variant="h6"
                            color="primary"
                            sx={{ fontWeight: 600 }}
                        >
                            {convertToLKR(menuItem.price)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating
                                value={menuItem.rating}
                                precision={0.5}
                                size="small"
                                onChange={handleRatingChange}
                                disabled={isRating}
                                emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                ({menuItem.rating ? menuItem.rating.toFixed(1) : '0.0'})
                                {menuItem.ratingCount > 0 && 
                                    <span> · {menuItem.ratingCount} {menuItem.ratingCount === 1 ? 'rating' : 'ratings'}</span>
                                }
                            </Typography>
                        </Box>
                    </Box>
                    <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        paragraph
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: '40px'
                        }}
                    >
                        {menuItem.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Chip 
                            icon={<FastfoodIcon />}
                            label={menuItem.category}
                            size="small"
                            variant="outlined"
                            sx={{ borderRadius: '6px' }}
                        />
                    </Box>
                </CardContent>
                <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                color="info"
                                startIcon={<EditIcon />}
                                onClick={() => navigate(`/edit-menu-item/${menuItem._id}`)}
                                sx={{
                                    borderRadius: 1,
                                    textTransform: 'none'
                                }}
                            >
                                Edit
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => onDelete(menuItem)}
                                sx={{
                                    borderRadius: 1,
                                    textTransform: 'none'
                                }}
                            >
                                Delete
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Card>
            <Notification
                open={notification.open}
                message={notification.message}
                severity={notification.severity}
                onClose={handleCloseNotification}
            />
        </>
    );
};

export default MenuItemCard;