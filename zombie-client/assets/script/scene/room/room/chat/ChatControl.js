
var net = require('net');
var global = require('global');
var EventDispatcher = require('EventDispatcher');
var EventType = require('EventType');
var Tip = require('Tip');

var MSG_ID = 0;
function getMsgId(){
    return global.uid + (++MSG_ID);
}

cc.Class({
    extends: cc.Component,

    properties: {
        msgPrefab: cc.Prefab,
        content: cc.Node,

        editBox: cc.EditBox,
    },

    onEnable: function () {
        this.lastMsg = {};
        this.content.removeAllChildren();
        var self = this;
        self.chatmsgCallback = function (data) {
            if(data.id === self.lastMsg.id){
                self.lastMsg.setColor(cc.Color.WHITE);
                self.lastMsg = {};
            } else {
                self.addMsg(data.id, data.nickname, data.content);
            }
        };
        EventDispatcher.listen(EventType.ON_CHATMSG, self.chatmsgCallback);

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    onDisable: function() {
        EventDispatcher.remove(EventType.ON_CHATMSG, this.chatmsgCallback);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    addMsg: function(id, name, msg){
        var prefab = cc.instantiate(this.msgPrefab);
        prefab.parent = this.content;
        var bin = prefab.getComponent('binChatMsg');
        bin.init(id, name, msg);
        this.content.y = Math.max((this.content.height - 700) + 350 + bin.node.height, 350);
        return bin;
    },

    onKeyUp: function (event) {
        if(event.keyCode == cc.KEY.enter){
            this.onClickSend();
        }
    },

    onClickSend: function () {
        var msg = this.editBox.string;
        msg = msg.trim();
        if(msg === ''){
            Tip().showMessage('发送内容不能为空');
            return;
        }
        this.editBox.string = '';
        this.editBox.setFocus();
        var msgId = getMsgId();
        this.lastMsg = this.addMsg(msgId, global.nickname, msg);
        this.lastMsg.setColor(new cc.Color(110,110,110));
        net.send('connector.roomHandler.sendChat', {id: msgId, content: msg});
    }
});
