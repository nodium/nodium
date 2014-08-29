(function (window, undefined) {

// 'use strict';

var constants   = window.setNamespace('app.constants');

const NodeStatus = {
	ACCEPTED: 'accepted',
	DENIED: 'denied',
	PENDING: 'pending'
};

constants.NodeStatus = NodeStatus;

}(window));