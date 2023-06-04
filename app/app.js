const mp = new MercadoPago('APP_USR-32d13615-32e9-411f-b29b-4768f54d2cf8', {
    locale: 'es-MX'
});
const bricksBuilder = mp.bricks();

const BASE_URL_FORM = 'https://grupocapitolio.com';
const BASE_URL_SERVICE = 'https://pay.grupocapitolio.com';

const url = window.location.search;
const params = new URLSearchParams(url);
const idp = params.get('idp');
if (idp === null) {
    window.location.href = `${BASE_URL_FORM}`;
}

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
                'error': `${BASE_URL_FORM}/pay/?idp=${idp}`,
                'return': `${BASE_URL_FORM}/adm/info.php?idp=${idp}&e=approved`
            }
        }
    };
    window.statusScreenBrickController = await bricksBuilder.create(
        'statusScreen',
        'statusScreenBrick_container',
        settings,
    );
};
const renderCardPaymentBrick = async (bricksBuilder) => {
    const settings = {
        initialization: {
            amount: 300, // monto a ser pago
            payer: {
                // email: "test_user_632256697@testuser.com"
                // email : "katlyn07@gmail.com"
            },
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
                cardFormData.idp = idp;
                //  callback llamado cuando el usuario haga clic en el botón enviar los datos
                //  ejemplo de envío de los datos recolectados por el Brick a su servidor
                return new Promise((resolve, reject) => {
                    console.log(JSON.stringify(cardFormData, null, '\t'))
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

renderCardPaymentBrick(bricksBuilder);