

var clickComCtrl = false;

$(document).ready(function () {

    var allLinks = document.links;

    // Bind the event handler to each link individually
    for (var i = 0, n = allLinks.length; i < n; i++) {
        //allLinks[i].addEventListener('click', function (event) {});
        allLinks[i].onclick = function (clic) {
            if (clic.ctrlKey) {
                clickComCtrl = true;
            }
        };
    }

    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();
    configraLinkAcessoComTelaCarregamento()
    configureBackToTop();

    mostrarMenuAcessoRapido();
    configuraCarrouselBotoesNavegacao();


    $(".verificaAcesso").each(verificaAcesso)
    //https://jsbin.com/ziwod/2/edit?html,js,output
    // request permission on page load
    document.addEventListener('DOMContentLoaded', function () {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    });
});



function notifyMe() {
    if (!Notification) {
        alert('Desktop notifications not available in your browser. Try Chromium.');
        return;
    }

    if (Notification.permission !== "granted")
        Notification.requestPermission();
    else {
        var notification = new Notification('Notification title teste tsste teste teste', {
            icon: '/Management/GestaoPublicacao/Thumbnail?idFile=5291cb82-bcfb-4159-a1a0-81d129304372',
            body: "Hey there! You've been notified!",
        });

        notification.onclick = function () {
            window.open("http://stackoverflow.com/a/13328397/1269037");
        };

        chrome.notifications.create('reminder', {
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Don\'t forget!',
            message: 'You have  things to do. Wake up, dude!'
        }, function (notificationId) { });

    }

}



function customnotify(title, desc, url) {

    
    if (get_browser().name != "IE") {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
        else {
            var notification = new Notification(title, {
                icon: '/Management/GestaoPublicacao/Thumbnail?idFile=5291cb82-bcfb-4159-a1a0-81d129304372',
                body: desc,
            });

            /* Remove the notification from Notification Center when clicked.*/
            notification.onclick = function () {
                window.open(url);
            };

            /* Callback function when the notification is closed. */
            notification.onclose = function () {
                console.log('Notification closed');
            };

        }
    }
}

function getNavigatorName() {
    var ua = navigator.userAgent, tem,
    M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join(' ');
}

function get_browser() {
    var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return { name: 'IE', version: (tem[1] || '') };
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\bOPR|Edge\/(\d+)/)
        if (tem != null) { return { name: 'Opera', version: tem[1] }; }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) { M.splice(1, 1, tem[1]); }
    return {
        name: M[0],
        version: M[1]
    };
}
function verificaAcesso(item, item2) {

    var role = $(item2).attr('role');

    var dados = {};

    dados.role = role;

    chamaAjax(dados, "/RoleSecurity/PossuiAcesso", function (result) {
        if (!result) {
            $(item2).html("<strong>Acesso Restrito</strong>")
        }
    });
}


function mostrarMenuAcessoRapido() {
    $("#menuAcessoRapido").show();
}

function EsconderMenuAcessoRapido() {
    $("#menuAcessoRapido").hide();
}

function EsconderCaminhoNavegacao() {
    $("#menuCaminhoNavegacao").hide();
}

function configraLinkAcessoComTelaCarregamento() {
    $("a[tipo='linkAcesso']").click(mostrarTelaCarregamento);
    $("input[tipo='linkAcesso']").click(mostrarTelaCarregamento);
    $(".linkAcesso").click(mostrarTelaCarregamento);

    $("a[tipo='linkAcesso2']").click(mostrarTelaCarregamentoSemTempo);
    $("input[tipo='linkAcesso2']").click(mostrarTelaCarregamentoSemTempo);
    $(".linkAcesso2").click(mostrarTelaCarregamentoSemTempo);
}
function mostrarTelaCarregamento() {
    var $ag = $("#mdlAguarde");
    $ag.modal("show");

    if (clickComCtrl) {
        clickComCtrl = false;
        esconderTelaCarregamento();


    }

    setInterval(function () {
        esconderTelaCarregamento();
        //alert(document.readyState)            
    }, 200000);

}

function mostrarTelaCarregamentoSemTempo() {
    var $ag = $("#mdlAguarde");
    $ag.modal("show");

    if (clickComCtrl) {
        clickComCtrl = false;
        esconderTelaCarregamento();


    }

}

