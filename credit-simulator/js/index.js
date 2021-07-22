var preco, poupancas, taxa, anos, emprestimo, selo, registo, comissoes, imt, imi, taxas = 0,
    valortotal, i, j, precototal, taeg, despesas, segurovida, segurorisco, precomes;

var urlParams = new URLSearchParams(window.location.search);
var taxaeuribor = urlParams.get('euribor');
var cor = urlParams.get('cor');

function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function obterEuribor() {
    $.get('https://raw.githubusercontent.com/wyozi/euribor/master/12months.csv', function euriborAtual(data) {
        var euribor = $("<pre>").html(data).text();
        var euriborarray = Papa.parse(euribor);
        var euriboratual = euriborarray.data[euriborarray.data.push() - 2][1];
        if (urlParams.get('euribor') == euriboratual) {} else {
            urlParams.append('euribor', euriboratual);
            window.location.search = urlParams;
        }
    });
};

function calcularJuros(taxa, anos, emprestimo) {
    var resultado = 0;
    var taxas = 0;
    if (Array.isArray(taxa)) {
        for (i = 1; i <= parseInt(anos[0]) * 12; i++) {
            resultado = (formulajs.IPMT((parseFloat(taxa[0]) * 0.01) / 12, i, (parseInt(anos[0]) + parseInt(anos[1])) * 12, parseFloat(emprestimo))) * -1;
            taxas = taxas + resultado;
        };
        for (j = 1; j <= parseInt(anos[1]) * 12; j++) {
            resultado = (formulajs.IPMT((parseFloat(taxa[1]) * 0.01) / 12, i, (parseInt(anos[0]) + parseInt(anos[1])) * 12, parseFloat(emprestimo))) * -1;
            taxas = taxas + resultado;
            i = i + 1;
        };
    } else {
        for (i = 1; i <= anos * 12; i++) {
            resultado = (formulajs.IPMT((taxa * 0.01) / 12, i, anos * 12, emprestimo)) * -1
            taxas = taxas + resultado;
        };
    }
    return taxas;
}

function calcularImt(preco) {
    switch (true) {
        case preco < 92407:
            return 0;
        case 126403 > preco && preco >= 92407:
            return (preco * 0.02) - 1848.14;
        case 172348 > preco && preco >= 126403:
            return (preco * 0.05) - 5640.23;
        case 287213 > preco && preco >= 172348:
            return (preco * 0.07) - 9087.22;
        case 574323 > preco && preco >= 287213:
            return (preco * 0.08) - 11959.26;
        case preco >= 574323:
            return (preco * 0.06);
    }

}

function impostoSelo(preco) {
    selo = (preco * 0.008) + (preco * 0.006);
    return selo;
}

function seguroVida() {
    if (Array.isArray(anos)) {
        segurovida = (112.92) * (anos[0] + anos[1]);
    } else {
        segurovida = (112.92) * anos;
    }
    return segurovida;
}

function seguroRiscos() {
    if (Array.isArray(anos)) {
        segurorisco = (84.36) * (anos[0] + anos[1]);
    } else {
        segurorisco = (84.36) * anos;
    }
    return segurorisco;
}

function IMI(preco) {
    if (Array.isArray(anos)) {
        imi = (preco * 0.003) * (anos[0] + anos[1]);
    } else {
        imi = (preco * 0.003) * anos;
    }
    return imi;
}

function calcular(preco, poupancas, anos, taxa) {
    emprestimo = preco - poupancas;
    selo = impostoSelo(preco);
    segurovida = seguroVida();
    segurorisco = seguroRiscos();
    registo = 700;
    comissoes = 1000;
    imt = calcularImt(preco);
    imi = IMI(preco);
    taxas = calcularJuros(taxa, anos, emprestimo);
    valortotal = emprestimo + taxas;
    despesas = selo + registo + imt + imi + segurovida + segurorisco;
    encargos = selo + registo + segurovida + segurorisco + taxas;
    if (Array.isArray(anos)) {
        prestacoes = (anos[0] + anos[1]) * 12;
    } else {
        prestacoes = anos * 12;
    }
    precomes = valortotal / prestacoes;
    valortotalfinal = parseFloat(parseFloat(precomes).toFixed(2)) * prestacoes + poupancas;
    precototal = valortotalfinal + despesas;
}

