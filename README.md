SLAN
=======

mvvm前端框架
---

# Start
1. `npm install`
2. `cd m.cause`
3. `node app.js` 启动dev环境
4. 浏览器输入 http://127.0.0.1:5560 即可访问
5. `node app.js --build=test` 打包测试环境到dest文件夹
6. `node app.js --build=production` 打包生产环境到dest文件夹

#目录结构

* webresource---------资源文件夹
    * images---------图片/css文件夹
    * js---------js文件夹
        * core---------框架核心
        * components---------组件文件夹
        * extend ---------扩展文件夹
        * graphics---------动态效果文件夹
        * widget ---------组件文件夹
        * util---------工具类
    * m---------m站专用文件夹
        * 同上
* m.caulse    ---------项目文件夹
    * dest---------打包文件夹
    * components---------组件文件夹
    * images ---------项目图片/css
    * models ---------models文件夹
    * views ---------视图文件夹
    * template ---------模版文件夹
    * `app.js`---------项目启动/打包文件
    * `global.json`---------全局配置文件
    * `config.json`---------项目/路由配置文件

# 项目

##global.json

* `dest`打包文件夹
* `api`服务端api地址
* `proxy`代理设置(一般情况无需配置)
* `css`公用css，主项目和子项目公用的css，多个css会在打包后合并
* `images`图片文件夹，打包后会将该文件夹下的图片移动到dest文件夹
* `combine`合并js
```json
{
    //将"./components/share.js","./components/api.js"合并为components.js
    "components": {
        //"./components/share.js"打包后seajs的moduleid为"components/share"
        "components/share": "./components/share",
        "models/api": "./components/api"
    }
}
```
* `path`查找js的位置，类似于环境变量
* `port`开发服务器的访问端口
* `projects`项目文件夹，主项目和子项目都放在该数组中
* `env`环境配置，打包时--build参数使用该配置里的对应项，如`node app.js --build=test`会使用`env.test`的配置
* `framework`框架打包配置

##config.json

* `global.json`->`projects`中配置的主项目和子项目文件夹中每个都要有config.json
* `css`当前项目独用的css，多个css会在打包后合并
* `js`当前项目独用的js，多个js会在打包后合并
* `images`当前项目独用的images
* `route`当前项目的路由配置

##views

##template


# 桥