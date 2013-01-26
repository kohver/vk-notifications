function ge(elementId) {
    return (typeof elementId == 'string') ? document.getElementById(elementId) : elementId;
}

function geBySelector(selector, node) {
    return node ? ge(node).querySelector(selector) : document.querySelector(selector);
}

function ce(tag, attr, style) {
    var el = document.createElement(tag);
    if (attr) extend(el, attr);
    if (style) extend(el.style, style);
    return el;
}

function countObj(obj) {
    var count = 0;
    if (typeof obj == 'object') {
        for (var i = 0 in obj) {
            if (obj.hasOwnProperty(i)) {
                count++;
            }
        }
    }
    return count;
}

function extend() {
    var args = Array.prototype.slice.call(arguments), obj = args.shift();
    if (!args.length) {
        return obj;
    }
    for (var i = 0, l = args.length; i < l; i++) {
        for (var key in args[i]) {
            obj[key] = args[i][key];
        }
    }
    return obj;
}

function trim(text) {
    return (text || '').replace(/^\s+|\s+$/g, '');
}

function addEvent(elem, types, handle) {
    elem = ge(elem);

    each(types.split(/\s+/), function(i, type) {
        if (elem.addEventListener) {
            elem.addEventListener(type, handle, false);
        } else if (elem.attachEvent) {
            elem.attachEvent('on' + type, handle);
        }
    });

    elem = null;
}

function each(object, callback) {
    var name, i = 0, length = object.length;

    if (length === undefined) {
        for (name in object) {
            if (object.hasOwnProperty(name)) {
                if (callback.call(object[name], name, object[name]) === false) {
                    break;
                }
            }
        }
    } else {
        for (var value = object[0]; i < length && callback.call(value, i, value) !== false; value = object[++i]) {}
    }

    return object;
}

function getSize(elem) {
    elem = ge(elem);
    return [elem.offsetWidth, elem.offsetHeight];
}

function getWidth(elem) {
    return getSize(elem)[0];
}

function getHeight(elem) {
    return getSize(elem)[1];
}

KEY = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    DEL: 8,
    TAB: 9,
    RETURN: 13,
    ENTER: 13,
    ESC: 27,
    PAGEUP: 33,
    PAGEDOWN: 34,
    SPACE: 32
};

function hasClass(obj, name) {
    obj = ge(obj);
    return obj && (new RegExp('(\\s|^)' + name + '(\\s|$)')).test(obj.className);
}
function addClass(obj, name) {
    if ((obj = ge(obj)) && !hasClass(obj, name)) {
        obj.className = (obj.className ? obj.className + ' ' : '') + name;
    }
}
function removeClass(obj, name) {
    if (obj = ge(obj)) {
        obj.className = trim((obj.className || '').replace((new RegExp('(\\s|^)' + name + '(\\s|$)')), ' '));
    }
}
