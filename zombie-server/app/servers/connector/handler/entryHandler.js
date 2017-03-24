'use strict';

var crc = require('crc');
var async = require('async');
var code = require('../../../consts/code');
var MessageService = require('../../../services/MessageService');
var PlayerManager = require('../../../domain/PlayerManager');
var RoomManager = require('../../../domain/RoomManager');
var RoomControl = require('../../../domain/RoomControl');

module.exports = function(app) {
  	return new Handler(app);
};

var Handler = function(app) {
  	this.app = app;
  	this.sid = app.get('serverId');
};

/**
 * 登陆
 */
Handler.prototype.login = function(msg, session, next) {
	var nickname = msg.nickname;
	var player;
	// 角色名字是否存在
	var self = this;
	async.waterfall([
		function(cb){

			if(PlayerManager.nameIsExist(nickname)){
				cb(new Error('名字已存在'));
			} else {

				let uid = Math.abs(crc.crc32(nickname)).toString();
				player = PlayerManager.createPlayer(uid, nickname, self.sid);

				// 先断开
				self.app.get('sessionService').kick(player.uid, cb);
			}
		}, function(cb){

			// bind
			session.bind(player.uid, cb);
		}
	], function(err, result){
		if(err){
			next(null, {code: code.FAIL, error: err.message});
			return;
		}
		// 监听离线
		session.on('closed', userLeave.bind(null, self.app));
		// 
		console.log(player.nickname, ' 进入游戏');

		var usds = PlayerManager.toUids(player.uid);

		next(null, {code: code.OK, player: player.strip(), rooms: RoomManager.toRooms(), sumPeople: usds.length+1});
		MessageService.pushMessageByUids(usds, 'onUpdateSumPeople', {sumPeople: usds.length+1});
	});
};

// 玩家离线
function userLeave(app, session){
	if(!session || !session.uid) {
		return;
	}
	
	var player = PlayerManager.userLeave(session.uid);
	if(!player){
		return;
	}
	// 还有在房间里面退出
	var room = RoomManager.getRoom(player.roomId);
	if(room){
		RoomControl.exitRoom(room, player);
	}

	var usds = PlayerManager.toUids();
	MessageService.pushMessageByUids(usds, 'onUpdateSumPeople', {sumPeople: usds.length});
	console.log(player.nickname, ' 退出游戏');
}