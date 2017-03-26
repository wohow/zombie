
const CreateUI = require('CreateUI');
const ListUI = require('ListUI');
var Tween = require('TweenLite');
var Timeline = require('TimelineLite');
var EventDispatcher = require('EventDispatcher');
var EventType = require('EventType');


/**
 * 房间控制中心
 */
cc.Class({
    extends: cc.Component,

    properties: {
        maskNode: cc.Node,

        menus: [cc.Toggle],
        contents: [cc.Node],
        curIndex: 0,

        listUI: ListUI,
        createUI: CreateUI
    },

    onEnable: function () {
        this.curIndex = 0;
        this.contents[0].y = 0;
        this.contents[1].y = 800;
        this.menus[0].isChecked = true;
        this.menus[1].isChecked = false;
        this.listUI.init();

        var self = this;
        // 创建
        self.oncreateroomCB = function (data) {
            self.listUI.addRoom(data);
        };
        EventDispatcher.listen(EventType.ON_CREATEROOM, self.oncreateroomCB);
        // 加入
        self.onupdateroomCB = function (data) {
            var room = data.room;
            data = data.data;
            switch(data.status){
                case 0:// 加入
                case 2:// 有人退出
                case 3:// 刷新状态
                    self.listUI.updateRoom(room);
                break;
                case 1:// 清空
                    self.listUI.removeRoom(room.id);
                break;
            }
        };
        EventDispatcher.listen(EventType.ON_UPDATEROOM, self.onupdateroomCB);
    },

    onDisable: function () {
        EventDispatcher.remove(EventType.ON_CREATEROOM, this.oncreateroomCB);
        EventDispatcher.remove(EventType.ON_UPDATEROOM, this.onupdateroomCB);
    },

    // 点击菜单
    onClickMenu: function (event, data) {
        var index = parseInt(data);
        if(index === this.curIndex)
            return;
        this.createUI.clearRoomname();
        this.maskNode.active = true;
        var content0 = this.contents[this.curIndex];
        var content1 = this.contents[index];
        content0.y = 0;
        content1.y = 800;
        this.curIndex = index;

        let tl = new Timeline();
        tl.add([
            Tween.to(content0, 0.25, {y: -800}),
            Tween.to(content1, 0.25, {y: 0, onComplete: ()=>{
                this.maskNode.active = false;
                if(index === 1){
                    this.createUI.setFocus();
                }
            }})
        ], '', 'start');
        tl.play();
    }

});
