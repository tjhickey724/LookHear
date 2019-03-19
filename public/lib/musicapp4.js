/*
This version works with musicapp4.html

*/

//rate CODE
console.log("in scoreapp!");


function updateModel(){
// update the boxX and yOffset fields of the partModel based on the time
// also increase position if so needed...
  c1 = (new Date()).getTime() - partModel.startTime;
  c = c1 - partModel.timeOffset;
  totalsecs = Math.floor(c1/1000)
  mins = Math.floor(totalsecs/60)
  secs = totalsecs%60
  $("#theTime").html(mins+":"+(secs<10?"0":"")+secs)
  theSlider = $('#timeSlider');
  theSlider.val(c1);


  p = partModel.position;
  n1 = partModel.notes[p]
  n2 = partModel.notes[p+1]
  if (!n2 || !n2.time) {
    return;
  }

  if (partModel.notes.length<p) {
    running=false;

    return;
  }

  while (c > n2.time){ //switch to the next note!
    p=p+1;
    partModel.position = p;
    n1 = partModel.notes[p]
    n2 = partModel.notes[p+1]
    if (!n2 || !n2.time) {
      return;
    }
  }
  while (c < n1.time & p>1){
    p=p-1;
    partModel.position = p;
    n1 = partModel.notes[p]
    n2 = partModel.notes[p+1]
  }
  if (p==partModel.notes.length-1) {
    running=false;
    return;
  }

  //console.log(JSON.stringify([n1,n2]))

  partModel.currentTime =c1;
  t2 = c-n1.time;
  t1 = n2.time-c;
  t = n2.time-n1.time;
  partModel.boxX = (t1*n1.x + t2*n2.x)/t;
  partModel.yOffset = (t1*n1.yoff + t2*n2.yoff)/t;
  //console.log("x1="+n1.x+" x2="+n2.x+ "\nc="+c+
  //            " t1="+t1+" t2="+t2+" t="+t +
  //            " x="+partModel.boxX+" o="+partModel.yOffset);

}


function playLoop(){
  if (!running) {return;}
  drawPart();
  updateModel();
  window.requestAnimationFrame(playLoop);
}


// DRAWING THE VIEW USING THE MODEL

function drawPart(){
  ctx = thePartCanvas.getContext("2d");
  ctx.fillStyle="blue";
  drawImage(ctx);
  ctx.strokeStyle = 'blue';
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



function drawImage(ctx){
  image = document.getElementById("source");
  var w = thePartCanvas.width+0.0;
  var thePart = theCurrentPart;
  var aspect = 1.0;
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
    case "mastermenu":
        aspect = imagesize.mastermenu.height/imagesize.mastermenu.width;
        break;
    default: console.log("unknown part: '"+ thePart+"'");
  }
  ctx.drawImage(image,
    partModel.xOffset*w,
    partModel.yOffset*w,
    partdiv.offsetWidth,
    Math.round(partdiv.offsetWidth*aspect)
  );
}

function drawHighlightBox(ctx){
  var w = thePartCanvas.width+0.0;
  ctx.fillRect(
    (partModel.boxX-partModel.boxWidth/2)*w,
    (partModel.boxY-partModel.boxHeight/2)*w,
    partModel.wideBoxWidth*w,
    partModel.boxHeight*w);
}

function drawRightBox(ctx){
  var w = thePartCanvas.width+0.0;
  ctx.fillRect(
    (partModel.boxX-partModel.boxWidth/2)*w,
    (partModel.boxY-partModel.boxHeight/2)*w,
    partModel.boxWidth*w,
    partModel.boxHeight*w);
}

function drawBottomBox(ctx){
  var w = thePartCanvas.width+0.0;
  ctx.fillRect(
          (partModel.boxX-partModel.boxWidth/2)*w,
          (partModel.boxY+partModel.boxHeight/2)*w,
          4000,
          window.innerHeight);
}

function drawTopBox(ctx){
  var w = thePartCanvas.width+0.0;
  ctx.fillRect(
      (partModel.boxX-partModel.boxWidth/2)*w,
      0,
      4000,
      (partModel.boxY-partModel.boxHeight/2)*w);
}

function drawLeftBox(ctx){
  var w = thePartCanvas.width+0.0;
  ctx.fillRect(
    0,
    0,
    (partModel.boxX-partModel.boxWidth/2)*w,
    thePartCanvas.height*w);
}