function esconderTelaCarregamento() {
    var $ag = $("#mdlAguarde");
    $ag.modal("hide");
}

function abrirModalAguardando() {

    $("#messageModalDivMsgHeader").html("<h4><span class='glyphicon glyphicon-cloud-download'></span> Download em andamento</h4>");
    $("#messageModalDivMsgBody").html("Aguarde que em alguns segundos seu download será iniciado automaticamente...");


    $("#messageModalDiv").modal();

}

function abrirModalNecessidadeLogin() {
    var url = '/Account/Login?returnUrl=' + $(location).attr('href').replace($(location).attr('origin'),"");
    $("#messageModalDivMsgHeader").html("<h4><span class='icon_lock'></span> Protegido</h4>");
    $("#messageModalDivMsgBody").html('Você precisa estar logado para acessar este conteúdo.</br><a href="'+url+'">Clique aqui</a> para realizar o login.');


    $("#messageModalDiv").modal();

}


function abrirModalPergunta(msgHeader, msgBody, functionOnConfirm) {

    $("#confirmModalDivMsgBody").html(msgBody);

    $("#confirmModalDivMsgHeader").html("<h4><span class='glyphicon glyphicon-question-sign'></span> " + msgHeader + "</h4>");

    $('#confirmModalDiv').modal({ backdrop: true }).one('click', '#confirm', function () {

        functionOnConfirm();
    });
    return false;
}

function abrirModalSucessoComFuncao(msgHeader, msgBody, functionOnConfirm) {

    $("#messageModalDivMsgBody").html(msgBody);

    $("#messageModalDivMsgHeader").html("<h4><span class='glyphicon glyphicon-ok'></span> " + msgHeader + "</h4>");

    $('#messageModalDiv').modal({ backdrop: true }).on('hidden.bs.modal', function () {

        functionOnConfirm();

    });
    return false;
}

function mensagem(mensagemAserExibida) {
    abrirModal('glyphicon-info-sign', 'Mensagem', mensagemAserExibida)
}


function abrirModal(glyphicon, messageHeader, messageBody) {
    $("#messageModalDivMsgHeader").html("<h4><span class='glyphicon " + glyphicon + "'></span> " + messageHeader + "</h4>");
    $("#messageModalDivMsgBody").html(messageBody);

    $("#messageModalDiv").modal();
}

var urlExists = function (url, callback) {

    if (!$.isFunction(callback)) {
        throw Error('Not a valid callback');
    }

    var urlToCall = "http://query.yahooapis.com/v1/public/yql?" +
    "q=select%20*%20from%20html%20where%20url%3D%22" +
    encodeURIComponent(url) +
    "%22&format=xml'&callback=?"
    alert(urlToCall)
    $.getJSON(urlToCall,
    function (data) {
        console.log(data)
        if (data.results[0]) {
            alert('21')
            $.proxy(callback, true)
        }
        else {
            alert('22')
            $.proxy(callback, false)
        }
    }
    );

};

function chamaAjax(dados, url, callback) {
    ajaxCallerToAntiforgery(dados, 'POST', url, callback,
    function () { $("#mdlAguarde").modal("show"); },
    function () { $("#mdlAguarde").modal("hide"); },
   alertarErroProcessamento)
}

function ajaxCallerToAntiforgery(dados, type, urlDestino, callbackSucesso, callbackBeforeSend, callbackComplete, callBackError) {

    var result = true;

    $.ajax({
        url: urlDestino,
        data: dados,
        type: type,
        success: function (obj) {
            if (!(callbackSucesso == undefined)) {
                callbackSucesso(obj)
            }
        },
        beforeSend: function (obj) {
            if (!(callbackBeforeSend == undefined)) {
                callbackBeforeSend(obj);
            }
        },
        complete: function (obj) {
            if (!(callbackComplete == undefined)) {
                callbackComplete(obj);
            }
        },
        error: function (obj) {
            if (!(callBackError == undefined)) {
                callBackError(obj);
            }
        }
    });

    return result;
}
function ajaxCallerJsonToAntiforgery(dados, type, urlDestino, callbackSucesso, callbackBeforeSend, callbackComplete, callBackError) {

    var result = true;

    $.ajax({
        url: urlDestino,
        data: dados,
        type: type,
        dataType: "json",
        success: function (obj) {
            if (!(callbackSucesso == undefined)) {
                callbackSucesso(obj)
            }
        },
        beforeSend: function (obj) {
            if (!(callbackBeforeSend == undefined)) {
                callbackBeforeSend(obj);
            }
        },
        complete: function (obj) {
            if (!(callbackComplete == undefined)) {
                callbackComplete(obj);
            }
        },
        error: function (obj) {
            if (!(callBackError == undefined)) {
                callBackError(obj);
            }
        }
    });

    return result;
}
function alertarErroProcessamento(erro) {
    alert('Ocorreu um erro ao processar sua solicitação. Tente novamente.')
    console.log(erro)
}

