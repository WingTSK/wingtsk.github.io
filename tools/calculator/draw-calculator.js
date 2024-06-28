/*
 * Copyright (c) 2020-2024 WingTSK
 * 
 * draw-calculator.js */version = '0.3.2.2'; /* 2024-06-28
 */

let cards_counter = [];
let cg_index = [];
let con_counter = [];
  
/* Get URL Query Parameters */
queryParam = (function(){
  let obj = {};
  let urlquery = location.search.substring(1);
  if (urlquery.length > 0){
    let param = urlquery.split('&');
    for (let i = 0; i < param.length; i = i + 1){
      if (param[i].indexOf('=') > 0){
        let item = param[i].split('=');
        obj[item[0]] = item[1];
      }
    }
  };
  return obj;
})();

/* const */
const $cid = function(cid){return document.querySelector('[cid="' + String(cid) + '"]');};
const $cgid = function(cgid){return document.querySelector('[cgid="' + String(cgid) + '"]');};
const $con = function(cgid, conid){return $cgid(cgid).querySelector('[conid="' + String(conid) + '"].condition');};
const $conand = function(cgid, conid){return $cgid(cgid).querySelector('[conid="' + String(conid) + '"].andblock');};
const NUMBER_DECIMIAL_PLACES = 4;

/* polyfill */

// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
if (!Array.prototype.fill) {
  Object.defineProperty(Array.prototype, 'fill', {
    value: function(value) {
      if (this == null) {
        throw new TypeError('this is null or not defined');
      }
      var O = Object(this);
      var len = O.length >>> 0;
      var start = arguments[1];
      var relativeStart = start >> 0;
      var k = relativeStart < 0 ?
        Math.max(len + relativeStart, 0) :
        Math.min(relativeStart, len);
      var end = arguments[2];
      var relativeEnd = end === undefined ?
        len : end >> 0;
      var final = relativeEnd < 0 ?
        Math.max(len + relativeEnd, 0) :
        Math.min(relativeEnd, len);
      while (k < final) {
        O[k] = value;
        k++;
      }
      return O;
    }
  });
}

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {
  Array.prototype.map = function(callback/*, thisArg*/) {
    var T, A, k;
    if (this == null) {
      throw new TypeError('this is null or not defined');
    }
    var O = Object(this);
    var len = O.length >>> 0;
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }
    if (arguments.length > 1) {
      T = arguments[1];
    }
    A = new Array(len);
    k = 0;
    while (k < len) {
      var kValue, mappedValue;
      if (k in O) {
        kValue = O[k];
        mappedValue = callback.call(T, kValue, k, O);
        A[k] = mappedValue;
      }
      k++;
    }
    return A;
  };
}
/* */

Array.prototype.uniq = function (){
  if (!Array.from){
    return this.filter(function (x, i, self){return self.indexOf(x) === i;});
  }else{
    return Array.from(new Set(this));
  }
}

Array.prototype.uniqObj = function (){
  return this.map(function (x){return JSON.stringify(x)}).uniq().map(function (x){return JSON.parse(x)});
}

function sumArray(ary){
  let s = ary[0];
  for (let i = 1; i < ary.length; i += 1){
    s += ary[i];
  }
  return s;
}

function combination(n, r){
  if (n >= r && r >= 0){
    let k = Math.min(r, n - r);
    let c = 1;
    for (let i = 0; i < k; i += 1){
      c = c * (n - i) / (1 + i);
    }
    return c;
  }else{
    return 0;
  }
}

function pascal_triangle(n){
  let a = [];
  for (let i = 0; i <= n; i += 1){
    let b = [];
    for (let j = 0; j <= i/2; j += 1){
      if (i === 0 || j === 0){
        b.push(1);
      }else{
        if (j === i / 2){
          b.push(a[i - 1][j - 1] * 2);
        }else{
          b.push(a[i - 1][j - 1] + a[i - 1][j]);
        }
      }
    }
    a.push(b);
  }
  return a;
}

function combination_pt(n, r, pt){
  if (n >= r && r >= 0){
    if (typeof(pt) !== 'undefined'){
      let k = Math.min(r, n - r);
      return pt[n][k];
    }else{
      return combination(n, r);
    }
  }else{
    return 0;
  }
}

