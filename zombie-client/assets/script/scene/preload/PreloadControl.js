
var consts = require('consts');
var global = require('global');
var EventDispatcher = require('EventDispatcher');
var EventType = require('EventType');
var net = require('net');

cc.Class({
    extends: cc.Component,

    properties: {
        playerPrefab: cc.Prefab,

        content: cc.Node,
    },

    onLoad: function () {
        this.entitys = [];

        var room = global.getCurRoom();
        for (var i = room.players.length - 1; i >= 0; i--) {
            this.addPlayer(room.players[i]);
        }
        ///
        var self = this;//
        self.onupdateloadgameCB = function (data) {
            self.updatePlayer(data);
        };
        EventDispatcher.listen(EventType.ON_UPDATELOADGAME, self.onupdateloadgameCB);

        // 预加载游戏
        cc.director.preloadScene('arena', function(){
            net.send('connector.roomHandler.gameLoadComplete', {time: Date.now()}, function(data){
                consts.rtt = Date.now() - data.time;
            });
        });
    },

    onDestroy: function () {
        EventDispatcher.remove(EventType.ON_UPDATELOADGAME, this.onupdateloadgameCB);
    },

    addPlayer: function (data) {
        var node = cc.instantiate(this.playerPrefab);
        node.parent = this.content;
        var bin = node.getComponent('binPreloadPlayer');
        bin.init(data);
        this.entitys.push(bin);
    },

    getEntity: function (uid) {
        var arr = this.entitys.filter((m)=> m.uid === uid);
        return arr.length === 0 ? null : arr[0];
    },

    updatePlayer: function (data) {
        var entity = this.getEntity(data.uid);
        entity.updateStatus(data.status);
    }

});
