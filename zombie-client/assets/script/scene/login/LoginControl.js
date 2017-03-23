
var Tip = require('Tip');
var SceneManager = require('SceneManager');
var net = require('net');
var code = require('code');

cc.Class({
    extends: cc.Component,

    properties: {
        nicknameEdit: cc.EditBox,
    },

    onLoad: function () {
        this.nicknameEdit.setFocus();
    },

    // 点击确定
    onClickOk: function () {
        var nickname = this.nicknameEdit.string;
        nickname = nickname.trim();
        if(nickname === ''){
            Tip().showMessage('名字不能为空');
            return;
        }
        SceneManager.load('room');
    }
});
