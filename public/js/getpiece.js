$( document ).ready(function() {

  // GET REQUEST
  $("#allPieces").click(function(event){
    event.preventDefault();
    ajaxGet();
  });

  // DO GET
  function ajaxGet(){
    $.ajax({
      type : "GET",
      url : "/pieces/all",
      success: function(result){
        $('#getResultDiv ul').empty();
        $.each(result, function(i, piece){
          $('#getResultDiv .list-group').append(piece.title + " " + piece.owner + " " + piece.composer + " " + piece.description + " " + piece.parts + "<br>")
        });
        console.log("Success: ", result);
      },
      error : function(e) {
        $("#getResultDiv").html("<strong>Error</strong>");
        console.log("ERROR: ", e);
      }
    });
  }
})
