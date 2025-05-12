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
    Paper,
    TextField,
    List,
    ListItem,
    ListItemText,
    Divider
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
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';

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
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    
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

    // Add logging for rating data when component mounts or menuItem changes
    useEffect(() => {
        console.log('MenuItemCard rating data:', {
            itemName: menuItem.name,
            rating: menuItem.rating,
            ratingCount: menuItem.ratingCount,
            hasRatings: Boolean(menuItem.ratings),
            ratingsLength: menuItem.ratings?.length || 0
        });
    }, [menuItem]);

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

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            setIsSubmittingComment(true);
            const response = await axios.post(
                `${apiUrl}/api/restaurants/${menuItem.restaurantId}/menu-items/${menuItem._id}/comments`,
                {
                    text: newComment.trim(),
                    userId: 'admin' // Since this is the admin view
                }
            );

            setComments(prev => [...prev, response.data.menuItem.comments[response.data.menuItem.comments.length - 1]]);
            setNewComment('');
            showNotification('Comment added successfully', 'success');
        } catch (error) {
            console.error('Error adding comment:', error);
            showNotification('Error adding comment', 'error');
        } finally {
            setIsSubmittingComment(false);
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
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {/* Discount Badge */}
                {menuItem.discount > 0 && (
                    <Box sx={{
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
                        fontSize: '0.875rem'
                    }}>
                        {`${menuItem.discount}% OFF`}
                    </Box>
                )}

                {/* Image Section - Updated to show full image */}
                <Box sx={{ 
                    width: '100%', 
                    height: '250px', 
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {/* Current image display */}
                    <Box
                        component="img"
                        src={images[currentImageIndex] || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={menuItem.name}
                        sx={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            display: 'block'
                        }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
                        }}
                    />
                    
                    {/* Navigation arrows for multiple images */}
                    {images.length > 1 && (
                        <>
                            <IconButton 
                                onClick={handlePrevImage}
                                sx={{ 
                                    position: 'absolute', 
                                    left: 8, 
                                    backgroundColor: 'rgba(255,255,255,0.7)',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
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
                                    backgroundColor: 'rgba(255,255,255,0.7)',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                                }}
                                size="small"
                            >
                                <NavigateNextIcon />
                            </IconButton>
                            <Box sx={{ 
                                position: 'absolute', 
                                bottom: 8, 
                                left: '50%', 
                                transform: 'translateX(-50%)',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: '0.75rem'
                            }}>
                                {currentImageIndex + 1} / {images.length}
                            </Box>
                        </>
                    )}
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                    {/* Title and Rating Section */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            {menuItem.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Rating
                                value={menuItem.rating || 0}
                                precision={0.5}
                                readOnly
                                size="small"
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                {menuItem.rating ? menuItem.rating.toFixed(1) : 'No ratings'} 
                                {menuItem.ratingCount > 0 && ` (${menuItem.ratingCount} ${menuItem.ratingCount === 1 ? 'review' : 'reviews'})`}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Details Section */}
                    <Typography variant="body2" color="text.secondary" paragraph>
                        {menuItem.description}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" color="primary">
                            Rs. {menuItem.price}
                        </Typography>
                        <Chip
                            icon={<FastfoodIcon />}
                            label={menuItem.category}
                            size="small"
                            variant="outlined"
                        />
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            color="primary"
                            onClick={() => navigate(`/edit-menu-item/${menuItem._id}`)}
                            startIcon={<EditIcon />}
                        >
                            Edit
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            onClick={() => onDelete(menuItem)}
                            startIcon={<DeleteIcon />}
                        >
                            Delete
                        </Button>
                    </Box>
                </CardContent>
            </Card>
            
            {/* Notification Component */}
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