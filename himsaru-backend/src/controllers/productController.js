import prisma from '../models/prisma.js';

// GET /api/products
// Public route to fetch all active products
export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ status: 'success', data: products });
  } catch (error) {
    console.error('[Get Products Error]:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch products' });
  }
};

// GET /api/products/admin/all
// Admin route to fetch ALL products (all statuses)
export const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ status: 'success', data: products });
  } catch (error) {
    console.error('[Get All Products Admin Error]:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch products' });
  }
};

// GET /api/products/:identifier
// Public route to fetch a single product by ID or slug
export const getProduct = async (req, res) => {
  try {
    const { identifier } = req.params;
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: identifier },
          { slug: identifier },
        ],
        status: 'ACTIVE',
      },
    });

    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    res.status(200).json({ status: 'success', data: product });
  } catch (error) {
    console.error('[Get Product Error]:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch product' });
  }
};

// POST /api/products
// Admin only route to create a product
export const createProduct = async (req, res) => {
  try {
    const { name, slug, category, description, pricing, stock, images, sku, isFeatured } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { slug } });
    if (existingProduct) {
      return res.status(400).json({ status: 'error', message: 'Product with this slug already exists' });
    }

    const existingSku = await prisma.product.findUnique({ where: { sku } });
    if (existingSku) {
      return res.status(400).json({ status: 'error', message: 'Product with this SKU already exists' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        category,
        description,
        pricing,
        stock,
        images: images || [],
        sku,
        isFeatured: isFeatured || false,
      },
    });

    res.status(201).json({ status: 'success', message: 'Product created', data: product });
  } catch (error) {
    console.error('[Create Product Error]:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create product' });
  }
};

// PUT /api/products/:id
// Admin only route to update a product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    res.status(200).json({ status: 'success', message: 'Product updated', data: product });
  } catch (error) {
    console.error('[Update Product Error]:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update product' });
  }
};

// DELETE /api/products/:id
// Admin only route to delete a product (soft delete by setting status to ARCHIVED)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
    res.status(200).json({ status: 'success', message: 'Product archived' });
  } catch (error) {
    console.error('[Delete Product Error]:', error);
    res.status(500).json({ status: 'error', message: 'Failed to archive product' });
  }
};
