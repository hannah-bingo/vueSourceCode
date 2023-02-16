import { newArrayProto } from './array';
import Dep from './dep';
class Observer {
    constructor(data) {
        // 给每个对象都增加收集功能
        this.dep = new Dep();
        // debugger;
        // Object.defineProperty只能劫持已经存在的属性（vue里面会为此单独写一些api $set $delete）
        Object.defineProperty(data, '__ob__',{
            value: this,
            enumerable:false   // 将___ob__变成不可枚举（循环的时候无法获取到）
        })
        // data.__ob__ = this;
        if(Array.isArray(data)) {
            // 重写数组中的七个变异方法，可以修改数组本身的
            // data.__proto__ = {    // 保留数组原有的特性，并且可以重写部分方法
            //     push() {
            //         console.log('重写的push');
            //     }
            // }
            // 保留数组原有的特性，并且可以重写部分方法
            data.__proto__  = newArrayProto
            // this.observerArray(data)    // 如果数组中存放的是对象，可以监控到对象的变化
        } else {
            this.walk(data)    
        }
        
    }
    walk(data) {  // 循环对象，对属性依次劫持
        // "重新定义"属性
        Object.keys(data).forEach(key => {
           defineReactive(data,key,data[key]) 
        })
    }
    observerArray(data) { //观测数组
        data.forEach(item => observe(item))
    }
}

// 深层次嵌套会递归，递归多了性能差，不存在属性监控不到，属性
function dependArray(value){
    for(let i = 0; i<value.length; i++) {
        let current = value[i]
        current.__ob__.dep.depend();
        if(Array.isArray(current)){
            dependArray(current);
        }
    }
}

export function defineReactive(target,key,value) {   // 闭包 属性劫持
    let childOb = observe(value);   // 对所有的对象都进行属性劫持，childOb.dep用来收集依赖
    let dep = new Dep();    // 每一个属性都有一个dep
    observe(value);   // 对所有的对象都进行属性劫持
    Object.defineProperty(target,key,{
        get() { // 取值的时候会执行get
            // console.log('用户取值了');
            if(Dep.target) {
                dep.depend();   // 让这个属性的收集器记住当前的watcher
            }
        },
        set(newValue){
            // console.log('用户设置值了');
            if(newValue === value) return
            observe(newValue)    // 对对象的值再次代理
            value = newValue
        }
   }) 
}
export function observe(data) {
    // debugger
    // 对这个对象进行劫持
    if(typeof data !== 'object' || data === null) {
        return;  // 只对对象进行劫持
    }
    if(data.__ob__ instanceof Observer) {   // 说明这个对象被代理过了

    }

    // 如果一个对象被劫持了，那就不需要在被劫持了（判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过）
    return new Observer(data)
}