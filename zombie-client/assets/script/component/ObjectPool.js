

// 单列
var instance = null;
function getInstance(){
    return instance;
};

// 对象池
cc.Class({
    extends: cc.Component,

    properties: {
        objects: [cc.Prefab],// 需要进行复用的对象
    },

    onLoad: function () {
        cc.game.addPersistRootNode(this.node);
        instance = this;
        this.prefabs = {};
        this.allInstances = {};
        for (var i = this.objects.length - 1; i >= 0; i--) {
            var obj = this.objects[i];
            this.prefabs[obj.name] = obj;
            this.allInstances[obj.name] = [];
        }
    },

    get: function (objName) {
        var pool = this.allInstances[objName];
        if(!pool){
            return null;
        }
        var arr = pool.filter((m)=> !m.active);
        if(arr.length > 0){
            return arr[0];
        } else {
            return this.createNode(objName);
        }
    },

    createNode: function (objName) {
        var prefab = this.prefabs[objName];
        var node = cc.instantiate(prefab);
        this.allInstances[objName].push(node);
        return node;
    }

});


var exp = module.exports;

// 创建一个node
exp.create = function(objName){
    var node = getInstance().get(objName);
    if(!node){
        console.log('createNode objName is null');
    }
    node.active = true;
    return node;
};

// 销毁一个node
exp.destroy = function(node){
    // node.removeFromParent();
    node.active = false;
};