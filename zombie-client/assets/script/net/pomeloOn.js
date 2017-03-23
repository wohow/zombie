
var net = require('net');
var EventDispatcher = require('EventDispatcher');
var EventType = require('EventType');

cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad: function () {
        cc.game.addPersistRootNode(this.node);
    },

    start: function () {
        
    }
});
