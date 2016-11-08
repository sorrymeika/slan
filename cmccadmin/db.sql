
--#tableInfo#
--props:扩展Model.class私有变量(String name,String id)
--children:扩展Model.class私有变量(quan_likes,quan_comments)
--listChildren:扩展Model.class List<?>私有变量(quan_likes,quan_comments)
--order_by: getPage,getAll,filter排序(id desc,date asc)
--seq_name: 主键sequence

--#columnInfo#
--deletion_key:删除时验证是否为空(true|false)
--route:生成后台表单的值是否来自路由参数(true|false)
--search:是否可搜索(true|false)
--formType: 表单类型(select|datePicker|timePicker)
--options: 选项(value:text,0:'请选择'|{ url: 'xxx', data:{}, text: 'key of data'||'text', value: 'key of data'||'value' })
--formSort: 表单项排序(从小到大)


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
create table userinfo (--用户 --props=String account,int status,int country_id,String country_name,String province_name,int province_id,String city_name,int home_country_id,String home_country_name,String home_province_name,int home_province_id,String home_city_name
user_id  number(11) primary key,--用户ID
avatars varchar(255),--用户头像 --type=file
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
create table pub_quan (--公众圈 --children=pub_quan_follow,pub_quan_msg --props=int user_id
    quan_id number(10) primary key,--圈编号 --deletion_key=true
    quan_name varchar(20),--圈名称 --unique=true --updateable=false --search=true
    quan_pic varchar(100),--圈图片 --type=file --ext=png|jpeg|jpg|bmp
    follow_num number(12),--关注人数
    summary varchar(2000),--简介 --type=clob --grid=false
    create_date DATE--添加日期 --updateable=false --search=true
) tablespace cmccuser;
create sequence pub_quan_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1 cache 100;



drop table pub_quan_msg;
create table pub_quan_msg (--公众圈文章 --listChildren=pub_quan_comments
    msg_id number(10) primary key,--文章编号 --deletion_key=true
    title varchar(200),--标题 --search=true
    content clob,--文章内容
    quan_id number(10),--圈编号 --route=quan_id --search=true
    user_id number(11),--用户编号
    add_date date,--添加时间 --search=true
    see number(10),--浏览数
    likes number(10),--喜欢数
    comments number(10),--评论数
    imgs varchar(1000)--图片
) tablespace cmccuser;
create sequence pub_quan_msg_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1 cache 100;


create table pub_quan_comments (--公众圈文章评论 --props=String user_name,String avatars
    comment_id number(10) primary key,--评论编号 --deletion_key=true
    msg_id number(10),--文章编号 --route=msg_id --search=true
    add_date date,--评论时间 --search=true,
    user_id number(11),--用户编号 --search=true
    content varchar(200)--评论内容
) tablespace cmccuser;
create sequence pub_quan_comments_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1 cache 100;


create table quan_msgs (--朋友圈 --listChildren=quan_comments,quan_likes --props=String user_name,String avatars
    msg_id number(10) primary key,--圈消息编号 --deletion_key=true
    user_id number(11),--用户编号 --search=true
    add_date date,--发布时间 --search=true
    content varchar(300),--发布内容
    imgs varchar(2000)--图片
) tablespace cmccuser;

create sequence quan_msgs_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1 cache 100;

create table quan_comments (--朋友圈评论 --props=String user_name,String at_user_name
    comment_id number(10) primary key,--评论编号 --deletion_key=true
    msg_id number(10),--圈消息编号 --route=msg_id --search=true
    add_date date,--评论时间 --search=true,
    user_id number(11),--用户编号 --search=true
    at_user_id number(11),--用户编号 --search=true
    content varchar(200)--评论内容
) tablespace cmccuser;

create sequence quan_comments_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1 cache 100;

create table quan_likes (--朋友圈赞 --props=String user_name
    like_id number(10) primary key,--评论编号 --deletion_key=true
    msg_id number(10),--圈消息编号 --route=msg_id --search=true
    add_date date,--评论时间 --search=true,
    user_id number(11)--用户编号 --search=true
) tablespace cmccuser;

create sequence quan_likes_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1 cache 100;


create table pub_quan_likes (--喜欢文章
    like_id number(10) primary key,--编号 --deletion_key=true
    msg_id number(10),--文章编号 --route=msg_id --search=true
    add_date date,--添加时间
    user_id number(11)--用户编号 --search=true
) tablespace cmccuser;
create sequence pub_quan_likes_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1 cache 100;

create table pub_quan_follow (
    follow_id number(11) primary key,--关注编号
    quan_id number(10),--公众圈ID
    user_id number(11),--用户ID
    follow_date date,--关注时间
    is_follow number(1)--是否关注
) tablespace cmccuser;

create sequence pub_quan_follow_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1 cache 100;


create table pub_quan_recommend (
    recommend_id number(11) primary key,--编号
    quan_id number(10),--公众圈ID
    recommend_date date,--推荐时间
    sort number(10)--排序
) tablespace cmccuser;

create sequence pub_quan_recommend_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1 cache 100;


create table user_fav (--用户收藏 --children=pub_quan_msg,quan_msgs
    fav_id number(11) primary key,--收藏编号
    rev_id number(10),--相关ID
    user_id number(11),--用户ID
    add_date date,--收藏时间
    fav_type number--类型 --options={1:'公众圈文章',2:'朋友圈'}
) tablespace cmccuser;

create sequence user_fav_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1 cache 100;


create table quan_msg_black (--朋友圈信息屏蔽
    black_id number(10) primary key,--屏蔽编号 --deletion_key=true
    msg_id number(10),--圈消息编号 --route=msg_id --search=true
    add_date date,--添加时间 --search=true,
    user_id number(11)--用户编号 --search=true
) tablespace cmccuser;

create sequence quan_msg_black_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1 cache 100;

create table friends (--好友 --props=String user_name,String avatars,int is_send
    fid number(15) primary key,--自增id
    friend_id number(10),--好友id
    user_id number(10),--发起请求方
    status number(2),--状态 --options=-2非好友,-1未处理,0拒绝,1接受,2删除,
    add_date date,--添加时间 --search=true
    msg varchar(40),--验证消息
    show number(1)--显示在新好友中
) tablespace cmccuser;
create sequence friends_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1 cache 100;


alter table friends add msg varchar(40);

create table country (--国家 --seq_name=district_seq
    country_id number(6) primary key,--国家id
    country_name varchar(20)--国家名称 --search=true
) tablespace cmccuser;

create table province (--省 --seq_name=district_seq
    province_id number(6) primary key,--省id
    province_name varchar(20),--省名称 --search=true
    country_id number(6)--国家id --search=true 
    --formType=select --options={ url: '/country/getAll', text: 'country_name', value: 'country_id' }
) tablespace cmccuser;

create table city (--市 --seq_name=district_seq
    city_id number(10) primary key,--市id
    city_name varchar(20),--市名称 --search=true
    province_id number(6)--省id --search=true --formSort=1
    --formType=select --options={ url: '/province/filter', params:{ country_id: 'country_id' }, text: 'province_name', value: 'province_id' }
    /*
    country_id number(6)--国家id --search=true --formSort=2
    --formType=select --options={ url: '/country/getAll', text: 'country_name', value: 'country_id' }
    */
) tablespace cmccuser;
create sequence district_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1;


create table messages (
    msg_id number(12) primary key,--消息id
    type number(5),--消息类型
    from_id number(11),--发消息人
    to_id number(12),--收消息人
    is_show_time number(1),--是否显示时间小标记
    add_date date,--发送时间 --search=true
    content varchar(4000),--正文
    feature varchar(2000)--扩展
) tablespace cmccuser;
create sequence messages_seq minvalue 1 maxvalue 999999999999 start with 1 increment by 1;




-----------------------------
--<<2016-11-8 up to date here
-----------------------------
alter table userinfo modify avatars varchar(255);

create table friends_ext (
    ext_id number(15) primary key,--自增id
    friend_id number(10),--好友id
    user_id number(10),--用户ID
    memo varchar(10),--备注
    enable_leave_msg number(1),--允许留言
    enable_push number(1)--允许推送到首页
) tablespace cmccuser;
