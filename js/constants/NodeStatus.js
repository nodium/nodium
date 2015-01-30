(function (context, undefined) {

// 'use strict';

var constants   = context.setNamespace('app.constants');

const NodeStatus = {
	ACCEPTED: 'accepted',
	DENIED: 'denied',
	PENDING: 'pending'
};

constants.NodeStatus = NodeStatus;

}(this));
