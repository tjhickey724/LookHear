/*
This is an attempt to refactor old code from musicapp4module.js from function to class based
*/

// this keeps track of where we are in the score or part
// and helps us draw a window around the current location in the music
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

// TODO
// These are all hardwired for one of the pieces,
// we need to loa the actual size dynamically when the
// piece is selected and the image is loaded into the canvas

// this all has to go into the mongo database ...
// we can calculate the width and height from the images
// which are uploaded when we create the piece ...
// or we can calculate it when we load the piece ...

const pieceDataSet = {
  imagesize:{
     cantus:{width:2551, height:3450},  // this.partImage.naturalWidth
     altus:{width:2549, height:3749},
      tenor:{width:2549, height:3751},
     bassus:{width:2548, height:3749},
     score:{width:1073, height:6548},
     mastermenu:{width:1073, height:6548},
  },
  timeOffsets:{},
  boxSize:{},
  animation:{}
};



/**
* An instance of the 'Player' class is created when a user visits a piece
*/
class Player {

  /**
  * Create an instance of this class
  *
  * @param id
  *        Piece id given when initialy stored in the db
  * @param parts
  *        Parts of the piece set by the user when uploaded into db
  */

  constructor (id, parts) {
    // Currently, the parts are a comma separated string 'Altus,Cantus,Bassus' and thus must be split
    // TODO: When user creates a piece, parts are not based on a single string
    this.id = id
    this.parts = parts.split(","); //in piece
    for (let j=0; j<this.parts.length; j++){
      this.parts[j] = this.parts[j].trim()
      console.log('parts['+j+']="'+this.parts[j]+'"')
    }
    this.currentPart = this.parts[0]
    //this.currentPart = this.parts[0];
    this.aspect = 1.0 // in piece

    //this.audio = document.getElementsByTagName("audio")[0]; //move to where needed ...
    this.partModel = Object.assign({}, initialPartModel) // the piece
    //this.video = document.getElementsByTagName("video")[0]; //move to where needed
    this.pauseTime = 0; //player
    this.paused = false; //player

    this.pieceDataSet = pieceDataSet //should get this from the images ....
    this.partModel.timeOffsets = this.pieceDataSet.timeOffsets;

    // Init slider
    //$("#theTime").html(mins+":"+(secs(<10?"0":"")+secs));
    this.slider = document.getElementById("timeSlider");

    // move to where needed ... startpart code
    this.partCanvas = document.getElementById("thePart");
    this.partImage = document.getElementById("source");
    this.partImage.src = "../userpieces/" + this.id + "/media/"+this.currentPart+".jpg";
    console.log('partImage.src=' + this.partImage.src)

    //this.running = true; // player
    //this.playloop.bind(this)

  }

  // move to Piece class
  /*
     add some documentation here ... what is this doing?
  */
  initFiles() {

    this.theFiles = [];
// THIS IS VERY UGLY..... LETS GET RID OF IT... PASS IN TITLE, ETC THROUGH PLAYER ...
    //this.pieceDataSet["pieceName"] = document.getElementById("lhPieceTitle").textContent;
    for (let j = 0; j < this.parts.length; j++) {
      this.pieceDataSet.timeOffsets[this.parts[j]] = 0;
      this.pieceDataSet.boxSize[this.parts[j]] = 0.12;
      // we need to read get this with a POST call
      if (this.parts[j]=='altus') {
         this.pieceDataSet.animation[this.parts[j]] = animationAltus
      } else if (this.parts[j]=='cantus') {
          this.pieceDataSet.animation[this.parts[j]] = animationCantus
      } else {
          console.log("ERROR SETTING ANIMATION "
                       +j+" : '"+this.parts[j]+"'")
          console.dir(this.parts[j])
        }
      // eval("animation" + this.parts[j].charAt(0).toUpperCase() + this.parts[j].slice(1));
      let theFile =
      {
        "id": this.parts[j],
        "name": '../userpieces/'+ this.id + '/media/' + this.parts[j] + '.mp4',
        "type":'video/mp4'
      }
      console.log('theFile for j='+j)
      console.dir(theFile)
      this.theFiles.push(theFile);
    }
  }

  /*
     add some documentation here ... what is this doing?
  */
  playLoop(){
    console.log('this2=',this)
    console.dir(this)
    if (!this.running) { return; }
    this.drawPart(this.partCanvas.getContext("2d"));
    this.updateModel();
    window.requestAnimationFrame(() => this.playLoop());
  }

