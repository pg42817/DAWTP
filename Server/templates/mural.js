exports.mural = mural

function mural( user ){
    let pagHTML = `
    <head>
    <title>Mural</title>
    <meta charset="utf-8"/>
    <link rel="icon" href="/favicon.png"/>
    <link rel="stylesheet" href="Server/public/stylesheets/style.css"/>
    <script src="/jquery-3.5.1.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.9.1/jquery.modal.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.9.1/jquery.modal.min.css" />
    </head>
    <body>
        <form class="w3-container" action="/users/logout" method="GET">
            <input class="w3-btn w3-blue-grey" type="submit" value="Logout"/>
        </form>
        <div class="w3-container w3-blue w3-margin-bottom">
            <h2>Mural</h2>
        </div>
    `
        if(user.role=="administrador")
        {
            pagHTML += `
            <p>Bem vindo, admninstrador ${user.name}</p>
      `
        }
        if(user.role=="produtor")
        {
            pagHTML += `
            <p>Bem vindo, produtor ${user.name}</p>
      `
        }
        if(user.role=="consumidor")
        {
            pagHTML += `
            <p>Bem vindo, consumidor ${user.name}</p>
      `
        }
    
    pagHTML += `
    </body>
    </html>
    `
    return pagHTML
}

