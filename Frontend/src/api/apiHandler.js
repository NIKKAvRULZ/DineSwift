import axios from 'axios';

const API_BASE_URL = 'http://localhost:5002/api';
const TIMEOUT = 5000; // 5 seconds timeout for requests

// Set up axios debug interceptors
axios.interceptors.request.use(request => {
  console.log('Starting Request:', {
    url: request.url,
    method: request.method,
    data: request.data,
    headers: request.headers
  });
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.log('Response Error:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response'
    });
    return Promise.reject(error);
  }
);

/**
 * Check if the server is reachable
 * @returns {Promise<boolean>} True if server is reachable
 */
export const checkServerConnectivity = async () => {
  try {
    // Try multiple endpoints in case one is blocked or misconfigured
    // First try ping endpoint (lightest weight)
    try {
      console.log('Checking server connectivity via ping endpoint...');
      const response = await axios.get(`${API_BASE_URL}/ping`, { 
        timeout: 1000, // Very short timeout for ping
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (response.status === 200) {
        console.log('Server is reachable via ping endpoint');
        return true;
      }
    } catch (pingError) {
      console.log('Ping endpoint check failed:', pingError.message);
      // Continue to other endpoints
    }
    
    // Next try health endpoint
    try {
      console.log('Checking server connectivity via health endpoint...');
      const response = await axios.get(`${API_BASE_URL}/health`, { 
        timeout: 2000,
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (response.status === 200) {
        console.log('Server is reachable via health endpoint');
        return true;
      }
    } catch (healthError) {
      console.log('Health endpoint check failed:', healthError.message);
      // Continue to fallback endpoints
    }
    
    // Try restaurants endpoint as fallback
    try {
      console.log('Trying fallback: checking restaurants endpoint...');
      const response = await axios.get(`${API_BASE_URL}/restaurants?limit=1`, {
        timeout: 2000,
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (response.status === 200) {
        console.log('Server is reachable via restaurants endpoint');
        return true;
      }
    } catch (fallbackError) {
      console.log('Restaurants endpoint check failed:', fallbackError.message);
    }
    
    // All connectivity checks failed
    console.log('All server connectivity checks failed');
    return false;
  } catch (error) {
    console.log('Server connectivity checking mechanism failed:', error.message);
    return false;
  }
};

/**
 * Submit a rating to the server
 * @param {object} params Rating parameters
 * @returns {Promise<object>} API response
 */
export const submitRating = async ({ restaurantId, menuItemId, rating, userId, token }) => {
  if (!restaurantId || !menuItemId || !rating) {
    throw new Error('Missing required parameters');
  }

  // Ensure rating is a number
  const numericRating = Number(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    throw new Error('Rating must be a number between 1 and 5');
  }

  // Set up retry mechanism
  const maxRetries = 2;
  let lastError = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add delay between retries (0 for first attempt)
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt}/${maxRetries} for rating submission`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
      
      // Make API call
      const response = await axios.post(
        `${API_BASE_URL}/restaurants/${restaurantId}/menu-items/${menuItemId}/rate`,
        {
          rating: numericRating,
          userId: userId || 'anonymous',
          timestamp: new Date().toISOString()
        },
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json',
          },
          timeout: 5000 + (attempt * 1000) // 5s timeout + 1s per retry
        }
      );
      
      return response.data;
    } catch (error) {
      lastError = error;
      
      // If it's a server error (4xx/5xx), don't retry
      if (error.response) {
        throw error;
      }
      
      // For network errors, continue the retry loop unless it's the last attempt
      if (attempt === maxRetries) {
        throw new Error('Failed to connect to server. Please check your internet connection and try again.');
      }
    }
  }
  
  throw lastError;
};

/**
 * Save a pending rating to localStorage
 * @param {object} rating The rating to save
 */
export const savePendingRating = (rating) => {
  try {
    const pendingRatings = JSON.parse(localStorage.getItem('pendingRatings') || '{}');
    pendingRatings[rating.menuItemId] = {
      rating: Number(rating.rating),
      userId: rating.userId,
      timestamp: new Date().toISOString(),
      restaurantId: rating.restaurantId
    };
    localStorage.setItem('pendingRatings', JSON.stringify(pendingRatings));
    return true;
  } catch (error) {
    console.error('Error saving pending rating:', error);
    return false;
  }
};

/**
 * Get all pending ratings from localStorage
 * @returns {object} All pending ratings
 */
export const getPendingRatings = () => {
  try {
    return JSON.parse(localStorage.getItem('pendingRatings') || '{}');
  } catch (error) {
    console.error('Error getting pending ratings:', error);
    return {};
  }
};

/**
 * Remove a pending rating from localStorage
 * @param {string} menuItemId The menu item ID
 */
export const removePendingRating = (menuItemId) => {
  try {
    const pendingRatings = JSON.parse(localStorage.getItem('pendingRatings') || '{}');
    if (pendingRatings[menuItemId]) {
      delete pendingRatings[menuItemId];
      localStorage.setItem('pendingRatings', JSON.stringify(pendingRatings));
    }
    return true;
  } catch (error) {
    console.error('Error removing pending rating:', error);
    return false;
  }
};

/**
 * Get a user ID, either from auth context or generate an anonymous one
 * @param {object} user The user object from auth context
 * @returns {string} A user ID
 */
export const getUserId = (user) => {
  // Try to get from user object
  if (user?.id) return user.id;
  
  // Try to get from localStorage
  let anonymousUserId = localStorage.getItem('anonymousUserId');
  if (!anonymousUserId) {
    // Generate unique ID if none exists
    anonymousUserId = 'anon_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('anonymousUserId', anonymousUserId);
  }
  return anonymousUserId;
};

export default {
  submitRating,
  checkServerConnectivity,
  savePendingRating,
  getPendingRatings,
  removePendingRating,
  getUserId
};