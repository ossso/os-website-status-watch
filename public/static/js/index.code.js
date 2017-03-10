if (typeof Object.assign != 'function') {
    Object.assign = function(target) {
        'use strict';
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        target = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source != null) {
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    };
}
!function() {
/**
 * 首页监听类
 */
var Home,CL;
CL = Home = function() {
    this.data = {};
    this.dom = {};
    this.status = {};
};
CL.fn = CL.prototype;

CL.fn.init = function(options) {
    var _this = this;
    this.options = options;
    for (var i in options.dom) {
        this.dom[i] = $(options.dom[i]);
    }
    this.dom.edit.on('click',function() {
        var index = $(this).parents('.site-item').attr('data-index');
        _this.activeEdit(index);
    });
    this.dom.del.on('click',function() {
        var index = $(this).parents('.site-item').attr('data-index');
        _this.delete(index);
    });

    if (!this.dom.item.length) return this;
    this.dom.item.each(function(index,el) {
        var _time = $(this).attr('data-ref-time');
        _time = parseInt(_time);
        if (!_this.data.refTime) _this.data.refTime = _time;
        if (_this.data.refTime > _time) _this.data.refTime = _time;
    });
    setTimeout(function() {
        _this.ref();
    },this.data.refTime);
    return this;
};

CL.fn.ref = function() {
    if (this.status.isRef) return this;
    location.reload();
    return this;
};

CL.fn.openInfo = function(index) {
    if (!this.dom.editForm) return this;
    var _this = this;
    if (!index) index = '';
    var item = this.dom.list.find('.site-item[data-index="'+index+'"]');
    var objs = {};
    if (item.attr('data-index')) objs['index'] = item.attr('data-index');
    if (item.attr('data-name')) objs['name'] = item.attr('data-name');
    if (item.attr('data-url')) objs['url'] = item.attr('data-url');
    if (item.attr('data-time')) objs['time'] = parseInt(item.attr('data-time'))/1000/60/60;
    if (item.attr('data-tips')) objs['tips'] = (item.attr('data-tips') == 'false')?false:item.attr('data-tips');

    var info = Object.assign({},{
        'index': '',
        'name': '',
        'url': '',
        'tips': false
    },objs);

    for (var i in info) {
        this.dom.editForm.find('[name="'+i+'"]').val(info[i]);
    }
    layer_form.render('select');

    return this;
};

CL.fn.activeEdit = function(index) {
    this.dom.editForm.show(0,function() {
        $(this).css({
            'opacity': 1
        });
    })
    this.openInfo(index);
    this.status.isRef = true;
    return this;
};

CL.fn.closeEdit = function() {
    var _this = this;
    this.dom.editForm.css({
        'opacity': 0
    });
    setTimeout(function() {
        _this.dom.editForm.hide(0);
    },300);
    this.status.isRef = false;
    this.ref();
    return this;
};

CL.fn.delete = function(key) {
    var _this = this;
    layer.open({
        'title': '删除警告',
        'content': '删除后将无法恢复，是否继续？',
        'btn': ['确定','取消'],
        'yes': function(index) {
            layer.close(index);
            _this.dom.deleteForm.find('[name="index"]').val(key);
            _this.dom.deleteForm.submit();
        }
    });
    return this;
};


var home = new Home();
home.init({
    dom: {
        editForm: '.option-form',
        deleteForm: '#delete-item form',
        edit: '.site-option .update-item',
        del: '.site-option .delete-item',
        list: '.site-list',
        item: '.site-list .site-item',
    }
})
window.activeEdit = function() {
    home.activeEdit();
};
window.closeEdit = function() {
    home.closeEdit();
};

}();
