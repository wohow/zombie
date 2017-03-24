
var consts = require('consts');
var Tip = require('Tip');
var net = require('net');
var code = require('code');
var global = require('global');
var SceneManager = require('SceneManager');

cc.Class({
    extends: cc.Component,

    properties: {
        nicknameEdit: cc.EditBox,
    },

    onLoad: function () {
        this.nicknameEdit.setFocus();
        net.connect(consts.connectorAddress, function(){ });
        net.onDisconnect(function () {
            Tip().showMessage('服务器断开');
        });
    },

    // 点击确定
    onClickOk: function () {
        var nickname = this.nicknameEdit.string;
        nickname = nickname.trim();
        if(nickname === ''){
            Tip().showMessage('名字不能为空');
            return;
        }

        net.send('connector.entryHandler.login', {nickname: nickname}, function(data){
            if(data.code === code.OK){
                global.initPlayer(data.player);
                global.rooms = data.rooms;
                global.sumPeople = data.sumPeople;
                SceneManager.load('room');
            } else {
                Tip().showMessage(data.error);
            }
        });
    }
});
