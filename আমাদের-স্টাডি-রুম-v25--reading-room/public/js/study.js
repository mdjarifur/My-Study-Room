(function(){
var DB,c,me,sel,single,mname,R={},CH={},CC={g:true,p:true},cur="",offs=[],SX={},wt,lw=0,fin=0;
var SUBJ=["Physics","Chemistry","Higher Math","Biology","ICT","Bangla","English","অন্যান্য"],PR=["ফজর","যোহর","আসর","মাগরিব","এশা"],TS={s:"Physics",d:45};
function el(t,cl,x){var e=document.createElement(t);if(cl)e.className=cl;if(x!=null)e.textContent=x;return e}
function btn(x,cl,f){var b=el("button","btn"+(cl?" "+cl:""),x);b.type="button";b.onclick=f;return b}
function bn(n){return Number(n).toLocaleString("bn-BD")}
function key(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function day(o){var d=new Date();d.setDate(d.getDate()+(o||0));return key(d)}
function clk(ms){var s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60);s%=60;var p=function(n){return String(n).padStart(2,"0")};return(h?h+":":"")+p(m)+":"+p(s)}
function say(m){var e=document.getElementById("cheer");if(!e)return;e.textContent=m;e.classList.add("show");clearTimeout(say.t);say.t=setTimeout(function(){e.classList.remove("show")},3500)}
function sha(t){return crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)).then(function(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return("0"+x.toString(16)).slice(-2)}).join("")})}
/* ---- ডেটা ---- */
function D(id){return R[id]||{}}
function tk(id,k){return(D(id).days||{})[k]||[]}
function act(s){return !!(s&&s.t&&s.t+s.d*6e4+(s.pz||0)-(s.ps||Date.now())>0)}
function runM(s){return Math.max(0,Math.floor(((s.ps||Date.now())-s.t-(s.pz||0))/6e4))}
function live(id){var o=D(id),m=(o.mins||{})[day()]||0;return m+(act(o.study)?Math.min(runM(o.study),o.study.d):0)}
function dm(id,k){return k===day()?live(id):((D(id).mins||{})[k]||0)}
function pts(id,k){var a=tk(id,k).filter(function(x){return x&&!x.x&&x.d}).length;return Math.round((a*10+Math.floor(dm(id,k)/15)*10)*(single&&id===me?1.5:1))}
function W(p,v){var q=p.split("/"),x=R[me]=R[me]||{};for(var i=0;i<q.length-1;i++)x=x[q[i]]=x[q[i]]||{};x[q[q.length-1]]=v;paint();sched();
  return DB.ref("r2data/"+c+"/"+me+"/"+p).set(v==null?null:v).catch(function(){say("সেভ হয়নি, ইন্টারনেট দেখো")})}
function sched(){clearTimeout(wt);wt=setTimeout(wlb,3000)}
function wlb(){var o=D(me);if(!R[me])return;lw=Date.now();sha(c+"|"+me).then(function(h){
  DB.ref("leaderboard/days/"+day()+"/"+h.slice(0,20)).set({n:(mname||"সদস্য").slice(0,40),g:SX.goal||"Other",m:live(me),k:tk(me,day()).filter(function(x){return x&&!x.x&&x.d}).length,x:single?1.5:1,l:act(o.study)&&!o.study.ps,t:Date.now()}).catch(function(){})})}
/* ---- কাজ ---- */
function finish(){var s=D(me).study;if(!s)return;var m=Math.min(runM(s),s.d),k=day(),o=D(me);
  if(m>0){W("mins/"+k,((o.mins||{})[k]||0)+m);var ss=(o.sess||[]).slice(-199);ss.push({a:s.t,s:s.s,m:m});W("sess",ss)}
  W("study",null);W("brk",null);say(m>0?"চমৎকার! "+bn(m)+" মিনিট জমা হলো":"সেশন থামানো হলো")}