function resizePart(){
  thePartCanvas.width = partdiv.offsetWidth;
}
function selectThePart(part){

  thePartCanvas.width = partdiv.offsetWidth;
  console.dir(this);
  console.log("selecting part");
  var image = document.getElementById("source");
  piece = partModel.piece; //$("#thePiece").val();

  image.src= "pieces/"+piece+"/images/"+(part+".jpg");
  ctx = thePartCanvas.getContext("2d");
  image = document.getElementById("source");
  ctx.drawImage(image,0,0,window.innerWidth,window.innerWidth*4/3);

  drawPart();

  notes = pieceData.animation[part];
  partModel.notes =notes;
  maxtime = notes[notes.length-1].time;
  attributes = {min:0,max:maxtime,step:1}
  theSlider = $('#timeSlider');
  theSlider.attr("max",maxtime).change();
  //theSlider.width = partdiv.offsetWidth; // TJH 6/29/17
  console.log('maxtime='+maxtime);
  console.log("attr-max="+theSlider.attr("max"));
}




function initPart (event){
  thePartCanvas.width = partdiv.offsetWidth;
  thePartCanvas.height = window.innerHeight; // ?????
  //thePartCanvas.width = window.innerWidth;
  //thePartCanvas.height = window.innerHeight-50;
  //partModel = Object.assign({},initialPartModel);

  ctx = thePartCanvas.getContext("2d");
  image = document.getElementById("source");
  ctx.drawImage(image,0,0,window.innerWidth,window.innerWidth*4/3);
}



function switchPart(part){
  theCurrentPart = part;
  partModel.boxHeight = pieceData.boxSize[part];
  console.log('pieceData)=');
  console.dir(pieceData);
  partModel.timeOffset = partModel.timeOffsets[part];

  animation = pieceData.animation;
  selectThePart(part);
  initPart();
  drawPart();
}



function switchVideo(part){
$(".musicvideo").attr("width","0%");
$("#"+part).attr("width","100%");
console.log("switching to '"+part+"'")
 video = document.getElementById(part);
}





function keydownListener(event){
  if (event.code=="KeyC") {
    startApp("cantus")
  } else if (event.code=="KeyA") {
    startApp("altus")
  } else if (event.code=="KeyT") {
    startApp("tenor")
  } else if (event.code=="KeyB") {
    startApp("bassus")
  } else if (event.code=="KeyF") {
    startApp("score")
  } else if (event.code=="KeyX") {
    startApp("mastermenu")
  } else if (event.code=="KeyP") {
    pauseApp();
  } else if (event.code=="KeyS") {
    video.currentTime = 0;
    partModel.startTime= new Date();

  }

}
var paused = false;
var pauseTime = 0;

function pauseApp(){
  if (paused){
    var now = new Date().getTime();
    partModel.startTime += (now-pauseTime);
    paused = false;
    running=true;

    video.play();
    playLoop();

  } else {
    paused = true;
    pauseTime = new Date().getTime();
    running=false;
    video.pause();
  }

  // figure this out!!!
}

function changePiece(){
  var piece=$("#thePiece").val();
  if (piece=="Select a piece"){
    alert("Please select a piece");
    return;
  }
  switchPiece(piece);
}

