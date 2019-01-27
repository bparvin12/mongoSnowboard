function displayResults(snowboards) {
    $(".snowboardData").empty();

    snowboards.forEach(function (snowboard) {
        var box = $("<div data-id='" + snowboard._id + "'>").addClass("column box is-6").append(
            $("<h2>").addClass('subtitle').text(snowboard.snowboard),
            $("<h3>").addClass('subtitle').text(snowboard.price),
            $("<figure class='media-center image is-128x128'>").append(($("<img class='media padding'>").attr("src", snowboard.image))),
            $("<br>"),
            $("<textarea class='textarea userNotes' placeholder='notes'></textarea>"),
            $("<a class='button is-info is-centered submitButton' data-id='" + snowboard._id + "'>Submit</a>"),
            $("<div class='box comments'>")
        );

        $(".snowboardData").append(box);
    })
}

//asking backend for all the data
$.getJSON("/allsnowboards", function (data) {
    displayResults(data);
    console.log(data);
});

// When the #make-new button is clicked
$(document).on("click", ".submitButton", function() {
    // AJAX POST call to the submit route on the server
    // This will take the data from the form and send it to the server
    var thisId = $(this).attr("data-id");
    $.ajax({
      type: "POST",
      dataType: "json",
      url: "/snowboards/" + thisId,
      data: {
        note: $(".userNotes").val(),
      }
    })
    // If that API call succeeds, add the title and a delete button for the note to the page
      .then(function(data) {
        console.log(data);

      // Add the title and delete button to the #results section
        // $(".comments").prepend("<p class='data-entry box' data-id=" + data._id + "><span class='dataNote' data-id=" +
        // data._id + ">" + data.note + "</span><span class=delete>X</span></p>");
       
        // Clear the note and title inputs on the page
      $(".userNotes").val("");
        
      });
      
  });