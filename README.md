linuxProject
============

analysis for linux kernal 3.5.4

## 6月2日 - 2014年6月25日修改
1. 注释page_init.js中的关键函数
2. 修改region.js，使代码风格更佳漂亮
3. 在所有的js中，有一个潜在的威胁，就是==的使用，应该用===来代替。同样的，
	!=应该用!==来代替

## 2014年4月18日修改
1. 将没有用的文件全部写入到obsolete文件夹中备份。
2. 建立config文件夹，所有关于配置的文件全部写入这里。并且将map711.json放入该文件夹中
3. 将jQuery-ui放入到js目录中.
4. 删除了文件夹WEB-INF和META-INF，这是以前打算用jsp写的节奏吗？怎么还有jar包.
5. 在php中添加了log.inc，使用new log("Logs")创建log实例，方便调试。log信息输出在Logs文件夹中，并且命名为yyyy-mm-dd.log
6. 具体用Log调试的例子请看virdir.php
7. 增加debugs文件夹，具体的调试信息和sql可以写在里面，方便调试。

## 2014年4月11日修改
1. 将index.html中的javascript函数全部分离出来，分别写入到page_init.js和modify_relation.js两个文件中去。
2. 修改文件访问路径。从以前的../kernel路径修改为kernel/。

