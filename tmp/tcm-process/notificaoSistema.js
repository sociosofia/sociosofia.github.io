$(function () {
    //ConfiguraAlerta();
});

function ConfiguraAlerta() {
    // Reference the auto-generated proxy for the hub.
    var chat = $.connection.liveDataShareHub;

    // Create a function that the hub can call to broadcast messages.
    chat.client.shareLiveData = function (message) {
        // Html encode display name and message.         
        var encodedMsg = $('<div />').text(message).html();

        ExibirAlerta(message);
    };

    $.connection.hub.start()
        .done(function () {
            //chat.server.registerConId($('#displayname').val());
            console.log('Now connected, connection ID=' + $.connection.hub.id);
        })
        .fail(function () {
            console.log('Could not Connect!');
        });
}


function ExibirAlerta(message) {
    //alert(message);
    mensagemTelaCompleta(message);
    notifyNavigator(message);
}

function mensagemTelaCompleta(mensagemAserExibida) {
    abrirModal('glyphicon-info-sign', 'Mensagem da NTI/UTDS', mensagemAserExibida)
}

function notifyNavigator(message) {

    var html = message;
    var div = document.createElement("div");
    div.innerHTML = html;
    message = div.textContent || div.innerText || "";

    if (!Notification) {
        alert('Desktop notifications not available in your browser. Try Chromium.');
        return;
    }

    if (Notification.permission !== "granted")
        Notification.requestPermission();
    else {
        var notification = new Notification('Mensagem da NTI/UTDS', {
            icon: '/Content/Images/Favicon/android-icon-144x144.png',
            body: message,
        });

        notification.onclick = function () {
            window.open("https://portal.tcm.sp.gov.br");
        };

    }
}