'use strict';

var MessageService = require('../services/MessageService');
var RoomManager = require('./RoomManager');
var PlayerManager = require('./PlayerManager');

/**
 * 房间控制器
 */
var exp = module.exports;

// 退出房间
exp.exitRoom = function (room, player) {
	room.removePlayer(player);
	// 这里判断房间是否空了
	if(room.players.length === 0){
		
		RoomManager.removeRoom(room.id);// 删除这个房间
		MessageService.pushMessageByUids(PlayerManager.toUids(), 'onUpdateRoom', {roomId: room.id, status: 1});// 清空房间

	} else {
		var msg = {
			roomId: room.id,
			status: 2,
			uid: player.uid
		};
		if(player.uid === room.captainUid){// 这里移交队长 如果这个人是队长的话
			room.captainUid = room.players[0].uid;//默认第一个设置为下一个队长
			msg.captainUid = room.captainUid;
		}

		MessageService.pushMessageByUids(PlayerManager.toUids(), 'onUpdateRoom', msg);// 有人退出
	}
};