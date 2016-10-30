﻿
var $ = require('$');
var util = require('util');
var Model = require('core/model2').Model;
var Page = require('core/page');
var Http = require('core/http');
var Form = require('components/form');
var Grid = require('components/grid');

var auth = require('logical/auth');

return Page.extend({
    events: {},

    onCreate: function () {
        var self = this;

        var model = this.model = new Model(this.$el, {});
        /*

                new Http({
                    url: '/admin/login',
                    params: auth.encryptParams({
                        admin_name: "admin",
                        password: auth.md5('123456')
                    })
        
                }).request().then(function (res) {
                    auth.setAdmin({
                        adminId: res.data.adminId,
                        adminName: res.data.adminName
                    });
        
                    auth.setAuthToken(res.data.tk);
                });
                

        Http.post('/admin/test').then(function () {

        })*/

        Http.post('/user/getAll', {
            page: 1,
            pageSize: 10

        }).then(function () {

        });

        function toUpper(name) {
            return name.replace(/^[a-z]/g, function (a) {
                return a.toUpperCase();
            })
        }

        function getSetterAndGetter(code) {
            var result = code.replace(/(?:\s*)private\s+([a-zA-Z]+)\s+([^\;]+);(?:\s*)/g, function (match, type, v) {

                return 'public ' + type + " get" + toUpper(v) + "(){ return " + v + "; }\n";
            });

            result += code.replace(/(?:\s*)private\s+([a-zA-Z]+)\s+([^\;]+)\;(\s*)/mg, function (match, type, v) {

                return 'public void set' + toUpper(v) + "(" + type + " " + v + "){ this." + v + " = " + v + "; }\n";
            });

            return result;
        }


        var form = new Form({
            url: '',
            fields: [{
                label: 'javaDir',
                field: 'javaDir',
                value: localStorage.getItem('javaDir')
            }, {
                label: '前端文件夹',
                field: 'feDir',
                value: localStorage.getItem('feDir')
            }, {
                label: 'package',
                field: 'pack',
                value: localStorage.getItem('pack')
            }, {
                label: '文本框',
                field: 'code',
                type: "textarea",
                value: localStorage.getItem('code')
            }, {
                label: 'model',
                field: 'model',
                type: "textarea"
            }, {
                label: 'mapperXml',
                field: 'mapperXml',
                type: "textarea"
            }, {
                label: 'mapper',
                field: 'mapper',
                type: "textarea"
            }, {
                label: 'service',
                field: 'service',
                type: "textarea"
            }, {
                label: 'controller',
                field: 'controller',
                type: "textarea"
            }, {
                label: 'insertForm',
                field: 'insertForm',
                type: "textarea"
            }, {
                label: 'updateForm',
                field: 'updateForm',
                type: "textarea"
            }, {
                label: 'grid',
                field: 'grid',
                type: "textarea"
            }],
            buttons: [{
                value: 'asdf',
                click: function () {
                    var feDir = this.data().feDir;
                    var javaDir = this.data().javaDir;
                    var pack = this.data().pack;
                    var code = this.data().code.replace(/\/\/.*?\n/g, '');
                    var result;

                    localStorage.setItem('code', code);
                    localStorage.setItem('pack', pack);
                    localStorage.setItem('feDir', feDir);
                    localStorage.setItem('javaDir', javaDir);

                    if (/^create\s+table/.test(code)) {
                        var arr = [];
                        var columns = [];
                        var tableInfo = /^create\s+table\s+([a-z0-9A-Z_]+)(?:\s*\(\s*)(?:--([^\n\r]+)){0,1}/i.exec(code);
                        var tableName = tableInfo[1];
                        var primaryKey = {};
                        var className = tableName.replace(/^[a-z]|_[a-zA-Z]/g, function (match) {
                            return match.replace('_', '').toUpperCase();
                        });
                        var tableDesc = tableInfo[2];

                        tableInfo = {
                            name: tableName,
                            desc: tableName,
                            className: className
                        };

                        if (tableDesc) {
                            tableDesc = tableDesc.split('&')
                            console.log(tableDesc);
                            tableInfo.desc = tableDesc.shift();
                            tableDesc.forEach(function (item) {
                                var _name = item.substr(0, item.indexOf('='));
                                var _val = item.substr(item.indexOf('=') + 1);
                                tableInfo[_name] = _val == 'true' ? true : _val == 'false' ? false : _val;
                            });
                        }

                        console.log(tableInfo);

                        var privateCode = "";
                        var namespaceCode = [];
                        var columnsList = [];


                        code.replace(/\s([a-z0-9A-Z_]+)\s+(number|varchar|date)(?:\(\d+\)){0,1}(?:\s+primary\s+key|\s+not|\s+null)*(?:,|\)|\s|$|-)[^\n\r]*?(?:-{1,2}([^\n\r]+)){0,1}/mgi, function (match, name, type, memo) {
                            //console.log(name, type, memo);
                            var ext;
                            var emptyAble = false;
                            var params = {};

                            if (memo) {
                                var filter = memo.split('&');

                                if (filter.length > 1) {
                                    memo = filter.shift();

                                    filter.forEach(function (item) {
                                        var _name = item.substr(0, item.indexOf('='));
                                        var _val = item.substr(item.indexOf('=') + 1);
                                        params[_name] = _val == 'true' ? true : _val == 'false' ? false : _val;
                                    });
                                }
                            }
                            type = (params.type || type).toLowerCase();

                            var item = Object.assign({
                                memo: memo,
                                name: name,
                                field: type == 'file' ? name + "_file" : name,
                                ext: ext,
                                type: type,
                                emptyAble: emptyAble
                            }, params);

                            columns.push(name);
                            columnsList.push(item);

                            if (/\s+primary\s+key/.test(match)) {
                                primaryKey = item;
                            }

                            switch (type) {
                                case "number":
                                    privateCode += "private int " + name + ";\n";
                                    break;

                                case "varchar":
                                case "clob":
                                case "file":
                                    privateCode += "private String " + name + ";\n";
                                    break;

                                case "date":
                                    var d = 'import java.util.Date;';
                                    namespaceCode.indexOf(d) == -1 &&
                                        namespaceCode.push(d);
                                    privateCode += "private Date " + name + ";\n";
                                    break;
                            }
                        });


                        //Model.java
                        var classCode = "package " + pack + ".model;\n\n"
                            + namespaceCode.join('\n')
                            + "\npublic class " + className + " {\n";
                        classCode += privateCode;
                        classCode += getSetterAndGetter(privateCode);
                        classCode += "}";

                        if (javaDir) {
                            Http.post("http://" + location.host + "/create", {
                                savePath: javaDir + "/" + pack.replace(/\./g, '/') + "/model/" + className + ".java",
                                data: classCode
                            });
                        }

                        //Mapper.java
                        var mapper = "package " + pack + ".mapper;\n\n\
                        import com.cmcc.helife.model."+ className + ";\n\
                        import java.util.List;\n\
                        public interface " + className + "Mapper {\n\
                            public Integer exists("+ className + " data);\n\
                            public int add("+ className + " data);\n\
                            public int update("+ className + " data);\n\
                            public "+ className + " getById(int " + primaryKey.name + ");\n\
                            public List<"+ className + "> getAll();\n\
                            public List<"+ className + "> filter(" + className + " data);\n\
                            public "+ className + " first(" + className + " data);\n\
                            public int delete("+ className + " data);\n\
                            public int deleteById(int " + primaryKey.name + ");\n\
                        }";

                        if (javaDir) {
                            Http.post("http://" + location.host + "/create", {
                                savePath: javaDir + "/" + pack.replace(/\./g, '/') + "/mapper/" + className + "Mapper.java",
                                data: mapper
                            });
                        }

                        //Mapper.xml
                        var primaryKeyCondition = '<when test="' + primaryKey.name + '!=0">' + primaryKey.name + '=#{' + primaryKey.name + '}</when>';
                        var ifCondition = [];

                        columnsList.forEach(function (item) {
                            if (item.name == primaryKey.name) {
                                return;
                            }
                            switch (item.type) {
                                case 'file':
                                case 'varchar':
                                case 'clob':
                                case 'date':
                                    ifCondition.push('<if test="' + item.name + '!=null and ' + item.name + '!=\'\'"> and ' + item.name + '=#{' + item.name + '}</if>');
                                    break;
                                case 'number':
                                    ifCondition.push('<if test="' + item.name + '!=0"> and ' + item.name + ' = #{' + item.name + '}</if>');
                                    break;
                            }
                        });
                        ifCondition = ifCondition.join('\n');
                        var existsMapper = "<select id=\"exists\" resultType=\"Integer\" parameterType=\"" + className + "\">\n\
                            select "+ primaryKey.name + " from " + tableName;
                        existsMapper += '\n<where>\n<choose>\n' + primaryKeyCondition + '<otherwise>\nROWNUM=1\n' + ifCondition + '\n</otherwise>\n</choose>\n</where></select>';

                        var where = '\n<where>\n<choose>\n' + primaryKeyCondition + '<otherwise>' + ifCondition + '\n</otherwise>\n</choose>\n</where>';

                        var selectListColumns = columnsList.filter(function (column) {
                            return column.type != "clob" || column.grid === false;

                        }).map(function (item) {
                            return item.name;
                        }).join(",");

                        var getById = "<select id=\"getById\" resultType=\"" + className + "\">\n\
                        select " + columns.join(",") + " from " + tableName + " where " + primaryKey.name + "=#{" + primaryKey.name + "}" + "\n</select>";

                        var filterXml = "<select id=\"filter\" resultType=\"" + className + "\" parameterType=\"" + className + "\">\n\
                        select " + selectListColumns + " from " + tableName + where + "\n</select>";

                        var getAll = "<select id=\"getAll\" resultType=\"" + className + "\">\n\
                        select " + selectListColumns + " from " + tableName + "\n</select>";

                        var insert = "<insert id=\"add\" parameterType=\"" + className + "\">\n\
                        insert into " + tableName + " (" + columns.join(",") + ") values (#{" + columns.join("},#{") + "})"
                            + "\n</insert>";

                        var update = "<update id=\"update\" parameterType=\"" + className + "\">\n\
                        update " + tableName + "\n<set>\n" + columns.map(function (field) {
                                if (field == primaryKey.name) return '';
                                return '<if test="' + field + '!=null and ' + field + '!=\'\'">' + field + "=#{" + field + "}</if>"
                            }).join('\n')
                            + "\n</set>\n\
                             where " + primaryKey.name + "=#{" + primaryKey.name + "}\n</update>";

                        var deleteXml = "<delete id=\"delete\" parameterType=\"" + className + "\">\n\
                        delete from " + tableName + where + "\n</delete>";

                        var deleteById = "<delete id=\"deleteById\">\n\
                        delete from " + tableName + " where " + primaryKey.name + "=#{" + primaryKey.name + "}\n\
                        </delete>";

                        var mapperXml = '<?xml version="1.0" encoding="UTF-8" ?>\n\
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">\n\
<mapper namespace="com.cmcc.helife.mapper.'+ className + 'Mapper">\n';

                        mapperXml += [existsMapper, filterXml, getById, getAll, insert, update, deleteById, deleteXml].join("\n\n")
                        mapperXml += '\n</mapper>';

                        if (javaDir) {
                            Http.post("http://" + location.host + "/create", {
                                savePath: javaDir + "/../resources/mybatis/sqlmap/" + className + "Mapper.xml",
                                data: mapperXml
                            });
                        }

                        //Service.java
                        var serviceImport = "package " + pack + ".service;\n\n\
                            import java.util.ArrayList;\n\n\
                            import java.util.List;\n\
                            import javax.annotation.Resource;\n\
                            import org.springframework.stereotype.Service;\n\
                            import "+ pack + ".data.Oracle;\n\
                            import "+ pack + ".data.RedisDB;\n\
                            import "+ pack + ".mapper." + className + "Mapper;\n\
                            import "+ pack + ".model.PageResult;\n\
                            import "+ pack + ".model." + className + ";\n";

                        var service = serviceImport + "\n\n\
                        @Service\npublic class " + className + "Service {\n\
                            @Resource\n\
                            private Oracle oracle;\n\n\
                            @Resource\n\
                            private RedisDB redisdb;\n\n\
                            @Resource\n\
                            private AuthService authService;\n\n\
                            @Resource\n\
                            private "+ className + "Mapper mapper;\n\n\
                            public int getNextId() {\n\
                                return oracle.getNextId(\""+ tableName + "_seq\");\n\
                            }\n\
                            public Integer exists("+ className + " data) { return mapper.exists(data); }\n\
                            public int add("+ className + " data) { data.set" + toUpper(primaryKey.name) + "(getNextId());\n return mapper.add(data); }\n\
                            public int update("+ className + " data) { return mapper.update(data); }\n\
                            public int delete("+ className + " data) { return mapper.delete(data); }\n\
                            public int deleteById(int "+ primaryKey.name + ") { return mapper.deleteById(" + primaryKey.name + "); }\n\
                            public "+ className + " getById(int " + primaryKey.name + ") { return mapper.getById(" + primaryKey.name + "); }\n\
                            public List<"+ className + "> filter(" + className + " data) { return mapper.filter(data); }\n\
                            public List<"+ className + "> getAll() { return mapper.getAll(); }\n\
                            public PageResult<List<"+ className + ">> getPage(int page, int pageSize, " + className + " search) {\n\n\
                                List<Object> objs = new ArrayList<Object>();\n\n\
                                String sql = \"select "+ primaryKey.name + " from " + tableName + " where 1=1\";\n\n\
                            "+ columnsList.map(function (item) {

                                var res = 'if (';
                                switch (item.type) {
                                    case "file":
                                    case "varchar":
                                    case "clob":
                                        res += "null != search.get" + toUpper(item.name) + "() && !\"\".equals(search.get" + toUpper(item.name) + "())";
                                        break;
                                    case "date":
                                        res += "null != search.get" + toUpper(item.name) + "()";
                                        break;
                                    case "number":
                                        res += "0 != search.get" + toUpper(item.name) + "()";
                                        break;
                                }
                                res += ') {\n\
                                    sql+=" and '+ item.name + '=?";\n\
                                    objs.add(search.get'+ toUpper(item.name) + '());\n\
                                    }';

                                return res;

                            }).join('\n') + "\n\
                                return oracle.queryPage("+ className + ".class, \"b." + columns.join(",b.") + "\", sql, \"a\", \"" + tableName + " b on a." + primaryKey.name + "=b." + primaryKey.name + "\", page, pageSize, objs.toArray());\n }\n\
                        }";

                        if (javaDir) {
                            Http.post("http://" + location.host + "/create", {
                                savePath: javaDir + "/" + pack.replace(/\./g, '/') + "/service/" + className + "Service.java",
                                data: service
                            });
                        }

                        //controller.java
                        var controllerImport = "package " + pack + ".web;\n\n\
                            import java.util.ArrayList;\n\n\
                            import java.util.List;\n\n\
                            import org.springframework.web.bind.annotation.RequestMapping;\n\
                            import org.springframework.web.bind.annotation.RestController;\n\n\
                            import javax.annotation.Resource;\n\
                            import "+ pack + ".data.RedisDB;\n\
                            import "+ pack + ".service." + className + "Service;\n\
                            import "+ pack + ".model.PageResult;\n\
                            import com.cmcc.helife.model.WebDataResult;\n\
                            import com.cmcc.helife.model.WebErrorResult;\n\
                            import com.cmcc.helife.model.WebResult;\n\
                            import "+ pack + ".model." + className + ";\n\n\
                            import org.springframework.web.multipart.MultipartFile;\n\
                            import com.cmcc.helife.service.MultipartFileService;\n\n";

                        var controllerFile = function () {
                            var fl = "";
                            columnsList.map(function (item) {
                                switch (item.type) {
                                    case "file":
                                        fl += "MultipartFile " + item.field + ", ";
                                        break;
                                }
                            });
                            return fl;
                        };

                        var validate = function (sqlType) {

                            return columnsList.map(function (item) {

                                if (sqlType == 'delete') {
                                    if (item['delete'] !== true) {
                                        return;
                                    }

                                } else if ((sqlType == 'insert' && item.name == primaryKey.name) || (item.emptyAble && item.type != 'file'))
                                    return '';

                                var res = 'if (';
                                var fileRes = "";
                                switch (item.type) {
                                    case "file":
                                        res += "null==" + item.field + " || " + item.field + ".isEmpty()";
                                        fileRes += ' else {\n\
                                        String fileName = '+ item.field + '.getOriginalFilename();\n\
                                        String ext = fileName.substring(fileName.lastIndexOf(".")+1);\n\
                                        if (java.util.regex.Pattern.compile("'+ item.ext + '").matcher(ext).find()) {\n\
                                            data.set'+ toUpper(item.name) + '(multipartFileService.saveFile(' + item.field + '));\n\
                                        } else {\n\
                                            return new WebErrorResult(WebErrorResult.PARAMS_ERROR, "文件格式错误");\n\
                                        }\n\n\
                                    }';
                                        break;

                                    case "varchar":
                                    case "clob":
                                        res += "null == data.get" + toUpper(item.name) + "() || \"\".equals(data.get" + toUpper(item.name) + "())";
                                        break;
                                    case "date":
                                        res += "null == data.get" + toUpper(item.name) + "()";
                                        break;
                                    case "number":
                                        res += "0 == data.get" + toUpper(item.name) + "()";
                                        break;
                                }
                                res += ') {\n\
                                    '+ (item.emptyAble || (sqlType == "update" && item.type == "file") ? '' : 'return new WebErrorResult(WebErrorResult.PARAMS_ERROR, "' + (item.memo || item.name) + '不可为空");') + '\n\
                                    }'+ fileRes + "\n\n";

                                //唯一
                                if (item.unique) {
                                    res += className + " exsitsData = new " + className + "();\n\
                                        exsitsData.set"+ toUpper(item.name) + "(data.get" + toUpper(item.name) + "());\n\
                                        Integer id = service.exists(exsitsData);\n";

                                    if (sqlType == 'insert') {
                                        res += "if (null != id && id > 0) {\n\
                                            return new WebErrorResult(WebErrorResult.PARAMS_ERROR, \""+ (item.memo || item.name) + "不可重复\");\n\
                                        }\n\n";
                                        return res;

                                    } else {
                                        res += "if (id > 0 && id != data.get" + toUpper(primaryKey.name) + "()) {\n\
                                            return new WebErrorResult(WebErrorResult.PARAMS_ERROR, \""+ (item.memo || item.name) + "不可重复\");\n\
                                        }\n\n";
                                        return res;
                                    }
                                }

                                return res;

                            }).join('');
                        }
                        var controller = controllerImport + "@RestController\n\
                        @RequestMapping(\"/"+ tableName + "\")\n\
                        public class "+ className + "Controller {\n\n\
                        @Resource\n\
	                    private MultipartFileService multipartFileService;\n\n\
                        @Resource\n\
                        private "+ className + "Service service;\n\n\
                        @RequestMapping(value = \"/getPage\")\n\
	                    public WebResult getPage(int page, int pageSize, "+ className + " data) throws Exception {\n\
                            return service.getPage(page, pageSize, data);\n\
                        }\n\n\
                        @RequestMapping(value = \"/getAll\")\n\
                        public WebResult getAll() throws Exception {\n\
                            return new WebDataResult<List<PubQuan>>(service.getAll());\n\
                        }\n\n\
                        @RequestMapping(value = \"/getById\")\n\
                        public WebResult getById(int "+ primaryKey.name + ") throws Exception {\n\
                            return new WebDataResult<"+ className + ">(service.getById(" + primaryKey.name + "));\n\
                        }\n\n\
                        @RequestMapping(value = \"/add\")\n\
                        public WebResult add(" + controllerFile() + className + " data) throws Exception {\n\
                            "+ validate('insert') + "\
                            return new WebDataResult<Integer>(service.add(data));\n\
                        }\n\n\
                        @RequestMapping(value = \"/update\")\n\
                        public WebResult update(" + controllerFile() + className + " data) throws Exception {\n\
                            "+ validate('update') + "\
                            return new WebDataResult<Integer>(service.update(data));\n\
                        }\n\
                        @RequestMapping(value = \"/delete\")\n\
                        public WebResult delete("+ className + " data) throws Exception {\n\
                            "+ validate('delete') + "\n\
                            return new WebDataResult<Integer>(service.delete(data));\n\
                        }\n";
                        controller += "@RequestMapping(value = \"/deleteById\")\n\
                        public WebResult deleteById(int "+ primaryKey.name + ") throws Exception {\n\
                            if ("+ primaryKey.name + "==0){\n\
                                return new WebErrorResult(WebErrorResult.PARAMS_ERROR, \"参数错误\");\n\
                            }\n\
                            return new WebDataResult<Integer>(service.deleteById("+ primaryKey.name + ")); }\n\
                        }";

                        if (javaDir) {
                            Http.post("http://" + location.host + "/create", {
                                savePath: javaDir + "/" + pack.replace(/\./g, '/') + "/web/" + className + "Controller.java",
                                data: controller
                            });
                        }

                        //requires
                        var requires = "var $ = require('$');\n\
                        var util = require('util');\n\
                        var Model = require('core/model2').Model;\n\
                        var Page = require('core/page');\n\
                        var Http = require('core/http');\n\n\
                        var Form = require('components/form');\n\
                        var Grid = require('components/grid');\n\n\
                        var Toast = require('widget/toast');\n\
                        var popup = require('widget/popup')\n\n";

                        var pageCode = function (code, title, pageInfo) {
                            return requires + "module.exports = Page.extend({\n\n\
    "+ (pageInfo || '') + "\n\
    onCreate: function () {\n\
        var self = this;\n\n\
        var model = this.model = new Model(this.$el, {\n\
            title: '"+ tableInfo.desc + title + "'\n\
        });\n"+ code + "\n},\n\
    onShow: function () {\n\
    }\n\
});"
                        };

                        //后台添加数据
                        var insertForm = "\nvar form = this.form = new Form({\n\
                            url: '/"+ tableName + "/add',\n\
                            fields: ["+ columnsList.map(function (item) {

                                if (item.name == primaryKey.name) return '';

                                var res = '{\n\
                                    label: "'+ (item.memo || item.name) + '",\n\
                                    field: "'+ item.field + '",\n\
                                    type:';
                                switch (item.type) {
                                    case "varchar":
                                        res += '"text"';
                                        break;
                                    case "file":
                                        res += '"file"';
                                        break;
                                    case "clob":
                                        res += '"richTextBox"';
                                        break;
                                    case "date":
                                        res += '"timePicker"';
                                        break;
                                    case "number":
                                        res += '"number",\n\
                                        regex: /^\\d+$/,\n\
                                        regexText: "格式错误"';
                                        break;
                                }

                                if (item.route) {
                                    res += ',\nvalue: this.route.params.' + item.route;
                                } else if (item.query) {
                                    res += ',\nvalue: this.route.query.' + item.query;
                                } else if (item.value) {
                                    res += ',\nvalue: "' + item.value + '"';
                                }

                                if (!item.emptyAble)
                                    res += ',\nemptyAble:false,\n\
                                        emptyText: "'+ (item.memo || item.name) + '不可为空"\n';

                                res += '},';

                                return res;

                            }).join(' ').replace(/\,$/, '') + "],\n\
                        buttons: [{\n\
                            value:'添加',\n\
                            click: function(){\n\
                                this.submit(function(){\n\
                                    Toast.showToast('添加成功');\n\
                                    form.reset();\n\
                                    self.setResult('"+ tableName + "change');\n\
                                },function(e){ Toast.showToast(e.message); });\n\
                                }\n\
                        },{\n\
                            value:'取消',\n\
                            click: function(){\n\
                                history.back();\n\
                            }\n\
                        }]";

                        insertForm += "});\nform.$el.appendTo(model.refs.main);\n"

                        insertForm = pageCode(insertForm, "添加");

                        var template = '<div class="main" ref="main"><h1>{title}</h1></div>';

                        if (feDir) {
                            Http.post("http://" + location.host + "/create", {
                                savePath: feDir + "/views/" + tableName + "/add.js",
                                data: insertForm
                            });
                            Http.post("http://" + location.host + "/create", {
                                savePath: feDir + "/template/" + tableName + "/add.html",
                                data: template
                            });
                        }


                        //后台修改数据
                        var updateForm = "\nvar form = this.form = new Form({\n\
                            url: '/"+ tableName + "/update',\n\
                            fields: ["+ columnsList.map(function (item) {

                                var res = '{\n\
                                    label: "'+ (item.memo || item.name) + '",\n\
                                    field: "'+ item.field + '",\n\
                                    type:';

                                if (item.name == primaryKey.name) {
                                    res += '"hidden",\n\
                                    value: this.route.params.'+ (item.route || "id");

                                } else {
                                    switch (item.type) {
                                        case "varchar":
                                            res += '"text"';
                                            break;
                                        case "file":
                                            res += '"file"';
                                            break;
                                        case "clob":
                                            res += '"richTextBox"';
                                            break;
                                        case "date":
                                            res += '"timePicker"';
                                            break;
                                        case "number":
                                            res += '"number",\n\
                                        regex: /^\\d+$/,\n\
                                        regexText: "格式错误"';
                                            break;
                                    }

                                    if (item.route) {
                                        res += ',\nvalue: this.route.params.' + item.route;
                                    } else if (item.query) {
                                        res += ',\nvalue: this.route.query.' + item.query;
                                    }
                                }

                                if (!item.emptyAble && !item.type == 'file')
                                    res += '\n,emptyAble:false,\n\
                                        emptyText: "'+ (item.memo || item.name) + '不可为空"\n';

                                res += '},';

                                return res;

                            }).join(' ').replace(/\,$/, '') + "],\n\
                        buttons: [{\n\
                            value:'修改',\n\
                            click: function(){\n\
                                this.submit(function(){\n\
                                    Toast.showToast('修改');\n\
                                    self.setResult('"+ tableName + "change');\n\
                                },function(e){ Toast.showToast(e.message); });\n\
                            }\n\
                        },{\n\
                            value:'取消',\n\
                            click: function(){\n\
                                history.back();\n\
                            }\n\
                        }]";

                        updateForm += "});\n\
                        Http.post('/"+ tableName + "/getById',{\n\
                            " + primaryKey.name + ": this.route.params." + (primaryKey.route || "id") + "\n\
                        }).then(function(res) { form.set(res.data); });\n\
                        form.$el.appendTo(model.refs.main);\n"

                        updateForm = pageCode(updateForm, '修改');

                        if (feDir) {
                            Http.post("http://" + location.host + "/create", {
                                savePath: feDir + "/views/" + tableName + "/update.js",
                                data: updateForm
                            });
                            Http.post("http://" + location.host + "/create", {
                                savePath: feDir + "/template/" + tableName + "/update.html",
                                data: template
                            });
                        }

                        //后台列表管理
                        var gridCode = "var grid = this.grid = new Grid({\n\
                            pageEnabled: true,\n\
                            search: {\n\
                                url: '/"+ tableName + "/getPage',\n\
                                type: 'POST',\n\
                                beforeSend: function () {\n\
                                },\n\
                                data: {\n\
                                    "+ columnsList.map(function (item) {
                                if (!item.search) {
                                    return null;
                                }

                                var searchType;
                                var res;

                                function getCode(name, memo, options) {
                                    var code = name + ": {\n"
                                        + "label: '" + memo + "'";

                                    if (searchType) {
                                        code += ',\ntype:"' + searchType + '"';
                                    }
                                    if (options) {
                                        code += ',\noptions:' + options;
                                    }
                                    code += '\n}';

                                    return code;
                                }

                                if (item.type == "date") {
                                    searchType = "calendar";

                                } else if (item.searchType) {
                                    searchType = item.searchType;
                                }

                                if (searchType == "calendar") {
                                    res = getCode("start_" + item.name, (item.memo || item.name) + " 从", item.options);
                                    res += "," + getCode("end_" + item.name, "到");

                                } else {
                                    res = getCode(item.name, item.memo || item.name, item.options);
                                }

                                return res;

                            }).filter(function (item) {
                                return item != null;
                            }).join(',\n') + "\
                                }\n\
                            },\n\
                            onSelectRow: function () {},\n\
                            columns: ["+ columnsList.map(function (item) {
                                if (item.grid === false || item.type == "clob" || item.type == "file") {
                                    return null;
                                }
                                var res = '{\n\
                                    text: \"'+ (item.memo || item.name) + '\",\n\
                                    bind: \"'+ item.name + '\",\n';

                                if (item.type == "date") {
                                    res += "format: util.formatDate,\n";
                                }
                                res += 'width: ' + (item.gridWidth || (item.type == 'number' ? 5 : 10)) + '\n\
                                }';
                                return res;

                            }).filter(function (item) {
                                return item != null;

                            }).join(',') + ", {\n\
                                text: \"操作\",\n\
                                width: 10,\n\
                                align: 'center',\n\
                                valign: 'center',\n\
                                render: function (data) {\n\
                                    this.append($('<a class=\"js_click\" data-id=\"' + data."+ primaryKey.name + " + '\" href=\"/" + tableName + "/update/' + data." + primaryKey.name + " + '\">[修改]</a>'));\n\
                                    this.append(' <a href=\"javascript:;\" data-id=\"' + data." + primaryKey.name + " + '\" class=\"js_grid_delete\">[删除]</a>');\
                                }\
                            }]\
                        });\n\
                        this.onResult('"+ tableName + "change', function() { grid.search(); });\n\
                        grid.$el.appendTo($(model.refs.main));\ngrid.search();\n";

                        gridCode = pageCode(gridCode, '管理', "events: {\
        'click .js_grid_delete': function(e) {\n\
            if(window.confirm('确认删除吗?')) {\n\
                Http.post('/"+ tableName + "/delete',{ " + primaryKey.name + ": $(e.currentTarget).data('id') })\
            }\n\
        }\n\
    },\n");

                        if (feDir) {
                            Http.post("http://" + location.host + "/create", {
                                savePath: feDir + "/views/" + tableName + "/index.js",
                                data: gridCode
                            });
                            Http.post("http://" + location.host + "/create", {
                                savePath: feDir + "/template/" + tableName + "/index.html",
                                data: template
                            });
                        }


                        //result = [classCode, service, mapper, controller, select, getAll, insert, update].join("\n\n\n");

                        this.set({
                            service: service,
                            model: classCode,
                            mapper: mapper,
                            controller: controller,
                            insertForm: insertForm,
                            mapperXml: mapperXml,
                            updateForm: updateForm,
                            grid: gridCode
                        });

                    } else {
                        result = getSetterAndGetter(code);

                        this.set({
                            code: result
                        })
                    }
                }
            }]
        });
        form.$el.appendTo(this.$el);


        var form = new Form({
            url: '',

            fields: [{
                label: '时间选择',
                field: 'time',
                type: "TimePicker"
            }, {
                label: '文本框',
                field: 'name',
                type: "text",
                value: "aaa",
                emptyAble: false
            }, {
                label: '文本框',
                field: 'xxx',
                type: "textarea",
                value: "aaa"
            }, {
                label: '下拉框',
                field: 'categoryId',
                type: 'select',
                value: 1,
                options: [{
                    text: '选项1',
                    value: 1
                }]
            }]
        });

        form.$el.appendTo(this.$el);
    },

    onShow: function () {
    }
});