function makeCoordinates(deck, hand, cnums){
  let other = deck - sumArray(cnums);
  let coordinate = new Array(cnums.length).fill(0);
  let cv = 0;
  let depth = 0;
  let rtn = [];
  pushCoordinate(hand, cnums, other, coordinate, cv, depth, rtn);
  return rtn.slice();
}

function pushCoordinate(hand, cnums, other, coordinate, cv, depth, rtn){
  for (coordinate[depth] = 0; cv + coordinate[depth] <= hand; coordinate[depth] = (coordinate[depth] + 1)){
    if (coordinate[depth] <= cnums[depth]){
      if (depth < coordinate.length - 1){
        pushCoordinate(hand, cnums, other, coordinate, cv + coordinate[depth], depth + 1, rtn);
      }else{
        if (other >= hand - (cv + coordinate[depth])){
          rtn.push(coordinate.slice());
        }
      }
    }
  }
}

function calcResult(deck, hand, cnums, condition, pt){
  let other = deck - sumArray(cnums);
  let coordinate = new Array(cnums.length).fill(0);
  let coorlen = coordinate.length - 1;
  let cv = 0;
  let depth = 0;
  let pattern = 1;
  return patCalcResult(hand, cnums, condition, other, coordinate, coorlen, cv, depth, pattern, pt);
}

function patCalcResult(hand, cnums, condition, other, coordinate, coorlen, cv, depth, pattern, pt){
  let rtn = 0;
  let cd = cnums[depth];
  for (coordinate[depth] = 0; cv + coordinate[depth] <= hand; coordinate[depth] = (coordinate[depth] + 1)){
    if (coordinate[depth] <= cd){
      let nextpattern = pattern * combination_pt(cd, coordinate[depth], pt);
      if (depth < coorlen){
        rtn = rtn + patCalcResult(hand, cnums, condition, other, coordinate, coorlen, cv + coordinate[depth], depth + 1, nextpattern, pt);
      }else{
        if (other >= hand - (cv + coordinate[depth])){
          if (chkPattern(coordinate, condition)){
            rtn = rtn + (nextpattern * combination_pt(other, hand - (cv + coordinate[depth]), pt));
          }  
        }
      }
    }
  }
  return rtn;
}

function chkPattern(coordinate, condition){
  let len = condition.length;
  let t = 0;
  let tc = 1;
  for (let i = 0; i < len && t === 0; i += 1){
    tc = 1;
    for (let j = 0, jl = condition[i].length; j < jl && tc === 1; j += 1){
      if (coordinate[j] < condition[i][j][0] || coordinate[j] > condition[i][j][1]){
        tc = 0;
      }
    }
    t = tc;
  }
  return t;
}

function makeDefaultCondition(cnums){
  return new Array(cnums.length).fill().map(function(_, i){
    return [0, cnums[i]];
  });
}

function makeGroupNums(group, cards, cnums){
  return new Array(group.length).fill().map(function(_, i){
    return cnums[cards.indexOf(group[i])];
  });
}

//ブロックごとの指定カードの枚数座標リストの生成
function makeConditionCoordinates(group, cards, cnums, num){
  let groupnums = makeGroupNums(group, cards, cnums);
  return makeCoordinates(sumArray(groupnums), num, groupnums);
}

//ブロックごとの条件[ID-枚数-モード]の生成
function makeConditionBlock(group, conCoor, mode){
  return new Array(conCoor.length).fill().map(function(_, i){
    return new Array(group.length).fill().map(function(_, j){
      return [group[j], conCoor[i][j], mode];
    });
  });
}

//ブロックごとの条件を合成
function makeConditionGroup(a, b){
  let rtn = [];
  let al = a.length;
  let bl = b.length;
  if (Math.min(al, bl) === 0){
    return [];
  }else{
    for (let i = 0; i < al; i += 1){
      for (let j = 0; j < bl; j += 1){
        rtn.push([].concat(a[i]).concat(b[j]));
      }
    }
    return rtn;
  }
}

function chkCondition(con, cnums){
  let len = con.length;
  let chk = 1;
  for (let i = 0; i < len; i += 1){
    if (con[i][0] > cnums[i] || con[i][1] < 0 || con[i][0] > con[i][1]){
      chk = 0;
    }
  }
  return chk;
}

