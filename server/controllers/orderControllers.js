const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const RazorPay = require('razorpay');

// Import Utils
const { updateInventoryQuantity } = require('../utils/inventoryUtils');
const { checkLowStockAndAlert } = require('../utils/cronJobs');

// Import Schemas
const Order = require('../schemas/orderSchema');
const Pizza = require('../schemas/pizzaSchema');
const User = require('../schemas/userSchema');
const sendEmail = require('../middlewares/nodemailerMiddleware');

// Initialize Controllers

// @desc Create Razorpay Order
// @route POST /api/orders/checkout
// @access Private

const createRazorpayOrder = asyncHandler(async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

    if (keyId && keySecret && !keyId.includes('your_razorpay')) {
      try {
        const instance = new RazorPay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const options = {
          amount: Math.round(Number(amount) * 100),
          currency: currency || 'INR',
          receipt: new mongoose.Types.ObjectId().toString(),
          payment_capture: 1,
        };

        const order = await instance.orders.create(options);
        if (order) {
          console.log(`[Razorpay] Live Order Created: ${order.id}`.cyan);
          return res.status(200).json({ ...order, key_id: keyId });
        }
      } catch (apiError) {
        console.error(`[Razorpay API] ${apiError.error?.description || apiError.message}`.yellow);
        // Fall back to demo order in development so checkout can still be tested
        if (process.env.NODE_ENV === 'development') {
          console.log('[Razorpay Fallback] Providing demo test order for testing...'.yellow);
          const demoOrder = {
            id: `order_test_${Date.now()}`,
            entity: 'order',
            amount: Math.round(Number(amount) * 100),
            amount_paid: 0,
            amount_due: Math.round(Number(amount) * 100),
            currency: currency || 'INR',
            receipt: new mongoose.Types.ObjectId().toString(),
            status: 'created',
            isDemoOrder: true,
          };
          return res.status(200).json(demoOrder);
        }
        res.status(apiError.statusCode || 500);
        throw new Error(apiError.error?.description || apiError.message);
      }
    } else {
      const demoOrder = {
        id: `order_test_${Date.now()}`,
        entity: 'order',
        amount: Math.round(Number(amount) * 100),
        amount_paid: 0,
        amount_due: Math.round(Number(amount) * 100),
        currency: currency || 'INR',
        receipt: new mongoose.Types.ObjectId().toString(),
        status: 'created',
        isDemoOrder: true,
      };
      return res.status(200).json(demoOrder);
    }
  } catch (error) {
    console.error(error);
    res.status(500);
    const errMsg = (error && error.error && error.error.description) || error.description || error.message || 'Razorpay Order Creation Failed';
    throw new Error(errMsg);
  }
});