  /*
     add some documentation here ... what is this doing?
  */
  startApp(part){
    // TODO check that this.video is set before startApp is called
    if (this.video) {
      this.video.muted=true
    }

    this.switchVideo(part);
    this.switchPart(part);

    this.video.muted=false;
    this.video.play();
    $("input[type='range']").val(0);
    //partModel.currentTime=0;
    this.video.currentTime = this.partModel.currentTime/1000.0;
    this.running=true;
    this.playLoop();
  }

  // Update model determines the delta time between notes and updates the animation accordingly
  /*
     add some documentation here ... what is this doing?
  */
  updateModel() {

    // Our current time is the time elapsed between the model's start time and the current time
    let currTime = (new Date()).getTime() - this.partModel.startTime;
    let currTimeWithOff = currTime - this.partModel.timeOffset;

    let totalSecs = Math.floor(currTime/1000);
    let mins = Math.floor(totalSecs/60);
    let secs = totalSecs % 60;

    //$("#theTime").html(mins+":"+(secs(<10?"0":"")+secs));
    this.slider.val = currTime;

    // From our part model, get our current position and notes
    let currPosition = this.partModel.position;
    let currNote = this.partModel.notes[currPosition]
    let nextNote = this.partModel.notes[currPosition+1]

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
    if (currPosition == this.partModel.notes.length-1) {
      this.running = false;
      return
    }

    // Given our current time, update our part model
    this.partModel.currentTime = currTime;

    let t2 = currTime - currNote.time;
    let t1 = nextNote.time - currTime;
    let t = nextNote.time - currNote.time;

    // We updat eour offsets with the average of the two note times for smooth transition
    this.partModel.boxX = (t1*currNote.x + t2*nextNote.x)/t;
    this.partModel.yOffset = (t1*currNote.yoff + t2*nextNote.yoff)/t;
  }



  /*
     add some documentation here ... what is this doing?
  */
  resizePart(){
    console.log(this.partCanvas.width)
    this.partCanvas.width = partdiv.offsetWidth;
  }

  /*
     add some documentation here ... what is this doing?
  */
  changePiece(){
    let part=$("#thePartName").val();
    if (part=="Choose Part"){
      alert("Please select a part");
      return;
    }
    console.log(`call switchPiece(${part})`)
    this.switchPiece(part);
    this.switchPart(part)
    console.log("switched piece!")
    document.getElementById('startVideos').disabled = false
  }

  /*
     add some documentation here ... what is this doing?
     switches to the correct movie and image ...
     This initializes the movie and music image and
     gets ready to start it ....
  */
  switchPiece(piece){
    document.getElementById('startVideos').innerHTML = "Start"
    document.getElementById('startVideos').disabled = true
    //document.getElementById("content").style.display = "none"; // Hide content
    console.log(`inside switchPiece(${piece})`)


    // Get image size from piece data set
    let imagesize = this.pieceDataSet.imagesize;

    // Get the notes for the first part
    let notes = this.pieceDataSet.animation[this.parts[0]]
    console.log('*************\nin switchPiece')
    console.dir(this.pieceDataSet)

    // Make changes to our part model dependent on piece data set
    this.partModel.piece=piece;
    this.partModel.timeOffsets = this.pieceDataSet.timeOffsets;
    this.partModel.notes = notes;
    this.partModel.position=0;
    this.partModel.boxHeight = this.pieceDataSet.boxSize;
    let theMovie = document.getElementById(piece)
    console.log('theMovie='+theMovie)


    //$('.musicvideo').setAttribute('width',0)
    theMovie.setAttribute('width',"100%")
    $(".description").hide();
    $("."+piece).show();
    console.dir(theMovie)

    /*
    for (let v = 0; v < this.parts.length; v++) {
      this.playSelectedFile(v);
    }
    this.playSelectedFile(0)
    */
    this.switchVideo(piece);
    this.switchPart(piece);
    $("input[type='range']").val(0);
    this.partModel.currentTime=0;
    this.partModel.timeOffset = this.pieceDataSet.timeOffsets[piece];
    console.log("setting the video time!"+this.video.currentTime+" "+this.partModel.currentTime/1000.0)
    this.video.currentTime = this.partModel.currentTime/1000.0;
    this.running=true;
    this.partModel.position=0;
    let startTime = new Date();
    startTime = startTime.getTime();
    this.partModel.startTime = startTime;
    console.log("end of SwitchPiece")
    console.dir(this)
  }



