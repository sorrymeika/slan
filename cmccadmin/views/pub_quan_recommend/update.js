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
            title: '公众圈推荐修改'
        });

var form = this.form = new Form({
                            url: '/pub_quan_recommend/update',
                            fields: [{
                                    label: "编号",
                                    field: "recommend_id",
                                    type:"hidden",
                                    value: this.route.params.id,
emptyAble:false,
                                        emptyText: "编号不可为空"
}, {
                                    label: "公众圈ID",
                                    field: "quan_id",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误",
emptyAble:false,
                                        emptyText: "公众圈ID不可为空"
}, {
                                    label: "推荐时间",
                                    field: "recommend_date",
                                    type:"timePicker",
emptyAble:false,
                                        emptyText: "推荐时间不可为空"
}, {
                                    label: "排序",
                                    field: "sort",
                                    type:"number",
                                        regex: /^\d+$/,
                                        regexText: "格式错误",
emptyAble:false,
                                        emptyText: "排序不可为空"
}],
                        buttons: [{
                            value:'修改',
                            click: function(){
                                this.submit(function(){
                                    Toast.showToast('修改成功');
                                    history.back();
                                    self.setResult('pub_quan_recommendchange');
                                },function(e){ Toast.showToast(e.message); });
                            }
                        },{
                            value:'取消',
                            click: function(){
                                history.back();
                            }
                        }]});
                        Http.post('/pub_quan_recommend/getById',{
                            recommend_id: this.route.params.id
                        }).then(function(res) { form.set(res.data); });
                        form.$el.appendTo(model.refs.main);

},
    onShow: function () {
    }
});