document.addEventListener('DOMContentLoaded', () => {
  const activated_cb = document.getElementById('activated');
  const addProduct = document.getAnimations('add-product');

  addProduct.addEventListener('submit', ()=>{
    if (activated_cb.checked){
        activated_cb.value = true;
        var activation_date = new Date().toISOString();
    }
  });

  
});