
var net = require('net');
var code = require('code');
var Tip = require('Tip');
var global = require('global');
var EventDispatcher = require('EventDispatcher');
var EventType = require('EventType');

// 创建房间UI
cc.Class({
    extends: cc.Component,

    properties: {
        roomnameEdit: cc.EditBox,
        mapIndex: 0,
    },

    onLoad: function () {

    },

    setFocus: function () {
        this.roomnameEdit.setFocus();
    },

    clearRoomname: function () {
        this.roomnameEdit.string = '';
    },

    onClickMap: function (event, data) {
        var index = parseInt(data);
        if(index === this.mapIndex)
            return;
        this.mapIndex = index;
    },

    // 点击创建
    onClickCreate: function () {
        var roomname = this.roomnameEdit.string;
        roomname = roomname.trim();
        if(roomname === ''){
            Tip().showMessage('名字不能为空');
            return;
        }
        
        this.clearRoomname();
        net.send('connector.roomHandler.createRoom', {roomname: roomname, mapId: this.mapIndex}, function(data){
            if(data.code === code.OK){
                
                global.roomId = data.room.id;
                global.rooms.push(data.room);
                EventDispatcher.dispatch(EventType.OPEN_ROOMUI);
            } else {
                Tip().showMessage(data.error);
            }
        });
    }
});
