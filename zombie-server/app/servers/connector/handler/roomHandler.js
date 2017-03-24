'use strict';

var code = require('../../../consts/code');
var MessageService = require('../../../services/MessageService');
var RoomManager = require('../../../domain/RoomManager');
var PlayerManager = require('../../../domain/PlayerManager');
var RoomControl = require('../../../domain/RoomControl');

module.exports = function(app) {
  	return new Handler(app);
};

var Handler = function(app) {
  	this.app = app;
  	this.sid = app.get('serverId');
};

/**
 * 创建房间
 */
Handler.prototype.createRoom = function(msg, session, next) {
	var roomname = msg.roomname;
	var mapId = msg.mapId;

	if(RoomManager.nameIsExist(roomname)){
		next(null, {code: code.FAIL, error: '名字已存在'});
		return;
	}

	var player = PlayerManager.getPlayer(session.uid);
	if(player.roomId !== 0){
		next(null, {code: code.FAIL, error: '已经在房间里面了'});
		return;
	}

	// 开始创建
	var room = RoomManager.createRoom(player, roomname, mapId);
	var data = room.strip();

	next(null, {code: code.OK, room: data});

	// 同步其他玩家 
	MessageService.pushMessageByUids(PlayerManager.toUids(player.uid), 'onCreateRoom', {room: data});
};

/**
 * 加入房间
 */
Handler.prototype.joinRoom = function(msg, session, next) {
	var id = msg.roomId;

	var player = PlayerManager.getPlayer(session.uid);
	if(player.roomId !== 0){
		next(null, {code: code.FAIL, error: '已经在房间里面了'});
		return;
	}

	var room = RoomManager.getRoom(id);
	if(!room){
		next(null, {code: code.FAIL, error: '房间不存在'});
		return;
	}

	var p = room.addPlayer(player);

	next(null, {code: code.OK, roomId: room.id, player: p});

	// 同步其他玩家 
	MessageService.pushMessageByUids(PlayerManager.toUids(player.uid), 'onUpdateRoom', {roomId: room.id, status: 0, player: p});// 加入
};

/**
 * 退出房间
 */
Handler.prototype.exitRoom = function(msg, session, next) {

	var player = PlayerManager.getPlayer(session.uid);
	if(player.roomId === 0){
		next(null, {code: code.FAIL, error: '你还没有房间'});
		return;
	}

	var room = RoomManager.getRoom(player.roomId);
	if(room){
		RoomControl.exitRoom(room, player);
	}

	next(null, {code: code.OK});
};

/**
 * 发送聊天信息
 */
Handler.prototype.sendChat = function(msg, session, next) {
	var player = PlayerManager.getPlayer(session.uid);
	var room = RoomManager.getRoom(player.roomId);
	if(room){
		MessageService.pushMessageByUids(room.toUids(), 'onChatMsg', {id: msg.id, nickname: player.nickname, content: msg.content});
	}
};