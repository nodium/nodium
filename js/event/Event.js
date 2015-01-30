(function (context, undefined) {

    // 'use strict';

    var event = context.setNamespace('app.event');

    const Event = {
        CHANGE:     'change',
        CLICK:      'click',
        FOCUS_OUT:  'focusout',
        INPUT:      'input',
        KEY_DOWN:   'keydown',
        KEY_UP:     'keyup',
        MOUSE_DOWN: 'mousedown',
        MOUSE_DRAG: 'mousedrag',
        MOUSE_MOVE: 'mousemove',
        MOUSE_UP:   'mouseup',
        PASTE:      'paste',
        POP_STATE:  'popstate',
        SCROLL:     'scroll',
        SUBMIT:     'submit'
    };

    event.Event = Event;

}(this));