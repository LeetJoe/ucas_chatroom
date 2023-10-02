# ucas_chatroom
for ucas home work only

可以从阿里云盘[下载成品镜像](https://www.adrive.com)，可以省去环境配置和软件安装、代码部署的步骤。
> 虚拟机实例中的用户名及密码：
> 
> ucasuser/123456
> 
> root/Abc123!

# 操作系统与运行环境
* [CentOS-7](https://mirrors.tuna.tsinghua.edu.cn/centos/7.9.2009/isos/x86_64/CentOS-7-x86_64-Everything-2009.iso)
* [VirtualBox 7.0](https://www.virtualbox.org/wiki/Downloads)
* [php8.2.11](https://www.php.net/distributions/php-8.2.11.tar.gz)
* [swoole5.0.2](https://wenda-1252906962.file.myqcloud.com/dist/swoole-src-5.0.2.tar.gz)

# 环境配置和软件安装

## 安装 VirtualBox
使用上面提供的链接下载VirtualBox7.0并安装，然后在“File->Tools->Network Manager”里，新建一个Host-only Networks和NAT Networks；
## 安装CentOS7操作系统虚拟机
1. 在VirtualBox主界面单击“New“按钮，创建一个新的虚拟机；
2. ISO Image选择通过上方给出的链接下载的 CentOS7 iso 系统镜像；
3. 在后续的设置中，设置虚拟机的 cpu 核数不少于 2，内存不少于 2G，硬盘空间不少于 20G；
4. 安装过程中创建用户 *ucasuser* 并设置密码，同时也创建一个 root 密码。
## 安装软件
1. 切换到 *root* 用户，执行下述命令，执行结束后切换回 *ucasuser* 用户：
```
yum -y install gcc gcc-c++ openssl-devel
yum install libxml2 libxml2-devel sqlite-devel.x86_64 httpd-devel
yum install autoconf wget git
```
2. 创建目录结构
```
mkdir /home/ucasuser/downloads
mkdir /home/ucasuser/apps
mkdir -p /home/ucasuser/www/ucaschat
```
3. 下载资源并解压
```
cd /home/ucasuser/downloads
wget https://www.php.net/distributions/php-7.4.33.tar.gz
wget https://nginx.org/download/nginx-1.25.2.tar.gz
wget https://wenda-1252906962.file.myqcloud.com/dist/v4.8.11/swoole-src-4.8.11.tar.gz
tar zxvf php-7.4.33.tar.gz
tar zxvf nginx-1.25.2.tar.gz
tar zxvf swoole-src-4.8.11.tar.gz
```
4. 安装php7.4 with swoole4.8
```
cp -r /home/ucasuser/downloads/swoole-src-4.8.11 /home/ucasuser/downloads/php-7.4.33/ext/swoole-src
cd /home/ucasuser/downloads/php-7.4.33
./buildconf --force
./configure --help | grep swoole
./configure --prefix=/home/ucasuser/apps/php7 --enable-fpm --with-fpm-user=www --with-fpm-group=www --disable-rpath --enable-sysvsem --with-openssl --with-mhash --enable-pcntl --enable-sockets --without-pear --disable-fileinfo --enable-swoole
make
make install
```
5. nginx 安装
```
cd /home/ucasuser/downloads/nginx-1.25.2
./configure --prefix=/home/ucasuser/apps/nginx --with-pcre --with-stream --with-http_ssl_module --with-stream_ssl_module
make
make install
```
6. 安装结果验证
```
/home/ucasuser/apps/php7/bin/php -m | grep swoole
/home/ucasuser/apps/nginx/sbin/nginx -version
```
如果两个命令可以正常执行并正确返回所安装的 swoole 模块名称和 nginx 的版本信息，则表示安装成功。
7. 软件配置 **todo**
```
vim php.ini
vim nginx.conf
```


# 代码部署与服务启动
1. 从 github 下载 [LeetJoe/ucas_chatroom](https://github.com/LeetJoe/ucas_chatroom) 项目源代码，并将代码目录部署到 /home/ucasuser/www/ucaschat；
2. 执行下面的代码启动服务
```
cd /home/ucasuser/apps/php7
./sbin/php-fpm
```


# 功能验证