function switchPiece(piece){
  document.getElementById('startVideos').innerHTML = "Start"
  document.getElementById('startVideos').disabled = true
  document.getElementById("content").style.display = "none"; // Hide content for loading videos
  document.getElementById("loadSpin").style.display = "flex"; // Activate loading screen (unhide)
  document.getElementById("loadSpin2").style.display = "block"; // Activate loading screen bottom
  //video.stop()
  //running = false
  pieceData = pieceDataSet[piece];
  imagesize = pieceData.imagesize;
  notes = pieceData.animation["score"];
  partModel.piece=piece;
  partModel.timeOffsets = pieceData.timeOffsets;

  partModel.notes = notes;
  partModel.position=0;
  partModel.boxHeight = pieceData.boxSize["score"];
  console.log("pieceData and partModel");
  console.dir(pieceData);
  console.dir(partModel);
  $(".description").hide();
  $("."+piece).show();

  console.log("The selected piece is "+piece)

  var theFiles = [
    {id:'score', name:'/pieces/'+piece+'/videos/Master.mp4',type:'video/mp4'},
    {id:'altus', name:'/pieces/'+piece+'/videos/Altus.mp4',type:'video/mp4'},
    {id:'cantus', name:'/pieces/'+piece+'/videos/Cantus.mp4',type:'video/mp4'},
    {id:'tenor', name:'/pieces/'+piece+'/videos/Tenor.mp4',type:'video/mp4'},
    {id:'bassus', name:'/pieces/'+piece+'/videos/Bassus.mp4',type:'video/mp4'},
    {id:'mastermenu', name:'/pieces/'+piece+'/videos/MasterMenu.mp4',type:'video/mp4'},
  ]



  var playSelectedFile = function (fileNum){

    var fileObj = theFiles[fileNum]
    file = fileObj.name
    id = fileObj.id
    console.log('preloading file '+file)
    console.dir(file)
    console.log(id)
    var type = file.type
    var vid = id //file.name.substring(file.name.lastIndexOf("/")+1,file.name.indexOf("."))
    console.log(`vid=${vid} type=${type} file=${JSON.stringify(file)}`)
    var videoNode = document.getElementById(vid)
    console.dir(['videoNode',videoNode])
    var req = new XMLHttpRequest();
    req.open('GET', file, true);
    req.responseType = 'blob';
    req.onload = function() {
       if (this.status === 200) {
          var videoBlob = this.response;
          var vid = URL.createObjectURL(videoBlob); // IE10+
          videoNode.src = vid;

          console.log('just loaded '+file)
          if (fileNum<5){playSelectedFile(fileNum+1)} else {
            document.getElementById('startVideos').disabled = false
            console.log('disabled = '+ document.getElementById('startVideos').disabled)
            document.getElementById("loadSpin2").style.display = "none"; // Videos done loading, hide loading screen
            document.getElementById("loadSpin").style.display = "none"; // Videos done loading, rehide loading screen
            document.getElementById("content").style.display = "flex"; // Reveal content, videos done loading
          }
       }
    }
    req.onerror = function() {
    }
    req.send();
    return videoNode
  }

/*
  playSelectedFile(theFiles.master,'score')
  playSelectedFile(theFiles.cantus,'cantus')
  playSelectedFile(theFiles.altus,'altus')
  playSelectedFile(theFiles.tenor,'tenor')
  playSelectedFile(theFiles.bassus,'bassus')
  playSelectedFile(theFiles.mastermenu,'mastermenu')
*/

    playSelectedFile(0)


  /*
  $("#score-source").attr("src","pieces/"+piece+"/videos/Master.mp4");
  $("#cantus-source").attr("src","pieces/"+piece+"/videos/Cantus.mp4");
  $("#altus-source").attr("src","pieces/"+piece+"/videos/Altus.mp4");
  $("#tenor-source").attr("src","pieces/"+piece+"/videos/Tenor.mp4");
  $("#bassus-source").attr("src","pieces/"+piece+"/videos/Bassus.mp4");
  $("#mastermenu-source").attr("src","pieces/"+piece+"/videos/MasterMenu.mp4");
  *
  var video = document.getElementById('cantus'); video.load();video.play();video.muted=true
  var video = document.getElementById('altus'); video.load();video.play();video.muted=true
  var video = document.getElementById('tenor'); video.load();video.play();video.muted=true
  var video = document.getElementById('bassus'); video.load();video.play();video.muted=true
  var video = document.getElementById('score'); video.load();video.play();video.muted=false
  var video = document.getElementById('mastermenu'); video.load();video.play();video.muted=true
  */


  switchVideo("score");
  switchPart("score");
  //video.play();
  $("input[type='range']").val(0);
  partModel.currentTime=0;
  partModel.timeOffset = pieceData.timeOffsets.score;
  console.log("setting the video time!"+video.currentTime+" "+partModel.currentTime/1000.0)
  video.currentTime = partModel.currentTime/1000.0;
  running=true;
  console.dir(partModel);
  partModel.position=0;
  startTime = new Date();
  startTime = startTime.getTime();
  partModel.startTime = startTime;
  //playLoop();
  //pauseApp();
  //drawImage(thePartCanvas.getContext("2d"));

}


function startApp(part){
  video.muted=true
  //video.currentTime=0
  //partModel.position=0
  switchVideo(part);
  switchPart(part);
  video.muted=false;
  video.play();
  $("input[type='range']").val(0);
  //partModel.currentTime=0;
  console.log("setting the video time!"+video.currentTime+" "+partModel.currentTime/1000.0)
  video.currentTime = partModel.currentTime/1000.0;
  running=true;
  playLoop();

}



