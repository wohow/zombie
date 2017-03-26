
var global = require('global');
var EventDispatcher = require('EventDispatcher');
var EventType = require('EventType');
var net = require('net');
var code = require('code');
var Tip = require('Tip');

// 主界面
cc.Class({
    extends: cc.Component,

    properties: {
        nicknameTxt: cc.Label,
        peoplesTxt: cc.Label,
        heroBtnNode: cc.Node,

        lobbyNode: cc.Node,
        roomNode: cc.Node,
        heroNode: cc.Node,
    },

    onLoad: function () {
        this.nicknameTxt.string = global.nickname;
        this.curNode = this.lobbyNode;
        this.updateSumPeople();

        var self = this;
        //ON_UPDATESUMPEOPLE
        self.onupdatesumpeopleCB = function (data) {
            self.updateSumPeople();
        };
        EventDispatcher.listen(EventType.ON_UPDATESUMPEOPLE, self.onupdatesumpeopleCB);
        self.openroomuiCB = function (data) {
            self.lobbyNode.active = false;
            self.curNode = self.roomNode;
            self.curNode.active = true;
        };
        EventDispatcher.listen(EventType.OPEN_ROOMUI, self.openroomuiCB);
        self.openlistuiCB = function (data) {
            self.roomNode.active = false;
            self.curNode = self.lobbyNode;
            self.curNode.active = true;
        };
        EventDispatcher.listen(EventType.OPEN_LISTUI, self.openlistuiCB);

        // 这里先预加载 加载场景
        cc.director.preloadScene('preload');
    },

    onDestroy: function () {
        EventDispatcher.remove(EventType.OPEN_ROOMUI, this.openroomuiCB);
        EventDispatcher.remove(EventType.OPEN_LISTUI, this.openlistuiCB);
        EventDispatcher.remove(EventType.ON_UPDATESUMPEOPLE, this.onupdatesumpeopleCB);
    },

    // 点击英雄
    onClickHero: function () {
        this.heroBtnNode.active = false;
        this.curNode.active = false;
        this.heroNode.active = true;
    },

    // 点击返回 这里根据情况返回 大厅还是房间
    onClickBack: function (event, data) {
        if(data === 'room'){
            var self = this;
            net.send('connector.roomHandler.exitRoom', {}, function(data){
                if(data.code === code.OK){
                    global.roomId = 0;
                    if(self.roomNode.active){
                        self.roomNode.active = false;
                        self.curNode = self.lobbyNode;
                        self.curNode.active = true;
                    }
                } else {
                    Tip().showMessage(data.error);
                }
            });
        } else if(data === 'hero'){
            this.heroBtnNode.active = true;
            this.heroNode.active = false;
            this.curNode.active = true;
        }
    },

    updateSumPeople: function () {
        this.peoplesTxt.string = '在线人数：'+global.sumPeople;
    }

});
