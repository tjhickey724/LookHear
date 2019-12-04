/*

This is an attempt to refactor old code from scoreappmodule.js from function to class based

*/

/*
Next changes --
Add eventhandler for when the screen size changes...
Make the distances be percentages of the image width
This will scale easily as the screen size changes.
We won't always see the full length of the document but we will
always see the full width...

Somethings are only needed for the Recording

*/

const initialPartModel = {
  xOffset:0,
  yOffset:0,
  boxWidth:0.015,
  wideBoxWidth:4000,
  boxHeight:0.1,
  boxY:0.2,
  boxX:0,

  notes:[],
  startTime:0, // when the current song started playing
  currentTime:0, //milliseconds since the beginning of the song
  position:0, // the position in the list of notes


  // Notes have the form:
  // {"action":"cursor","time":"0","x":355,"y":250,"yoff":92}
  note:{},  // the last note processed
  nextNote:{}, // the next note to process
};

/**
* An instance of the 'Animator' class is created when a user animates score for a piece
*/
class Animator {

  /**
  * Create an instance of this class
  *
  * @param id
  *        Piece id given when initialy stored in the db
  * @param parts
  *        Parts of the piece set by the user when uploaded into db
  */
  constructor(id, parts) {
    // Currently, the parts are a comma separated string 'Altus,Cantus,Bassus' and thus must be split
    // TODO: When user creates a piece, parts are not based on a single string
    this.parts = parts.split(",");
    this.currentPart = $("#part").val();
    this.aspect = 1.0
    this.audio = document.getElementsByTagName("audio")[0];
    this.partModel = Object.assign({}, initialPartModel)

    this.partCanvas = document.getElementById("thePart");
    this.partImage = document.getElementById("source");
    this.partImage.src = "../userpieces/" + pieceId + "/media/"+(partSelect.val()+".jpg");
    this.running = true;

  }

  // Update model determines the delta time between notes and updates the animation accordingly
  updateModel() {

    // Our current time is the time elapsed between the model's start time and the current time
    currTime = (new Date()).getTime() - this.partModel.startTime;

    // Assign time elapsed to our slider
    this.slider.val(currTime);

    // From our part model, get our current position and notes
    currPosition = this.partModel.position;
    currNote = this.partModel.notes[currPosition]
    nextNote = this.partModel.notes[currPosition+1]

    // When our elapsed time is greater than our next note's maximum time, we proceed to the next note
    while (currTime > nextNote.time) {
      // Update our new position (increment)
      currPosition++;
      this.partModel.position = currPosition;

      // Update our notes, given our new position
      currNote = this.partModel.notes[currPosition]
      nextNote = this.partModel.notes[currPosition+1]
    }

    // When our elapsed time is less than our current note, and our current note is not the first
    // We update backwards (this situation comes about when a player moves the slider to left/rewind)
    while (currTime < currNote.time & currPosition > 1) {
      // Update our new position (decrement)
      currPosition--;
      this.partModel.position = currPosition;

      // Update our notes, given our new position
      currNote = this.partModel.notes[currPosition]
      nextNote = this.partModel.notes[currPosition+1]
    }

    // Check for seeing if we are on the last note, end if we are
    if (currentPosition == this.partModel.notes.length-1) {
      this.running = false;
      return
    }

    // Given our current time, update our part model
    partModel.currentTime = currTime;

    t2 = currTime - currNote.time;
    t1 = nextNote.time - currTime;
    t = nextNote.time - currNote.time;

    // We updat eour offsets with the average of the two note times for smooth transition
    this.partModel.boxX = (t1*currNote.x + t2*nextNote.x)/t;
    this.partModel.yOffset = (t1*currNote.yoff + t2*nextNote.yoff)/t;
  }

  // Wrapper method for playing the piece
  playLoop() {
    if (this.!running) {return;}
    drawPart();
    updateModel();
    window.requestAnimationFrame(playLoop);
  }

