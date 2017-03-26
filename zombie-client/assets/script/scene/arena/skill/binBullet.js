
var Tween = require('TweenLite');
var Ease = require('EasePack');
var utils = require('utils');
var ObjectPool = require('ObjectPool');
var global = require('global');
var net = require('net');

// 子弹
cc.Class({
    extends: cc.Component,

    // 移动到目标位置
    launch: function(data){//attacker, skillId, startPos, targetPos, range
        this.isDestroy = false;
        this.attacker = data.attacker;
        this.skillId = data.skillId;
        this.node.opacity = 255;
        this.node.rotation = 90 - utils.rotation(data.startPos, data.targetPos);
        this.node.position = data.startPos;
        var distance = cc.pDistance(data.startPos, data.targetPos);
        var ratio = data.range / distance;
        var rx = (data.targetPos.x - data.startPos.x) * ratio;
        var ry = (data.targetPos.y - data.startPos.y) * ratio;
        var nx = rx + data.startPos.x;
        var ny = ry + data.startPos.y;

        Tween.to(this.node, 0.2, {x: nx, y: ny, ease: Ease.Linear.easeNone, onComplete: ()=>{
            this.toDestroy();
        }});
    },

    toDestroy: function(){
        this.isDestroy = true;
        Tween.killTweensOf(this.node, false);
        Tween.to(this.node, 0.4, {opacity: 0, onComplete: ()=>{
            ObjectPool.destroy(this.node);
        }});
    },

    // 碰撞
    onCollisionEnter: function (other, self) {
        if(this.isDestroy)
            return;
        if(other.node.group === 'role'){
            var bin = other.node.parent.parent.getComponent('binRoleInfo');
            if(bin.uid === this.attacker.uid)// 如果是自己 就直接返回
                return;
            // console.log(global.uid, this.attacker.uid);
            // 如果是自己 就告诉服务器
            if(global.uid === this.attacker.uid){
                var input = {
                    skillId: this.skillId, // 技能ID
                    attacked: bin.uid, // 被攻击者
                    part: other.tag,// 部位 0.头部 1.身体
                };
                net.send('connector.gameHandler.processInputs', {
                    roomId: global.roomId,
                    type: 'attack',
                    input: input
                });
            }

        } else if(other.node.group === 'wall'){
            // console.log('on collision wall');
        }
        this.toDestroy();
    }
});
