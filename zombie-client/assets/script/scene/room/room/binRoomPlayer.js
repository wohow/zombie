
var consts = require('consts');

cc.Class({
    extends: cc.Component,

    properties: {
        bgNode: cc.Node,
        nicknameTxt: cc.Label,
        heronameTxt: cc.Label,
        isCaptain: cc.Node,
    },

    init: function (data) {
        this.uid = data.uid;
        this.nicknameTxt.string = data.nickname;
        this.heronameTxt.string = consts.HERO[data.heroId].name;
    },

    setMe: function (isMe) {
        this.bgNode.color = isMe ? new cc.Color(19,34,21) : new cc.Color(0,0,0);
    },

    setCaptain: function (isCaptain) {
        this.isCaptain.active = isCaptain;
    }
});
