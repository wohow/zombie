'use strict';


var Player = require('./Player');

/**
 * 玩家管理中心
 */
var exp = module.exports;

var players = {};// 当前所有玩家

exp.createPlayer = function (uid, nickname, sid) {
	var player = new Player({
		uid: uid,
		sid: sid,
		nickname: nickname
	});
	// 放入玩家列表
	players[uid] = player;
	return player;
};

exp.getPlayer = function (uid) {
	return players[uid];
};

// 名字是否存在
exp.nameIsExist = function (nickname) {
	for (var key in players) {
		if(players[key].nickname === nickname)
			return true;
	}
	return false;
}

// 返回所有玩家uids用于同步
exp.toUids = function (ignore) {
	var uids = [];
	for(var key in players){
		var value = players[key];
		if(value.uid === ignore)
			continue;
		uids.push({uid: value.uid, sid: value.sid});
	}
	return uids;
};

// 退出游戏
exp.userLeave = function (uid) {
	var player = players[uid];
	delete players[uid];
	return player;
};