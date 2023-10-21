<?php

$socketConf = array(
    'reactor_num' => 8,
    'log_file' => "/home/ucasuser/www/ucaschat/log/chat.log",
    'log_level' => 1,
    'user' => 'www',
    'group' => 'www',
    'chroot' => "/home/ucasuser/www/ucaschat",
    'daemonize' => 1
);

$namelist = new swoole_table(2048);
$namelist->column('fd', swoole_table::TYPE_INT);
$namelist->column('name', swoole_table::TYPE_STRING, 127);
$namelist->create();

$serv = new swoole_websocket_server('127.0.0.1', 20230);
$serv->set($socketConf);

$serv->on('open', function (swoole_websocket_server $server, $request) {
    echo "new connection established with fd: {$request->fd}\n";
    $server->push($request->fd, json_text("newconnect", "设置昵称后，开始聊天。", 0));
});

$serv->on('message', function (swoole_websocket_server $server, $frame) use ($namelist) {
    echo "fd:{$frame->fd},data:{$frame->data},oc:{$frame->opcode},fn:{$frame->finish}\n";
    if ($frame->data) {
        $data = json_decode($frame->data); // {"type":"", "msg":""}
        if ($data->type == 'join' && empty($namelist->get($frame->fd))) {
            $uname = trim(strval($data->msg));
            $namelist->set($frame->fd, array('fd' => $frame->fd, 'name' => $uname));
            $server->push($frame->fd, json_text("join", "欢迎你，" . $uname . "！现在可以开始聊天了。", $frame->fd, $uname));
            // notify all others
            foreach ($namelist as $item) {
                $server->push($item['fd'], json_text("newjoin", $uname, 0));
            }
        } else if ($data->type == 'msg') {
            $user = $namelist->get($frame->fd);
            if (empty($user)) {
                $server->push($frame->fd, json_text("newconnect", "设置昵称后，开始聊天。", 0));
            } else {
                $msg = trim(strval($data->msg));
                if (!empty($msg)) {
                    foreach ($namelist as $item) {
                        $server->push($item['fd'], json_text("newmsg", $msg, $user['fd'], $user['name']));
                    }
                }
            }
        } else {
            $server->push($frame->fd, '');
        }
    }
});
$serv->on('request', function (swoole_http_request $request, swoole_http_response $response) use ($serv) {
    // $server->connections 遍历所有websocket连接用户的fd，给所有用户推送
    // foreach ($serv->connections as $fd) {
    //     $serv->push($fd, $request->get['message']);
    // }
});
$serv->on('close', function ($server, $fd) use ($namelist) {
    $user = $namelist->get($fd);
    if (!empty($user)) {
        $namelist->del($fd);
        echo "client {$fd} closed\n";
        foreach ($namelist as $item) {
            $server->push($item['fd'], json_text("leave", $user['name'], 0));
        }
    }
});

$serv->start();

function json_text($type, $msg, $uid, $uname = '') {
    return '{"type":"' . $type . '","data":"' . $msg . '","uid":' . intval($uid) . ',"uname":"' . $uname . '"}';
}
