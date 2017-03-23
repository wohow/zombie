
const CreateUI = require('CreateUI');
const ListUI = require('ListUI');
var Tween = require('TweenLite');
var Timeline = require('TimelineLite');


/**
 * 房间控制中心
 */
cc.Class({
    extends: cc.Component,

    properties: {
        maskNode: cc.Node,
        contents: [cc.Node],
        curIndex: 0,

        createUI: CreateUI,
        listUI: ListUI
    },

    onLoad: function () {
    },

    // 点击菜单
    onClickMenu: function (event, data) {
        var index = parseInt(data);
        if(index === this.curIndex)
            return;
        this.maskNode.active = true;
        var content0 = this.contents[this.curIndex];
        var content1 = this.contents[index];
        content0.y = 0;
        content1.y = 800;
        this.curIndex = index;

        let tl = new Timeline();
        tl.add([
            Tween.to(content0, 0.3, {y: -800}),
            Tween.to(content1, 0.3, {y: 0, onComplete: ()=>{
                this.maskNode.active = false;
                if(index === 1){
                    this.createUI.setFocus();
                }
            }})
        ], '', 'start');
        tl.play();
    }

});
