/**
draw-calculator.js

Copyright (c) 2020 WingTSK
*/
    
function makeMultiHandPat(d, h, g, pt){
  if (typeof(g) == "number"){
    g = [g];
  }
  let p = [];
  let n = 0;
  for (let i = 0; i < g.length; i++){
    p[i] = 0;
  }
  let c = multiDCombination(d, h, g, p, n, pt);
  return c;
}

function multiDCombination(d, h, g, p, n, pt){
  let a = [];
  let dg = d - sumArray(g);
  for (p[n]=0; p[n] <= g[n]; p[n]++){
    let v = 1;
    if (p.length > n + 1){
      a.push(multiDCombination(d, h, g, p, n + 1, pt))
    }else{
      let poi = sumArray(p);
      if (h >= poi){
        for (let j = 0; j < p.length; j++){
          v = v * combination_pt(g[j], p[j], pt);
        }
        v = v * combination_pt(dg, h - poi, pt);
      }else{
        v = 0;
      }
      a.push(v);
    }
  }
  return a;
}

function sumArray(ary){
  let s = 0;
  for (let i = 0; i < ary.length; i++){
      s = s + ary[i];
  }
  return s;
}

function combination(n, r){
  if (n >= r && r >= 0){
    let k = Math.min(r, n - r);
    let c = 1;
    for (let i = 0; i < k; i++){
      c = c * (n - i) / (1 + i);
    }
    return c;
  }else{
    return 0;
  }
}

