'use strict';

var pomelo = require('pomelo');
var MessageService = require('../services/MessageService');
var RoomManager = require('./RoomManager');
var PlayerManager = require('./PlayerManager');
var Role = require('./Role');

/**
 * 房间控制器
 */
var exp = module.exports;

const MAP_COUNT = 2;// 地图个数

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

// 启动游戏
exp.startupGame = function (room) {

	var channel = pomelo.app.get('channelService').createChannel('gameChannel'+room.id);//通道
	var roleDatas = [];

	room.roles = [];
	for (var i = room.players.length - 1; i >= 0; i--) {
		let player = room.players[i];
		let role = new Role({
			uid: player.uid,
			heroId: player.heroId,
			position: {x: 48, y: 48},
		});
		roleDatas.push(role.strip());

		room.roles.push(role);
		channel.add(player.uid, player.sid);
	}

	// 这里设置地图ID
	room.gameMapId = (room.mapId === 0) ? Math.floor(Math.random()*MAP_COUNT) : room.mapId-1;

	// 启动
	room.startup(channel, 60);

	// 通知进入游戏场景
	channel.pushMessage('onEnterGame', {roles: roleDatas, gameMapId: room.gameMapId});
};