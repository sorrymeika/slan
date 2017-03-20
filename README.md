SLAN
=======

简洁又强大的mvvm前端框架

用户体验可媲美原生应用

核心文件 https://github.com/sorrymeika/slan/blob/master/webresource/js/core/model2.js


## Start With ViewModel

* `引入ViewModel`
```js
var vm = require('core/model2');
var ViewModel = vm.Model;
```

* `创建一个组件`
```js
var Component = ViewModel.extend({
    // 默认模版
    el: '模版',

    // 默认属性
    attributes: {
        title: '标题'
    }
});
```

* 可以用 `createModel` 或 `createCollection` 方法创建一个 Model/Collection

```js
var user = vm.createModel({
    attributes: {
        userName: '用户名'
    },

    someFunc: function(){

    }
})

// 创建一个Collection
var collection = vm.createCollection({
    array: [{
        name: 'collection item0'
    }],

    getUserById: function(userId){
        return this.find('userId', userId)
    }
})
```


* `也可以直接 new 一个 ViewModel实例`

```js

/**
 * 初始化一个ViewModel
 *
 * @params {String|Element|Zepto<Element>|jQuery<Element>} template 模板
 * @params {Object} attributes 属性
 */
var model = new ViewModel(template, {
    title: '标题',
    titleClass: 'title',
    date: Date.now(),

    friend: {
        friendName: '小白'
    },

    messages: [{ content: 'xxx' }],

    // 可以传入 `createModel` 创建的model
    user: user,

    // 可以传入 `createCollection` 创建的collection
    collection: collection
});
```

<br>

* 这是一个简单的 `template` 
* 使用 `{expression}` 和 `sn-属性` 来绑定数据

```html
<header class="header {titleClass}">这是标题{title}{title?'aaa':encodeURIComponent(title)}</header>
<div class="main">
    <ul>
        <li>时间:{util.formateDate(date,'yyyy-MM-dd')}</li>
        <li>user:{user.userName}</li>
        <li>friend:{friend.friendName}</li>
        <li sn-repeat="msg in messages">msg:{msg.content}</li>
        <li sn-repeat="item in collection">item:{item.name}</li>
    </ul>
</div>
```
```js
// 通过 `model.set` 方法来改变数据
model.set({
    date: Date.now()+10000,
    user: {
        userName: 'asdf'
    }
});

// 通过 `createModel` 创建的model的 `set` 方法改变数据
user.set({
    userName: '小红'
})

// 通过 `collection.set` 方法覆盖数据
collection.set([{
    id: 1,
    name: 'A'
}]);

// 通过 `collection.add` 方法添加数据
collection.add({ id: 2, name: 'B' })
collection.add([{ id: 3, name: 'C' }, { id: 4, name: 'D' }])


// 通过 `collection.update` 方法更新数据
collection.update([{ id: 3, name: 'C1' }, { id: 4, name: 'D1' }], 'id');
collection.update([{ id: 3, name: 'C1' }, { id: 4, name: 'D1' }], function(a, b) {

    return a.id === b.id;
});
```

# Model/Collection 查询

* `-`
```js
// 详情见源码
model._('collection[name~="aa"|id=1,type!=2]').toJSON();
collection._('[name="aa"]').toJSON();
```

# 监听 Model

* `observe / removeObserve / on('change:child.attribute',cb)` 
```js
// 监听所有数据变动
model.observe(function(e) {

});

// 监听 `user` 数据变动
model.observe('user', function(e) {

});

// 监听 `user.userName` 数据变动
model.on('change:user.userName', function(e) {

});
```


# sn-属性

* `sn-[events]` dom事件

```js

model.onButtonClick = function(userName) {
    alert(userName);
}

// 设置 `model` 的事件代理
model.delegate = {
    onButtonClick: function(user) {
        alert(user.userName);
    }
}
```

```html
<div>
    <button sn-tap="this.onButtonClick(user.userName)">Click 0</button>
    <button sn-tap="delegate.onButtonClick(user)">Click 1</button>
</div>
```


* `sn-repeat` 循环

```js
var model = new ViewModel(this.$el, {
    title: '标题',
    list: [{
        name: 1,
        children: [{
            name: '子'
        }]
    }, {
        name: 2
    }]
});
```

```html
<ul class="item" sn-repeat="item,i in list|filter:like(item.name,'2')|orderBy:item.name">这是标题{title}，加上{item.name}
<li sn-repeat="child in item.children">{i}/{child.name+child.age}</li>
</ul>
```

* `[sn-if]` `[sn-else-if]` `[sn-else]` 条件控制

