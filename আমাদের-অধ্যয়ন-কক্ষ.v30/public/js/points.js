(function(){
function LS(k){try{return localStorage.getItem(k)}catch(e){return null}}
var code="",meLS="",ME="p1",OT="p2",CAN=false;
var DB,$=function(i){return document.getElementById(i)},S={p1:{},p2:{}},LB={},offs=[],today="",myKey="",lastW=0,openLB=false,tab="d",day="";
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function bn(n){return Number(n).toLocaleString("bn-BD")}
function key(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function hm(m){return bn(Math.floor(m/60))+"ঘ "+bn(m%60)+"মি"}
function sha(t){return crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)).then(function(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return("0"+x.toString(16)).slice(-2)}).join("")})}
function after10(){return new Date().getHours()>=22}
/* ---- হিসাব ---- */
function studying(s){var n=Date.now();return !!(s&&s.t&&!s.ps&&s.t+(s.d||180)*6e4+(s.pz||0)-n>0)}
function liveM(x){var s=x.st,m=x.m||0;if(studying(s))m+=Math.floor((Date.now()-s.t-(s.pz||0))/6e4);return Math.max(0,m)}
function tasks(x){return(x.dy||[]).filter(function(t){return t&&!t.x&&t.d}).length}
function pts(k,m,mult){return Math.round((k*10+Math.floor(m/15)*10)*(mult||1))}
function rowM(r){return r.m+(r.l&&r.t?Math.max(0,Math.floor((Date.now()-r.t)/6e4)):0)}
function rowP(r){return pts(r.k||0,rowM(r),r.x)}
/* ---- ডেটা শোনা ও লেখা ---- */
function clr(){offs.forEach(function(f){f()});offs=[]}
function on(r,f){r.on("value",f,function(){});offs.push(function(){r.off("value",f)})}
function attach(){
  clr();today=key(new Date());
  var roomPath = (code === "1432014310") ? ("rooms/" + code) : ("rooms_v2/" + code);
  ["p1","p2"].forEach(function(id){var b=DB.ref(roomPath+"/"+id+"/"),o=S[id]||(S[id]={});
    on(b.child("name"),function(s){o.name=s.val()||"";sched()});
    on(b.child("mins/"+today),function(s){o.m=s.val()||0;sched()});
    on(b.child("days/"+today),function(s){o.dy=s.val()||[];sched()});
    on(b.child("study"),function(s){o.st=s.val();sched()})});
}
var wt;function sched(){clearTimeout(wt);wt=setTimeout(write,3000);paint()}
function write(){
  if(!CAN||!myKey)return;var o=S[ME];if(!o||o.m==null)return;lastW=Date.now();
  DB.ref("leaderboard/days/"+today+"/"+myKey).set({n:(o.name||(ME==="p1"?"সাথী ১":"সাথী ২")).slice(0,40),g:"Medical",m:liveM(o),k:tasks(o),x:1,l:studying(o.st),t:Date.now()}).catch(function(){});
}
/* ---- VIP কার্ডে পয়েন্ট ---- */
function paint(){var cs=document.querySelectorAll("#duo .pc");[ME,OT].forEach(function(id,i){var c=cs[i];if(!c)return;var o=S[id]||{},p=c.querySelector(".pts");
  if(!p){p=el("div","mute pts");c.appendChild(p)}p.textContent="🪙 আজকের পয়েন্ট: "+bn(pts(tasks(o),liveM(o)))})}
