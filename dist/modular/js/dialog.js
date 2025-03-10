/*
 * Gijgo Dialog v1.9.10
 * http://gijgo.com/dialog
 *
 * Copyright 2014, 2018 gijgo.com
 * Released under the MIT license
 */
/* global window alert jQuery */
/**  */gj.dialog = {
    plugins: {},
    messages: {}
};

gj.dialog.config = {
    base: {
        /** If set to true, the dialog will automatically open upon initialization.
         * If false, the dialog will stay hidden until the open() method is called.         */        autoOpen: true,

        /** Specifies whether the dialog should have a close button in right part of dialog header.         */        closeButtonInHeader: true,

        /** Specifies whether the dialog should close when it has focus and the user presses the escape (ESC) key.         */        closeOnEscape: true,

        /** If set to true, the dialog will be draggable by the title bar.         */        draggable: true,

        /** The height of the dialog.         */        height: 'auto',

        /** The language that needs to be in use.         */        locale: 'en-us',

        /** The maximum height in pixels to which the dialog can be resized.         */        maxHeight: undefined,

        /** The maximum width in pixels to which the dialog can be resized.         */        maxWidth: undefined,

        /** The minimum height in pixels to which the dialog can be resized.         */        minHeight: undefined,

        /** The minimum width in pixels to which the dialog can be resized.         */        minWidth: undefined,

        /** If set to true, the dialog will have modal behavior.
         * Modal dialogs create an overlay below the dialog, but above other page elements and you can't interact with them.         */        modal: false,

        /** If set to true, the dialog will be resizable.         */        resizable: false,

        /** If set to true, add vertical scroller to the dialog body.         */        scrollable: false,

        /** The title of the dialog. Can be also set through the title attribute of the html element.         */        title: undefined,

        /** The name of the UI library that is going to be in use. Currently we support Material Design and Bootstrap.         */        uiLibrary: undefined,

        /** The width of the dialog.         */        width: 300,

        style: {
            modal: 'gj-modal',
            content: 'gj-dialog-md',
            header: 'gj-dialog-md-header gj-unselectable',
            headerTitle: 'gj-dialog-md-title',
            headerCloseButton: 'gj-dialog-md-close',
            body: 'gj-dialog-md-body',
            footer: 'gj-dialog-footer gj-dialog-md-footer'
        }
    },

    bootstrap: {
        style: {
            modal: 'modal',
            content: 'modal-content gj-dialog-bootstrap',
            header: 'modal-header',
            headerTitle: 'modal-title',
            headerCloseButton: 'close',
            body: 'modal-body',
            footer: 'gj-dialog-footer modal-footer'
        }
    },

    bootstrap4: {
        style: {
            modal: 'modal',
            content: 'modal-content gj-dialog-bootstrap4',
            header: 'modal-header',
            headerTitle: 'modal-title',
            headerCloseButton: 'close',
            body: 'modal-body',
            footer: 'gj-dialog-footer modal-footer'
        }
    }
};
/**   */gj.dialog.events = {
    /**
     * Triggered when the dialog is initialized.
     *     */    initialized: function ($dialog) {
        $dialog.trigger("initialized");
    },

    /**
     * Triggered before the dialog is opened.     */    opening: function ($dialog) {
        $dialog.trigger("opening");
    },

    /**
     * Triggered when the dialog is opened.     */    opened: function ($dialog) {
        $dialog.trigger("opened");
    },

    /**
     * Triggered before the dialog is closed.     */    closing: function ($dialog) {
        $dialog.trigger("closing");
    },

    /**
     * Triggered when the dialog is closed.     */    closed: function ($dialog) {
        $dialog.trigger("closed");
    },

    /**
     * Triggered while the dialog is being dragged.     */    drag: function ($dialog) {
        $dialog.trigger("drag");
    },

    /**
     * Triggered when the user starts dragging the dialog.     */    dragStart: function ($dialog) {
        $dialog.trigger("dragStart");
    },

    /**
     * Triggered after the dialog has been dragged.     */    dragStop: function ($dialog) {
        $dialog.trigger("dragStop");
    },

    /**
     * Triggered while the dialog is being resized.     */    resize: function ($dialog) {
        $dialog.trigger("resize");
    },

    /**
     * Triggered when the user starts resizing the dialog.     */    resizeStart: function ($dialog) {
        $dialog.trigger("resizeStart");
    },

    /**
     * Triggered after the dialog has been resized.     */    resizeStop: function ($dialog) {
        $dialog.trigger("resizeStop");
    }
};

