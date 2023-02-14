const eventSource = new EventSource("/message/subscribe");
const myFace = document.getElementById("myFace");
const cameraBtn = document.getElementById("camera");
const muteBtn = document.getElementById("mute");
const camerasSelect = document.getElementById("cameras");
const welcome = document.getElementById("welcome");
const call = document.getElementById("call");

let myStream;
let muted = false;
let cameraOff = false;
let myPeerConnection;
let userId;
let roomName;

async function initCall() {
    welcome.hidden = false;
    call.hidden = true;
    await getMedia();
    makeConnection();
}

function makeConnection() {
    myPeerConnection = new RTCPeerConnection();
    myPeerConnection.addEventListener("icecandidate", handleIce)
    myPeerConnection.addEventListener("addstream", handleAddStream)
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream))
}

function handleAddStream(data) {
    console.log("addStream")
    console.log("PeerStream : ", data.stream)
    console.log("MyStream: ", myStream)
    const peersStream = document.getElementById("peersStream");
    peersStream.srcObject = data.stream
}

async function handleIce(data) {
    const candidate = data.candidate
    await fetch("/message/publish", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            type: "ice",
            payload: JSON.stringify(candidate),
            userId: userId,
        }),
    }).then((response) => {});
}

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const cameras = devices.filter(device => device.kind == "videoinput")
        const currentCamera = myStream.getVideoTracks()[0]
        cameras.forEach(camera => {
            const option = document.createElement("option")
            option.value = camera.deviceId
            option.innerText = camera.label
            if (currentCamera.label === camera.label) {
                option.selected = true;
            }
            camerasSelect.appendChild(option)
        })
    } catch (e) {
        console.log(e)
    }
}

async function getMedia(deviceId) {
    const initialConstrains = {
        audio: true,
        video: { facingMode: "user"},
    }
    const cameraConstraints = {
        audio: true,
        video: { deviceId : { exact : deviceId } }
    }
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstrains
        )
        myFace.srcObject = myStream
        await getCameras()
    } catch (e) {
        console.log(e)
    }
}

function handleCameraBtn() {
    myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled)
    if (cameraOff) {
        cameraBtn.innerText = "카메라 끄기"
        cameraOff = false;
    } else {
        cameraBtn.innerText = "카메라 켜기"
        cameraOff = true;
    }
}

function handleMuteBtn() {
    myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled)
    if (muted) {
        muteBtn.innerText = "음소거"
        muted = false
    } else {
        muteBtn.innerText = "음소거 해제"
        muted = true
    }
}

async function handleCameraChange() {
    await getMedia(camerasSelect.value)

    if (myPeerConnection) {
        const videoTrack = myStream.getVideoTracks()[0]
        const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind === "video");
        console.log(videoSender)
        videoSender.replaceTrack(videoTrack);
    }
}

async function handleWelcomeSubmit(event) {
    event.preventDefault()
    userId = welcomForm.querySelector("#userId").value
    roomName = welcomForm.querySelector("#roomName").value
    await initCall();
    await fetch("/message/publish", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            type: "enter",
            payload: roomName,
            userId: userId,
        }),
    }).then((response) => {});
    welcome.hidden = true;
    call.hidden = false;
}

cameraBtn.addEventListener("click", handleCameraBtn)
muteBtn.addEventListener("click", handleMuteBtn)
camerasSelect.addEventListener("input", handleCameraChange)

welcomForm = welcome.querySelector("form");
welcomForm.addEventListener("submit", handleWelcomeSubmit)

eventSource.onerror = function(error) {
    console.log("error: ", error)
};

eventSource.onmessage = async function(message) {
    const data = JSON.parse(message.data);
    console.log("userId: ", userId)
    console.log("data: ", data)

    if (data.userId === userId) return;

    if (data.type === "enter") {
        const offer = await myPeerConnection.createOffer();
        myPeerConnection.setLocalDescription(offer)
        await fetch("/message/publish", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                type: "offer",
                payload: JSON.stringify(offer),
                userId: userId,
            }),
        }).then((response) => {
            welcome.hidden = true;
            call.hidden = false;
        });
    } else if (data.type === "offer") {
        const offer = JSON.parse(data.payload);
        myPeerConnection.setRemoteDescription(offer);
        const answer = await myPeerConnection.createAnswer();
        myPeerConnection.setLocalDescription(answer)
        await fetch("/message/publish", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                type: "answer",
                payload: JSON.stringify(answer),
                userId: userId,
            }),
        }).then((response) => {
            console.log(response)
        });
    } else if (data.type === "answer") {
        console.log("answer 들어옴")
        const answer = JSON.parse(data.payload)
        console.log(answer)
        myPeerConnection.setRemoteDescription(answer);
    } else if (data.type === "ice") {
        const ice = JSON.parse(data.payload)
        console.log("ice 받음", ice)
        myPeerConnection.addIceCandidate(ice);
    }
};

eventSource.onopen = function(event) {
    console.log("connection start!!", event)
};
