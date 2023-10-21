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


// send data to server
// @type: msg for message; name for new name; leave for close;
function sendmsg(umsg, type='msg') {
    websocket.send('{"type":"' + type + '", "msg":"' + umsg + '"}');
}

//处理数据
// received data structure: {"type":"<type>", "uid": "<userid>", "uname": "<username>", "data":"<text message>"}
function processWsData(d) {
    var data = JSON.parse(d);
    console.log('data.type: ' + data.type);
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
        alert(data.data);

    } else if (data.type == 'newmsg') {
        // display the new message
        addnewmsg(data);

    } else if (data.type == 'newjoin') {
        // new user join
        alert("用户“" + data.data + "”加入了聊天室。");

    } else if (data.type == 'leave') {
        // someone leave
        alert("用户“" + data.data + "”离开了聊天室。");

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
    // wrap the message into a dom and add it to the page
    var msgname = data.uname;
    var msgtext = data.data;
    if (data.uid == userid) { // my message
        console.log('you send: ' + msgtext);
        var domstr = '';
        // document.getElementById('chat_window').append(domstr);
    } else { // others message
        console.log('user ' + msgname + ' send: ' + msgtext);
        var domstr = '';
        // document.getElementById('chat_window').append(domstr);
    }
}
