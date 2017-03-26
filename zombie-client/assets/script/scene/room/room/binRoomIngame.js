cc.Class({
    extends: cc.Component,

    properties: {
        bgNode: cc.Node,
        nicknameTxt: cc.Label,
        isCaptain: cc.Node,
    },

    init: function (data) {
        this.uid = data.uid;
        this.nicknameTxt.string = data.nickname;
    },

    setMe: function (isMe) {
        this.bgNode.color = isMe ? new cc.Color(19,34,21,166) : new cc.Color(0,0,0,166);
    },

    setCaptain: function (isCaptain) {
        this.isCaptain.active = isCaptain;
    }
});
