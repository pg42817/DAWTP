function extraFiles() {
    var newFile = $(`
    <div class="w3-row w3-margin-bottom"  id="extra_files>
        <div class="w3-row w3-margin-bottom">
            <div class="w3-col s3">
                <label class="w3-text-blue"><b>Tema</b></label>
            </div>
            <div class="w3-col s9 w3-border">
                <input class="w3-input w3-border w3-light-grey" type="text" name="theme">
            </div>
        </div>
        <div class="w3-row w3-margin-bottom">
            <div class="w3-col s3">
                <label class="w3-text-blue"><b>Titulo</b></label>
            </div>
            <div class="w3-col s9 w3-border">
                <input class="w3-input w3-border w3-light-grey" type="text" name="title">
            </div>
        </div>
        <div class="w3-row w3-margin-bottom">
            <div class="w3-col s3">
                <label class="w3-text-blue"><b>Visibilidade</b></label>
            </div>
            <div class="w3-col s9 w3-border">
                <input class="w3-input w3-border w3-light-grey" list="list" name="visibility" id="visibility">
                <datalist id="list">
                <option value="Privado">
                <option value="Público">
            </datalist>
            </div>
        </div>
        <div class="w3-row w3-margin-bottom">
            <div class="w3-col s3">
                <label class="w3-text-blue"><b>Select file</b></label>
            </div>
            <div class="w3-col s9 w3-border">
                <input class="w3-input w3-border w3-light-grey" type="file" name="myFile">
            </div>
        </div>  
    </div>
        `)
    $("#extra_files").append(newFile)
    console.log('test')
}

