//executa o pedido de produtor e elimina o botao da DOM
function pedir_produtor(id)
{   
    var myobj = document.getElementById(id)
    myobj.remove()

    $.post('/users/pedido-produtor');
    alert("Pedido efetuado com sucesso");


}


// NAO ESTOU A CONSEGUIR ELIMINAR A TABELA CASO ESTEJA VAZIA

//Aceita o pedido para produtor e elimina a linha da tabela do DOM
function aceitar_pedido(mail)
{   
    var myobj = document.getElementById(mail)
    myobj.remove()

    $.post('/users/aceitar-pedido/' + mail);
    alert("Aprovado com sucesso");

    User.list_pedidos_produtor()
            .then(pedidos => {
            })
            .catch(erro => done(erro))
}

//Recusa o pedido para produtor e elimina a linha da tabela do DOM
function recusar_pedido(mail)
{   
    var myobj = document.getElementById(mail)
    myobj.remove()
    $.post('/users/aceitar-pedido/' + mail);
    alert("Recusado com sucesso");

    User.list_pedidos_produtor()
    .then(pedidos => {
    })
    .catch(erro => done(erro))
}

