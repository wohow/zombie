
var consts = require('consts');
var net = require('net');
var code = require('code');
var Tip = require('Tip');
var global = require('global');
var EventDispatcher = require('EventDispatcher');
var EventType = require('EventType');

// 
cc.Class({
    extends: cc.Component,

    properties: {
        numberTxt: cc.Label,
        roomnameTxt: cc.Label,
        mapnameTxt: cc.Label,
        peoplesTxt: cc.Label,
        statusTxt: cc.Label
    },

    init: function (data) {
        this.roomId = data.id;
        this.numberTxt.string = data.id;
        this.roomnameTxt.string = data.roomname;
        this.mapnameTxt.string = consts.MAP_NAME[data.mapId];
        this.peoplesTxt.string = data.players.length;
        this.statusTxt.string = consts.STATUS_NAME[data.status];
        this.statusTxt.node.color = consts.STATUS_COLOR[data.status];
    },

    // 点击加入
    onClickJoin: function () {

        if(global.roomId !== 0){
            Tip().showMessage('你已经有房间了');
            return;
        }

        net.send('connector.roomHandler.joinRoom', {roomId: this.roomId}, function(data){
            if(data.code === code.OK){
                var room = global.getRoom(data.roomId);
                if(room){
                    global.roomId = data.roomId;
                    room.players.push(data.player);
                    EventDispatcher.dispatch(EventType.OPEN_ROOMUI);
                } else {
                    Tip().showMessage('加入失败');
                }
            } else {
                Tip().showMessage(data.error);
            }
        });
    }
});
