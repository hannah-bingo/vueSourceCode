import Dep from "../../../up主源码/jiagouke5-vue-master/1.vue-render/src/observe/dep";

let id = 0;

// 1.有我们创建渲染watcher的时候会把当前的渲染watcher放在Dep.target上
// 2. 调用_render()会取值走到get上
// 每个属性有一个dep(属性就是被观察者)，watcher就是观察者(属性变化了会通知观察者来更新) -> 观察者模式
class Watcher{  // 不同组件有不同的watcher，目前只有一个渲染跟实例的
    constructor(vm, exprOrFn, options, cb){
        this.id = id++;
        this.renderWatcher = options;   // 是一个渲染watcher
        if(typeof exprOrFn === 'string') {
            this.getter = function(){
                return vm[exprOrFn]      // vm.firstname
            }
        } else {
            this.getter = exprOrFn;     // getter意味着 调用这个函数可以发生取值操作
        }
        this.getter = exprOrFn;   // getter意味着调用这个函数可以发生取值操作
        this.deps = [];   // 后续我们实现计算属性，和一些清理工作需要用到
        this.depsId = new Set();
        this.lazy = options.lazy;
        this.cb = cb;
        this.dirty = this.lazy;  // 缓存值
        this.vm = vm;
        this.user = options.user;   // 标识是否是用户自己的

        this.lazy ? undefined : this.get();
    }
    addDep(dep){    // 一个组件 对应着多个属性 重复的属性也不用记录
        let id = dep.id;
        if(!this.depsId.has(id)) {
            this.deps.push(dep);
            this.depsId.add(id);
            dep.addSub(this);    // watcher已经记住了dep了而且去重了，此时让dep也记住了watcher
        }
    }
    evalute() {
       this.value =  this.get();   // 获取到用户函数的返回值，并且还要标识为脏
       this.dirty = false;
    }
    get() {
        pushTarget(this)    // 静态属性就是只有一份
        let value = this.getter.call(this.vm);    // 会去vm上取值，vm._update(vm._render) 取name 和age
        popTarget();         // 渲染完毕就会清空
        return value;   // 渲染完毕后就清空
    }
    depend() {
        let i = this.deps.length;
        while(i--) {
            this.deps[i].depend();      // 让计算属性watcher，也收集渲染watcher
        }
        // 这里我们不希望放重复的watcher，而且刚才只是一个单项的关系 deo---> watcher
        // watcher 记录deo
        // this.subs.push(Dep.target)
        Dep.target.addDep(this);    // 让watcher记住dep
        // dep和watcher是一个多对多的关系（一个属性可以在多个组件中使用deo---> 多个watcher）
         // 一个组件中由多个属性组成（一个watcher对应多个dep）
    }
    addSub(watcher) {
        this.subs.forEach(watcher => watcher.update());    //告诉watcher要更新了
    }
    update() {
        if(this.lazy) {
            // 如果计算属性，依赖的值变化了，就标识计算属性是脏值了
            this.dirty = true;
        }else {
            queueWatcher(this);   // 把当前的watcher暂存起来
            // this.get();  // 重新渲染
        }
    }
    run() {
        let oldValue = this.value;
        let newValue = this.get();     // 渲染的时候用的是最新的vm来渲染的
        if(this.user) {
            this.cb().call(this.vm, newValue,oldValue);
        }
        console.log('run');
        this.get();         // 渲染的时候用的是最新的vm来渲染的
    }
} 
let queue = [];
let has = {};
function flushSchedulerQueue() {
    let flushQueue = queue.slice(0)
    queus = [];
    has = {};
    pending = false;
    flushQueus.forEach(q => q.run());     // 在刷新的过程中可能还有新的watcher，重新放在queue中
}
function queueWatcher(watcher) {
    const id = watcher.id;
    if(!has[id]){
        queue.push(watcher);
        has[id] = true;
        // 不管我们的update执行多少次，但是最终只执行一轮刷新操作
        if(!pending){
            setTimeout(flushSchedulerQueue, 0)
            pending = true;
        }
    }
}

let callbacks = [];
let waiting = false;
function flushCallbacks() {
    let cbs = callbacks.slice(0);
    waiting = true;

    callbacks = [];
    cbs.forEach(cb => cb());   // 按照顺序依次执行
}

// nextTick没有直接使用某个api，而是采优雅降级的方式
// 内部先采用的promise，MutationObserver 可以考虑ie专享的 setImmediate，setTimeout
let timerFunc;
if(Promise) {
    timerFunc = () => {
        Promise.resolve.then(flushCallbacks)
    }
} else if(MutationObserver) {
    let observe = new MutationObserver(flushCallbacks);    // 这里传入的回调时异步执行的
    let textNode = ducument.createTextNode(1);
    observer.observe(textNode, {
        characterData: true
    });
    timerFunc = () => {
        setImmediate()
    }
}else if(setImmediate) {
    timerFunc = () => {
        setImmediate(flushCallbacks);
    }
}else{
    timerFunc = () => {
        setTimeout(flushCallbacks);
    }
}
export function nextTick(cb){    // 先内部还是先用户的?
    // console.log(cb);
    callbacks.push(cb);   // 维护nextTick中的callback方法
    if(!waiting) {
        setTimeout(() => {
            flushCallbacks();  // 最后一起刷新
        },0)
        waiting = true;
    }
}

// 需要给每个属性增加一个dep，目的就是收集watcher
// 一个视图中 有多少个属性(n个属性会对应一个视图)  n个dep对应一个watcher
// 1个属性 对应多个组件  1个dep对应多个watcher
// 多对多的关系
export default Watcher 