function startBrk(m){var s=D(me).study;if(!s||s.ps)return say("আগে পড়া শুরু করো");W("study",Object.assign({},s,{ps:Date.now()}));W("brk",{e:Date.now()+m*6e4,m:m})}
function endBrk(){var s=D(me).study;if(s&&s.ps){var n=Object.assign({},s);n.pz=(n.pz||0)+Date.now()-n.ps;delete n.ps;W("study",n)}W("brk",null);say("☕ বিরতি শেষ! আবার পড়তে বসো।")}
function addTask(v){var d=new Date(),late=d.getHours()>=22;if(late)d.setDate(d.getDate()+1);var k=key(d),a=tk(me,k).slice();a.push({i:Date.now()+""+Math.floor(Math.random()*1e3),t:v,d:0});W("days/"+k,a);if(late)say("রাত ১০টার পর যোগ করা কাজ আগামীকালের তালিকায় গেছে")}
function mapT(k,i,f){W("days/"+k,tk(me,k).map(function(x){return x.i===i?f(x):x}))}
/* ---- আঁকা ---- */
function build(){
  var me_=sel===me,L=el("section","card");L.appendChild(el("h2",null,"🏆 লিডারবোর্ড"));SX.lb=el("button","sumbtn","");SX.lb.type="button";SX.lb.onclick=function(){window.SRLB&&SRLB.open()};L.appendChild(SX.lb);SX.top.appendChild(L);
  if(me_){SX.coin=el("section","card");SX.top.appendChild(SX.coin)}
  var B=SX.body,tc=el("section","card");tc.appendChild(el("h2",null,"✅ "+(me_?"আজকের কাজ":nm(sel)+" এর আজকের কাজ")));
  if(me_){var f=el("form"),i=el("input");i.type="text";i.maxLength=80;i.placeholder="নতুন কাজ লেখো";i.setAttribute("aria-label","নতুন কাজ");f.appendChild(i);var b=el("button","btn","যোগ করো");b.type="submit";f.appendChild(b);
    f.onsubmit=function(e){e.preventDefault();var v=i.value.trim();if(v){addTask(v);i.value=""}};tc.appendChild(f)}
  SX.ul=el("ul");tc.appendChild(SX.ul);B.appendChild(tc);
  if(me_){var t=el("section","card");t.appendChild(el("h2",null,"⏱ একসাথে পড়ি"));SX.tm=el("div");t.appendChild(SX.tm);B.appendChild(t);
    var br=el("section","card");br.appendChild(el("h2",null,"☕ ব্রেক টাইমার"));var r=el("div","row");r.style.marginTop="0";var bi=el("input");bi.type="text";bi.setAttribute("inputmode","numeric");bi.placeholder="কত মিনিট?";bi.style.cssText="width:120px;flex:none";bi.setAttribute("aria-label","ব্রেকের মিনিট");
    r.appendChild(bi);r.appendChild(btn("ব্রেক শুরু",null,function(){var n=parseInt(bi.value,10);if(!n||n<1||n>120)return say("১ থেকে ১২০ মিনিট লেখো");startBrk(n)}));r.appendChild(btn("ব্রেক শেষ","ghost",endBrk));br.appendChild(r);B.appendChild(br)}
  else{SX.info=el("section","card");B.appendChild(SX.info)}
  SX.pr=el("section","card");B.appendChild(SX.pr);
  var cc=el("section","card");cc.appendChild(el("h2",null,"💬 চ্যাট"));SX.cl=el("div","chat");cc.appendChild(SX.cl);
  var cf=el("form");cf.style.marginTop="8px";SX.ci=el("input");SX.ci.type="text";SX.ci.maxLength=500;SX.ci.placeholder="মেসেজ লেখো...";SX.ci.setAttribute("aria-label","মেসেজ");cf.appendChild(SX.ci);SX.cs=el("button","btn","পাঠাও ➤");SX.cs.type="submit";cf.appendChild(SX.cs);
  cf.onsubmit=function(e){e.preventDefault();var v=SX.ci.value.trim();if(!v||!(CC.g&&CC.p))return;DB.ref("r2chat/"+c).push({u:me,n:(mname||"সদস্য").slice(0,40),x:v.slice(0,500),t:firebase.database.ServerValue.TIMESTAMP}).catch(function(){say("মেসেজ যায়নি")});SX.ci.value=""};
  cc.appendChild(cf);SX.cn=el("p","mute");cc.appendChild(SX.cn);B.appendChild(cc);paint()}
