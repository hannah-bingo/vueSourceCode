import 

export function createElm(vnode){
    let {tag,data,children,text} = vnode;
    if(typeof tag === 'string'){  // 标签
        vnode.el = document.createElement(tag)   // 将真实节点和虚拟节点对应起来，后续如果修改属性了
        patchProps(vnode.el,data);
        children.forEach(child => {
            vnode.el.appendChild( createElm(child) )
        })
    }else{
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}

function createComponentVnode(vm, tag, key, data, children, Ctor) {
    if(typeof Ctor === 'object') {
        Ctor = vm.$options._base.extend(Ctor)
    }
    data.hook = {
        init(vnode) {     // 稍后创造真实节点的时候，如果是组件则调用此init方法
            let instance = vnode.componentInstance = new vnode.componentOptions.Ctor
            instance.$mount();
        }
    }
    return vnode(vm, tag, key, data, children ,null, { Ctor })
}
export function patchProps(el,oldProps, props) {
    // 老的属性中有，新的没有，要删除老的
    let oldStyles = oldProps.style;
    let newStyles = props.style;
    for(let key in oldStyles) {
        if(!newStyles[key]) {   // style{color: 'red'}    
            el.style[key] = '';
        }
    }
    for(let key in oldProps) {
        if(!props[key]) {
            el.removeAttribute(key);
        }
    }
    for(let key in props) {
        if(key === 'style') {   // style{color: 'red'}
            for(let styleName in props.style){
                el.style[styleName] = props.style[styleName];
            }
        }else{
            el.setAttribute(key,props[key])
        }
    }
}

export function patch(olValue,vnode){
    if(!oldVNode) {    // 这就是组件的挂载
        return 
    }
    // 写的是初渲染流程
    const isRealElement = oldVNode.nodeType;    // 获取真实元素
    if(isRealElement){
        const elm = oldVNode;   // 获取真实元素
        const parentElm = elm.parentNode;    // 拿到父元素
        let newElm = createElm(vnode);
        parentElm.insertBefore(newELm, elm.nextSibing);
        parentElm.removeChild(elm);    // 删除老节

        return newElm
    }else{
        // 1. 两个节点不是同一个节点，直接删除老的换上新的（没有对比了）
        // 2. 两个节点是同一个节点（判断节点的tag和节点的key），比较两个节点的属性是否有差异（复用唠的节点，将差异的属性）
        // 3. 节点比较完毕后需要比较两人的儿子

        return patchVnode(oldVNode,vnode);
     
    }
}

function patchVnode() {
    if(!isSameVnode(oldNode, vnode)) {
        let el = createElm(vnode);
        // 用老父亲的父亲进行替换
        oldVNode.el.parentNode.replceChild(createElm(vnode),oldVNode.el)
    }

    let el = vnode.el = oldNode.el;   // 复用老节点的元素
    // 文本的情况，我们期望比较文本的内容
    if(!oldVNode.tag) {   // 是文本
        if(oldVNode.text !== vnode.text){
            el.textContent = vnode.text;   // 永别的文本覆盖掉老的
        }
    }

    // 是标签，我们需要对比标签的属性
    console.log(oldNode,vnode);
    patchProps(el,vnode.data,oldVNode)

    // 比较儿子节点，比较的时候，一方有儿子，一方没有儿子，两方都有儿子
    let oldCildren = oldVNode.children || []
    let newChildren = vnode.children || []

    if(oldCildren.length > 0 && newChildren.length > 0) {
        updateChildren(el,oldCildren,newChildren)
    }else if(newChildren.length > 0) {  // 没有老的，有新的
        mouthChildren(el, newChildren);
    }
    console.log(oldChildren,newChildren);
    return el;
}

function mouthChildren(el,newChildren) {
    for(let i = 0; i< newChildren.length; i++) {
        let child = newChildren[i];
        el.appendChild(createElm(child))
    }
}

function updateChildren(el,oldChildren,newChildren) {
    // 操作列表，经常会有push shift pop un... re  sort
    // vue2中采用双指针的方式，比较两个节点
    let oldStartIndex = 0;
    let newStartIndex = 0;
    let oldEndIndex = oldChildren.length -1;
    let newEndIndex = newChildren.length -1;

    let oldStartVnode = oldChildren[0];
    let newStartVnode = newChildren[0]; 
    let oldEndVnode = oldChildren[oldEndIndex]
    let newEndVnode = newChildren[newEndIndex]

    while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex)  {   // 有任何一个不满足则停止 || 有一个为true则继续
        // 双方有一方头指针，大于尾部指针刚停止循环
        if(isSameVnode(oldStartVnode,newStartVnode)){
            patchVnode(oldStartVnode, newStartVnode);    // 如果是相同节点，则递归比较子节点
            newStartVnode = newChildren[++newStartIndex]
            oldStartVnode = oldChildren[++oldStartIndex]

            // 比较开头节点
        }    // 如果是相同节点，则递归比较子节点

        // 交叉对比    abcd  ---》 dabc
        if(isSameVnode(oldEndIndex,newStartVnode)){
            patchVnode(oldEndVnode, newStartVnode);    // 如果是相同节点，则递归比较子节点
            newStartVnode = newChildren[--newStartIndex]
            // debugger;
            oldStartVnode = oldChildren[--oldStartIndex]
            el.insertBefore(oldEndVnode.el, oldStartVnode.el);     //将老的尾部移动到老的前面去
            // 比较开头节点
        } 
    }
    if(newStartIndex <= newEndIndex) {   // 多余的就插入进去
        for(let i = newStartIndex; i <= newEndIndex; i++) {
            let childEl = createElm(newChildren[i])
            // 这里可能是像后追加，还有可能是向前追加
            let another = newChildren[newEndIndex + 1] ? null : newChildren[newEndIndex + 1].el;     // 获取下一个元素
            el.insertBefore(childEl,anchor);     // anchor为null的时候则会认为是appendChild
        }
    }
    if(newStartIndex <= newEndIndex) {   // 多余的就插入进去
        for(let i = oldStartIndex; i <= oldEndIndex; i++) {
            let childEl = oldChildren[i].el
            // 这里可能是像后追加，还有可能是向前追加
            newChildren[newEndIndex + 1]
            el.removeChild(childEl);
        }
    }
    console.log(oldStartVnode, newStartVnode, oldEndVnode, newEndVnode);
}