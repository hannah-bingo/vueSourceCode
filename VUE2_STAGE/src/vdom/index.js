const isReservedTag = (tag) => {
    return ['a','div','p','button','ul','li','span'].includes(tag)
}

// h() _c()
export function createElementVNode(vm, tag, data, ...children) {
    if(data == null) {
        return data = {}
    }
    let key = data.key
    if(key){
        delete data.key
    }
    return vnode(vm, tag, key, data, children)
}

function createComponentVnode(vm,tag,key,data,children,Ctor) {
    if(typeof Ctor === 'object') {
        console.log(vm.$options._base.extend(Ctor));
        bebugger
        Ctor = vm.constrcutor.extend(Ctor)
    }
    data.hook = {
        init() { // 稍后创建真实节点的时候，如果是组件则调用此init方法

        }
    }
    return vnode(vm,tag,key,dataq,children,null,{Ctor})
}
// _v();
export function createTextVNode() {
    return vnode(vm, undefined, undefined, undefined, undefined, text)
}

// ast一样嚒？ast做的是语法层面的转换，它描述的是语法本身（可以描述js，css，html）
// 我们的虚拟dom是描述的dom元素，可以增加一些自定义属性(描述dom)
function vnode(vm,tag,key,data,children,text){
    return {
        vm,
        tag,
        key,
        data,
        children,
        text
    }
}