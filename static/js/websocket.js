
//激活 socket
function websocketInit() {
    //已经激活,不再触发
    if (typeof websocket != 'object' || websocket.readyState != 1 || typeof websocket == 'undefined') {
        var wsprotocal = document.location.protocol == 'https:' ? 'wss:' : 'ws:';
        var wsUri = wsprotocal + "//" + "socket.ucaschatroom.com";
        websocket = new WebSocket(wsUri);
        websocket.onopen = function () {
            console.log('connection open. state: ' + websocket.readyState);
        };
        return websocket;
    } else {
        return websocket;
    }
}

//socket onMessage
function socketMessage() {
    websocket.onmessage = function (evt) {
        if (evt.data instanceof Blob) {
            var fileReader = new FileReader();
            fileReader.onload = function() {
                if (fileReader.readyState == 2) {
                    var plain = pako.inflate(this.result);
                    var localdata="";
                    for (var i=0; i<plain.byteLength; i++) {
                        localdata += String.fromCharCode(plain[i]);
                    }
                    processWsData(localdata);
                }
            };
            fileReader.readAsArrayBuffer(evt.data);
        } else {
            processWsData(evt.data);
        }
    }
}

// user send message
function usersend() {
    // 获取输入的消息内容
    const message = messageInput.value;
    sendmsg(message);

    // 清空输入框
    messageInput.value = '';
}


// send message to server
function sendmsg(umsg, type='msg') {
    websocket.send('{"type":"' + type + '", "msg":"' + umsg + '"}');
}

//处理数据
// received data structure: {"type":"<type>", "uid": "<userid>", "uname": "<username>", "data":"<text message>"}
function processWsData(d) {
    var data = JSON.parse(d);
    // console.log(data);
    if (data.type == 'newconnect') {
        // prompt for a name
        var word = prompt(data.data,"");
    　　 if(word){
    　　      sendmsg(word, 'join');
        }

    } else if (data.type == 'join') {
        // show welcome and record the userid
        userid = data.uid;
        username = data.uname;
        // alert(data.data);

    } else if (data.type == 'newmsg') {
        // display the new message
        addnewmsg(data);

    } else if (data.type == 'newjoin') {
        // new user join
        data.data = "用户“" + data.data + "”加入了聊天室。";
        addnewmsg(data);

    } else if (data.type == 'leave') {
        // someone leave
        data.data = "用户“" + data.data + "”离开了聊天室。";
        addnewmsg(data);

    } else if (data.type == 'alert') {
        alert(data.data);

    } else if (data.type == 'debug') {
        console.log(data.data);
    } else {
        console.log('message not valid.');
    }
}

// add the newly received message to the chat window.
function addnewmsg(data) {
    if (userid <= 0) return;
    var message = '';

    // 创建一个新的消息元素
    const newMessage = document.createElement('div');
    newMessage.classList.add('message');

    if (data.uid == 0) {
        // 系统消息
        newMessage.style.backgroundColor = '#FFFF00';
        newMessage.style.color = 'red';
        message = '(系统消息：' + data.data + ')';
    } else if (data.uid == userid) {
        // 用户消息
        newMessage.style.backgroundColor = '#428bca';
        newMessage.style.color = 'white';
        message = '“我”说：' + data.data;
    } else {
        // 他人消息
        newMessage.style.backgroundColor = '#f5f5f5';
        newMessage.style.color = '#333';
        message = '“' + data.uname + '”说：' + data.data;
    }

    // 设置消息内容和样式
    newMessage.innerHTML = message;
    newMessage.style.padding = '5px 10px';
    newMessage.style.marginBottom = '10px';

    // 将消息添加到对话展示框中
    chatDisplay.appendChild(newMessage);
}
