const deleteProduct = (btn) => {
  const prodId = btn.parentNode.querySelector('[name=productId]').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

  const productElement = btn.closest('article');

  fetch('/admin/product/' + prodId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf
    }
  })
  .then(result => {
    // productElement.remove(); // Doesn't work in IE (go figure)
    productElement.parentNode.removeChild(productElement);
    return result.json();
  })
  .then(data => {
    console.log(data);
  })
  .catch(err => console.log(err));
};