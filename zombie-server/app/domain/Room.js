'use strict';

/**
 * 玩家
 */
module.exports = Room;

function Room(opts) {
	this.id = opts.id;
	this.roomname = opts.roomname;
	this.mapId = opts.mapId;
	this.captainUid = opts.captainUid;

	this.players = [];// 玩家列表
	this.status = 0;// 0.准备中 1.等待加载 2.准备开始游戏 3.开始游戏

	// 游戏中信息
	this.channel = null;// 同步通道
	this.roles = [];// 游戏里面的玩家数据
	this.gameMapId = 0;// 游戏里面的地图ID
}

// 添加一个玩家
Room.prototype.addPlayer = function(player) {
	var data = {
		uid: player.uid,
		sid: player.sid,
		nickname: player.nickname,
		heroId: player.heroId,
		status: 0,// 0.房间中 1.游戏中
	};
	// 设置玩家的房间ID
	player.roomId = this.id;
	// 将玩家放入列表
	this.players.push(data);
	return data;
};

// 获取玩家
Room.prototype.getPlayer = function(uid) {
	var arr = this.players.filter((m)=> m.uid === uid);
	return arr.length === 0 ? null : arr[0];
};

// 删除一个玩家
Room.prototype.removePlayer = function(player) {
	// 先清除玩家的房间ID
	player.roomId = 0;
	// 然后删除该玩家
	for (var i = this.players.length - 1; i >= 0; i--) {
		if(this.players[i].uid === player.uid){
			this.players.splice(i, 1);
			return;
		}
	}
	// 这里还要删除通道里面的
	if(this.channel){
		this.channel.leave(player.uid, player.sid);
	}
};

// 是否全部玩家都加载完成了
Room.prototype.isAllLoadComplete = function() {
	var arr = this.players.filter((m)=> m.status === 0);
	return arr.length === 0;
};

Room.prototype.toUids = function() {
	return this.players.map((m)=>{
		return {uid: m.uid, sid: m.sid};
	});
};

Room.prototype.strip = function() {
	return {
		id: this.id,
		roomname: this.roomname,
		mapId: this.mapId,
		captainUid: this.captainUid,
		players: this.players,
		status: this.status
	};
};
////////////////////////////////////////////////////////////////////

Room.prototype.getRole = function(uid) {
	var arr = this.roles.filter((m)=> m.uid === uid);
	return arr.length === 0 ? null : arr[0];
};

// 启动游戏
Room.prototype.startup = function(channel, fps) {
	this.channel = channel;
	var self = this;
	self.interval = setInterval(function(){
		self.update();
	}, 1000/fps);
};


// 每回合同步玩家 指令
Room.prototype.update = function() {
	var worldStates = [];
	var variations = [];
	for (var i = this.roles.length - 1; i >= 0; i--) {
		var role = this.roles[i];
		if(role.die()){
			continue;
		}
		// 这里塞入玩家输入
		if(role.yetSequenceNumber != role.lastSequenceNumber){
			role.yetSequenceNumber = role.lastSequenceNumber;
			worldStates.push(role.state());
		}
		// 这里刷新变异
		if(role.updateVariation()){
			variations.push(role.directVariation());
		}
	}
	if(worldStates.length > 0){
		this.channel.pushMessage('onReveal', {worldStates: worldStates});
	}
	if(variations.length > 0){
		this.channel.pushMessage('onVariation', {variations: variations});
	}
};

// 通知使用技能
Room.prototype.noticeUseSkill = function(uid, input) {
	this.channel.pushMessage('onUseSkill', {uid: uid, input: input});
};

// 攻击
Room.prototype.attack = function(attacker, input) {
	var attacked = this.getRole(input.attacked);
	if(attacked.die()){
		return;
	}
	var skillId = input.skillId;
	var part = input.part;// 部位
	var attack = Math.floor(Math.random()*attacker.attack + 3);
	var damage = attacked.hit(attack);

	var msg = {
		uid: attacked.uid,
		damage: damage,
		hp: attacked.hp,
	};
	// 这里死亡 直接变异
	if(attacked.hp <= 0 && attacked.variation != -1){
		msg.variation = attacked.directVariation();
	
	} else if(attacked.hp <= attacked.variation && attacked.variationStartTime === 0){// 感染
		msg.infection = attacked.startInfection();
	}
	this.channel.pushMessage('onHit', msg);
};


// 关闭房间
Room.prototype.close = function() {
	if(this.channel){
		this.channel.destroy();
		this.channel = null;
	}
	if(this.interval){
		clearInterval(this.interval);
		this.interval = null;
	}
};

