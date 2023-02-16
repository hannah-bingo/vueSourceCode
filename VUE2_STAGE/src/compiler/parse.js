// html转换成ast树
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
// <xxx></xxx>
// <namespace:xxx></namespace:xxx>
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 他匹配到的分组是一个 标签名  <xxx 匹配到的是开始 标签的名字
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);  // 匹配的是</xxxx>  最终匹配到的分组就是结束标签的名字
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;  // 匹配属性
// 第一个分组就是属性的key value 就是 分组3/分组4/分组五
const startTagClose = /^\s*(\/?)>/;  // <div> <br/>
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}}/g;  //{{ dfdf }}  匹配到的就是内容就是我们表达式的变量

// vue3采用的不是使用正则
export function parseHTML(html) {   // html最开始肯定是一个</div>
    const ELEMENT_TYPE = 1;
    const TEXT_TYPE = 3;
    const stack = [];   // 用来存放元素的
    let currentParent;   // 指向的是栈中的最后一个

    // 最终需要转换为一颗抽象语法树
    function createASTElement(tag,attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        }
    }
    function start(tag,attrs) {
        let node = createASTElement(tag, attrs);   // 创建一个ast节点
        if(!root) {// 看一下是否是空数
            root = node   // 如果为空则当前是树的根节点
        }
        if(currentParent) {
            node.parent = currentParent;
            currentParent.children.push(node)
        }
        stack.push(node)
        currentParent = node;  // currentParent为战中的最后一个
    }
    function chars(text){    // 文本直接放在当前指向的节点中
        text = text.replace(/\s/g,'')
        text && currentParent.children.push({
            type: TEXT_TYPE,
            text,
            parent: currentParent
        })
    }
    function end(tag){
        let node = stack.pop();   // 弹出最后一个，校验标签是否合法
        currentParent = stack[stack.lemgth - 1];
    }
    function advance(n){
        html = html.substring(n)
    }
    function parseStartTag() {
        const start = html.match(startTagOpen);
        if(start){
            const match = {
                tagName: start[1],   // 标签名
                attrs: []
            }
            advance(start[0].length);
        }
        // console.log(match,html);
        // 如果不是开始标签的结束，就一直匹配下去
        let attr,end
        while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            advance(attr[0].length)
            match.attrs.push({name:attr[1],value:attr[3] || attr[4] || attr[5]})
        }
        if(end) {
            advance(end[0].length)
        }
        return match;
    }
        return false;  // 不是开始标签
    }
    while(html) {
        // 如果textENd为0，说明一个开始标签或者结束标签
        // 如果textEnd > 0 说明就是文本的结束位置
        let textEnd = html.indexOf('<');   // 如果indexof中的索引是0，则说明是个标签

        if(textEnd == 0) {
            const startTagMatch = parseStartTag();   // 开始标签的匹配结果

            if(startTagMatch) {
                start(startTagMatch.tagName,startTagMatch.attrs)
                // console.log(html);
                continue
            }

            let endTagMatch = html.match(endTag)
            if(endTagMatch){
                advance(endTagMatch[0].length);
                continue;
            }
        }
        if(textEnd > 0) {
            let text = html.substring(0, textEnd);   // 文本内容
            if(text) {
                chars(text);
                advance(text.length);     // 解析到的文本
                // console.log(html);
            } 
            break;
        }
    }
    console.log(html);
    return root;
}