```html
<div class="item" sn-if="{!title}">当title不为空时插入该element</div>
<div class="item" sn-else-if="{title==3}">当title不为空时插入该element</div>
<div class="item" sn-else>当title不为空时插入该element</div>
```

* `sn-display` 控件是否显示（有淡入淡出效果，若不需要可使用 `sn-if`）

```html
<div class="item" sn-display="{title}">当title不为空时显示</div>
```

* `sn-html` 设置innerHTML

```html
<div class="item" sn-html="{title}"></div>
```


* `sn-require` 引入其他组建


```html
@use '../components/tab' as tab;

<div class="tab" sn-require="widget/tab" sn-data="{{items:['生活服务','通信服务']}}"></div>
```



---

# 使用框架的更多功能 (构建、Router、Application、Activity、Bridge...)
1. `npm install`
2. `cd m.cause`
3. `node app.js` 启动dev环境
4. 浏览器输入 http://127.0.0.1:5560 即可访问
5. `node app.js --build=test` 打包测试环境到dest文件夹
6. `node app.js --build=production` 打包生产环境到dest文件夹

# 目录结构

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

# 配置项

## global.json

* `dest`打包文件夹
* `api`服务端api地址
* `proxy`代理设置(一般情况无需配置)
* `css`公用css，主项目和子项目公用的css，多个css会在打包后合并
* `images`图片文件夹，打包后会将该文件夹下的图片移动到dest文件夹
* `combine`js文件合并配置

```js
{
    //将./components/share.js,./components/api.js合并为components.js
    "components": {
        //./components/share.js打包后seajs的moduleid为components/share
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

## config.json

* `global.json`->`projects`中配置的主项目和子项目文件夹中每个都要有config.json
* `css`当前项目独用的css，多个css会在打包后合并
* `js`当前项目独用的js，多个js会在打包后合并
* `images`当前项目独用的images
* `route`当前项目的路由配置

### 路由 config.json > route
```javascript
"route": {
    //将#/映射到index,从项目view/template文件夹中搜索index.js/index.html
    "/": "index",
    //访问地址#/item/1，view/item.js中通过this.route.params.id获取参数值
    "/item/{id:\\d+}": "item"
}
```




# 页面

## Views

* views为项目的视图层，实现页面代码逻辑
* views下的js文件名称要同route中配置的一样
* 视图继承自Activity类,｀var Activity = require('core/activity')｀

### Activity

* Activity.extend(options)方法，返回Activity的子类
* options 参数:
    * onCreate方法，初始化视图时调用
    * onShow方法，每次显示视图时调用
    * onPause方法，每次隐藏视图时调用
    * onDestroy方法，销毁视图时调用
    * events对象，事件处理

* `back(url)`方法，返回某页面(返回动画)

```javascript
module.exports = Activity.extend({
   onCreate: function () {
        // 返回首页

        var model = new ViewModel(this.$el, {

        });

        model.delegate = this;
    },

    backToHome: function(){
        this.back('/');
    }
})
```

* `forward(url)`方法，前进到某页面(前进动画)

```javascript
module.exports = Activity.extend({
   onCreate: function () {
        // 返回首页

        var model = new ViewModel(this.$el, {

        });

        model.delegate = this;
    },

    forwardToProduct: function(){
        this.forward('/product');
    }
})
```

* `query`对象，链接`?`号后面的内容

```javascript
module.exports = Activity.extend({
    onCreate:function() {
        // /item/2?id=1&name=xx

        console.log(this.query.id)
        console.log(this.query.name)
        // 1
        // xx
    }
})
```
* `el`对象，当前element

* `$el`对象，当前$(element)

* `model`对象，数据视图双向绑定，需要在onCreate时初始化，具体可见`template`

```javascript
var Activity = require('core/activity');
var ViewModel = require('core/model2').ViewModel;

module.exports = Activity.extend({
    onCreate:function() {
        var data = {
            title: "标题",
            list: [{
                name: 1
            }, {
                name: 2
            }]
        };
        this.model = new ViewModel(this.$el, data);

        //更新数据
        this.model.set({ title: '新标题' })
    }
})
```



# 桥

* js调用原生功能

```js
var bridge = require('bridge');
bridge.getLocation(function(res) {

    console.log(res.longitude)
    console.log(res.latitude)
})
```

* `pickImage(callback)` 选择相册图片

* `takePhoto(callback)` 拍照

* `getDeviceToken(callback)` 获取消息通知devicetoken

* `getLocation(callback)` 获取当前位置,callback参数{longitude,latitude}

* `ali(data,callback)`支付宝支付api

* `wx(data,callback)`微信api（支付、分享）

* `qq(data,callback)`qq api（分享）

* `update(updateUrl, versionName, callback)` 更新app

