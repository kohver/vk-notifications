var textarea = ge('textarea');

textarea.focus();
addEvent('send-button', 'click', function() {
    var text = trim(textarea.value);
    if (text) {
        textarea.value = '';
        var notification = new Notification(1, Notification.MESSAGE, text);
        textarea.focus();
    } else {
        textarea.focus();
    }
});

var Notification = function(user, type, message) {
    var t = this;

    t.id = ++Notification.lastId;
    t.type = type;
    t.user = user;
    t.message = message;
    t.isHidden = true;

    Notification.collection[t.id] = t;
    t.show();
    return t;
};

Notification.prototype.show = function() {
    var t = this;
    t.isHidden = false;
    t.el = ce('div');
    t.el.className = Notification.className;
    t.el.style.zIndex = t.id;

    Notification.el.appendChild(t.el);

    switch(t.type) {
        case Notification.MESSAGE:
            t.makeMessageNotification();
            break;
        case Notification.LIKE:
            t.makeLikeNotification();
            break;
        default:
            return;
    }

    setTimeout(function() {
        t.el.style.marginBottom = 0;
        t.el.style.opacity = 1;
    }, 0);
};

Notification.prototype.makeMessageNotification = function() {
    var t = this;
    t.el.innerHTML =
        '<div class="history">' +
            '<div class="message">' +
                '<div class="photo">' +
                    '<img src="http://cs10308.userapi.com/u4718705/e_be62b8f2.jpg" />' +
                '</div>' +
                '<div class="text">' +
                    t.message.replace('\n', '<br>') +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="textarea-bg">' +
            '<div class="photo">' +
                '<img src="http://cs10308.userapi.com/u4718705/e_be62b8f2.jpg" />' +
            '</div>' +
            '<div class="textarea-wrap">' +
                '<textarea placeholder="Ответить..."></textarea>' +
            '</div>' +
        '</div>' +
    '';

    var textarea = t.el.childNodes[1].childNodes[1].childNodes[0];
    var history = t.el.childNodes[0];
    addEvent(textarea, 'focus', function() {
        addClass(t.el, 'active');
        t.clearHideTimeout();
    });
    addEvent(textarea, 'blur', function() {
        var text = trim(textarea.value);
        if (!text) {
            removeClass(t.el, 'active');
            t.setHideTimeout();
        }
    });
    addEvent(t.el, 'click', function() {
        textarea.focus();
    });
    addEvent(textarea, 'keyup', function(e) {
        var text = trim(textarea.value);
        if (e.keyCode == KEY.ENTER) {
            var message = ce('div');
            message.className = 'message';
            message.innerHTML =
                '<div class="photo">' +
                    '<img src="http://cs10308.userapi.com/u4718705/e_be62b8f2.jpg" />' +
                '</div>' +
                '<div class="text">' +
                    text.replace('\n', '<br>') +
                '</div>' +
            '';
            history.appendChild(message);
            message.style.marginBottom = -40 + 'px';
            textarea.value = '';
            setTimeout(function() {
                message.style.marginBottom = 0;
            }, 0);
        } else if (e.keyCode == KEY.ESC) {
            t.hide();
        }
    });
    //textarea.focus();
};

Notification.prototype.makeLikeNotification = function() {
    var t = this;
    addEvent(t.el, 'click', function() {
        t.hide();
    });
    addEvent(t.el, 'mouseover', function(e) {
        if (e.target == e.currentTarget) {
            t.clearHideTimeout();
        }
    });
    addEvent(t.el, 'mouseout', function(e) {
        if (e.target == e.currentTarget) {
            t.setHideTimeout();
        }
    });
    t.setHideTimeout();
};

Notification.prototype.hide = function() {
    var t = this;
    t.isHidden = true;
    t.el.style.opacity = 0;
    t.el.style.marginBottom = -getHeight(t.el) - 10 + 'px';
    setTimeout(function() {
        t.remove();
    }, 200);
};

Notification.prototype.remove = function() {
    var t = this;
    Notification.el.removeChild(t.el);
    delete Notification.collection[t.id];
    t = null;
};

Notification.prototype.clearHideTimeout = function() {
    var t = this;
    clearTimeout(t.timeout);
};

Notification.prototype.setHideTimeout = function() {
    var t = this;
    t.timeout = setTimeout(function() {
        if (!t.isHidden) {
            t.hide();
        }
    }, Notification.delay);
};

Notification.lastId = 0;
Notification.collection = {};
Notification.el = ge('notifications');
Notification.className = 'notification';
Notification.MESSAGE = 'message';
Notification.LIKE = 'like';
Notification.delay = 5000;
Notification.count = function() {
    return countObj(Notification.collection);
};
