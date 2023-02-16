import {initMixin} from './init'
import { initLifeCycle } from './lifecycle';
import Watcher from './observe/watcher';
import { createElm, patch } from './vdom/patch';

// 将所有的方法都耦合在一起
function Vue(options) {    // options就是用户的选项
    // debugger
    // options就是用户的选项
    this._init(options)
}

initMixin(Vue);    // 扩展了init方法
initLifeCycle(Vue); 


// ---------------为了方便观察前后的虚拟节点---测试的-----------
let render1 = compileToFunction(`<div>{{name}}</div>`)
let vm1 = new Vue({data:{name:'zf'}})
let prevVnode = render1.call(vm1)
console.log(prevNode);



let render2 = compileToFunction(`<div key="a" style="color:red;background:blue">{{name}}</div>`)
let vm2 = new Vue({data:{name:'zf'}})
let nextVnode = render2.call(vm2)
console.log(prevNode);

// 直接将新的节点替换掉老的,不是直接替换，而是比较两个人的区别之后再替换,diff算法
// diff算法是一个平级比较的过程，父亲和父亲比对，儿子和儿子对比
setTimeout(() => {
    patch(prevVnode, nextVnode)
    let newEL = createElm(prevVnode)
    document.body.appendChild(newEL,el)
},1000)

Vue.prototype.$watch = function(exprOrFn,cb) {
    // firstname 
    // ()=>vm.firstname
    new Watcher()
}


export default Vue