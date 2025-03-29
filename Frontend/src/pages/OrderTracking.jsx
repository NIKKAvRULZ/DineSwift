import { useState, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';

const OrderTracking = () => {
  const { activeOrder } = useOrder();
  const navigate = useNavigate();
  const [estimatedTime, setEstimatedTime] = useState(30);

  useEffect(() => {
    if (!activeOrder) {
      navigate('/orders');
      return;
    }

    // Simulate countdown
    const timer = setInterval(() => {
      setEstimatedTime((prev) => Math.max(0, prev - 1));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [activeOrder, navigate]);

  if (!activeOrder) {
    return null;
  }

  const getStatusSteps = () => {
    const steps = [
      { id: 'confirmed', title: 'Order Confirmed', description: 'Your order has been received' },
      { id: 'preparing', title: 'Preparing', description: 'Restaurant is preparing your food' },
      { id: 'ready', title: 'Ready for Pickup', description: 'Your order is ready for pickup' },
      { id: 'picked_up', title: 'Picked Up', description: 'Driver has picked up your order' },
      { id: 'delivering', title: 'On the Way', description: 'Your order is on the way' },
      { id: 'delivered', title: 'Delivered', description: 'Enjoy your meal!' }
    ];

    const currentStepIndex = steps.findIndex(step => step.id === activeOrder.status);
    return steps.map((step, index) => ({
      ...step,
      status: index < currentStepIndex ? 'complete' : index === currentStepIndex ? 'current' : 'upcoming'
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Order #{activeOrder.id}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Estimated delivery in {estimatedTime} minutes
          </p>
        </div>

        {/* Progress Steps */}
        <div className="px-4 py-5 sm:p-6">
          <nav aria-label="Progress">
            <ol role="list" className="overflow-hidden">
              {getStatusSteps().map((step, stepIdx) => (
                <li key={step.id} className={stepIdx !== getStatusSteps().length - 1 ? 'pb-10' : ''}>
                  <div className="relative flex items-start group">
                    {step.status === 'complete' ? (
                      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-green-500">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : step.status === 'current' ? (
                      <div className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-blue-600">
                        <span className="h-2.5 w-2.5 bg-blue-600 rounded-full"></span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-gray-300">
                        <span className="h-2.5 w-2.5 bg-transparent rounded-full"></span>
                      </div>
                    )}
                    <div className="ml-4 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {step.title}
                      </div>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                  </div>
                  {stepIdx !== getStatusSteps().length - 1 && (
                    <div className="absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"></div>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Order Details */}
        <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Delivery Address</dt>
              <dd className="mt-1 text-sm text-gray-900">{activeOrder.deliveryAddress}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Restaurant</dt>
              <dd className="mt-1 text-sm text-gray-900">{activeOrder.restaurantName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Order Total</dt>
              <dd className="mt-1 text-sm text-gray-900">${activeOrder.total?.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
              <dd className="mt-1 text-sm text-gray-900">Credit Card (...{activeOrder.paymentLast4})</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking; 