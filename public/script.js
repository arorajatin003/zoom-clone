const socket = io("/")
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3030'
  })
let myStream;
navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then(stream=>{
    myStream = stream;
    addVideoStream(myVideo,stream);
    console.log("Here");
    myPeer.on('call', call => {
        console.log("Answering");
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })
        
    })
    socket.on('user-connected', userId => {
        setTimeout(() => {
            // user joined
            newUserConnected(userId, stream)
        }, 1000)
        // newUserConnected(userId, stream)
    })
    
})


myPeer.on('open', id=>{
    socket.emit('join-room',ROOM_ID, id);
    console.log("opening");
})

let text = $('input');
console.log(text);
$('html').keydown(e=>{
    if(e.which == 13 && text.val().length!=0){
        socket.emit('message', text.val());
        text.val('');
    }
})

socket.on('createMessage',message =>{
    $('.messages').append(`<li class="message"><b>user: </b>${message}</li>`)
});

const newUserConnected = (userId,stream)=>{
    const call = myPeer.call(userId, stream)
    console.log("Calling");
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}

const addVideoStream = (video, stream)=>{
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

const muteUnmute = ()=>{
    const enabled = myStream.getAudioTracks()[0].enabled;
    console.log(enabled);
    if(enabled){
        myStream.getAudioTracks()[0].enabled=false;
        setUnmuteButton();
    }else{
        myStream.getAudioTracks()[0].enabled=true;
        setMuteButton();
    }
};

const playStop = () => {
    let enabled = myStream.getVideoTracks()[0].enabled;
    console.log("Video:",enabled);
    if (enabled) {
      myStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      myStream.getVideoTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
  }
  
  const setUnmuteButton = () => {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
  }
  
  const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
  }
  
  const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
  }