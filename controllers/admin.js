const { validationResult } =require('express-validator/check');

const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => { // ommit next if not using
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: '',
  });
}

exports.postAddProduct = (req, res, next) => {
  const {
    title,
    imageUrl,
    description,
    price
  } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
    });
  }

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user // Mongoose will pick the ID from the user object
  });
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created product!');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => { // ommit next if not using
  const editMode = req.query.edit;
  if(!editMode) {
    res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: '',
      });
    })
    .catch(err => console.log(err));
}

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  
  Product
    .findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.imageUrl = updatedImageUrl;
      product.description = updatedDesc;
      // product is mongoose object
      return product.save()
        .then(result => {
          console.log('UPDATED PRODUCT')
          res.redirect('/admin/products');
        });
    })
    
    .catch(err => console.log(err))
}

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  // Product.findByIdAndRemove(prodId)
  Product.deleteOne({ _id: prodId, userId: req.user._id })
  .then(() => {
    console.log('DESTROYED PRODUCT!');
    res.redirect('/admin/products');
  })
  .catch(err => console.log(err));
}


exports.getProducts = (req, res, next) => {
  Product.find({userId: req.user._id})
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(products => {
      console.log(products);
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin products',
        path: '/admin/products',
      });
    })
    .catch(err => console.log(err));
}