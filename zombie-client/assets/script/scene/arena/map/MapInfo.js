
var ObjectPool = require('ObjectPool');

// 单列
var instance = null;
module.exports = function(){
    return instance;
};

cc.Class({
    extends: cc.Component,

    properties: {
        tiledMap: cc.TiledMap,
        wallConllisionPrefab: cc.Prefab,// 墙的碰撞体

        itemNode: cc.Node,// 道具层
        roleNode: cc.Node,// 角色层
        bulletNode: cc.Node,// 子弹层
        hudNode: cc.Node,// hud层
        conllisionNode: cc.Node,// 碰撞层
    },

    onLoad: function () {
        instance = this;
    },

    initMap: function (mapAsset) {
        this.tiledMap.tmxAsset = mapAsset;
        this.groundNode = this.tiledMap.getLayer('ground');
        this.wallNode = this.tiledMap.getLayer('wall');

        // 格子大小
        this.girdSize = this.groundNode.getLayerSize();
        // console.log(this.girdSize);
        // tile大小
        this.tileSize = this.groundNode.getMapTileSize();
        this.tielSizeHalf = cc.p(this.tileSize.width*0.5, this.tileSize.height*0.5);

        // 给所有墙添加碰撞体
        for (var x = 0; x < this.girdSize.width; x++) {
            for (var y = 0; y < this.girdSize.height; y++) {
                if(this.wallNode.getTileGIDAt(x, y)){
                    let node = cc.instantiate(this.wallConllisionPrefab);
                    let cx = x, cy = this.girdSize.height-1-y;
                    node.position = cc.p(cx*this.tileSize.width, cy*this.tileSize.height);
                    this.conllisionNode.addChild(node);
                }
            }
        }
    },

    // 添加角色
    addRole: function (node, position) {
        node.parent = this.roleNode;
        node.position = cc.p(position);
    },

    // 添加子弹
    addBullet: function (nodeName, data) {
        var node = ObjectPool.create(nodeName);
        node.parent = this.bulletNode;
        var bin = node.getComponent('binBullet');
        bin.launch(data);
    },

    // 添加HUD
    addHUD: function (pos, msg) {
        var node = ObjectPool.create('HUDTxt');
        node.parent = this.hudNode;
        var bin = node.getComponent('binHUDTxt');
        bin.init(pos, msg);
    },


    // 检查是否碰撞
    isCollide: function(x, y){
        y = this.girdSize.height-1-y;
        return !!this.wallNode.getTileGIDAt(x, y);
    },

    // 是否和墙发生碰撞
    isWallCollide: function(position, direction){
        if(direction.x === 0 && direction.y === 0)
            return position;

        var x = position.x + direction.x,
            y = position.y + direction.y;

        var tx = (x - this.tielSizeHalf.x)/this.tileSize.width,
            ty = (y - this.tielSizeHalf.y)/this.tileSize.height;

        var ox = (position.x - this.tielSizeHalf.x)/this.tileSize.width,
            oy = (position.y - this.tielSizeHalf.y)/this.tileSize.height;
        var nx1 = Math.floor(ox),
            nx2 = Math.ceil(ox),
            ny1 = Math.floor(oy),
            ny2 = Math.ceil(oy);

        if(direction.x < 0){// 左
            let nx = Math.floor(tx);
            if(this.isCollide(nx, ny1) || this.isCollide(nx, ny2)){
                x = (nx+1)*this.tileSize.width + this.tielSizeHalf.x;
            }
        } else if(direction.x > 0){// 右
            let nx = Math.ceil(tx);
            if(this.isCollide(nx, ny1) || this.isCollide(nx, ny2)){
                x = (nx-1)*this.tileSize.width + this.tielSizeHalf.x;
            }
        }
        if(direction.y < 0){// 下
            let ny = Math.floor(ty);
            if(this.isCollide(nx1, ny) || this.isCollide(nx2, ny)){
                y = (ny+1)*this.tileSize.height + this.tielSizeHalf.y;
            }
        } else if(direction.y > 0){// 上
            let ny = Math.ceil(ty);
            if(this.isCollide(nx1, ny) || this.isCollide(nx2, ny)){
                y = (ny-1)*this.tileSize.height + this.tielSizeHalf.y;
            }
        }
        return cc.p(x, y);
    },

    //lateUpdate 刷新玩家层级关系
    lateUpdate: function (dt){
        var cannons = this.roleNode.getChildren();
        cannons.sort(function(a, b){
            return b.y - a.y;
        });
        for (var i = 0; i < cannons.length; i++) {
            cannons[i].setLocalZOrder(i)
        }
    }

});
