# nginx

## 1.nginx 应用场景

- 静态资源服务器
- 反向代理服务
- API 接口服务(Lua&Javascript)

![nginx2](../../assets/images/linux/nginx2.jpeg)

## 2.nginx 优势

- 高并发高性能
- 可扩展性好
- 高可靠性
- 热布署
- 开源许可证

## 3. 操作系统

centos764 位

### 3.2 环境确认

#### 3.2.1 关闭防火墙

| 功能           | 命令                                |
| -------------- | ----------------------------------- |
| 停止防火墙     | systemctl stop firewalld.service    |
| 永久关闭防火墙 | systemctl disable firewalld.service |

#### 3.2.2 确认停用 selinux

- 安全增强型 Linux（Security-Enhanced Linux）简称 SELinux，它是一个 Linux 内核模块，也是 Linux 的一个安全子系统。
- SELinux 主要作用就是最大限度地减小系统中服务进程可访问的资源（最小权限原则）。

| 功能     | 命令                                                        |
| -------- | ----------------------------------------------------------- |
| 检查状态 | getenforce                                                  |
| 检查状态 | /usr/sbin/sestatus -v                                       |
| 临时关闭 | setenforce 0                                                |
| 永久关闭 | /etc/selinux/config SELINUX=enforcing 改为 SELINUX=disabled |

#### 3.2.4 安装依赖模块

```shell
yum  -y install gcc gcc-c++ autoconf pcre pcre-devel make automake openssl openssl-devel
```

| 软件包      | 描述                                                                                                                                                                                                                                                                                            |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| gcc gcc     | 是指整个 gcc 的这一套工具集合，它分为 gcc 前端和 gcc 后端（我个人理解为 gcc 外壳和 gcc 引擎），gcc 前端对应各种特定语言（如 c++/go 等）的处理（对 c++/go 等特定语言进行对应的语法检查, 将 c++/go 等语言的代码转化为 c 代码等），gcc 后端对应把前端的 c 代码转为跟你的电脑硬件相关的汇编或机器码 |
| gcc-c++     | 而就软件程序包而言，gcc.rpm 就是那个 gcc 后端，而 gcc-c++.rpm 就是针对 c++这个特定语言的 gcc 前端                                                                                                                                                                                               |
| autoconf    | autoconf 是一个软件包，以适应多种 Unix 类系统的 shell 脚本的工具                                                                                                                                                                                                                                |
| pcre        | PCRE(Perl Compatible Regular Expressions)是一个 Perl 库，包括 perl 兼容的正则表达式库                                                                                                                                                                                                           |
| pcre-devel  | devel 包主要是供开发用,包含头文件和链接库                                                                                                                                                                                                                                                       |
| make        | 常指一条计算机指令，是在安装有 GNU Make 的计算机上的可执行指令。该指令是读入一个名为 makefile 的文件，然后执行这个文件中指定的指令                                                                                                                                                              |
| automake    | automake 可以用来帮助我们自动地生成符合自由软件惯例的 Makefile                                                                                                                                                                                                                                  |
| wget        | wget 是一个从网络上自动下载文件的自由工具，支持通过 HTTP、HTTPS、FTP 三个最常见的 TCP/IP 协议 下载，并可以使用 HTTP 代理                                                                                                                                                                        |
| httpd-tools | apace 压力测试                                                                                                                                                                                                                                                                                  |
| vim         | Vim 是一个类似于 Vi 的著名的功能强大、高度可定制的文本编辑器                                                                                                                                                                                                                                    |

| 目录名   |                        |
| -------- | ---------------------- |
| app      | 存放代码和应用         |
| backup   | 存放备份的文件         |
| download | 下载下来的代码和安装包 |
| logs     | 放日志的               |
| work     | 工作目录               |

## 4. nginx 的架构

### 4.1 轻量

- 源代码只包含核心模块
- 其它非核心功能都是通过模块实现，可以自由选择

### 4.2 架构

- Nginx 采用的是多进程(单线程)和多路 IO 复用模型

#### 4.2.1 工作流程

- Nginx 在启动后，会有一个 `master` 进程和多个相互独立的 `worker` 进程。
- 接收来自外界的信号,向各 `worker` 进程发送信号,每个进程都有可能来处理这个连接。
- `master` 进程能监控 `worker` 进程的运行状态，当 `worker` 进程退出后(异常情况下)，会自动启动新的 `worker` 进程。

![nginx架构](../../assets/images/linux/nginxcomplex.png)

- worker 进程数，一般会设置成机器 cpu 核数。因为更多的 worker 数，只会导致进程相互竞争 cpu，从而带来不必要的上下文切换
- 使用多进程模式，不仅能提高并发率，而且进程之间相互独立，一个 worker 进程挂了不会影响到其他 worker 进程

#### 4.2.2 IO 多路复用

- 多个文件描述符的 IO 操作都能在一个线程里并发交替顺序完成，复用线程
  ![iomulti](../../assets/images/linux/iomulti.jpeg)

#### 4.2.3 CPU 亲和

- 把 CPU 内核和 nginx 的工作进程绑定在一起，让每个 worker 进程固定在一个 CPU 上执行，从而减少 CPU 的切换并提高缓存命中率，提高 性能

#### 4.2.4 sendfile

- sendfile 零拷贝传输模式

![sendfile](../../assets/images/linux/sendfile.jpeg)

## 5. nginx 安装

### 5.1 版本分类

- Mainline version 开发版
- Stable version 稳定版
- Legacy versions 历史版本

### 5.2 下载地址

- nginx
- linux_packages

### 5.3 CentOS 下 YUM 安装

```shell
vi /etc/yum.repos.d/nginx.repo
```

nginx.repo

```nginx.repo
[nginx]
name=nginx repo
baseurl=http://nginx.org/packages/centos/7/$basearch/
gpgcheck=0
enabled=1
```

