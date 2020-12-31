function showFile(id,extensao,autor,name) {
    console.log(name + '.' + extensao)
    switch(extensao){
        case 'png':
            var ficheiro = '<img src="/fileStore/'+autor + '/' + id+ '.'+ extensao +  '"style="max-width:100%; height=auto;/>'
            break
        case 'jpeg':
            var ficheiro = '<img src="/fileStore/'+autor + '/' + id+ '.'+ extensao +  '"style="max-width:100%; height=auto;/>'
            break
        case 'gif':
            var ficheiro = '<img src="/fileStore/'+autor + '/' + id+ '.'+ extensao +  '"style="max-width:100%; height=auto;/>'
            break
        case 'txt':
            var ficheiro = '<object type="text/plain" data="/fileStore/'+autor + '/' + id+ '.'+ extensao +  '"style="width:100%; height=100%;/>'
            break
        case 'pdf':
            var ficheiro = '<embed src="/fileStore/'+autor + '/' + id+ '.'+ extensao +  '"style="width:100%; height=100%;/>'
            break
        case 'html':
            var ficheiro = '<embed src="/fileStore/'+autor + '/' + id+ '.'+ extensao +  '"style="width:100%; height=100%;/>'
            break
        case 'mpga':
            var ficheiro = '<audio controls><source src="/fileStore/'+autor + '/' + id+ '.'+ extensao +  '"></audio>'
        case 'wav':
            var ficheiro = '<audio controls><source src="/fileStore/'+autor + '/' + id+ '.'+ extensao +  '"></audio>'
            break
        case 'mp4':
            var ficheiro ='<video width="320" height="240" controls><source src="/fileStore/'+autor + '/' + id+ '.'+ extensao +  '"></video>' 
            break

        default:
            var ficheiro = '<p>'  + name + ', ' + extensao + '</p>'
    }
        
    var fileObj = $(`
        <div class="w3-row w3-margin">
            <div>
                ${ficheiro}
            </div>
            <div class="w3-border">
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


