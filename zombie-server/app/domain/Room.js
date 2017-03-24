'use strict';

/**
 * 玩家
 */
module.exports = Room;

function Room(opts) {
	this.uid = opts.uid;
	this.sid = opts.sid;
	this.nickname = opts.nickname;

	this.roomId = 0;// 房间ID
}