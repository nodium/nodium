(function (use, undefined) {

    'use strict';

    var event = use('app.event'),
        Event;

    Event = {
        CHANGE:     'change',
        CLICK:      'click',
        FOCUS_OUT:  'focusout',
        KEY_DOWN:   'keydown',
        MOUSE_DOWN: 'mousedown',
        MOUSE_DRAG: 'mousedrag',
        MOUSE_MOVE: 'mousemove',
        MOUSE_UP:   'mouseup',
        POP_STATE:  'popstate',
        SCROLL:     'scroll',
        SUBMIT:     'submit'
    };

    event.Event = Event;

}(window.use));