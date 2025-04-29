import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { Box, Typography, Grid } from '@mui/material';
import { Rating } from '@mui/material';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';

const RestaurantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [menuItemToDelete, setMenuItemToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [ratingFilter, setRatingFilter] = useState(0);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Track last update timestamp and rating changes
    const [lastUpdate, setLastUpdate] = useState(null);
    const [ratingUpdateCount, setRatingUpdateCount] = useState(0);

    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotification({ ...notification, open: false });
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const restaurantResponse = await axios.get(`${apiUrl}/api/restaurants/${id}`);
            setRestaurant(restaurantResponse.data);
            
            const menuResponse = await axios.get(`${apiUrl}/api/restaurants/${id}/menu-items`);
            console.log('Fetched menu items:', menuResponse.data);
            setMenuItems(menuResponse.data);
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching restaurant details:', error);
            const errorMessage = error.response 
                ? `Error ${error.response.status}: ${error.response.data.message || error.message}` 
                : error.message;
            setError(errorMessage);
            setLoading(false);
            showNotification(errorMessage, 'error');
        }
    };

    // Set up polling for menu item updates
    useEffect(() => {
        // Initial fetch
        fetchData();
        
        // Set up polling interval (every 3 seconds)
        const intervalId = setInterval(async () => {
            try {
                const menuResponse = await axios.get(`${apiUrl}/api/restaurants/${id}/menu-items`);
                const newMenuItems = menuResponse.data;
                
                // Check if any ratings have changed
                let hasRatingChanges = false;
                newMenuItems.forEach(newItem => {
                    const currentItem = menuItems.find(item => item._id === newItem._id);
                    if (currentItem && (
                        newItem.rating !== currentItem.rating || 
                        newItem.ratingCount !== currentItem.ratingCount
                    )) {
                        console.log(`Rating changed for ${newItem.name}: ${currentItem.rating} → ${newItem.rating}`);
                        hasRatingChanges = true;
                    }
                });
                
                if (hasRatingChanges) {
                    console.log('Updating menu items with new ratings');
                    setMenuItems(newMenuItems);
                    setLastUpdate(new Date().toISOString());
                    setRatingUpdateCount(prev => prev + 1);
                    showNotification('Menu items updated with new ratings', 'info');
                }
            } catch (error) {
                console.error('Error polling menu items:', error);
            }
        }, 3000);
        
        // Clean up on unmount
        return () => clearInterval(intervalId);
    }, [id]);
    
    // Handle rating change from menu item card
    const handleRatingChange = (menuItemId, updatedMenuItem) => {
        console.log('Rating change received:', updatedMenuItem);
        setMenuItems(prevItems => 
            prevItems.map(item => 
                item._id === menuItemId ? { ...item, ...updatedMenuItem } : item
            )
        );
        
        // Update lastUpdate timestamp
        setLastUpdate(new Date().toISOString());
        setRatingUpdateCount(prev => prev + 1);
    };

    const filterMenuItems = (items) => {
        return items.filter(item => {
            // Search query filter
            const searchMatch = searchQuery.trim() === '' || 
                (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

            // Rating filter
            const ratingMatch = ratingFilter === 0 || 
                (item.rating !== undefined && item.rating !== null && item.rating >= ratingFilter);

            return searchMatch && ratingMatch;
        });
    };

    // Group menu items by category
    const groupedMenuItems = menuItems.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {});

    // Sort categories
    const sortedCategories = Object.keys(groupedMenuItems).sort((a, b) => {
        const categoryOrder = {
            'Appetizers': 1,
            'Main Course': 2,
            'Desserts': 3,
            'Beverages': 4,
            'Sides': 5,
            'Specials': 6,
            'Uncategorized': 7
        };
        return (categoryOrder[a] || 999) - (categoryOrder[b] || 999);
    });

    return (
        <Box sx={{ p: 3 }}>
            {/* Add last update indicator */}
            {lastUpdate && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Last updated: {new Date(lastUpdate).toLocaleTimeString()}
                </Typography>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Box sx={{ flex: 1 }}>
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search menu items..."
                    />
                </Box>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                    py: 1,
                    px: 2,
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider',
                    height: '56px'
                }}>
                    <Typography variant="body2" sx={{ mr: 1 }} noWrap>
                        Filter by rating:
                    </Typography>
                    <Rating
                        value={ratingFilter}
                        onChange={(event, newValue) => {
                            setRatingFilter(newValue || 0);
                        }}
                        precision={0.5}
                        size="small"
                    />
                    {ratingFilter > 0 && (
                        <Typography
                            variant="body2"
                            color="primary"
                            sx={{
                                ml: 1,
                                cursor: 'pointer',
                                '&:hover': { textDecoration: 'underline' }
                            }}
                            onClick={() => setRatingFilter(0)}
                        >
                            Clear
                        </Typography>
                    )}
                </Box>
            </Box>

            {menuItems.length === 0 ? (
                <EmptyState
                    title="No Menu Items"
                    message="Start adding menu items to your restaurant!"
                    actionLabel="Add Menu Item"
                    actionPath={`/add-menu-item/${restaurant._id}`}
                />
            ) : (
                <Box>
                    {/* Show message if no items match the filters */}
                    {Object.values(groupedMenuItems).every(items => 
                        filterMenuItems(items).length === 0
                    ) && (
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            No menu items match your search criteria.
                        </Typography>
                    )}

                    {/* Render categories */}
                    {sortedCategories.map((category) => {
                        const filteredItems = filterMenuItems(groupedMenuItems[category]);
                        if (filteredItems.length === 0) return null;
                        
                        return (
                            <Box key={category} sx={{ mb: 4 }}>
                                <Typography variant="h6" gutterBottom sx={{ mt: 2, color: theme.palette.primary.main }}>
                                    {category}
                                </Typography>
                                <Grid container spacing={3}>
                                    {filteredItems.map((item) => (
                                        <Grid item xs={12} sm={6} md={4} key={item._id}>
                                            <MenuItemCard
                                                menuItem={item}
                                                onDelete={handleDeleteClick}
                                                onRatingChange={handleRatingChange}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
};

export default RestaurantDetail; 