```shell
yum install nginx -y //安装nginx
nginx -v //查看安装的版本
nginx -V //查看编译时的参数
```

```js
--prefix=/usr/share/nginx // 把nginx安装到那个目录下
--sbin-path=/usr/sbin/nginx // 可执行文件路径
--modules-path=/usr/lib64/nginx/modules // 安装的额外模块的了路径
--conf-path=/etc/nginx/nginx.conf // 配置文件路径
--error-log-path=/var/log/nginx/error.log  // 错误日志路径
--http-log-path=/var/log/nginx/access.log  // 普通日志路径
--http-client-body-temp-path=/var/lib/nginx/tmp/client_body
--http-proxy-temp-path=/var/lib/nginx/tmp/proxy
--http-fastcgi-temp-path=/var/lib/nginx/tmp/fastcgi
--http-uwsgi-temp-path=/var/lib/nginx/tmp/uwsgi
--http-scgi-temp-path=/var/lib/nginx/tmp/scgi
--pid-path=/run/nginx.pid  // 进程ID
--lock-path=/run/lock/subsys/nginx // 加锁文件
--user=nginx
--group=nginx
--with-compat
--with-debug
--with-file-aio
--with-google_perftools_module
--with-http_addition_module
--with-http_auth_request_module
--with-http_dav_module
--with-http_degradation_module
--with-http_flv_module
--with-http_gunzip_module
--with-http_gzip_static_module
--with-http_image_filter_module=dynamic
--with-http_mp4_module
--with-http_perl_module=dynamic
--with-http_random_index_module
--with-http_realip_module
--with-http_secure_link_module
--with-http_slice_module
--with-http_ssl_module
--with-http_stub_status_module
--with-http_sub_module
--with-http_v2_module
--with-http_xslt_module=dynamic
--with-mail=dynamic
--with-mail_ssl_module
--with-pcre
--with-pcre-jit
--with-stream=dynamic
--with-stream_ssl_module
--with-stream_ssl_preread_module
--with-threads
--with-cc-opt='-O2 -g -pipe -Wall -Wp,-D_FORTIFY_SOURCE=2 -fexceptions -fstack-protector-strong
--param=ssp-buffer-size=4 -grecord-gcc-switches -specs=/usr/lib/rpm/redhat/redhat-hardened-cc1 -m64 -mtune=generic'
--with-ld-opt='-Wl,-z,relro -specs=/usr/lib/rpm/redhat/redhat-hardened-ld -Wl,-E'
```

## 6. 目录

### 6.1 安装目录

查看 nginx 安装的配置文件和目录

```shell
rpm -ql nginx
```

### 6.2 日志切割文件

/etc/logrotate.d/nginx

- 对访问日志进行切割

```log
/var/log/nginx/*.log {
daily
}
```

```shell
ls /var/log/nginx/*.log
/var/log/nginx/access.log  /var/log/nginx/error.log
```

### 6.2 主配置文件

| 路径                           | 用途                     |
| ------------------------------ | ------------------------ |
| /etc/nginx/nginx.conf          | 核心配置文件             |
| /etc/nginx/conf.d/default.conf | 默认 http 服务器配置文件 |

### 6.3 守护进程管理

- 用于配置系统守护进程管理器管理方式

```shell
systemctl restart nginx.service # 重启nginx服务
systemctl reload nginx.service # 重新加载
```

### 6.4 nginx 模块目录

- nginx 安装的模块

| 路径                     | 用途                                                                                                                                                      |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| /etc/nginx/modules       | 最基本的共享库和内核模块,目的是存放用于启动系统和执行 root 文件系统的命令的如/bin 和/sbin 的二进制文件的共享库，或者存放 32 位，或者 64 位(file 命令查看) |
| /usr/lib64/nginx/modules | 64 位共享库                                                                                                                                               |

### 6.5 文档

nginx 的手册和帮助文件
| 路径| 用途
|---|---|
| /usr/share/doc/nginx-1.14.2 |帮助文档
| /usr/share/doc/nginx-1.14.0/COPYRIGHT |版权声明
| /usr/share/man/man8/nginx.8.gz |手册

### 6.6 缓存目录

| 路径             | 用途             |
| ---------------- | ---------------- |
| /var/cache/nginx | nginx 的缓存目录 |

### 6.7 日志目录

| 路径           | 用途             |
| -------------- | ---------------- |
| /var/log/nginx | nginx 的日志目录 |

### 6.8 可执行命令

nginx 服务的启动管理的可执行文件
| 路径| 用途
|---|---
| /usr/sbin/nginx| 可执行命令
| /usr/sbin/nginx-debug| 调试执行可执行命令

## 7. 编译参数

### 7.1 安装目录和路径

```conf
--prefix=/etc/nginx //安装目录
--sbin-path=/usr/sbin/nginx //可执行文件
--modules-path=/usr/lib64/nginx/modules //安装模块
--conf-path=/etc/nginx/nginx.conf  //配置文件路径
--error-log-path=/var/log/nginx/error.log  //错误日志
--http-log-path=/var/log/nginx/access.log  //访问日志
--pid-path=/var/run/nginx.pid //进程ID
--lock-path=/var/run/nginx.lock //加锁对象
```

### 7.2 指定用户

设置 nginx 进程启动的用户和用户组

```shell
--user=nginx   #指定用户
--group=nginx  #指定用户组
```

## 8. 配置文件

- /etc/nginx/nginx.conf #主配置文件
- /etc/nginx/conf.d/\*.conf #包含 conf.d 目录下面的所有配置文件
- /etc/nginx/conf.d/default.conf

### 8.1 nginx 配置语法

```conf
# 使用#可以添加注释,使用$符号可以使用变量
# 配置文件由指令与指令块组成,指令块以{}将多条指令组织在一起
http {
# include语句允许把多个配置文件组合起来以提升可维护性
    include       mime.types;
# 每条指令以;(分号)结尾，指令与参数之间以空格分隔
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;
    server {
        listen       80;
        server_name  localhost;
# 有些指令可以支持正则表达式
        location / {
            root   html;
            index  index.html index.htm;
        }
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
}
```

