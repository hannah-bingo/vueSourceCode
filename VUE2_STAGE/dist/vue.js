(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _iterableToArrayLimit(arr, i) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
      var _s,
        _e,
        _x,
        _r,
        _arr = [],
        _n = !0,
        _d = !1;
      try {
        if (_x = (_i = _i.call(arr)).next, 0 === i) {
          if (Object(_i) !== _i) return;
          _n = !1;
        } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
      } catch (err) {
        _d = !0, _e = err;
      } finally {
        try {
          if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
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
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
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
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  // 希望重写数组中的部分方法

  var oldArrayProto = Array.prototype; // 获取数组的原型

  // Array.prototype.push = function () {

  // }

  // newArrayProto.__proto__ = oldArrayProto
  var newArrayProto = Object.create(oldArrayProto);
  var methods = [
  // 找到所有的变异方法
  'push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice']; // concat slice  都不会改变原数组

  methods.forEach(function (method) {
    // arr.push(1,2,3)
    newArrayProto[method] = function () {
      var _oldArrayProto$method;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      // 这里重写了数组的方法
      // push()
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); // 内部调用原来的方法，函数的劫持，切片编程

      // 对新增的数据再次进行劫持
      var inserted;
      var ob = this.__ob__;
      // 需要对新增的数据再次进行劫持
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;
        case 'splice':
          // arr.splice(0,1 , {a:1}, {b:1})
          inserted = args.slice(2);
      }

      //    console.log(inserted);    // 新增的内容
      if (inserted) {
        // 对新增的内容再次进行观测
        // 对新增的内容再次进行观测
        ob.observeArray(inserted);
      }
      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);
      // debugger;
      // Object.defineProperty只能劫持已经存在的属性（vue里面会为此单独写一些api $set $delete）
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false // 将___ob__变成不可枚举（循环的时候无法获取到）
      });
      // data.__ob__ = this;
      if (Array.isArray(data)) {
        // 重写数组中的七个变异方法，可以修改数组本身的
        // data.__proto__ = {    // 保留数组原有的特性，并且可以重写部分方法
        //     push() {
        //         console.log('重写的push');
        //     }
        // }
        data.__proto__ = newArrayProto;
        // this.observerArray(data)    // 如果数组中存放的是对象，可以监控到对象的变化
      } else {
        this.walk(data);
      }
    }
    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // 循环对象，对属性依次劫持
        // "重新定义"属性
        Object.keys(data).forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      }
      // observerArray(data) { //观测数组
      //     data.forEach(item => observe(item))
      // }
    }]);
    return Observer;
  }(); // 深层次嵌套会递归，递归多了性能差，不存在属性监控不到，属性
  function defineReactive(target, key, value) {
    // 闭包 属性劫持
    observe(value); // 对所有的对象都进行属性劫持，childOb.dep用来收集依赖
    new Dep(); // 每一个属性都有一个dep
    observe(value); // 对所有的对象都进行属性劫持
    Object.defineProperty(target, key, {
      get: function get() {
        // 取值的时候会执行get
        // console.log('用户取值了');
        return value;
      },
      set: function set(newValue) {
        // console.log('用户设置值了');
        if (newValue === value) return;
        observe(newValue); // 对对象的值再次代理
        value = newValue;
      }
    });
  }
  function observe(data) {
    // debugger
    // 对这个对象进行劫持
    if (_typeof(data) !== 'object' || data === null) {
      return; // 只对对象进行劫持
    }

    if (data.__ob__ instanceof Observer) ;

    // 如果一个对象被劫持了，那就不需要在被劫持了（判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过）
    return new Observer(data);
  }

  var id = 0;

  // 1.有我们创建渲染watcher的时候会把当前的渲染watcher放在Dep.target上
  // 2. 调用_render()会取值走到get上
  // 每个属性有一个dep(属性就是被观察者)，watcher就是观察者(属性变化了会通知观察者来更新) -> 观察者模式
  var Watcher = /*#__PURE__*/function () {
    // 不同组件有不同的watcher，目前只有一个渲染跟实例的
    function Watcher(vm, fn, options) {
      _classCallCheck(this, Watcher);
      this.id = id++;
      this.renderWatcher = options; // 是一个渲染watcher
      this.getter = fn; // getter意味着调用这个函数可以发生取值操作
      this.deps = []; // 后续我们实现计算属性，和一些清理工作需要用到
      this.get();
    }
    _createClass(Watcher, [{
      key: "addDep",
      value: function addDep(dep) {
        // 一个组件 对应着多个属性 重复的属性也不用记录
        var id = dep.id;
        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this); // watcher已经记住了dep了而且去重了，此时让dep也记住了watcher
        }
      }
    }, {
      key: "get",
      value: function get() {
        if (this.lazy) ;
        this.getter(); // 回去vm上取值 vm._update(vm._render) 取name 和age
        mull; // 渲染完毕后就清空
      }
    }, {
      key: "update",
      value: function update() {
        queueWatcher(this); // 把当前的watcher暂存起来
        // this.get();  // 重新渲染
      }
    }, {
      key: "run",
      value: function run() {
        console.log('run');
        this.get();
      }
    }]);
    return Watcher;
  }();
  var has = {};
  function flushSchedulerQueue() {
    queus = [];
    has = {};
    pending = false;
    flushQueus.forEach(function (q) {
      return q.run();
    }); // 在刷新的过程中可能还有新的watcher，重新放在queue中
  }

  function queueWatcher(watcher) {
    var id = watcher.id;
    if (!has[id]) {
      has[id] = true;
      // 不管我们的update执行多少次，但是最终只执行一轮刷新操作
      if (!pending) {
        setTimeout(flushSchedulerQueue, 0);
        pending = true;
      }
    }
  }
  var callbacks = [];
  function flushCallbacks() {
    var cbs = callbacks.slice(0);
    callbacks = [];
    cbs.forEach(function (cb) {
      return cb();
    });
  }
  if (Promise) ; else if (MutationObserver) {
    new MutationObserver(flushCallbacks); // 这里传入的回调时异步执行的
    var textNode = ducument.createTextNode(1);
    observer.observe(textNode, {
      characterData: true
    });
  } else if (setImmediate) ; else ;

  // 初始化状态:watch,computed,
  function initState(vm) {
    var opts = vm.$options; // 获取所有的选项
    if (opts.data) {
      initData(vm);
    }
  }
  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      // vm.name
      get: function get() {
        // console.log('ok');
        return vm[target][key]; // vm._data.name
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }
  function initData(vm) {
    var data = vm.$options.data; //data可能是函数和对象
    data = typeof data === 'function' ? data.call(vm) : data;
    // debugger
    // console.log(data);

    vm._data = data;
    // 对数据进行劫持vue2 里采用了一个api defineProperty
    observe(data);

    // 将vm._data用来代理就可以了
    for (var key in data) {
      proxy(vm, '_data', key);
    }
  }

  // html转换成ast树
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 他匹配到的分组是一个 标签名  <xxx 匹配到的是开始 标签的名字
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配的是</xxxx>  最终匹配到的分组就是结束标签的名字
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性
  // 第一个分组就是属性的key value 就是 分组3/分组4/分组五
  var startTagClose = /^\s*(\/?)>/; // <div> <br/>

  // vue3采用的不是使用正则
  function parseHTML(html) {
    // html最开始肯定是一个</div>
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var currentParent; // 指向的是栈中的最后一个

    // 最终需要转换为一颗抽象语法树
    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }
    function start(tag, attrs) {
      var node = createASTElement(tag, attrs); // 创建一个ast节点
      if (!root) {
        // 看一下是否是空数
        root = node; // 如果为空则当前是树的根节点
      }

      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
      }
      currentParent = node; // currentParent为战中的最后一个
    }

    function chars(text) {
      // 文本直接放在当前指向的节点中
      text = text.replace(/\s/g, '');
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
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
        advance(start[0].length);
        // console.log(match,html);
        // 如果不是开始标签的结束，就一直匹配下去
        var attr, _end;
        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
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
      // 如果textENd为0，说明一个开始标签或者结束标签
      // 如果textEnd > 0 说明就是文本的结束位置
      var textEnd = html.indexOf('<'); // 如果indexof中的索引是0，则说明是个标签

      if (textEnd == 0) {
        var startTagMatch = parseStartTag(); // 开始标签的匹配结果

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          // console.log(html);
          continue;
        }
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          advance(endTagMatch[0].length);
          continue;
        }
      }
      if (textEnd > 0) {
        var text = html.substring(0, textEnd); // 文本内容
        if (text) {
          chars(text);
          advance(text.length); // 解析到的文本
          // console.log(html);
        }

        break;
      }
    }
    console.log(html);
    return root;
  }

  function genProps(attrs) {
    var str = ''; // {name,value}
    var _loop = function _loop() {
      var attr = attrs[i];
      if (attr.name === 'style') {
        var obj = {};
        attr.value.split(';').forEach(function (item) {
          var _item$split = item.split(':'),
            _item$split2 = _slicedToArray(_item$split, 2),
            key = _item$split2[0],
            value = _item$split2[1];
          obj[key] = value;
        });
        attr.value = obj;
      }
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    };
    for (var i = 0; i < attrs.length; i++) {
      _loop();
    }
    return "{".concat(str.slice(0, -1), "}");
  }
  function genChildren(el) {
    var children = el.children;
    if (children) {
      return children.map(function (item) {
        return genChildren(child).join(',');
      });
    }
  }
  function codegen(ast) {
    var children = genChildren(ast);
    var code = "\n        _c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length ? ",".concat(children) : '', "\n    )");
    return code;
  }
  function compileToFunction(template) {
    // 1. 将template转化为ast语法树
    var ast = parseHTML(template);
    // 2. 生成render方法(render方法执行后的返回结果就是 虚拟DOM)
    var code = codegen(ast);
    code = "with(this){return ".concat(code, "}");
    var render = new Function(code); // 根据代码生成render函数
    console.log(render.toString());
    // render(h) {
    //     return _c('div',{id: 'app'}, _c('div',{style: {color:'red'}}, _v(_s(name)+'hello'),_c('span',undefined,_v(_s(age)))))
    // } 

    // // 模板引擎的实现原理，就是with + new Function
    // function render(){
    //     with(this){ return _c }
    // }
    // render.call(vm);
    return render;
  }

  function initMixin(Vue) {
    // 就是给Vue增加init方法的
    Vue.prototype._init = function (options) {
      // 用于初始化操作
      // vue  vm.$options 就是获取用户的配置
      // 我们使用的vue的时候，$nextTick $data $attr
      var vm = this;
      this.$options = options; // 将用户的选项挂载到实例上

      // 初始化状态:watch,computed,
      initState(vm);
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
        var template; // 没有render看一下是否写了tempate，没写template采用外部的template
        if (!ops.template && el) {
          // 没有写模板，但是写了el
          template = el.outerHTML;
        } else {
          if (el) {
            template = ops.template; // 如果el，则采用模板的内容
          }
        }
        // 写了template，就用写了的template
        // console.log(template);
        if (template && el) {
          // 对模板进行编译
          var render = compileToFunction(template);
          ops.render = render; // jsx最终会被编译成h('xxx')
        }
      }

      mountComponent(vm, el); // 组件的挂载
      // 最终就可以获取render方法
      // script 标签引用的vue.global.js这个编译过程实在浏览器运行的
      // runtime是不包含模板编译的，整个编译是打包的时候通过loader来转义.vue文件的，用runtime的时候不能使用template
    };

    ops.render; // 最终就可以获取render方法
  }

  // 将所有的方法都耦合在一起
  function Vue(options) {
    // debugger
    // options就是用户的选项
    this._init(options);
  }
  initMixin(Vue); // 扩展了init方法
  init();

  // 最终调用的都是这个方法
  Vue.prototype.$watch = function (exprOrFn, cb) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    console.log(exprOrFn, cb, options);
    // first
    new Watcher(this, exprOrFn, {
      user: true
    }, cb);
  };

  return Vue;

}));
//# sourceMappingURL=vue.js.map