function pascal_triangle(n){
  let a = [];
  for (let i = 0; i <= n; i++){
    let b = [];
    for (let j = 0; j <= i; j++){
      if (i == 0 || j == 0){
        b.push(1);
      }else{
        if (j == i){
          b.push(a[i - 1][j - 1]);
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
  if (n < r){
    return 0;
  }else{
    let k = Math.min(r, n - r);
    return pt[n][k];
  }
}

function chkMultiHandPat(m, h, g, c){
  let p = [];
  for (let i = 0; i < g.length; i++){
    p[i] = 0;
  }
  return chkMDC(m, h, g, c, p, 0, 0);
}
function chkMDC(m, h, g, c, p, n, v){
  let r = 0;
  for (p[n] = 0; p[n] <= g[n]; p[n]++){
    if (n < p.length - 1){
      r = r + chkMDC(m, h, g, c, p, n + 1, v + p[n]);
    }else{
      if (v + p[n] <= h){
        if (ccMDC(m, g, c, p) == 1){
          r = r + multiAryV(m, p, 0);
        }
      }
    }
  }
  return r;
}

function ccMDC(m, g, c0, p){
  let l = c0.length;
  let t = 1;
  let tc = 0;
  let cx = c0[l - 1].slice();
  if (l > 1){
    let c1 = c0.slice();
    c1.length = l - 1;
    tc = ccMDC(m, g, c1, p);
  }
  if (tc == 0){
    for (let i = 0; i < cx.length; i++){
      if (p[i] < cx[i][0] || p[i] > cx[i][1]){
        t = 0
      }
    }
  }
  return t;
}

function multiAryV(m, p, n){
  let v = 0;
  if (n < p.length - 1){
    v = multiAryV(m[p[n]], p, n+1);
  }else{
    v = m[p[n]];
  }
  return v;
}

function makecondition(g){
  let c = [];
  for (let i = 0; i < rows_counter.length; i++){
    let con =[];
    for (let j = 0; j < cols_counter.length; j++){
      let strn = '[name="condition_n_' + String(rows_counter[i]) + '_' + String(cols_counter[j]) + '"]';
      let strm = '[name="condition_m_' + String(rows_counter[i]) + '_' + String(cols_counter[j]) + '"]';
      let numc = document.querySelector(strn).value;
      let mode = document.querySelector(strm).value;
      let numg = g[j];
      if (mode == "0"){
       let ca =[];
        ca.push(Number(numc));
        ca.push(numg);
        con.push(ca);
      }else if (mode == "1"){
        let ca =[];
        ca.push(Number(numc));
        ca.push(Number(numc));
        con.push(ca);
      }else if (mode == "2"){
        let ca =[];
        ca.push(0);
        ca.push(numg - Number(numc));
        con.push(ca);
      }else if (mode == "3"){
        let ca =[];
        ca.push(numg - Number(numc));
        ca.push(numg - Number(numc));
        con.push(ca);
      }else{
        let ca =[];
        ca.push(0);
        ca.push(numg);
        con.push(ca);
      }
    }
    c.push(con);
  }
  return c;
}

function printDrawCalc(){
  document.querySelector("#export_box").value = "";
  if (rows_counter.length && cols_counter.length){
    let deck = Number(document.querySelector('[name="deck"]').value);
    let hand = Number(document.querySelector('[name="hand"]').value);
    let group = [];
    let pt = pascal_triangle(deck);
    for (let j = 0; j < cols_counter.length; j++){
      let str = '[name="group_' + String(cols_counter[j]) + '"]';
      group.push(Number(document.querySelector(str).value));
    }
    if (sumArray(group) <= deck && hand <= deck){
      let multi = makeMultiHandPat(deck, hand, group, pt);
      let condition = makecondition(group);
      let result = chkMultiHandPat(multi, hand, group, condition);
      document.querySelector('[id="output"]').innerText = "計算結果："+String(Math.round(result/combination_pt(deck,hand,pt)*1000000)/10000)+"％\n("+result+"／"+combination_pt(deck,hand,pt)+"通り)";
      let cl = condition.length;
      for (let k = 0; k < cl; k++){
        let scon = [];
        scon.push(condition[k]);
        document.querySelectorAll(".row_result")[k].innerText = String(Math.round(chkMultiHandPat(multi, hand, group, scon)/combination_pt(deck,hand,pt)*1000000)/10000)+"％";
      }
      condition_ex();
    }else{
      let err = "";
      if (hand > deck){
        err = "エラー：手札枚数がデッキ枚数を超えています。\n";
      }
      if (sumArray(group) > deck){
        err = "エラー：登録カードの合計枚数がデッキ枚数を超えています。\n";
      }
      document.querySelector('[id="output"]').innerText = err;
    }
  }else{
    let err = "";
    if (!(rows_counter.length)){
      err = "エラー：条件が登録されていません。\n";
    }
    if (!(cols_counter.length)){
      err = "エラー：カードが登録されていません。\n";
    }
    document.querySelector('[id="output"]').innerText = err;
  }
}

function printDrawClear(){
  let rows = rows_counter.length;
  let cols = cols_counter.length;
  for (let i = 0; i < rows; i++){
    let obj = document.querySelector("#esc_table > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > input");
    deleteRow(obj,rows_counter[i]);
  }
  for (let i = cols - 1; i >= 0; i--){
    deleteColumn("esc_table",cols_counter[i]);
  }
  insertRow('esc_table');
  insertColumn('esc_table');
  document.querySelector("#output").innerText = "条件を設定してください";
  document.querySelector("#export_box").value = "";
}

function condition_ex(){
  let src =  + document.querySelector("#deck_n").value
  + "_$" + document.querySelector("#hand_n").value
  + "_$" + rows_counter.length
  + "_$" + cols_counter.length + "_$";
  for (let i = 0; i < cols_counter.length; i++){
    let c = "0";
    if (document.querySelectorAll(".cardnum")[ i ].value.length){
      c = document.querySelectorAll(".cardnum")[ i ].value;
    }
    src = src + "_$" + document.querySelectorAll(".cardname")[ i ].value
      + "_$" + c;
  }
  src = src + "_$";
  for (let i = 0; i < cols_counter.length * rows_counter.length; i++){
    let cn = "0";
    if (document.querySelectorAll(".condition_n")[ i ].value.length){
    cn = document.querySelectorAll(".condition_n")[ i ].value;
    }
    src = src + "_$" + cn
      + "_$" + document.querySelectorAll(".condition_m")[ i ].value;
  }
  let dst = "x=" + Base64.toBase64(RawDeflate.deflate(Base64.utob(src)));
  let res = document.querySelector("#output").innerText;
  for (let i = 0; i < rows_counter.length; i++){
    res = res + "_$" + document.querySelectorAll(".row_result")[ i ].innerText;
  }
  let rdst = "y=" + Base64.toBase64(RawDeflate.deflate(Base64.utob(res)))
  document.querySelector("#export_box").value = location.href.replace(/\#.*$/, '').replace(/\?.*$/, '') + "?" + dst + "&" + rdst;
}

function condition_in(){
  let dst = Base64.btou(RawDeflate.inflate(Base64.fromBase64(queryParam.x)));
  let c = dst.split("_$_$");
  c[0]=c[0].split("_$");
  c[1]=c[1].split("_$");
  c[2]=c[2].split("_$");
  document.querySelector("#deck_n").value = c[0][0];
  document.querySelector("#hand_n").value = c[0][1];
  for (let r = 0; r < c[0][2]; r++){
    insertRow('esc_table');
  }
  for (let i = 0; i < c[0][3]; i++){
    insertColumn('esc_table');
  }
  for (let i = 0; i < c[0][3]; i++){
    document.querySelectorAll(".cardname")[ i ].value = c[1][ 2*i ];
    document.querySelectorAll(".cardnum")[ i ].value = c[1][ 2*i + 1 ];
  }
  for (let i = 0; i < c[0][2] * c[0][3]; i++){
    document.querySelectorAll(".condition_n")[ i ].value = c[2][ 2*i ];
    document.querySelectorAll(".condition_m")[ i ].value = c[2][ 2*i + 1 ];
  }
  if (queryParam.y && queryParam.y.length){
    let rdst = Base64.btou(RawDeflate.inflate(Base64.fromBase64(queryParam.y)));
    let d = rdst.split("_$");
    document.querySelector("#output").innerText = d[0];
    for (let i = 0; i < rows_counter.length; i++){
      document.querySelectorAll(".row_result")[ i ].innerText = d[ i + 1 ];
    }
    document.querySelector("#export_box").value = location.href.replace(/\#.*$/, '').replace(/\?.*$/, '') + "?" + queryParam.x + "&" + queryParam.y;
  }else{
    printDrawCalc();
  }
}

function insertRow(id) {
  let table = document.getElementById(id);
  let cell_len = table.rows[0].cells.length;
  let row = table.insertRow(-1);
  let cell0 = row.insertCell(-1);
  let r = 1;
  if (rows_counter.length > 0){
    r = rows_counter[rows_counter.length - 1] + 1;
  }
  rows_counter.push(r);
  cell0.className = "fixed02";
  let button = '<input type="button" value="条件削除" onclick="deleteRow(this,'+r+')" /><br>条件'+String(r)+'：<span class="row_result"></span>';
  cell0.innerHTML = button;
  for (let i = 1 ; i < cell_len; i++){
    let cell = row.insertCell(-1);
    cell.innerHTML = '<input type="number" class="condition_n" name="condition_n_'
      + String(r) + '_' + String(cols_counter[i - 1]) + '" size="15" placeholder="枚数" min="0" max="255" onclick="this.select();">枚<br><select class="condition_m" name="condition_m_'
      + String(r) + '_' + String(cols_counter[i - 1]) + '" size="1"><option disabled selected value>－－－－</option><option selected value="0">以上ドロー</option><option value="1">ちょうどドロー</option><option value="2">以上デッキに残す</option><option value="3">ちょうどデッキに残す</option></select>';
  }
}

function deleteRow(obj,r){
  tr = obj.parentNode.parentNode;
  tr.parentNode.deleteRow(tr.sectionRowIndex);
  rows_counter.splice(rows_counter.indexOf(r),1);
}

function insertColumn(id){
  let table = document.getElementById(id);
  let rows = table.rows.length;
  let cell = table.rows[0].insertCell(-1);
  let cols = table.rows[0].cells.length;
  let c = 1;
  if (cols_counter.length > 0){
    c = cols_counter[cols_counter.length - 1] + 1;
  }
  cols_counter.push(c);
  cell.className = "fixed02";
  cell.innerHTML = '<input type="button" value="カード削除" onclick="deleteColumn(\'esc_table\','+String(c)+')">';
  cell = table.rows[1].insertCell(-1);
  cell.className = "fixed02";
  cols = table.rows[1].cells.length;
  cell.innerHTML = '<input type="text" class="cardname" name="name_'+String(c)+'" placeholder="カード名"　size="20" value="カード'+String(c)+'"><br><label>／<input type="number" name="group_'+String(c)+'" class="cardnum" size="15" placeholder="投入枚数" min="0" max="255" onclick="this.select();">枚</label>'
  for (let i = 2; i < rows; i++){
    cell = table.rows[i].insertCell(-1);
    cols = table.rows[i].cells.length;
    cell.innerHTML = '<input type="number" class="condition_n" name="condition_n_'
      + String(rows_counter[i - 2]) + '_' + String(c) + '" size="15" placeholder="枚数" min="0" max="255" onclick="this.select();">枚<br><select class="condition_m" name="condition_m_'
      + String(rows_counter[i - 2]) + '_' + String(c) + '" size="1"><option disabled selected value>▼▼ モード ▼▼</option><option selected value="0">以上ドロー</option><option value="1">ちょうどドロー</option><option value="2">以上デッキに残す</option><option value="3">ちょうどデッキに残す</option></select>';
  }
}

function deleteColumn(id,n){
  let table = document.getElementById(id);
  let rows = table.rows.length;
  let tc = cols_counter.indexOf(n) + 1;
  for (let i = 0; i < rows; i++){
    let cols = table.rows[i].cells.length;
    table.rows[i].deleteCell(tc);
  }
  cols_counter.splice(cols_counter.indexOf(n),1);
}

function copyToClipboard(id){
  let copyTarget = document.querySelector(id);
  copyTarget.select();
  document.execCommand("Copy");
}
