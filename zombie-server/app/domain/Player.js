'use strict';

/**
 * 玩家
 */
module.exports = Player;

function Player(opts) {
	this.uid = opts.uid;
	this.sid = opts.sid;
	this.nickname = opts.nickname;
	this.heroId = 0;// 英雄ID

	this.roomId = 0;// 房间ID
}

Player.prototype.strip = function() {
	return {
		uid: this.uid,
		nickname: this.nickname,
		heroId: this.heroId,
		roomId: this.roomId,
	};
};