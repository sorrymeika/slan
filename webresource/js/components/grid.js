define(function (require, exports, module) {
    var $ = require('$'),
        util = require('util'),
        events = require('../core/view').prototype,
        Page = require('./page'),
        isIE6 = util.ie && util.osVersion == 6,
        compareData = function (v1, v2, asc) {
            var flag;
            if (typeof v1 == 'number') {
                flag = asc ? v1 - v2 : (v2 - v1);
            } else {
                flag = (v1 + "").localeCompare(v2 + "") * (asc ? 1 : -1);
            }
            return flag;
        },
        fold = isIE6 ? function ($el) {
            $el.css({ height: 0, marginTop: -1 })
        } : function () {
            $el.hide();
        },
        spread = isIE6 ? function ($el, height) {
            $el.css({ height: height, marginTop: '' });

        } : function () {
            el.show();
        },
        ajaxOptions = ['url', 'beforeSend', 'success', 'error', 'type'];

    var Cell = function (row, options) {
        var self = this,
            settings = row.grid.options;

        this.$el = $(this.el).css($.extend({
            width: options.curWidth,
            height: options.height,
            'text-align': options.align || '',
            'float': options.curWidth == 'auto' ? 'none' : ''

        }, options.style));

        if (options.valign == "center") {
            this.$el.addClass('grid_cell_vcenter');
        }

        this.options = options;

        this.el = this.$el[0];
        this.row = row;
        this.$body = options.index == 0 && settings.type != "tree" && settings.children ? $('<div class="grid_spread" data-rowindex="' + row.index + '"></div>').appendTo(this.$el) : this.$el;

        if (options.index == 0) {
            if (settings.type == "tree") {

                var treeSpaces = [];
                for (var j = 0; j < treeDeep; j++) {
                    treeSpaces.push('<i class="grid_tree_space"></i>');
                }

                this.$el.prepend(treeSpaces.join(''));

                var children = row.data[settings.subKey];

                if (children && children.length) {

                    $('<i class="grid_tree" data-treeid="' + row.treeId + '"></i>').appendTo(this.$el);

                    row.$el.addClass("grid_tree_fold");

                    $.each(children, function (i, item) {
                        row.grid.append(item, row.treeDeep + 1, row.treeId);
                    });

                } else
                    $("<i class='grid_tree_nochild'></i>").appendTo(this.$el);

            }
        }
        var val = row.data[options.bind] || options.defaultVal;

        if (options.render) {
            options.render.call(self, row.data, row.grid._data);

        } else if (options.type == "textbox") {

            var $textbox = $('<textarea class="grid_cell_textbox" data-row="' + row.index + '" data-cell="' + self.index + '"></textarea>')
                            .css({ height: settings.rowHeight })
                            .val(val);

            self.$textbox = $textbox;
            self.$body.append($textbox);

            self.on('change', function (e, a) {
                this.$textbox.val(a);
                this.validate();
            });

            self.validate = function () {
                var error = false;

                if (options.emptyAble === false && this.$textbox.val() == "")
                    error = this.options.emptyText || (this.options.text + "不可为空！");
                else if (column.regex && !column.regex.test(textbox.value))
                    error = this.options.regexText || (this.options.text + "格式错误！");

                if (!!error)
                    this.$el.addClass("grid_cell_err").title = error;
                else
                    this.$el.removeClass("grid_cell_err").title = "";

                return !error;
            };

        } else if (options.type == "selector") {
            var selector = $('<input class="grid_selector" data-row="' + row.index + '" type="' + (settings.multiselect ? "checkbox" : "radio") + '" name="__gs_' + row.grid.cid + "'>").prop({ "checked": false });

            self.$body.append(selector);
            self.$selector = row.$selector = selector;

        } else {
            this.$body = $('<div class="grid_cell_item' + (options.valign == "center" ? ' grid_cell_vcenter' : '') + '">' + val + '</div>').appendTo(this.$body);
        }

        row.$el.append(self.$el);
    }

    Cell.prototype = {
        trigger: events.trigger,
        on: events.on,
        el: '<li class="grid_cell"></li>',

        $: function (a) {
            return this.$el.find(a);
        },

        append: function (el) {
            this.$body.append(el);
            return this;
        },

        html: function (html) {
            if (typeof html === "undefined")
                return this.$body.html();

            this.$body.html(html);
            return this;
        },

        val: function (val) {
            if (typeof a == "undefined")
                return this.value;

            if (typeof val == "string" && /^\/Date\(\d+\)\/$/.test(val)) {
                val = util.formatDate(val);
            }

            this.value = val;

            if (this.options.bind) row.data[this.options.bind] = val;

            if (this.$textbox) {
                this.$textbox.val(val);

            } else if (this.options.render) {
                options.render.call(self, row.data, row.grid._data);
            } else {
                this.html(val);
            }

            this.trigger('change', val);
            return this;
        }
    }

    var Row = function (grid, options) {
        this.grid = grid;

        this.$el = $(this.el).css({ height: options.height }).data('index', options.index);
        this.el = this.$el[0];
        this.data = options.data;
        this.index = options.index;
        this.cells = [];
    }

    Row.prototype = {
        el: '<ul class="grid_row"></ul>',
        data: null,
        selected: false,

        select: function () {
            if (this.selected) return;

            this.selected = true;
            this.$el.addClass("grid_row_cur");
            if (this.selector)
                this.selector.prop({ checked: true });

            this.grid.selectedRows.push(this);
            this.grid.selectedRow = this;
            this.grid.trigger('SelectRow', this);
        },

        cancelSelect: function () {
            if (!this.selected) return;
            this.selected = false;
            this.$el.removeClass("grid_row_cur");
            if (this.selector) this.selector.prop({ checked: false });

            var grid = this.grid,
                selectedRows = grid.selectedRows;

            for (var i = 0, length = selectedRows.length; i < length; i++) {
                if (selectedRows[i] == this) {
                    selectedRows.splice(i, 1);
                    break;
                }
            }

            if (grid.selectedRow == this) {
                grid.selectedRow = selectedRows.length != 0 ? selectedRows[selectedRows.length - 1] : null;
            }
        },

        cell: function (i, column) {
            if (column === undefined) return this.cells[i];

            this.cells[i] = new Cell(this, column);
            return this;
        },

        append: function (column) {
            this.cells.push(new Cell(this, column));
            return this;
        },

        spread: function () {
            this.$el.find('.grid_spread').removeClass('grid_spread').addClass("grid_fold");
            this.childContainer.removeClass('grid_child_non').addClass("grid_child_con");
        },

        fold: function () {
            this.$el.find('.grid_fold').removeClass('grid_fold').addClass("grid_spread");
            this.childContainer.removeClass('grid_child_con').addClass("grid_child_non");
        }
    };


    var Grid = function (options) {
        var self = this;

        self.options = options = $.extend(true, {
            type: "grid",//grid:普通列表;tree:树形列表
            pageEnabled: false,
            pageSize: 10,
            rowHeight: 30,
            height: 'auto',
            multiselect: false,

            subKey: "children",//树形列表的子数据的key

            data: [],//默认数据
            columns: [],
            children: null,//子列表
            search: null,//查询表单

            onSelectRow: util.noop

        }, options);

        $.each(options.columns, function (i, option) {
            options.columns[i] = $.extend({
                text: "",
                bind: "",
                render: null,
                width: 10,
                align: "left",
                valign: "center",
                type: "normal",
                style: {},
                css: "",
                defaultVal: ""
            }, option);
        });

        self.$el = $(self.el);
        self.el = self.$el[0];

        self.$header = self.$el.find('.grid_header');
        self.$body = self.$el.find('.grid_body');

        self.cid = util.guid();
        self.listen(self.events);

        if (options.type == "tree")
            self.treeDeepRecord = [];

        self.rows = [];
        self.selectedRows = [];

        self.adjustWidth();

        self.createHead();
        self.createSearch();

        if (options.pageEnabled)
            self.page = new Page({
                id: $("<DIV class='page'>共0条数据</DIV>").appendTo(self.$el),
                page: 1,
                pageSize: self.options.pageSize,
                total: 0,
                onChange: function (page) {
                    self.ajaxSettings.data.page = page;
                    self.load();
                }
            });
    }


    Grid.prototype = {

        events: {
            'click .grid_header .sortable': function (e) {
                var self = this,
                    $target = $(e.currentTarget),
                    ajaxData = self.ajaxSettings.data,
                    bind = $target.data('bind');

                ajaxData.sort = bind;

                if (self.currentSort != e.currentTarget) {
                    $target.removeClass("sort_desc sort_asc");
                    self.currentSort = e.currentTarget;
                }
                var asc = !$target.hasClass("sort_asc");
                if (asc) {
                    $target.removeClass("sort_desc").addClass("sort_asc");
                } else {
                    $target.removeClass("sort_asc").addClass("sort_desc");
                }
                ajaxData.asc = asc;

                if (self.options.pageEnabled) {
                    ajaxData.page = 1;
                    self.load();
                }
                else {
                    self._data.sort(function (a, b) {
                        return compareData(a[bind], b[bind], asc);
                    });

                    self.rows.sort(function (a, b) {
                        var flag = compareData(a.data[bind], b.data[bind], asc);
                        if (flag > 0) {
                            b.$el.insertBefore(a.$el);
                        } else if (flag < 0) {
                            a.$el.insertBefore(b.$el);
                        }
                        return flag;
                    });
                }
                return false;
            },

            'click .grid_header .grid_spread,.grid_fold': function (e) {
                var $target = $(e.currentTarget);

                if ($target.hasClass("grid_spread")) {
                    $target.removeClass("grid_spread").addClass("grid_fold");
                    $.each(this.rows, function (i, row) {
                        row.spread();
                    });
                } else {
                    $target.removeClass("grid_fold").addClass("grid_spread");
                    $.each(this.rows, function (i, row) {
                        row.fold();
                    });
                }

                return false;
            },

            'click .grid_body .grid_spread,.grid_fold': function (e) {
                var $target = $(e.currentTarget);

                if ($target.hasClass("grid_spread")) {
                    this.rows[$target.data('rowindex')].spread();
                } else {
                    this.rows[$target.data('rowindex')].fold();
                }

                return false;
            },

            'click .js_grid_selector': function (e) {
                var $target = $(e.currentTarget);

                this.$el.find("input[name='__gs_" + this.cid + "']")
                    .prop({ checked: this.checked });

                var fn = this.checked ? "select" : "cancelSelect";
                this.selectedRows.length = 0;
                this.selectedRow = false;
                $.each(this.rows, function (i, item) {
                    item[fn]();
                });

                if (this.selectedRows.length == 0)
                    this.selectedRow = null;

                else {
                    var row = this.selectedRows[0];
                    if (row != this.selectedRow) {
                        this.selectedRow = row;
                    }
                }

                return false;
            },

            'click .grid_row': function (e) {
                var row = this.rows[$(e.currentTarget).data('index')];
                if (this.options.multiselect) {
                    if (e.target.name != "__gs_" + this.cid)
                        row[row.selected ? "cancelSelect" : "select"]();

                } else if (this.selectedRow != row) {
                    if (this.selectedRow)
                        this.selectedRow.cancelSelect();
                    row.select();
                }

            },

            'click .grid_tree': function (e) {
                var self = this,
                    $row = $(e.currentTarget).closest('.grid_row'),
                    treeid = $row.data('treeid'),
                    $show = this.$el.find("[parenttree^='" + treeid + "_']");

                if ($row.hasClass("grid_tree_fold")) {
                    $row.removeClass("grid_tree_fold").addClass("grid_tree_spread");

                    fold($show);

                } else {
                    $row.removeClass("grid_tree_spread").addClass("grid_tree_fold");
                    $show.each(function (i, item) {
                        item = $(item);

                        if (self.$body.find('[data-treeid="' + item.data('treeid').replace(/_\d+$/, '') + '"]').hasClass('grid_tree_fold')) {
                            spread(item, self.options.rowHeight);
                        }
                    });
                }

                return false;
            },

            'blur .grid_cell_textbox': function (e) {
                var $target = $(e.currentTarget);

                this.cell($target.data('row'), $target.data('cell')).validate();
                return false;
            },

            'click .grid_selector': function (e) {

                if (this.options.multiselect) {
                    var target = e.currentTarget,
                        row = this.rows[$(target).data('row')];

                    if (target.checked) row.select();
                    else row.cancelSelect();
                }
            },

            'click .grid_search': 'search'
        },

        on: events.on,
        trigger: events.trigger,
        listen: events.listen,

        cell: function (row, column) {
            return this.rows[row].cells[column];
        },

        ajaxSettings: {},

        el: '<div class="grid_cont"><div class="grid"><div class="grid_border_r"><div class="grid_header_cont"><ol class="grid_header"></ol></div><div class="grid_body"></div></div></div></div>',
        load: function () {
        },

        adjustWidth: function () {
            var options = this.options,
                length = options.columns.length - 1,
                percent = 0,
                totalPercent = 0,
                total = 0,
                column,
                width,
                widths = [];

            $.each(options.columns, function (i, column) {
                column.width = parseInt(column.width);
                if (!column.hide) total += column.width;
            });

            for (var i = 0; i < length; i++) {
                column = options.columns[i];
                percent = Math.round(100 * column.width / total);
                widths[i] = percent;
                totalPercent += percent;
            }
            widths[length] = util.ie ? "auto" : (100 - totalPercent);

            this.columnWidths = widths;
        },

        createHead: function () {
            var self = this,
                options = self.options,
                columnWidths = self.columnWidths,
                columnWidth;

            $.each(options.columns, function (i, column) {
                var columnWidth = typeof columnWidths[i] == "number" ? columnWidths[i] + '%' : columnWidths[i],
                    headCell = $("<li></li>"),
                    text;

                column.index = i;
                column.height = options.rowHeight;

                if (column.type == "selector" && options.multiselect) {
                    text = $('<input class="js_grid_selector" type="checkbox" data-cid="' + self.cid + '" />').prop({ checked: false });
                    column.align = "center";
                    columnWidth = 50;
                } else {
                    text = $("<a>" + column.text + "</a>");

                    if (i == 0) {
                        if (options.children) {
                            $("<div class='grid_spread'></div>").append(text).appendTo(cell);
                            column.align = "left";
                        }
                    }
                    if ((column.sortAble || column.sortable) && column.bind) {
                        text.addClass("sortable").attr('data-bind', column.bind);
                    }
                }

                column.curWidth = columnWidth;

                headCell.append(text).css({
                    textAlign: column.align,
                    width: columnWidth,
                    'float': columnWidth == 'auto' ? 'none' : ''

                }).appendTo(self.$header);
            });
        },

        msg: function (msg) {
            var height = this.$body[0].offsetHeight || 100;

            this.$body.html('<div style="border-bottom: 1px solid #cdcdcd;height:' + height + 'px;line-height:' + height + 'px;text-align:center">' + msg + '</div>');
        },

        data: function (data) {
            var self = this;

            if (data === undefined) return self._data;

            self._data = data;

            if (null == data || !data.length) {
                self.msg("暂无数据");
                return;
            }

            self.$body.html("");

            $.each(data, function (i, item) {
                self.append(item);
            });
        },

        append: function (item, treeDeep, parentTreeId) {
            var self = this,
                options = self.options,
                row = new Row(self, {
                    data: item,
                    index: self.rows.length
                });

            self.rows.push(row);

            if (options.type != "tree" && options.children) {
                var childGrid,
                    childContainer = $('<div class="grid_child_non"></div>').appendTo(self.$body);

                row.childContainer = childContainer;
                row.children = [];

                $.each(options.children, function (i, child) {
                    if (typeof child.render === "function") {
                        row.children.push(child.render(childContainer, item, row));
                    } else {
                        if (options.subKey)
                            child.data = item[options.subKey];

                        childGrid = new Grid($("<div></div>").appendTo(childContainer), child);
                        childGrid.parentRow = row;
                        row.children.push(childGrid);
                    }
                });

            } else if (options.type == "tree") {
                treeDeep = treeDeep || 0;
                self.treeDeepRecord[treeDeep] = self.treeDeepRecord[treeDeep] ? self.treeDeepRecord[treeDeep] + 1 : 1;
                row.treeDeep = treeDeep;
                parentTreeId = parentTreeId || 0;

                row.parentTreeId = parentTreeId;
                row.treeId = parentTreeId + '_' + self.treeDeepRecord[treeDeep];
                row.$el.attr({ 'data-treeid': subtree });
            }

            $.each(options.columns, function (i, column) {
                row.append(column);
            });

            self.$body.append(row.$el);
        },

        load: function () {
            var self = this,
                ajaxSettings = self.ajaxSettings,
                param = ajaxSettings.data;

            self.msg("正在载入...");

            if (self.page)
                self.page.clear();

            if (ajaxSettings.beforeSend) ajaxSettings.beforeSend.call(self, param);

            $.ajax({
                url: ajaxSettings.url,
                type: ajaxSettings.type || 'POST',
                data: param,
                dataType: 'json',
                cache: false,
                success: function (res) {
                    if (res.success) {
                        self.data(res.data);

                        if (self.options.pageEnabled) {
                            self.page.change({
                                page: param.page,
                                pageSize: param.pageSize,
                                total: res.total
                            });

                            self.trigger('PageChange', param.page);
                        }

                        if (ajaxSettings.success) ajaxSettings.success.call(self, res.data);
                    } else
                        self.msg(typeof res.msg === 'string' ? res.msg : JSON.stringify(res.msg));
                },
                error: function (xhr) {
                    if (ajaxSettings.error) ajaxSettings.error.call(self, xhr);
                    else self.msg(xhr.responseText)
                }
            });
            return self;
        },

        search: function (options) {
            var self = this,
                ajaxSettings = $.extend(true, {}, self.ajaxSettings, !options || options.target ? {} : options);

            self.ajaxSettings = ajaxSettings;

            var param = ajaxSettings.data || (ajaxSettings.data = {});

            if (self.options.pageEnabled) param.page = 1, param.pageSize = self.options.pageSize;

            if (self.controls)
                $.each(self.controls, function (key, item) {
                    param[key] = item.$el.val();
                });

            return self.load();
        },

        createSearch: function () {
            var self = this,
                options = this.options.search;

            self.ajaxSettings.data = {};

            if (!options) return;

            $.extend(self.ajaxSettings, util.pick(options, ajaxOptions));

            var controls = {},
                data = options.data;

            if (data) {
                $.each(data, function (key, item) {
                    if ($.isPlainObject(item)) {
                        controls[key] = item;
                        data[key] = "";
                    } else {
                        self.ajaxSettings.data[key] = item;
                    }
                });
            }

            if (!controls || $.isEmptyObject(controls)) return;

            self.controls = controls;

            var $search = $('<div class="search"></div>'),
                visible = false;

            $.each(controls, function (key, option) {

                option = $.extend({
                    label: '',
                    name: '' || key,
                    className: 'text',
                    type: 'text',
                    value: '',
                    render: null,
                    width: null,
                    options: null,
                    newLine: false

                }, option);

                if (option.newLine)
                    $search.append('<br>')

                option.label ? $('<i>' + option.label + '</i>').appendTo($search) : $search.append(' ');

                var name = option.name,
                    control = {
                        name: name,
                        type: option.type
                    };

                if ($.isFunction(option.render)) {
                    var input = option.render.call(self, $search);

                    if (typeof input == "string")
                        $search.append(input);

                    control.type = 'render';
                    control.$el = $search.find('[name="' + name + '"]');

                } else {

                    if (option.type == "calendar") {
                        input = $('<input name="' + name + '" class="' + option.className + '" type="text"/>');
                        seajs.use(['./components/jquery.datepicker', './components/jquery.datepicker.css'], function () {
                            input.datePicker($.extend(option.options, {
                                clickInput: true
                            }));
                        });

                    } else if (option.type == "select") {
                        input = $('<select name="' + name + '"></select>');
                        if ($.isArray(option.options)) {
                            $.each(option.options, function (j, item) {
                                input.each(function () {
                                    this.options.add(new Option(item.text, item.value));
                                });
                            });
                        }
                        if (option.change) input.on('change', option.change);

                    } else {
                        input = $('<input type="' + option.type + '" name="' + name + '" class="' + option.className + '"/>');
                    }
                    if (option.width) input.css({ width: width });
                    input.appendTo($search).val(option.value);

                    control.$el = input;
                }

                if (control.type != 'hidden')
                    visible = true;

                controls[key] = control;
            });

            if (visible) {
                self.$searchBtn = $('<button class="grid_search button">搜索</button>')
                    .appendTo($search);
            } else
                $search.hide();

            self.$search = $search;

            self.$el.prepend($search);
        }
    };

    module.exports = Grid;
});
