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
};

/**
 * RTT5秒请求一次
 */
Handler.prototype.rtt = function(msg, session, next) {
	next(null, {time: msg.time});
};

/**
 * 提交输入
 */
Handler.prototype.processInputs = function(msg, session, next) {
	var room = RoomManager.getRoom(msg.roomId);
	var role = room.getRole(session.uid);
	switch(msg.type){
		case 'move':// 移动
			role.applyInput(msg.input);
		break;
		case 'useSkill':// 使用技能
			room.noticeUseSkill(role.uid, msg.input);
		break;
		case 'attack':// 攻击
			room.attack(role, msg.input);
		break;
	}
};
