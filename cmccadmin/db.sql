
--#tableInfo#
--props:扩展Model.class私有变量(String name,String id)
--children:扩展Model.class私有变量(quan_likes,quan_comments)
--listChildren:扩展Model.class List<?>私有变量(quan_likes,quan_comments)
--seq_name: 主键sequence

--#columnInfo#
--deletion_key:删除时验证是否为空(true|false)
--route:生成后台表单的值是否来自路由参数(true|false)
--search:是否可搜索(true|false)
--sort:是否可排序(true|false)
--formSort: 表单项排序(从小到大)
--formType: 表单类型(select|datePicker|timePicker)
--options: 选项(value:text,1:'类型1'|{ url: 'xxx', data:{}, text: 'key of data'||'text', value: 'key of data'||'value' })


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
register_date DATE--注册时间 --search=true
) tablespace cmccuser;

create sequence user_seq minvalue 1 maxvalue 99999999999 start with 1000 increment by 1 cache 100;

drop table userinfo;
create table userinfo (--用户 --props=String account,int status,int country_id,String country_name,String province_name,int province_id,String city_name,int home_country_id,String home_country_name,String home_province_name,int home_province_id,String home_city_name --children=friends_ext
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
    quan_pic varchar(100),--圈图片 --type=file --ext=png|jpeg|jpg|bmp|gif
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


create table pub_quan_recommend (--公众圈推荐 --children=pub_quan_msg --props=String quan_name,String quan_pic
    recommend_id number(11) primary key,--编号
    quan_id number(10),--公众圈ID
    recommend_date date,--推荐时间
    sort number(10)--排序 --sort=true
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

create table friends (--好友 --props=String user_name,String avatars,int is_send --children=friends_ext
    fid number(15) primary key,--自增id
    friend_id number(10),--好友id
    user_id number(10),--发起请求方
    status number(2),--状态 --options=-2:非好友,-1:未处理,0:拒绝,1:接受,2:删除,3:黑名单,4:多条同时接受
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
    type number(5),--消息类型 --options=1:文本,2:图片,3:红包,4:赠送云米
    from_id number(11),--发消息人
    to_id number(12),--收消息人
    is_show_time number(1),--是否显示时间小标记
    add_date date,--发送时间 --search=true
    content varchar(4000),--正文
    feature varchar(2000)--扩展
) tablespace cmccuser;
create sequence messages_seq minvalue 1 maxvalue 999999999999 start with 1 increment by 1;

alter table userinfo modify avatars varchar(255);

create table friends_ext (
    ext_id number(15) primary key,--自增id
    friend_id number(10),--好友id
    user_id number(10),--用户ID
    memo varchar(10),--备注
    enable_leave_msg number(1),--允许留言
    enable_push number(1)--允许推送到首页
) tablespace cmccuser;

create table contacts_backup (--通讯录备份
    backup_id number(12) primary key,--自增id
    user_id number(10),--用户ID
    backup_date date,--备份时间 --search=true
    backup_data clob--备份数据
) tablespace cmccuser;
create sequence contacts_backup_seq minvalue 1 maxvalue 999999999999 start with 1 increment by 1;


create table user_yunmi (--云米时段
    yunmi_id number(12) primary key,--时段ID
    user_id number(10),--用户ID
    account varchar(20),--用户手机 --search=true
    amount number(10,2),--云米数量
    start_date date,--时段开始时间 --sort=true --search=true
    end_date date,--时段结束时间 --sort=true --search=true
    create_date date,--云米生成时间
    status number(3),--状态 --options=1:已领取,2:未领取,3:已过期 --formType=select
    add_date date--云米导入时间
) tablespace cmccuser;
create sequence user_yunmi_seq minvalue 1 maxvalue 999999999999 start with 1 increment by 1;


--update user_yunmi set end_date=end_date+(1/24) where start_date=end_date;


create table yunmi_trade (--云米交易明细
    trade_id number(12) primary key,--交易ID
    trade_no varchar(32),--交易码
    charge_id varchar(32),--流量平台交易码
    trade_type number(3),--交易类型 --options=1:自己领取,2:摇一摇,3:他人赠送,4:赠送他人,5:赠送退回,6:发红包,7:收红包,8:红包退回,9:任务,10:别人帮领,11:兑换流量 --formType=select
    yunmi_id number(12),--云米编号
    amount number(10,2),--交易云米数量
    user_id number(10),--用户ID
    friend_id number(10),--交易对象
    task_id number(10),--任务id
    status number(3),--交易状态 --options=1:交易结束,2:交易进行中,3:已过期 --formType=select
    trade_date date,--交易时间 --search=true
    overdue_date date,--过期时间 --search=true
    memo varchar(140)--备注
) tablespace cmccuser;
create sequence yunmi_trade_seq minvalue 1 maxvalue 999999999999 start with 1 increment by 1;


create table user_ext (--用户扩展信息
    user_id number(12) primary key,--用户ID
    read_sys_notify_date date,
    total_yunmi number(12,2),--云米总数
    invited_code number(11),--邀请码
    device_type number(2),--设备类型 --options=1:iOS,2:android --formType=select
    device_token varchar(128),--消息推送token
    valid_new_friend number(1),--加好友时需要验证
    can_search_me number(1),--能否搜索到我
    can_someone_call_me number(1),--是否允许call_black的人拨号给我
    can_call_me number(1),--允许陌生人拨号给我
    can_see_some number(1)--允许陌生人看十张照片
) tablespace cmccuser;


create table yunmi_redbag (--云米红包
    redbag_id number(12) primary key,--红包ID
    trade_id number(12),--交易ID
    amount number(10,2),--红包云米数量
    user_id number(10),--发红包的用户
    type number(2),--红包类型 --options=1:普通红包,2:手气红包 --formType=select
    status number(2),--红包状态 --options=1:已领取,2:未领取 --formType=select
    quantity number(3),--红包数量
    memo varchar(140)--备注
) tablespace cmccuser;
create sequence yunmi_redbag_seq minvalue 1 maxvalue 999999999999 start with 1 increment by 1;

create table yunmi_redbag_friends (--手气红包可领取好友
    receive_id number(12) primary key,--自增ID
    redbag_id number(12),--红包ID
    friend_id number(12)--好友ID
) tablespace cmccuser;
create sequence yunmi_redbag_friends_seq minvalue 1 maxvalue 999999999999 start with 1 increment by 1;

create table yunmi_redbag_detail (--手气红包领取记录
    receive_id number(12) primary key,--自增ID
    redbag_id number(12),--红包ID
    trade_id number(12),--交易ID
    status number(2),--红包状态 --options=1:已领取,2:未领取 --formType=select
    amount number(10,2),--红包云米数量
    friend_id number(10)--领红包的好友ID
) tablespace cmccuser;
create sequence yunmi_redbag_detail_seq minvalue 1 maxvalue 999999999999 start with 1 increment by 1;



create table user_hdh (--和多号
    hdh_id number(12) primary key,--副号ID
    user_id number(10),--用户编号
    subphone varchar(11),--副号
    alias varchar(20),--备注
    type number(1),--类型 --options=1:虚拟副号码,2:实体副号码,3:默认虚拟副号,4:默认实体副号码
    sort number(2),--排序序号
    business_state number(1),--副号码业务状态 --options=1:正常,2:预开户,3:申请中,4:取消中
    state number(2),--副号码功能状态 --options=1:逻辑开机,2:逻辑关机和取消托管,3:限制语音呼入,4:限制短、彩信接收,5:限制语音呼入和短、彩信接收
    incoming_state number(1),--来电提醒开关 --options=1:关闭,2:打开
    powertiming1 varchar(2000),
    powertiming2 varchar(2000),
    bind_date date--绑定日期 --search=true
) tablespace cmccuser;
create sequence user_hdh_seq minvalue 1 maxvalue 999999999999 start with 1 increment by 1;

create sequence hdh_nc_seq minvalue 1 maxvalue 999999999999 start with 240 increment by 1;


create table quan_black (--圈子黑名单 --props=String user_name,String avatars
    black_id number(12) primary key,--黑名单ID
    user_id number(12),--用户ID
    friend_id number(12),--黑名单用户ID
    type number(2)--类型 --options=1:我不看他,2:不准他看我 --formType=select
) tablespace cmccuser;
create sequence quan_black_seq minvalue 1 maxvalue 999999999999 start with 1 increment by 1;


create table business (--第三方业务
    business_id number(10) primary key,--业务ID
    business_name varchar(200),--业务名称
    business_pic varchar(200),--业务图片 --type=file
    secret_key varchar(32),--业务密码
    type number(2),--业务类型 --options=1:移动业务,2:生活,3:娱乐,4:社交 --search=true --formType=select
    linkurl varchar(200)--跳转链接
) tablespace cmccuser;
create sequence business_seq minvalue 1 maxvalue 9999999999 start with 100001 increment by 1;

insert into business (business_id,business_name,secret_key,type) values (100002,'求职','4411d2e0eddc54cb19ef568443257efb',2);
insert into business (business_id,business_name,secret_key,type) values (100003,'商城','4411d2e0eddc54cb19ef568443257efb',2);

insert into business (business_id,business_name,secret_key,type) values (100004,'水费','4411d2e0eddc54cb19ef568443257efb',2);
insert into business (business_id,business_name,secret_key,type) values (100005,'电费','4411d2e0eddc54cb19ef568443257efb',2);

insert into business (business_id,business_name,secret_key,type) values (100001,'移动官微','4411d2e0eddc54cb19ef568443257efb',1);
insert into business (business_id,business_name,secret_key,type) values (100022,'娱乐','4411d2e0eddc54cb19ef568443257efb',3);
insert into business (business_id,business_name,secret_key,type) values (100026,'和聚宝','4411d2e0eddc54cb19ef568443257efb',2);
insert into business (business_id,business_name,secret_key,type) values (100043,'139邮箱','4411d2e0eddc54cb19ef568443257efb',1);

insert into business (business_id,business_name,secret_key,type) values (100045,'和留言','4411d2e0eddc54cb19ef568443257efb',1);

insert into business (business_id,business_name,secret_key,type) values (100004,'水费','4411d2e0eddc54cb19ef568443257efb',2);
insert into business (business_id,business_name,secret_key,type) values (100005,'电费','4411d2e0eddc54cb19ef568443257efb',2);


create table notification (--消息提醒
    notify_id number(12) primary key,--自增ID
    title varchar(140),--提醒标题
    order_id varchar(32),--关联流水id
    content varchar(200),--提醒内容
    linkurl varchar(400),--跳转链接
    user_id number(12),--用户ID
    image varchar(200),--图片
    type number(2),--类型
    business_id number(10),--业务编号 --formType=select --options={ url: '/business/getAll', text: 'business_name', value: 'business_id' }
    feature varchar(4000),--扩展字段
    send_date date--发送日期 --search=true
) tablespace cmccuser;
create sequence notification_seq minvalue 1 maxvalue 999999999999 start with 1 increment by 1;

alter table notification modify order_id varchar(32);
alter table notification modify content varchar(4000);


alter table user_ext add read_sys_notify_date date;
alter table user_yunmi add account varchar(20);

--update user_yunmi a set a.user_id=(select b.user_id from account b where b.account=a.account)  where (a.user_id=0 or a.user_id is null) and a.account!='' and a.account is not null


create table user_business (
    ubid number(12) primary key,
    user_id number(12),
    user_code varchar(40),
    funcode varchar(10),
    type varchar(10),
    business_id number(10),
    unitno varchar(20),
    memo varchar(20)
) tablespace cmccuser;
create sequence user_business_seq minvalue 1 maxvalue 999999999999 start with 1 increment by 1;



create table news (--新闻
    news_id number(10) primary key,--自增ID
    title varchar(200),--新闻标题 --search=true
    summary varchar(400),--新闻摘要 
    linkurl varchar(300),--跳转链接
    image varchar(200),--图片 --type=file --ext=png|jpeg|jpg|bmp|gif
    category_id number(5),--分类 --formType=select --options={ url: '/news_category/filter', params:{ type: 'type' }, text: 'category_name', value: 'category_id' } --search=true
    /*
    type number(6)--分类类型 --options=1:新闻,2:关于我们,3:广告位 --formType=select --search=true
    */
    news_type number(6),--配置类型 --options=1:文章,2:图文链接 --formType=select
    content clob,--文章内容
    add_date date--发布日期
) tablespace cmccuser;
create sequence news_seq minvalue 1 maxvalue 9999999999 start with 1 increment by 1;

create table news_category (--新闻分类
    category_id number(6) primary key,--分类ID
    category_name varchar(100),--分类名称
    type number(2),--类型 --options=1:新闻,2:关于我们,3:广告位 --formType=select --search=true
    def_news_type number(6)--默认配置类型 --options=1:文章,2:图文链接 --formType=select
) tablespace cmccuser;
create sequence news_category_seq minvalue 1 maxvalue 999999 start with 10000 increment by 1;

insert into news_category (category_id,category_name,type,def_news_type) values (1,'首页banner',3,2);
insert into news_category (category_id,category_name,type,def_news_type) values (4,'圈子banner',3,2);

insert into news_category (category_id,category_name,type,def_news_type) values (2,'服务大厅-生活提醒',3,2);
insert into news_category (category_id,category_name,type,def_news_type) values (3,'服务大厅-通信提醒',3,2);



alter table yunmi_redbag_detail modify amount number(10,2);
alter table yunmi_redbag modify amount number(10,2);

-----------------------------
--<<2016-12-16 up to date here
-----------------------------


create table promission_list (--黑白名单
    promission_id number(8) primary key,--ID
    account varchar(40),--账号
    status number(2),--状态 --options=1:黑名单,2:白名单 --formType=select
    type number(1)--类型 --options=1:完全匹配,2:正则匹配
) tablespace cmccuser;

create sequence promission_list_seq minvalue 1 maxvalue 99999999 start with 1 increment by 1;

create table app_version (--app版本
    version varchar(20) primary key,--版本号
    ios_version number(6),--iOS版本id
    ios_url varchar(300),--ios下载地址
    android_version number(6),--android版本id
    android_url varchar(300),--android下载地址 --type=file --ext=apk
    content varchar(1000)--版本信息
) tablespace cmccuser;


-----------------------------
-----------------------------


create table user_open_history (--用户打开app历史记录
    history_id number(12) primary key,--历史ID
    user_id number(12),--用户ID
    device_type number(2),--设备类型 --options=1:iOS,2:android --formType=select
    os_version varchar(20),--操作系统版本
    app_version varchar(20),--app版本
    user_agent varchar(200),--userAgent
    record_date date--打开app时间
) tablespace cmccuser;
create sequence user_open_history_seq minvalue 1 maxvalue 999999999999 start with 1 increment by 1;



create table call_black (--拨号黑名单
    black_id number(12) primary key,--黑名单ID
    user_id number(12),--用户ID
    friend_id number(12)--黑名单用户ID
) tablespace cmccuser;
create sequence call_black_seq minvalue 1 maxvalue 999999999999 start with 1 increment by 1;