  // Event listener for pausing and playing the video, modifies part times
  keydownListener(event) {

  }

  //
  initPart() {
    this.playbackMode = false;

    initialPartModel.boxHeight = boxSize[$("#part").val()]
    partModel = Object.assign({},initialPartModel);

    this.audio.playbackRate = parseFloat($("#playbackRate").val());

    ctx = this.partCanvas;
    ctx.drawImage(image,0,0,window.innerWidth,window.innerWidth*4/3)
  }

  // Wrapper to play the piece, we init our part model's start time to the current time
  playIt() {

    initPartButton = $("#initPart");
    initPartButton.click(initPart);

    playbackButton = $("#playback");
    playbackButton.click(function(event){
      playbackMode = true;
      playIt();
    });

    partModel.notes = notes;
    partModel.position=0;
    partModel.startTime = (new Date()).getTime();
    audio.play();
    running=true;
    playLoop();
  }

  // Draw the view using the model given
  // Essentially, wrapper for drawing the boxes
  drawPart(ctx) {
    //ctx = thePartCanvas.getContext("2d");
    ctx.fillStyle="blue";

    drawImage(ctx);


    ctx.strokeStyle = 'blue';

    // Set our colors
    backgroundColor = "rgba(112,66,20,0.2)";
    foregroundColor = "rgba(255,215,0,0.2)";
    leftColor = "rgba(255,255,255,0.0)";

    ctx.fillStyle = leftColor;
    drawHighlightBox(ctx);

    ctx.fillStyle = foregroundColor;
    drawRightBox(ctx);

    ctx.fillStyle = backgroundColor;
    drawLeftBox(ctx);
    drawTopBox(ctx);
    drawBottomBox(ctx);
  }

  // Draw the part image on the id 'source'
  drawImage() {
    switch (thePart){
      case "altus":
          aspect = imagesize.altus.height/imagesize.altus.width;
          break;
      case "cantus":
          aspect = imagesize.cantus.height/imagesize.cantus.width;
          break;
      case "tenor":
          aspect = imagesize.tenor.height/imagesize.tenor.width;
          break;
      case "bassus":
          aspect = imagesize.bassus.height/imagesize.bassus.width;
          break;
      case "score":
          aspect = imagesize.score.height/imagesize.score.width;
          break;
      default: console.log("unknown part: "+ thePart);
    }
    this.partCanvas.drawImage(
      this.partImage,
      partModel.xOffset*w,
      partModel.yOffset*w,
      window.innerWidth,
      Math.round(window.innerWidth*aspect)
    );
  }

  // Draws small highlight box on canvas to show current note
  drawHighlightBox(ctx) {
    ctx.fillRect(
      (this.partModel.boxX-partModel.boxWidth/2)*this.partCanvas.width,
      (this.partModel.boxY-partModel.boxHeight/2)*this.partCanvas.width,
      this.partModel.wideBoxWidth*w,
      this.partModel.boxHeight*w);
    )
  }

  // Draw bottom mask in part image
  drawBottomBox(ctx) {
    ctx.fillRect(
      (this.partModel.boxX-this.partModel.boxWidth/2)*this.partModel.width,
      (this.partModel.boxY+this.partModel.boxHeight/2)*this.partModel.width,
      4000, // TODO: Figure out why hard coded
      window.innerHeight);
  }

  // Draw top mask in part image
  drawTopBox(ctx) {
    ctx.fillRect(
        (this.partModel.boxX-partModel.boxWidth/2)*this.partModel.width,
        0,
        4000,
        (this.partModel.boxY-partModel.boxHeight/2)*this.partModel.width);
  }

  // Draw mask for everything in image left of highlight
  drawLeftBox(ctx) {
    ctx.fillRect(
      0,
      0,
      (this.partModel.boxX-this.partModel.boxWidth/2)*this.partCanvas.width,
      this.partCanvas.height*this.partCanvas);
    )
  }

  // Draw mask for everthing in image right of highlight
  drawRightBox(ctx) {
    ctx.fillRect(
      (this.partModel.boxX-this.partModel.boxWidth/2)*this.partCanvas.width,
      (this.partModel.boxY-this.partModel.boxHeight/2)*this.partCanvas.width,
      this.partModel.boxWidth*this.partCanvas.width,
      this.partModel.boxHeight*this.partCanvas.width);
  }

  // Event selection of part from part dropdown
  partSelect() {

    partSelect = $("#part");
    partSelect.change(function(event){
      this.partCanvas.width = window.innerWidth;
      this.partCanvas.height = window.innerHeight - 50;
      ctx = partCanvas.getElementById("source");
      ctx.drawImage(image,0,0,window.innerWidth,window.innerWidth*4/3);
    })

    drawPart();

    notes = animation[partSelect.val()];
    maxtime = notes[notes.length-1].time;
    attributes = {min:0,max:maxtime,step:1}
    theSlider.attr("max",maxtime).change();
    theSlider2.attr("max",maxtime).change();

  }

}

