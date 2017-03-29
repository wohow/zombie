
var MapInfo = require('MapInfo');
var Timeline = require('TimelineLite');
var Tween = require('TweenLite');
var Ease = require('EasePack');
var ObjectPool = require('ObjectPool');

var HPW = 50;

// 角色信息
cc.Class({
    extends: cc.Component,

    properties: {
        entity: cc.Node,
        indicatorNode: cc.Node,// 指示器 
        animation: cc.Animation,
        collisions: [cc.BoxCollider],// 碰撞列表

        nicknameTxt: cc.Label,
        hpTxt: cc.Label,
        hpMask: [cc.Node],
        hpBar: cc.Node,
        variationBar: cc.Node,
    },

    onLoad: function () {
        this.indicatorNode.active = false;
        this.entitySpriteNode = this.entity.getChildByName('sprite');
    },

    init: function (data) {
        this.uid = data.uid;
        this.heroId = data.heroId;
        this.nicknameTxt.string = data.nickname;
        // 战斗数据
        var fightData = data.fightData;
        this.moveSpeed = fightData.moveSpeed;// 移动速度
        this.variation = fightData.variation;// 变异值
        this.maxHp = fightData.hp;
        this.initHpBar();
        // 是否在播放动画
        this.isPlayAnim = false;
        // 是否死亡
        this.isDie = false;
        // 是否僵尸
        this.isZombie = 0;
    },

    wrapAnimName: function(name){
        return 'hero'+this.heroId+'_'+name;
    },

    initHpBar: function () {
        var r = this.variation/this.maxHp;
        this.hpBar.width = HPW*r;
        this.hpBar.x = 0;
        this.variationBar.width = HPW*(1-r);
        this.variationBar.x = this.hpBar.width;
        this.hpMask[0].width = HPW;
        this.hpMask[1].width = HPW;
    },

    updateHp: function (hp) {
        // this.hpTxt.string = hp;
        var w = HPW * (hp / this.maxHp);
        this.hpMask[0].width = w;
        Tween.killTweensOf(this.hpMask[1], true);
        Tween.to(this.hpMask[1], 0.5, {width: w});
    },

    // 开启指示器
    openIndicator: function () {
        this.indicatorNode.active = true;
    },
    // 刷新指示器方向
    updateIndicator: function (dir) {
        Tween.killTweensOf(this.indicatorNode, true);
        Tween.to(this.indicatorNode, 0.01, {rotation: dir, ease: Ease.Linear.easeNone});
    },

    // 设置方向
    setFlipX: function (dir) {
        if(dir === 0)
            return;
        this.entity.scaleX = dir < 0 ? 1 : -1;
    },
    // 播放动画
    playAnim: function(animName){
        var name = this.wrapAnimName(animName);
        var animState = this.animation.getAnimationState(name);
        if(!animState)
            return;
        if(!animState.isPlaying){
            this.animation.play(name);
        }
    },

    // 是否可以移动
    isCanMove: function (pressTime) {
        var pos = MapInfo().isWallCollide(this.node.position, {x: pressTime.x*this.moveSpeed, y: pressTime.y*this.moveSpeed});
        var x = (pos.x - this.node.x)/this.moveSpeed;
        var y = (pos.y - this.node.y)/this.moveSpeed;
        return {x: x, y: y};
    },

    // 申请移动
    applyMove: function (pressTime) {
        this.setFlipX(pressTime.x);
        this.node.x += pressTime.x*this.moveSpeed;
        this.node.y += pressTime.y*this.moveSpeed;
    },

    // 是否可以使用技能
    isCanUseSkill: function (skillId) {
        return !this.isPlayAnim && !this.isDie;
    },

    // 使用技能
    useSkill: function (skillId, startPos, targetPos) {
        this.isPlayAnim = true;
        var animState = this.animation.play(this.wrapAnimName('attack'));
        animState.on('finished', this.playAnimFinished, this);
        // 改变角色方向
        this.setFlipX(targetPos.x - startPos.x);
        // 创建一个子弹
        MapInfo().addBullet('Arrow', {
            attacker: this,
            skillId: skillId,
            startPos: startPos,
            targetPos: targetPos,
            range: 300
        });
    },
    playAnimFinished: function () {
        this.isPlayAnim = false;
        this.playAnim('idle');
    },

    // 受到攻击
    hurt: function (damage, hp) {
        this.isPlayAnim = true;
        this.isDie = (hp <= 0 && this.isZombie);
        this.updateHp(hp);
        // 创建HUD
        MapInfo().addHUD(cc.p(this.node.x, this.node.y+60), '-'+damage);
        // 这里取消碰撞体 播发死亡动画
        if(this.isDie){
            for (var i = this.collisions.length - 1; i >= 0; i--) {
                this.collisions[i].enabled = false;
            }

        } else {// 播放受击动画 RED -> WHITE
            // this.entitySpriteNode.color = cc.Color.RED;
            // setTimeout(()=>{
            //     this.entitySpriteNode.color = cc.Color.WHITE;
            //     this.playAnimFinished();
            // }, 200);
            this.entitySpriteNode.stopAllActions();
            this.entitySpriteNode.color = cc.Color.WHITE;
            var atc1 = this.isZombie ? cc.tintTo(0.1, 255, 0, 0) : cc.tintTo(0.1, 0, 255, 0);
            var atc2 = cc.tintTo(0.1, 255, 255, 255);
            var atc3 = cc.callFunc(this.playAnimFinished, this);
            this.entitySpriteNode.runAction(cc.sequence(atc1, atc2, atc3));
        }
    },

    // 变异
    toVariation: function (hp, attack, moveSpeed) {
        this.isPlayAnim = true;
        this.maxHp = hp;
        this.variation = hp;
        this.isZombie = 1;
        this.initHpBar();
        // 播放变异动画

        // 设置变异模型

        var self = this;
        setTimeout(function(){
            self.playAnimFinished();
        }, 500);
    }

});
