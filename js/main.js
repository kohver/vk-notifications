/**
 * Модель всех пользователей
 * @param options
 * @constructor
 */
var User = function(options) {
    var t = this;
    t.id = options.id + '';
    t.name = options.name + '';
    t.photo = options.photo + '';
};

/**
 * Модель всех сообщений
 * @param options
 * @constructor
 */
var Message = function(options) {
    var t = this;

    if (typeof options != 'object') {
        throw new TypeError('Invalid options');
    }

    if (!(options.user instanceof User)) {
        throw new TypeError('Invalid user');
    }

    t.text = options.text + '';
    t.user = options.user;
};

(function() {
    window.viewer = new User({
        id: '1',
        name: 'Павел Дуров',
        photo: 'http://cs7003.userapi.com/v7003815/22a1/xgG9fb-IJ3Y.jpg'
    });
    var defaultUser = new User({
        id: '4718705',
        name: 'Артём Кохвер',
        photo: 'http://cs10308.userapi.com/u4718705/e_be62b8f2.jpg'
    });

    var lastMessageNotification;
    var user;
    var textarea = ge('textarea');
    var checkbox = ge('checkbox');
    textarea.focus();

    addEvent(textarea, 'keyup', function(e) {
        if (e.keyCode == KEY.ENTER && (e.ctrlKey || e.metaKey)) {
            sendNotification();
        }
    });
    addEvent('send-button', 'click', function() {
        sendNotification();
    });
    addEvent('like-button', 'click', function() {
        new Notification(Notification.LIKE, {
            user: defaultUser
        });
    });

    function sendNotification() {
        var text = trim(textarea.value);
        var isNewUser = !!checkbox.checked;
        if (isNewUser) {
            user = new User({
                id: Math.random(),
                name: 'Случайный Пользователь',
                photo: 'http://vk.com/images/camera_c.gif'
            });
        } else {
            user = defaultUser;
        }

        if (text) {
            var message = new Message({
                user: user,
                text: text
            });
            textarea.value = '';
            if (lastMessageNotification &&
                !lastMessageNotification.isHidden &&
                message.user.id == lastMessageNotification.options.message.user.id) {
                lastMessageNotification.addMessage(message);
                lastMessageNotification.clearHideTimeout();
                lastMessageNotification.setHideTimeout();
            } else {
                lastMessageNotification = new Notification(Notification.MESSAGE, {
                    message: message
                });
            }
            textarea.focus();
        } else {
            textarea.focus();
        }
    }
})();

/**
 * Класс оповещений
 * @param type
 * @constructor
 */
var Notification = function(type) {
    var t = this;

    t.id = ++Notification.lastId;
    t.type = type;
    t.options = arguments[1] || {};
    t.isHidden = true;
    t.el = ce('div');
    t.el.className = Notification.className;
    t.el.style.zIndex = t.id;

    Notification.collection[t.id] = t;
    t.show();
};

Notification.prototype.show = function() {
    var t = this;
    t.isHidden = false;

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
    var message = t.options.message;

    if (!(message instanceof Message)) {
        throw new TypeError('Invalid message');
    }

    t.el.innerHTML =
        '<div class="history">' +
            '<div class="message">' +
                '<div class="photo" title="' + message.user.name + '">' +
                    '<img src="' + message.user.photo + '" />' +
                '</div>' +
                '<div class="text">' +
                    message.text.replace(/\n/g, '<br>') +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="textarea-bg">' +
            '<div class="photo" title="' + viewer.name + '">' +
                '<img src="' + viewer.photo + '" />' +
            '</div>' +
            '<div class="textarea-wrap">' +
                '<textarea placeholder="Ответить..."></textarea>' +
            '</div>' +
        '</div>' +
        '<div class="close"></div>' +
    '';

    var textarea = t.el.childNodes[1].childNodes[1].childNodes[0];
    var closeButton = t.el.childNodes[2];

    addEvent(window, 'focus', function() {
        var text = trim(textarea.value);
        if (!text && document.activeElement != textarea) {
            t.setHideTimeout();
        }
    });
    addEvent(window, 'blur', function() {
        t.clearHideTimeout();
    });
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
    addEvent(t.el, 'mouseover', function(e) {
        t.clearHideTimeout();
    });
    addEvent(t.el, 'mouseout', function(e) {
        var text = trim(textarea.value);
        if (!text && document.activeElement != textarea) {
            t.setHideTimeout();
        }
    });
    addEvent(textarea, 'keyup', function(e) {
        var text = trim(textarea.value);
        if (e.keyCode == KEY.ENTER) {
            textarea.value = '';
            var message = new Message({
                text: text,
                user: viewer
            });
            t.addMessage(message)
        } else if (e.keyCode == KEY.ESC) {
            t.hide();
        }
    });
    addEvent(closeButton, 'mousedown', function(e) {
        t.hide();
        e.stopPropagation();
    });
    t.setHideTimeout();
};

Notification.prototype.addMessage = function(message) {
    var t = this;
    var history = t.el.childNodes[0];
    var messageElement = ce('div');
    messageElement.className = 'message';
    messageElement.innerHTML =
        '<div class="photo" title="' + message.user.name + '">' +
            '<img src="' + message.user.photo + '" />' +
        '</div>' +
        '<div class="text">' +
            message.text.replace(/\n/g, '<br>') +
        '</div>' +
    '';
    history.appendChild(messageElement);
    messageElement.style.marginBottom = -40 + 'px';
    setTimeout(function() {
        messageElement.style.marginBottom = 0;
    }, 0);
};

Notification.prototype.makeLikeNotification = function() {
    var t = this;
    var user = t.options.user;

    if (!(user instanceof User)) {
        throw new TypeError('Invalid user');
    }

    t.el.innerHTML =
        '<div class="history">' +
            '<div class="message">' +
                '<div class="photo">' +
                    '<img src="' + user.photo + '" />' +
                '</div>' +
                '<div class="text">' +
                    'Вам постравили лайк' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="close"></div>' +
    '';

    var closeButton = t.el.childNodes[1];
    addClass(t.el, 'like');
    addEvent(t.el, 'mouseover', function(e) {
        t.clearHideTimeout();
    });
    addEvent(t.el, 'mouseout', function(e) {
        t.setHideTimeout();
    });
    addEvent(closeButton, 'mousedown', function(e) {
        t.hide();
        e.stopPropagation();
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
