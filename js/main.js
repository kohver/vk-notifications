/**
 * Модель всех пользователей
 * @param options
 */
var User = Class.extend({
    init: function(options) {
        var t = this;
        t.id = options.id + '';
        t.name = options.name + '';
        t.photo = options.photo + '';
    }
});

/**
 * Модель всех сообщений
 * @param options
 */
var Message = Class.extend({
    init: function(options) {
        if (typeof options != 'object') {
            throw new TypeError('Invalid options');
        }

        if (!(options.user instanceof User)) {
            throw new TypeError('Invalid user');
        }

        var t = this;
        t.text = options.text + '';
        t.user = options.user;
    }
});

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
    var lastLikeNotification;
    var user;
    var textarea = ge('textarea');
    var checkbox = ge('checkbox');
    textarea.focus();

    addEvent(textarea, 'keyup', function(e) {
        if (e.keyCode == KEY.ENTER && (e.ctrlKey || e.metaKey)) {
            sendMessageNotification();
        }
    });
    addEvent('send-button', 'click', function() {
        sendMessageNotification();
    });
    addEvent('like-button', 'click', function() {
        sendLikeNotification();
    });

    function sendLikeNotification() {
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

        if (lastLikeNotification &&
            !lastLikeNotification.isHidden &&
            user.id == lastLikeNotification.options.user.id)
        {
            lastLikeNotification.addLike();
        } else {
            lastLikeNotification = new LikeNotification({
                user: user
            });
        }
    }

    function sendMessageNotification() {
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
                message.user.id == lastMessageNotification.options.message.user.id)
            {
                lastMessageNotification.addMessage(message);
            } else {
                lastMessageNotification = new MessageNotification({
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
 * Базовый класс оповещений
 * @class Notification
 * @extends Class
 */
var Notification = Class.extend({
    init: function(options) {
        var t = this;

        t.id = ++Notification.lastId;
        t.options = options || {};
        t.isHidden = true;
        t.el = ce('div');
        t.el.className = Notification.className;
        t.el.style.zIndex = t.id;

        Notification.collection[t.id] = t;
        t.show();
    },

    show: function() {
        var t = this;
        Notification.el.appendChild(t.el);
        t.isHidden = false;
        t.makeElement();

        setTimeout(function() {
            t.el.style.marginBottom = 0;
            t.el.style.opacity = 1;
        }, 0);
    },

    hide: function() {
        var t = this;
        t.isHidden = true;
        t.el.style.opacity = 0;
        t.el.style.marginBottom = -getHeight(t.el) - 10 + 'px';
        setTimeout(function() {
            t.remove();
        }, 200);
    },

    remove: function() {
        var t = this;
        Notification.el.removeChild(t.el);
        delete Notification.collection[t.id];
    },

    clearHideTimeout: function() {
        var t = this;
        clearTimeout(t.timeout);
    },

    setHideTimeout: function() {
        var t = this;
        t.timeout = setTimeout(function() {
            if (!t.isHidden) {
                t.hide();
            }
        }, Notification.delay);
    },

    makeElement: function() {}
});

Notification.lastId = 0;
Notification.collection = {};
Notification.el = ge('notifications');
Notification.className = 'notification';
Notification.delay = 5000;
Notification.count = function() {
    return countObj(Notification.collection);
};

/**
 * Класс оповещений новых сообщений
 * @class MessageNotification
 * @extends Notification
 */
var MessageNotification = Notification.extend({
    makeElement: function() {
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
                        '<b>' + message.user.name + '</b><br>' +
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
    },

    addMessage: function(message) {
        if (!(message instanceof Message)) {
            throw new TypeError('Invalid message');
        }

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

        t.clearHideTimeout();
        t.setHideTimeout();
    }
});

/**
 * Класс оповещений Мне нравится
 * @class LikeNotification
 * @extends Notification
 */
var LikeNotification = Notification.extend({
    makeElement: function() {
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
                        '<b>' + user.name + '</b><br>' +
                        'постравил Вам лайк' +
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
    },

    addLike: function() {
        var t = this;
        var history = t.el.childNodes[0];
        var messageElement = ce('div');
        messageElement.className = 'message text-only';
        messageElement.innerHTML =
            '<div class="text">' +
                'Поставил еще лайк' +
            '</div>' +
            '';
        history.appendChild(messageElement);
        messageElement.style.marginBottom = -25 + 'px';
        setTimeout(function() {
            messageElement.style.marginBottom = 0;
        }, 0);

        t.clearHideTimeout();
        t.setHideTimeout();
    }
});
