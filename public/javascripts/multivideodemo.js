(function localFileVideoPlayer() {
	'use strict'
  var URL = window.URL || window.webkitURL
  var displayMessage = function (message, isError) {
    var element = document.querySelector('#message')
    element.innerHTML = message
    element.className = isError ? 'error' : 'info'
  }

  var theFiles = [
     {name:'/pieces/ortoMotet/videos/Master.mp4',type:'video/mp4'},
     {name:'/pieces/ortoMotet/videos/Altus.mp4',type:'video/mp4'},
     {name:'/pieces/ortoMotet/videos/Cantus.mp4',type:'video/mp4'},
     {name:'/pieces/ortoMotet/videos/Tenor.mp4',type:'video/mp4'},
     {name:'/pieces/ortoMotet/videos/Bassus.mp4',type:'video/mp4'},
     {name:'/pieces/ortoMotet/videos/MasterMenu.mp4',type:'video/mp4'},
   ]


  var playSelectedFile = function (file, id){
    console.dir(file)
    console.log(id)
    var type = file.type
    var vid = file.name.substring(file.name.lastIndexOf("/")+1,file.name.indexOf("."))
    console.log(`vid=${vid} type=${type} file=${JSON.stringify(file)}`)
    var videoNode = document.getElementById(vid)
    var canPlay = videoNode.canPlayType(type)
    if (canPlay === '') canPlay = 'no'
    var message = 'Can play type "' + type + '": ' + canPlay
    var isError = canPlay === 'no'
    displayMessage(message, isError)

    if (isError) {
      return
    }

    //var fileURL = URL.createObjectURL(file)
    //videoNode.src = fileURL

    var req = new XMLHttpRequest();
    req.open('GET', file.name, true);
    req.responseType = 'blob';

    req.onload = function() {
       // Onload is triggered even on 404
       // so we need to check the status code
       if (this.status === 200) {
          var videoBlob = this.response;
          var vid = URL.createObjectURL(videoBlob); // IE10+

          videoNode.src = vid;
       }
    }
    req.onerror = function() {
       // Error
    }
    req.send();
  }


  var playSelectedFiles = function (event) {
    console.log('in play selected files')
    this.files=theFiles
    console.dir(this.files)
    var file = this.files[0]
    playSelectedFile(this.files[0],'Master')
    playSelectedFile(this.files[1],'Altus')
    playSelectedFile(this.files[2],'Cantus')
    playSelectedFile(this.files[3],'Tenor')
    playSelectedFile(this.files[4],'Bassus')
    playSelectedFile(this.files[5],'MasterMenu')
  }

  var playSelectedFile2 = function(file,id){

    var type = file.type
    var vid = file.name.substring(0,file.name.indexOf("."))
    var videoNode = document.getElementById(vid)
    var canPlay = videoNode.canPlayType(type)
    if (canPlay === '') canPlay = 'no'
    var message = 'Can play type "' + type + '": ' + canPlay
    var isError = canPlay === 'no'
    displayMessage(message, isError)

    if (isError) {
      return
    }

    var fileURL = URL.createObjectURL(file)
    videoNode.src = fileURL
  }

  var inputNode = document.querySelector('input')
  inputNode.addEventListener('change', playSelectedFiles, false)

  var playButton = document.getElementById('start')
  play.addEventListener('click',playSelectedFiles,false)
})()
