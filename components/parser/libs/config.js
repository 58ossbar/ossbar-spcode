/* 配置文件 */
const canIUse = wx.canIUse('editor'); // 高基础库标识，用于兼容
const Prism = require('./prism.js');
module.exports = {
  // 出错占位图
  errorImg: 'https://6874-html-foe72-1259071903.tcb.qcloud.la/error.jpg?sign=c224195f83974f1403f3e03aedc21149&t=1590221293',
  // 过滤器函数
  filter(node, cxt) {
    // 使得 pre 不被 rich-text 包含（为实现长按复制）
    if (node.name == 'input')
      cxt.bubble();
    if (node.name == 'pre')
      cxt.bubble();
    // markdown 表格间隔背景色
    if(node.name == 'table' && (cxt.options.tagStyle || {}).table) {
      var arr = node.children[1].children;
      for(var i = 1; i < arr.length; i += 2)
        arr[i].attrs.style = 'background-color:#f6f8fa';
    }
  },
  // 代码高亮函数
  highlight(content, attrs) {
    var lan = '';
    if(attrs.class){
      var attrsArr = attrs.class.match(/language-([a-z-]+).*?/m);
      lan = (attrsArr && attrsArr[1])?(attrsArr[1]):'';
    }
    var info = content.match(/<code.*?>([\s\S]+)<\/code.*?>/m);
    if(info && info[1]){
      content = info[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
      attrs['data-content'] = content; // 记录原始内容，长按复制时使用
    }
    if(lan){
      content = Prism.highlight(content, Prism.languages[lan], lan);
    }
    return content;
  },
  // 文本处理函数
  onText: null,
  // 实体编码列表
  entities: {
    quot: '"',
    apos: "'",
    semi: ';',
    nbsp: '\xA0',
    ndash: '–',
    mdash: '—',
    middot: '·',
    lsquo: '‘',
    rsquo: '’',
    ldquo: '“',
    rdquo: '”',
    bull: '•',
    hellip: '…',
    para: '¶',
    amp: '&',
    lt: '<',
    gt: '>',
    yen: '¥',
    copy: '©',
  },
  blankChar: makeMap(' ,\xA0,\t,\r,\n,\f'),
  boolAttrs: makeMap('autoplay,autostart,controls,ignore,loop,muted'),
  // 块级标签，将被转为 div
  blockTags: makeMap('address,article,aside,body,caption,center,cite,footer,header,html,nav,section' + (canIUse ? '' : ',pre')),
  // 将被移除的标签 ,input
  ignoreTags: makeMap('area,base,canvas,frame,iframe,link,map,meta,param,script,source,style,svg,textarea,title,track,wbr' + (canIUse ? ',rp' : '')),
  // 只能被 rich-text 显示的标签
  richOnlyTags: makeMap('a,colgroup,fieldset,legend,table' + (canIUse ? ',bdi,bdo,rt,ruby' : '')),
  // 自闭合的标签
  selfClosingTags: makeMap('area,base,br,col,circle,ellipse,embed,frame,hr,img,input,line,link,meta,param,path,polygon,rect,source,track,use,wbr'),
  // 信任的标签
  trustTags: makeMap('a,abbr,ad,audio,b,blockquote,br,code,col,colgroup,dd,del,dl,dt,div,em,fieldset,h1,h2,h3,h4,h5,h6,hr,i,img,ins,label,legend,li,ol,p,q,source,span,strong,sub,sup,table,tbody,td,tfoot,th,thead,tr,title,ul,video,input' + (canIUse ? ',bdi,bdo,caption,pre,rt,ruby' : '')),
  // 默认的标签样式
  userAgentStyles: {
    address: 'font-style:italic',
    big: 'display:inline;font-size:1.2em',
    blockquote: 'background-color:#f6f6f6;border-left:3px solid #dbdbdb;color:#6c6c6c;padding:5px 0 5px 10px',
    caption: 'display:table-caption;text-align:center', // ;border:1px solid #bbb
    center: 'text-align:center',
    cite: 'font-style:italic',
    dd: 'margin-left:40px',
    mark: 'background-color:yellow',
    pre: 'font-family:monospace;white-space:pre;overflow:scroll',
    s: 'text-decoration:line-through',
    small: 'display:inline;font-size:0.8em',
    u: 'text-decoration:underline',
    table: 'border-collapse:collapse;', // border:1px solid #bbb;
    // td: 'border:1px solid #bbb;display: table-cell;'
  }
}

function makeMap(str) {
  var map = Object.create(null),
    list = str.split(',');
  for (var i = list.length; i--;)
    map[list[i]] = true;
  return map;
}