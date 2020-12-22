const messages = document.querySelector(".messages");
const textMessage = document.querySelector(".message");
const sendButton = document.querySelector(".send_button");
const displayName = document.querySelector(".display_name");
const activeTypers = document.querySelector(".active-typers");

const timeoutPeriod = 2000;

const colorOptions = ["#FFD000", "#00FFBC", "#FF77CB"];
const color = colorOptions[Math.floor(Math.random() * 3)];

const socket = io();
socket.emit("join-room", ROOMID, USERID);
socket.on("new-member", userId => {
    console.log(userId);
});

socket.on("new-message", textObj => {
    addMessage(textObj);
});

sendButton.addEventListener("click", e => {
    e.preventDefault();
    const text = textMessage.value;
    const name = displayName.value ? displayName.value : "Anonymous";
    if (!text) return; 
    const textObj = {content: text, name: name, color: color, id: USERID};
    addMessage(textObj);
    socket.emit("emit-message", ROOMID, textObj);
    

    textMessage.value = "";
});

textMessage.addEventListener("input", () => {
    const name = displayName.value ? displayName.value : "Anonymous";
    socket.emit("emit-typing", ROOMID, USERID, name);
});

let usersTying = {}

socket.on("user-typing", (userId, displayName) => {
    if (usersTying[userId]) return;
    usersTying[userId] = displayName;

    const div = document.createElement("div");
    div.className = "user_typing";
    div.id = userId;
    div.innerText = `${displayName} is Typing`;
    activeTypers.appendChild(div);

    setTimeout(() => {
        div.remove();
        usersTying[userId] = null;
    }, timeoutPeriod);
}); 


function addMessage({ content, name, color, id }) {
    if (id !== USERID) {
        const allTypers = Array.from(activeTypers.children);
        allTypers.forEach(typer => {
            if (typer.id === id) typer.remove();
        });
        usersTying[id] = null;
    }

    const div = document.createElement("div");

    const textP = document.createElement("p");
    textP.innerText = content;
    div.appendChild(textP);

    const date = new Date();
    const hour = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
    const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    const time = `${hour}:${minutes}`
    const detailsP = document.createElement("p");
    detailsP.style.color = color;
    detailsP.innerText = name;
    detailsP.classList = "user-name";
    const br = document.createElement('br');
    detailsP.appendChild(br);
    const timeP = document.createElement("p");
    timeP.innerText = time; 
    detailsP.appendChild(timeP);
    div.className = "text_div";
    div.appendChild(detailsP);

    messages.insertBefore(div, activeTypers);
    div.scrollIntoView({
        behavior: "smooth",
    });
}

function adjustMessageHeight() {
    document.body.style = `${window.innerHeight}px`;
    messages.style.height = `${window.innerHeight - 90}px`;
}

window.addEventListener("DOMContentLoaded", adjustMessageHeight);
window.addEventListener("resize", adjustMessageHeight);