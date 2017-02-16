var $ = require('$');
                        var util = require('util');
                        var Model = require('core/model2').Model;
                        var Page = require('core/page');
                        var Http = require('core/http');

                        var Form = require('components/form');
                        var Grid = require('components/grid');

                        var Toast = require('widget/toast');
                        var popup = require('widget/popup')

module.exports = Page.extend({

    
    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {
            title: '直播分类修改'
        });

var form = this.form = new Form({
                            url: '/video_live_category/update',
                            fields: [{
                                    label: "自增ID",
                                    field: "id",
                                    type:"hidden",
                                    value: this.route.params.id,
emptyAble:false,
                                        emptyText: "自增ID不可为空"
}, {
                                    label: "频道分类名称",
                                    field: "name",
                                    type:"text",
emptyAble:false,
                                        emptyText: "频道分类名称不可为空"
}],
                        buttons: [{
                            value:'修改',
                            click: function(){
                                this.submit(function(){
                                    Toast.showToast('修改成功');
                                    history.back();
                                    self.setResult('video_live_categorychange');
                                },function(e){ Toast.showToast(e.message); });
                            }
                        },{
                            value:'取消',
                            click: function(){
                                history.back();
                            }
                        }]});
                        Http.post('/video_live_category/getById',{
                            id: this.route.params.id
                        }).then(function(res) { form.set(res.data); });
                        form.$el.appendTo(model.refs.main);

},
    onShow: function () {
    }
});