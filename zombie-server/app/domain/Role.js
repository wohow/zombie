'use strict';

var consts = require('../consts/consts');

/**
 * 游戏里面的角色
 */
module.exports = Role;

function Role(opts) {
	this.uid = opts.uid;
	this.heroId = opts.heroId;
	this.position = opts.position;
	
	var roleData = consts.role[this.heroId];
	this.variation = roleData.variation;// 变异值
	this.variationTime = roleData.variationTime;// 变异时间
	this.variationStartTime = 0;// 记录变异时间

	this.status = 0;// 0.闲置 1.移动 2.受击
	this.lastSequenceNumber = 0;// 输入编号
	this.yetSequenceNumber = 0;// 已经发送的编号


	this.updateInfo(roleData.hero);
}

// 刷新信息
Role.prototype.updateInfo = function(data) {
	this.hp = data.hp; // 血量
	this.attack = data.attack; // 攻击力
	this.moveSpeed = data.moveSpeed;// 移动速度
};

// 计算输入
Role.prototype.applyInput = function (input) {
	this.status = input.status;
	this.position.x += input.pressTime.x*this.moveSpeed;
	this.position.y += input.pressTime.y*this.moveSpeed;
	this.lastSequenceNumber = input.sequenceNumber;
};

// 受到伤害
Role.prototype.hit = function(damage) {
	this.hp = Math.max(this.hp - damage, 0);
	return damage;
};

// 感染
Role.prototype.startInfection = function() {
	this.variationStartTime = Date.now();
	console.log(this.uid, ' 被感染了');
	return this.variationTime;
};

// 刷新变异
Role.prototype.updateVariation = function() {
	if(this.variationStartTime === 0)
		return false;
	var t = Date.now() - this.variationStartTime;
	return t >= this.variationTime;
};

// 变异
Role.prototype.directVariation = function() {
	this.variation = -1;
	this.variationStartTime = 0;
	this.updateInfo(consts.role[this.heroId].zombie);
	console.log(this.uid, ' 变异了');
	return {
		uid: this.uid,
		hp: this.hp, // 血量
		attack: this.attack, // 攻击力
		moveSpeed: this.moveSpeed,// 移动速度
	};
};

// 是否死亡
Role.prototype.die = function() {
	return this.variation === -1 && this.hp <= 0;
};

// 返回玩家的当前状态
Role.prototype.state = function() {
	return {
		uid: this.uid,
		status: this.status,
		position: this.position,
		lastSequenceNumber: this.lastSequenceNumber
	};
};

Role.prototype.strip = function() {
	return {
		uid: this.uid,
		position: this.position,
		hp: this.hp, // 血量
		variation: this.variation,// 变异值
		attack: this.attack, // 攻击力
		moveSpeed: this.moveSpeed,// 移动速度
		status: this.status,
	};
};