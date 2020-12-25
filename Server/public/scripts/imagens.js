function showImage(id,extensao, name) {
    console.log(name + '.' + extensao)
    if (extensao == 'image/png' || extensao == 'image/jpeg')
        var ficheiro = '<img src="/fileStore/' + id+ '" width="80%"/>'
    else
        var ficheiro = '<p>'  + name + ', ' + extensao + '</p>'
    
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
    
    var download = $('<div><a href="/users/pubs/download/' + id + '.' + extensao+ '">Download</a></div>')
    $("#display").empty()
    $("#display").append(fileObj, download)
    $("#display").modal()
}