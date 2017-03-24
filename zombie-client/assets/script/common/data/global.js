/**
 * 自己信息
 */
var exp = module.exports;

// 玩家信息
exp.uid = '';
exp.nickname = '';
exp.roomId = 0;

// 当前服务器总人数
exp.sumPeople = 0;

// 房间信息
exp.rooms = [];

// 初始化玩家信息
exp.initPlayer = function (data) {
	this.uid = data.uid;
	this.nickname = data.nickname;
	this.roomId = data.roomId;
};

// 获取一个房间
exp.getRoom = function (id) {
	var arr = this.rooms.filter((m)=> m.id === id);
	return arr.length === 0 ? null : arr[0];
};

exp.removeRoom = function (id) {
	for (var i = this.rooms.length - 1; i >= 0; i--) {
		if(this.rooms[i].id === id){
			this.rooms.splice(i, 1);
			return;
		}
	}
};

// 获取当前房间信息
exp.getCurRoom = function () {
	return this.getRoom(this.roomId);
};
