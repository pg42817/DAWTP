function showImage(id,extensao,autor,name) {
    console.log(name + '.' + extensao)
    if (extensao == 'png' || extensao == 'jpeg')
        var ficheiro = '<img src="/fileStore/'+autor + '/' + id+ '.'+ extensao +  '" width="80%"/>'
    else
        var ficheiro = '<p>'  + name + ', ' + extensao + '</p>'
    
    alert(extensao)
    var fileObj = $(`
        <div class="w3-row w3-margin">
            <div class="w3-col s6">
                ${ficheiro}
            </div>
            <div class="w3-col s6 w3-border">
                <p>Filename: ${name}</p>
                <p>Mimetype: ${extensao}</p>
            </div>
        </div>
    `)
    
    var download = $('<div><a href="/users/pubs/download/' + id + '.' + extensao+ '/' + autor + '">Download</a></div>')
    $("#display").empty()
    $("#display").append(fileObj, download)
    $("#display").modal()
}