function obterAno() {
    switch (true) {
        case ($('input[name="tipotaxa"]:checked').val() == 1):
            anos = [parseFloat($('input[name="mista"]:checked').val()), parseFloat($("#anosrange").val()) - parseFloat($('input[name="mista"]:checked').val())]
            return anos;
        case ($('input[name="tipotaxa"]:checked').val() == 2):
            anos = parseFloat($("#anosrange").val());
            return anos;
        case ($('input[name="tipotaxa"]:checked').val() == 3):
            anos = parseFloat($("#anosrange").val());
            return anos;
    }
}

function obterTaxa() {
    switch (true) {
        case ($('input[name="tipotaxa"]:checked').val() == 1):
            taxa = [parseFloat($('#taxarangemista').val()), parseFloat($('#spreadrangemista').val()) + parseFloat(taxaeuribor)]
            return taxa;
        case ($('input[name="tipotaxa"]:checked').val() == 2):
            taxa = parseFloat($("#taxarange").val());
            return taxa;
        case ($('input[name="tipotaxa"]:checked').val() == 3):
            taxa = parseFloat($("#spreadrange").val()) + parseFloat(taxaeuribor);
            return taxa;
    }
}

function calculoAutomatico() {
    preco = parseFloat($("#precorange").val());
    poupancas = parseFloat($("#poupancasrange").val());
    emprestimo = preco + poupancas;
    anos = obterAno();
    taxa = obterTaxa();
    calcular(preco, poupancas, anos, taxa);
}

function inserirValores() {
    $("#preco").text(formatNumber(parseFloat(valortotalfinal).toFixed(2)) + " €");
    $("#precomes").text(formatNumber(parseFloat(precomes).toFixed(2)) + " €");
    $("#mensalidades").text(prestacoes);
    $("#precototal").text(formatNumber(parseFloat(precototal).toFixed(2)) + " €");
    $("#outros").text(formatNumber(parseFloat(despesas).toFixed(2)) + " €");
    $("#banco").text(formatNumber(parseFloat(encargos).toFixed(2)) + " €");
    $("#euribor").text(" " + taxaeuribor.replace('.', ',') + " %")
}

function ocultarCampos() {
    $(".taxatext").hide();
    $(".spreadtext").hide();
}

