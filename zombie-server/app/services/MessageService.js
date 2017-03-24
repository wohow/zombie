'use strict';

var pomelo = require('pomelo');

/**
 * 消息推送类
 * @type {[type]}
 */
var exp = module.exports;

exp.pushMessageByUids = function (uids, route, msg) {
	if(!uids || uids.length === 0)
		return;
	pomelo.app.get('channelService').pushMessageByUids(route, msg, uids, errHandler);
};

exp.pushMessageByUid = function (uid, route, msg) {
	exp.pushMessageByUids([uid], route, msg);
};

exp.pushMessageToPlayer = function (player, route, msg) {
  	exp.pushMessageByUids([{uid: player.uid, sid: player.serverId}], route, msg);
};

function errHandler(err, fails){
	if(!!err){
		console.error('Push Message error! %j', err.stack);
	}
}