
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
user_id number(11) primary key,
account varchar(20) not null,
password varchar(32) not null,
register_date DATE

) tablespace cmccuser;


drop table userinfo;
create table userinfo (
user_id  number(11) primary key,
avatars varchar(20),
user_name varchar(20),
sign_text varchar(200),
gender number(1),
home_city_id number(5),
home_region_id number(7),
city_id number(5),
region_id number(7),
tag varchar(200),
email varchar(100),
constellation number(2)
) tablespace cmccuser;

create sequence user_seq minvalue 1 maxvalue 99999999999 start with 1000 increment by 1 cache 100;

create table login_history (
login_id number(12) primary key,
user_id  number(11),
login_date DATE
) tablespace cmccuser;
create sequence login_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1 cache 100;

drop table pub_quan;
create table pub_quan (--公众圈
    quan_id number(10) primary key,--圈编号&delete=true
    quan_name varchar(20),--圈名称&unique=true&updateable=false&search=true
    quan_pic varchar(100),--圈图片&type=file&ext=png|jpeg|jpg|bmp
    follow_num number(12),--关注人数
    summary varchar(2000),--简介&type=clob&grid=false
    create_date DATE--添加日期&updateable=false&search=true
) tablespace cmccuser;
create sequence pub_quan_seq minvalue 1 maxvalue 99999999999 start with 1 increment by 1 cache 100;