function makeConTemp(cards, cnums, consource){
  let conTemp = [];
  for (let i=0, cslen = consource.length; i < cslen; i += 1){
    let csBlock = consource[ i ];
    let blocklen = csBlock.length;
    let conGroup = new Array(blocklen).fill().map(function(_, j){
      let ids = csBlock[j][0], num = csBlock[j][1], mode = csBlock[j][2];
      return makeConditionBlock(
        ids,
        makeConditionCoordinates(
          ids,
          cards,
          cnums,
          num
        ),
        mode
      )
    });
    let tmpary = conGroup[0];
    for (let m = 1; m < blocklen; m += 1){
      tmpary = makeConditionGroup(tmpary, conGroup[m]);
    }
    conTemp = conTemp.concat(tmpary.slice());
  }
  return conTemp;
}

/*条件配列の変換 consource : [[[[id, id, ...], num, mode], ...], ...]
 * => conTemp : [[[id, num, mode], [id, num, mode], ...], ...]
 * => condition : [[[min, max], [min, max], ...], ...]
 */
function makeCondition(cards, cnums, consource){
  let rtn = [];
  let conTemp = makeConTemp(cards, cnums, consource);
  let def = JSON.stringify(makeDefaultCondition(cnums));
  for (let i = 0, templen = conTemp.length; i < templen; i += 1){
    let rt = JSON.parse(def);
    for (let j = 0, idslen = conTemp[i].length; j < idslen; j += 1){
      let c = conTemp[i][j];
      let id = c[0], num = c[1], mode = c[2];
      let index = cards.indexOf(id);
      if (mode === 0){
        rt[index][0] = rt[index][0] + num;
      }else if (mode === 1){
        if (rt[index][0] === 0 && rt[index][1] === cnums[index]){
          rt[index][0] = num;
          rt[index][1] = num;
        }else{
          rt[index][1] = -1;
        }
      }else if (mode === 2){
        rt[index][1] = rt[index][1] - num;
      }else if (mode === 3){
        if (rt[index][0] === 0 && rt[index][1] === cnums[index]){
          rt[index][0] = cnums[index] - num;
          rt[index][1] = cnums[index] - num;
        }else{
          rt[index][1] = -1;
        }
      }else if (mode === 4){
        if (num === 1){
          rt[index][0] = rt[index][0] + num;
        }else if (num > 1){
          rt[index][1] = -1;
        }
      }else if (mode === 5){
        if (num === 1){
          rt[index][0] = rt[index][0] + num;
        }else if (num > 1){
          rt[index][1] = -1;
        }else if (num === 0){
          if (rt[index][0] === 0 && rt[index][1] === cnums[index]){
            rt[index][1] = 0; /* rt[index][1] - cnums[index]; */
          }else{
            rt[index][1] = -1;
          }
        }
      }else if (mode === 6){
        if (num === 1){
          rt[index][1] = rt[index][1] - num;
        }else if (num > 1){
          rt[index][1] = -1;
        }
       }else if (mode === 7){
        if (num === 1){
          rt[index][1] = rt[index][1] - num;
        }else if (num > 1){
          rt[index][1] = -1;
        }else if (num === 0){
          if (rt[index][0] === 0 && rt[index][1] === cnums[index]){
            rt[index][0] = cnums[index];
          }else{
            rt[index][1] = -1;
          }
        }
      }
    }
    rtn.push(rt.slice());
  }
  //最適化
  return rtn.filter(function (x){return chkCondition(x, cnums)}).uniqObj();
}

