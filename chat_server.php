<?php

echo "what is the fuck\n";

$socketConf = array(
    'reactor_num' => 8,
    'worker_num' => 4,
    'task_worker_num' => 2,
    'log_file' => "/home/ucasuser/www/ucaschat/log/chat.log",
    'log_level' => 1,
    'user' => 'www',
    'group' => 'www',
    'chroot' => "/home/ucasuser/www/ucaschat",
    'daemonize' => 1
);

$table = new Swoole\Table(32);
$table->column('data', swoole_table::TYPE_STRING, 20480);
$table->create();
$config = array('name' => 'user', 'jtime');
$table->set('config', array('data' => json_encode($config)));
$config = json_decode((string)$table->get('config')['data'], true);

$serv = new Swoole\Server('127.0.0.1', 20230);
$serv->set($socketConf);
$serv->on('Start', function($server) {
    echo "new chat server started\n";
});

// When get connected(join)
$serv->on('Connect', function($server, $fd, $fromid) {
    echo "$fd Connected \n";
    // send prompt for username
    $server->send($fd, 'name yourself!');
});

// When get message from client
$serv->on('Receive', function($server, $fd, $fromid, $data) use ($table) {
    // if username found, then broadcast to the table;
    // if username not found, add into the table;
    if (!$json = json_decode(trim((string)$data), true)) {
        $server->send($fd, '{"status":0,"msg":"param error"}');
        return;
    }
    $server->task('getmsg', 0);
});

# Task进程
$serv->on('Task', function ($server, $taskid, $workerid, $data) use ($table) {
    if ($data == 'getmsg') {
        $server->send();
    }
    $server->finish("broadcast done");
});

# worker进程
$serv->on('WorkerStart', function ($server, $workerId) use ($table) {
    echo "new chat workder {$workerId} started.\n";
});

# 任务结束回调
$serv->on('Finish', function($server, $taskid, $data) {
    if ($data == 'done') {
        echo "All needed password got.\n";
    }
});

// When closed(leave)
$serv->on('Close', function($server, $fd, $fromid) {
    echo "$fd Closed \n";
});

$serv->start();