function configureBackToTop() {
    // browser window scroll (in pixels) after which the "back to top" link is shown
    var offset = 300,
        //browser window scroll (in pixels) after which the "back to top" link opacity is reduced
        offset_opacity = 1200,
        //duration of the top scrolling animation (in ms)
        scroll_top_duration = 700,
        //grab the "back to top" link
        $back_to_top = $('.cd-top');

    //hide or show the "back to top" link
    $(window).scroll(function () {
        ($(this).scrollTop() > offset) ? $back_to_top.addClass('cd-is-visible') : $back_to_top.removeClass('cd-is-visible cd-fade-out');
        if ($(this).scrollTop() > offset_opacity) {
            $back_to_top.addClass('cd-fade-out');
        }
    });

    //smooth scroll to top
    $back_to_top.on('click', function (event) {
        event.preventDefault();
        $('body,html').animate({
            scrollTop: 0,
        }, scroll_top_duration
        );
    });
}

function configuraCarrouselBotoesNavegacao() {

    //$('.botoesNavegacao-xs').slick({
    //    dots: true,
    //    infinite: true,
    //    speed: 300,
    //    slidesToShow: 6,
    //    slidesToScroll: 1,
    //    autoplay: true,
    //    autoplaySpeed: 5000,
    //});

    //$('.botoesNavegacao-sm').slick({
    //    dots: true,
    //    infinite: true,
    //    speed: 300,
    //    slidesToShow: 8,
    //    slidesToScroll: 1,
    //    autoplay: true,
    //    autoplaySpeed: 5000,
    //});

    //$('.botoesNavegacao-md').slick({
    //    dots: true,
    //    infinite: true,
    //    speed: 300,
    //    slidesToShow: 10,
    //    slidesToScroll: 1,
    //    autoplay: true,
    //    autoplaySpeed: 5000,
    //});

    //$('.botoesNavegacao-lg').slick({
    //    dots: true,
    //    infinite: true,
    //    speed: 300,
    //    slidesToShow: 10,
    //    slidesToScroll: 1,
    //    autoplay: true,
    //    autoplaySpeed: 5000,
    //});
}


function loadBootstrap(event) {

    if (event.name == 'mode' && event.editor.mode == 'source')
        return; // Skip loading jQuery and Bootstrap when switching to source mode.

    var jQueryScriptTag = document.createElement('script');
    var bootstrapScriptTag = document.createElement('script');

    //jQueryScriptTag.src = 'https://code.jquery.com/jquery-1.11.3.min.js';
    //bootstrapScriptTag.src = 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js';

    jQueryScriptTag.src = '/Scripts/jquery-1.11.3.min.js';
    bootstrapScriptTag.src = '/Scripts/bootstrap.min.js';

    var editorHead = event.editor.document.$.head;

    editorHead.appendChild(jQueryScriptTag);
    jQueryScriptTag.onload = function () {
        editorHead.appendChild(bootstrapScriptTag);
    };
}



function fazerLogoff() {
    abrirModalPergunta("Realizar Logoff", "Deseja realizar logoff do site do TCM?", function () {

        mostrarTelaCarregamento();
        //var urlatual = getUrlParcial() + '/Account/LogOff'

      //  window.location.href = 'https://sso.staging.acesso.gov.br/logout?post_logout_redirect_uri=' + urlatual ;
        document.getElementById('logoutForm').submit();
    })

}

function getUrlParcial() {
    var urlCompleto = window.location.href;
    var protocolo = window.location.protocol + "//";

    // Encontre a posição da primeira barra após o protocolo
    var posicaoBarra = urlCompleto.indexOf("/", protocolo.length);

    // Extraia o URL até a primeira barra após o protocolo
    var urlParcial = urlCompleto.substring(0, posicaoBarra);

    return urlParcial;
}