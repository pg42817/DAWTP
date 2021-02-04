exports.infor = infor

// POST Confirmation HTML Page Template -------------------------------------
function infor(pub,utilizador){
    let pagHTML = `
    <html>
    <head>
        <title></title>
        <link rel="stylesheet" href="/stylesheets/style.css">
        <link rel="stylesheet" href="/jquery.modal.min.css">
        <script src="/jquery-3.5.1.min.js"></script>
        <script src="/scripts/extraFiles.js"></script>
        <script src="/scripts/giveRating.js"></script>
        <script src="/jquery.modal.min.js"></script>
        <script src="/scripts/imagens.js"></script>
        <script src="/scripts/perfil.js"></script>
        <script src="/scripts/comentarios.js"></script>
    </head>
    <body>
    <div class="w3-bar w3-blue w3-large">
        <a href="/users/news" class="w3-bar-item w3-button ">Notícias</a> 
        <a href="/mural" class="w3-bar-item w3-button ">Mural</a> 
        <a href="/users/perfil" class="w3-bar-item w3-button">Perfil</a><a href="/users/logout" class="w3-bar-item w3-button" style="float: right";>Logout</a>
        <a href="javascript:history.back()" class="w3-bar-item w3-button" style="float: right">Página Anterior</a>
    </div>
    
    <br>
    <br>
    <div class="w3-card-4 modal" id="display"></div>
        <div class="w3-container w3-margin-top  w3-display-topmiddle" style="top:80px" >
            <div class="w3-container w3-blue">` 
            
            if(pub.author==utilizador.mail)
            {
                pagHTML += `<a class="w3-bar-item w3-button" href="/users/perfil" style="display: flex; justify-content: center">${pub.author} - ${pub.data_created.substr(0,16).replace("T", " ")}</a>
                </div>`
            }
            else
            {
                pagHTML += `<a class="w3-bar-item w3-button" href='/users/perfis/${pub.author}' style="display: flex; justify-content: center">${pub.author} - ${pub.data_created.substr(0,16).replace("T", " ")}</a>
                </div>`
            }
            pagHTML +=`
            <div class="w3-container w3-card-4" style="width:1000px">
            <p style="text-align: justify;text-justify: inter-word;"> <b>Tema: </b> ${pub.theme}</p>   
            <p style="text-align: justify;text-justify: inter-word;"> <b>Descrição: </b>${pub.description}</p>   
            <p> Avaliação da publicação: ${pub.pub_rating}</p> 
            <div> 
                <button class="accordion">Recursos</button>
                <div class="panel">`

            pub.resources.forEach( recurso => {
                var check = true;
                pagHTML += `
                <div>
                    <p style="display: inline-block"> Titulo: ${recurso.title}</p>
                    <img src="/download_icon.png" style="display: inline-block;width:30px;height:30px" onclick="showFile('${recurso.id}','${recurso.extension}','${pub.author}','${recurso.title}')"> 
                </div>
                    <p> Avaliação do recurso: ${recurso.rating}</p> `
                    
                    
            recurso.rating_list.forEach(rating=>{
                if (rating.rating_mail == utilizador.mail){
                    check=false
                    pagHTML += `<div>
                        <p style="display: inline-block"> Minha avaliação do recurso</p>  
                        <input class="w3-input w3-border w3-light-grey" type='text' name='rating' style="display: inline-block;width: 150px;" value=${rating.value} readonly="readonly" onclick='giveRating("${pub.id}","${recurso.id}")')>
                    </div>`
                }}) 
            if (check){
                pagHTML += `<div>
                                <p style="display: inline-block"> Minha avaliação do recurso</p>  
                                <input class="w3-input w3-border w3-light-grey" type='text' name='rating' style="display: inline-block;width: 150px;" readonly="readonly" onclick='giveRating("${pub.id}","${recurso.id}")')>
                            </div>`
            }})            
                
            pagHTML += `<a class="w3-bar-item w3-button w3-blue-grey" href="/users/pubs/downloadtodos/${pub.id}/${pub.author}" style="float: left">Download de todos os recursos</a>`

            pagHTML += `</div>
            <p>Comentários</p>`

            pub.comments.forEach( comentario => {
                pagHTML += `<p style="display: flex; justify-content: left"> ${comentario.author_mail} -  ${comentario.data.substr(0,16).replace("T", " ")} - ${comentario.text} </p>`
            })
            
            pagHTML += `
                    <div id=0>
                    </div>
                    <div>
                        <input class="w3-input w3-border w3-light-grey" type="text" id="input0" style="display: inline-block;width: 810px;"><input class="w3-btn w3-left w3-left w3-blue-grey w3-right" type="submit" style="display: inline-block;width: 150px;" value="Comentar" onclick="add_comentario('${utilizador.mail}','${pub.author}','${pub.data_created}','0')">
                    </div>
                    <div>
                    <br>`
            if (utilizador.role=="administrador" || (utilizador.role=="produtor" && utilizador.mail==pub.author)){
                pagHTML += `<a class="w3-bar-item w3-button w3-blue-grey" href="/users/pubs/delete/${pub.id}" style="float: left">Eliminar Publicação</a>`
            }
            if ((utilizador.role=="produtor" || utilizador.role=="administrador") && utilizador.mail==pub.author) {
                pagHTML += `<a class="w3-bar-item w3-button w3-blue-grey" href="/users/pubs/edit/${pub.id}" style="float: left">Editar Publicação</a>`
            }   
        pagHTML += ` </div>


    <script>
    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
        } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
        } 
    });
    }
    </script>

</body>
</html>
`
return pagHTML
}

