const fs = require('fs');
const fileHelper = require('../util/file');

const { validationResult } =require('express-validator/check');


const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => { // ommit next if not using
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: '',
    validationErrors: [],
  });
}

exports.postAddProduct = (req, res, next) => {
  const {
    title,
    description,
    price
  } = req.body;
  const image = req.file;
  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description
      },
      errorMessage: 'Attached file is not an image.',
      validationErrors: [],
    }); 
  }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    if (req.file.path) {
      fs.unlink(req.file.path, err => console.log(err));
    }
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const imageUrl = image.path;

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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.addDummyProduct = (req, res, next) => {
  const product = new Product({
    title: 'Dummy Product',
    price: 5,
    description: 'This is my dummy product',
    imageUrl: 'images\\dummy.jpg',
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
      console.log('Nope.');
    });
}

exports.getEditProduct = (req, res, next) => { // ommit next if not using
  const editMode = req.query.edit;
  if(!editMode) {
    res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      // throw new Error('Dummy');
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: '',
        validationErrors: [],
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;
  
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Product
    .findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      product.description = updatedDesc;
      // product is mongoose object
      return product.save()
        .then(result => {
          console.log('UPDATED PRODUCT')
          res.redirect('/admin/products');
        });
    })
    
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
}

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
  .then(product => {
    if(!product) {
      return next(new Error('Product not found.'));
    }
    if(product.imageUrl !== 'images\\dummy.jpg') {
      fileHelper.deleteFile(product.imageUrl);
    }
    return  Product.deleteOne({ _id: prodId, userId: req.user._id })
  })
  .then(() => {
    console.log('DESTROYED PRODUCT!');
    res.redirect('/admin/products');
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
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
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}