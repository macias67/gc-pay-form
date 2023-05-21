const mp = new MercadoPago('TEST-4a16bdf0-7a39-4a66-aab5-480ae9177361');

const formData = {}


/**********************************************
 * SELECTORS -----------------------------------
 * ********************************************
 */
const cardHolder = document.querySelector("#cardHolder");
const email = document.querySelector("#email");
const cardNumber = document.querySelector("#cardNumber");
const expirationDate = document.querySelector("#expirationDate");
const securityCode = document.querySelector("#securityCode");
const amount = document.querySelector("#amount");

const payButton = document.querySelector("#payButton")
const cancelButton = document.querySelector("#cancelButton")


/**********************************************
 * HELPERS ------------------------------------
 * ********************************************
 */
const getBIN = (vCardNumber) => {
  let plainNumber = vCardNumber.replace(/\s+/g, '').replace(/-/g, '');
  return plainNumber.substring(0, 6);
}


/**********************************************
 * FORMAT -----------------------------------
 * ********************************************
 */
const cardHolderFormat = () => {
  cardHolder.value = cardHolder.value
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
      .replace(/[^a-zA-Z ]/g, ""); // Eliminar caracteres no válidos
}

const cardNumberFormat = () => {
  cardNumber.value = cardNumber.value
      .replace(/\D/g, "") // Eliminar caracteres no numéricos
      .substring(0, 16) // Solo tomar los primeros 16 dígitos
      .match(/.{1,4}/g) // Agrupar en grupos de 4 dígitos
      .join(" ");
}

const expirationDateFormat = () => {
  expirationDate.value = expirationDate.value
      .replace(/\D/g, "") // Eliminar caracteres no numéricos
      .substring(0, 4) // Solo tomar los primeros 4 dígitos
      .replace(/(\d{2})(\d{0,2})/, "$1/$2"); // Formato MM/AA
}

const securityCodeFormat = () => {
  securityCode.value = securityCode.value
      .replace(/[^\d]/g, "") // Eliminar caracteres no numéricos
      .substring(0, 3) // Solo tomar los primeros 3 dígitos
}

const amountFormat = () => {
  // Eliminar caracteres no numéricos
  amount.value = amount.value.replace(/[^0-9.]/g, '');

  // Limitar a dos decimales después del punto
  let parts = amount.value.split('.');
  if (parts.length > 1) {
    parts[1] = parts[1].substring(0, 2);
    amount.value = parts.join('.');
  }
}

const cleanForm = () => {
  document.querySelector("#formPay").reset(); // Limpiar el formulario
}


/**********************************************
 * HANDLERS -----------------------------------
 * ********************************************
 */
const complementsHandler = async () => {
  const vCardNumber = cardNumber.value;
  const bin = getBIN(vCardNumber);
  const { results } = await mp.getPaymentMethods({ bin });

  const issuers = results[0].issuer
  const paymentTypeId = results[0].payment_type_id

  formData.issuer = [{id: issuers.id}]
  formData.payment_type_id = [{id: paymentTypeId}]
}

const paymentHandler = async () => {
  const vCardHolder = cardHolder.value;
  const vEmail = email.value;
  const vCardNumber = cardNumber.value.replace(/\s/g, "");
  const vExpirationDate = expirationDate.value.split("/");
  const vSecurityCode = securityCode.value;
  const vAmount = amount.value;

  // Create token
  const token = await mp.createCardToken({
    cardNumber: vCardNumber,
    cardholderName: vCardHolder,
    cardExpirationMonth: vExpirationDate[0],
    cardExpirationYear: vExpirationDate[1],
    securityCode: vSecurityCode,
  })

  formData.email = vEmail
  formData.token = token.id
  formData.amount = vAmount

  console.log(JSON.stringify(formData))

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  };

  /**
  // Realizar la solicitud utilizando fetch
  fetch('http://capi-pay.test/v1/payment', requestOptions)
      .then(response => response.json())
      .then(data => {
        // La solicitud se completó con éxito
        console.log(data);
        // Aquí puedes manejar la respuesta recibida
      })
      .catch(error => {
        // Ocurrió un error durante la solicitud
        console.error('Error:', error);
      }); */
}


/**********************************************
 * EVENTS -------------------------------------
 * ********************************************
 */

// INPUT
// cardHolder.addEventListener("input", cardHolderFormat);
cardNumber.addEventListener("input", cardNumberFormat);
expirationDate.addEventListener("input", expirationDateFormat);
securityCode.addEventListener("input", securityCodeFormat)
amount.addEventListener("input", amountFormat)

// BLUR
cardNumber.addEventListener("blur", complementsHandler)

// CLICK
payButton.addEventListener("click", async (event) => {
  event.preventDefault();
  try {
    await paymentHandler()
  } catch (error) {
    console.error(error)
  }
})
cancelButton.addEventListener("click", cleanForm)