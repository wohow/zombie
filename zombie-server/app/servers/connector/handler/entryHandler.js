'use strict';

var crc = require('crc');
var PlayerManager = require('../../../domain/PlayerManager');

module.exports = function(app) {
  	return new Handler(app);
};

var Handler = function(app) {
  	this.app = app;
  	this.sid = app.get('serverId');
};

/**
 * New client entry.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.entry = function(msg, session, next) {
  next(null, {code: 200, msg: 'game server is ok.'});
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
			session.bind(deviceID, cb);
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
		next(null, {code: code.OK, player: player.strip(), rooms: });
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
	console.log(player.nickname, ' 退出游戏');
	// 还有在房间里面退出
	
}