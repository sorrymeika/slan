define(function(require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var model = require('core/model');
    var Page = require('core/page');
    var Form = require('components/form');
    var Grid = require('components/grid');

    return Page.extend({
        events: {
            'keyup': function(e) {
                var self = this;

                if (e.keyCode == 116) {
                    this.model.query();
                }
            }
        },

        onCreate: function() {
            var self = this;

            this.model = new model.ViewModel(this.$el, {
                title: '数据库管理',
                database: util.store('mysql_database')
            });

            console.log(util.store('mysql_database'));

            this.model.useDatabase = function(e) {
                var dbname = this.data.database;

                util.store('mysql_database', dbname);

                $.get('/api/mysql/use?database=' + dbname, function(res) {

                    $.post('/api/mysql/query', {
                        query: 'show tables'
                    }, function(res) {
                        var tables = [];

                        res.data.forEach(function(item) {
                            tables.push({
                                name: item['Tables_in_' + dbname.toLowerCase()]
                            });
                        });

                        self.model.set({
                            tables: tables
                        })

                    }, 'json');

                }, 'json');

                self.getSQL(dbname);

                return this;
            }

            this.model.query = function(e) {

                $.post('/api/mysql/query', {
                    query: this.data.query

                }, function(res) {
                    if (typeof e === 'function') {
                        e.call(self.model, res);
                    }
                    self.setQueryResult(res);

                }, 'json');
            }

            this.model.exec = function(e, sql) {
                $.post('/api/mysql/query', {
                    query: sql

                }, function(res) {
                    self.setQueryResult(res);

                }, 'json');
            }

            this.model.save = function(e) {
                this.query(function(res) {
                    if (res.success) {
                        if (this.data.queries.indexOf(this.data.query) == -1) {
                            $.post('/api/mysql/save', {
                                query: this.data.query,
                                origin: this.data.origin,
                                database: this.data.database

                            }, function(res) {

                                if (res.success) {
                                    self.model.set({
                                        origin: ''
                                    });

                                    self.getSQL(self.model.data.database);

                                } else {
                                    sl.tip(res.msg)
                                }

                            }, 'json');
                        }
                    }
                });
            }

            this.model.del = function(e, sql) {
                if (window.confirm('确认删除？'))
                    $.post('/api/mysql/delete', {
                        query: sql,
                        database: this.data.database

                    }, function(res) {

                        if (res.success) {

                            self.getSQL(self.model.data.database);

                        } else {
                            sl.tip(res.msg)
                        }

                    }, 'json');
            }

            var re_sql_key = /'(?:''|[^'])*'|\b(?:select|from|where|and|or|order\s+by|group\s+by|limit|create|table|create\s+database|drop|alter|add|set|tinyint|datetime|varchar|int|utf8|PRIMARY\s+KEY|not\s+null|null)(?=,|\s|$|;|\()|(?:\!|=|\.|,|\d+|\(|\))/ig;

            this.model.formatSQL = function(code) {
                code = code.replace(re_sql_key, function(m, m1) {

                    if (m.indexOf('\'') == 0) {
                        return '<i style="color:#c41a16;">' + m + '</i>'
                    } else if (/^\d+$/.test(m)) {
                        return '<i style="color:#1c00cf">' + m + '</i>'
                    } else if (/^not|null$/.test(m)) {
                        return '<i style="color:#999">' + m + '</i>'
                    } else {
                        return '<i style="color:#aa0d91">' + m + '</i>'
                    }
                })
                    .replace(/(^|\r\n|\r|\n)(\#[^\r\n]+)/mg, '$1<i style="color:green">$2</i>')
                    .replace(/\r\n|\r|\n/mg, '<br>');
                return code;
            }

            this.model.getTableData = function(e, tablename) {
                this.set({
                    table: tablename,
                    query: "select * from " + tablename + " limit 0,20"
                }).query();
            }

            this.model.getTableInfo = function(e, tablename) {
                this.set({
                    table: tablename,
                    query: "select COLUMN_NAME,COLUMN_TYPE,IS_NULLABLE,COLUMN_KEY,PRIVILEGES from information_schema.COLUMNS where table_name='" + tablename + "' and table_schema='" + self.model.data.database + "'"
                }).query();
            }

            $.get('/api/mysql/databases', function(res) {
                var db = util.store('mysql_database') || res.fields[0].db;

                self.model.set({
                    databases: res.data,
                    database: db

                }).useDatabase();

            }, 'json');

        },

        onShow: function() {
        },

        getSQL: function(dbname) {
            var self = this;

            $.post('/api/mysql/get_sql', {
                database: dbname

            }, function(res) {

                self.model.set({
                    queries: res.data.map(function(item) {
                        return {
                            text: item
                        }
                    })
                });

            }, 'json');

        },

        setQueryResult: function(res) {
            if (res.success) {
                var columns = [];
                var data = $.isPlainObject(res.data) ? [res.data] : res.data;
                if (data && data.length) {
                    for (var key in data[0]) {
                        columns.push({
                            key: key
                        });
                    }
                } else if (res.fields) {
                    for (var i = 0; i < res.fields.length; i++) {
                        columns.push({
                            key: res.fields[i].name
                        });
                    }
                }

                this.model.set({
                    result: data,
                    columns: columns,
                    errors: ''
                });

            } else {
                this.model.set({
                    errors: JSON.stringify(res.msg)
                });
            }
        }
    });
});