const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, deliveryAddress, salesTax, deliveryCharges, totalPrice, payment } = req.body;

  if (!orderItems && !Array.isArray(orderItems) && orderItems.length === 0) {
    res.status(400);
    throw new Error('No Order Items');
  } else {
    if (
      !deliveryAddress ||
      (!deliveryAddress.phoneNumber &&
        !deliveryAddress.address &&
        !deliveryAddress.city &&
        !deliveryAddress.postalCode &&
        !deliveryAddress.country)
    ) {
      res.status(400);
      throw new Error('No Delivery Address');
    } else {
      if (isNaN(totalPrice) || totalPrice <= 0) {
        res.status(400);
        throw new Error('Invalid Total Price');
      } else {
        if (deliveryCharges < 0) {
          res.status(400);
          throw new Error('Invalid Delivery Charges');
        } else {
          if (salesTax < 0) {
            res.status(400);
            throw new Error('Invalid Sales Tax');
          } else {
            if (!payment || !['stripe', 'razorpay'].includes(payment.method)) {
              res.status(400);
              throw new Error('Invalid Payment Method');
            } else {
              if (payment.method === 'stripe' && !payment.stripePaymentIntentId) {
                res.status(400);
                throw new Error('Invalid Stripe Payment Intent Id');
              } else {
                if (payment.method === 'razorpay' && !payment.razorpayOrderId) {
                  res.status(400);
                  throw new Error('Invalid Razorpay Order Id');
                } else {
                  // Iterate through orderItems to deduct items from inventory
                  for (const orderItem of orderItems) {
                    const pizza = await Pizza.findById(orderItem._id);
                    if (!pizza) {
                      res.status(404).json({ message: 'Pizza Not Found!' });
                      return;
                    }

                    await updateInventoryQuantity(pizza, orderItem.qty);
                  }

                  // Check if any inventory item dropped below threshold & alert admin
                  checkLowStockAndAlert(false).catch((err) => console.error('[LowStockAlert]', err.message));

                  const order = new Order({
                    user: req.user._id,
                    orderItems: orderItems.map((orderItem) => ({
                      pizza: orderItem._id,
                      qty: orderItem.qty,
                      price: orderItem.price,
                    })),
                    deliveryAddress,
                    salesTax,
                    deliveryCharges,
                    totalPrice,
                    payment,
                  });

                  const createdOrder = await order.save();

                  if (createdOrder) {
                    // Send Email Notification to User
                    const user = await User.findById(req.user._id);
                    if (user && user.email) {
                      const emailSubject = 'Order Confirmation';
                      const emailBody = `
                        <h1>Thank you for your order!</h1>
                        <p>Your order has been successfully created.</p>
                        <p>Order Details:</p>
                        <ul>
                          ${orderItems
                            .map((item) => `<li>${item.qty} x ${item.name}</li>`)
                            .join('')}
                        </ul>
                        <p>Total Price: ₹${totalPrice}</p>
                        <p>Delivery Address: ${deliveryAddress.address}, ${deliveryAddress.city}, ${
                        deliveryAddress.postalCode
                      }, ${deliveryAddress.country}</p>
                        <p>We will notify you once your order is out for delivery.</p>
                        <p>Thank you for choosing our service!</p>
                      `;

                      await sendEmail({
                        to: user.email,
                        subject: `KaDpinozz Order Confirmed! (#${createdOrder._id.toString().slice(-6)})`,
                        templateOptions: {
                          title: 'Healthy Pizza Order Confirmed! 🌿',
                          greeting: `Hi ${user.name || 'Foodie'},`,
                          message: `
                            <p>Thank you for ordering with <strong>KaDpinozz Healthy Pizza &amp; Snacks</strong>!</p>
                            <p>Your payment via <strong>Razorpay</strong> was successful and our kitchen is preparing your wholesome, freshly baked meal.</p>
                            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; margin: 20px 0;">
                              <h4 style="color: #065f46; margin-top: 0; margin-bottom: 8px;">Order Summary:</h4>
                              <ul style="color: #1f2937; margin: 0; padding-left: 20px;">
                                ${orderItems.map((item) => `<li>${item.qty}x ${item.name} (₹${item.price})</li>`).join('')}
                              </ul>
                              <p style="font-weight: 800; color: #047857; margin-top: 12px; margin-bottom: 4px;">Total Paid: ₹${totalPrice}</p>
                              <p style="font-size: 0.85rem; color: #4b5563; margin: 0;">Deliver to: ${deliveryAddress.address}, ${deliveryAddress.city}, ${deliveryAddress.postalCode}</p>
                            </div>
                            <p style="font-size: 0.9rem; color: #64748b;">We'll notify you when your artisanal healthy pizza is on its way!</p>
                          `,
                        },
                      });
                    }

                    res.status(200).json({
                      createdOrder,
                      message: 'Order Created Successfully!',
                    });
                  } else {
                    res.status(500);
                    throw new Error('Order Creation Failed!');
                  }
                }
              }
            }
          }
        }
      }
    }
  }
});

// @desc    Get Orders by User Id
// @route   GET /api/orders/user
// @access  Private

const getOrdersByUserId = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });

  if (orders) {
    res.status(200).json(orders);
  } else {
    res.status(404);
    throw new Error('Orders Not Found!');
  }
});

// @desc    Get all Orders
// @route   GET /api/orders
// @access  Admin

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({});

  if (orders) {
    res.status(200).json(orders);
  } else {
    res.status(404);
    throw new Error('Orders Not Found!');
  }
});

// @desc    Get Order by Id
// @route   GET /api/orders/:id
// @access  Private/Admin

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    res.status(200).json(order);
  } else {
    res.status(404);
    throw new Error('Order Not Found!');
  }
});

// @desc    Update Order by Id
// @route   PUT /api/orders/:id
// @access  Admin

const updateOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = req.body.status || order.status;

    if (order.status === 'Delivered') {
      order.deliveredAt = Date.now();
      // Send delivery email to user
      const user = await User.findById(order.user);
      if (user && user.email) {
        await sendEmail({
          to: user.email,
          subject: 'Your Pizza Order Has Been Delivered!',
          templateOptions: {
            title: 'Order Delivered',
            greeting: `Hi ${user.name || ''},`,
            message: `Your order <b>${order._id}</b> has been delivered!<br><br>We hope you enjoy your meal. Thank you for choosing KaDpinozz!`,
          },
        });
      }
    } else {
      order.deliveredAt = undefined;
    }

    const updatedOrder = await order.save();

    if (updatedOrder) {
      res.status(200).json({
        updatedOrder,
        message: 'Order Updated Successfully!',
      });
    } else {
      res.status(500);
      throw new Error('Order Update Failed!');
    }
  } else {
    res.status(404);
    throw new Error('Order Not Found!');
  }
});

// @desc    Delete Order by Id
// @route   DELETE /api/orders/:id
// @access  Admin

const deleteOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);

  if (order) {
    res.status(200).json({
      message: 'Order Deleted Successfully!',
    });
  } else {
    res.status(404);
    throw new Error('Order Not Found!');
  }
});

// Export Controllers
module.exports = {
  createRazorpayOrder,
  createOrder,
  getOrdersByUserId,
  getAllOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
};
