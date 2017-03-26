
const MapControl = require('MapControl');
var consts = require('consts');
var net = require('net');
var global = require('global');


cc.Class({
    extends: cc.Component,

    properties: {
        rtt: cc.Label,
        maps: [cc.TiledMapAsset],

        mapControl: MapControl,

        
    },

    onLoad: function () {
        this.runRtt();
        this.room = global.getCurRoom();
    },

    //
    start: function () {
        // 开启碰撞
        cc.director.getCollisionManager().enabled = true;
        // cc.director.getCollisionManager().enabledDebugDraw = true;

        this.mapControl.init(this.room, this.maps[this.room.gameMapId]);
    },

    close: function () {
        cc.director.getCollisionManager().enabled = false;
        this.mapControl.close();
    },

    runRtt: function () {
        var self = this;
        self.rtt.string = consts.rtt+' ms';
        self.rttTick = function () {
            net.send('connector.gameHandler.rtt', {time: Date.now()}, function(data) {
                var rtt = Date.now() - data.time;
                self.rtt.string = rtt+' ms';
            });
        };
        self.schedule(self.rttTick, 5);// 每5秒提交一次rtt
    }
});
