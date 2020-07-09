document.addEventListener('DOMContentLoaded', () => {
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port)

    // chatroom creation
    socket.on('connect', () => {
        const newChatForm = document.querySelector('.create-chat-submit')
        socket.emit('create chat', { 'chatName': "0" })
        newChatForm.onsubmit = () => {
            event.preventDefault();
            const chatName = document.querySelector('input[name="chatname-input"]')
            console.log(chatName.value)
            socket.emit('create chat', { 'chatName': chatName.value })
        }
    })
    // fill with all chatrooms
    socket.on('new chat', data => {
        // clear chatrooms
        document.querySelector('.chats').innerHTML = "";

        for (entry in data.chatrooms) {
            const chatName = data.chatrooms[entry]
            const chat = document.createElement('div');
            chat.innerHTML = `${chatName}`;
            chat.className = "chat-block card";
            chat.onclick = () => {
                socket.emit('enter chat', { 'clickedChat': chatName })
            }
            document.querySelector('.chats').append(chat);
        }
    })
    socket.on('init messages', data => {
        // clear all messages
        document.querySelector('.msgArea').innerHTML = "";
        document.querySelector('.writeArea').innerHTML = "";

        // fill chatArea with messages
        console.log(data.initMessages);
        for (i in data.initMessages) {
            message = data.initMessages[i];
            msg = createMessage(message);
            document.querySelector('.msgArea').append(msg);
        }

        // construct message field
        const msgFieldName = "message-field";
        const msgForm = createForm(msgFieldName, "send message");
        msgForm.className = "message-form";
        msgForm.onsubmit = () => {
            event.preventDefault();
            const msgField = document.querySelector(`input[name=${msgFieldName}]`)
            console.log(msgField.value);
            socket.emit('send message', { 'msg': msgField.value })
        }
        document.querySelector('.writeArea').append(msgForm);

    })
    socket.on('announce message', data => {
        //make message block
        msg = createMessage(data.msg);
        console.log("announce msg", data.msg)
        const msgField = document.querySelector('input[name="message-field"]')
        msgField.value = "";
        document.querySelector('.msgArea').append(msg);
    })
    function createMessage(val) {
        const msg = document.createElement('div');
        msg.className = "message-block";
        msg.innerHTML = `${val.user}: ${val.message}`;
        return msg;
    }

    function createForm(name, value) {
        var form = document.createElement("form");
        let inputGroup = document.createElement("div");
        inputGroup.className = "input-group";
        var inputText = document.createElement("input"); //input element, text
        inputText.setAttribute('type', "text");
        inputText.setAttribute('name', name);
        inputText.className = "form-control";
        inputText.value = "";
        let inputAppend = document.createElement("div");
        inputAppend.className = "input-group-append";
        var submitButton = document.createElement("button"); //input element, Submit button
        submitButton.setAttribute('type', "submit");
        submitButton.innerHTML = value;
        submitButton.className = "btn btn-primary";



        inputGroup.appendChild(inputText);
        inputAppend.appendChild(submitButton);
        inputGroup.appendChild(inputAppend);
        form.appendChild(inputGroup);
        return form;
    }
}
)