gj.dialog.methods = {

    init: function (jsConfig) {
        gj.widget.prototype.initJS.call(this, jsConfig, 'dialog');

        gj.dialog.methods.localization(this);
        gj.dialog.methods.initialize(this);
        gj.dialog.events.initialized(this);
        return this;
    },

    localization: function(dialog) {
        var data = gijgoStorage.get(dialog.element, 'gijgo');
        if (typeof data.title === 'undefined') {
            data.title = gj.dialog.messages[data.locale].DefaultTitle;
        }
    },

    getHTMLConfig: function () {
        var result = gj.widget.prototype.getHTMLConfig.call(this),
            attrs = this.attributes;
        if (attrs['title']) {
            result.title = attrs['title'].value;
        }
        return result;
    },

    initialize: function (dialog) {
        var data, header, body, footer;
        data = gijgoStorage.get(dialog.element, 'gijgo');

        gj.core.addClass(dialog.element, data.style.content);

        gj.dialog.methods.setSize(dialog.element, data);

        if (data.closeOnEscape) {
            document.addEventListener('keyup', function (e) {
                if (e.keyCode === 27) {
                    dialog.close();
                }
            });
        }

        body = dialog.element.querySelector('div[data-role="body"]');
        if (!body) {
            body = document.createElement('div');
            body.setAttribute('role', 'body');
            dialog.element.addChild(body);
        }
        gj.core.addClasses(body, data.style.body);

        header = gj.dialog.methods.renderHeader(dialog, data);

        footer = dialog.element.querySelector('div[data-role="footer"]');
        if (footer) {
            gj.core.addClasses(footer, data.style.footer);
        }

        dialog.querySelector('[data-role="close"]').addEventListener('click', function () {
            dialog.close();
        });

        if (gj.draggable) {
            if (data.draggable) {
                gj.dialog.methods.draggable(dialog, header);
            }
            if (data.resizable) {
                gj.dialog.methods.resizable(dialog);
            }
        }

        if (data.scrollable && data.height) {
            dialog.element.classList.add('gj-dialog-scrollable');
            dialog.element.addEventListener('opened', function () {
                var body = dialog.element.querySelector('div[data-role="body"]');
                body.style.height = (data.height - $header.outerHeight() - ($footer.length ? $footer.outerHeight() : 0)) + 'px';
            });            
        }

        gj.core.center(dialog.element);

        if (data.modal) {
            $dialog.wrapAll('<div data-role="modal" class="' + data.style.modal + '"/>');
        }

        if (data.autoOpen) {
            $dialog.open();
        }
    },

    setSize: function (dialog, data) {
        if (data.width) {
            dialog.element.width = data.width + 'px';
        }
        if (data.height) {
            dialog.element.height = data.height + 'px';
        }
    },

    renderHeader: function (dialog, data) {
        var header, title, closeButton;
        header = dialog.element.querySelector('div[data-role="header"]');
        if (!header) {
            header = document.createElement('div');
            header.setAttribute('role', 'header');
            dialog.element.parentElement.insertBefore(header, dialog.element);
        }
        gj.core.addClasses(header, data.style.header);

        title = header.querySelector('[data-role="title"]');
        if (!title) {
            title = document.createElement('h4');
            title.setAttribute('role', 'title');
            title.innerHTML = data.title;
            header.appendChild(title);
        }
        gj.core.addClasses(title, data.style.headerTitle);

        closeButton = header.querySelector('[data-role="close"]');
        if (!closeButton && data.closeButtonInHeader) {
            closeButton = document.createElement('button');
            $closeButton = $('<button type="button" data-role="close" title="' + gj.dialog.messages[data.locale].Close + '"><span>×</span></button>');
            $closeButton.addClass(data.style.headerCloseButton);
            $header.append($closeButton);
        } else if (closeButton && data.closeButtonInHeader === false) {
            closeButton.style.display = 'node';
        } else {
            closeButton.classList.add(data.style.headerCloseButton);
        }

        return $header;
    },

    draggable: function ($dialog, $header) {
        $dialog.appendTo('body');
        $header.addClass('gj-draggable');
        $dialog.draggable({
            handle: $header,
            start: function () {
                $dialog.addClass('gj-unselectable');
                gj.dialog.events.dragStart($dialog);
            },
            stop: function () {
                $dialog.removeClass('gj-unselectable');
                gj.dialog.events.dragStop($dialog);
            }
        });
    },

    resizable: function ($dialog) {
        var config = {
            'drag': gj.dialog.methods.resize,
            'start': function () {
                $dialog.addClass('gj-unselectable');
                gj.dialog.events.resizeStart($dialog);
            },
            'stop': function () {
                this.removeAttribute('style');
                $dialog.removeClass('gj-unselectable');
                gj.dialog.events.resizeStop($dialog);
            }
        };
        $dialog.append($('<div class="gj-resizable-handle gj-resizable-n"></div>').draggable($.extend(true, { horizontal: false }, config)));
        $dialog.append($('<div class="gj-resizable-handle gj-resizable-e"></div>').draggable($.extend(true, { vertical: false }, config)));
        $dialog.append($('<div class="gj-resizable-handle gj-resizable-s"></div>').draggable($.extend(true, { horizontal: false }, config)));
        $dialog.append($('<div class="gj-resizable-handle gj-resizable-w"></div>').draggable($.extend(true, { vertical: false }, config)));
        $dialog.append($('<div class="gj-resizable-handle gj-resizable-ne"></div>').draggable($.extend(true, {}, config)));
        $dialog.append($('<div class="gj-resizable-handle gj-resizable-nw"></div>').draggable($.extend(true, {}, config)));
        $dialog.append($('<div class="gj-resizable-handle gj-resizable-sw"></div>').draggable($.extend(true, {}, config)));
        $dialog.append($('<div class="gj-resizable-handle gj-resizable-se"></div>').draggable($.extend(true, {}, config)));
    },

    resize: function (e, newPosition) {
        var $el, $dialog, position, data, height, width, top, left, result = false;

        $el = $(this);
        $dialog = $el.parent();
        position = gj.core.position(this);
        offset = { top: newPosition.top - position.top, left: newPosition.left - position.left };
        data = $dialog.data();

        // TODO: Include margins in the calculations
        if ($el.hasClass('gj-resizable-n')) {
            height = $dialog.height() - offset.top;
            top = $dialog.offset().top + offset.top;
        } else if ($el.hasClass('gj-resizable-e')) {
            width = $dialog.width() + offset.left;
        } else if ($el.hasClass('gj-resizable-s')) {
            height = $dialog.height() + offset.top;
        } else if ($el.hasClass('gj-resizable-w')) {
            width = $dialog.width() - offset.left;
            left = $dialog.offset().left + offset.left;
        } else if ($el.hasClass('gj-resizable-ne')) {
            height = $dialog.height() - offset.top;
            top = $dialog.offset().top + offset.top;
            width = $dialog.width() + offset.left;
        } else if ($el.hasClass('gj-resizable-nw')) {
            height = $dialog.height() - offset.top;
            top = $dialog.offset().top + offset.top;
            width = $dialog.width() - offset.left;
            left = $dialog.offset().left + offset.left;
        } else if ($el.hasClass('gj-resizable-se')) {
            height = $dialog.height() + offset.top;
            width = $dialog.width() + offset.left;
        } else if ($el.hasClass('gj-resizable-sw')) {
            height = $dialog.height() + offset.top;
            width = $dialog.width() - offset.left;
            left = $dialog.offset().left + offset.left;
        }

        if (height && (!data.minHeight || height >= data.minHeight) && (!data.maxHeight || height <= data.maxHeight)) {
            $dialog.height(height);
            if (top) {
                $dialog.css('top', top);
            }
            result = true;
        }

        if (width && (!data.minWidth || width >= data.minWidth) && (!data.maxWidth || width <= data.maxWidth)) {
            $dialog.width(width);
            if (left) {
                $dialog.css('left', left);
            }
            result = true;
        }

        if (result) {
            gj.dialog.events.resize($dialog);
        }
        
        return result;
    },

    open: function ($dialog, title) {
        var $footer;
        gj.dialog.events.opening($dialog);
        $dialog.css('display', 'block');
        $dialog.closest('div[data-role="modal"]').css('display', 'block');
        $footer = $dialog.children('div[data-role="footer"]');
        if ($footer.length && $footer.outerHeight()) {
            $dialog.children('div[data-role="body"]').css('margin-bottom', $footer.outerHeight());
        }
        if (title !== undefined) {
            $dialog.find('[data-role="title"]').html(title);
        }
        gj.dialog.events.opened($dialog);
        return $dialog;
    },

    close: function ($dialog) {
        if ($dialog.is(':visible')) {
            gj.dialog.events.closing($dialog);
            $dialog.css('display', 'none');
            $dialog.closest('div[data-role="modal"]').css('display', 'none');
            gj.dialog.events.closed($dialog);
        }
        return $dialog;
    },

    isOpen: function ($dialog) {
        return $dialog.is(':visible');
    },

    content: function ($dialog, html) {
        var $body = $dialog.children('div[data-role="body"]');
        if (typeof (html) === "undefined") {
            return $body.html();
        } else {
            return $body.html(html);
        }
    },

    destroy: function ($dialog, keepHtml) {
        var data = $dialog.data();
        if (data) {
            if (keepHtml === false) {
                $dialog.remove();
            } else {
                $dialog.close();
                $dialog.off();
                $dialog.removeData();
                $dialog.removeAttr('data-type');
                $dialog.removeClass(data.style.content);
                $dialog.find('[data-role="header"]').removeClass(data.style.header);
                $dialog.find('[data-role="title"]').removeClass(data.style.headerTitle);
                $dialog.find('[data-role="close"]').remove();
                $dialog.find('[data-role="body"]').removeClass(data.style.body);
                $dialog.find('[data-role="footer"]').removeClass(data.style.footer);
            }
            
        }
        return $dialog;
    }
};
/**   */GijgoDialog = function (element, jsConfig) {
    var self = this,
        methods = gj.datepicker.methods;

    self.element = element;

    /**
     * Opens the dialog.     */    self.open = function (title) {
        return methods.open(this, title);
    };

    /**
     * Close the dialog.     */    self.close = function () {
        return methods.close(this);
    };

    /**
     * Check if the dialog is currently open.     */    self.isOpen = function () {
        return methods.isOpen(this);
    };

    /**
     * Gets or set the content of a dialog. Supports chaining when used as a setter.     */    self.content = function (content) {
        return methods.content(this, content);
    };

    /**
     * Destroy the dialog.     */    self.destroy = function (keepHtml) {
        return methods.destroy(this, keepHtml);
    };

    if ('dialog' !== element.getAttribute('data-type')) {
        methods.init.call(self, jsConfig);
    }

    return self;
};

