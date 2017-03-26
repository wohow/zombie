
var consts = require('consts');

cc.Class({
    extends: cc.Component,

    properties: {
        nicknameTxt: cc.Label,
        heronameTxt: cc.Label,
        statusTxt: cc.Label
    },

    init: function (data) {
        this.uid = data.uid;
        this.nicknameTxt.string = data.nickname;
        this.heronameTxt.string = consts.HERO[data.heroId].name;
        this.updateStatus(data.status);
    },

    updateStatus: function (status) {
        this.statusTxt.string = status === 0 ? '加载中' : '完成';
        this.statusTxt.node.color = status === 0 ? cc.Color.WHITE : cc.Color.GREEN;
    }
});