function rangeControlinput(tipo, valor) {
    switch (tipo) {
        case "preco":
            $("#textpreco").val(formatNumber(valor) + " €");
            if (valor <= parseFloat($("#poupancasrange").val())) {
                $("#poupancasrange").val(500);
                rangeControlinput('poupancas', 500);
            } else if ((parseFloat($("#poupancasrange").val()) / valor) < 0.1) {
                $("#poupancasrange").val(parseInt(valor / 10));
                rangeControlinput('poupancas', parseInt(valor / 10));
            }
            Action();
            break;
        case "poupancas":
            $("#textpoupancas").val(formatNumber(valor) + " €");
            if (parseInt(valor) < parseInt($("#precorange").val())) {
                if ((parseInt(valor) / parseInt($("#precorange").val())) < 0.1) {
                    if ((parseInt(valor) + parseInt(parseInt(valor) * 0.9) <= 1000000) && (parseInt(valor) + parseInt(parseInt(valor) * 0.9) >= 5000)) {
                        $('#precorange').val((parseInt(valor) + parseInt(parseInt(valor) * 0.9)));
                        rangeControlinput('preco', (parseInt(valor) + parseInt(parseInt(valor) * 0.9)));
                    } else if ((parseInt(valor) + parseInt(parseInt(valor) * 0.9) < 5000)) {
                        $('#precorange').val(5000);
                        rangeControlinput('preco', parseInt(5000));
                    } else if ((parseInt(valor) + parseInt(parseInt(valor) * 0.9) > 1000000)) {
                        $('#precorange').val(1000000);
                        rangeControlinput('preco', parseInt(1000000));
                    }
                }
            } else {
                if ((parseInt(valor) + parseInt(parseInt(valor) * 0.9) <= 1000000) && (valor + (valor * 0.9) >= 5000)) {
                    $('#precorange').val((parseInt(valor) + parseInt(parseInt(valor) * 0.9)));
                    rangeControlinput('preco', (parseInt(valor) + parseInt(parseInt(valor) * 0.9)));
                } else if ((parseInt(valor) + parseInt(parseInt(valor) * 0.9) < 5000)) {
                    $('#precorange').val(5000);
                    rangeControlinput('preco', parseInt(5000));
                } else if ((parseInt(valor) + parseInt(parseInt(valor) * 0.9) > 1000000)) {
                    $('#precorange').val(1000000);
                    rangeControlinput('preco', parseInt(1000000));
                }
            }
            Action();
            break;
        case "anos":
            $("#textanos").val(parseInt(valor));
            switch (true) {
                case parseInt(valor) > 30:
                    var x = document.getElementsByName("mista");
                    for (let i = 0; i < x.length; i++) {
                        x[i].disabled = false;
                        if (parseInt(x[i].value) == 30) {
                            x[i].checked = true;
                        }
                    }
                    var y = document.getElementsByName("tipotaxa");
                    for (let i = 0; i < y.length; i++) {
                        if ($('input[name="tipotaxa"]:checked').val() == 2) {
                            if (parseInt(y[i].value) == 1) {
                                y[i].checked = true;
                                y[i].disabled = false;
                            } else if (parseInt(y[i].value) == 2) {
                                y[i].disabled = true;
                            }
                            $("#anosoculto").show();
                            $("#taxamistataxas").show();
                        } else {
                            if (parseInt(y[i].value) == 2) {
                                y[i].disabled = true;
                            }
                        }
                    }
                    $(".taxatext").hide();
                    break;
                case (parseInt(valor) <= 30) && (parseInt(valor) > 25):
                    var x = document.getElementsByName("mista");
                    for (let i = 0; i < x.length; i++) {
                        if (parseInt(x[i].value) == 25) {
                            x[i].disabled = false;
                            x[i].checked = true;
                        } else if (parseInt(x[i].value) < 30) {
                            x[i].disabled = false;
                        } else {
                            x[i].disabled = true;
                        }
                    }
                    var y = document.getElementsByName("tipotaxa");
                    for (let i = 0; i < y.length; i++) {
                        y[i].disabled = false;
                    }
                    break;
                case (parseInt(valor) <= 25) && (parseInt(valor) > 20):
                    var x = document.getElementsByName("mista");
                    for (let i = 0; i < x.length; i++) {
                        if (parseInt(x[i].value) == 20) {
                            x[i].disabled = false;
                            x[i].checked = true;
                        } else if (parseInt(x[i].value) < 25) {
                            x[i].disabled = false;
                        } else {
                            x[i].disabled = true;
                        }
                    }
                    var y = document.getElementsByName("tipotaxa");
                    for (let i = 0; i < y.length; i++) {
                        y[i].disabled = false;
                    }
                    break;
                case (parseInt(valor) <= 20) && (parseInt(valor) > 15):
                    var x = document.getElementsByName("mista");
                    for (let i = 0; i < x.length; i++) {
                        if (parseInt(x[i].value) == 15) {
                            x[i].disabled = false;
                            x[i].checked = true;
                        } else if (parseInt(x[i].value) < 20) {
                            x[i].disabled = false;
                        } else {
                            x[i].disabled = true;
                        }
                    }
                    var y = document.getElementsByName("tipotaxa");
                    for (let i = 0; i < y.length; i++) {
                        y[i].disabled = false;
                    }
                    break;
                case (parseInt(valor) <= 15) && (parseInt(valor) > 10):
                    var x = document.getElementsByName("mista");
                    for (let i = 0; i < x.length; i++) {
                        if (parseInt(x[i].value) == 10) {
                            x[i].disabled = false;
                            x[i].checked = true;
                        } else if (parseInt(x[i].value) < 15) {
                            x[i].disabled = false;
                        } else {
                            x[i].disabled = true;
                        }
                    }
                    var y = document.getElementsByName("tipotaxa");
                    for (let i = 0; i < y.length; i++) {
                        y[i].disabled = false;
                    }
                    break;
                case (parseInt(valor) <= 10) && (parseInt(valor) > 7):
                    var x = document.getElementsByName("mista");
                    for (let i = 0; i < x.length; i++) {
                        if (parseInt(x[i].value) == 7) {
                            x[i].disabled = false;
                            x[i].checked = true;
                        } else if (parseInt(x[i].value) < 10) {
                            x[i].disabled = false;
                        } else {
                            x[i].disabled = true;
                        }
                    }
                    var y = document.getElementsByName("tipotaxa");
                    for (let i = 0; i < y.length; i++) {
                        y[i].disabled = false;
                    }
                    break;
                case (parseInt(valor) <= 7) && (parseInt(valor) > 5):
                    var x = document.getElementsByName("mista");
                    for (let i = 0; i < x.length; i++) {
                        if (parseInt(x[i].value) == 5) {
                            x[i].disabled = false;
                            x[i].checked = true;
                        } else if (parseInt(x[i].value) < 7) {
                            x[i].disabled = false;
                        } else {
                            x[i].disabled = true;
                        }
                    }
                    var y = document.getElementsByName("tipotaxa");
                    for (let i = 0; i < y.length; i++) {
                        y[i].disabled = false;
                    }
                    break;
                case (parseInt(valor) <= 5):
                    var x = document.getElementsByName("mista");
                    for (let i = 0; i < x.length; i++) {
                        x[i].disabled = true;
                        x[i].checked = false;
                    }
                    var y = document.getElementsByName("tipotaxa");

                    for (let i = 0; i < y.length; i++) {
                        if ($('input[name="tipotaxa"]:checked').val() == 1) {
                            if (parseInt(y[i].value) == 2) {
                                y[i].checked = true;
                                y[i].disabled = false;
                            } else if (parseInt(y[i].value) == 1) {
                                y[i].disabled = true;
                            }
                            $(".taxatext").show();
                        } else {
                            if (parseInt(y[i].value) == 1) {
                                y[i].disabled = true;
                            }
                        }
                    }
                    $("#anosoculto").hide();
                    $("#taxamistataxas").hide();
            }
            Action();
            break;
    }
}

