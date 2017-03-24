'use strict';

/**
 * 玩家
 */
module.exports = Room;

function Room(opts) {
	this.id = opts.id;
	this.roomname = opts.roomname;
	this.mapId = opts.mapId;
	this.captainUid = opts.captainUid;

	this.players = [];// 玩家列表
	this.status = 0;// 0.准备中 1.游戏中
}

// 添加一个玩家
Room.prototype.addPlayer = function(player) {
	var data = {
		uid: player.uid,
		sid: player.sid,
		nickname: player.nickname,
		status: 0,// 0.房间中 1.游戏中
	};
	// 设置玩家的房间ID
	player.roomId = this.id;
	// 将玩家放入列表
	this.players.push(data);
	return data;
};

// 删除一个玩家
Room.prototype.removePlayer = function(player) {
	// 先清除玩家的房间ID
	player.roomId = 0;
	// 然后删除该玩家
	for (var i = this.players.length - 1; i >= 0; i--) {
		if(this.players[i].uid === player.uid){
			this.players.splice(i, 1);
			return;
		}
	}
};

Room.prototype.toUids = function() {
	return this.players.map((m)=>{
		return {uid: m.uid, sid: m.sid};
	});
};

Room.prototype.strip = function() {
	return {
		id: this.id,
		roomname: this.roomname,
		mapId: this.mapId,
		captainUid: this.captainUid,
		players: this.players,
		status: this.status
	};
};