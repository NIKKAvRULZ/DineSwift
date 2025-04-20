// const Stripe = require("stripe");
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// const getPayments = async (req, res) => {
//   try {
//     // Fetch all payment intents
//     const payments = await stripe.paymentIntents.list({
//       limit: 10,  // Adjust the limit as needed
//     });

//     const paymentData = await Promise.all(
//       payments.data.map(async (payment) => {
//         let paymentMethodInfo = "No payment method";
//         let customerInfo = "No customer data";

//         // Check if there's a valid payment method
//         if (payment.payment_method) {
//           try {
//             const paymentMethod = await stripe.paymentMethods.retrieve(payment.payment_method);
//             paymentMethodInfo = paymentMethod.card ? `${paymentMethod.card.brand} •••• ${paymentMethod.card.last4}` : "No card details";
//           } catch (err) {
//             paymentMethodInfo = "Error retrieving payment method";
//           }
//         }

//         // Check if there's a valid customer
//         if (payment.customer) {
//           try {
//             const customer = await stripe.customers.retrieve(payment.customer);
//             customerInfo = {
//               id: customer.id,
//               email: customer.email,
//               name: customer.name || "No name provided",
//             };
//           } catch (err) {
//             customerInfo = "Error retrieving customer";
//           }
//         }

//         return {
//           amount: payment.amount_received / 100, // Convert from cents to dollars
//           currency: payment.currency.toUpperCase(),
//           status: payment.status,
//           paymentMethod: paymentMethodInfo,
//           customer: customerInfo,
//           createdAt: new Date(payment.created * 1000).toLocaleString(), // Format date
//         };
//       })
//     );

//     res.json({ payments: paymentData });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports = { getPayments };










const Stripe = require("stripe");
const axios = require("axios");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const getPayments = async (req, res) => {
  try {
    // Fetch all payment intents
    const payments = await stripe.paymentIntents.list({
      limit: 10,
    });

    const paymentData = await Promise.all(
      payments.data.map(async (payment) => {
        let paymentMethodInfo = "No payment method";
        let customerInfo = "No customer data";

        if (payment.payment_method) {
          try {
            const paymentMethod = await stripe.paymentMethods.retrieve(payment.payment_method);
            paymentMethodInfo = paymentMethod.card
              ? `${paymentMethod.card.brand} •••• ${paymentMethod.card.last4}`
              : "No card details";
          } catch (err) {
            paymentMethodInfo = "Error retrieving payment method";
          }
        }

        if (payment.customer) {
          try {
            const customer = await stripe.customers.retrieve(payment.customer);
            customerInfo = {
              id: customer.id,
              email: customer.email,
              name: customer.name || "No name provided",
            };

            // ✅ Send Email Notification to customer
            await axios.post("http://localhost:5006/api/notifications/email", {
              to: customer.email,
              subject: "DineSwift Payment Info",
              message: `Hi ${customer.name || "Customer"},\n\nYour payment of ${(payment.amount_received / 100).toFixed(2)} ${payment.currency.toUpperCase()} was processed successfully.\n\nThank you for using DineSwift!`,
            });

          } catch (err) {
            customerInfo = "Error retrieving customer";
          }
        }

        return {
          amount: payment.amount_received / 100,
          currency: payment.currency.toUpperCase(),
          status: payment.status,
          paymentMethod: paymentMethodInfo,
          customer: customerInfo,
          createdAt: new Date(payment.created * 1000).toLocaleString(),
        };
      })
    );

    res.json({ payments: paymentData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getPayments };


