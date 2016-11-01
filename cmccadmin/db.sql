
connect sys/12345Qwert as sysdba

connect cmccuser/12345


create tablespace cmccuser datafile 'C:\SL\db\cmccuser\cmccuser.dbf' size  10M autoExtend on next 10M;

create user cmccuser identified by 12345 default tablespace cmccuser;

grant connect,dba to cmccuser;

-- 后台管理员
create table cmcc_admin (
admin_id number(5) primary key,
admin_name varchar(32),
password varchar(32) not null,
role number(2)
) tablespace cmccuser;

comment on column cmcc_admin.role is '权限:{ 0: 废弃, 1: 普通管理员, 2: 超级管理员 }';

-- insert into cmcc_admin (admin_id,admin_name,password,role) values (1,'admin','E10ADC3949BA59ABBE56E057F20F883E',2);

-- select * from user_tab_comments where table_name='CMCC_ADMIN';
-- select * from user_col_comments where table_name='CMCC_ADMIN';



create table account (
user_id number(11) primary key,--用户ID
account varchar(20) not null,--用户账号 --search=true
password varchar(32) not null,--用户密码
register_date DATE,--注册时间 --search=true

) tablespace cmccuser;


drop table userinfo;
create table userinfo (--用户
user_id  number(11) primary key,--用户ID
avatars varchar(20),--用户头像 --type=file
user_name varchar(20),--用户昵称 --unique=true --updateable=false --search=true
sign_text varchar(200),--签名 --emptyAble=true
gender number(1),--性别 --emptyAble=true
home_city_id number(5),--家乡城市 --emptyAble=true
home_region_id number(7),--家乡区县 --emptyAble=true
city_id number(5),--所在城市 --emptyAble=true
region_id number(7),--所在区县 --emptyAble=true
tag varchar(200),--标签 --emptyAble=true
email varchar(100),--email --emptyAble=true
constellation number(2)--星座 --emptyAble=true
) tablespace cmccuser;

create sequence user_seq minvalue 1 maxvalue 99999999999 start with 1000 increment by 1 cache 100;

create table login_history (
login_id number(12) primary key,
user_id  number(11),--用户ID --search=true --route=user_id
login_date DATE--登录时间 --search=true
) tablespace cmccuser;
create sequence login_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1 cache 100;

drop table pub_quan;
create table pub_quan (--公众圈
    quan_id number(10) primary key,--圈编号 --deletion_key=true
    quan_name varchar(20),--圈名称 --unique=true --updateable=false --search=true
    quan_pic varchar(100),--圈图片 --type=file --ext=png|jpeg|jpg|bmp
    follow_num number(12),--关注人数
    summary varchar(2000),--简介 --type=clob --grid=false
    create_date DATE--添加日期 --updateable=false --search=true
) tablespace cmccuser;
create sequence pub_quan_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1 cache 100;


--#tableInfo#
--props:扩展Model.class私有变量(String name,String id)
--children:扩展Model.class私有变量(quan_likes,quan_comments)
--listChildren:扩展Model.class List<?>私有变量(quan_likes,quan_comments)
--order_by: getPage,getAll,filter排序(id desc,date asc)

--#columnInfo#
--deletion_key:删除时验证是否为空(true|false)
--route:生成后台表单的值是否来自路由参数(true|false)
--search:是否可搜索(true|false)

drop table pub_quan_msg;
create table pub_quan_msg (--公众圈文章
    msg_id number(10) primary key,--文章编号 --deletion_key=true
    title varchar(200),--标题 --search=true
    content clob,--文章内容
    quan_id number(10),--圈编号 --route=quan_id --search=true
    user_id number(10),--用户编号
    add_date date,--添加时间 --search=true
    see number(10),--浏览数
    likes number(10),--喜欢数
    comments number(10),--评论数
    imgs varchar(1000)--图片
) tablespace cmccuser;
create sequence pub_quan_msg_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1 cache 100;


create table pub_quan_comments (--公众圈文章评论
    comment_id number(10) primary key,--评论编号 --deletion_key=true
    msg_id number(10),--文章编号 --route=msg_id --search=true
    add_date date,--评论时间 --search=true,
    user_id number(10),--用户编号 --search=true
    content varchar(200)--评论内容
) tablespace cmccuser;
create sequence pub_quan_comments_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1 cache 100;


create table quan_msgs (--朋友圈 --listChildren=quan_comments,quan_likes --props=String user_name,String avatars
    msg_id number(10) primary key,--圈消息编号 --deletion_key=true
    user_id number(10),--用户编号 --search=true
    add_date date,--发布时间 --search=true
    content varchar(300),--发布内容
    imgs varchar(2000)--图片
) tablespace cmccuser;

create sequence quan_msgs_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1 cache 100;


create table quan_comments (--朋友圈评论 --props=String user_name,String at_user_name
    comment_id number(10) primary key,--评论编号 --deletion_key=true
    msg_id number(10),--圈消息编号 --route=msg_id --search=true
    add_date date,--评论时间 --search=true,
    user_id number(10),--用户编号 --search=true
    at_user_id number(10),--用户编号 --search=true
    content varchar(200)--评论内容
) tablespace cmccuser;

create sequence quan_comments_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1 cache 100;

create table quan_likes (--朋友圈赞 --props=String user_name
    like_id number(10) primary key,--评论编号 --deletion_key=true
    msg_id number(10),--圈消息编号 --route=msg_id --search=true
    add_date date,--评论时间 --search=true,
    user_id number(10)--用户编号 --search=true
) tablespace cmccuser;

create sequence quan_likes_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1 cache 100;