function addCard(){
  let newcard = document.createElement("div");
  let cid = String(1);
  if (cards_counter.length){
    cid = String(cards_counter[cards_counter.length - 1] + 1);
  }
  cards_counter.push(Number(cid));
  newcard.setAttribute("id", "card"+cid);
  newcard.setAttribute("cid", cid);
  newcard.className = "card";
  newcard.innerHTML = [
    '<div class="delbutton" onclick="deleteCard(', cid, ')" title="カードを消去">',
      '<div class="delmark">',
        
      '</div>',
    '</div>',
    '<div class="settingarea">',
      '<span class="settinglabel">','カード名:','</span>',
      '<input type="text" class="cardname" placeholder="カード名" size="20" value="カード', cid, '" onchange="updateOption(', cid, ')" cid="', cid, '">',
      '<br class="settinglabel">',
      '／','<span class="settinglabel">','投入枚数:','</span>',
      '<input type="number" class="cardnum" size="15" placeholder="枚数" min="0" max="255" onclick="this.select();" cid="', cid, '">',
      '枚',
    '</div>'
    ].join('');
  let csbox = document.querySelector("#cardsetbox");
  let addc = document.querySelector("#addcard");
  csbox.insertBefore(newcard, addc);
  let cls = document.querySelectorAll(".selectcondition");
  let clsl = cls.length;
  for (let i = 0; i < clsl; i += 1){
    let newoption = document.createElement("li");
    newoption.setAttribute("checked","0");
    newoption.setAttribute("onclick","selectmulti(this)");
    newoption.setAttribute("value",cid);
    newoption.innerText = "カード" + cid;
    cls[i].querySelector(".selectbox").appendChild(newoption);
  }
  refselectmulti(cls);
}

function deleteCard(num){
  let cid = String(num)
  let deltarget = $cid(cid);
  deltarget.parentNode.removeChild(deltarget);
  cards_counter = cards_counter.filter(function(item,index){
    if (item !== num) return true;
  });
  let vg = document.querySelectorAll(".selectcondition");
  let vgl = vg.length;
  for (let i = 0; i < vgl; i += 1){
    let deltarget = vg[i].querySelector('.selectbox > [value="' + cid + '"]');
    deltarget.parentNode.removeChild(deltarget);
  }
  refselectmulti(vg);
}

