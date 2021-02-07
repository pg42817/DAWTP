function showFile(id,extensao,autor,name) {
    switch(extensao){
        case 'png':
            var ficheiro = '<img src="/fileStore/'+autor + '/' + id+ '.'+ extensao +  '"style="max-width:100%; height:80%;/>'
            break
        case 'jpeg':
            var ficheiro = '<img src="/fileStore/'+autor + '/' + id+ '.'+ extensao +  '"style="max-width:100%; height:80%;/>'
            break
        case 'gif':
            var ficheiro = '<img src="/fileStore/'+autor + '/' + id+ '.'+ extensao +  '"style="max-width:100%; height:80%/>'
            break
        case 'txt':
            var ficheiro = '<object type="text/plain" data="/fileStore/'+autor + '/' + id+ '.'+ extensao +  '"style="width:100%; height:80%;/>'
            break
        case 'pdf':
            var ficheiro = '<embed src="/fileStore/'+autor + '/' + id+ '.'+ extensao +  '"style="width:100%; height:80%;/>'
            break
        case 'html':
            var ficheiro = '<embed src="/fileStore/'+autor + '/' + id+ '.'+ extensao +  '"style="width:100%; height:80%;/>'
            break
        case 'mpga':
            var ficheiro = '<audio controls><source src="/fileStore/'+autor + '/' + id+ '.'+ extensao +  '"></audio>'
        case 'wav':
            var ficheiro = '<audio controls><source src="/fileStore/'+autor + '/' + id+ '.'+ extensao +  '"></audio>'
            break
        case 'mp4':
            var ficheiro ='<video width="100%" height="80%" controls><source src="/fileStore/'+autor + '/' + id+ '.'+ extensao +  '"></video>' 
            break
        case 'json':
            var ficheiro = '<div id="debug" style="width:100%; height:80%;overflow-y: auto;></div>'
            fetch("/fileStore/"+autor + "/" + id+ "."+ extensao)
            .then(response=>response.json())
            .then(data=>{
                document.getElementById("debug").innerText=JSON.stringify(data,undefined,2)
            })
            break;
        case 'xml':
            var ficheiro = '<div id="debug2" style="width:100%; height:80%;overflow-y: auto;></div>'
            fetch("/fileStore/"+autor + "/" + id+ "."+ extensao)
            .then(response=>response.text())
            .then(data=>{
                let parser = new DOMParser();
                let xml = parser.parseFromString(data,'application/xml')
                document.getElementById("debug2").innerText=data
            })
            break;
        default:
            var ficheiro = '<p>'  + name + ', ' + extensao + '</p>'
    }
        
    var fileObj = $(`
        <div class="w3-border" style="vertical-align:middle; text-align:center;">
            ${ficheiro}
        </div>
        <div class="w3-border" style="vertical-align:middle; text-align:center;">
            <p>
            <b><label class="w3-text-blue">Filename: </label></b> ${name}
            <br>
            <b><label class="w3-text-blue">Extensão: </label></b> ${extensao}
        </div>
    `)
    var download = $('<div style="vertical-align:middle; text-align:center;"><a class="w3-button w3-blue" href="/users/pubs/download/' + id + '.' + extensao+ '/'+ name +'/' + autor + '">Download</a></div>')
    $("#display").empty()
    $("#display").append(fileObj, download)
    $("#display").modal('show')
}


