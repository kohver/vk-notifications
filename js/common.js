function ge(elementId) {
    return (typeof elementId == 'string') ? document.getElementById(elementId) : elementId;
}

function geByName(elementName) {
    return document.getElementsByTagName(elementName);
}

function ce(tagName) {
    return document.createElement(tagName);
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