function addCon(num){
  let index = cg_index.indexOf(num);
  let cgid = String(num)
  if (index < 0){
    return false;
  }else{
    let newcon = document.createElement("div");
    let newandblock = document.createElement("div");
    let conid = String(1);
    if (con_counter[index].length){
      conid = String(con_counter[index][con_counter[index].length - 1] + 1);
    }
    newcon.setAttribute("id", "con_" + cgid + "_" + conid);
    newcon.setAttribute("conid", conid);
    newcon.className = "condition";
    let clist = ('');
    for (let i = 0; i < cards_counter.length; i += 1){
      let ci = String(cards_counter[i]);
      let cn = $cid(ci).querySelector('.cardname').value.replace(/[<>&"]/g, function (char) { return ({'<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;'})[char]});
      clist = clist + '<li checked="0" onclick="selectmulti(this)" value="' + ci + '">' + cn + '</li>';
    }
    newcon.innerHTML = [
      '<div class="delbutton" onclick="deleteCon(', cgid, ',', conid, ')" title="条件を消去">',
        '<div class="delmark">',
          
        '</div>',
      '</div>',
      '<div class="coninner">',
        '<div class="selectcondition select">',
          '<span class="selectmsg" msg="0" opened="0" onclick="menuopen(this); event.stopPropagation()">',
            '<div class="defaultmsg">(未選択)</div>',
            '<div class="singleselect"></div>',
            '<div class="multiselect">(<span class="count">count</span>種類選択中)</div>',
          '</span>',
          '<ul class="selectbox" onclick="event.stopPropagation()">',
          clist,
          '</ul>',
        '</div>',
        '<div class="condition_mn">',
          '<div class="setteingcon_n">',
            '<span class="settinglabel">','／','</span>',
            '<input type="number" class="condition_n" name="condition_n_', cgid, '_', conid, '" size="15" placeholder="枚数" min="0" max="255" onclick="this.select();">',

            '<div class="condition_cs select">',
              '<span class="selectmsg" msg="1" opened="0" onclick="menuopen(this)">',
                '<div class="defaultmsg"></div>',
                '<div class="singleselect">枚</div>',
              '</span>',
              '<ul class="selectbox">',
                '<li selected="1" value="0" onclick="selectsingle(this)">枚</li>',
                '<li selected="0" value="1" onclick="selectsingle(this)">種類</li>',
              '</ul>',
            '</div>',

          '</div>',
          '<div class="condition_m select">',
            '<span class="selectmsg" msg="1" opened="0" onclick="menuopen(this)">',
              '<div class="defaultmsg"></div>',
              '<div class="singleselect">以上ドロー</div>',
            '</span>',
            '<ul class="selectbox">',
              '<li class="menumsg" onclick="event.stopPropagation()">▼モード▼</li>',
              '<li selected="1" value="0" onclick="selectsingle(this)">以上ドロー</li>',
              '<li selected="0" value="1" onclick="selectsingle(this)">ちょうどドロー</li>',
              '<li selected="0" value="2" onclick="selectsingle(this)">以上デッキに残す</li>',
              '<li selected="0" value="3" onclick="selectsingle(this)">ちょうどデッキに残す</li>',
            '</ul>',
          '</div>',
        '</div>',
      '</div>'
      ].join('');
    /** */
    let inner = $cgid(cgid).querySelector(".congroupinner");
    if (conid !== '1'){
      newandblock.setAttribute("conid", String(con_counter[index][con_counter[index].length - 1]));
      newandblock.className = "andblock";
    /** newandblock.inner */
      let newandmark = document.createElement("span");
      newandmark.className = "andmark";
      newandmark.innerHTML = "";
      newandblock.appendChild(newandmark);

      inner.appendChild(newandblock);
    }
    inner.appendChild(newcon);
    con_counter[index].push(Number(conid));
  }
}

function deleteCon(cgid, conid){
  let cgindex = cg_index.indexOf(cgid);
  let conindex = con_counter[cgindex].indexOf(conid);
  if (con_counter[cgindex].length > 1){
    let targetcon = $con(cgid, conid);
    let targetaddblock = $conand(cgid, conid);
    if (conindex === con_counter[cgindex].length - 1){
      targetaddblock = $conand(cgid, con_counter[cgindex][conindex - 1]);
    }
    targetcon.parentNode.removeChild(targetcon);
    targetaddblock.parentNode.removeChild(targetaddblock);
    con_counter[cgindex] = con_counter[cgindex].filter(function(item,index){
      if (item !== conid) return true;
    });
  }else{
    let targetcongroup = $cgid(cgid);
    targetcongroup.parentNode.removeChild(targetcongroup);
    con_counter = con_counter.filter(function(item,index){
      if (index !== cgindex) return true;
    });
    cg_index = cg_index.filter(function(item,index){
      if (item !== cgid) return true;
    });
  }
}

function addConGroup(){
  let newcongroup = document.createElement("div");
  let cgid = String(1);
  if (cg_index.length){
    cgid = String(cg_index[cg_index.length - 1] + 1);
  }
  cg_index.push(Number(cgid));
  con_counter.push([]);
  newcongroup.setAttribute("id", "congroup"+cgid);
  newcongroup.setAttribute("cgid", cgid);
  newcongroup.className = "congroup";
  newcongroup.innerHTML = [
    '<div class="congroupinner">',
      '<div id="conbase', cgid, '" class="conbase">',
        '<div class="coninner">',
          '<div class="contxt">',
            'パターン', cgid, '：',
          '</div>',
          '<div class="output">',
            '条件を設定してください。',
          '</div>',
        '</div>',
      '</div>',
      '<div class="conblock">',
        '<span class="conmark"><span>',
      '</div>',
    '</div>',
    '<div class="addconwrap">',
      '<div class="addcon" onclick="addCon(', cgid, ')" title="条件を追加">',
        '<span class="andconmark"><span>',
      '</div>',
    '</div>'
  ].join("");
  let csbox = document.querySelector("#consetbox");
  let acg = document.querySelector("#addcongroup");
  csbox.insertBefore(newcongroup, acg);
  addCon(Number(cgid));
}

function updateOption(num){
  let n = $cid(num).querySelector('.cardname').value;
  let cid = String(num);
  let cls = document.querySelectorAll(".selectcondition");
  let clsl = cls.length;
  for (let i = 0; i < clsl; i += 1){
    cls[i].querySelector('.selectbox > [value="' + cid + '"]').innerText = n;
  }
  refselectmulti(cls);
}

function selectsingle(e){
  let name = e.innerText;
  let list = e.parentNode;
  let menu = list.parentNode;
  let selectmsg = menu.querySelector('.selectmsg');
  let msg = selectmsg.querySelector('.singleselect');
  let selected = list.querySelectorAll('[selected="1"]');
  for (let i = 0, len = selected.length; i < len; i += 1){
    selected[i].setAttribute("selected", "0");
  }
  e.setAttribute("selected", "1");
  selectmsg.setAttribute("msg","1");
  msg.innerText = name;
}

function selectmulti(e){
  if (e.getAttribute("checked") === "0"){
    e.setAttribute("checked", "1");
  }else{
    e.setAttribute("checked", "0");
  }
  let list = e.parentNode;
  let menu = list.parentNode;
  let selectmsg = menu.querySelector('.selectmsg');
  let checked = list.querySelectorAll('[checked="1"]');
  let n = checked.length;
  if (n === 0){
    selectmsg.setAttribute("msg","0");
  }else if (n === 1){
    selectmsg.setAttribute("msg","1");
    let name = checked[0].innerText;
    let msg = selectmsg.querySelector('.singleselect');
    msg.innerText = name;
  }else{
    selectmsg.setAttribute("msg","2");
    let count = selectmsg.querySelector('.multiselect > .count');
    count.innerText = String(n);
  }
}

function refselectmulti(selects){
  let len = selects.length;
  for (i = 0; i < len; i += 1){
    let menu = selects[i];
    let selectmsg = menu.querySelector('.selectmsg');
    let list = menu.querySelector('.selectbox')
    let checked = list.querySelectorAll('[checked="1"]');
    let n = checked.length;
    if (n === 0){
      selectmsg.setAttribute("msg","0");
    }else if (n === 1){
      selectmsg.setAttribute("msg","1");
      let name = checked[0].innerText;
      let msg = selectmsg.querySelector('.singleselect');
      msg.innerText = name;
    }else{
      selectmsg.setAttribute("msg","2");
      let count = selectmsg.querySelector('.multiselect > .count');
      count.innerText = String(n);
    }
  }
}

function menuopen(e){
  if (e.getAttribute("opened") === "0"){
    menuclose();
    e.setAttribute("opened", "1");
  }else{
    e.setAttribute("opened", "0");
  }
  event.stopPropagation();
}
function menuclose() {
  let te = document.querySelectorAll('[opened="1"].selectmsg');
  for (let i = 0, elen = te.length; i < elen; i += 1){
    te[i].setAttribute("opened","0");
  }
}

function getDeckNum(){
  return Number(document.getElementById('deck_n').value);
}

function getHandNum(){
  return Number(document.getElementById('hand_n').value);
}

function getCardsNums(){
  let cards = document.querySelectorAll('.card');
  return new Array(cards.length).fill().map(function(_, i){
    let num = Number(cards[i].querySelector('.cardnum').value);
    if (num > 0){
      return num;
    }else{
      return 0;
    }
  });
}

function makeConSource(){
  let consource = [];
  let cg = document.querySelectorAll('.congroup');
  for (let j = 0, cglen = cg.length; j < cglen; j += 1){
    consource[j] = [];
    let cgid = cg_index[j];
    let conids = con_counter[j];
    let conlen = conids.length;
    for (k = 0; k < conlen; k += 1){
      consource[j][k] = [];
      let conid = conids[k];
      let ary = [];
      let con = $con(cgid, conid);
      let cc = con.querySelectorAll('[checked="1"]');
      for (l = 0, cclen = cc.length; l < cclen; l += 1){
        ary.push(Number(cc[l].getAttribute('value')));
      }
      consource[j][k].push(ary.slice());
      consource[j][k].push(Number(con.querySelector('.condition_n').value));
      consource[j][k].push(Number(con.querySelector('.condition_m').querySelector('[selected="1"]').getAttribute("value")) + 4 * Number(con.querySelector('.condition_cs').querySelector('[selected="1"]').getAttribute("value")));
    }
  }
  return consource;
}

function outputTop(str){
  document.querySelector('#top_output > .output').innerText = str;
}

function outputCon(str, num){
  let rows = document.querySelectorAll(".congroup");
  if (0 <= num && num < rows.length){
    rows[num].querySelector('.output').innerText = str;
  }
}

function outputConAll(str){
  for (let i = 0, len = makeConSource().length; i < len; i += 1){
    outputCon(str, i);
  }
}

function getPersent(p, n){
  if (Number(p) === p && Number(n) === n){
    return Math.round(p * Math.pow(10, n+2)) / Math.pow(10, n);
  }
}

function makeTopOutputMsg(result, deck, hand, pt){
  let drawPat = combination_pt(deck, hand, pt);
  let str = '計算結果：' + getPersent(result / drawPat, NUMBER_DECIMIAL_PLACES) + '％\n';
  if (Math.pow(2,53) - 1 >= drawPat){
    str = str + '(' + result.toLocaleString() + ' ／ ' + drawPat.toLocaleString() + '通り）';
  }
  return str;
}

function drawCalc(){
  console.time('drawCalc');
  let deck = getDeckNum();
  let hand = getHandNum();
  if (256 > deck && deck >= hand && hand >= 0){
    let cards = cards_counter;
    let cnums = getCardsNums();
    if (deck >= sumArray(cnums)){
      let consource = makeConSource();
      let _cards = (function(consource){
        let ary = [];
        for (let i = 0; i < consource.length; i += 1){
          for (let j = 0; j < consource[i].length; j += 1){
            ary = ary.concat(consource[i][j][0]);
          }
        }
        return ary.uniq().sort(function(a, b){
          return a - b;
        });
      })(consource);
      let _cnums = makeGroupNums(_cards, cards, cnums);
      let condition = makeCondition(_cards, _cnums, consource.slice());
      if (condition.length > 0){
        let pt = pascal_triangle(deck);
        let result = calcResult(deck, hand, _cnums, condition, pt);
        outputTop(makeTopOutputMsg(result, deck, hand, pt));
        let cl = consource.length;
        for (let m = 0; m < cl; m += 1){
          let scon = [];
          scon.push(consource[m]);
          let mscon = makeCondition(_cards, _cnums, scon);
          if (mscon.length > 0){
            let msresult = 0;
            if (JSON.stringify(condition) === JSON.stringify(mscon)){
              msresult = result;
            }else{
              msresult = calcResult(deck, hand, _cnums, mscon, pt);
            }
            outputCon('個別' + makeTopOutputMsg(msresult, deck, hand, pt), m);
          }else{
            outputCon('設定された条件は有効ではありません。', m);
          }
        }
      }else{
        outputTop('エラー:\n有効な条件が設定されていません。');
        outputConAll('設定された条件は有効ではありません。');
      }
      condition_ex(deck, hand, cards, cnums, consource);
    }else{
      outputTop('エラー:\n設定したカードの合計枚数が、デッキ枚数を超えています。');
      outputConAll('');
    }
  }else{
    if (deck < hand){
      outputTop('エラー:\n手札の枚数がデッキ枚数を超えています。');
    }else{
      outputTop('エラー:\nデッキまたは手札の枚数は0～255枚の範囲で設定してください。');
    }
    outputConAll('');
  }
  console.timeEnd('drawCalc');
}

function condition_ex(deck, hand, cards, cnums, consource){
  let cnames = [];
  let cng = document.querySelectorAll(".cardname");
  for (let i = 0, cl = cng.length; i < cl; i += 1){
    cnames.push(cng[i].value);
  }
  let str = "xj=" + Base64.toBase64(RawDeflate.deflate(Base64.utob(JSON.stringify([deck, hand, cards, cnames, cnums, consource]))));
  let url = location.href.replace(/\#.*$/, '').replace(/\?.*$/, '') + "?" + str +"#";
  document.querySelector("#export_box").value = url;
  if (document.querySelector("#tweet-area").children.length > 0){
    document.querySelector("#tweet-area").innerHTML="";
  }
  /*IEはTwitterのサポートが終了したので分岐*/
  if (typeof twttr !== 'undefined'){
    twttr.widgets.createShareButton(url, document.getElementById('tweet-area'), { text: "ドロー確率計算機\n確率"+document.querySelector("#top_output > .output").innerText+"でした！\n詳細は->" });
  }
}

function condition_in(){
  if (queryParam.xj || queryParam.x){
    let str = '';
    if (queryParam.xj){
      str = Base64.btou(RawDeflate.inflate(Base64.fromBase64(queryParam.xj)));
    }else{
      str = convertConditionInBeta(queryParam.x);
    }
    let dst = {};
    try {
      JSON.parse(str);
    } catch(e){
      condition_st();
      return false;
    }
    dst = JSON.parse(str);
    if (dst.length === 6){
      document.getElementById('deck_n').value = dst[0];
      document.getElementById('hand_n').value = dst[1];
      let cards = dst[2];
      let cs = cards.length;
      for (let i = 0; i < cs; i += 1){
        addCard();
      }
      let cg = document.querySelectorAll(".card");
      for (let i = 0; i < cs; i += 1){
        cg[i].querySelector(".cardname").value = dst[3][i];
        cg[i].querySelector(".cardnum").value = dst[4][i];      
      }
      for (let j = 0; j < dst[5].length; j += 1){
        addConGroup();
        for (let k = 1; k < dst[5][j].length; k += 1){
          addCon(j+1);
        }
      }
      for (let j = 0; j < dst[5].length; j += 1){
        for (let k = 0; k < dst[5][j].length; k += 1){
          let tcon = $con(j + 1, k + 1);
          tcon.querySelector(".condition_n").value = dst[5][j][k][1];
          selectsingle(tcon.querySelector('.condition_cs > .selectbox > [value="' + String(Math.floor(dst[5][j][k][2] / 4)) + '"]'))
          selectsingle(tcon.querySelector('.condition_m > .selectbox > [value="' + String(dst[5][j][k][2] % 4) + '"]'))
          for (let s = 0; s < dst[5][j][k][0].length; s += 1){
            selectmulti(tcon.querySelector('.selectcondition > .selectbox > [value="'+(String(cards.indexOf(dst[5][j][k][0][s]) + 1))+'"]'));
          }
        }
      }
      drawCalc();
    }else{
      condition_st();
    }
  }else{
    condition_st();
  }
}

function condition_st(){
  addCard();
  addConGroup();
  if (document.querySelector("#tweet-area").children.length > 0){
    document.querySelector("#tweet-area").innerHTML="";
  }
  if (typeof twttr !== 'undefined'){
    twttr.widgets.createShareButton(location.href.replace(/\#.*$/, '').replace(/\?.*$/, ''),
      document.getElementById('tweet-area'),
      {
        text: "ドロー確率計算機\n"
      }
    );
  }
}

function copyToClipboard(target){
  let copyTarget = document.querySelector(target);
  copyTarget.select();
  document.execCommand("Copy");
}

// ページ上部にスクロール
function scrolltop(){
  scrollTo(0, 0);
}

//旧バージョンとの互換用
function convertConditionInBeta(x){
  let dst = Base64.btou(RawDeflate.inflate(Base64.fromBase64(x)));
  let c = dst.split("_$_$");
  c[0] = c[0].split("_$");
  c[1] = c[1].split("_$");
  c[2] = c[2].split("_$");
  
  let deck = Number(c[0][0]);
  let hand = Number(c[0][1]);
  let cards = [];
  for (let i = 1, len = Number(c[0][3]); i <= len; i = (i+1)){
    cards.push(i);
  }
  let cnames = [];
  let cnums = [];
  for (let j = 0, len = c[1].length/2; j < len; j = (j+1)){
    cnames.push(c[1][j*2]);
    cnums.push(Number(c[1][j*2+1]));
  }
  let consource = [];
  for (let s = 0, slen = Number(c[0][2]); s < slen; s = (s+1)){
    let conGroup = [];
    for(t = 0, tlen = c[1].length/2; t < tlen; t = (t+1)){
      if (!(c[2][s*tlen*2+t*2]==="0" && c[2][s*tlen*2+t*2+1]==="0")){
        let num = Number(c[2][s*tlen*2+t*2]);
        let mode = Number(c[2][s*tlen*2+t*2+1]);
        conGroup.push([[t+1], num, mode].slice());
      }
    }
    consource.push(conGroup.slice())
  }
  let rtn = JSON.stringify([deck, hand, cards, cnames, cnums, consource]);
  return rtn;
}


//イベントハンドラ
document.addEventListener('DOMContentLoaded', condition_in);
document.addEventListener('DOMContentLoaded', function (){document.getElementById('version').innerText = 'ver.' + version;});