/* ---- লিডারবোর্ড ---- */
function wkStart(d){var x=new Date(d.getTime());x.setHours(0,0,0,0);x.setDate(x.getDate()-(x.getDay()+1)%7);return x}
function agg(days){var u={};days.forEach(function(d){var D=LB[d]||{};Object.keys(D).forEach(function(k){var r=D[k],a=u[k]||(u[k]={n:r.n,g:r.g,m:0,p:0});a.n=r.n;a.g=r.g;a.m+=rowM(r);if(d!==today||after10())a.p+=rowP(r)})});return u}
function winners(d){var D=LB[d]||{},a=Object.keys(D).map(function(k){return{n:D[k].n,p:rowP(D[k]),m:rowM(D[k])}});a.sort(function(x,y){return y.p-x.p||y.m-x.m});return a[0]&&(a[0].p||a[0].m)?a[0]:null}
function drawLB(){
  var m=$("modal"),b=$("mbox");if(m.hidden||b.dataset.lb!=="1")return;b.textContent="";b.style.maxWidth="560px";
  var tb=el("div","row");tb.style.marginTop="0";
  var d1=el("button","btn"+(tab==="d"?"":" ghost"),"Daily"),w1=el("button","btn"+(tab==="w"?"":" ghost"),"Weekly"),x=el("button","btn ghost","✕");
  [d1,w1,x].forEach(function(z){z.type="button"});d1.onclick=function(){tab="d";drawLB()};w1.onclick=function(){tab="w";drawLB()};x.onclick=function(){m.hidden=true;b.dataset.lb="0"};
  w1.style.marginLeft="auto";tb.appendChild(d1);tb.appendChild(w1);tb.appendChild(x);b.appendChild(tb);
  var days=Object.keys(LB).sort(),rows,hide=false;
  if(tab==="d"){
    if(!day||days.indexOf(day)<0)day=today;
    var sel=el("select");sel.style.cssText="width:100%;margin-top:10px";sel.setAttribute("aria-label","তারিখ");
    days.slice().reverse().forEach(function(d){var o=el("option",null,d===today?"আজ":new Date(d+"T00:00:00").toLocaleDateString("bn-BD",{day:"numeric",month:"long"}));o.value=d;sel.appendChild(o)});
    sel.value=day;sel.onchange=function(){day=sel.value;drawLB()};b.appendChild(sel);
    hide=day===today&&!after10();var D=LB[day]||{};rows=Object.keys(D).map(function(k){return{n:D[k].n,g:D[k].g,m:rowM(D[k]),p:rowP(D[k])}});
  }else{
    var ws=wkStart(new Date()),wd=days.filter(function(d){return d>=key(ws)}),u=agg(wd);hide=false;
    rows=Object.keys(u).map(function(k){return u[k]});
    var fr=new Date().getDay()===5;b.appendChild(el("p","mute",(fr?"🎉 সপ্তাহের ফলাফল · ":"চলমান সপ্তাহ · ")+"শনিবার থেকে শুক্রবার"));
  }
  rows.sort(function(a,c){return hide?c.m-a.m:(c.p-a.p||c.m-a.m)});
  if(!rows.length)b.appendChild(el("p","mute","এখনো কোনো হিসাব নেই।"));
  if(hide)b.appendChild(el("p","mute","পয়েন্ট রাত ১০টায় প্রকাশ হবে। এখন পড়ার সময় অনুযায়ী ক্রম।"));
  var med=["🥇","🥈","🥉"];
  rows.slice(0,10).forEach(function(r,i){var s=el("div","ses"),l=el("div");l.appendChild(el("b",null,(med[i]||bn(i+1)+".")+" "+r.n));l.appendChild(el("small",null,r.g+" · "+hm(r.m)));
    s.appendChild(l);s.appendChild(el("b",null,hide?"🔒":"🪙 "+bn(r.p)));b.appendChild(s)});
  if(tab==="w"){b.appendChild(el("h2",null,"দৈনিক বিজয়ী (এই সপ্তাহ)"));
    days.filter(function(d){return d>=key(wkStart(new Date()))&&(d!==today||after10())}).forEach(function(d){var w=winners(d);if(!w)return;
      var s=el("div","ses");s.appendChild(el("span",null,new Date(d+"T00:00:00").toLocaleDateString("bn-BD",{weekday:"long",day:"numeric",month:"short"})));s.appendChild(el("b",null,"🏆 "+w.n));b.appendChild(s)})}
}
function openBoard(){var m=$("modal"),b=$("mbox");b.dataset.lb="1";m.hidden=false;drawLB()}
function inject(){var md=$("mode");if(!md||$("lbBtn"))return;var b=el("button","pill","🏆 লিডারবোর্ড");b.id="lbBtn";b.type="button";b.onclick=openBoard;md.parentNode.insertBefore(b,md)}

/* ---- স্বয়ংক্রিয় ইনিশিয়ালাইজেশন ---- */
var started=false;
function init(){
  var curCode=LS("sr-code");
  if(!curCode||!window.firebase||started)return;
  started=true;
  code=curCode;
  meLS=LS("sr-me");ME=meLS==="p2"?"p2":"p1";OT=ME==="p1"?"p2":"p1";CAN=meLS==="p1"||meLS==="p2";
  try{DB=firebase.app().database()}catch(e){started=false;return}
  sha(code+"|"+ME).then(function(h){myKey=h.slice(0,20);attach();
    DB.ref("leaderboard/days").orderByKey().limitToLast(14).on("value",function(s){LB=s.val()||{};drawLB()},function(){});
    var d=$("duo");if(d)new MutationObserver(paint).observe(d,{childList:true});inject();
    setInterval(function(){if(key(new Date())!==today){attach();return}paint();drawLB();inject();if(studying(S[ME].st)&&Date.now()-lastW>3e5)write()},5000);
  });
}
setInterval(init, 1000);
init();
})();
