
var utils = require('utils');
var Tween = require('TweenLite');
var Timeline = require('TimelineLite');
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
        this.node.opacity = 255;

        let tl = new Timeline();
        tl.add([
            Tween.to(this.node, 0.8, {y: pos.y+20}),
            Tween.to(this.node, 0.4, {opacity: 0, onComplete: ()=>{
                ObjectPool.destroy(this.node);
            }})
        ], '', 'sequence');
        tl.play();
    }
});
