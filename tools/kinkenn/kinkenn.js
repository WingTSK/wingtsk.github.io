/*
 * Copyright (c) 2020 WingTSK
 * 
 * kinkenn.js ver.0.0.4 2020-11-01
 * 
 * Based on draw-calculator.js ver.0.3.0
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

Array.prototype.uniq = function (){
  if (!Array.from){
    return this.map(function (x){return JSON.stringify(x)}).filter(function (x, i, self){return self.indexOf(x) === i;}).map(function (x){return JSON.parse(x)});
  }else{
    return Array.from(new Set(this.map(function (x){return JSON.stringify(x)}))).map(function (x){return JSON.parse(x)});
  }
}

function sumArray(ary){
  let s = 0;
  for (let i = 0; i < ary.length; i = (i+1)){
    s = s + ary[i];
  }
  return s;
}

function combination(n, r){
  if (n >= r && r >= 0){
    let k = Math.min(r, n - r);
    let c = 1;
    for (let i = 0; i < k; i = (i+1)){
      c = c * (n - i) / (1 + i);
    }
    return c;
  }else{
    return 0;
  }
}

function pascal_triangle(n){
  let a = [];
  for (let i = 0; i <= n; i = (i+1)){
    let b = [];
    for (let j = 0; j <= i/2; j = (j+1)){
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
    if (typeof(pt) !== "undefined"){
      let k = Math.min(r, n - r);
      return pt[n][k];
    }else{
      return combination(n, r);
    }
  }else{
    return 0;
  }
}

function makeDrawPattern(deck, hand, cnums, pt){
  let other = deck - sumArray(cnums);
  let cnlen = cnums.length - 1;
  let cv = 0;
  let depth = 0;
  let pattern = 1;
  let rtn = [];
  drawPatternCounter(hand, cnums, other, cnlen, cv, depth, pattern, pt, rtn);
  return rtn;
}

function drawPatternCounter(hand, cnums, other, cnlen, cv, depth, pattern, pt, rtn){
  let cd = cnums[depth];
  for (let i = 0; i <= cd; i++){
    if (cv + i <= hand){
      let nextpattern = pattern * combination_pt(cd, i, pt);
      if (cnlen > depth){
        drawPatternCounter(hand, cnums, other, cnlen, cv + i, depth + 1, nextpattern, pt, rtn);
      }else{
        if (other >= hand - (cv + i)){
          nextpattern = nextpattern * combination_pt(other, hand - (cv + i), pt);
          rtn.push(nextpattern);
        }
      }
    }
  }
}

function makeCoordinates(deck, hand, cnums){
  let other = deck - sumArray(cnums);
  let coordinate = [];
  let cv = 0;
  let depth = 0;
  for (let i = 0; i < cnums.length; i = (i+1)){
    coordinate[i] = 0;
  }
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

function calcResult(mkpat,deck, hand, cnums, condition, coordinates, kinkennmode, pt){
  let opt = [];
  for (let i = 0, len = coordinates.length; i < len; i = (i+1)){
    if (chkPattern(coordinates[i], condition)){
      opt.push(1);
    }else{
      opt.push(chkKinkenn(deck, hand, cnums, coordinates[i], condition, kinkennmode, pt));
    }
  }
  return sumArrayOpt(mkpat, opt);
}

function chkKinkenn(deck, hand, cnums, coordinate, condition, kinkennmode, pt){
  if (coordinate[0] > 0){
    let len = condition.length;
    let a = [];
    let b = [];
    let tc = 1;
    for (let i = 0; i < len; i = (i+1)){
      a = [];
      tc = 1;
      for (let j = 1, jl = condition[i].length; j < jl && tc === 1; j = (j+1)){
        if (coordinate[j] > condition[i][j][1]){
          tc = 0;
        }else if (coordinate[j] < condition[i][j][0]){
          for (let x = 0; x < (condition[i][j][0] - coordinate[j]); x += 1){
            a.push(j);
          }
        }
      }
      if (tc === 1 && a.length === 1){
        b.push(a[0]);
      }
    }
    let c = b.uniq();
    let s = 0;
    for (let y = 0, clen = c.length; y < clen; y += 1){
      if (cnums[c[y]] - coordinate[c[y]] > 0){
        s = s + cnums[c[y]] - coordinate[c[y]];
      }
    }
    let q = (1 - (combination_pt(deck - hand - s, kinkennmode, pt) / (combination_pt(deck - hand, kinkennmode, pt))));
    return q;
  }else{
    return 0;
  }
}

function chkPattern(coordinate, condition){
  let len = condition.length;
  let t = 0;
  let tc = 1;
  for (let i = 0; i < len && t === 0; i = (i+1)){
    tc = 1;
    for (let j = 1, jl = condition[i].length; j < jl && tc === 1; j = (j+1)){
      if (coordinate[j] < condition[i][j][0] || coordinate[j] > condition[i][j][1]){
        tc = 0;
      }
    }
    t = tc;
  }
  return t;
}

function sumArrayOpt(ary, optAry){
  let s = 0, al = ary.length, ol = optAry.length;
  if (al === ol){
    for (let i = 0; i < al; i = (i+1)){
      s = s + ary[i] * optAry[i];
    }
  }
  return s;
}

function makeDefaultCondition(cnums, vari){
  let def = [];
  for (let s = 0; s < vari; s = (s+1)){
    let ary = [];
    ary.push(0);
    ary.push(cnums[s]);
    def.push(ary.slice());
  }
  return def;
}

function makeGroupNums(group, cards, cnums){
  let rtn = [];
  for (let i = 0, len = group.length; i < len; i = (i+1)){
    rtn.push(cnums[cards.indexOf(group[i])]);
  }
  return rtn;
}

//ブロックごとの指定カードの枚数座標リストの生成
function makeConditionCoordinates(group, cards, cnums, num){
  let groupnums = makeGroupNums(group, cards, cnums);
  return makeCoordinates(sumArray(groupnums), num, groupnums);
}

//ブロックごとの条件[ID-枚数-モード]の生成
function makeConditionBlock(group, mode, conCoor){
  let gl = group.length;
  let cclen = conCoor.length;
  let rtn = [];
  for (let i = 0; i < cclen; i = (i+1)){
    let rtn0 = [];
    for (let j = 0; j < gl; j = (j+1)){
      let rtn1 = [];
      rtn1.push(group[j]);
      rtn1.push(conCoor[i][j]);
      rtn1.push(mode);
      rtn0.push(rtn1.slice());
    }
    rtn.push(rtn0.slice());
  }
  return rtn;
}

//ブロックごとの条件を合成
function makeConditionGroup(ary1, ary2){
  if (ary1.length + ary2.length){
    let rtn = [];
    let sl = ary1.length;
    let ll = ary2.length;
    if (Math.min(ary1.length, ary2.length) === 0){
      return [];
    }else{
      for (let i = 0; i < sl; i = (i+1)){
        for (let j = 0; j < ll; j = (j+1)){
          rtn.push([].concat(ary1[i]).concat(ary2[j]));
        }
      }
      return rtn;
    }
  }else{
    return [];
  }
}

/*条件配列の変換 consource : [[[[id, id, ...], num, mode], ...], ...]
 * => conTemp : [[[id, num, mode], [id, num, mode], ...], ...]
 * => condition : [[[min, max], [min, max], ...], ...]
 */
