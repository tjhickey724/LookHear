(function localFileVideoPlayer() {
	'use strict'
  var URL = window.URL || window.webkitURL
  var displayMessage = function (message, isError) {
    var element = document.querySelector('#message')
    element.innerHTML = message
    element.className = isError ? 'error' : 'info'
  }
  var playSelectedFiles = function (event) {
    console.dir(this.files)
    var file = this.files[0]
    playSelectedFile(this.files[0],'Master')
    playSelectedFile(this.files[1],'Altus')
    playSelectedFile(this.files[2],'Cantus')
    playSelectedFile(this.files[3],'Tenor')
    playSelectedFile(this.files[4],'Bassus')
    playSelectedFile(this.files[5],'MasterMenu')

  }
  var playSelectedFile = function(file,id){

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
})()