  /*
     add some documentation here ... what is this doing?
  */
  switchVideo(part){
  $(".musicvideo").attr("width","0%");
  $("#"+part).attr("width","100%");
  console.log("switching to '"+part+"'")
   this.video = document.getElementById(part);
  }

  /*
     add some documentation here ... what is this doing?
     switch to the correct music image for the particular part...
  */
  switchPart(part) {
    this.currentPart = part;
    console.log('pieceDataSet=')
    console.dir(this.pieceDataSet)

    // Init the box height and time offset for the part
    this.partModel.boxHeight = this.pieceDataSet.boxSize[part];
    this.partModel.timeOffset = this.partModel.timeOffsets[part];

    this.animation = this.pieceDataSet.animation;
    console.log('inside switchPart')
    this.selectThePart(part);
    console.log('after switchPart')
    this.initPart();
    console.log('after initPart')
    let ctx = this.partCanvas.getContext('2d');
    this.drawPart(ctx);
    console.log('drew the part')
  }

  /*
     add some documentation here ... what is this doing?
  */
  selectThePart(part){
    this.partCanvas.width = partdiv.offsetWidth;
    this.partImage = document.getElementById("source");
    //let piece = this.partModel.piece; //$("#thePiece").val();
    this.partImage.src= "../userpieces/" + this.id + "/media/"+part+".jpg";
    console.log(`selectThePart(${part})`)
    console.dir(this.partImage.src)
    let ctx = this.partCanvas.getContext("2d");
    this.partImage= document.getElementById("source");
    ctx.drawImage(this.partImage,0,0,window.innerWidth,window.innerWidth*4/3);
    console.log("drew the music image")

    this.drawPart(ctx);
    let notes = this.pieceDataSet.animation[part];
    this.partModel.notes = notes;

    let maxtime = notes[notes.length-1].time;
    let attributes = {min:0,max:maxtime,step:1}
    this.theSlider = $('#timeSlider');
    this.theSlider.attr("max",maxtime).change();
  }

  /*
     add some documentation here ... what is this doing?
  */
  initPart(event){
    this.partCanvas.width = partdiv.offsetWidth;
    this.partCanvas.height = window.innerHeight; // ?????
    //partCanvas.width = window.innerWidth;
    //partCanvas.height = window.innerHeight-50;
    //partModel = Object.assign({},initialPartModel);

    let ctx = this.partCanvas.getContext("2d");
    this.partImage = document.getElementById("source");
    ctx.drawImage(this.partImage,0,0,window.innerWidth,window.innerWidth*4/3);
  }

  /*
     add some documentation here ... what is this doing?
     This draws the music image after moving it down to where we are in the song
     Then it draws the highlight boxes that highlight our current location...
  */
  drawPart(ctx) {
    ctx.fillStyle = "blue";
    ctx.strokeStyle = "blue";
    console.log('before drawImage')
    this.drawImage();

    console.log('after drawImage')


    let backgroundColor = "rgba(112,66,20,0.2)";
    let foregroundColor = "rgba(255,215,0,0.2)";
    let leftColor = "rgba(255,255,255,0.0)";

    ctx.fillStyle = leftColor;
    this.drawHighlightBox();

    ctx.fillStyle = foregroundColor;
    this.drawRightBox();

    ctx.fillStyle = backgroundColor;
    this.drawLeftBox();
    this.drawTopBox();
    this.drawBottomBox();
  }

  /*
     add some documentation here ... what is this doing?
  */
  drawImage(){
    console.log("in drawImage")
    this.partImage = document.getElementById("source");
    let w = this.partCanvas.width+0.0;
    let thePart = this.currentPart
    //let imagesize = this.pieceDataSet.imagesize;
    //let aspect = imagesize[this.currentPart.toString()].height/imagesize[this.currentPart.toString()].width;
    let w1 = this.partImage.naturalWidth
    let h1 = this.partImage.naturalHeight
    let aspect = h1/w1
    let ctx = this.partCanvas.getContext("2d");
    ctx.drawImage(this.partImage,
      this.partModel.xOffset*w,
      this.partModel.yOffset*w,
      partdiv.offsetWidth,
      Math.round(partdiv.offsetWidth*aspect)
    );
  }


  /*
     add some documentation here ... what is this doing?
  */
  drawHighlightBox(){
    let ctx = this.partCanvas.getContext("2d");
    ctx.fillRect(
      (this.partModel.boxX-this.partModel.boxWidth/2)*this.partCanvas.width,
      (this.partModel.boxY-this.partModel.boxHeight/2)*this.partCanvas.width,
      this.partModel.wideBoxWidth*this.partCanvas.width,
      this.partModel.boxHeight*this.partCanvas.width);
  }