function makeCondition(cards, cnums, consource){
  let rtn = [];
  let conTemp = [];
  for (let i=0, ilim = consource.length; i < ilim; i=(i+1)){
    let conGroup = [];
    let csBlock = consource[ i ];
    let jlim = csBlock.length;
    for (let j = 0; j < jlim; j = (j+1)){
      let group = csBlock[j][0];
      let num = csBlock[j][1];
      let mode = csBlock[j][2];
      let conCoor = makeConditionCoordinates(group, cards, cnums, num);
      conGroup.push(makeConditionBlock(group, mode, conCoor));
    }
    let tmpary = conGroup[0];
    for (let m = 1; m < jlim; m = (m+1)){
      tmpary = makeConditionGroup(tmpary, conGroup[m]);
    }
    conTemp = conTemp.concat(tmpary.slice());
  }
  let cgl = conTemp.length;
  let vari = cards.length;
  let def = JSON.stringify(makeDefaultCondition(cnums, vari));
  for (let i = 0; i < cgl; i = (i+1)){
    let rt = JSON.parse(def);
    let conil = conTemp[i].length
    for (let j = 0; j < conil; j = (j+1)){
      let c = conTemp[i][j];
      let index = cards.indexOf(c[0]);
      if (c[2] === 0){
        rt[index][0] = rt[index][0] + c[1];
      }else if (c[2] === 1){
        if (rt[index][0] <= c[1] && rt[index][1] >= c[1]){
          rt[index][0] = rt[index][0] + c[1];
          rt[index][1] = c[1];
        }else{
          rt[index][1] = -1;
        }
      }else if (c[2] === 2){
        rt[index][1] = rt[index][1] - c[1];
      }else if (c[2] === 3){
        if (rt[index][0] <= (cnums[index] - c[1]) && rt[index][1] >= (cnums[index] - c[1])){
          rt[index][0] = rt[index][0] + cnums[index] - c[1];
          rt[index][1] = cnums[index] - c[1];
        }else{
          rt[index][1] = -1;
        }
      }else if (c[2] === 4){
        if (c[1] === 1){
          rt[index][0] = rt[index][0] + c[1];
        }else if (c[1] > 1){
          rt[index][1] = -1;
        }
      }else if (c[2] === 5){
        if (c[1] === 1){
          rt[index][0] = rt[index][0] + c[1];
        }else if (c[1] > 1){
          rt[index][1] = -1;
        }else if (c[1] === 0){
          if (rt[index][0] <= c[1] && rt[index][1] >= c[1]){
            rt[index][0] = 0;
            rt[index][1] = 0;
          }else{
            rt[index][1] = -1;
          }
        }
      }else if (c[2] === 6){
        if (c[1] === 1){
          rt[index][1] = rt[index][1] - c[1];
        }else if (c[1] > 1){
          rt[index][1] = -1;
        }
       }else if (c[2] === 7){
        if (c[1] === 1){
          rt[index][1] = rt[index][1] - c[1];
        }else if (c[1] > 1){
          rt[index][1] = -1;
        }else if (c[1] === 0){
          if (rt[index][0] <= cnums[index] && rt[index][1] >= cnums[index]){
            rt[index][0] = rt[index][0] + cnums[index];
            rt[index][1] = cnums[index];
          }else{
            rt[index][1] = -1;
          }
        }
     }
    }
    rtn.push(rt.slice());
  }
  //最適化
  let rtnlen = rtn.length;
  let minirtn = [];
  if (rtn.length > 0){
    for (let k = 0; k < rtnlen; k = (k+1)){
      let rklen = rtn[k].length;
      let chk = 1;
      for (let m = 0; m < rklen; m = (m+1)){
        if (rtn[k][m][0] > cnums[m] || rtn[k][m][1] < 0 || rtn[k][m][0] > rtn[k][m][1]){
          chk = 0;
        }
      }
      if (chk === 1){
        minirtn.push(rtn[k]);
      }
    }
  }
  return minirtn.uniq();
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
  for (let i = 0; i < clsl; i=(i+1)){
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
  for (let i = 0; i < vgl; i = (i+1)){
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
    con_counter[index].push(Number(conid));
    newcon.setAttribute("id", "con_" + cgid + "_" + conid);
    newcon.setAttribute("conid", conid);
    newcon.className = "condition";
    let clist = ('');
    for (let i = 0; i < cards_counter.length; i=(i+1)){
      let ci = String(cards_counter[i]);
      let cn = $cid(ci).querySelector('.cardname').value
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
    newandblock.setAttribute("conid", conid);
    newandblock.className = "andblock";
    /** newandblock.inner */
    let newandmark = document.createElement("span");
    newandmark.className = "andmark";
    newandmark.innerHTML = "";
    newandblock.appendChild(newandmark);
    /** */
    let inner = $cgid(cgid).querySelector(".congroupinner");
    inner.appendChild(newcon);
    inner.appendChild(newandblock);
  }
}

function deleteCon(cgid, conid){
  let cgindex = cg_index.indexOf(cgid);
  let conindex = con_counter[cgindex].indexOf(conid);
  if (con_counter[cgindex].length > 1){
    let targetcon = $con(cgid, conid);
    let targetaddblock = $conand(cgid, conid);
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
  for (let i = 0; i < clsl; i = (i+1)){
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
  for (let i = 0, len = selected.length; i < len; i = (i+1)){
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
  for (i = 0; i < len; i = (i+1)){
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
  for (let i = 0, elen = te.length; i < elen; i = (i+1)){
    te[i].setAttribute("opened","0");
  }
}

function drawCalc(){
  console.time('calc');
  let deck = Number(document.getElementById('deck_n').value);
  let hand = Number(document.getElementById('hand_n').value);
  if (256 > deck && deck >= hand && hand >= 0){
    let cards = cards_counter;
    let cs = document.querySelectorAll('.card');
    let kinkenn = Number(document.getElementById('kinkenn').querySelector('[selected="1"]').getAttribute("value"));
    let kinkennmode = Number(document.getElementById('kinkenncost').querySelector('[selected="1"]').getAttribute("value"));
    let cnums = [];
    for (let i = 0, cardslen = cs.length; i < cardslen; i = (i+1)){
      cnums.push(Number(cs[i].querySelector('.cardnum').value));
    }
    if (deck >= kinkenn + sumArray(cnums)){
      let consource = [];
      let _cards = [0];
      let cg = document.querySelectorAll('.congroup');
      for (let j = 0, cglen = cg.length; j < cglen; j = (j+1)){
        consource[j] = [];
        let cgid = cg_index[j];
        let conids = con_counter[j];
        let conlen = conids.length;
        for (k = 0; k < conlen; k = (k+1)){
          consource[j][k] = [];
          let conid = conids[k];
          let ary = [];
          let con = $con(cgid, conid);
          let cc = con.querySelectorAll('[checked="1"]');
          for (l=0,cclen=cc.length; l<cclen; l = (l+1)){
            ary.push(Number(cc[l].getAttribute('value')));
          }
          _cards = _cards.concat(ary.slice());
          consource[j][k].push(ary.slice());
          consource[j][k].push(Number(con.querySelector('.condition_n').value));
          consource[j][k].push(Number(con.querySelector('.condition_m').querySelector('[selected="1"]').getAttribute("value")) + 4 * Number(con.querySelector('.condition_cs').querySelector('[selected="1"]').getAttribute("value")));
        }
      }
      _cards = _cards.uniq().sort(function(a, b){return a - b;});
      let _cnums = makeGroupNums(_cards, [0].concat(cards), [kinkenn].concat(cnums));
      let condition = makeCondition(_cards, _cnums, consource.slice());
      if (condition.length > 0){
        let pt = pascal_triangle(deck);
        let drawpat = makeDrawPattern(deck, hand, _cnums, pt);
        let coordinates = makeCoordinates(deck, hand, _cnums);
        let result = calcResult(drawpat, deck, hand, _cnums, condition, coordinates, kinkennmode, pt);
        let str0 = "計算結果："+String(Math.round(result/combination_pt(deck,hand,pt)*1000000)/10000)+"％\n";
        if (kinkenn === 0 && (Math.pow(2,53) - 1) >= combination_pt(deck,hand,pt)){
          str0 = str0 + "（" + result.toLocaleString()+" ／ "+combination_pt(deck,hand,pt).toLocaleString()+"通り）";
        }
        document.querySelector('#top_output > .output').innerText = str0;
        let cl = consource.length;
        let rows = document.querySelectorAll(".congroup");
        for (let m = 0; m < cl; m=(m+1)){
          let scon = [];
          scon.push(consource[m]);
          let mscon = makeCondition(_cards, _cnums, scon);
          if (mscon.length > 0){
            let r1 = 0;
            if (JSON.stringify(condition) === JSON.stringify(mscon)){
              r1 = result;
            }else{
              r1 = calcResult(drawpat, deck, hand, _cnums, mscon, coordinates, kinkennmode, pt);
            }
            let str1 = "個別計算結果："+String(Math.round(r1/combination_pt(deck,hand,pt)*1000000)/10000)+"％\n";
            if (kinkenn === 0 && (Math.pow(2,53)-1) >= combination_pt(deck,hand,pt)){
              str1 = str1 + "（" + r1.toLocaleString() +" ／ "+combination_pt(deck,hand,pt).toLocaleString()+"通り）";
            }
            rows[m].querySelector('.output').innerText = str1;
          }else{
            rows[m].querySelector('.output').innerText = '設定された条件は有効ではありません。';
          }
        }
      }else{
        document.querySelector('#top_output > .output').innerText = 'エラー:\n有効な条件が設定されていません。';
        let rows = document.querySelectorAll(".congroup");
        for (m = 0, rlen = rows.length; m < rlen; m = (m+1)){
          rows[m].querySelector('.output').innerText = '設定された条件は有効ではありません。';
        }
      }
      condition_ex(deck, hand, cards, cnums, consource);
    }else{
      document.querySelector('#top_output > .output').innerText = 'エラー:\n設定したカードの合計枚数が、デッキ枚数を超えています。';
      let rows = document.querySelectorAll(".congroup");
      for (m = 0, rlen = rows.length; m < rlen; m = (m+1)){
        rows[m].querySelector('.output').innerText = '';
      }
    }
  }else{
    if (deck < hand){
      document.querySelector('#top_output > .output').innerText = 'エラー:\n手札の枚数がデッキ枚数を超えています。';
    }else{
      document.querySelector('#top_output > .output').innerText = 'エラー:\nデッキまたは手札の枚数は0～255枚の範囲で設定してください。';
    }
    let rows = document.querySelectorAll(".congroup");
    for (m = 0, rlen = rows.length; m < rlen; m = (m+1)){
      rows[m].querySelector('.output').innerText = '';
    }
  }
  console.timeEnd('calc');
}

function condition_ex(deck, hand, cards, cnums, consource){
  let cnames = [];
  let cng = document.querySelectorAll(".cardname");
  let kn = Number(document.getElementById('kinkenn').querySelector('[selected="1"]').getAttribute("value"));
  let kc = Number(document.getElementById('kinkenncost').querySelector('[selected="1"]').getAttribute("value"));

  for (let i = 0, cl = cng.length; i < cl; i = (i+1)){
    cnames.push(cng[i].value);
  }
  let str = "kn=" + kn + "&kc=" + kc + "&xj=" + Base64.toBase64(RawDeflate.deflate(Base64.utob(JSON.stringify([deck, hand, cards, cnames, cnums, consource]))));
  let url = location.href.replace(/\#.*$/, '').replace(/\?.*$/, '') + "?" + str;
  document.querySelector("#export_box").value = url;
  if (document.querySelector("#tweet-area").children.length > 0){
    document.querySelector("#tweet-area").innerHTML="";
  }
  /*IEはTwitterのサポートが終了したので分岐*/
  if (typeof twttr !== 'undefined'){
    twttr.widgets.createShareButton(url, document.getElementById('tweet-area'), { text: "金謙確率計算機（β版）\n確率"+document.querySelector("#top_output > .output").innerText+"でした！\n詳細は->" });
  }
}

function condition_in(){
  if (queryParam.kn && queryParam.kn >= 0 && queryParam.kn <= 3){
    selectsingle(document.querySelector('#kinkenn > .selectbox > [value="' + queryParam.kn + '"]'));
  }
  if (queryParam.kc && (queryParam.kc === 3 || queryParam.kc === 6)){
    selectsingle(document.querySelector('#kinkenncost > .selectbox > [value="' + queryParam.kn + '"]'));
  }
  if (queryParam.xj || queryParam.x){
    let str = '';
    if (queryParam.xj){
      str = Base64.btou(RawDeflate.inflate(Base64.fromBase64(queryParam.xj)));
    }else{
      str = convertConditionInBeta(queryParam.x);
    }
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
      for (let i = 0; i < cs; i = (i+1)){
        addCard();
      }
      let cg = document.querySelectorAll(".card");
      for (let i = 0; i < cs; i = (i+1)){
        cg[i].querySelector(".cardname").value = dst[3][i];
        cg[i].querySelector(".cardnum").value = dst[4][i];      
      }
      for (let j = 0; j < dst[5].length; j = (j+1)){
        addConGroup();
        for (let k = 1; k < dst[5][j].length; k = (k+1)){
          addCon(j+1);
        }
      }
      for (let j = 0; j < dst[5].length; j = (j+1)){
        for (let k = 0; k < dst[5][j].length; k = (k+1)){
          let tcon = $con(j + 1, k + 1);
          tcon.querySelector(".condition_n").value = dst[5][j][k][1];
          selectsingle(tcon.querySelector('.condition_cs > .selectbox > [value="' + String(Math.floor(dst[5][j][k][2] / 4)) + '"]'));
          selectsingle(tcon.querySelector('.condition_m > .selectbox > [value="' + String(dst[5][j][k][2] % 4) + '"]'));
          for (let s = 0; s < dst[5][j][k][0].length; s = (s+1)){
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
        text: "金謙確率計算機（β版）\n"
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