function mistaClick() {
    ocultarCampos();
    $("#anosoculto").show();
    $("#taxamistataxas").show();
    Action();
}

function fixaClick() {
    $(".taxatext").show();
    $(".spreadtext").hide();
    $("#anosoculto").hide();
    $("#taxamistataxas").hide();
    Action();
}

function varClick() {
    $(".taxatext").hide();
    $(".spreadtext").show();
    $("#anosoculto").hide();
    $("#taxamistataxas").hide();
    Action();
}

function Action() {
    obterEuribor();
    calculoAutomatico();
    inserirValores();
}
$("#textpreco").on({
    click: function() {
        $(this).val('');
    },
    input: function() {
        $(this).mask('0000000');
    },
    change: function() {
        if ($(this).val() == '') {
            $(this).val(formatNumber($("#precorange").val()) + " €")
        } else if ($(this).val().match(/[€]/)) {
            $(this).val(formatNumber($("#precorange").val()) + " €");
        } else if (parseInt($(this).val()) < 5000) {
            $("#precorange").val(5000);
            rangeControlinput("preco", 5000);
        } else if (parseInt($(this).val()) > 1000000) {
            $("#precorange").val(1000000);
            rangeControlinput("preco", 1000000);
        } else {
            $("#precorange").val(parseInt($(this).val()));
            rangeControlinput("preco", parseInt($(this).val()));
        }
    },
    blur: function() {
        if ($(this).val() == '') {
            $(this).val(formatNumber($("#precorange").val()) + " €")
        } else if ($(this).val().match(/[€]/)) {
            $(this).val(formatNumber($("#precorange").val()) + " €");
        } else if (parseInt($(this).val()) < 5000) {
            $("#precorange").val(5000);
            rangeControlinput("preco", 5000);
        } else if (parseInt($(this).val()) > 1000000) {
            $("#precorange").val(1000000);
            rangeControlinput("preco", 1000000);
        } else {
            $("#precorange").val(parseInt($(this).val()));
            rangeControlinput("preco", parseInt($(this).val()));
        }
    }
});
$("#textpoupancas").on({
    click: function() {
        $(this).val('');
    },
    input: function() {
        $(this).mask('000000');
    },
    change: function() {
        if ($(this).val() == '') {
            $(this).val(formatNumber($("#poupancasrange").val()) + " €")
        } else if ($(this).val().match(/[€]/)) {
            $(this).val(formatNumber($("#poupancasrange").val()) + " €");
        } else if (parseInt($(this).val()) < 500) {
            $("#poupancasrange").val(500);
            rangeControlinput("poupancas", 500);
        } else if (parseInt($(this).val()) > 995000) {
            $("#poupancasrange").val(995000);
            rangeControlinput("poupancas", 995000);
        } else {
            $("#poupancasrange").val(parseInt($(this).val()));
            rangeControlinput("poupancas", parseInt($(this).val()));
        }
    },
    blur: function() {
        if ($(this).val() == '') {
            $(this).val(formatNumber($("#poupancasrange").val()) + " €");
        } else if ($(this).val().match(/[€]/)) {
            $(this).val(formatNumber($("#poupancasrange").val()) + " €");
        } else if (parseInt($(this).val()) < 500) {
            $("#poupancasrange").val(500);
            rangeControlinput("poupancas", 500);
        } else if (parseInt($(this).val()) > 995000) {
            $("#poupancasrange").val(995000);
            rangeControlinput("poupancas", 995000);
        } else {
            $("#poupancasrange").val(parseInt($(this).val()));
            rangeControlinput("poupancas", parseInt($(this).val()));
        }
    }
});
$("#textanos").on({
    click: function() {
        $(this).val('');
    },
    input: function() {
        $(this).mask('00');
    },
    change: function() {
        if ($(this).val() == '') {
            $(this).val(formatNumber($("#anosrange").val()))
        } else if (parseInt($(this).val()) < 5) {
            $("#anosrange").val(5);
            rangeControlinput("anos", 5);
        } else if (parseInt($(this).val()) > 40) {
            $("#anosrange").val(40);
            rangeControlinput("anos", 40);
        } else {
            $("#anosrange").val(parseInt($(this).val()));
            rangeControlinput("anos", parseInt($(this).val()));
        }
    },
    blur: function() {
        if ($(this).val() == '') {
            $(this).val(formatNumber($("#anosrange").val()))
        } else if (parseInt($(this).val()) < 5) {
            rangeControlinput("anos", 5);
        } else if (parseInt($(this).val()) > 40) {
            $("#anosrange").val(40);
            rangeControlinput("anos", 40);
        } else {
            $("#anosrange").val(parseInt($(this).val()));
            rangeControlinput("anos", parseInt($(this).val()));
        }
    }
});
$("#taxamistatext").on({
    click: function() {
        $(this).val('');
    },
    input: function() {
        $(this).mask('0Z.0', {
            translation: {
                'Z': {
                    pattern: /[0-9]/,
                    optional: true
                }
            }
        });
    },
    change: function() {
        if ($(this).val() == '') {
            $(this).val($("#taxarangemista").val().replace('.', ',') + " %");
        } else if ($(this).val().match(/[%]/)) {
            $(this).val($("#taxarangemista").val().replace('.', ',') + " %");
        } else if (parseFloat($(this).val()) < 0.1) {
            $("#taxarangemista").val(0.1);
            $(this).val($("#taxarangemista").val().replace('.', ',') + " %");
        } else if (parseFloat($(this).val()) > 10) {
            $("#taxarangemista").val(10);
            $(this).val($("#taxarangemista").val().replace('.', ',') + " %");
        } else {
            $("#taxarangemista").val(parseFloat($(this).val()));
            $(this).val($("#taxarangemista").val().replace('.', ',') + " %");
        }
        Action();
    },
    blur: function() {
        if ($(this).val() == '') {
            $(this).val($("#taxarangemista").val().replace('.', ',') + " %");
        } else if ($(this).val().match(/[%]/)) {
            $(this).val($("#taxarangemista").val().replace('.', ',') + " %");
        } else if (parseFloat($(this).val()) < 0.1) {
            $("#taxarangemista").val(0.1);
            $(this).val($("#taxarangemista").val().replace('.', ',') + " %");
        } else if (parseFloat($(this).val()) > 10) {
            $("#taxarangemista").val(10);
            $(this).val($("#taxarangemista").val().replace('.', ',') + " %");
        } else {
            $("#taxarangemista").val(parseFloat($(this).val()));
            $(this).val($("#taxarangemista").val().replace('.', ',') + " %");
        }
        Action();
    }
});
$("#spreadmistatext").on({
    click: function() {
        $(this).val('');
    },
    input: function() {
        $(this).mask('0Z.0', {
            translation: {
                'Z': {
                    pattern: /[0-9]/,
                    optional: true
                }
            }
        });
    },
    change: function() {
        if ($(this).val() == '') {
            $(this).val($("#spreadrangemista").val().replace('.', ',') + " %");
        } else if ($(this).val().match(/[%]/)) {
            $(this).val($("#spreadrangemista").val().replace('.', ',') + " %");
        } else if (parseFloat($(this).val()) < 0.5) {
            $("#spreadrangemista").val(0.5);
            $(this).val($("#spreadrangemista").val().replace('.', ',') + " %");
        } else if (parseFloat($(this).val()) > 2) {
            $("#spreadrangemista").val(2);
            $(this).val($("#spreadrangemista").val().replace('.', ',') + " %");
        } else {
            $("#spreadrangemista").val(parseFloat($(this).val()));
            $(this).val($("#spreadrangemista").val().replace('.', ',') + " %");
        }
        Action();
    },
    blur: function() {
        if ($(this).val() == '') {
            $(this).val($("#spreadrangemista").val().replace('.', ',') + " %");
        } else if ($(this).val().match(/[%]/)) {
            $(this).val($("#spreadrangemista").val().replace('.', ',') + " %");
        } else if (parseFloat($(this).val()) < 0.5) {
            $("#spreadrangemista").val(0.5);
            $(this).val($("#spreadrangemista").val().replace('.', ',') + " %");
        } else if (parseFloat($(this).val()) > 2) {
            $("#spreadrangemista").val(2);
            $(this).val($("#spreadrangemista").val().replace('.', ',') + " %");
        } else {
            $("#spreadrangemista").val(parseFloat($(this).val()));
            $(this).val($("#spreadrangemista").val().replace('.', ',') + " %");
        }
        Action();
    }
});
$("#taxatext").on({
    click: function() {
        $(this).val('');
    },
    input: function() {
        $(this).mask('0Z.0', {
            translation: {
                'Z': {
                    pattern: /[0-9]/,
                    optional: true
                }
            }
        });
    },
    change: function() {
        if ($(this).val() == '') {
            $(this).val($("#taxarange").val().replace('.', ',') + " %");
        } else if ($(this).val().match(/[%]/)) {
            $(this).val($("#taxarange").val().replace('.', ',') + " %");
        } else if (parseFloat($(this).val()) < 0.1) {
            $("#taxarange").val(0.1);
            $(this).val($("#taxarange").val().replace('.', ',') + " %");
        } else if (parseFloat($(this).val()) > 10) {
            $("#taxarange").val(10);
            $(this).val($("#taxarange").val().replace('.', ',') + " %");
        } else {
            $("#taxarange").val(parseFloat($(this).val()));
            $(this).val($("#taxarange").val().replace('.', ',') + " %");
        }
        Action();
    },
    blur: function() {
        if ($(this).val() == '') {
            $(this).val($("#taxarange").val().replace('.', ',') + " %");
        } else if ($(this).val().match(/[%]/)) {
            $(this).val($("#taxarange").val().replace('.', ',') + " %");
        } else if (parseFloat($(this).val()) < 0.1) {
            $("#taxarange").val(0.1);
            $(this).val($("#taxarange").val().replace('.', ',') + " %");
        } else if (parseFloat($(this).val()) > 10) {
            $("#taxarange").val(10);
            $(this).val($("#taxarange").val().replace('.', ',') + " %");
        } else {
            $("#taxarange").val(parseFloat($(this).val()));
            $(this).val($("#taxarange").val().replace('.', ',') + " %");
        }
        Action();
    }
});
$("#spreadtext").on({
    click: function() {
        $(this).val('');
    },
    input: function() {
        $(this).mask('0Z.0', {
            translation: {
                'Z': {
                    pattern: /[0-9]/,
                    optional: true
                }
            }
        });
    },
    change: function() {
        if ($(this).val() == '') {
            $(this).val($("#spreadrange").val().replace('.', ',') + " %");
        } else if ($(this).val().match(/[%]/)) {
            $(this).val($("#spreadrange").val().replace('.', ',') + " %");
        } else if (parseFloat($(this).val()) < 0.5) {
            $("#spreadrange").val(0.5);
            $(this).val($("#spreadrange").val().replace('.', ',') + " %");
        } else if (parseFloat($(this).val()) > 2) {
            $("#spreadrange").val(2);
            $(this).val($("#spreadrange").val().replace('.', ',') + " %");
        } else {
            $("#spreadrange").val(parseFloat(parseFloat($(this).val()).toFixed(1)));
            $(this).val($("#spreadrange").val().replace('.', ',') + " %");
        }
        Action();
    },
    blur: function() {
        if ($(this).val() == '') {
            $(this).val($("#spreadrange").val().replace('.', ',') + " %");
        } else if ($(this).val().match(/[%]/)) {
            $(this).val($("#spreadrange").val().replace('.', ',') + " %");
        } else if (parseFloat($(this).val()) < 0.5) {
            $("#spreadrange").val(0.5);
            $(this).val($("#spreadrange").val().replace('.', ',') + " %");
        } else if (parseFloat($(this).val()) > 2) {
            $("#spreadrange").val(2);
            $(this).val($("#spreadrange").val().replace('.', ',') + " %");
        } else {
            $("#spreadrange").val(parseFloat($(this).val()).toFixed(1));
            $(this).val($("#spreadrange").val().replace('.', ',') + " %");
        }
        Action();
    }
});

function obterCor() {
    let root = document.documentElement;
    if (cor) {
        root.style.setProperty('--primary-color', "#" + cor);
    }
}
$(window).on("load", function(e) { $('#loading').fadeOut(); })
$(document).ready(function() {
    obterCor()
    Action();
    ocultarCampos();
});