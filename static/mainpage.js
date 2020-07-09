document.addEventListener('DOMContentLoaded', () => {
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port)

    socket.on('connect', () => {

        document.querySelectorAll('button').forEach(button => {
            button.onclick = () => {
                const selection = button.dataset.vote;
                socket.emit('submit vote', { 'selection': selection })
            }
        })
    })

    socket.on('announce message', data => {
        const msg = document.createElement('div');
        msg.className = "message-block";
        msg.innerHTML = `Lol message: ${data.message}`;
        document.querySelector('#chat').append(msg);
    })
})