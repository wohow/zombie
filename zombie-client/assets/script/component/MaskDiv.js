cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onEnable: function () {
        this.node.on('mousedown', this.callback);
        this.node.on('touchstart', this.callback);
    },

    onDisable: function () {
        this.node.off('mousedown', this.callback);
        this.node.off('touchstart', this.callback);
    },

    callback: function (event) {
        event.stopPropagation();
    }
});