### 8.2 全局配置

| 分类 | 配置项           | 作用                           |
| ---- | ---------------- | ------------------------------ |
| 全局 | user             | 设置 nginx 服务的系统使用用户  |
| 全局 | worker_processes | 工作进程数,一般和 CPU 数量相同 |
| 全局 | error_log        | nginx 的错误日志               |
| 全局 | pid              | nginx 服务启动时的 pid         |

### 8.3 事件配置

| 分类   | 配置项             | 作用                                                                                                       |
| ------ | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| events | worker_connections | 每个进程允许的最大连接数 10000                                                                             |
| events | use                | 指定使用哪种模型(select/poll/epoll),建议让 nginx 自动选择,linux 内核 2.6 以上一般能使用 epoll 可以提高性能 |

### 8.4 http 配置

- /etc/nginx/nginx.conf
- 一个 HTTP 下面可以配置多个 server

```conf
user  nginx;   设置nginx服务的系统使用用户
worker_processes  1;  工作进程数,一般和CPU数量相同

error_log  /var/log/nginx/error.log warn;   nginx的错误日志
pid        /var/run/nginx.pid;   nginx服务启动时的pid

events {
    worker_connections  1024;每个进程允许的最大连接数 10000
}

http {
    include       /etc/nginx/mime.types;//文件后缀和类型类型的对应关系
    default_type  application/octet-stream;//默认content-type

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';  //日志记录格式

    access_log  /var/log/nginx/access.log  main;//默认访问日志

    sendfile        on;//启用sendfile
    #tcp_nopush     on;//懒发送

    keepalive_timeout  65;//超时时间是65秒

    #gzip  on; # 启用gzip压缩

    include /etc/nginx/conf.d/*.conf;//包含的子配置文件
}
```

### 8.5 server

- /etc/nginx/conf.d/default.conf
- 一个 server 下面可以配置多个 `location`

```conf
server {
    listen       80;  //监听的端口号
    server_name  localhost;  //用域名方式访问的地址

    #charset koi8-r; //编码
    #access_log  /var/log/nginx/host.access.log  main;//访问日志文件和名称

    location / {
        root   /usr/share/nginx/html;  //静态文件根目录
        index  index.html index.htm;  //首页的索引文件
    }

    #error_page  404              /404.html;  //指定错误页面

    # redirect server error pages to the static page /50x.html
    # 把后台错误重定向到静态的50x.html页面
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```

### 8.6 Systemd

系统启动和服务器守护进程管理器，负责在系统启动或运行时，激活系统资源，服务器进程和其他进程，根据管理，字母 d 是守护进程（daemon）的缩写

#### 8.6.1 配置目录

| 配置目录                | 用途                                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| /usr/lib/systemd/system | 每个服务最主要的启动脚本设置，类似于之前的/etc/initd.d                                                     |
| /run/system/system      | 系统执行过程中所产生的服务脚本，比上面的目录优先运行                                                       |
| /etc/system/system      | 管理员建立的执行脚本，类似于/etc/rc.d/rcN.d/Sxx 类的功能，比上面目录优先运行，在三者之中，此目录优先级最高 |

#### 8.6.2 systemctl

- 监视和控制 systemd 的主要命令是 systemctl
- 该命令可用于查看系统状态和管理系统及服务

```shell
命令：systemctl  command name.service
启动：service name start –>systemctl start name.service
停止：service name stop –>systemctl stop name.service
重启：service name restart–>systemctl restart name.service
状态：service name status–>systemctl status name.service
```

### 8.7 启动和重新加载

```shell
systemctl restart nginx.service
systemctl reload nginx.service
nginx -s reload
```

### 8.8 日志类型

- curl -v http://localhost

#### 8.8.1 日志类型

- /var/log/nginx/access.log 访问日志
- /var/log/nginx/error.log 错误日志

#### 8.8.2 log_format

| 类型    | 用法                                          |
| ------- | --------------------------------------------- |
| 语法    | log_format name [escape=default[json] string] |
| 默认    | log_format combined " "                       |
| Context | http                                          |

#### 8.8.2.1 内置变量

- ngx_http_log_module
- log_format

| 名称             | 含义                     |
| ---------------- | ------------------------ |
| $remote_addr     | 客户端地址               |
| $remote_user     | 客户端用户名称           |
| $time_local      | 访问时间和时区           |
| $request         | 请求行                   |
| $status          | HTTP 请求状态            |
| $body_bytes_sent | 发送给客户端文件内容大小 |

##### 8.8.2.2 HTTP 请求变量

- 注意要把 `-` 转成下划线,比如`User-Agent`对应于`$http_user_agent`

| 名称             | 含义     | 例子                                                                      |
| ---------------- | -------- | ------------------------------------------------------------------------- |
| arg_PARAMETER    | 请求参数 | $arg_name                                                                 |
| http_HEADER      | 请求头   | $http_referer $http_host $http_user_agent $http_x_forwarded_for(代理过程) |
| sent_http_HEADER | 响应头   | sent_http_cookie                                                          |

> IP1->IP2(代理)->IP3 会记录 IP 地址的代理过程
> http_x_forwarded_for=Client IP,Proxy(1) IP,Proxy(2) IP

#### 8.8.3 示例

```conf
 # 定义一种日志格式
 log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

 log_format  zfpx  '$arg_name $http_referer sent_http_date"';
 # 指定写入的文件名和日志格式
 access_log  /var/log/nginx/access.log  main;
```

```shell
tail -f /var/log/nginx/access.log

221.216.143.110 - - [09/Jun/2018:22:41:18 +0800] "GET / HTTP/1.1" 200 612 "-" "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36" "-"
```

