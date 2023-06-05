const ENV = process.env.ENVIRONMENT;
const API_KEY = process.env.PUBLIC_KEY;
const BASE_URL_FORM = process.env.BASE_URL_FORM;
const BASE_URL_SERVICE = process.env.BASE_URL_SERVICE;
const BACK_ERROR_URL = process.env.BACK_ERROR_URL;
const BACK_RETURN_URL = process.env.BACK_RETURN_URL;

const mp = new MercadoPago(API_KEY, {
    locale: 'es-MX'
});
const bricksBuilder = mp.bricks();

let IDP;

const getClientInfo = async () => {
    try {
        const url = window.location.search;
        const params = new URLSearchParams(url);
        IDP = params.get('idp');

        if (IDP === null && ENV === 'prod') {
            window.location.href = `${BASE_URL_FORM}`;
        }

        const response = await fetch(`${BASE_URL_SERVICE}/v1/user?idp=${IDP}`);
        if (!response.ok) {
            throw new Error('Error al extraer datos del cliente.');
        }
        const data = await response.json();

        if (data.client === null) {
            window.location.href = `${BASE_URL_FORM}`;
        }
        // console.log(data);
        const {cliente, domicilio, numero, colonia, mensual = 10} = data.client;
        // Procesar los datos obtenidos de la API
        const mensualElement = document.getElementById('mensual');
        if (mensualElement) {
            mensualElement.textContent = `Estarás realizando un pago por $${mensual.toFixed(2)} MXN`;
        }

        const descriptionElement = document.getElementById('description');
        if (descriptionElement) {
            descriptionElement.textContent = `Hola ${cliente}, tu servicio va dirigido a 
            la dirección ${domicilio} ${numero}, ${colonia}`;
        }


        await renderCardPaymentBrick(bricksBuilder, mensual);
    } catch (error) {
        console.error(error);
    }
}

const renderCardPaymentBrick = async (bricksBuilder, amount) => {
    const settings = {
        initialization: {
            amount: amount, // monto a ser pago
            payer: {},
        },
        customization: {
            visual: {
                style: {
                    theme: 'bootstrap', // | 'dark' | 'bootstrap' | 'flat'
                }
            },
            paymentMethods: {
                minInstallments: 1,
                maxInstallments: 1,
            },
        },
        callbacks: {
            onReady: () => {
                // callback llamado cuando Brick esté listo
            },
            onBinChange: (bin) => {
                // callback llamado cada vez que se cambia el bin de la tarjeta
            },
            onSubmit: (cardFormData) => {
                cardFormData.idp = IDP;
                //  callback llamado cuando el usuario haga clic en el botón enviar los datos
                //  ejemplo de envío de los datos recolectados por el Brick a su servidor
                return new Promise((resolve, reject) => {
                    // console.log(JSON.stringify(cardFormData, null, '\t'))
                    fetch(`${BASE_URL_SERVICE}/v1/payment`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(cardFormData)
                    })
                        .then(response => response.json())
                        .then((response) => {
                            // recibir el resultado del pago
                            let {payment: {id: paymentId}} = response
                            renderStatusScreenBrick(bricksBuilder, paymentId);
                            resolve();
                        })
                        .catch((error) => {
                            // tratar respuesta de error al intentar crear el pago
                            console.log(error);
                            reject();
                        })
                });
            },
            onError: (error) => {
                // callback llamado para todos los casos de error de Brick
                console.log(error)
            },
        },
    };
    window.cardPaymentBrickController = await bricksBuilder.create(
        'cardPayment',
        'cardPaymentBrick_container',
        settings
    );
};

const renderStatusScreenBrick = async (bricksBuilder, paymentId) => {
    const settings = {
        initialization: {
            paymentId: paymentId, // id de pago para mostrar
        },
        callbacks: {
            onReady: () => {
                /*
                  Callback llamado cuando Brick está listo.
                  Aquí puede ocultar cargamentos de su sitio, por ejemplo.
                */
                const statusScreenBrick = document.getElementById("statusSection")
                const cardPaymentBrick = document.getElementById("cardSection")

                cardPaymentBrick.classList.add('animate__animated', 'animate__fadeOutDown');

                cardPaymentBrick.addEventListener('animationend', () => {
                    cardPaymentBrick.style.display = 'none';

                    statusScreenBrick.classList.add('animate__animated', 'animate__fadeInUp');
                    statusScreenBrick.classList.remove('is-hidden');
                });
            },
            onError: (error) => {
                // callback llamado solicitada para todos los casos de error de Brick
                console.error(error);
            },
        },
        customization: {
            visual: {
                showExternalReference: true
            },
            backUrls: {
                'error': `${BACK_ERROR_URL}?idp=${IDP}`,
                'return': `${BACK_RETURN_URL}?idp=${IDP}&e=approved`
            }
        }
    };
    window.statusScreenBrickController = await bricksBuilder.create(
        'statusScreen',
        'statusScreenBrick_container',
        settings,
    );
};


document.addEventListener('DOMContentLoaded', getClientInfo)