import Vue from ".";
import { mergeOptions } from "./utils";

export function initGlobalAPI() {
    // 静态方法
    const starts = {};
    starts.created = function(){}
    Vue.options = {}

    const LIFECYCLE = [
        'beforeCreate',
        'created'
    ]
    LIFECYCLE.forEach(hook => {
        strats[hook] = function (p, c) {
            // {} {created:function(){}}  => {created: [fn]}
            // {created: [fn]} {created: function(){} => {created: [fn,fn]}}
            if(c) {   // 如果儿子有 父亲又
                if (p) {
                    return p.concat(c);
                } else {
                    return [c];   // 儿子有父亲没有，则将儿子包装成数组
                }
            } else {
                return p;    // 如果儿子没有则用父亲即可
            }
        }
    })
   
    Vue.mixin = function(mixin) {
        // 期待将用户的选项和 全局的options进行合并
        // {} (created: function(){})  => {created: [fn]}
        this.options = mergeOptions(this.options,mixin);
        return this;
    }

    Vue.extend = function(options) {
        // 就是实现根据用户的参数，返回一个构造函数而已
        function Sub(options = {}) {    // 最终使用一个组件，就是new一个实例
            this._init(options);    // 就是默认对子类进行初始化操作
        }
        Sub.prototype = Object.create(Vue.prototype)
        Sub.prototype.constructor = Sub;

        // 希望将用户的传递的参数，和全局的Vue.options来合并
        Sub.options = mergeOptions(vue.options, options);   // 保存用户传递的选项
        return Sub
    }
    Vue.options.components = {}    // 全局的指令Vue.options.directives
    Vue.component = function(id, definition) {
        // 如果definition已经是一个函数了，说明用户自己调用了Vue.extend
    }

    // 最终调用的都是这个方法
    Vue.prototype.$watch = function(exprOrFn,cb, options = {}) {
        console.log(exprOrFn,cb,options);
        // first
        new Watcher(this,exprOrFn,{user:true},cb)
    }
}