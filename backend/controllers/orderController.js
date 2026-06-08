import getOrderModel from '../models/orderModel.js';
import getProductModel from '../models/productModel.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalAmount
  } = req.body;

  const Order = getOrderModel();
  const Product = getProductModel();

  try {
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Create order in db
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalAmount
    });

    // Reduce stock of products in order
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        const newStock = Math.max(0, product.stock - item.qty);
        await Product.findByIdAndUpdate(item.product, { stock: newStock });
      }
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  const Order = getOrderModel();

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // In Mongoose we can populate the user name/email, in Mock DB it's already there or we just return it.
      // If mongoose is active, we can populate.
      // Since it could be mongoose or Mock DB, let's keep it robust.
      if (!global.useMockDB && typeof order.populate === 'function') {
        await order.populate('user', 'name email');
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res) => {
  const Order = getOrderModel();

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
          isPaid: true,
          paidAt: new Date().toISOString(),
          status: 'Processing',
          paymentResult: {
            id: req.body.id || 'MOCK_PAYMENT_ID_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
            status: req.body.status || 'COMPLETED',
            update_time: new Date().toISOString(),
            email_address: req.user.email
          }
        },
        { new: true }
      );

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (req, res) => {
  const Order = getOrderModel();

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
          isDelivered: true,
          deliveredAt: new Date().toISOString(),
          status: 'Delivered'
        },
        { new: true }
      );

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  const Order = getOrderModel();

  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  const Order = getOrderModel();

  try {
    // If not using Mock DB, populate the user reference
    let ordersQuery = Order.find({}).sort({ createdAt: -1 });
    let orders;
    
    if (global.useMockDB) {
      orders = await ordersQuery;
    } else {
      orders = await ordersQuery.populate('user', 'id name email');
    }
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
