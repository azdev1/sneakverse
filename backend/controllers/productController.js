import getProductModel from '../models/productModel.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  const Product = getProductModel();

  try {
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i'
          }
        }
      : {};

    const category = req.query.category ? { category: req.query.category } : {};
    const brand = req.query.brand ? { brand: req.query.brand } : {};

    // Combine queries
    const query = { ...keyword, ...category, ...brand };

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  const Product = getProductModel();

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Invalid product ID format' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  const Product = getProductModel();

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product removed successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const Product = getProductModel();

  try {
    const {
      name,
      price,
      description,
      image,
      images,
      brand,
      category,
      sizes,
      colors,
      stock,
      isFeatured,
      featuredImage,
      specs
    } = req.body;

    const product = await Product.create({
      name: name || 'Sample Name',
      price: price || 0,
      description: description || 'Sample description',
      image: image || '/uploads/placeholder-sneaker.png',
      images: images || [],
      brand: brand || 'Sample Brand',
      category: category || 'Casual Sneakers',
      sizes: sizes || [8, 9, 10, 11],
      colors: colors || [{ name: 'Default Black', hex: '#000000' }],
      stock: stock || 10,
      isFeatured: isFeatured || false,
      featuredImage: featuredImage || '',
      specs: specs || {},
      reviews: [],
      rating: 5.0,
      numReviews: 0
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  const Product = getProductModel();

  try {
    const {
      name,
      price,
      description,
      image,
      images,
      brand,
      category,
      sizes,
      colors,
      stock,
      isFeatured,
      featuredImage,
      specs
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      const updateData = {
        name: name !== undefined ? name : product.name,
        price: price !== undefined ? price : product.price,
        description: description !== undefined ? description : product.description,
        image: image !== undefined ? image : product.image,
        images: images !== undefined ? images : product.images,
        brand: brand !== undefined ? brand : product.brand,
        category: category !== undefined ? category : product.category,
        sizes: sizes !== undefined ? sizes : product.sizes,
        colors: colors !== undefined ? colors : product.colors,
        stock: stock !== undefined ? stock : product.stock,
        isFeatured: isFeatured !== undefined ? isFeatured : product.isFeatured,
        featuredImage: featuredImage !== undefined ? featuredImage : product.featuredImage,
        specs: specs !== undefined ? specs : product.specs
      };

      const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, {
        new: true
      });

      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;
  const Product = getProductModel();

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => String(r.user) === String(req.user._id)
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
        createdAt: new Date().toISOString()
      };

      // Create updated reviews array
      const reviews = [...product.reviews, review];
      const numReviews = reviews.length;
      
      const ratingSum = reviews.reduce((acc, item) => item.rating + acc, 0);
      const avgRating = numReviews > 0 ? ratingSum / numReviews : 0;

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          reviews,
          numReviews,
          rating: avgRating
        },
        { new: true }
      );

      res.status(201).json({ message: 'Review added', product: updatedProduct });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
