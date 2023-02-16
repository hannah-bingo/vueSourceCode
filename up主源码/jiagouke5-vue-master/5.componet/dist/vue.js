(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    var strats = {};
    var LIFECYCLE = ['beforeCreate', 'created'];
    LIFECYCLE.forEach(function (hook) {
      strats[hook] = function (p, c) {
        //  {} {created:function(){}}   => {created:[fn]}
        // {created:[fn]}  {created:function(){}} => {created:[fn,fn]}
        if (c) {
          // 如果儿子有 父亲有   让父亲和儿子拼在一起
          if (p) {
            return p.concat(c);
          } else {
            return [c]; // 儿子有父亲没有 ，则将儿子包装成数组
          }
        } else {
          return p; // 如果儿子没有则用父亲即可
        }
      };
    });

    strats.components = function (parentVal, childVal) {
      var res = Object.create(parentVal);

      if (childVal) {
        for (var key in childVal) {
          res[key] = childVal[key]; // 返回的是构造的对象 可以拿到父亲原型上的属性，并且将儿子的都拷贝到自己身上
        }
      }

      return res;
    };

    function mergeOptions(parent, child) {
      var options = {};

      for (var key in parent) {
        // 循环老的  {}
        mergeField(key);
      }

      for (var _key in child) {
        // 循环老的   {a:1}
        if (!parent.hasOwnProperty(_key)) {
          mergeField(_key);
        }
      }

      function mergeField(key) {
        // 策略模式 用策略模式减少if /else
        if (strats[key]) {
          options[key] = strats[key](parent[key], child[key]);
        } else {
          // 如果不在策略中则以儿子为主
          options[key] = child[key] || parent[key]; // 优先采用儿子，在采用父亲
        }
      }

      return options;
    }

    function initGlobalAPI(Vue) {
      // 静态方法
      Vue.options = {
        _base: Vue
      };

      Vue.mixin = function (mixin) {
        // 我们期望将用户的选项和 全局的options进行合并 '
        this.options = mergeOptions(this.options, mixin);
        return this;
      }; // 可以手动创造组件进行挂载


      Vue.extend = function (options) {
        // 就是实现根据用户的参数 返回一个构造函数而已
        function Sub() {
          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

          // 最终使用一个组件 就是new一个实例
          this._init(options); // 就是默认对子类进行初始化操作

        }

        Sub.prototype = Object.create(Vue.prototype); // Sub.prototype.__proto__ === Vue.prototype

        Sub.prototype.constructor = Sub; // 希望将用户的传递的参数 和全局的Vue.options来合并

        Sub.options = mergeOptions(Vue.options, options); // 保存用户传递的选项

        return Sub;
      };

      Vue.options.components = {}; // 全局的指令 Vue.otpions.directives

      Vue.component = function (id, definition) {
        // 如果definition已经是一个函数了 说明用户自己调用了Vue.extend
        definition = typeof definition === 'function' ? definition : Vue.extend(definition);
        Vue.options.components[id] = definition;
      };
    }

    function _typeof(obj) {
      "@babel/helpers - typeof";

      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function (obj) {
          return typeof obj;
        };
      } else {
        _typeof = function (obj) {
          return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
      }

      return _typeof(obj);
    }

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      return Constructor;
    }

    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }

    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }

    function _iterableToArrayLimit(arr, i) {
      var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

      if (_i == null) return;
      var _arr = [];
      var _n = true;
      var _d = false;

      var _s, _e;

      try {
        for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }

    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;

      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

      return arr2;
    }

    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
    var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
    var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 他匹配到的分组是一个 标签名  <xxx 匹配到的是开始 标签的名字

    var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配的是</xxxx>  最终匹配到的分组就是结束标签的名字

    var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性
    // 第一个分组就是属性的key value 就是 分组3/分组4/分组五

    var startTagClose = /^\s*(\/?)>/; // <div> <br/>
    // vue3 采用的不是使用正则
    // 对模板进行编译处理  

    function parseHTML(html) {
      // html最开始肯定是一个  </div>
      var ELEMENT_TYPE = 1;
      var TEXT_TYPE = 3;
      var stack = []; // 用于存放元素的

      var currentParent; // 指向的是栈中的最后一个

      var root; // 最终需要转化成一颗抽象语法树

      function createASTElement(tag, attrs) {
        return {
          tag: tag,
          type: ELEMENT_TYPE,
          children: [],
          attrs: attrs,
          parent: null
        };
      } // 利用栈型结构 来构造一颗树


      function start(tag, attrs) {
        var node = createASTElement(tag, attrs); // 创造一个ast节点

        if (!root) {
          // 看一下是否是空树
          root = node; // 如果为空则当前是树的根节点
        }

        if (currentParent) {
          node.parent = currentParent; // 只赋予了parent属性

          currentParent.children.push(node); // 还需要让父亲记住自己
        }

        stack.push(node);
        currentParent = node; // currentParent为栈中的最后一个
      }

      function chars(text) {
        // 文本直接放到当前指向的节点中
        text = text.replace(/\s/g, ''); // 如果空格超过2就删除2个以上的

        text && currentParent.children.push({
          type: TEXT_TYPE,
          text: text,
          parent: currentParent
        });
      }

      function end(tag) {
        stack.pop(); // 弹出最后一个, 校验标签是否合法

        currentParent = stack[stack.length - 1];
      }

      function advance(n) {
        html = html.substring(n);
      }

      function parseStartTag() {
        var start = html.match(startTagOpen);

        if (start) {
          var match = {
            tagName: start[1],
            // 标签名
            attrs: []
          };
          advance(start[0].length); // 如果不是开始标签的结束 就一直匹配下去

          var attr, _end;

          while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            advance(attr[0].length);
            match.attrs.push({
              name: attr[1],
              value: attr[3] || attr[4] || attr[5] || true
            });
          }

          if (_end) {
            advance(_end[0].length);
          }

          return match;
        }

        return false; // 不是开始标签
      }

      while (html) {
        // 如果textEnd 为0 说明是一个开始标签或者结束标签
        // 如果textEnd > 0说明就是文本的结束位置
        var textEnd = html.indexOf('<'); // 如果indexOf中的索引是0 则说明是个标签

        if (textEnd == 0) {
          var startTagMatch = parseStartTag(); // 开始标签的匹配结果

          if (startTagMatch) {
            // 解析到的开始标签
            start(startTagMatch.tagName, startTagMatch.attrs);
            continue;
          }

          var endTagMatch = html.match(endTag);

          if (endTagMatch) {
            advance(endTagMatch[0].length);
            end(endTagMatch[1]);
            continue;
          }
        }

        if (textEnd > 0) {
          var text = html.substring(0, textEnd); // 文本内容

          if (text) {
            chars(text);
            advance(text.length); // 解析到的文本 
          }
        }
      }

      return root;
    }

    function genProps(attrs) {
      var str = ''; // {name,value}

      for (var i = 0; i < attrs.length; i++) {
        var attr = attrs[i];

        if (attr.name === 'style') {
          (function () {
            // color:red;background:red => {color:'red'}
            var obj = {};
            attr.value.split(';').forEach(function (item) {
              // qs 库
              var _item$split = item.split(':'),
                  _item$split2 = _slicedToArray(_item$split, 2),
                  key = _item$split2[0],
                  value = _item$split2[1];

              obj[key] = value;
            });
            attr.value = obj;
          })();
        }

        str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ","); // a:b,c:d,
      }

      return "{".concat(str.slice(0, -1), "}");
    }

    var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{ asdsadsa }}  匹配到的内容就是我们表达式的变量

    function gen(node) {
      if (node.type === 1) {
        return codegen(node);
      } else {
        // 文本
        var text = node.text;

        if (!defaultTagRE.test(text)) {
          return "_v(".concat(JSON.stringify(text), ")");
        } else {
          //_v( _s(name)+'hello' + _s(name))
          var tokens = [];
          var match;
          defaultTagRE.lastIndex = 0;
          var lastIndex = 0; // split

          while (match = defaultTagRE.exec(text)) {
            var index = match.index; // 匹配的位置  {{name}} hello  {{name}} hello 

            if (index > lastIndex) {
              tokens.push(JSON.stringify(text.slice(lastIndex, index)));
            }

            tokens.push("_s(".concat(match[1].trim(), ")"));
            lastIndex = index + match[0].length;
          }

          if (lastIndex < text.length) {
            tokens.push(JSON.stringify(text.slice(lastIndex)));
          }

          return "_v(".concat(tokens.join('+'), ")");
        }
      }
    }

    function genChildren(children) {
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }

    function codegen(ast) {
      var children = genChildren(ast.children);
      var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length ? ",".concat(children) : '', ")");
      return code;
    }

    function compileToFunction(template) {
      // 1.就是将template 转化成ast语法树
      var ast = parseHTML(template); // 2.生成render方法 (render方法执行后的返回的结果就是 虚拟DOM)
      // 模板引擎的实现原理 就是 with  + new Function

      var code = codegen(ast);
      code = "with(this){return ".concat(code, "}");
      var render = new Function(code); // 根据代码生成render函数
      //  _c('div',{id:'app'},_c('div',{style:{color:'red'}},  _v(_s(vm.name)+'hello'),_c('span',undefined,  _v(_s(age))))

      return render;
    } // <xxx
    // <namepsace:xxx
    // color   =   "asdsada"     c= 'asdasd'  d=  asdasdsa

    var id$1 = 0;

    var Dep = /*#__PURE__*/function () {
      function Dep() {
        _classCallCheck(this, Dep);

        this.id = id$1++; // 属性的dep要收集watcher

        this.subs = []; // 这里存放着当前属性对应的watcher有哪些
      }

      _createClass(Dep, [{
        key: "depend",
        value: function depend() {
          // 这里我们不希望放重复的watcher，而且刚才只是一个单向的关系 dep -> watcher
          // watcher 记录dep
          // this.subs.push(Dep.target);
          Dep.target.addDep(this); // 让watcher记住dep
          // dep 和 watcher是一个多对多的关系 （一个属性可以在多个组件中使用 dep -> 多个watcher）
          // 一个组件中由多个属性组成 （一个watcher 对应多个dep）
        }
      }, {
        key: "addSub",
        value: function addSub(watcher) {
          this.subs.push(watcher);
        }
      }, {
        key: "notify",
        value: function notify() {
          this.subs.forEach(function (watcher) {
            return watcher.update();
          }); // 告诉watcher要更新了
        }
      }]);

      return Dep;
    }();

    Dep.target = null;
    var stack = [];
    function pushTarget(watcher) {
      stack.push(watcher);
      Dep.target = watcher;
    }
    function popTarget() {
      stack.pop();
      Dep.target = stack[stack.length - 1];
    }

    var id = 0; // 1） 当我们创建渲染watcher的时候我们会把当前的渲染watcher放到Dep.target上
    // 2) 调用_render() 会取值 走到get上
    // 每个属性有一个dep （属性就是被观察者） ， watcher就是观察者（属性变化了会通知观察者来更新） -》 观察者模式

    var Watcher = /*#__PURE__*/function () {
      // 不同组件有不同的watcher   目前只有一个 渲染根实例的
      function Watcher(vm, exprOrFn, options, cb) {
        _classCallCheck(this, Watcher);

        this.id = id++;
        this.renderWatcher = options; // 是一个渲染watcher

        if (typeof exprOrFn === 'string') {
          this.getter = function () {
            return vm[exprOrFn];
          };
        } else {
          this.getter = exprOrFn; // getter意味着调用这个函数可以发生取值操作
        }

        this.deps = []; // 后续我们实现计算属性，和一些清理工作需要用到

        this.depsId = new Set();
        this.lazy = options.lazy;
        this.cb = cb;
        this.dirty = this.lazy; // 缓存值

        this.vm = vm;
        this.user = options.user; // 标识是否是用户自己的watcher

        this.value = this.lazy ? undefined : this.get();
      }

      _createClass(Watcher, [{
        key: "addDep",
        value: function addDep(dep) {
          // 一个组件 对应着多个属性 重复的属性也不用记录
          var id = dep.id;

          if (!this.depsId.has(id)) {
            this.deps.push(dep);
            this.depsId.add(id);
            dep.addSub(this); // watcher已经记住了dep了而且去重了，此时让dep也记住watcher
          }
        }
      }, {
        key: "evaluate",
        value: function evaluate() {
          this.value = this.get(); // 获取到用户函数的返回值 并且还要标识为脏 

          this.dirty = false;
        }
      }, {
        key: "get",
        value: function get() {
          pushTarget(this); // 静态属性就是只有一份

          var value = this.getter.call(this.vm); // 会去vm上取值  vm._update(vm._render) 取name 和age

          popTarget(); // 渲染完毕后就清空

          return value;
        }
      }, {
        key: "depend",
        value: function depend() {
          // watcher的depend 就是让watcher中dep去depend
          var i = this.deps.length;

          while (i--) {
            // dep.depend()
            this.deps[i].depend(); // 让计算属性watcher 也收集渲染watcher
          }
        }
      }, {
        key: "update",
        value: function update() {
          if (this.lazy) {
            // 如果是计算属性  依赖的值变化了 就标识计算属性是脏值了
            this.dirty = true;
          } else {
            queueWatcher(this); // 把当前的watcher 暂存起来
            // this.get(); // 重新渲染
          }
        }
      }, {
        key: "run",
        value: function run() {
          var oldValue = this.value;
          var newValue = this.get(); // 渲染的时候用的是最新的vm来渲染的

          if (this.user) {
            this.cb.call(this.vm, newValue, oldValue);
          }
        }
      }]);

      return Watcher;
    }();

    var queue = [];
    var has = {};
    var pending = false; // 防抖

    function flushSchedulerQueue() {
      var flushQueue = queue.slice(0);
      queue = [];
      has = {};
      pending = false;
      flushQueue.forEach(function (q) {
        return q.run();
      }); // 在刷新的过程中可能还有新的watcher，重新放到queue中
    }

    function queueWatcher(watcher) {
      var id = watcher.id;

      if (!has[id]) {
        queue.push(watcher);
        has[id] = true; // 不管我们的update执行多少次 ，但是最终只执行一轮刷新操作

        if (!pending) {
          nextTick(flushSchedulerQueue);
          pending = true;
        }
      }
    }

    var callbacks = [];
    var waiting = false;

    function flushCallbacks() {
      var cbs = callbacks.slice(0);
      waiting = false;
      callbacks = [];
      cbs.forEach(function (cb) {
        return cb();
      }); // 按照顺序依次执行
    } // nextTick 没有直接使用某个api 而是采用优雅降级的方式 
    // 内部先采用的是promise （ie不兼容）  MutationObserver(h5的api)  可以考虑ie专享的 setImmediate  setTimeout
    // let timerFunc;
    // if (Promise) {
    //     timerFunc = () => {
    //         Promise.resolve().then(flushCallbacks)
    //     }
    // }else if(MutationObserver){
    //     let observer = new MutationObserver(flushCallbacks); // 这里传入的回调是异步执行的
    //     let textNode = document.createTextNode(1);
    //     observer.observe(textNode,{
    //         characterData:true
    //     });
    //     timerFunc = () => {
    //         textNode.textContent = 2;
    //     }
    // }else if(setImmediate){
    //     timerFunc = () => {
    //        setImmediate(flushCallbacks);
    //     }
    // }else{
    //     timerFunc = () => {
    //         setTimeout(flushCallbacks);
    //      }
    // }


    function nextTick(cb) {
      // 先内部还是先用户的？
      callbacks.push(cb); // 维护nextTick中的cakllback方法

      if (!waiting) {
        // timerFunc()
        Promise.resolve().then(flushCallbacks);
        waiting = true;
      }
    } // 需要给每个属性增加一个dep， 目的就是收集watcher

    // h()  _c()
    var isReservedTag = function isReservedTag(tag) {
      return ['a', 'div', 'p', 'button', 'ul', 'li', 'span'].includes(tag);
    };

    function createElementVNode(vm, tag, data) {
      if (data == null) {
        data = {};
      }

      var key = data.key;

      if (key) {
        delete data.key;
      }

      for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        children[_key - 3] = arguments[_key];
      }

      if (isReservedTag(tag)) {
        return vnode(vm, tag, key, data, children);
      } else {
        // 创造一个组件的虚拟节点  (包含组件的构造函数)
        var Ctor = vm.$options.components[tag]; // 组件的构造函数
        // Ctor就是组件的定义 可能是一个Sub类 还有可能是组件的obj选项

        return createComponentVnode(vm, tag, key, data, children, Ctor);
      }
    }

    function createComponentVnode(vm, tag, key, data, children, Ctor) {
      if (_typeof(Ctor) === 'object') {
        Ctor = vm.$options._base.extend(Ctor); // Ctor = Vue.extend(Ctor)
      }

      data.hook = {
        init: function init(vnode) {
          // 稍后创造真实节点的时候 如果是组件则调用此init方法
          // 保存组件的实例到虚拟节点上
          var instance = vnode.componentInstance = new vnode.componentOptions.Ctor();
          instance.$mount(); // instance.$el
        }
      };
      return vnode(vm, tag, key, data, children, null, {
        Ctor: Ctor
      });
    } // _v();


    function createTextVNode(vm, text) {
      return vnode(vm, undefined, undefined, undefined, undefined, text);
    } // ast一样吗？ ast做的是语法层面的转化 他描述的是语法本身 (可以描述js css html)
    // 我们的虚拟dom 是描述的dom元素，可以增加一些自定义属性  (描述dom的)

    function vnode(vm, tag, key, data, children, text, componentOptions) {
      return {
        vm: vm,
        tag: tag,
        key: key,
        data: data,
        children: children,
        text: text,
        componentOptions: componentOptions // 组件的构造函数
        // ....

      };
    }

    function isSameVnode(vnode1, vnode2) {
      return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
    }

    function createComponent(vnode) {
      var i = vnode.data;

      if ((i = i.hook) && (i = i.init)) {
        // data.hook.init 
        i(vnode); // 初始化组件 ， 找到init方法
      }

      if (vnode.componentInstance) {
        return true; // 说明是组件
      }
    }

    function createElm(vnode) {
      var tag = vnode.tag,
          data = vnode.data,
          children = vnode.children,
          text = vnode.text;

      if (typeof tag === 'string') {
        // 标签
        // 创建真实元素 也要区分是组件还是元素
        if (createComponent(vnode)) {
          // 组件  vnode.componentInstance.$el
          return vnode.componentInstance.$el;
        }

        vnode.el = document.createElement(tag); // 这里将真实节点和虚拟节点对应起来，后续如果修改属性了

        patchProps(vnode.el, {}, data);
        children.forEach(function (child) {
          vnode.el.appendChild(createElm(child)); // 会将组件创建的元素插入到父元素中
        });
      } else {
        vnode.el = document.createTextNode(text);
      }

      return vnode.el;
    }
    function patchProps(el) {
      var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      // 老的属性中有，新的没有  要删除老的
      var oldStyles = oldProps.style || {};
      var newStyles = props.style || {};

      for (var key in oldStyles) {
        // 老的样式中有 新的吗，没有则删除
        if (!newStyles[key]) {
          el.style[key] = '';
        }
      }

      for (var _key in oldProps) {
        // 老的属性中有
        if (!props[_key]) {
          // 新的没有删除属性
          el.removeAttribute(_key);
        }
      }

      for (var _key2 in props) {
        // 用新的覆盖老的
        if (_key2 === 'style') {
          // style{color:'red'}
          for (var styleName in props.style) {
            el.style[styleName] = props.style[styleName];
          }
        } else {
          el.setAttribute(_key2, props[_key2]);
        }
      }
    }
    function patch(oldVNode, vnode) {
      // mount()
      if (!oldVNode) {
        // 这就是组件的挂载
        return createElm(vnode); // vm.$el  对应的就是组件渲染的结果了
      } // 写的是初渲染流程 


      var isRealElement = oldVNode.nodeType;

      if (isRealElement) {
        var elm = oldVNode; // 获取真实元素

        var parentElm = elm.parentNode; // 拿到父元素

        var newElm = createElm(vnode);
        parentElm.insertBefore(newElm, elm.nextSibling);
        parentElm.removeChild(elm); // 删除老节点

        return newElm;
      } else {
        // 1.两个节点不是同一个节点  直接删除老的换上新的  （没有比对了）
        // 2.两个节点是同一个节点 (判断节点的tag和 节点的key)  比较两个节点的属性是否有差异 （复用老的节点，将差异的属性更新）
        // 3.节点比较完毕后就需要比较两人的儿子
        return patchVnode(oldVNode, vnode);
      }
    }

    function patchVnode(oldVNode, vnode) {
      if (!isSameVnode(oldVNode, vnode)) {
        // tag == tag key === key
        // 用老节点的父亲 进行替换
        var _el = createElm(vnode);

        oldVNode.el.parentNode.replaceChild(_el, oldVNode.el);
        return _el;
      } // 文本的情况  文本我们期望比较一下文本的内容


      var el = vnode.el = oldVNode.el; // 复用老节点的元素

      if (!oldVNode.tag) {
        // 是文本
        if (oldVNode.text !== vnode.text) {
          el.textContent = vnode.text; // 用新的文本覆盖掉老的
        }
      } // 是标签   是标签我们需要比对标签的属性


      patchProps(el, oldVNode.data, vnode.data); // 比较儿子节点 比较的时候 一方有儿子 一方没儿子 
      //                       两方都有儿子

      var oldChildren = oldVNode.children || [];
      var newChildren = vnode.children || [];

      if (oldChildren.length > 0 && newChildren.length > 0) {
        // 完整的diff算法 需要比较两个人的儿子
        updateChildren(el, oldChildren, newChildren);
      } else if (newChildren.length > 0) {
        // 没有老的，有新的
        mountChildren(el, newChildren);
      } else if (oldChildren.length > 0) {
        // 新的没有  老的有 要删除
        el.innerHTML = ''; // 可以循环删除
      }

      return el;
    }

    function mountChildren(el, newChildren) {
      for (var i = 0; i < newChildren.length; i++) {
        var child = newChildren[i];
        el.appendChild(createElm(child));
      }
    }

    function updateChildren(el, oldChildren, newChildren) {
      // 我们操作列表 经常会是有  push shift pop unshift reverse sort这些方法  （针对这些情况做一个优化）
      // vue2中采用双指针的方式 比较两个节点
      var oldStartIndex = 0;
      var newStartIndex = 0;
      var oldEndIndex = oldChildren.length - 1;
      var newEndIndex = newChildren.length - 1;
      var oldStartVnode = oldChildren[0];
      var newStartVnode = newChildren[0];
      var oldEndVnode = oldChildren[oldEndIndex];
      var newEndVnode = newChildren[newEndIndex];

      function makeIndexByKey(children) {
        var map = {};
        children.forEach(function (child, index) {
          map[child.key] = index;
        });
        return map;
      }

      var map = makeIndexByKey(oldChildren); // 循环的时候为什么要+key

      while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        // 有任何一个不满足则停止  || 有一个为true 就继续走
        // 双方有一方头指针，大于尾部指针则停止循环
        if (!oldStartVnode) {
          oldStartVnode = oldChildren[++oldStartIndex];
        } else if (!oldEndVnode) {
          oldEndVnode = oldChildren[--oldEndIndex];
        } else if (isSameVnode(oldStartVnode, newStartVnode)) {
          patchVnode(oldStartVnode, newStartVnode); // 如果是相同节点 则递归比较子节点

          oldStartVnode = oldChildren[++oldStartIndex];
          newStartVnode = newChildren[++newStartIndex]; // 比较开头节点
        } else if (isSameVnode(oldEndVnode, newEndVnode)) {
          patchVnode(oldEndVnode, newEndVnode); // 如果是相同节点 则递归比较子节点

          oldEndVnode = oldChildren[--oldEndIndex];
          newEndVnode = newChildren[--newEndIndex]; // 比较开头节点
        } else if (isSameVnode(oldEndVnode, newStartVnode)) {
          patchVnode(oldEndVnode, newStartVnode); // insertBefore 具备移动性 会将原来的元素移动走

          el.insertBefore(oldEndVnode.el, oldStartVnode.el); // 将老的尾巴移动到老的前面去

          oldEndVnode = oldChildren[--oldEndIndex];
          newStartVnode = newChildren[++newStartIndex];
        } else if (isSameVnode(oldStartVnode, newEndVnode)) {
          patchVnode(oldStartVnode, newEndVnode); // insertBefore 具备移动性 会将原来的元素移动走

          el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); // 将老的尾巴移动到老的前面去

          oldStartVnode = oldChildren[++oldStartIndex];
          newEndVnode = newChildren[--newEndIndex];
        } else {
          // 在给动态列表添加key的时候 要尽量避免用索引，因为索引前后都是从0 开始 ， 可能会发生错误复用 
          // 乱序比对
          // 根据老的列表做一个映射关系 ，用新的去找，找到则移动，找不到则添加，最后多余的就删除
          var moveIndex = map[newStartVnode.key]; // 如果拿到则说明是我要移动的索引

          if (moveIndex !== undefined) {
            var moveVnode = oldChildren[moveIndex]; // 找到对应的虚拟节点 复用

            el.insertBefore(moveVnode.el, oldStartVnode.el);
            oldChildren[moveIndex] = undefined; // 表示这个节点已经移动走了

            patchVnode(moveVnode, newStartVnode); // 比对属性和子节点
          } else {
            el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
          }

          newStartVnode = newChildren[++newStartIndex];
        }
      }

      if (newStartIndex <= newEndIndex) {
        // 新的多了 多余的就插入进去
        for (var i = newStartIndex; i <= newEndIndex; i++) {
          var childEl = createElm(newChildren[i]); // 这里可能是像后追加 ，还有可能是向前追加

          var anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null; // 获取下一个元素
          // el.appendChild(childEl);

          el.insertBefore(childEl, anchor); // anchor 为null的时候则会认为是appendChild
        }
      }

      if (oldStartIndex <= oldEndIndex) {
        // 老的对了，需要删除老的
        for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
          if (oldChildren[_i]) {
            var _childEl = oldChildren[_i].el;
            el.removeChild(_childEl);
          }
        }
      } // 我们为了 比较两个儿子的时候 ，增高性能 我们会有一些优化手段
      // 如果批量像页面中修改出入内容 浏览器会自动优化 

    }

    function initLifeCycle(Vue) {
      Vue.prototype._update = function (vnode) {
        // 将vnode转化成真实dom
        var vm = this;
        var el = vm.$el;
        var prevVnode = vm._vnode;
        vm._vnode = vnode; // 把组件第一次产生的虚拟节点保存到_vnode上

        if (prevVnode) {
          // 之前渲染过了
          vm.$el = patch(prevVnode, vnode);
        } else {
          vm.$el = patch(el, vnode);
        }
      }; // _c('div',{},...children)


      Vue.prototype._c = function () {
        return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
      }; // _v(text)


      Vue.prototype._v = function () {
        return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
      };

      Vue.prototype._s = function (value) {
        if (_typeof(value) !== 'object') return value;
        return JSON.stringify(value);
      };

      Vue.prototype._render = function () {
        // 当渲染的时候会去实例中取值，我们就可以将属性和视图绑定在一起
        return this.$options.render.call(this); // 通过ast语法转义后生成的render方法
      };
    }
    function mountComponent(vm, el) {
      // 这里的el 是通过querySelector处理过的
      vm.$el = el; // 1.调用render方法产生虚拟节点 虚拟DOM

      var updateComponent = function updateComponent() {
        vm._update(vm._render()); // vm.$options.render() 虚拟节点

      };

      new Watcher(vm, updateComponent, true); // true用于标识是一个渲染watcher
      // 2.根据虚拟DOM产生真实DOM 
      // 3.插入到el元素中
    } // vue核心流程 1） 创造了响应式数据  2） 模板转换成ast语法树  
    // 3) 将ast语法树转换了render函数 4) 后续每次数据更新可以只执行render函数 (无需再次执行ast转化的过程)
    // render函数会去产生虚拟节点（使用响应式数据）
    // 根据生成的虚拟节点创造真实的DOM

    function callHook(vm, hook) {
      // 调用钩子函数
      var handlers = vm.$options[hook];

      if (handlers) {
        handlers.forEach(function (handler) {
          return handler.call(vm);
        });
      }
    }

    // 我们希望重写数组中的部分方法
    var oldArrayProto = Array.prototype; // 获取数组的原型
    // newArrayProto.__proto__  = oldArrayProto

    var newArrayProto = Object.create(oldArrayProto);
    var methods = [// 找到所有的变异方法
    'push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice']; // concat slice 都不会改变原数组

    methods.forEach(function (method) {
      // arr.push(1,2,3)
      newArrayProto[method] = function () {
        var _oldArrayProto$method;

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        // 这里重写了数组的方法
        // push.call(arr)
        // todo...
        var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); // 内部调用原来的方法 ， 函数的劫持  切片编程
        // 我们需要对新增的 数据再次进行劫持


        var inserted;
        var ob = this.__ob__;

        switch (method) {
          case 'push':
          case 'unshift':
            // arr.unshift(1,2,3)
            inserted = args;
            break;

          case 'splice':
            // arr.splice(0,1,{a:1},{a:1})
            inserted = args.slice(2);
        } // console.log(inserted); // 新增的内容


        if (inserted) {
          // 对新增的内容再次进行观测  
          ob.observeArray(inserted);
        } // 走到这里 


        ob.dep.notify(); // 数组变化了 通知对应的watcher实现更新逻辑

        return result;
      };
    });

    var Observer = /*#__PURE__*/function () {
      function Observer(data) {
        _classCallCheck(this, Observer);

        // 给每个对象都增加收集功能 
        this.dep = new Dep(); // 所有对象都要增加dep
        // Object.defineProperty只能劫持已经存在的属性 （vue里面会为此单独写一些api  $set $delete）

        Object.defineProperty(data, '__ob__', {
          value: this,
          enumerable: false // 将__ob__ 变成不可枚举 （循环的时候无法获取到）

        }); // data.__ob__ = this; // 给数据加了一个标识 如果数据上有__ob__ 则说明这个属性被观测过了

        if (Array.isArray(data)) {
          // 这里我们可以重写数组中的方法 7个变异方法 是可以修改数组本身的
          data.__proto__ = newArrayProto; // 需要保留数组原有的特性，并且可以重写部分方法

          this.observeArray(data); // 如果数组中放的是对象 可以监控到对象的变化
        } else {
          this.walk(data);
        }
      }

      _createClass(Observer, [{
        key: "walk",
        value: function walk(data) {
          // 循环对象 对属性依次劫持
          // "重新定义"属性   性能差
          Object.keys(data).forEach(function (key) {
            return defineReactive(data, key, data[key]);
          });
        }
      }, {
        key: "observeArray",
        value: function observeArray(data) {
          // 观测数组
          data.forEach(function (item) {
            return observe(item);
          });
        }
      }]);

      return Observer;
    }(); // 深层次嵌套会递归，递归多了性能差，不存在属性监控不到，存在的属性要重写方法  vue3-> proxy


    function dependArray(value) {
      for (var i = 0; i < value.length; i++) {
        var current = value[i];
        current.__ob__ && current.__ob__.dep.depend();

        if (Array.isArray(current)) {
          dependArray(current);
        }
      }
    }

    function defineReactive(target, key, value) {
      // 闭包  属性劫持
      var childOb = observe(value); // 对所有的对象都进行属性劫持  childOb.dep 用来收集依赖的

      var dep = new Dep(); // 每一个属性都有一个dep

      Object.defineProperty(target, key, {
        get: function get() {
          // 取值的时候 会执行get
          if (Dep.target) {
            dep.depend(); // 让这个属性的收集器记住当前的watcher

            if (childOb) {
              childOb.dep.depend(); // 让数组和对象本身也实现依赖收集

              if (Array.isArray(value)) {
                dependArray(value);
              }
            }
          }

          return value;
        },
        set: function set(newValue) {
          // 修改的时候 会执行set
          if (newValue === value) return;
          observe(newValue);
          value = newValue;
          dep.notify(); // 通知更新
        }
      });
    }
    function observe(data) {
      // 对这个对象进行劫持
      if (_typeof(data) !== 'object' || data == null) {
        return; // 只对对象进行劫持
      }

      if (data.__ob__ instanceof Observer) {
        // 说明这个对象被代理过了
        return data.__ob__;
      } // 如果一个对象被劫持过了，那就不需要再被劫持了 (要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过)


      return new Observer(data);
    }

    function initState(vm) {
      var opts = vm.$options; // 获取所有的选项

      if (opts.data) {
        initData(vm);
      }

      if (opts.computed) {
        initComputed(vm);
      }

      if (opts.watch) {
        initWatch(vm);
      }
    }

    function initWatch(vm) {
      var watch = vm.$options.watch;

      for (var key in watch) {
        var handler = watch[key]; // 字符串 数组 函数

        if (Array.isArray(handler)) {
          for (var i = 0; i < handler.length; i++) {
            createWatcher(vm, key, handler[i]);
          }
        } else {
          createWatcher(vm, key, handler);
        }
      }
    }

    function createWatcher(vm, key, handler) {
      // 字符串  函数
      if (typeof handler === 'string') {
        handler = vm[handler];
      }

      return vm.$watch(key, handler);
    }

    function proxy(vm, target, key) {
      Object.defineProperty(vm, key, {
        // vm.name
        get: function get() {
          return vm[target][key]; // vm._data.name
        },
        set: function set(newValue) {
          vm[target][key] = newValue;
        }
      });
    }

    function initData(vm) {
      var data = vm.$options.data; // data可能是函数和对象

      data = typeof data === 'function' ? data.call(vm) : data; // data是用户返回的对象

      vm._data = data; // 我将返回的对象放到了_data上
      // 对数据进行劫持 vue2 里采用了一个api defineProperty

      observe(data); // 将vm._data 用vm来代理就可以了 

      for (var key in data) {
        proxy(vm, '_data', key);
      }
    }

    function initComputed(vm) {
      var computed = vm.$options.computed;
      var watchers = vm._computedWatchers = {}; // 将计算属性watcher保存到vm上

      for (var key in computed) {
        var userDef = computed[key]; // 我们需要监控 计算属性中get的变化

        var fn = typeof userDef === 'function' ? userDef : userDef.get; // 如果直接new Watcher 默认就会执行fn, 将属性和watcher对应起来 

        watchers[key] = new Watcher(vm, fn, {
          lazy: true
        });
        defineComputed(vm, key, userDef);
      }
    }

    function defineComputed(target, key, userDef) {
      // const getter = typeof userDef === 'function' ? userDef : userDef.get;
      var setter = userDef.set || function () {}; // 可以通过实例拿到对应的属性


      Object.defineProperty(target, key, {
        get: createComputedGetter(key),
        set: setter
      });
    } // 计算属性根本不会收集依赖 ，只会让自己的依赖属性去收集依赖


    function createComputedGetter(key) {
      // 我们需要检测是否要执行这个getter
      return function () {
        var watcher = this._computedWatchers[key]; // 获取到对应属性的watcher

        if (watcher.dirty) {
          // 如果是脏的就去执行 用户传入的函数
          watcher.evaluate(); // 求值后 dirty变为了false ,下次就不求值了
        }

        if (Dep.target) {
          // 计算属性出栈后 还要渲染watcher， 我应该让计算属性watcher里面的属性 也去收集上一层watcher
          watcher.depend();
        }

        return watcher.value; // 最后返回的是watcher上的值
      };
    }

    function initStateMixin(Vue) {
      Vue.prototype.$nextTick = nextTick; // 最终调用的都是这个方法

      Vue.prototype.$watch = function (exprOrFn, cb) {
        // firstname
        // ()=>vm.firstname
        // firstname的值变化了 直接执行cb函数即可
        new Watcher(this, exprOrFn, {
          user: true
        }, cb);
      };
    }

    function initMixin(Vue) {
      // 就是给Vue增加init方法的
      Vue.prototype._init = function (options) {
        // 用于初始化操作
        // vue  vm.$options 就是获取用户的配置 
        // 我们使用的 vue的时候 $nextTick $data $attr.....
        var vm = this; // 我们定义的全局指令和过滤器.... 都会挂载到实力上
        //    Sub.options,options

        vm.$options = mergeOptions(this.constructor.options, options); // 将用户的选项挂载到实例上

        callHook(vm, 'beforeCreate'); // 内部调用的是beforeCreate 写错了就不执行了
        // 初始化状态, 初始化计算属性,watch

        initState(vm);
        callHook(vm, 'created');

        if (options.el) {
          vm.$mount(options.el); // 实现数据的挂载
        }
      };

      Vue.prototype.$mount = function (el) {
        var vm = this;
        el = document.querySelector(el);
        var ops = vm.$options;

        if (!ops.render) {
          // 先进行查找有没有render函数 
          var template; // 没有render看一下是否写了tempate, 没写template采用外部的template

          if (!ops.template && el) {
            // 没有写模板 但是写了el
            template = el.outerHTML;
          } else {
            template = ops.template; // 如果有el 则采用模板的内容
          } // 写了temlate 就用 写了的template


          if (template) {
            // 只要有模板就挂载
            // 这里需要对模板进行编译 
            var render = compileToFunction(template);
            ops.render = render; // jsx 最终会被编译成h('xxx')
          }
        }

        mountComponent(vm, el); // 组件的挂载  
        // 最终就可以获取render方法
        // script 标签引用的vue.global.js 这个编译过程是在浏览器运行的
        // runtime是不包含模板编译的, 整个编译是打包的时候通过loader来转义.vue文件的, 用runtime的时候不能使用template
      };
    }

    function Vue(options) {
      // options就是用户的选项
      this._init(options); // 默认就调用了init

    }

    initMixin(Vue); // 扩展了init方法

    initLifeCycle(Vue); // vm_update  vm._render

    initGlobalAPI(Vue); // 全局api的实现

    initStateMixin(Vue); // 实现了nextTick $watch

    return Vue;

}));
//# sourceMappingURL=vue.js.map
