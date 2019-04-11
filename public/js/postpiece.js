$( document ).ready(function() {

  // SUBMIT FORM
    $("#pieceForm").submit(function(event) {
    // Prevent the form from submitting via the browser.
    event.preventDefault();
    ajaxPost();
  });


    function ajaxPost(){
      // PREPARE FORM DATA
      let fData = {
        title : $("#title").val(),
        owner :  $("#owner").val(),
        description : $("#description").val(),
        composer :  $("#composer").val(),
        parts : $("#parts").val()
      }

      console.log('Finished form Data');
      console.log('\n' + JSON.stringify(fData));

      // DO POST
      $.ajax({
      type : "POST",
      contentType : "application/json",
      url : window.location + "pieces/create",
      data : JSON.stringify(fData),
      dataType : 'json',
      success : function(piece) {
        $("#postResultDiv").html("<p>" +
          "Post Successfully! <br>" +
          "--> " + piece.title + " " + piece.owner + " " + piece.composer + " " + piece.parts + "</p>");
      },
      error : function(e) {
        alert("Error!")
        console.log("ERROR: ", e);
      }
    });

      // Reset FormData after Posting
      resetData();

    }

    function resetData(){
      $("#title").val("");
      $("#owner").val("");
    }
})
