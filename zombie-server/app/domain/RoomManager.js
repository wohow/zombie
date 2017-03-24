'use strict';

var Room = require('./Room');

/**
 * 房间管理中心
 */
var exp = module.exports;

var ROOM_ID = 0;
var rooms = [];// 所有房间列表

exp.toRooms = function () {
	var arr = rooms.map((m)=>{
		return m.strip();
	});
	return arr;
};

// 创建一个房间
exp.createRoom = function (player, roomname, mapId) {
	var room = new Room({
		id: ++ROOM_ID,
		roomname: roomname,
		mapId: mapId,
		captainUid: player.uid
	});
	room.addPlayer(player);
	rooms.push(room);
	return room;
};

// 获取房间
exp.getRoom = function (id) {
	var arr = rooms.filter((m)=> m.id === id);
	return arr.length === 0 ? null : arr[0];
};

// 删除房间
exp.removeRoom = function (id) {
	for (var i = rooms.length - 1; i >= 0; i--) {
		if(rooms[i].id === id){
			rooms.splice(i, 1);
			console.log(id, ' 房间被删除');
			return;
		}
	}
};


// 名字是否已经存在
exp.nameIsExist = function (name) {
	var arr = rooms.filter((m)=> m.roomname === name);
	return arr.length !== 0;
};