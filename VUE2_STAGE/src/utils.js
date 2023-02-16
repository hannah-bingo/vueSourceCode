export function mergeOptions(parent, child) {
    const options = {};
    for(let key in parent) {   // 循环老的
        mergeField(key);
    }
    for(let key in child) {   // 循环老的
        if(!parent.hasOwnPerperty(key)) {
            mergeField(key);
        }
    }
    function mergeField(key) {
        // 策略模式： 减少if/else
        if(strats[key]){
            strats[key](parent[key], child[key])
        }else {
            // 如果不在
            options[key] = child[key] || parent[key];   // 
        }
    }
}


strats.components = function(parentVal,childVal) {
    const res = Object.create(parentVal);
    if(childVal) {
        for(let key in childVal) {
            res[key] = childVal[key];      // 返回的是构造的对象，可以拿到父亲原型上的属性，并且将儿子的都拷贝到自己身上
        }
    }
    return res;
}

export function mergeOptions