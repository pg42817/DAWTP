function add_comentario(user,pub_id,index) {

    var comentario = $("input[id=input" + index + "]").val();
    var d = new Date().toISOString().substr(0, 16)
    
    var newFile = $(`
    <p> ${user} : ${comentario} </p>
        `)
    var name="#comentario"+index

    $("#"+index).append(newFile)
    $("#input"+index).val('');

    var data = { 
        "pub_id": pub_id,
        "author": user,
        "text": comentario,
        "data": d }
    $.post('/users/adicionar_comentario', data)
}
