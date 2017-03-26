
var utils = require('utils');
var Tween = require('TweenLite');
var ObjectPool = require('ObjectPool');

cc.Class({
    extends: cc.Component,

    properties: {
        txt: cc.Label,
    },

    init: function (pos, data) {
        this.txt.string = data;
        var x = utils.random(pos.x-10, pos.x+10);
        this.node.position = cc.p(x, pos.y);
        Tween.to(this.node, 0.8, {y: pos.y+20, onComplete: ()=>{
            ObjectPool.destroy(this.node);
        }});
    }
});
