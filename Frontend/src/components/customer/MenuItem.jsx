import React, { useState, useCallback } from 'react';
import { useCart } from '../../context/CartContext';
import menuService from '../../services/menuService';
import { useParams } from 'react-router-dom';

const MenuItem = ({ item }) => {
  const { addToCart } = useCart();
  const { id: restaurantId } = useParams();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Load comments when component mounts
  React.useEffect(() => {
    loadComments();
  }, [item._id]);

  const loadComments = async () => {
    try {
      const response = await menuService.getComments(restaurantId, item._id);
      setComments(response.comments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      const userId = localStorage.getItem('userId') || 'anonymous';
      
      const response = await menuService.addComment(restaurantId, item._id, {
        text: newComment.trim(),
        userId
      });

      // Update comments in state
      setComments(prev => [...prev, response.menuItem.comments[response.menuItem.comments.length - 1]]);
      setNewComment('');

    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img 
        src={item.imageUrl} 
        alt={item.name}
        className="w-full h-60 object-contain bg-gray-50 p-2"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
        <p className="mt-1 text-gray-500">{item.description}</p>
        {/* Rating and Comment Icon Row */}
        <div className="mt-4 flex items-center gap-4">
          {/* Rating Stars */}
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-400">★</span>
            ))}
            <span className="ml-1 text-sm text-gray-500">
              ({item.rating || 0})
            </span>
          </div>
          {/* Comment Icon and Count */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Show comments"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{comments.length}</span>
          </button>
        </div>
        {/* Comments Section (below rating/comment row) */}
        {showComments && (
          <div className="mt-4 border-t pt-4">
            <div className="space-y-4">
              {/* Comments List */}
              {comments.map((comment, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{comment.text}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">
                      {new Date(comment.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {comment.user === 'anonymous' ? 'Anonymous User' : `User ${comment.user}`}
                    </p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-gray-500 italic text-center py-2">
                  No comments yet. Be the first to comment!
                </p>
              )}
              {/* Add Comment Form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleAddComment}
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingComment ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Price and Add to Cart Row */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            Rs. {Math.round(item.price)}
          </span>
          <button
            onClick={() => addToCart(item)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItem; 