
var net = require('net');
var EventDispatcher = require('EventDispatcher');
var EventType = require('EventType');
var global = require('global');

cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad: function () {
        cc.game.addPersistRootNode(this.node);
    },

    start: function () {
        // 刷新服务器总人数
        net.on('onUpdateSumPeople', function(data){
            global.sumPeople = data.sumPeople;
            EventDispatcher.dispatch(EventType.ON_UPDATESUMPEOPLE);
        });

        // 有人创建房间
        net.on('onCreateRoom', function(data){
        	global.rooms.push(data.room);
        	EventDispatcher.dispatch(EventType.ON_CREATEROOM, data.room);
        })

        // 刷新房间信息
        net.on('onUpdateRoom', function (data) {
            var room = global.getRoom(data.roomId);
            if(!room){
                return;
            }
            switch(data.status){
                case 0:// 加入
                    room.players.push(data.player);
                break;
                case 1:// 清空
                    global.removeRoom(data.roomId);
                break;
                case 2:// 有人退出
                    for (var i = room.players.length - 1; i >= 0; i--) {
                        if(room.players[i].uid === data.uid){
                            room.players.splice(i, 1);
                            break;
                        }
                    }
                    if(data.captainUid){
                        room.captainUid = data.captainUid;
                    }
                break;
                case 3:// 刷新房间状态
                    room.status = data.roomStatus;
                break;
            }
            EventDispatcher.dispatch(EventType.ON_UPDATEROOM, {room: room, data: data});
        });
        // 聊天
        net.on('onChatMsg', function(data) {
            EventDispatcher.dispatch(EventType.ON_CHATMSG, data);
        });

        // 加载游戏
        net.on('onLoadGame', function(data){
            cc.director.loadScene('preload');// 直接跳转加载场景
        });

        // 更新加载游戏进度
        net.on('onUpdateLoadGame', function (data) {
            EventDispatcher.dispatch(EventType.ON_UPDATELOADGAME, data);
        });

        // 进入游戏
        net.on('onEnterGame', function (data) {
            var room = global.getCurRoom();
            for (var i = data.roles.length - 1; i >= 0; i--) {
                var role = data.roles[i];
                var player = global.getRoomPlayer(room, role.uid);
                // 设置游戏信息
                player.fightData = role;
            }
            room.gameMapId = data.gameMapId;// 游戏地图

            cc.director.loadScene('arena');// 直接跳转场景
        });

        // 每帧玩家的输入信息
        net.on('onReveal', function (data) {
            EventDispatcher.dispatch(EventType.ON_REVEAL, data);
        });

        // 同步玩家使用技能
        net.on('onUseSkill', function (data) {
            EventDispatcher.dispatch(EventType.ON_USESKILL, data);
        });

        // 同步玩家受到攻击
        net.on('onHit', function (data) {
            EventDispatcher.dispatch(EventType.ON_HIT, data);
        });

        // 同步玩家变异
        net.on('onVariation', function (data) {
            EventDispatcher.dispatch(EventType.ON_VARIATION, data);
        });
    }
});