## 9. nginx 工作流

### 9.1 配置块

- 请求到来时先按域名找到`server`块
- 再按请求路径找到`location`块
- `Context`是指本指令出现在哪个块内

```conf
main
http{
    upstream {}
    server {
        if(){}
        location{

        }
        location{
            location{

            }
        }
    }
    server{

    }
}
```

### 9.2 值指令继承规则

- `值指令`可以合并，`动作类`指令不可以合并
- 值指令是向上覆盖的，子配置不存在，可以使用父配置块的指令，如果子指令存在，会覆盖父配置块中的指令

```conf
server {
    listen 80;
    root /home/nginx/html;
    access_log logs/access.log main;
    location /image{
       access_log logs/access.log image;
    }
    location /video{
    }
}
```

### 9.3 server 匹配

- 精确匹配
- \*在前
- \*在后
- 按文件中的顺序匹配正则式域名
- default server

### 9.4 HTTP 请求处理

| 阶段           | 名称           | 对应模块                       |
| -------------- | -------------- | ------------------------------ |
| 读取请求后     | POST_READ      | realip                         |
| 重写           | SERVER_REWRITE | rewrite                        |
| 匹配 location  | FIND_CONFIG    | rewrite                        |
| 重写           | REWRITE        | rewrite                        |
| 重写后         | POST_REWRITE   |
| 访问前限制     | PREACCESS      | limit_conn,limit_req           |
| 是否有权限访问 | ACCESS         | auth_basic,access,auth_request |
| 判断权限后     | POST_ACCESS    |
| 响应前         | PRECONTENT     | try_files                      |
| 生成响应       | CONTENT        | index,autoindex,concat         |
| 打印日志       | LOG            | access_log                     |

![2fb35ee2d41de9bf149502deb0e706e7](../../assets/images/linux/2fb35ee2d41de9bf149502deb0e706e7.png)

## 9. 核心模块

### 9.1 监控 nginx 客户端的状态

#### 9.1.1 模块名

--with-http_stub_status_module 监控 nginx 客户端的状态

#### 9.1.2 语法

```shell
Syntax: stub_status on/off;
Default: -
Context: server->location
```

#### 9.1.3 实战

/etc/nginx/conf.d/default.conf

```conf
server {
+    location /status{
+       stub_status  on;
+    }
```

```shell
systemctl reload nginx.service
# 重启后访问 http://192.171.207.104/status 网站会返回以下内容
```

```http
Active connections: 2
server accepts handled requests
 3 3 10
Reading: 0 Writing: 1 Waiting: 1
```

| 参数               | 含义                                                             |
| ------------------ | ---------------------------------------------------------------- |
| Active connections | 当前 nginx 正在处理的活动连接数                                  |
| accepts            | 总共处理的连接数                                                 |
| handled            | 成功创建握手数                                                   |
| requests           | 总共处理请求数                                                   |
| Reading            | 读取到客户端的 Header 信息数                                     |
| Writing            | 返回给客户端的 Header 信息数                                     |
| Waiting            | 开启 keep-alive 的情况下,这个值等于 active – (reading + writing) |

### 9.2 随机主页

#### 9.2.1 模块名

--with-http_random_index_module 在根目录里随机选择一个主页显示

#### 9.2.2 语法

```conf
Syntax: random_index on/off;
Default: off
Context: location
```

#### 9.2.3 实战

/etc/nginx/conf.d/default.conf

```conf
   location / {
      root /opt/app;
      random_index on;
    }
```

```shell
mkdir /opt/app
cd /opt/app
ls
echo red  > read.html
echo yellow  > yellow.html
echo blue  > blue.html
# 需要重启 !s 可以查找输入过的命令
```

### 9.3 内容替换

#### 9.3.1 模块名

--with-http_sub_module 内容替换

#### 9.3.2 语法

##### 9.3.2.1 文本替换

```
Syntax: sub_filter string replacement;
Default: --
Context: http,service,location
```

##### 9.3.2.2 实战

/etc/nginx/conf.d/default.conf

```conf
location / {
    root   /usr/share/nginx/html;
    index  index.html index.htm;
+   sub_filter 'name' 'zhufeng';
}
```

### 9.4 请求限制

#### 9.4.1 模块名

- --with-limit_conn_module 连接频率限制 限制连接的并发数
- --with-limit_req_module 请求频率限制
- 一次 TCP 请求至少产生一个 HTTP 请求
- SYN > (SYN, ACK) -> ACK -> REQUEST -> RESPONSE -> FIN -> ACK -> FIN -> ACK
  1. SYN > (SYN, ACK) > ACK 3 次握手
  2. FIN -> (ACK -> FIN) -> ACK 4 次断开

#### 9.4.2 ab

- Apache 的 ab 命令模拟多线程并发请求，测试服务器负载压力，也可以测试 nginx、lighthttp、IIS 等其它 Web 服务器的压力
  - -n 总共的请求数
  - -c 并发的请求数

```shell
yum -y install httpd-tools
ab -n 40 -c 20 http://127.0.0.1/
```

#### 9.4.3 连接限制

- ngx_http_limit_conn_module 模块会在 NGX_HTTP_PREACCESS_PHASE 阶段生效
- 针对全部的 worker 生效，依赖 realip 模块获得到的真实 IP

##### 9.4.3.1 语法

`limit_conn_zone` 定义共享内存(大小)，以及 key 关键字

```shell
# 可以以IP为key zone为空间的名称 size为申请空间的大小
Syntax: limit_conn_zone key zone=name:size;
Default: --
Context: http(定义在server以外)
```

limit_conn

```shell
# zone名称 number限制的数量
Syntax: limit_conn zone number;
Default: --
Context: http,server,location
```

```shell
Syntax: limit_conn_log_level  info|notice|warn|error;
Default: limit_conn_log_level error;
Context: http,server,location
```