var NM={};function nm(id){return NM[id]||"সদস্য"}
function paint(){
  if(!SX.ul)return;var k=day(),me_=sel===me,o=D(sel),h=new Date().getHours();
  /* লিডারবোর্ড বাটন */
  var tp=window.SRLB?SRLB.top():[];SX.lb.textContent="";SX.lb.appendChild(el("span",null,tp.length?"আজ: "+tp.map(function(n,i){return["🥇","🥈","🥉"][i]+" "+n}).join("  "):"সবার র‍্যাংক দেখো"));SX.lb.appendChild(el("span","mute","বিস্তারিত ›"));
  /* কয়েন */
  if(SX.coin){SX.coin.textContent="";var late=h>=22,p=late?pts(me,k):pts(me,day(-1)),cn=el("div","coin");cn.appendChild(el("i",null,"🪙"));cn.appendChild(el("span",null,bn(p)+" পয়েন্ট"));SX.coin.appendChild(cn);
    SX.coin.appendChild(el("div","mute",late?"আজ আপনি মোট "+bn(p)+" পয়েন্ট অর্জন করেছেন। আপনাকে অভিনন্দন!":"গতকালের অর্জিত পয়েন্ট"))}
  /* কাজ */
  SX.ul.textContent="";var ts=tk(sel,k).filter(function(x){return x&&!x.x&&!x.h});
  if(!ts.length)SX.ul.appendChild(el("li","mute",me_?"উপরে লিখে প্রথম কাজটা যোগ করো।":"এখনো কোনো কাজ নেই।"));
  ts.forEach(function(t){var li=el("li",(t.d?"done":"")+(me_?"":" ro")),ch=el("button","chk",t.d?"✓":"");ch.type="button";ch.setAttribute("aria-label",t.t);
    if(me_)ch.onclick=function(){mapT(k,t.i,function(x){return Object.assign({},x,{d:x.d?0:1})})};else ch.disabled=true;
    li.appendChild(ch);li.appendChild(el("span","txt",t.t));if(me_){var x=el("button","del","×");x.type="button";x.setAttribute("aria-label","মুছে ফেলো");x.onclick=function(){mapT(k,t.i,function(y){return Object.assign({},y,{x:1})})};li.appendChild(x)}SX.ul.appendChild(li)});
  /* টাইমার */
  if(SX.tm){var s=o.study,bx=D(me).brk;SX.tm.textContent="";
    if(act(s)){var w=el("div","clk"),cl=el("div","big",clk(0));SX.clk=cl;w.appendChild(el("div","mute",s.s+(s.ps?" · বিরতিতে":"")));w.appendChild(cl);SX.tm.appendChild(w);var b=btn("থামাও ও সেভ করো","alt",finish);b.style.marginTop="10px";SX.tm.appendChild(b)}
    else if(SX.addingSubj){
      var af=el("div","row");af.style.marginTop="0";
      var ni=el("input");ni.type="text";ni.placeholder="নতুন বিষয় লিখুন...";ni.style.cssText="flex:1;min-width:140px";
      var ab=btn("✓ যোগ","alt",function(){
        var v=ni.value.trim();if(!v)return say("বিষয়ের নাম লেখো");
        try{
          var ls=JSON.parse(localStorage.getItem("sr_custom_subj")||"[]");
          if(ls.indexOf(v)<0){ls.push(v);localStorage.setItem("sr_custom_subj",JSON.stringify(ls))}
          DB.ref("r2data/"+c+"/custom_subjects").push(v).catch(function(){});
        }catch(e){}
        TS.s=v;SX.addingSubj=false;paint();
      });
      var cb=btn("বাতিল","ghost",function(){SX.addingSubj=false;paint()});
      af.appendChild(ni);af.appendChild(ab);af.appendChild(cb);SX.tm.appendChild(af);
      setTimeout(function(){ni.focus()},50);
    }
    else{SX.clk=null;var f=el("div","row");f.style.marginTop="0";var se=el("select");se.setAttribute("aria-label","বিষয়");
      var subjs=SUBJ.slice();
      try{
        var saved=JSON.parse(localStorage.getItem("sr_custom_subj")||"[]");
        saved.forEach(function(x){if(subjs.indexOf(x)<0&&x.trim())subjs.push(x.trim())});
      }catch(e){}
      if(subjs.indexOf(TS.s)<0)TS.s=subjs[0]||"Physics";
      subjs.forEach(function(x){var op=el("option",null,x);op.value=x;se.appendChild(op)});se.value=TS.s;se.onchange=function(){TS.s=se.value};
      var asb=btn("➕ বিষয় যোগ","ghost",function(){SX.addingSubj=true;paint()});asb.style.cssText="padding:6px 10px;font-size:13px;white-space:nowrap";
      var de=el("select");de.setAttribute("aria-label","সময়");[25,45,60,90,120].forEach(function(n){var op=el("option",null,bn(n)+" মিনিট");op.value=n;de.appendChild(op)});de.value=TS.d;de.onchange=function(){TS.d=+de.value};
      f.appendChild(se);f.appendChild(asb);f.appendChild(de);f.appendChild(btn("পড়া শুরু ▶",null,function(){W("study",{s:TS.s,t:Date.now(),d:TS.d})}));SX.tm.appendChild(f)}}
  else if(SX.info){SX.info.textContent="";SX.info.appendChild(el("h2",null,"📖 "+nm(sel)+" এর পড়া"));SX.info.appendChild(el("div",null,"আজ: "+bn(live(sel))+" মিনিট"+(act(o.study)&&!o.study.ps?" · এখন পড়ছে: "+o.study.s:"")));
    (o.sess||[]).slice(-6).reverse().forEach(function(x){var r=el("div","ses");r.appendChild(el("span",null,x.s+" · "+new Date(x.a).toLocaleDateString("bn-BD",{day:"numeric",month:"short"})));r.appendChild(el("b",null,bn(x.m)+" মিনিট"));SX.info.appendChild(r)})}
  /* নামাজ */
  SX.pr.textContent="";SX.pr.appendChild(el("h2",null,"🕌 প্রতিদিনের সালাত/নামাজ ট্র্যাকার"));var ps=(o.pr||{})[k]||"00000",g=el("div","pg");
  PR.forEach(function(z,i){var on=ps[i]==="1",b=el("button","pbx"+(on?" on":""));b.type="button";b.appendChild(el("b",null,z));b.appendChild(el("span",null,on?"✓ আদায় হয়েছে":"বাকি আছে"));
    if(me_)b.onclick=function(){var a=ps.split("");a[i]=a[i]==="1"?"0":"1";W("pr/"+k,a.join(""))};else b.disabled=true;g.appendChild(b)});SX.pr.appendChild(g);
  /* চ্যাট */
  var ok=CC.g&&CC.p,near=SX.cl.scrollHeight-SX.cl.scrollTop-SX.cl.clientHeight<80;SX.cl.textContent="";SX.ci.disabled=SX.cs.disabled=!ok;SX.cn.textContent=ok?"":"অ্যাডমিন এখন এই চ্যাট বন্ধ রেখেছেন।";
  var ks=Object.keys(CH).sort();if(!ks.length)SX.cl.appendChild(el("p","mute","এখনো কোনো মেসেজ নেই।"));
  ks.forEach(function(q){var m=CH[q],d=el("div","msg"+(m.u===me?" me":""));if(m.u!==me)d.appendChild(el("small",null,m.n||""));d.appendChild(el("span",null,m.x||""));
    if(m.u===me&&ok){var x=el("button","del","×");x.type="button";x.setAttribute("aria-label","মেসেজ মুছো");x.onclick=function(){DB.ref("r2chat/"+c+"/"+q).remove()};d.appendChild(x)}SX.cl.appendChild(d)});
  if(near)SX.cl.scrollTop=SX.cl.scrollHeight}
