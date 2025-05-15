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
    List,
    ListItem,
    ListItemText,
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
    const [showAllComments, setShowAllComments] = useState(false);
    
    // Properly normalize images from different sources
    const getProcessedImages = () => {
        // First check for images array
        if (menuItem.images && Array.isArray(menuItem.images) && menuItem.images.length > 0) {
            const validImages = menuItem.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
            if (validImages.length > 0) {
                return validImages;
            }
        }
        // Fallback to single image if no valid images in array
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

    // Load comments when component mounts
    useEffect(() => {
        const loadComments = async () => {
            try {
                const response = await axios.get(
                    `${apiUrl}/api/restaurants/${menuItem.restaurantId}/menu-items/${menuItem._id}/comments`
                );
                setComments(response.data.comments || []);
            } catch (error) {
                console.error('Error loading comments:', error);
                showNotification('Error loading comments', 'error');
            }
        };

        loadComments();
    }, [menuItem._id, menuItem.restaurantId]);

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

                {/* Image Section */}
                <Box sx={{ position: 'relative', paddingTop: '75%', width: '100%', backgroundColor: 'rgba(0,0,0,0.05)' }}>
                    {images.length > 0 && (
                        <>
                            <Box
                                component="img"
                                src={images[currentImageIndex]}
                                alt={menuItem.name}
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                            {images.length > 1 && (
                                <>
                                    <IconButton
                                        onClick={handlePrevImage}
                                        sx={{
                                            position: 'absolute',
                                            left: 8,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0,0,0,0.7)'
                                            }
                                        }}
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
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0,0,0,0.7)'
                                            }
                                        }}
                                    >
                                        <NavigateNextIcon />
                                    </IconButton>
                                </>
                            )}
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

                    {/* Comments Section */}
                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CommentIcon fontSize="small" />
                                Comments ({comments.length})
                            </Typography>
                            <Button
                                size="small"
                                onClick={() => setShowAllComments(prev => !prev)}
                                sx={{ textTransform: 'none' }}
                            >
                                {showAllComments ? 'Show Less' : 'View All Comments'}
                            </Button>
                        </Box>

                        <List
                            sx={{
                                maxHeight: showAllComments ? '400px' : '200px',
                                overflowY: 'auto',
                                transition: 'max-height 0.3s ease-in-out',
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                '& .MuiListItem-root': {
                                    bgcolor: 'grey.50',
                                    mb: 1,
                                    borderRadius: 1,
                                }
                            }}
                        >
                            {comments.length > 0 ? (
                                comments.map((comment, index) => (
                                    <ListItem key={index}>
                                        <ListItemText
                                            primary={comment.text}
                                            secondary={
                                                <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
                                                    {comment.user === 'anonymous' ? 'Anonymous User' : `User ${comment.user}`} •{' '}
                                                    {new Date(comment.timestamp).toLocaleString()}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))
                            ) : (
                                <Typography variant="body2" sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                                    No comments yet
                                </Typography>
                            )}
                        </List>
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