```shell
Syntax: limit_conn_status  code;
Default: limit_conn_status 503;
Context: http,server,location
```

##### 9.4.3.2 案例

- $binary_remote_addr 是二进制格式的，比较短

```conf
limit_conn_zone $binary_remote_addr zone=conn_zone:10m;
server {
  location / {
      limit_conn_status 500;
      limit_conn_status warn;
      limit_rate 50; //每秒最多返回50字节
      limit_conn conn_zone 1; //并发连接数最多是1
  }
}
```

- 表明以 ip 为 key，来限制每个 ip 访问文件时候，最多只能有 1 个在线，否则其余的都要返回不可用

#### 9.4.4 请求限制

- ngx_http_limit_req_module 模块是在 NGX_HTTP_PREACCESS_PHASE 阶段生效
- 生效算法是漏斗算法(Leaky Bucket) 把突出的流量限定为每秒恒定多少个请求
- Traffic Shaping 的核心理念是等待，Traffic Policing 的核心理念是丢弃
- limit_req 生效是在 limit_conn 之前的

##### 9.4.4.1 语法

- `limit_req_zone` 定义共享内存，以及 `key` 和 `限制速度`

```shell
# 可以以IP为key zone为空间的名称 size为申请空间的大小
Syntax: limit_req_zone key zone=name:size rate=rate;
Default: --
Context: http(定义在server以外)
```

limit_req 限制并发请求数

```shell
# zone名称 number限制的数量
Syntax: limit_req  zone=name [burst=number] [nodelay];
Default: --
Context: http,server,location
```

- burst 是 bucket 的数量，默认为 0
- nodelay 是对 burst 中的请求不再采用延迟处理的做法，而是立刻处理

##### 9.4.4.2 案例

```conf
limit_req_zone $binary_remote_addr zone=req_zone:10m rate=1r/s;
server {
  location /{
      //缓存区队列burst=3个,不延期，即每秒最多可处理rate+burst个.同时处理rate个
      //limit_req zone=req_zone;
      limit_req zone=one burst=5 nodelay;
  }
}
```

- $binary_remote_addr 表示远程的 IP 地址
- zone=req_zone:10m 表示一个内存区域大小为 10m,并且设定了名称为 req_zone
- rate=1r/s 表示允许相同标识的客户端的访问频次，这里限制的是每秒 1 次，即每秒只处理一个请求

- zone=req_zone 表示这个参数对应的全局设置就是 req_zone 的那个内存区域

- burst 设置一个大小为 3 的缓冲区,当有大量请求（爆发）过来时，超过了访问频次限制的请求可以先放到这个缓冲区内等待，但是这个等待区里的位置只有 3 个，超过的请求会直接报 503 的错误然后返回。
- nodelay 如果设置，会在瞬时提供处理(burst + rate)个请求的能力，请求超过（burst + rate）的时候就会直接返回 503，永远不存在请求需要等待的情况,如果没有设置，则所有请求会依次等待排队

```shell
netstat -n | awk '/^tcp/ {++S[$NF]} END {for(a in S) print a, S[a]}'
```

### 9.5 访问控制

- 基于 IP 的访问控制 -http_access_module
- 基于用户的信任登录 -http_auth_basic_module

#### 9.5.1 http_access_module

```shell
Syntax: allow address|all;
Default: --
Context: http,server,location,limit_except
```

```shell
Syntax: deny address|CIDR|all;
Default: --
Context: http,server,location,limit_except
```

```conf
server {
+ location ~ ^/admin.html{
+      deny 192.171.207.100;
+      allow all;
+    }
}
```

## 10 静态资源 Web 服务

### 10.1 静态和动态资源

- 静态资源：一般客户端发送请求到 web 服务器，web 服务器从内存在取到相应的文件，返回给客户端，客户端解析并渲染显示出来。
- 动态资源：一般客户端请求的动态资源，先将请求交于 web 容器，web 容器连接数据库，数据库处理数据之后，将内容交给 web 服务器，web 服务器返回给客户端解析渲染处理。

| 类型       | 种类           |
| ---------- | -------------- |
| 浏览器渲染 | HTML、CSS、JS  |
| 图片       | JPEG、GIF、PNG |
| 视频       | FLV、MPEG      |
| 下载文件   | Word、Excel    |

### 10.2 CDN

