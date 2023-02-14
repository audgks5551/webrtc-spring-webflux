const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nickNameForm = document.querySelector("#nickName");

const socket = new WebSocket("ws://192.168.0.2:9999/event-emitter");

socket.onopen = () => {
    console.log("clientWebSocket.onopen", socket);
    console.log("clientWebSocket.readyState: websocketstatus");
}

socket.onclose = error =>  {
    console.log(`clientWebSocket.onclose : ${error}`);
}

socket.onerror = error => {
    console.log(`clientWebSocket.onerror : ${error}`);
}

socket.onmessage = message => {
    console.log(`clientWebSocket.onmessage : ${message.data}`);
    console.log(socket)
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
}

function makeMessage(type, payload) {
    return JSON.stringify({type, payload})
}

function handleSumit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("message", input.value));
    input.value = "";
}

function handleNickSubmit(event) {
    event.preventDefault();
    const input = nickNameForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
}

messageForm.addEventListener("submit", handleSumit);
nickNameForm.addEventListener("submit", handleNickSubmit);