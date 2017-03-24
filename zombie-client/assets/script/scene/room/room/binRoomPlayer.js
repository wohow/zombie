cc.Class({
    extends: cc.Component,

    properties: {
        nicknameTxt: cc.Label,
        heronameTxt: cc.Label,
        isCaptain: cc.Node,
    },

    init: function (data) {
        this.uid = data.uid;
        this.nicknameTxt.string = data.nickname;
    },

    setMe: function (isMe) {
        this.node.color = isMe ? new cc.Color(0,60,50) : new cc.Color(0,0,0);
    },

    setCaptain: function (isCaptain) {
        this.isCaptain.active = isCaptain;
    }
});