- CDN 的全称是 Content Delivery Network，即内容分发网络。
- CDN 系统能够实时地根据网络流量和各节点的连接、负载状况以及到用户的距离和响应时间等综合信息将用户的请求重新导向离用户最近的服务节点上。其目的是使用户可就近取得所需内容，解决 Internet 网络拥挤的状况，提高用户访问网站的响应速度。
  [cdn](http://img.zhufengpeixun.cn/cdn.jpg)

### 10.3 配置语法

#### 10.3.1 sendfile

不经过用户内核发送文件

| 类型   | 种类                                |
| ------ | ----------------------------------- |
| 语法   | sendfile on / off                   |
| 默认   | sendfile off;                       |
| 上下文 | http,server,location,if in location |

#### 10.3.2 tcp_nopush

在 sendfile 开启的情况下，合并多个数据包，提高网络包的传输效率

| 类型   | 种类                 |
| ------ | -------------------- |
| 语法   | tcp_nopush on / off  |
| 默认   | tcp_nopush off;      |
| 上下文 | http,server,location |

#### 10.3.3 tcp_nodelay

在 keepalive 连接下，提高网络包的传输实时性

| 类型   | 种类                 |
| ------ | -------------------- |
| 语法   | tcp_nodelay on / off |
| 默认   | tcp_nodelay on;      |
| 上下文 | http,server,location |

#### 10.3.4 gzip

压缩文件可以节约带宽和提高网络传输效率

| 类型   | 种类                 |
| ------ | -------------------- |
| 语法   | gzip on / off        |
| 默认   | gzip off;            |
| 上下文 | http,server,location |

#### 10.3.5 gzip_comp_level

压缩比率越高，文件被压缩的体积越小

| 类型   | 种类                  |
| ------ | --------------------- |
| 语法   | gzip_comp_level level |
| 默认   | gzip_comp_level 1;    |
| 上下文 | http,server,location  |

#### 10.3.6 gzip_http_version

压缩版本

| 类型   | 种类                      |
| ------ | ------------------------- |
| 语法   | gzip_http_version 1.0/1.1 |
| 默认   | gzip_http_version 1.1;    |
| 上下文 | http,server,location      |

#### 10.3.7 http_gzip-static_module

- 先找磁盘上找同名的.gz 这个文件是否存在,节约 CPU 的压缩时间和性能损耗
- http_gzip_static_module 预计 gzip 模块
- http_gunzip_module 应用支持 gunzip 的压缩方式

| 类型   | 种类                 |
| ------ | -------------------- |
| 语法   | gzip_static on/off   |
| 默认   | gzip_static off;     |
| 上下文 | http,server,location |

#### 10.3.8 案例

```shell
echo color > color.html
gzip color.html
```

/etc/nginx/conf.d/default.conf

```shell
mkdir -p /data/www/images
mkdir -p /data/www/html
echo color > /data/www/html/color.html
gzip /data/www/html/color.html
mkdir -p /data/www/js
mkdir -p /data/www/css
mkdir -p /data/www/download
```

```conf
    location ~ .*\.(jpg|png|gif)$ {
        gzip off;#关闭压缩
        root /data/www/images;
    }

    location ~ .*\.(html|js|css)$ {
        gzip_static on;
        gzip on; #启用压缩
        gzip_min_length 1k;    #只压缩超过1K的文件
        gzip_http_version 1.1; #启用gzip压缩所需的HTTP最低版本
        gzip_comp_level 9;     #压缩级别，压缩比率越高文件被压缩的体积越小
        gzip_types  text/css application/javascript;#进行压缩的文件类型
        root /data/www/html;
    }

    location ~ ^/download {
        gzip_static on; #启用压缩
        tcp_nopush on;  # 不要着急发，攒一波再发
        root /data/www; # 注意此处目录是`/data/www`而不是`/data/www/download`
    }
```

## 11. 浏览器缓存

校验本地缓存是否过期
cachecontrol

类型 种类
检验是否过期 Expires、Cache-Control(max-age)
Etag Etag
Last-Modified Last-Modified
11.1 expires
添加 Cache-Control、Expires 头
类型 种类
语法 expires time
默认 expires off;
上下文 http,server,location
location ~ ._\.(jpg|png|gif)$ {
expires 24h;
} 12. 跨域
跨域是指一个域下的文档或脚本试图去请求另一个域下的资源
类型 种类
语法 add_header name value
默认 add_header --;
上下文 http,server,location
mkdir -p /data/json
cd /data/json
vi user.json
{"name":"zhufeng"}
location ~ ._\.json$ {
add_header Access-Control-Allow-Origin http://127.0.0.1:8080;
add_header Access-Control-Allow-Methods GET,POST,PUT,DELETE,OPTIONS;
root /data/json;
}
index.html

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html>
  <head> </head>
  <body>
    <script>
      let xhr = new XMLHttpRequest();
      xhr.open('GET', 'http://115.2.148.6/user.json', true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
          console.log(xhr.responseText);
        }
      };
      xhr.send();
    </script>
  </body>
