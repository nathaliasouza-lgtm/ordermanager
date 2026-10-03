document.addEventListener('DOMContentLoaded', () => {
  const activated_cb = document.getElementById('activated');
  const activation_date = document.getElementById('activation_date');
  const newProductForm = document.getElementById('new-prod');
  const price = document.getElementById('price');
  
  try{
    newProductForm.addEventListener('submit', (event)=>{
      price.value = price.value.trim().replace(',', '.');
      if (activated_cb.checked){
        activated_cb.value = 1;

        const date = new Date();
        activation_date.value = date.toISOString().replace(/\s*\(.*\)$/, '');

      }else{
        activated_cb.value = 1;
        activation_date.value = null;
        activation_date.disabled = true;
      }
      if (!checkPrice(price)) {
        event.preventDefault(); // Impede o envio do formulário se for inválido
      }


    });
  }catch(err){
    return console.error('ERROR: ', err)
  }

});
function checkPrice(price){
  const priceInserted = price.value.trim().replace(',', '.');
  const priceConverted = Number(priceInserted);
  const priceErr = document.getElementById('priceErr');
  if (priceInserted === '' || Number.isNaN(priceConverted) || priceConverted <= 0) {
    priceErr.textContent = 'Por favor, insira um preço válido e maior que zero.';
    priceErr.style.display = 'block';
    return false;
  }
  return true;
} 

