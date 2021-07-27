/*
 * Copyright (c)2020-2021 WingTSK
 * 
 * drawcalc-web.js
 *
 * ドロー確率計算機 ver.0.5 rc8 2021-07-27
 */

(function (root){
  "use strict";
  
  const PRODUCT = 'drawcalc';
  const VERSION = '0.5 rc8';
  const MODULE = 'web';
  const AUTHOR = 'WingTSK';
  
  if (!root[PRODUCT]) root[PRODUCT] = {};
 
  if (!root[PRODUCT][MODULE]) root[PRODUCT][MODULE] = {};
 
  (function (obj){
    //Settings

    //Default Settings
    //const DEFAULT_DECK_NUM = 40;
    //const DEFAULT_HAND_NUM = 5;
    //const DEFAULT_DECK_LIMIT = 255;
    const NUMBER_DECIMIAL_PLACES = 4;
    const DEFAULT_CARD_NAME = 'カード';
    
    //Draw Mode
    const MODE_DRAW = 0;
    const MODE_DRAW_JUST = 1;
    const MODE_RESIDUE = 2;
    const MODE_RESIDUE_JUST = 3;
    const MODE_VARI_DRAW = 4;
    const MODE_VARI_DRAW_JUST = 5;
    const MODE_VARI_RESIDUE = 6;
    const MODE_VARI_RESIDUE_JUST = 7;
    
    //Set Error Codes
    const CODE_OK = 200;
    const CODE_ERROR_ILLEGAL_CONDITION = 400;
    const CODE_ERROR_DECK_OVER_LIMIT = 401;
    const CODE_ERROR_HAND_MORE_THAN_DECK = 402;
    const CODE_ERROR_HAND_MINUS = 403;
    const CODE_ERROR_SETCARDS_OVER_DECK = 404;
    const CODE_ERROR_ILLEGAL_DECK = 405;
    const CODE_ERROR_ILLEGAL_HAND = 406;
    
    const version = function (){
      return `${PRODUCT}-${MODULE} ver.${VERSION}`;
    }
    
    const getPersent = function (p, n){
      if (Number(p) === p && Number(n) === n){
        return Math.round(p * Math.pow(10, n + 2)) / Math.pow(10, n);
      }
    }
  
    const resultMsg = function (result){
      let str = '計算結果：' + getPersent(result.result / result.sample, NUMBER_DECIMIAL_PLACES) + '％\n';
      if (Math.pow(2,53) - 1 >= result.sample){
        str = str + '（' + result.result.toLocaleString() + ' ／ ' + result.sample.toLocaleString() + '通り）';
      }
      return str;
    }
    
    const addCard = function (){
      let newcard = document.createElement("div");
      const cid = obj.getNewCardId();
      obj.addCardObject(cid, DEFAULT_CARD_NAME + cid);
      newcard.setAttribute("cid", cid);
      newcard.className = "card";
      newcard.innerHTML = [
        '<div class="delbutton" onclick="drawcalc.web.deleteCard(', cid, ')" title="カードを消去">',
          '<div class="delmark">',
          '</div>',
        '</div>',
        '<div class="settingarea">',
          '<span class="settinglabel">','カード名:','</span>',
          '<input type="text" class="cardname" placeholder="カード名" size="20" value="カード', cid, '" onchange="drawcalc.web.updateCardName(this)" cid="', cid, '">',
          '<br class="settinglabel">',
          '／','<span class="settinglabel">','投入枚数:','</span>',
          '<input type="number" class="cardnum" size="15" placeholder="枚数" min="0" max="255" onclick="this.select();" onchange="drawcalc.web.updateCardNum(this)" cid="', cid, '">',
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
        newoption.setAttribute("checked", "0");
        newoption.setAttribute("onclick", "menuJS.selectmulti(this);drawcalc.web.updateConIds(this);");
        newoption.setAttribute("value", "" + cid);
        newoption.innerText = DEFAULT_CARD_NAME + cid;
        cls[i].querySelector(".selectbox").appendChild(newoption);
      }
      menuJS.refselectmulti(cls);
    }
    
    const deleteCard = function (cid){
      let deltarget = document.querySelector('[cid="' + cid + '"].card');
      deltarget.parentNode.removeChild(deltarget);
      obj.deleteCardObject(cid);
      let cls = document.querySelectorAll(".selectcondition");
      let clsl = cls.length;
      for (let i = 0; i < clsl; i += 1){
        let dt = cls[i].querySelector('.selectbox > [value="' + cid + '"]');
        dt.parentNode.removeChild(dt);
      }
      menuJS.refselectmulti(cls);
    }
  
    const addCon = function(cgid){
      if (obj.conditions.filter(function (x){return x.cgid === cgid}).length !== 0){
        let conid = obj.getNewConId(cgid);
        obj.addConObject(cgid, conid);
        let newcon = document.createElement("div");
        let newandblock = document.createElement("div");
        newcon.setAttribute("conid", "" + conid);
        newcon.className = "condition";
        let clist = ('');
        for (let i = 0; i < obj.cards.length; i += 1){
          let ci = obj.cards[i].cid;
          let cn = obj.cards[i].name;
          clist = clist + '<li checked="0" onclick="menuJS.selectmulti(this);drawcalc.web.updateConIds(this);" value="' + ci + '">' + cn + '</li>';
        }
        newcon.innerHTML = [
          '<div class="delbutton" onclick="drawcalc.web.deleteCon(', cgid, ',', conid, ')" title="条件を消去">',
            '<div class="delmark">',
              
            '</div>',
          '</div>',
          '<div class="coninner">',
            '<div class="selectcondition select">',
              '<span class="selectmsg" msg="0" opened="0" onclick="menuJS.open(this); event.stopPropagation()">',
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
                '<input type="number" class="condition_n" name="condition_n_', cgid, '_', conid, '" size="15" placeholder="枚数" min="0" max="255" onchange="drawcalc.web.updateConNum(this)" onclick="this.select();">',
  
                '<div class="condition_cs select">',
                  '<span class="selectmsg" msg="1" opened="0" onclick="menuJS.open(this)">',
                    '<div class="defaultmsg"></div>',
                    '<div class="singleselect">枚</div>',
                  '</span>',
                  '<ul class="selectbox">',
                    '<li selected="1" value="0" onclick="menuJS.selectsingle(this);drawcalc.web.updateConMode(this);">枚</li>',
                    '<li selected="0" value="1" onclick="menuJS.selectsingle(this);drawcalc.web.updateConMode(this);">種類</li>',
                  '</ul>',
                '</div>',
  
              '</div>',
              '<div class="condition_m select">',
                '<span class="selectmsg" msg="1" opened="0" onclick="menuJS.open(this)">',
                  '<div class="defaultmsg"></div>',
                  '<div class="singleselect">以上ドロー</div>',
                '</span>',
                '<ul class="selectbox">',
                  '<li class="menumsg" onclick="event.stopPropagation()">▼モード▼</li>',
                  '<li selected="1" value="0" onclick="menuJS.selectsingle(this);drawcalc.web.updateConMode(this);">以上ドロー</li>',
                  '<li selected="0" value="1" onclick="menuJS.selectsingle(this);drawcalc.web.updateConMode(this);">ちょうどドロー</li>',
                  '<li selected="0" value="2" onclick="menuJS.selectsingle(this);drawcalc.web.updateConMode(this);">以上デッキに残す</li>',
                  '<li selected="0" value="3" onclick="menuJS.selectsingle(this);drawcalc.web.updateConMode(this);">ちょうどデッキに残す</li>',
                '</ul>',
              '</div>',
            '</div>',
          '</div>'
          ].join('');
        /** */
        let inner = document.querySelector('[cgid="' + cgid + '"]').querySelector(".congroupinner");
        if (conid !== 1){
          newandblock.setAttribute("conid", (conid - 1) + "");
          newandblock.className = "andblock";
        /** newandblock.inner */
          let newandmark = document.createElement("span");
          newandmark.className = "andmark";
          newandmark.innerHTML = "";
          newandblock.appendChild(newandmark);
          inner.appendChild(newandblock);
        }
        inner.appendChild(newcon);
      }
    }
  
    const addConGroup = function (){
      let newcongroup = document.createElement("div");
      let cgid = obj.getNewConGroupId();
      obj.addConGroupObject(cgid);
      newcongroup.setAttribute("id", "congroup" + cgid);
      newcongroup.setAttribute("cgid", "" + cgid);
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
          '<div class="addcon" onclick="drawcalc.web.addCon(', cgid, ')" title="条件を追加">',
            '<span class="andconmark"><span>',
          '</div>',
        '</div>'
      ].join("");
      let csbox = document.querySelector("#consetbox");
      let acg = document.querySelector("#addcongroup");
      csbox.insertBefore(newcongroup, acg);
      addCon(cgid);
    }
    
    const deleteCon = function (cgid, conid){
      let conGroup = obj.conditions.find(function (x){return x.cgid === cgid});
      if (conGroup){
        if (conGroup.cons.length === 1 && conGroup.cons[0].conid === conid){
          let target = document.querySelector('[cgid="' + cgid + '"].congroup');
          target.parentNode.removeChild(target);
          obj.deleteConGroupObject(cgid);
        }else{
          let targetcon = document.querySelector('[cgid="' + cgid + '"]').querySelector('[conid="' + conid + '"].condition');
          targetcon.parentNode.removeChild(targetcon);
          if (conGroup.cons[conGroup.cons.length - 1].conid === conid){
            let a = conGroup.cons[conGroup.cons.length - 2].conid;
            let targetaddblock = document.querySelector('[cgid="' + cgid + '"]').querySelector('[conid="' + a + '"].andblock');
            targetaddblock.parentNode.removeChild(targetaddblock);
          }else{
            let targetaddblock = document.querySelector('[cgid="' + cgid + '"]').querySelector('[conid="' + conid + '"].andblock');
            targetaddblock.parentNode.removeChild(targetaddblock);
          }
          obj.deleteConObject(cgid, conid);
        }
      }
    }
    
    const updateOptions = function (c){
      let n = c.value;
      let cid = c.getAttribute('cid');
      let cls = document.querySelectorAll(".selectcondition");
      let len = cls.length;
      for (let i = 0; i < len; i += 1){
        cls[i].querySelector('.selectbox > [value="' + cid + '"]').innerText = n;
      }
      menuJS.refselectmulti(cls);
    }

    const updateConIds = function (c){
      let temp = c.parentNode.querySelectorAll('[checked="1"]');
      const ids = new Array(temp.length).fill().map(function (_, i){
        return Number(temp[i].getAttribute('value'));
      });
      const conid = Number(c.closest('.condition').getAttribute('conid'));
      const cgid = Number(c.closest('.congroup').getAttribute('cgid'));
      obj.setConIds(cgid, conid, ids);
    }
    
    const updateConMode = function (c){
      let temp = c.closest('.condition');
      const conid = Number(temp.getAttribute('conid'));
      const cgid = Number(c.closest('.congroup').getAttribute('cgid'));
      const mode = Number(temp.querySelector('.condition_m > ul > [selected="1"]').value)
              + Number(temp.querySelector('.condition_cs > ul > [selected="1"]').value) * 4;
      obj.setConMode(cgid, conid, mode);
    }
  
    const updateConNum = function (c){
      const conid = Number(c.closest('.condition').getAttribute('conid'));
      const cgid = Number(c.closest('.congroup').getAttribute('cgid'));
      const num = Number(c.value);
      obj.setConNum(cgid, conid, num);
    }
    
    const updateDeckNum = function (){
      let n = Number(document.getElementById('deck_n').value);
      obj.deck = n;
    }
    
    const updateHandNum = function (){
      const n = Number(document.getElementById('hand_n').value);
      obj.hand = n;
    }
    
    const updateCardNum = function (c){
      const cid = Number(c.getAttribute('cid')),
            num = Number(c.value);
      obj.setCardNum(cid, num);
    }
    
    const updateCardName = function (c){
      const cid = Number(c.getAttribute('cid')),
            name = c.value;
      obj.setCardName(cid, name);
      updateOptions(c);
    }

    
    const outputTop = function (str){
      document.querySelector('#top_output > .output').innerText = str;
    }
    
    const outputCon = function (str, num){
      let rows = document.querySelectorAll(".congroup");
      if (0 <= num && num < rows.length){
        rows[num].querySelector('.output').innerText = str;
      }
    }
    
    const outputConAll = function (str){
      for (let i = 0, len = document.querySelectorAll('.congroup').length; i < len; i += 1){
        outputCon(str, i);
      }
    }
    
    const importDeck = function (n){
      document.getElementById('deck_n').value = n;
      updateDeckNum();
    }
    
    const importHand = function (n){
      document.getElementById('hand_n').value = n;
      updateHandNum();
    }
    
   const importCards = function (cids, names, nums){
      let len = cids.length;
      for (let i = 0; i < len; i += 1){
        addCard();
      }

      let cards = document.querySelectorAll(".card");
      for (let i = 0; i < len; i += 1){
        let name = cards[i].querySelector(".cardname");
        name.value = names[i];
        updateCardName(name);
        let num = cards[i].querySelector(".cardnum");
        num.value = nums[i];      
        updateCardNum(num);
      }
    }
    
    const importConditions = function (cids, conditions){
      for (let j = 0; j < conditions.length; j += 1){
        addConGroup();
        for (let k = 1; k < conditions[j].length; k += 1){
          addCon(j + 1);
        }
      }
      for (let j = 0; j < conditions.length; j += 1){
        for (let k = 0; k < conditions[j].length; k += 1){
          const cgid = j + 1;
          const conid = k + 1;
          const ids = new Array(conditions[j][k][0].length).fill().map(function (_, s){
                  return cids.indexOf(conditions[j][k][0][s]) + 1;
                });
          const num = Number(conditions[j][k][1]);
          const mode = Number(conditions[j][k][2]);
                
          let target = document.querySelector('[cgid="' + cgid + '"]').querySelector('[conid="' + conid + '"]');
          target.querySelector(".condition_n").value = num;
          menuJS.selectsingle(target.querySelector('.condition_cs > .selectbox > [value="' + (Math.floor(mode / 4)) + '"]'));
          menuJS.selectsingle(target.querySelector('.condition_m > .selectbox > [value="' + (mode % 4) + '"]'));
          for (let s = 0; s < ids.length; s += 1){
            menuJS.selectmulti(target.querySelector('.selectcondition > .selectbox > [value="' + ids[s] + '"]'));
          }
          
          obj.setConIds(cgid, conid, ids);
          obj.setConNum(cgid, conid, num);
          obj.setConMode(cgid, conid, mode);
        }
      }
    }

    const condition_st = function (){
      addCard();
      addConGroup();
      document.querySelector('#export_box').value = location.href.replace(/\#.*$/, '').replace(/\?.*$/, '');
      twttr('tweet-area', {
          text: 'ドロー確率計算機\n',
          url: location.href.replace(/\#.*$/, '').replace(/\?.*$/, '')
        }
      );
    }
    
    const exportSettings = function (){
      let deck = obj.deck;
      let hand = obj.hand;
      let cids = obj.getCardsIds();
      let cnames = obj.getCardsNames();
      let cnums = obj.getCardsNums();
      let consource = obj.getConsource();
      let str = "xj=" + Base64.toBase64(RawDeflate.deflate(Base64.utob(JSON.stringify([deck, hand, cids, cnames, cnums, consource]))));
      let url = location.href.replace(/\#.*$/, '').replace(/\?.*$/, '') + "?" + str;
      document.querySelector("#export_box").value = url;
      /*IEはTwitterのサポートが終了したので分岐*/
      twttr('tweet-area', {
        text: `ドロー確率計算機\n確率${document.querySelector("#top_output > .output").innerText}でした！\n詳細は->`,
        url: url
      });
    }
    
    const importSettings = function (){
      let queryParam = (function (){
        let queries = {}, str = location.search.substring(1);
        if (str.length > 0){
          let aryQuery = str.split('&');
          for (let i = 0; i < aryQuery.length; i = i + 1){
            let item = aryQuery[i].split('='),
                key = item[0],
                value = item[1] || '';
            queries[key] = value;
          }
        };
        return queries;
      })();
  
      if (queryParam.xj){
        let str = Base64.btou(RawDeflate.inflate(Base64.fromBase64(queryParam.xj)));
        let dst = {};
        try {
          JSON.parse(str);
        } catch(e){
          condition_st();
          return false;
        }
        dst = JSON.parse(str);
        if (dst.length === 6){
          importDeck(dst[0]);
          importHand(dst[1]);
          importCards(dst[2], dst[3], dst[4]);
          importConditions(dst[2], dst[5]);
          webcalc();
        }else{
          condition_st();
        }
      }else{
        condition_st();
      }
    }
    
    const start = function (){
      importSettings();
    }
    

    const webcalc = function (){
      console.time('drawCalc');
      const deck = obj.deck;
      const hand = obj.hand;
      const cards = obj.cards;
      const conditions = obj.conditions;
      const len = conditions.length;
  
      const main = obj.calc(deck, hand, cards, conditions);
      if (main.code === CODE_OK){
        outputTop(resultMsg(main));
        if (len === 1){
          outputCon('個別' + resultMsg(main), 0);
        }else{
          for (let i = 0; i < len; i += 1){
            const sub = obj.calc(deck, hand, cards, [conditions[i]]);
            if (sub.code === CODE_OK){
              outputCon('個別' + resultMsg(sub), i);
            }else{
              outputCon('設定された条件は有効ではありません。', i);
            }
          }
        }
        
        exportSettings();
        
      }else{
        if (main.code === CODE_ERROR_ILLEGAL_CONDITION){
          outputTop('エラー:\n有効な条件が設定されていません。');
          outputConAll('設定された条件は有効ではありません。');
        }else if (main.code === CODE_ERROR_ILLEGAL_DECK){
          outputTop('エラー:\nデッキ枚数に不正な値が設定されています。');
          outputConAll('');
        }else if (main.code === CODE_ERROR_ILLEGAL_HAND){
          outputTop('エラー:\n手札枚数に不正な値が設定されています。');
          outputConAll('');
        }else if (main.code === CODE_ERROR_SETCARDS_OVER_DECK){
          outputTop('エラー:\n設定したカードの合計枚数が、デッキ枚数を超えています。');
          outputConAll('');
        }else if (main.code === CODE_ERROR_HAND_MORE_THAN_DECK){
          outputTop('エラー:\n手札の枚数がデッキ枚数を超えています。');
          outputConAll('');
        }else if (main.code === CODE_ERROR_HAND_MINUS){
          outputTop('エラー:\nデッキまたは手札の枚数は0～255枚の範囲で設定してください。');
          outputConAll('');
        }else if (main.code === CODE_ERROR_DECK_OVER_LIMIT){
          outputTop('エラー:\nデッキまたは手札の枚数は0～255枚の範囲で設定してください。');
          outputConAll('');
        }else{
          outputTop('エラー:');
          outputConAll('');
        }
      }
      console.timeEnd('drawCalc');
    }
    
    
    //getPersent//
    //resultMsg//
    obj[MODULE].version = version;

    obj[MODULE].addCard = addCard;
    obj[MODULE].deleteCard = deleteCard;
    obj[MODULE].addCon = addCon;
    obj[MODULE].addConGroup = addConGroup;
    obj[MODULE].deleteCon = deleteCon;
    
    obj[MODULE].updateOptions = updateOptions;
    obj[MODULE].updateConIds = updateConIds;
    obj[MODULE].updateConMode = updateConMode;
    obj[MODULE].updateConNum = updateConNum;
    obj[MODULE].updateDeckNum = updateDeckNum;
    obj[MODULE].updateHandNum = updateHandNum;
    obj[MODULE].updateCardNum = updateCardNum;
    obj[MODULE].updateCardName = updateCardName;
    
    obj[MODULE].outputTop = outputTop;
    obj[MODULE].outputCon = outputCon;
    obj[MODULE].outputConAll = outputConAll;
    
    obj[MODULE].start = start;
    obj[MODULE].exportSettings = exportSettings;
    //importDeck//
    //importHand//
    //importCards//
    //importConditions//
    obj[MODULE].condition_st = condition_st;
    obj[MODULE].importSettings = importSettings;
    
    obj[MODULE].do = webcalc;
    
  })(root[PRODUCT]);

})(window);
  
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

// https://developer.mozilla.org/ja/docs/Web/API/Element/closest
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || 
                              Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    var el = this;

    do {
      if (Element.prototype.matches.call(el, s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}
/* polyfill end */

/* menuJS */
(function (root){
  "use strict";

  const PRODUCT = 'menuJS',
        VERSION = '0.0.1',
        AUTHOR = 'WingTSK';
  
  if (!root[PRODUCT]) root[PRODUCT] = {};

  (function (obj){
    obj.selectsingle = function (e){
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
  
    obj.selectmulti = function (e){
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
  
    obj.refselectmulti = function (selects){
      let len = selects.length;
      for (let i = 0; i < len; i += 1){
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

    obj.open = function (e){
      if (e.getAttribute("opened") === "0"){
        obj.close();
        e.setAttribute("opened", "1");
      }else{
        e.setAttribute("opened", "0");
      }
      event.stopPropagation();
    }
    
    obj.close = function () {
      let te = document.querySelectorAll('[opened="1"].selectmsg');
      for (let i = 0, elen = te.length; i < elen; i += 1){
        te[i].setAttribute("opened","0");
      }
    }
    
  })(root[PRODUCT]);
  
})(window);
/* menuJS end */

function copyToClipboard(target){
  let copyTarget = document.querySelector(target);
  copyTarget.select();
  document.execCommand("Copy");
}

// ページ上部にスクロール
function scrolltop(){
  scrollTo(0, 0);
}

function twttr(id, obj){
  let str = `https://twitter.com/intent/tweet?`;
  if (obj){
    let keys = Object.keys(obj);
    let ary = [];
    for (let i = 0; i < keys.length; i+=1){
      ary[i] = `${keys[i]}=${encodeURIComponent(obj[keys[i]])}`;
    }
    if (keys.length > 0) str = `${str}${ary.join('&')}`;
  }
  let t = document.getElementById(id);
  t.innerHTML = `<div id="twitter"><div class="btn-o" data-scribe="component:button" style="width: 61px;"><a href="${str}" target="_blank" class="twbtn"><span class="twlogo"></span><span class="twlabel">Tweet</span></a></div></div>`;
}

function serviceWorkerCheck(){
  if ('serviceWorker' in navigator){
    if (navigator.serviceWorker.controller){
      document.getElementById('swmsg0').innerText = 'このページのService Workerは登録済みです。';
      document.getElementById('swonbutton').setAttribute('disabled','');
      document.getElementById('swoffbutton').removeAttribute('disabled','');
    }else{
      document.getElementById('swmsg0').innerText = 'このページのService Workerは登録されていません。';
      document.getElementById('swonbutton').removeAttribute('disabled','');
      document.getElementById('swoffbutton').setAttribute('disabled','');
    }
  }else{
    document.getElementById('swmsg0').innerText = 'Service Workerはサポートされていません。';
  }
}

function serviceWorkerOn (){
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./drawcalc-sw.js')
      .then(function(registration) {
        console.log('Service worker registration succeeded:', registration);
        document.getElementById('swmsg1').innerText = 'Service Workerを登録しました。';
        document.getElementById('swmsg0').innerText = 'このページのService Workerは登録済みです。';
        document.getElementById('swonbutton').setAttribute('disabled','');
        document.getElementById('swoffbutton').removeAttribute('disabled','');
      }, function(error) {
        console.log('Service worker registration failed:', error);
        document.getElementById('swmsg1').innerText = 'エラーが発生し、登録されませんでした。';
      });
  } else {
    console.log('Service workers are not supported.');
  }
}

function serviceWorkerOff(){
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations){
      for (let registration of registrations){
        registration.unregister();
      }
    });
    caches.keys().then(function (keys){
      var promises = [];
      keys.forEach(function (cacheName){
        if (cacheName.indexOf('pwa-drawcalc') === 0){
          promises.push(caches.delete(cacheName));
        }
      });
    });
    document.getElementById('swmsg2').innerText = 'Service Workerを停止しました。';
    document.getElementById('swmsg0').innerText = 'このページのService Workerは登録されていません。';
    document.getElementById('swonbutton').removeAttribute('disabled','');
    document.getElementById('swoffbutton').setAttribute('disabled','');
  } else {
    console.log('Service workers are not supported.');
  }
}

document.addEventListener('DOMContentLoaded', drawcalc.web.start);
document.addEventListener('DOMContentLoaded', function (){
  document.getElementById('version').innerText = drawcalc.web.version();
  drawcalc.chkUpdate();
});
document.addEventListener('DOMContentLoaded',function (){
  document.getElementById('deck_n').addEventListener('change',drawcalc.web.updateDeckNum); 
  document.getElementById('hand_n').addEventListener('change',drawcalc.web.updateHandNum);
  document.querySelector('body').addEventListener('click',menuJS.close);
  if ('serviceWorker' in navigator){
    document.getElementById('swbefore').style.display = '';
    document.getElementById('swmenu').style.display = 'block';
    serviceWorkerCheck();
  }
});
