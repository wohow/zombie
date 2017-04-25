
var utils = require('utils');
var global = require('global');
var net = require('net');

var input_sequence_number = 0;// 输入编号
var direction = {};

// 角色控制器
cc.Class({
    extends: cc.Component,

    onLoad: function () {
        this.enabled = false;
        this.roleInfo = this.node.getComponent('binRoleInfo');
    },

    init: function (mapControl) {
        this.mapControl = mapControl;
        direction = {x:0, y:0};
        this.status = 0; // 0.闲置 1.行走
        this.indicatorPos = cc.p(0,0);
        this.mouseLocation = cc.p(0,0);
        this.pendingInputs = [];
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        this.roleInfo.openIndicator();// 开启指示器
        this.enabled = true;
    },

    close: function () {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    onMouseDown: function (event) {
        var skillId = event.getButton() === 0 ? 0 : 1;
        if(!this.roleInfo.isCanUseSkill())
            return;
        if(!this.mapControl.isCanUseSkill(skillId))
            return;
        var startPos = this.roleInfo.getIndicatorPosition();
        var input = {
            skillId: skillId,
            startPos: {x: startPos.x, y: startPos.y},
            targetPos: {x: this.indicatorPos.x, y: this.indicatorPos.y},
        };
        net.send('connector.gameHandler.processInputs', {
            roomId: global.roomId,
            type: 'useSkill',
            input: input
        });
    },
    onMouseMove: function (event) {
        this.mouseLocation = event.getLocation();
    },

    onKeyDown: function(event){
        this.status = 1;
        this.onMove(event, 1);
    },
    onKeyUp: function(event){
        this.onMove(event, 0);
    },
    onMove: function(event, speed){
        switch(event.keyCode) {
            case cc.KEY.a:
            case cc.KEY.left: // 左
                direction.x = -1 * speed;
                break;
            case cc.KEY.d:
            case cc.KEY.right:// 右
                direction.x = 1 * speed;
                break;
            case cc.KEY.w:
            case cc.KEY.up: // 上
                direction.y = 1 * speed;
                break;
            case cc.KEY.s:
            case cc.KEY.down:// 下
                direction.y = -1 * speed;
                break;
        }
    },

    update: function(dt){
        // 刷新指示器
        this.indicatorPos = this.mapControl.node.convertToNodeSpace(this.mouseLocation);
        var indicatorDir = 90 - utils.rotation(this.node.position, this.indicatorPos);
        this.roleInfo.updateIndicator(indicatorDir);

        if(this.roleInfo.isPlayAnim || this.roleInfo.isDie)
            return;
        // 发送移动信息
        if(this.status === 0)
            return;
        var new_dt = dt;
        if(direction.x === 0 && direction.y === 0){
            this.status = 0;
            this.roleInfo.playAnim('idle');
        } else {
            this.roleInfo.playAnim('run');
            var arf = Math.abs(Math.abs(direction.x) - Math.abs(direction.y));
            if(arf === 0){// 这里说明要斜着走
                new_dt = dt * 0.7071;// Math.sin( Math.atan(dt/dt) ) = 0.7071067811865475;
            }
        }
        var pressTime = this.roleInfo.isCanMove({x: direction.x*new_dt, y: direction.y*new_dt});

        var input = {
            status: this.status,
            pressTime: pressTime,
            sequenceNumber: ++input_sequence_number,
        };
        net.send('connector.gameHandler.processInputs', {
            roomId: global.roomId,
            type: 'move',
            input: input
        });

        // 客户端预测
        this.roleInfo.applyMove(input.pressTime);

        // 记录每次的操作指令 方便后面做调和
        this.pendingInputs.push(input);
    },

    // 服务器调和
    serverReconciliation: function (lastSequenceNumber) {
        var i = 0;
        while (i < this.pendingInputs.length) {
            var input = this.pendingInputs[i];
            if (input.sequenceNumber <= lastSequenceNumber) {
                this.pendingInputs.splice(i, 1);
            } else {
                this.roleInfo.applyMove(input.pressTime);
                i++;
            }
        }
    },

});