</html>
```

http-server 13. 防盗链
防止网站资源被盗用
保证信息安全
防止流量过量

需要区别哪些请求是非正常的用户请求

使用 http_refer 防盗链
类型 种类
语法 valid_referers none、block、server_names、IP
默认 -
上下文 server,location
location ~ .\*\.(jpg|png|gif)$ {
expires 1h;
gzip off;
gzip_http_version 1.1;
gzip_comp_level 3;
gzip_types image/jpeg image/png image/gif; # none 没有 refer blocked 非正式 HTTP 请求 特定 IP

-       valid_referers none blocked 115.29.148.6;
-       if ($invalid_referer) { # 验证通过为0，不通过为1
-           return 403;
-       }
        root /data/images;
  }

-e, --referer Referer URL (H)
curl -v -e "115.29.148.6" http://115.29.148.6/kf.jpg
curl -v -e "http://www.baidu.com" http://115.29.148.6/kf.jpg

14. 代理服务
    14.1 配置
    类型 种类
    语法 proxy_pass URL
    默认 -
    上下文 server,location
    14.2 正向代理
    正向代理的对象是客户端,服务器端看不到真正的客户端
    通过公司代理服务器上网
    positiveproxy

设置本地 host C:\Windows\System32\drivers\etc

115.29.148.6 www.zhufengpeixun.com
resolver 8.8.8.8; #谷歌的域名解析地址
location / { # $http_host 要访问的主机名 $request_uri请求路径
    proxy_pass http://$http_host$request_uri;
}
按 Win+R 系统热键打开运行窗口，输入 ipconfig /flushdns 命令后按回车，就可以清空电脑的 DNS 缓存
14.3 反向代理
反向代理的对象的服务端,客户端看不到真正的服务端
nginx 代理应用服务器
fanproxy

location ~ ^/api {
proxy_pass http://localhost:3000;
proxy_redirect default; #重定向

    proxy_set_header Host $http_host;        #向后传递头信息
    proxy_set_header X-Real-IP $remote_addr; #把真实IP传给应用服务器

    proxy_connect_timeout 30; #默认超时时间
    proxy_send_timeout 60;    # 发送超时
    proxy_read_timeout 60;    # 读取超时


    proxy_buffering on;             # 在proxy_buffering 开启的情况下，Nginx将会尽可能的读取所有的upstream端传输的数据到buffer，直到proxy_buffers设置的所有buffer们 被写满或者数据被读取完(EOF)
    proxy_buffers 4 128k;           # proxy_buffers由缓冲区数量和缓冲区大小组成的。总的大小为number*size
    proxy_busy_buffers_size 256k;   # proxy_busy_buffers_size不是独立的空间，他是proxy_buffers和proxy_buffer_size的一部分。nginx会在没有完全读完后端响应的时候就开始向客户端传送数据，所以它会划出一部分缓冲区来专门向客户端传送数据(这部分的大小是由proxy_busy_buffers_size来控制的，建议为proxy_buffers中单个缓冲区大小的2倍)，然后它继续从后端取数据，缓冲区满了之后就写到磁盘的临时文件中。
    proxy_buffer_size 32k;          # 用来存储upstream端response的header
    proxy_max_temp_file_size 256k; # response的内容很大的 话，Nginx会接收并把他们写入到temp_file里去，大小由proxy_max_temp_file_size控制。如果busy的buffer 传输完了会从temp_file里面接着读数据，直到传输完毕。

}
curl http://localhost/api/users.json
14.3.1 proxy_pass
如果 proxy_pass 的 URL 定向里不包括 URI，那么请求中的 URI 会保持原样传送给后端 server
为了方便记忆和规范配置，建议所有的 proxy_pass 后的 url 都以/结尾

proxy_pass 后的 url 最后加上/就是绝对根路径，location 中匹配的路径部分不走代理,也就是说会被替换掉

location /a/ {
proxy_pass http://127.0.0.1/b/;
}
请求http://example.com/a/test.html 会被代理到http://127.0.0.1/b/test.html
如果 proxy_pass 的 URL 定向里不包括 URI，那么请求中的 URI 会保持原样传送给后端 server,如果没有/，表示相对路径
proxy_pass 后的 url 最后没有/就是相对路径，location 中匹配的路径部分会走代理,也就是说会保留
location /a/ {
proxy_pass http://127.0.0.1;
}

请求 http://example/a/test.html 会被代理到http://127.0.0.1/a/test.html
在 proxy_pass 前面用了 rewrite，如下，这种情况下，proxy_pass 是无效的
location /getName/ {
rewrite /getName/([^/]+) /users?name=$1 break;
proxy_pass http://127.0.0.1;
}
15 负载均衡
nginxbalance

使用集群是网站解决高并发、海量数据问题的常用手段。
当一台服务器的处理能力、存储空间不足时，不要企图去换更强大的服务器，对大型网站而言，不管多么强大的服务器，都满足不了网站持续增长的业务需求。
这种情况下，更恰当的做法是增加一台服务器分担原有服务器的访问及存储压力。通过负载均衡调度服务器，将来自浏览器的访问请求分发到应用服务器集群中的任何一台服务器上，如果有更多的用户，就在集群中加入更多的应用服务器，使应用服务器的负载压力不再成为整个网站的瓶颈。
15.1 upstream
nginx 把请求转发到后台的一组 upstream 服务池
类型 种类
语法 upstream name {}
默认 -
上下文 http
var http = require( 'http' );
var server =http.createServer( function ( request ,response ){
response.end('server3 000');
} );
server.listen( 3000 ,function(){
console.log( 'HTTP 服务器启动中，端口：3000' );
});
upstream zhufeng {
server 127.0.0.1:3000 weight=10;
server 127.0.0.1:4000;
server 127.0.0.1:5000;
}

server {
location / {
proxy_pass http://zhufeng;
}
15.2 后端服务器调试状态
状态 描述
down 当前的服务器不参与负载均衡
backup 当其它节点都无法使用时的备份的服务器
max_fails 允许请求失败的次数,到达最大次数就会休眠
fail_timeout 经过 max_fails 失败后，服务暂停的时间,默认 10 秒
max_conns 限制每个 server 最大的接收的连接数,性能高的服务器可以连接数多一些
upstream zfpx {
server localhost:3000 down;
server localhost:4000 backup;
server localhost:5000 max_fails=1 fail_timeout=10s;
}
15.3 分配方式
类型 种类
轮询(默认) 每个请求按时间顺序逐一分配到不同的后端服务器，如果后端服务器 down 掉，能自动剔除
weight(加权轮询) 指定轮询几率，weight 和访问比率成正比，用于后端服务器性能不均的情况
ip_hash 每个请求按访问 ip 的 hash 结果分配，这样每个访客固定访问一个后端服务器，可以解决 session 的问题
least_conn 哪个机器上连接数少就分发给谁
url_hash(第三方) 按访问的 URL 地址来分配 请求，每个 URL 都定向到同一个后端 服务器上(缓存)
fair(第三方) 按后端服务器的响应时间来分配请求，响应时间短的优先分配
正定义 hash hash 自定义 key
upstream zhufeng{
ip_hash;
server 127.0.0.1:3000;
}
upstream zhufeng{
least_conn;
server 127.0.0.1:3000;
}
upstream zhufeng{
url_hash;
server 127.0.0.1:3000;
}
upstream zhufeng{
fair;
server 127.0.0.1:3000;
}
upstream zhufeng{
hash $request_uri;
server 127.0.0.1:3000;
} 16. 缓存
应用服务器端缓存
代理缓存
客户端缓存
proxy_cache

http{  
 # 缓存路径 目录层级 缓存空间名称和大小 失效时间为 7 天 最大容量为 10g
proxy_cache_path /data/nginx/cache levels=1:2 keys_zone=cache:100m inactive=60m max_size=10g;  
}  
键值 含义
proxy_cache_path 缓存文件路径
levels 设置缓存文件目录层次；levels=1:2 表示两级目录
keys_zone 设置缓存名字和共享内存大小
inactive 在指定时间内没人访问则被删除
max_size 最大缓存空间，如果缓存空间满，默认覆盖掉缓存时间最长的资源
if ($request_uri ~ ^/cache/(login|logout)) {
      set $nocache 1;
    }
    location / {
       proxy_pass http://zhufeng;
    }
    location ~ ^/cache/ {
     proxy_cache cache;
     proxy_cache_valid  200 206 304 301 302 60m;   # 对哪些状态码缓存，过期时间为60分钟
     proxy_cache_key $uri;  #缓存的维度
     proxy_no_cache $nocache;
     proxy_set_header Host $host:$server_port; #设置头
proxy_set_header X-Real-IP $remote_addr; #设置头
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; #设置头
proxy_pass http://127.0.0.1:6000;
}
键值 含义
proxy_cache 使用名为 cache 的对应缓存配置
proxy_cache_valid 200 206 304 301 302 10d; 对 httpcode 为 200 的缓存 10 天
proxy_cache_key $uri 定义缓存唯一 key,通过唯一 key 来进行 hash 存取
proxy_set_header 自定义 http header 头，用于发送给后端真实服务器
proxy_pass 指代理后转发的路径，注意是否需要最后的/
17 location
17.1 正则表达式
类型 种类
. 匹配除换行符之外的任意字符
? 重复 0 次或 1 次

- 重复 1 次或更多次

* 重复零次或多次
  ^ 匹配字符串的开始
  $ 匹配字符串的结束
  {n} 重复 n 次
  {n,} 重复 n 次或更多次
  [abc] 匹配单个字符 a 或者 b 或者 c
  a-z 匹配 a-z 小写字母的任意一个
  \ 转义字符
  () 用于匹配括号之间的内容，可以通过$1、$2 引用
  \w 的释义都是指包含大 小写字母数字和下划线 相当于([0-9a-zA-Z])
  17.2 语法规则
  location 仅匹配 URI，忽略参数
  前缀字符串
  常规
  = 精确匹配
  ^~ 匹配上后则不再进行正则表达式的匹配
  正则表达式
  ~ 大小写敏感的正则表达式匹配
  ~_忽略大小写的正则表达式匹配
  内部调转
  用于内部跳转的命名 location @
  Syntax location [=|~|~_|^~] uri {...}
  location @name{...}
  default -
  Context server,location  
  17.3 匹配规则
  等号类型（=）的优先级最高。一旦匹配成功，则不再查找其他匹配项。
  ^~类型表达式。一旦匹配成功，则不再查找其他匹配项。
  正则表达式类型（~ ~\*）的优先级次之。如果有多个 location 的正则能匹配的话，则使用正则表达式最长的那个。
  常规字符串匹配类型按前缀匹配
  d27be56a55ca1247171bf85d7c25a8d6

17.4 案例
location ~ /T1/$ {
return 200 '匹配到第一个正则表达式';
}
location ~_ /T1/(\w+)$ {
return 200 '匹配到最长的正则表达式';
}
location ^~ /T1/ {
return 200 '停止后续的正则表达式匹配';
}
location /T1/T2 {
return 200 '最长的前缀表达式匹配';
}
location /T1 {
return 200 '前缀表达式匹配';
}
location = /T1 {
return 200 '精确匹配';
}
/T1 //精确匹配
/T1/ //停止后续的正则表达式匹配
/T1/T2 //匹配到最长的正则表达式
/T1/T2/ //最长的前缀表达式匹配
/t1/T2 //匹配到最长的正则表达式 18. rewrite
可以实现 url 重写及重定向
syntax: rewrite regex replacement [flag]
Default: —
Context: server, location, if
如果正则表达式（regex）匹配到了请求的 URI（request URI），这个 URI 会被后面的 replacement 替换
rewrite 的定向会根据他们在配置文件中出现的顺序依次执行
通过使用 flag 可以终止定向后进一步的处理
rewrite ^/users/(._)$ /show?user=$1? last;=
18.1 用途
URL 页面跳转
兼容旧版本
SEO 优化(伪静态)
维护(后台维护、流量转发)
安全(伪静态)
18.2 语法
类型 种类
语法 rewrite regex replacement [flag]
默认 -
上下文 server,location,if
regex 正则表达式指的是要被改写的路径
replacement 目标要替换成哪个 URL
flag 标识
实例

rewrite ^(.\*)$ /www/reparing.html break;
18.3 flag
标志位是标识规则对应的类型
flag 含义
last 先匹配自己的 location,然后通过 rewrite 规则新建一个请求再次请求服务端
break 先匹配自己的 location,然后生命周期会在当前的 location 结束,不再进行后续的匹配
redirect 返回 302 昨时重定向,以后还会请求这个服务器
permanent 返回 301 永久重定向,以后会直接请求永久重定向后的域名
18.3.1 last
结束当前的请求处理,用替换后的 URI 重新匹配 location
可理解为重写（rewrite）后，发起了一个新请求，进入 server 模块，匹配 location
如果重新匹配循环的次数超过 10 次，nginx 会返回 500 错误
返回 302 http 状态码
浏览器地址栏显示重定向后的 url
18.3.2 break
结束当前的请求处理，使用当前资源，不再执行 location 里余下的语句
返回 302 http 状态码
浏览器地址栏显示重定向后的 url
18.3.3 redirect
临时跳转，返回 302 http 状态码
浏览器地址栏显示重地向后的 url
18.3.4 permanent
永久跳转，返回 301 http 状态码；
浏览器地址栏显示重定向后的 url
location ~ ^/break {
rewrite ^/break /test break;
root /data/html;
}

location ~ ^/last {
rewrite ^/last /test last;
}

location /test {
default_type application/json;
return 200 '{"code":0,"msg":"success"}';
}

location ~ ^/redirect {
rewrite ^/redirect http://www.baidu.com redirect;
}
location ~ ^/permanent {
rewrite ^/permanent http://www.baidu.com permanent;
}
curl http://115.29.148.6/break
test
curl http://115.29.148.6/last
{"code":0,"msg":"success"}
curl -vL http://115.29.148.6/redirect
curl -vL http://115.29.148.6/permanent