  drawRightBox(){
    let ctx = this.partCanvas.getContext("2d");
    ctx.fillRect(
      (this.partModel.boxX-this.partModel.boxWidth/2)*this.partCanvas.width,
      (this.partModel.boxY-this.partModel.boxHeight/2)*this.partCanvas.width,
      this.partModel.boxWidth*this.partCanvas.width,
      this.partModel.boxHeight*this.partCanvas.width);
  }

  drawBottomBox(){
    let ctx = this.partCanvas.getContext("2d");
    ctx.fillRect(
            (this.partModel.boxX-this.partModel.boxWidth/2)*this.partCanvas.width,
            (this.partModel.boxY+this.partModel.boxHeight/2)*this.partCanvas.width,
            4000,
            window.innerHeight);
  }

  drawTopBox(){
    let ctx = this.partCanvas.getContext("2d");
    ctx.fillRect(
        (this.partModel.boxX-this.partModel.boxWidth/2)*this.partCanvas.width,
        0,
        4000,
        (this.partModel.boxY-this.partModel.boxHeight/2)*this.partCanvas.width);
  }

  drawLeftBox(){
    let ctx = this.partCanvas.getContext("2d");
    ctx.fillRect(
      0,
      0,
      (this.partModel.boxX-this.partModel.boxWidth/2)*this.partCanvas.width,
      this.partCanvas.height*this.partCanvas.width);
  }



  /*
     add some documentation here ... what is this doing?
  */
  pauseApp(){
    if (this.paused){
      let now = new Date().getTime();
      this.partModel.startTime += (now-this.pauseTime);
      this.paused = false;
      this.running=true;

      this.video.play();
      this.playLoop();

    } else {
      this.paused = true;
      this.pauseTime = new Date().getTime();
      this.running=false;
      this.video.pause();
    }
  }

}  // end of the class Player






let player = undefined

function startPlayer(id,parts,title){
  // used to be changePiece ...


    console.log('These are the parts from elementid '+id)
    console.log(parts)

    player = new Player(id, parts)
    player.initFiles()
    player.title = title

    document.p = player




    // need to figure out how to switch to different part
    // when the parts are not just Cantus, Altus, Tenor, Basus

    function keydownListener(event){
      if (event.code=="KeyC") {
        player.startApp("cantus")
      } else if (event.code=="KeyA") {
        player.startApp("altus")
      } else if (event.code=="KeyT") {
        player.startApp("tenor")
      } else if (event.code=="KeyB") {
        player.startApp("bassus")
      } else if (event.code=="KeyF") {
        player.startApp("score")
      } else if (event.code=="KeyX") {
        player.startApp("mastermenu")
      } else if (event.code=="KeyP") {
        player.pauseApp();
      } else if (event.code=="KeyS") {
        player.video.currentTime = 0;
        player.partModel.startTime= new Date();
      }
    }

    document.addEventListener("keydown",keydownListener);


    $('input[type="range"]').rangeslider({
      onInit: function() {
        console.log("init");
      },
      onSlide: function(pos, value) {
        console.log("pos="+pos+" val="+val);
        if (!player.running) {
          startTime = new Date();
          player.startTime = startTime.getTime();
          player.running=true;
          player.playLoop();
        }
      }
    }).on('input', function() {
      //console.log("val="+this.value);
      player.partModel.startTime -= (this.value - player.partModel.currentTime)
      player.video.currentTime = this.value/1000.0;
    });

    let startButton = document.getElementById('startVideos')
    startButton.addEventListener('click',function(event){
      if (startButton.innerHTML.trim()=='Start'){
        startButton.innerHTML = 'Stop'
        player.video.currentTime = 0
        player.partModel.startTime= new Date()
        // TODO -- use the selected part, not 'cantus'
        player.startApp('cantus')
      } else {
        player.running=false;
        player.video.currentTime = 0
        player.video.pause();
        startButton.innerHTML = 'Start'
      }
    })

    var myLayout = $('div#container').layout();
    myLayout.sizePane("west","40%");
    myLayout.sizePane("east","20%");
    myLayout.sizePane("south","20%");
    $(".description").hide();
    $(".partintro").show();
}


function changePart(){
  player.changePiece()
}

function resizePart(){
  player.resizePart()
}
