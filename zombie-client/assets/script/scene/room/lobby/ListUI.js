
var global = require('global');

// 房间列表
cc.Class({
    extends: cc.Component,

    properties: {
        roomPrefab: cc.Prefab,

        content: cc.Node
    },

    init: function () {
    	this.roomEntitys = [];
        this.content.removeAllChildren();
        for (var i = global.rooms.length - 1; i >= 0; i--) {
        	this.addRoom(global.rooms[i]);
        }
    },

    // 添加一个房间
    addRoom: function (data) {
    	var node = cc.instantiate(this.roomPrefab);
    	node.parent = this.content;
    	var bin = node.getComponent('binRoomInfo');
    	bin.init(data);
    	this.roomEntitys.push(bin);
    },

    // 
    getRoomEntity: function (id) {
    	var arr = this.roomEntitys.filter((m)=> m.roomId === id);
    	return arr.length === 0 ? null : arr[0];
    },

    // 更新房间
    updateRoom: function (data) {
    	var entity = this.getRoomEntity(data.id);
    	entity.init(data);
    },

    // 删除房间
    removeRoom: function (id) {
    	var entity = this.getRoomEntity(id);
    	entity.node.destroy();
    }
    
});