function tick(){
  if(SX.clk){var s=D(sel).study;if(s){var rem=s.t+s.d*6e4+(s.pz||0)-(s.ps||Date.now()),bx=D(sel).brk;SX.clk.textContent=bx&&bx.e>Date.now()&&s.ps?clk(bx.e-Date.now()):clk(rem)}}
  var s2=D(me).study,b2=D(me).brk;
  if(s2&&!s2.ps&&s2.t+s2.d*6e4+(s2.pz||0)<=Date.now()&&fin!==s2.t){fin=s2.t;finish()}
  if(b2&&b2.e<=Date.now()&&fin!=="b"+b2.e){fin="b"+b2.e;endBrk()}
  if(SX.coin&&Date.now()%5000<1000)paint();
  if(Date.now()-lw>3e5&&act(D(me).study))wlb()}
setInterval(tick,1000);
function on(r,f){r.on("value",f,function(){});offs.push(function(){r.off("value",f)})}
function attach(o){offs.forEach(function(f){f()});offs=[];R={};CH={};
  on(DB.ref("r2data/"+c+"/"+me),function(s){R[me]=s.val()||{};paint();sched()});
  if(sel!==me)on(DB.ref("r2data/"+c+"/"+sel),function(s){R[sel]=s.val()||{};paint()});
  on(DB.ref("r2chat/"+c).limitToLast(50),function(s){CH=s.val()||{};paint()});
  on(DB.ref("chat_controls/global"),function(s){CC.g=s.val()!==false;paint()});
  on(DB.ref("chat_controls/pairs/"+c),function(s){CC.p=s.val()!==false;paint()})}
window.SRS={mount:function(o){
  var k=o.c+"|"+o.id+"|"+o.sel;DB=o.DB;c=o.c;me=o.id;sel=o.sel;single=o.n===1;mname=o.name;NM=o.names||{};
  SX={top:el("div"),body:el("div"),goal:o.goal};if(k!==cur){cur=k;attach()}build();return SX}};
if(window.SRREDRAW)SRREDRAW();
})();