// First, we create the pieceDataSet
// this stores all the info which is unique to that piece
// the name, boxSize for each part, size for each part, animation for each part


pieceDataSet = {
  zirlerMotet:{
    pieceName: "zirlerMotet",
    timeOffsets:{
      altus:0,
      cantus:0,
      bassus:0,
      tenor:0,
      score:500,
      mastermenu: 500,
    },
    boxSize:{
      altus:0.12,
      cantus:0.12,
      bassus:0.12,
      tenor:0.12,
      score:0.30,
      mastermenu: 0.30,
    },
    animation:{
      score:animationScoreZirler,
      cantus:animationCantusZirler,
      altus:animationAltusZirler,
      tenor:animationTenorZirler,
      bassus:animationBassusZirler,
      mastermenu:animationScoreZirler
    },
    imagesize:{
       cantus:{width:2551, height:3450},
       altus:{width:2549, height:3749},
        tenor:{width:2549, height:3751},
       bassus:{width:2548, height:3749},
       score:{width:1073, height:6548},
       mastermenu:{width:1073, height:6548},

    }
  },
  ortoMotet:{
    pieceName: "ortoMotet",
    timeOffsets:{
      altus:0,
      cantus:0,
      bassus:0,
      tenor:0,
      score:0,
      mastermenu: 0,
    },
    boxSize:{
      altus:0.1,
      cantus:0.1,
      bassus:0.1,
      tenor:0.1,
      score:0.26,
      mastermenu:0.26,
    },
    animation:{
      score:animationScoreOrto,
      mastermenu:animationScoreOrto,
      cantus:animationCantusOrto,
      altus:animationAltusOrto,
      tenor:animationTenorOrto,
      bassus:animationBassusOrto
    },
    imagesize:{
      cantus:{width:1650, height:1275},
      altus:{width:1650, height:1275},
      tenor:{width:1650, height:1275},
      bassus:{width:1650, height:1275},
      score:{width:1140, height:2812},
      mastermenu:{width:1140, height:2812},
     }
  }
}


theCurrentPart = "Score";
testing = true;
running = true;



thePartCanvas =  document.getElementById("thePart");
thePartCanvas.width = partdiv.offsetWidth;
thePartCanvas.height = window.innerHeight;




initialPartModel = {
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
  note:{},  // the last note processed
  nextNote:{}, // the next note to process
};
// Notes have the form:
// {"action":"cursor","time":"0","x":355,"y":250,"yoff":92}




 video = document.getElementsByTagName("video")[0];




pieceData={};
imagesize={};
notes=[];

startTime = new Date();
startTime = startTime.getTime();
partModel = Object.assign({},initialPartModel);

//partModel.startTime = (new Date()).getTime()+340;  // maybe move this!!

//var vpromise = video.play();
//vpromise.then(function(){
//  console.log("setting video time again!")
//  video.currentTime = partModel.currentTime})

//notes = pieceData.animation["score"];
//partModel.notes = notes;
//partModel.position=0;

/*
  rangeslider -- this is the code initializing the rangeslider
*/
$('input[type="range"]').rangeslider({
  onInit: function() {
    console.log("init");
  },
  onSlide: function(pos, value) {
    console.log("pos="+pos+" val="+val);
    if (!running) {
      startTime = new Date();
      startTime = startTime.getTime();
      running=true;
      playLoop();
    }
  }
}).on('input', function() {
  //console.log("val="+this.value);
  partModel.startTime -= (this.value - partModel.currentTime)
  video.currentTime = this.value/1000.0;

});


document.addEventListener("keydown",keydownListener);

var startButton = document.getElementById('startVideos')
startButton.addEventListener('click',function(event){
  if (startButton.innerHTML.trim()=='Start'){
    startButton.innerHTML = 'Stop'
    video.currentTime = 0
    partModel.startTime= new Date()
    startApp('mastermenu')
  } else {
    running=false;
    video.currentTime = 0
    video.pause();
    startButton.innerHTML = 'Start'
  }
})

var myLayout = $('div#container').layout();
myLayout.sizePane("west","40%");
myLayout.sizePane("east","20%");
myLayout.sizePane("south","20%");
$(".description").hide();
$(".partintro").show();
