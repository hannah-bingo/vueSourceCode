import { parseHTML } from './parse'

function genProps(attrs) {
    let str = ''  // {name,value}
    for(let i = 0; i < attrs.length; i++) {
        let attr = attrs[i];
        if(attr.name === 'style') {
            let obj = {};
            attr.value.split(';').forEach(item => {
                let [key, value] = item.split(':');
                obj[key] = value;
            })
            attr.value = obj;
        }

        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0, -1)}}`
}

function gen(node) {
    if(node.type === 1) {
        return codegen(node);
    }else {
        // 文本
        return 'xxxx'
    }
}
function genChildren(el){
    const children = el.children;
    if(children) {
        return children.map(item => genChildren(child).join(','))
    }
}
function codegen(ast){
    let children = genChildren(ast);
    let code = (`
        _c('${ast.tag}',${
            ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'
        }${
            ast.children.length ? `,${children}`:''
        }
    )`)
    return code;
}
export function compileToFunction(template) {
    // 1. 将template转化为ast语法树
    let ast = parseHTML(template);
    // 2. 生成render方法(render方法执行后的返回结果就是 虚拟DOM)
    let code = codegen(ast);
    code = `with(this){return ${code}}`;
    let render = new Function(code);   // 根据代码生成render函数
    console.log(render.toString());
    // render(h) {
    //     return _c('div',{id: 'app'}, _c('div',{style: {color:'red'}}, _v(_s(name)+'hello'),_c('span',undefined,_v(_s(age)))))
    // } 

    // // 模板引擎的实现原理，就是with + new Function
    // function render(){
    //     with(this){ return _c('div',{ id: 'app', style: {"color":'red',"background":"yellow"} }, _c('div',)  }
    // }
    // render.call(vm);
    return render
}
