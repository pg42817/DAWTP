function add_comentario(user,pub_author,pub_date,index) {

    var comentario = $("input[id=input" + index + "]").val();
    var newFile = $(`
    <p>${user} - ${comentario}</p>
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