//PLAYBACK CODE
console.log("in scoreapp!");

// We get our piece id and our piece parts from elements in the view
let parts = document.getElementById("saPieceParts").textContent;
let pieceId = document.getElementById("saPieceId").textContent;
let partsSplit = parts.split(",");

animation = {};
boxSize = {};

// Adds string value of 'animationPart' for key part in animation dictionary
// Initializes the box size for each part to 0.12
// TODO: Remove hard coding for box size, possibly look into eliminating lookup
for (let j = 0; j < partsSplit.length; j++) {
  animation[partsSplit[j]] = "animation" + partsSplit[j].charAt(0).toUpperCase() + partsSplit[j].slice(1);
  boxSize[partsSplit[j]] = 0.12;
}

// TODO: Remove hard coding of image sizes
imagesize=
{cantus:{width:2551, height:3450},
 altus:{width:2549, height:3749},
 tenor:{width:2549, height:3751},
 bassus:{width:2548, height:3749},
 score:{width:1073,height:6548}
 };

$('input[type="range"]').rangeslider({
  onInit: function() {
    console.log("init");
  },
  onSlide: function(pos, value) {
    console.log("pos="+pos+" val="+val);
  }
}).on('input', function() {
  console.log("val="+this.value);
  partModel.startTime -= (this.value - partModel.currentTime)
  audio.currentTime = this.value/1000.0;
  //audio.play();
});



startTime = new Date();
startTime = startTime.getTime();
/*
$('#timeSlider2').rangeslider({
  onInit: function() {
    console.log("init");
  },
  onSlide: function(pos, value) {
    console.log("pos="+pos+" val="+val);
  }
});
*/

theSlider = $('#timeSlider');
theSlider2 = $('#timeSlider2');



//notes =  [{"action":"cursor","time":"0","x":323,"y":250,"yoff":-50},{"action":"cursor","time":"1","x":323,"y":250,"yoff":-50},{"action":"cursor","time":"2100","x":344,"y":250,"yoff":-50},{"action":"cursor","time":"3472","x":374,"y":250,"yoff":-50},{"action":"cursor","time":"3976","x":413,"y":250,"yoff":-50},{"action":"cursor","time":"4953","x":441,"y":250,"yoff":-50},{"action":"cursor","time":"5868","x":463,"y":250,"yoff":-50},{"action":"cursor","time":"6448","x":481,"y":250,"yoff":-50},{"action":"cursor","time":"6996","x":511,"y":250,"yoff":-50},{"action":"cursor","time":"7540","x":538,"y":250,"yoff":-50},{"action":"cursor","time":"7992","x":560,"y":250,"yoff":-50},{"action":"cursor","time":"8696","x":590,"y":250,"yoff":-50},{"action":"cursor","time":"9008","x":615,"y":250,"yoff":-50},{"action":"cursor","time":"9480","x":648,"y":250,"yoff":-50},{"action":"cursor","time":"9928","x":666,"y":250,"yoff":-50},{"action":"cursor","time":"10316","x":694,"y":250,"yoff":-50},{"action":"cursor","time":"10760","x":719,"y":250,"yoff":-50},{"action":"cursor","time":"11212","x":745,"y":250,"yoff":-50},{"action":"cursor","time":"11764","x":776,"y":250,"yoff":-50},{"action":"cursor","time":"12720","x":798,"y":250,"yoff":-50}];

