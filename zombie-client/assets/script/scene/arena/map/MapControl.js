
const RoleControl = require('RoleControl');
var global = require('global');
var EventDispatcher = require('EventDispatcher');
var EventType = require('EventType');
var consts = require('consts');
var Tween = require('TweenLite');
var Ease = require('EasePack');
var MapInfo = require('MapInfo');


// 地图控制器
cc.Class({
    extends: cc.Component,

    properties: {
        heroPrefabs: [cc.Prefab],// 英雄预制体
        zombiePrefabs: [cc.Prefab],// 僵尸预制体

        skillIconImgs: [cc.Sprite],// 技能
        skillcdImgs: [cc.Sprite],

        infectionNode: cc.Node,//
        infectionSpr: cc.Sprite,// 感染提示
    },

    init: function (room, mapAsset) {
        this.room = room;

        MapInfo().initMap(mapAsset);
        this.initRole();
        this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        this.node.on(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this.setSkillInfo(consts.HERO[global.heroId].hero);

        var self = this;
        self.revealCallback = function (data) {
            self.onUpdateWorldState(data.worldStates);
        };
        EventDispatcher.listen(EventType.ON_REVEAL, self.revealCallback);
        self.onuseskillCallback = function (data) {
            self.onUseSkill(data.uid, data.input);
        };
        EventDispatcher.listen(EventType.ON_USESKILL, self.onuseskillCallback);
        self.onhitCallback = function (data) {
            self.onHit(data.uid, data.damage, data.hp);
            if(data.variation){// 直接变异
                self.onVariation([data.variation]);
            }
            if(data.infection && global.uid === data.uid){// 感染
                self.infectionHint(data.infection);
            }
        };
        EventDispatcher.listen(EventType.ON_HIT, self.onhitCallback);
        self.onvariationCallback = function (data) {
            self.onVariation(data.variations);
        };
        EventDispatcher.listen(EventType.ON_VARIATION, self.onvariationCallback);
    },

    close: function (){
        EventDispatcher.remove(EventType.ON_REVEAL, this.revealCallback);
        EventDispatcher.remove(EventType.ON_USESKILL, this.onuseskillCallback);
        EventDispatcher.remove(EventType.ON_HIT, this.onhitCallback);
        EventDispatcher.remove(EventType.ON_VARIATION, this.onvariationCallback);

        this.node.off(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        this.node.off(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this.roleControl.close();
    },

    onMouseDown: function (event) {
        this.roleControl.onMouseDown(event);
    },
    onMouseMove: function (event) {
        this.roleControl.onMouseMove(event);
    },

    // 初始化角色
    initRole: function () {
        this.roles = [];
        for (var i = this.room.players.length - 1; i >= 0; i--) {
            let player = this.room.players[i];
            var prefab = cc.instantiate(this.heroPrefabs[player.heroId]);
            MapInfo().addRole(prefab, player.fightData.position);
            var bin = prefab.getComponent('binRoleInfo');
            bin.init(player);
            this.roles.push(bin);
            // 如果是自己 添加控制器
            if(player.uid === global.uid){
                this.roleControl = prefab.addComponent(RoleControl);
            }
        }

        this.roleControl.init(this);
    },

    getRole: function(uid){
        var arr = this.roles.filter((m)=> m.uid === uid);
        return arr.length === 0 ? null : arr[0];
    },

    removeRole: function (uid) {
        for (var i = this.roles.length - 1; i >= 0; i--) {
            var role = this.roles[i];
            if(role.uid === uid){
                role.node.destroy();
                this.roles.splice(i, 1);
                return;
            }
        }
    },

    // 刷新UI
    setSkillInfo: function (data) {
        this.skillcds = data.skillcds;// 技能CD
        this.skilliscdins = [false, false];
    },
    
    // 是否可以使用技能
    isCanUseSkill: function (skillId) {
        return !this.skilliscdins[skillId];
    },
    // 播放技能CD
    playSkillCD: function (skillId) {
        var img = this.skillcdImgs[skillId];
        var cd = this.skillcds[skillId];
        this.skilliscdins[skillId] = true;
        Tween.killTweensOf(img, true);
        Tween.from(img, cd, {fillRange: 1, ease: Ease.Linear.easeNone, onComplete: ()=>{
            this.skilliscdins[skillId] = false;
        }});
    },

    // 感染提示
    infectionHint: function (time) {
        this.infectionNode.active = true;
        this.infectionSpr.fillStart = 0;
        Tween.to(this.infectionSpr, time/1000, {fillStart: 1, ease: Ease.Linear.easeNone, onComplete: ()=>{
            this.infectionNode.active = false;
        }});
    },



    // 世界玩家状态更新
    onUpdateWorldState: function (worldStates) {
        for (var i = worldStates.length - 1; i >= 0; i--) {
            var state = worldStates[i];
            var role = this.getRole(state.uid);
            if(!role || role.isPlayAnim)
                continue;

            // 如果是自己 这里做服务器调和
            if(role.uid === global.uid){
                
                role.node.position = cc.p(state.position);
                this.roleControl.serverReconciliation(state.lastSequenceNumber);

            } else {// 设置从服务器来的 权威数据
                role.setFlipX(state.position.x - role.node.x);
                role.node.position = cc.p(state.position);
                if(state.status === 1){// 移动
                    role.playAnim('run');
                } else { // 闲置
                    role.playAnim('idle');
                }
            }
        }
    },

    // 玩家使用技能
    onUseSkill: function (uid, input) {
        var role = this.getRole(uid);
        if(!role)
            return;
        role.useSkill(input.skillId, input.startPos, input.targetPos);
        if(global.uid === role.uid){
            this.playSkillCD(input.skillId);
        }
    },

    // 玩家受到攻击
    onHit: function(uid, damage, hp) {
        var role = this.getRole(uid);
        if(role){
            role.hit(damage, hp);
        }
    },

    // 玩家变异
    onVariation: function (variations) {
        for (var i = variations.length - 1; i >= 0; i--) {
            var variation = variations[i];
            var role = this.getRole(variation.uid);
            if(!role)
                continue;
            role.toVariation(variation.hp, variation.attack, variation.moveSpeed);
            if(global.uid === role.uid){
                this.setSkillInfo(consts.HERO[global.heroId].zombie);
            }
        }
    },

});
