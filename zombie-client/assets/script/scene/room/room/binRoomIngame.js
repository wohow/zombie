cc.Class({
    extends: cc.Component,

    properties: {
        nicknameTxt: cc.Label,
        isCaptain: cc.Node,
    },

    init: function (data) {
        this.uid = data.uid;
        this.nicknameTxt.string = data.nickname;
    },

    setMe: function (isMe) {
        this.node.color = isMe ? cc.c4(0,60,50,166) : cc.c4(0,0,0,166);
    },

    setCaptain: function (isCaptain) {
        this.isCaptain.active = isCaptain;
    }
});
