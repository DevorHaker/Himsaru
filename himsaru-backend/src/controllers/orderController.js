import prisma from '../models/prisma.js';

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, firstName, lastName, email, phone, address, city, state, pincode } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No order items' });
    }

    // Create the order with nested items
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalAmount,
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        status: 'PENDING',
        items: {
          create: items.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.img || item.image || null,
          }))
        }
      },
      include: {
        items: true
      }
    });

    res.status(201).json({ status: 'success', data: order });
  } catch (error) {
    console.error('[Create Order Error] Full error:', JSON.stringify(error, null, 2));
    console.error('[Create Order Error] Message:', error.message);
    console.error('[Create Order Error] Code:', error.code);
    res.status(500).json({ status: 'error', message: error.message || 'Could not create order' });
  }
};

// Get current user's orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ status: 'success', data: orders });
  } catch (error) {
    console.error('[Get My Orders Error]:', error);
    res.status(500).json({ status: 'error', message: 'Could not fetch your orders' });
  }
};

// Admin: Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ status: 'success', data: orders });
  } catch (error) {
    console.error('[Get All Orders Error]:', error);
    res.status(500).json({ status: 'error', message: 'Could not fetch orders' });
  }
};

// Admin: Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true }
    });
    
    res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    console.error('[Update Order Error]:', error);
    res.status(500).json({ status: 'error', message: 'Could not update order status' });
  }
};
