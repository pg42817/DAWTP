function extraFiles() {
    var newFile = $(`
    <div class="w3-row w3-margin-bottom"  id="extra_files>
        <div class="w3-row w3-margin-bottom">
            <div class="w3-col s3">
                <label class="w3-text-teal"><b>Description</b></label>
            </div>
            <div class="w3-col s9 w3-border">
                <input class="w3-input w3-border w3-light-grey" type="text" name="desc">
            </div>
        </div>
        <div class="w3-row w3-margin-bottom">
            <div class="w3-col s3">
                <label class="w3-text-teal"><b>Select file</b></label>
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