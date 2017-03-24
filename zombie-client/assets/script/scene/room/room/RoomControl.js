
var consts = require('consts');
var global = require('global');
var EventDispatcher = require('EventDispatcher');
var EventType = require('EventType');
var Tip = require('Tip');

// 房间
cc.Class({
    extends: cc.Component,

    properties: {
    	playerPrefab: cc.Prefab,
    	ingamePrefab: cc.Prefab,

    	playerContent: cc.Node,
    	ingameContent: cc.Node,
        playerCountTxt: cc.Label,
        ingameCountTxt: cc.Label,

    	roomnameTxt: cc.Label,
    	roomNoTxt: cc.Label,
    	mapnameTxt: cc.Label,

    	startBtn: cc.Button,
    	startBtnName: cc.Label,
    },

    onLoad: function () {
    	var act1 = cc.fadeTo(1, 40);
    	var act2 = cc.fadeTo(1, 255);
    	var repeat = cc.repeatForever(cc.sequence(act1, act2));
    	this.startBtnName.node.runAction(repeat);
    },
    onDestroy: function () {
    	this.startBtnName.node.stopAllActions();
    },

    onEnable: function () {
        var room = global.getCurRoom();
        this.roomnameTxt.string = room.roomname;
        this.roomNoTxt.string = room.id;
        this.mapnameTxt.string = consts.MAP_NAME[room.mapId];

        this.playerContent.removeAllChildren();
        this.ingameContent.removeAllChildren();
        this.playerEntitys = [];
        this.ingameEntitys = [];
        for (var i = room.players.length - 1; i >= 0; i--) {
        	let player = room.players[i];
            let isCaptain = (player.uid === room.captainUid);
        	if(player.status === 0){
        		this.addPlayer(room.players[i], isCaptain);
        	} else {
        		this.addIngame(room.players[i], isCaptain);
        	}
        }

        // 看自己是不是队长
        this.updateCaptainBtn(room.captainUid);

        // 刷新人数
        this.updatePeoples();

        // 加入
        var self = this;
        self.onupdateroomCB = function (data) {
            var room = data.room;
            data = data.data;
            switch(data.status){
                case 0:// 加入
                	self.addPlayer(data.player, data.player.uid === room.captainUid);
                    self.updatePeoples();
                break;
                case 1:// 清空
                	// Tip().showMessage('房间被解散');
                    EventDispatcher.dispatch(EventType.OPEN_LISTUI);
                break;
                case 2:// 有人退出
                    self.remove(data.uid);
                    if(data.captainUid){
                    	self.updateCaptain(data.captainUid);
                    }
                    self.updatePeoples();
                break;
            }
        };
        EventDispatcher.listen(EventType.ON_UPDATEROOM, self.onupdateroomCB);
    },

    onDisable: function () {
        EventDispatcher.remove(EventType.ON_UPDATEROOM, this.onupdateroomCB);
    },

    // 添加一个玩家
    addPlayer: function (data, isCaptain) {
    	var node = cc.instantiate(this.playerPrefab);
    	node.parent = this.playerContent;
    	var bin = node.getComponent('binRoomPlayer');
    	bin.init(data);
        bin.setMe(global.uid === data.uid);
        bin.setCaptain(isCaptain);
    	this.playerEntitys.push(bin);
    },
    getPlayer: function (uid) {
    	var arr = this.playerEntitys.filter((m)=> m.uid === uid);
    	return arr.length === 0 ? null : arr[0];
    },

    // 添加一个游戏中玩家
    addIngame: function (data, isCaptain) {
    	var node = cc.instantiate(this.ingamePrefab);
    	node.parent = this.ingameContent;
    	var bin = node.getComponent('binRoomIngame');
    	bin.init(data);
        bin.setMe(global.uid === data.uid);
        bin.setCaptain(isCaptain);
    	this.ingameEntitys.push(bin);
    },
    getIngame: function (uid) {
    	var arr = this.ingameEntitys.filter((m)=> m.uid === uid);
    	return arr.length === 0 ? null : arr[0];
    },


    getEntity: function (uid) {
    	var player = this.getPlayer(uid);
    	if(!player){
    		player = this.getIngame(uid);
    	}
    	return player;
    },

    // 删除玩家
    remove: function (uid) {
    	var entity = this.getEntity(uid);
    	entity.node.destroy();
    },

    // 刷新队长按钮
    updateCaptainBtn: function (captainUid) {
        this.startBtn.interactable = (global.uid === captainUid);
        this.startBtnName.string = (global.uid === captainUid) ? '点击开始游戏' : '等待队长开始游戏';
    },

    // 刷新队长
    updateCaptain: function (uid) {
    	var player = this.getEntity(uid);
    	player.setCaptain(true);
        this.updateCaptainBtn(uid);
    },

    // 刷新人数
    updatePeoples: function () {
        this.playerCountTxt.string = '('+this.playerEntitys.length+')';
        this.ingameCountTxt.string = '('+this.ingameEntitys.length+')';
    }
});
