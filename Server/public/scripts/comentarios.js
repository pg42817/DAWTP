function add_comentario(user,pub_author,pub_date,index) {

    var comentario = $("input[id=input" + index + "]").val();
    var newFile = $(`
    <input class="w3-input w3-border w3-light-grey" type="text" value="${user} - ${comentario}" readonly="readonly")>
        `)
    var name="#comentario"+index

    $("#"+index).append(newFile)
    $("#input"+index).val('');

    var data = { 
        "pub_author": pub_author,
        "author": user,
        "text": comentario,
        "data": pub_date}
    $.post('/users/adicionar_comentario', data)
}
