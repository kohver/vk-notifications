function onDomReady() {
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

    addEvent(textarea, 'keydown', function(e) {
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
            lastLikeNotification.show();
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
            if (lastMessageNotification &&
                !lastMessageNotification.isHidden &&
                message.user.id == lastMessageNotification.options.message.user.id)
            {
                lastMessageNotification.addMessage(message);
            } else {
                lastMessageNotification = new MessageNotification({
                    message: message
                });
                lastMessageNotification.show();
            }
            textarea.focus();

            setTimeout(function() {
                textarea.value = '';
            }, 0);
        } else {
            textarea.focus();
        }
    }
}

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

/**
 * Шаблоны всех уведомлений
 */
var Templates = {
    historyMessage:
    '<div class="photo" title="{{userName}}">' +
        '<img src="{{userPhoto}}" />' +
    '</div>' +
    '<div class="name">' +
        '<a href="http://vk.com/id{{userId}}" target="_blank">{{userName}}</a>' +
    '</div>' +
    '<div class="text">{{text}}</div>',

    historyLike:
    '<div class="text">' +
        'Поставил Вам еще лайк' +
    '</div>',

    messageNotification:
    '<div class="history">' +
        '<div class="message not-viewer">' +
            '<div class="photo" title="{{userName}}">' +
                '<img src="{{userPhoto}}" />' +
            '</div>' +
            '<div class="name">' +
                '<a href="http://vk.com/id{{userId}}" target="_blank">{{userName}}</a>' +
            '</div>' +
            '<div class="text">{{text}}</div>' +
        '</div>' +
    '</div>' +
    '<div class="textarea-bg">' +
        '<div class="photo" title="{{viewerName}}">' +
            '<img src="{{viewerPhoto}}" />' +
        '</div>' +
        '<div class="textarea-wrap">' +
            '<textarea placeholder="Ответить..."></textarea>' +
        '</div>' +
    '</div>' +
    '<div class="close"></div>',

    likeNotification:
    '<div class="history">' +
        '<div class="message">' +
            '<div class="photo">' +
                '<img src="{{userPhoto}}" />' +
            '</div>' +
            '<div class="text">' +
                '<b><a href="http://vk.com/id{{userId}}" target="_blank">{{userName}}</a></b><br>' +
                'Поставил Вам лайк' +
            '</div>' +
        '</div>' +
    '</div>' +
    '<div class="close"></div>'
};

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
        t.el = ce('div', {
            className: Notification.className
        }, {
            zIndex: t.id
        });

        Notification.collection[t.id] = t;
    },

    show: function() {
        var t = this;
        Notification.el.appendChild(t.el);
        t.isHidden = false;
        t.makeElement();
        Animate.popOut(t.el);
    },

    hide: function() {
        var t = this;
        t.isHidden = true;
        Animate.popIn(t.el);
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
        t.clearHideTimeout();
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

        t.el.innerHTML = simpleTemplate(Templates.messageNotification, {
            userId: message.user.id,
            userName: message.user.name,
            userPhoto: message.user.photo,
            viewerName: viewer.name,
            viewerPhoto: viewer.photo,
            text: message.text.replace(/\n/g, '<br>')
        });

        var textarea = geBySelector('textarea', t.el);
        var closeButton = geBySelector('.close', t.el);

        addEvent(window, 'focus', function() {
            if (!t.isActive()) {
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
            if (!t.isActive()) {
                t.setHideTimeout();
            }
        });
        addEvent(textarea, 'keydown', function(e) {
            var text = trim(textarea.value);
            if (e.keyCode == KEY.ENTER) {
                var message = new Message({
                    text: text,
                    user: viewer
                });
                t.addMessage(message);

                setTimeout(function() {
                    textarea.value = '';
                }, 0);
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
        var history = geBySelector('.history', t.el);
        var messageElement = ce('div', {
            className: 'message ' + (viewer.id == message.user.id ? 'viewer' : 'not-viewer'),
            innerHTML: simpleTemplate(Templates.historyMessage, {
                userId: message.user.id,
                userName: message.user.name,
                userPhoto: message.user.photo,
                text: message.text.replace(/\n/g, '<br>')
            })
        });
        history.appendChild(messageElement);
        Animate.popOut(messageElement);

        t.clearHideTimeout();
        if (!t.isActive()) {
            t.setHideTimeout();
        }
    },

    isActive: function() {
        var t = this;
        var textarea = geBySelector('textarea', t.el);
        var text = trim(textarea.value);
        return text.length || hasClass(t.el, 'active') || document.activeElement == textarea;
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

        t.el.innerHTML = simpleTemplate(Templates.likeNotification, {
            userId: user.id,
            userName: user.name,
            userPhoto: user.photo
        });

        var closeButton = geBySelector('.close', t.el);
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
        var history = geBySelector('.history', t.el);
        var messageElement = ce('div', {
            className: 'message text-only',
            innerHTML: simpleTemplate(Templates.historyLike)
        });
        history.appendChild(messageElement);
        Animate.popOut(messageElement);

        t.setHideTimeout();
    }
});
