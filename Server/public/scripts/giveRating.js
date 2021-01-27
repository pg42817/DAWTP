function giveRating(pub_id, resource_id) {
    
    var myRating = $(`
<form class="w3-container" action="/users/pubs/rating/${pub_id}/${resource_id}" method="POST">
    <div class="w3-row w3-margin-bottom">
        <div class="w3-col s3">
            <label class="w3-text-blue"><b>Rating</b></label>
        </div>
        <div class="w3-col s9 w3-border">
            <select class="w3-select" name="rating" id="rating style="display: inline-block;width:80%" required>
                <option value=1> 1
                <option value=2> 2
                <option value=3> 3
                <option value=4> 4
                <option value=5> 5
            </select>
        </div>
    </div>
    <input class="w3-btn w3-blue-grey" type="submit" value="Enviar">
</form>
    `)

    $("#display").empty()
    $("#display").append(myRating)
    $("#display").modal()
}