const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => { // ommit next if not using
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  });
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  const product = new Product(title, price, description, imageUrl);
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
  
  const product = new Product(
    updatedTitle,
    updatedPrice,
    updatedDesc,
    updatedImageUrl,
    prodId
  );
  product
  .save()
  .then(result => {
    console.log('UPDATED PRODUCT')
    res.redirect('/admin/products');
  })
  .catch(err => console.log(err))
}

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteById(prodId)
  .then(() => {
    console.log('DESTROYED PRODUCT!');
    res.redirect('/admin/products');
  })
  .catch(err => console.log(err));
}


exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin products',
        path: '/admin/products',
      });
    })
    .catch(err => console.log(err));
}