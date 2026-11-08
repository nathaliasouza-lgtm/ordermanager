document.addEventListener('DOMContentLoaded', () => {
    const payment_date = document.getElementById('payment_date');
    const handling_deadline = document.getElementById('handling_deadline');
  try{
        payment_date.addEventListener('change', ()=>{
            var paymentDate = payment_date.value;
            var paymentDateValue = Date.parse(paymentDate);

            var THREE_DAYS_IN_MS = 3 * (24*60*60*1000)
            threeDaysDeadline = paymentDateValue + THREE_DAYS_IN_MS

            handlingDeadLineValue = new Date(threeDaysDeadline);
            handling_deadline.value = `${handlingDeadLineValue.toLocaleDateString()} ${handlingDeadLineValue.toLocaleTimeString()}`;
        });
    
  }catch(err){
    return console.error('ERROR: ', err)
  }

});