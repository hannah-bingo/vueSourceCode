import { createElementVNode, createTextVNode } from './vdom'

function createElm(vnode){
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
function patchProps(el,props) {
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

function patch(olValue,vnode){
    // 写的是初渲染流程
    const isRealElement = oldVNode.nodeType;    // 获取真实元素
    if(isRealElement){
        const elm = oldVNode;   // 获取真实元素
        const parentElm = lem.parentNode;    // 拿到父元素
        createElm(vnode);
    }else{
        // diff算法
    }
}
export function initLifeCycle(Vue){
    Vue.prototype._update = function(vnode) {   // 将vnode转换成真实dom
        const vm = this;
        const el = vm.$el;
        // patch既有初始化的功能，有用更新的公共
        patch(el, vnode)
        console.log('update');
    }
    // _c('div',{},...children)
    Vue.prototype._c = function(){
        return createElemenyVNode(this,...arguments)
    }
    // _v(text)
    Vue.prototype._v = function(){
        return createElementVNode(this,...arguments)
    }
    Vue.prototype._s = function(value){
        if(typeof value !=='object') return;
        return JSON.stringify(value);
    }
    Vue.prototype._render = function() {
        // 当渲染的时候回去实例中取值，我们就可以将属性和视图绑定在一起
        // console.log('render');
        const vm = this;
        return vm.$options.render.call(vm);  // 通过ast语法转移后生成的render方法
    }
    
}

export function mountComponent(vm,el) {   // 这里的el是通过querySelector
  // 1. 调用render方法产生虚拟节点，虚拟DOM
  vm._update(vm._render());   // vm.
  // vm.render();  // vm.$options.render() 虚拟节点
  
  // 2. 根据虚拟DOM产生真实DOM

  // 3. 插入到el元素中
}

// Vue核心流程: (1)创造了响应式数据  (2)模板转换成ast语法树
// （3）将astu语法树转换成render函数  //(4)后续每次数据跟新可以只执行render函数(无需再次执行ast转换的过程)

// render函数回去产生虚拟节点（使用响应式数据）
// 根据生成的虚拟节点创造真实的DOM

export function callHook(vm,hook){
    const handlers = vm.$options[hook];
    
}