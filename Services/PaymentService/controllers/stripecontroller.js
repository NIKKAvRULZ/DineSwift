require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/payment');
const axios = require('axios');

// Create checkout session
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('WARNING: Stripe API key is missing. Please check your .env file.');
}
exports.createCheckoutSession = async (req, res) => {
  try {
    const { orderId, customerId, restaurantId, items, totalAmount, deliveryAddress } = req.body;

    if (!orderId || !customerId || !restaurantId || !items || !totalAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Format line items for Stripe
    const lineItems = items.map(item => {
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // Stripe requires amount in cents
        },
        quantity: item.quantity,
      };
    });

    // Add delivery fee
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Delivery Fee',
        },
        unit_amount: 499, // $4.99 delivery fee
      },
      quantity: 1,
    });

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      metadata: {
        orderId,
        customerId,
        restaurantId
      },
    });

    // Create a pending payment in the database
    // Update this part in the createCheckoutSession function
const payment = await Payment.create({
  orderId,
  customerId,
  restaurantId,
  amount: totalAmount,
  status: 'pending',
  paymentMethod: 'card',
  stripeSessionId: session.id,
  transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`, // Generate a unique transaction ID
});

    res.status(200).json({ 
      success: true, 
      sessionId: session.id,
      paymentId: payment._id,
      url: session.url
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session'
    });
  }
};

// Handle webhook from Stripe
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      // Update payment record
      const payment = await Payment.findOneAndUpdate(
        { stripeSessionId: session.id },
        {
          status: 'succeeded',
          stripePaymentId: session.payment_intent,
          updatedAt: Date.now()
        },
        { new: true }
      );

      if (!payment) {
        console.error('Payment record not found for session ID:', session.id);
        return res.status(400).json({ success: false });
      }

      // Notify Order Service about successful payment
      try {
        await axios.put(`${process.env.ORDER_SERVICE_URL}/api/orders/${payment.orderId}`, {
          status: 'confirmed',
          paymentStatus: 'completed'
        });
      } catch (error) {
        console.error('Failed to update order status:', error);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
    }
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.status(200).json({
      success: true,
      status: session.payment_status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching payment status'
    });
  }
};

// Refund payment
exports.refundPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // Check if the payment has a stripePaymentId
    if (!payment.stripePaymentId) {
      // Check if the payment has a stripeSessionId
      if (payment.stripeSessionId) {
        // Try to retrieve the payment intent ID from the session
        try {
          const session = await stripe.checkout.sessions.retrieve(payment.stripeSessionId);
          if (session && session.payment_intent) {
            // Update the payment record with the payment intent ID
            payment.stripePaymentId = session.payment_intent;
            await payment.save();
            console.log("Retrieved and saved payment intent ID from session:", session.payment_intent);
          } else {
            return res.status(400).json({
              success: false,
              error: 'No payment intent found for this session'
            });
          }
        } catch (sessionError) {
          console.error("Error retrieving session:", sessionError);
          return res.status(400).json({
            success: false,
            error: 'Could not retrieve payment information from Stripe'
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          error: 'No payment information available for refund'
        });
      }
    }

    // Now we should have a stripePaymentId to use for refund
    // Create refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentId
    });

    // Update payment status in database
    payment.status = 'refunded';
    payment.updatedAt = Date.now();
    await payment.save();

    res.status(200).json({
      success: true,
      data: {
        payment,
        refund
      }
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process refund: ' + error.message
    });
  }
};