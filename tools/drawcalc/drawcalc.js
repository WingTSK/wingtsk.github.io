/*
 * Copyright (c)2020-2021 WingTSK
 * 
 * drawcalc.js
 *
 * drawcalc ver.0.5.0 2021-02-12
 */

(function (root){
  'use strict';
  
  const PRODUCT = 'drawcalc';
  const VERSION = '0.5 rc7';
  const AUTHOR = 'WingTSK';
  
  if (!root[PRODUCT]) root[PRODUCT] = {};

  (function (obj){
    /* Settings */

    /* Default Settings */
    const DEFAULT_DECK_NUM = 40;
    const DEFAULT_HAND_NUM = 5;
    const DEFAULT_DECK_LIMIT = 255;
    //const NUMBER_DECIMIAL_PLACES = 4;
    
    /* Draw Mode */
    const MODE_DRAW = 0;
    const MODE_DRAW_JUST = 1;
    const MODE_RESIDUE = 2;
    const MODE_RESIDUE_JUST = 3;
    const MODE_VARI_DRAW = 4;
    const MODE_VARI_DRAW_JUST = 5;
    const MODE_VARI_RESIDUE = 6;
    const MODE_VARI_RESIDUE_JUST = 7;
    
    /* Set Error Codes */
    const CODE_OK = 200;
    const CODE_ERROR_ILLEGAL_CONDITION = 400;
    const CODE_ERROR_DECK_OVER_LIMIT = 401;
    const CODE_ERROR_HAND_MORE_THAN_DECK = 402;
    const CODE_ERROR_HAND_MINUS = 403;
    const CODE_ERROR_SETCARDS_OVER_DECK = 404;
        
    const version = function (){
      return `${PRODUCT} ver.${VERSION}`;
    }
    
    const getNewCardId = function (){
      const len = obj.cards.length;
      if (len === 0){
        return 1;
      }else{
        return obj.cards[len - 1].cid + 1;
      }
    }
    
    const createCardObject = function (cid, name, num){
     return {cid : Number(cid), name : name, num : Number(num)};
    }
    
    const addCardObject = function (cid, name){
      obj.cards.push(createCardObject(cid, name, 0));
    }
    
    const deleteCardObject = function(cid){
      obj.cards = obj.cards.filter(function(x){
        if (x.cid !== cid) return true;
      });
      
      for (let i = 0; i < obj.conditions.length; i += 1){
        for (let j = 0; j < obj.conditions[i].cons.length; j += 1){
          obj.conditions[i].cons[j].ids = obj.conditions[i].cons[j].ids.filter(function(y){
            if (y !== cid) return true;
          });
        }
      }
    }
    
    const getNewConGroupId = function (){
      const len = obj.conditions.length;
      if (len === 0){
        return 1;
      }else{
        return obj.conditions[len - 1].cgid + 1;
      }
    }
    
    const createConGroupObject = function (cgid, cons){
      return {cgid : Number(cgid), cons : cons};
    }
    
    const addConGroupObject = function (cgid){
      obj.conditions.push(createConGroupObject(cgid, []));
    }
    
    const deleteConGroupObject = function(cgid){
      obj.conditions = obj.conditions.filter(function(x){
        if (x.cgid !== cgid) return true;
      });
    }
    
    const getNewConId = function (cgid){
      let conGroup = obj.conditions.find(function (x){return x.cgid === cgid});
      if (conGroup.cons.length === 0){
        return 1;
      }else{
        return conGroup.cons[conGroup.cons.length - 1].conid + 1;
      }
    }
    
    const createConObject = function (conid, ids, mode, num){
      return {conid : conid, ids : ids, mode : Number(mode), num : Number(num)};
    }
    
    const addConObject = function (cgid, conid){
      let conGroup = obj.conditions.find(function (x){return x.cgid === cgid});
      conGroup.cons.push(createConObject(conid, [], 0, 0));
    }
    
    const deleteConObject = function(cgid, conid){
      let conGroup = obj.conditions.find(function (x){return x.cgid === cgid});
      conGroup.cons = conGroup.cons.filter(function(x){
        if (x.conid !== conid) return true;
      });
    }
    
    const getCardsIds = function (){
      return new Array(obj.cards.length).fill().map(function(_, i){
        return obj.cards[i].cid;
      });
    }
    
    const getCardsNums = function (){
      return new Array(obj.cards.length).fill().map(function(_, i){
        return obj.cards[i].num;
      });
    }
    
    const getCardsNames = function (){
      return new Array(obj.cards.length).fill().map(function(_, i){
        return obj.cards[i].name;
      });
    }

    const getConsource = function (){
      return new Array(obj.conditions.length).fill().map(function (_, i){
        return new Array(obj.conditions[i].cons.length).fill().map(function (_, j){
          let con = obj.conditions[i].cons[j];
          return [con.ids, con.num, con.mode];
        });
      })
    }
    const setCardNum = function (cid, num){
      obj.cards.find(function (x){return x.cid === Number(cid)}).num = Number(num);
    }
    
    const setCardName = function (cid, name){
      obj.cards.find(function (x){return x.cid === Number(cid)}).name = name;
    }
    
    const setConIds = function (cgid, conid, ids){
      let con = obj.conditions.find(function(x){return x.cgid === Number(cgid)}).cons.find(function(x){return x.conid === Number(conid)});
      con.ids = ids.slice();
    }
    
    const setConMode = function (cgid, conid, mode){
      let con = obj.conditions.find(function(x){return x.cgid === Number(cgid)}).cons.find(function(x){return x.conid === Number(conid)});
      con.mode = Number(mode);
    }
    
    const setConNum = function (cgid, conid, num){
      let con = obj.conditions.find(function(x){return x.cgid === Number(cgid)}).cons.find(function(x){return x.conid === Number(conid)});
      con.num = Number(num);
    }

    const pascalTriangle = function (n){
      let a = [];
      for (let i = 0; i <= n; i += 1){
        let b = [];
        for (let j = 0; j * 2 <= i; j += 1){
          if (j === 0){
            b.push(1);
          }else{
            if (j * 2 === i){
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
    
    const combination = function(n, r){
      if (n >= r && r >= 0){
        let k = r;
        if (n - r < r) k = n - r;
        return obj.pt[n][k];
      }else{
        return 0;
      }
    }
    
    const sumArray = function (ary){
      let s = ary[0];
      for (let i = 1, len = ary.length; i < len; i += 1){
        s += ary[i];
      }
      return s;
    }
    
    const makeCardsNums = function (cards){
      return new Array(cards.length).fill().map(function(_, i){
        return cards[i].num;
      });
    }
    
    const makeCardsIds = function (cards){
      return new Array(cards.length).fill().map(function(_, i){
        return cards[i].cid;
      });
    }
    
    const makeGroupNums = function (group, cids, cnums){
      return new Array(group.length).fill().map(function(_, i){
        return cnums[cids.indexOf(group[i])];
      });
    }
    
    const uniq = function (ary){
      if (!Array.from){
        return ary.filter(function (x, i, self){return self.indexOf(x) === i;});
      }else{
        return Array.from(new Set(ary));
      }
    }
  
    const uniqObj = function (ary){
      return uniq(ary.map(function (x){return JSON.stringify(x)})).map(function (x){return JSON.parse(x)});
    }
    
    const chkCondition = function (con, cnums){
      let chk = 1;
      for (let i = 0, len = con.length; i < len; i += 1){
        if (con[i][0] > cnums[i] || con[i][1] < 0 || con[i][0] > con[i][1]){
          chk = 0;
        }
      }
      return chk;
    }

    const chkPattern = function (coordinate, condition){
      let len = condition.length;
      let t = 0, tc = 1;
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
    
    const chkModeDraw = function (mode){
      if (mode === MODE_DRAW) return 1;
      if (mode === MODE_DRAW_JUST) return 1;
      if (mode === MODE_RESIDUE) return 1;
      if (mode === MODE_RESIDUE_JUST) return 1;
      return 0;
    }
    
    const chkModeVari = function (mode){
      if (mode === MODE_VARI_DRAW) return 1;
      if (mode === MODE_VARI_DRAW_JUST) return 1;
      if (mode === MODE_VARI_RESIDUE) return 1;
      if (mode === MODE_VARI_RESIDUE_JUST) return 1;
      return 0;
    }

    const makeConsource = function (conditions, base){
      const cids = base.map(function (x){return x[0]});
      return (function (conditions){
        return new Array(conditions.length).fill().map(function (_, i){
          return new Array(conditions[i].cons.length).fill().map(function (_, j){
            let con = conditions[i].cons[j];
            return [con.ids.filter(function(x){return cids.indexOf(x) !== -1;}), con.num, con.mode];
          });
        })
      })(conditions);
    }

    const makeCoordinatesRecursiveFunc = function (_h, _cn, _o, _c, _cv, _dp, _r){
        for (_c[_dp] = 0; _cv + _c[_dp] <= _h; _c[_dp] = (_c[_dp] + 1)){
          if (_c[_dp] <= _cn[_dp]){
            if (_dp < _c.length - 1){
              makeCoordinatesRecursiveFunc(_h, _cn, _o, _c, _cv + _c[_dp], _dp + 1, _r);
            }else{
              if (_o >= _h - (_cv + _c[_dp])){
                _r.push(_c.slice());
              }
            }
          }
        }
    }

    const makeCoordinates = function (deck, hand, cnums){
      const other = deck - sumArray(cnums);
      const cv = 0;
      const depth = 0;
      let coordinate = new Array(cnums.length).fill(0);
      let rtn = [];
      makeCoordinatesRecursiveFunc(hand, cnums, other, coordinate, cv, depth, rtn);
      return rtn;
    }
    
    const makeBase = function (cards, conditions){
      const cids = makeCardsIds(cards);
      
      /* 条件で設定しているカードを抜き出す */
      const useIds = (function(conditions){
        let ary = [];
        for (let i = 0; i < conditions.length; i += 1){
          for (let j = 0; j < conditions[i].cons.length; j += 1){
            ary = ary.concat(conditions[i].cons[j].ids);
          }
        }
        return uniq(ary).sort(function(a, b){return a - b;});
      })(conditions);
  
      /* 条件で一度も設定していないカードを抜き出す */
      const unuseIds = cids.filter(function(id){return useIds.indexOf(id) === -1;});
    
      /* 条件で設定したカードのうち、種類モードで用いられたカードを抜き出す */
      const existIds = (function(conditions){
        let ary = [];
        for (let i = 0; i < conditions.length; i += 1){
          for (let j = 0; j < conditions[i].cons.length; j += 1){
            let mode = conditions[i].cons[j].mode;
            if (chkModeVari(mode)){
              ary = ary.concat(conditions[i].cons[j].ids);
            }
          }
        }
        return uniq(ary).sort(function(a, b){return a - b;});
      })(conditions);
      
      /* 条件で設定したカードのうち、枚モードのみで用いられたカードのみをターゲットとして抜き出す */
      const targetIds = useIds.filter(function(id){return existIds.indexOf(id) === -1;});
      
      /* 枚モードの条件のみを配列で抜き出す */
      let array = (function(conditions){
        let ary = [];
        for (let i = 0; i < conditions.length; i += 1){
          for (let j = 0; j < conditions[i].cons.length; j += 1){
            let mode = conditions[i].cons[j].mode;
            if (chkModeDraw(mode)){
              ary.push(conditions[i].cons[j].ids);
            }
          }
        }
        return ary.slice();
      })(conditions);
      
      /* ターゲットの各カードに対して、常に一緒に設定されているカードがあるかチェック */
      let chkLink = new Array(targetIds.length).fill().map(function(_, i){
        let cLink = targetIds.slice();
        let id = targetIds[i];
        for (let j = 0; j < array.length; j += 1){
          if (array[j].indexOf(id) !== -1){
            cLink = cLink.filter(function(k){return array[j].indexOf(k)!== -1;});
          }
        }
        return cLink;
      });
      
      /* 最適化用の配列の作成 */
      let base = uniqObj(new Array(cids.length).fill().map(function(_, i){
        let id = cids[i];
        if (unuseIds.indexOf(id) !== -1){
          return [];
        }else if (existIds.indexOf(id) !== -1){
          return [id];
        }else if (targetIds.indexOf(id) !== -1){
          return chkLink[targetIds.indexOf(id)].filter(function(x){
            return chkLink[targetIds.indexOf(x)].indexOf(id) !== -1;
          });
        }
      })).filter(function(x){return x.length > 0;});
      return base;
    }

    /* ブロックごとの指定カードの枚数座標リストの生成 */
    const makeConditionCoordinates = function (group, cids, cnums, num, mode){
      if (chkModeDraw(mode)){
        let groupnums = makeGroupNums(group, cids, cnums);
        return makeCoordinates(sumArray(groupnums), num, groupnums);
      }else if (chkModeVari(mode)){
        return makeCoordinates(group.length, num, new Array(group.length).fill(1));
      }
    }
    
    /* ブロックごとの条件[ID-枚数-モード]の生成 */
    const makeConditionBlock = function (group, conCoor, mode){
      return new Array(conCoor.length).fill().map(function(_, i){
        return new Array(group.length).fill().map(function(_, j){
          return [group[j], conCoor[i][j], mode];
        });
      });
    }
  
    /* ブロックごとの条件を合成 */
    const makeConditionGroup = function (a, b){
      let rtn = [], al = a.length, bl = b.length;
      if (al !== 0 || bl !== 0){
        for (let i = 0; i < al; i += 1){
          for (let j = 0; j < bl; j += 1){
            rtn.push([].concat(a[i]).concat(b[j]));
          }
        }
      }
      return rtn;
    }

    const makeConTemp = function (cids, cnums, consource){
      let conTemp = [];
      for (let i=0, cslen = consource.length; i < cslen; i += 1){
        let csBlock = consource[ i ];
        let blocklen = csBlock.length;
        let conGroup = new Array(blocklen).fill().map(function(_, j){
              let ids = csBlock[j][0];
              let num = csBlock[j][1];
              let mode = csBlock[j][2];
              let coor = makeConditionCoordinates(ids, cids, cnums, num, mode);
              return makeConditionBlock(ids, coor, mode);
            });
        let tmpary = conGroup[0];
        for (let m = 1; m < blocklen; m += 1){
          tmpary = makeConditionGroup(tmpary, conGroup[m]);
        }
        conTemp = conTemp.concat(tmpary.slice());
      }
      return conTemp;
    }
    
    const makeDefaultCondition = function (cnums){
      return new Array(cnums.length).fill().map(function(_, i){
        return [0, cnums[i]];
      });
    }
    
    const makeCondition = function (cards, conditions, base){
      let _base = base;
      if (!base) _base = makeCardsIds(cards).map(function (i){return [i]});
      let consource = makeConsource(conditions, _base);
      const cids = _base.map(function (x){return x[0]});
      const cnums = _base.map(function(x){
              return sumArray(makeGroupNums(x, makeCardsIds(cards), makeCardsNums(cards)));
            });
      
      let rtn = [];
      let conTemp = makeConTemp(cids, cnums, consource);
      let def = JSON.stringify(makeDefaultCondition(cnums));
      for (let i = 0, templen = conTemp.length; i < templen; i += 1){
        let rt = JSON.parse(def);
        for (let j = 0, idslen = conTemp[i].length; j < idslen; j += 1){
          let c = conTemp[i][j];
          let id = c[0];
          let num = c[1];
          let mode = c[2];
          let index = cids.indexOf(id);
          if (mode === MODE_DRAW){
            rt[index][0] = rt[index][0] + num;
          }else if (mode === MODE_DRAW_JUST){
            if (rt[index][0] === 0 && rt[index][1] === cnums[index]){
              rt[index][0] = num;
              rt[index][1] = num;
            }else{
              rt[index][1] = -1;
            }
          }else if (mode === MODE_RESIDUE){
            rt[index][1] = rt[index][1] - num;
          }else if (mode === MODE_RESIDUE_JUST){
            if (rt[index][0] === 0 && rt[index][1] === cnums[index]){
              rt[index][0] = cnums[index] - num;
              rt[index][1] = cnums[index] - num;
            }else{
              rt[index][1] = -1;
            }
          }else if (mode === MODE_VARI_DRAW){
            if (num === 1){
              rt[index][0] = rt[index][0] + num;
            }else if (num > 1){
              rt[index][1] = -1;
            }
          }else if (mode === MODE_VARI_DRAW_JUST){
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
          }else if (mode === MODE_VARI_RESIDUE){
            if (num === 1){
              rt[index][1] = rt[index][1] - num;
            }else if (num > 1){
              rt[index][1] = -1;
            }
          }else if (mode === MODE_VARI_RESIDUE_JUST){
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
    /* 最適化 */
      return uniqObj(rtn.filter(function (x){return chkCondition(x, cnums)}));
    }
    
    const drawCalcResultRecursiveFunc = function (_h, _cn, _con, _o, _c, _l, _cv, _dp, _p){
      let _rtn = 0;
      let _cd = _cn[_dp];
      for (_c[_dp] = 0; _cv + _c[_dp] <= _h; _c[_dp] = (_c[_dp] + 1)){
        if (_c[_dp] <= _cd){
          let _np = _p * combination(_cd, _c[_dp]);
          if (_dp < _l){
            _rtn += drawCalcResultRecursiveFunc(_h, _cn, _con, _o, _c, _l, _cv + _c[_dp], _dp + 1, _np);
          }else{
            if (_o >= _h - (_cv + _c[_dp])){
              if (chkPattern(_c, _con)){
                _rtn += (_np * combination(_o, _h - (_cv + _c[_dp])));
              }  
            }
          }
        }
      }
      return _rtn;
    }
    
    const drawCalcResult = function (deck, hand, cnums, condition){
      let coordinate = new Array(cnums.length).fill(0);
      const other = deck - sumArray(cnums);
      const coorlen = coordinate.length - 1;
      const cv = 0;
      const depth = 0;
      const pattern = 1;
      return drawCalcResultRecursiveFunc(hand, cnums, condition, other, coordinate, coorlen, cv, depth, pattern);
    }
    
    const calc = function(deck, hand, cards, conditions){
      let code = CODE_OK;
      if (deck > DEFAULT_DECK_LIMIT) code = CODE_ERROR_DECK_OVER_LIMIT;
      if (hand > deck) code = CODE_ERROR_HAND_MORE_THAN_DECK;
      if (hand < 0) code = CODE_ERROR_HAND_MINUS;
      if (sumArray(makeCardsNums(cards)) > deck) code = CODE_ERROR_SETCARDS_OVER_DECK;
      const base = makeBase(cards, conditions);
      const cnums = base.map(function(x){
              return sumArray(makeGroupNums(x, makeCardsIds(cards), makeCardsNums(cards)));
            });
      const condition = makeCondition(cards, conditions, base);      
      if (condition.length === 0) code = CODE_ERROR_ILLEGAL_CONDITION;
   
      if (code === CODE_OK){
                
        /* 組み合わせ計算用のメモの構築 */
        if (!obj.pt[deck]) obj.pt = pascalTriangle(deck);

        return {
          code : code,
          result : drawCalcResult(deck, hand, cnums, condition),
          sample : combination(deck, hand)
        };
      }
      return {code : code};
    }
    
    /*  */
    obj.deck = DEFAULT_DECK_NUM;
    obj.hand = DEFAULT_HAND_NUM;
    obj.cards = [];
    obj.conditions = [];
    obj.pt = [];
    
    obj.calc = calc;
    obj.pascalTriangle = pascalTriangle;
    obj.combination = combination;
    obj.sumArray = sumArray;
    obj.makeCardsNums = makeCardsNums;
    obj.makeCardsIds = makeCardsIds;
    obj.makeGroupNums = makeGroupNums;
    obj.uniq = uniq;
    obj.uniqObj = uniqObj;
    obj.chkCondition = chkCondition;
    obj.chkPattern = chkPattern;
    //obj.chkModeDraw = chkModeDraw;
    //obj.chkModeVari = chkModeVari;
    obj.makeConsource = makeConsource;
    //obj.makeCoordinatesRecursiveFunc = makeCoordinatesRecursiveFunc;
    obj.makeCoordinates = makeCoordinates;
    obj.makeBase = makeBase;
    //obj.makeConditionCoordinates = makeConditionCoordinates;
    //obj.makeConditionBlock = makeConditionBlock;
    //obj.makeConditionGroup = makeConditionGroup;
    //obj.makeConTemp = makeConTemp;
    //obj.makeDefaultCondition = makeDefaultCondition;
    obj.makeCondition = makeCondition;
    //obj.drawCalcResultRecursiveFunc = drawCalcResultRecursiveFunc;
    //obj.drawCalcResult = drawCalcResult;
    obj.version = version;
    obj.getNewCardId = getNewCardId;
    obj.createCardObject = createCardObject;
    obj.addCardObject = addCardObject;
    obj.deleteCardObject = deleteCardObject;
    obj.getNewConGroupId = getNewConGroupId;
    obj.createConGroupObject = createConGroupObject;
    obj.addConGroupObject = addConGroupObject;
    obj.deleteConGroupObject = deleteConGroupObject;
    obj.getNewConId = getNewConId;
    obj.createConObject = createConObject;
    obj.addConObject = addConObject;
    obj.deleteConObject = deleteConObject;
    obj.getCardsIds = getCardsIds;
    obj.getCardsNums = getCardsNums;
    obj.getCardsNames = getCardsNames;
    obj.getConsource = getConsource;
    obj.setCardNum = setCardNum;
    obj.setCardName = setCardName;
    obj.setConIds = setConIds;
    obj.setConMode = setConMode;
    obj.setConNum = setConNum;
    /*  */
    
  })(root[PRODUCT]);

})(window);
