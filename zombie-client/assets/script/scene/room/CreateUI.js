
// 创建房间UI
cc.Class({
    extends: cc.Component,

    properties: {
        roomnameEdit: cc.EditBox,
        mapIndex: 0
    },

    onLoad: function () {

    },

    setFocus: function () {
        this.roomnameEdit.setFocus();
    },

    onClickMap: function (event, data) {
        var index = parseInt(data);
        if(index === this.mapIndex)
            return;
        this.mapIndex = index;
    },

    // 点击创建
    onClickCreate: function () {
        var roomname = this.roomnameEdit.string;
        roomname = roomname.trim();
        if(roomname === ''){
            Tip().showMessage('名字不能为空');
            return;
        }
        
    }
});