GijgoDialog.prototype = new gj.widget();
GijgoDialog.constructor = gj.dialog.widget;

GijgoDialog.prototype.getHTMLConfig = gj.dialog.methods.getHTMLConfig;


if (typeof (jQuery) !== "undefined") {
    (function ($) {
        $.fn.dialog = function (method) {
            var widget;
            if (this && this.length) {
                if (typeof method === 'object' || !method) {
                    return new GijgoDialog(this, method);
                } else {
                    widget = new GijgoDialog(this, null);
                    if (widget[method]) {
                        return widget[method].apply(this, Array.prototype.slice.call(arguments, 1));
                    } else {
                        throw 'Method ' + method + ' does not exist.';
                    }
                }
            }
        };
    })(jQuery);
}
gj.dialog.messages['en-us'] = {
    Close: 'Close',
    DefaultTitle: 'Dialog'
};
gj.dialog.messages['bg-bg'] = {
    Close: 'Затваряне',
    DefaultTitle: 'Диалогов Прозорец'
};
gj.dialog.messages['fr-fr'] = {
    Close: 'Fermer',
    DefaultTitle: 'Dialogue'
};
gj.dialog.messages['de-de'] = {
    Close: 'Schlie\u00dfen',
    DefaultTitle: 'Dialog'
};
gj.dialog.messages['pt-br'] = {
    Close: 'Fechar',
    DefaultTitle: 'Caixa de diálogo'
};
gj.dialog.messages['ru-ru'] = {
    Close: 'Закрыть',
    DefaultTitle: 'Сообщение'
};
gj.dialog.messages['es-es'] = {
    Close: 'Cerrar',
    DefaultTitle: 'Titulo por defecto'
};
gj.dialog.messages['it-it'] = {
    Close: 'Chiudi',
    DefaultTitle: 'Dialogo'
};
gj.dialog.messages['tr-tr'] = {
    Close: 'Kapat',
    DefaultTitle: 'Diyalog'
};
gj.dialog.messages['ja-jp'] = {
    Close: '閉じる',
    DefaultTitle: 'ダイアログ'
};
gj.dialog.messages['zh-cn'] = {
    Close: '关闭',
    DefaultTitle: '对话框'
};
gj.dialog.messages['zh-tw'] = {
    Close: '關閉',
    DefaultTitle: '對話框'
};
gj.dialog.messages['hu-hu'] = {
    Close: 'Bezár',
    DefaultTitle: 'Dialógus'
};
