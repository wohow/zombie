'use strict';


var Player = require('./Player');

/**
 * 游戏总管理
 */
var exp = module.exports;

var players = {};// 当前所有玩家

exp.createPlayer = function (uid, nickname, sid) {
	var player = new Player({
		uid: uid,
		sid: sid,
		nickname: nickname
	});
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


// 退出游戏
exp.userLeave = function (uid) {
	var player = players[uid];
	delete players[uid];
	return player;
}