thePartCanvas = document.getElementById("thePart");
thePartCanvas.width = window.innerWidth;
thePartCanvas.height = window.innerHeight-50;



function playIt(){
  partModel.notes = notes;
  partModel.position=0;
  partModel.startTime = (new Date()).getTime();
  audio.play();
  running=true;
  playLoop();
}


// RECORDING code


// This is the controller code
let paused = false;
let pauseTime = 0;

function keydownListener(event){

  if (event.code=="KeyQ") {
    audio.play();
    startTime = (new Date()).getTime();
    oldnotes = notes;
    notes=[];
    addNote();
    addNote();
    console.dir(event);

  }else if (event.code=="KeyW"){
    //console.log("hit W");
    //console.dir(notes);
    running=false;
    console.log(JSON.stringify(notes));
    audio.pause();
    audio.currentTime=0;
    audio.load();
    audio.playbackRate = parseFloat($("#playbackRate").val());

  } else if (event.code=="KeyZ"){
    addNote()

  } else if (event.code=="KeyX"){
    paused = true;
    audio.pause();
    let now = new Date();
    pauseTime = now.getTime();
    console.log(now);
    console.log(pauseTime);
  } else {
    console.dir(event);
  }
  }

document.addEventListener("keydown",keydownListener);


function addNote(){
  let now = new Date();
  if (paused){
    audio.play()
    pauseDuration = now.getTime() - pauseTime;
    startTime = startTime + pauseDuration;
    paused = false;
  }
  let t = now.getTime()-startTime;
  let w = thePartCanvas.width+0.0;
  let note =
  {action:'cursor',
     time:(t*audio.playbackRate).toFixed(),
        x:lastMouseEvent.offsetX/w,
        y: partModel.boxY,
        yoff: partModel.yOffset
      };
  notes.push(note);
}




lastMouseEvent = null;

document.addEventListener("mousemove",function(event){
  lastMouseEvent = event;
})





partSelect = $("#part");
partSelect.change(function(event){
  thePartCanvas.width = window.innerWidth;
  thePartCanvas.height = window.innerHeight-50;

  $("#boxHeight" ).val(  partModel.boxHeight );
  partModel = Object.assign({},initialPartModel);
  console.dir(this);
  console.log("selecting part");
  let image = document.getElementById("source");
  let pieceId = document.getElementById("saPieceId").textContent;
  image.src= "../userpieces/" + pieceId + "/media/"+(partSelect.val()+".jpg");
  ctx = thePartCanvas.getContext("2d");
  image = document.getElementById("source");
  ctx.drawImage(image,0,0,window.innerWidth,window.innerWidth*4/3);

  drawPart();

  notes = animation[partSelect.val()];
  maxtime = notes[notes.length-1].time;
  attributes = {min:0,max:maxtime,step:1}
  theSlider.attr("max",maxtime).change();
  theSlider2.attr("max",maxtime).change();
  console.log('maxtime='+maxtime);
  console.log("attr-max="+theSlider.attr("max"));

  //let thePartCanvas =  document.getElementById("thePart");
  //let ctx = thePartCanvas.getContext("2d");

  //ctx.drawImage(image,xOffset,yOffsetwindow.innerWidth,window.innerWidth*4/3);
})

