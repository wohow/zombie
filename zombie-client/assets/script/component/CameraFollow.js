

var instance = null;
module.exports = function(){
    return instance;
};

// 摄像机跟随
cc.Class({
    extends: cc.Component,

    properties: {
        target: cc.Node,
        offset: cc.Vec2
    },

    onLoad: function () {
        instance = this;
        this.winW = cc.winSize.width;
        this.winH = cc.winSize.height;
        this.mapW = this.node.width;
        this.mapH = this.node.height;

        this._prevPos = cc.v2(0, 0);

        this.criticalPoint = cc.p((this.mapW-this.winW)*0.5, (this.mapH-this.winH)*0.5);
    },

    // 设置目标
    setTarget: function (node) {
        this.target = node;
        console.log(this.node.convertToWorldSpaceAR(this.target.position));
    },


    lateUpdate: function (dt) {
        if(!this.target)
            return;
        var targetX = this.target.x,
            targetY = this.target.y;

        if (this._prevPos.x !== targetX || this._prevPos.y !== targetY) {
            var appx = this.node._anchorPoint.x * this.mapW;
            var appy = this.node._anchorPoint.y * this.mapH;

            var worldx = (appx - this.node.x + this.offset.x) - (this.winW / 2);
            var worldy = (appy - this.node.y + this.offset.y) - (this.winH / 2);
            worldx = targetX - worldx;
            worldy = targetY - worldy;

            

            this.node.x += (this.winW / 2) - worldx;
            this.node.y += (this.winH / 2) - worldy;

            if(this.node.x < -this.criticalPoint.x)
                this.node.x = -this.criticalPoint.x;
            if(this.node.x > this.criticalPoint.x)
                this.node.x = this.criticalPoint.x;
            if(this.node.y < -this.criticalPoint.y)
                this.node.y = -this.criticalPoint.y;
            if(this.node.y > this.criticalPoint.y)
                this.node.y = this.criticalPoint.y;
            
            // if (worldx > 0) {
            //     worldx = 0;
            // }
            // if (this.winW - worldx > this.mapW) {
            //     worldx = this.winW - this.mapW;
            // }
            // if (worldy > 0) {
            //     worldy = 0;
            // }
            // if (this.winH - worldy > this.mapH) {
            //     worldy = this.winH - this.mapH;
            // }
            // var parentTrans = this.node.getNodeToWorldTransformAR();
            // this.node.x = worldx + appx - parentTrans.tx;
            // this.node.y = worldy + appy - parentTrans.ty;



            this._prevPos.x = targetX;
            this._prevPos.y = targetY;
        }
    }

});