initPartButton = $("#initPart");
initPartButton.click(initPart);

function initPart (event){
  //notes = eval(localStorage.getItem("animation"));
  playbackMode=false;
  thePartCanvas.width = window.innerWidth;
  thePartCanvas.height = window.innerHeight-50;
  // read in the fields and use them to set the partModel

  initialPartModel.boxHeight = boxSize[$("#part").val()]
  console.log("boxHeight = "+initialPartModel.boxHeight);

  //parseFloat($("#boxHeight").val());
  audio.playbackRate = parseFloat($("#playbackRate").val());
  console.log("playbackRate is "+audio.playbackRate);
  partModel = Object.assign({},initialPartModel);
  console.log(JSON.stringify(initialPartModel))
  console.log(JSON.stringify(partModel));
  ctx = thePartCanvas.getContext("2d");
  image = document.getElementById("source");
  ctx.drawImage(image,0,0,window.innerWidth,window.innerWidth*4/3);
}

playbackButton = $("#playback");
playbackButton.click(function(event){
  playbackMode = true;
  playIt();
});

// Recording
playbackMode = false;

$("#thePart").mousemove(function(event){
  thePartCanvas.width = window.innerWidth;
  thePartCanvas.height = window.innerHeight-50;
})

$("#thePart").mousemove(function(event){
  if (playbackMode) return;
  let w = thePartCanvas.width+0.0;
  partModel.boxX = event.offsetX/w;
  drawPart()

})


// Recenter the screen if the user clicks the mouse

$("#thePart").mousedown(function(event){
  if (playbackMode) return;
  let w = thePartCanvas.width+0.0;
  let p2 = partModel.yOffset + partModel.boxY -(event.offsetY)/w;
  //changeOffset(1,20,partModel.yOffset, p2)
  lastyOffset = partModel.yOffset;
  partModel.yOffset = p2;
  drawPart();
})

function changeOffset(step,steps,start,finish){
  partModel.yOffset += (finish-start)/steps;
  drawPart();
  if (step>=steps) {
    partModel.yOffset = finish;
  } else {
    window.requestAnimationFrame(function(){changeOffset(step+1,steps,start,finish)})
  }
}


saveButton = $("#save");
saveButton.click(function(event){
  console.log("posting to /saveAnimation")
  console.dir({notes,pieceId,part:partSelect.val()})

  $.post( "/animatepage/save",
         {notes:JSON.stringify(notes), pieceId, part:partSelect.val()},
          "json" )
   .then(x=>{console.log("in promise:"); console.dir(x)})
  console.log(`zz=${zz}`)
  console.dir(zz)
  return
  zz = localStorage.getItem("archive");
  alert(zz);
  if (zz==null) {
    archive="[]";
    localStorage.setItem("archive",[]);
    zz="[]"
  }
  newArchive = eval(zz);
  newArchive.push(notes);
  localStorage.setItem("archive",JSON.stringify(newArchive));
  localStorage.setItem("animation",JSON.stringify(notes));
  alert("Cut/Paste the following code "+
     "into the appropriate file in the animations folder:\n\n" +
    JSON.stringify(notes));


  let currPart;
  for (let j = 0; j < partsSplit.length; j++) {
    if (partSelect.val() == partsSplit[j]) {
      currPart = partsSplit[j];
    }
  }
  let firstChar = currPart.charAt(0).toUpperCase();
  let capName = firstChar + currPart.slice(1);
  let contents = "animation" + capName + " =" + JSON.stringify(notes) + ";";
  fs.writeFile(path.join(__dirname, '../public/userpieces/' + pieceId + '/animations/') + currPart + "2.js",contents,(err)=>{
    if (err) {
      console.dir(err);
      throw err;
    }
      console.log("made dummy animation file for " + currPart)
      console.log("file made at file path: " + path.join(__dirname, '../public/userpieces/' + pieceId + '/animations/') + currPart + "2.js");
  });
})
