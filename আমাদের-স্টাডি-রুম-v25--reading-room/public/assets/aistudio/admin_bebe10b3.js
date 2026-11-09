// public/js/admin.js - মোটিভেশন কন্ট্রোল ও ওয়ান-ওয়ে মেসেজিং সহ পূর্ণাঙ্গ অ্যাডমিন ইঞ্জিন
(function(){
var ADMIN_ID = "admin121";
var PH = "86cea6d99a4b913ee8b217e1cf692d9fbe0a495397f97ef5c4acbbab61c61f34";
var VIP = "1432014310";

var db = window.db || (firebase.apps.length ? firebase.database() : firebase.initializeApp(FB_CONFIG).database());
var T = firebase.database.ServerValue.TIMESTAMP;

var $ = function(i){ return document.getElementById(i); };
function el(t,c,x){ var e=document.createElement(t); if(c)e.className=c; if(x!=null)e.textContent=x; return e; }
function btn(l,c,f){ var b=el("button","btn"+(c?" "+c:""),l); b.type="button"; b.onclick=f; return b; }
function bn(n){ return Number(n||0).toLocaleString("bn-BD"); }
function fm(m){ m=m||0; return(m>=60?bn(Math.floor(m/60))+"ঘ ":"")+bn(m%60)+"মি"; }
function key(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function fd(t){ return t?new Date(t).toLocaleString("bn-BD",{day:"numeric",month:"short",hour:"numeric",minute:"2-digit"}):"—"; }
function toast(m){ var t=$("toast"); t.textContent=m; t.classList.add("show"); clearTimeout(toast.t); toast.t=setTimeout(function(){t.classList.remove("show");},3200); }

var R={}, R2={}, M={}, L={}, view="ov", F={q:"",f:"all",s:"today",room:""}, at=0, live=false;
var ST = { pending:"অপেক্ষমাণ", trial:"৩ দিনের ট্রায়াল", approved:"অনুমোদিত", suspended:"সাময়িক বন্ধ", expired:"মেয়াদ শেষ", blocked:"ব্লক" };
var AN = { delete_user:"মেম্বার মোছা", chat_delete:"মেসেজ মোছা", room_edit:"রুম সেটিংস", notice:"অ্যাডমিন নোটিশ" };

var activeMotCat = "Medical"; // মোটিভেশন ক্যাটাগরি স্টেট

function rn(r){
  if(r===VIP) return "Queen Room";
  if(M[r] && M[r].name) return M[r].name;
  if(R2[r] && R2[r].meta && R2[r].meta.name) return R2[r].meta.name;
  return r;
}

function act(s){
  var n = Date.now();
  return !!(s && s.t && s.t+(s.d||180)*6e4+(s.pz||0)-(s.ps||n)>0 && (!s.ps || n-s.ps<9e6));
}

function rows(){
  var o = [], k = key(new Date()), n = Date.now(), seen = {};

  Object.keys(R2).forEach(function(room){
    var rm = R2[room] || {}, mems = rm.members || {};
    Object.keys(mems).forEach(function(id){
      var uniq = room + "___" + id;
      if(seen[uniq]) return;
      seen[uniq] = true;

      var p = rm[id] || mems[id] || {};
      var d = (p.days && p.days[k] ? p.days[k] : []).filter(function(x){ return !x.x; });
      var tot = 0, z, isLive = act(p.study);
      for(z in (p.mins||{})) tot += p.mins[z] || 0;
      var today = (p.mins && p.mins[k] ? p.mins[k] : 0) + (isLive ? Math.max(0,Math.floor(((p.study.ps||n)-p.study.t-(p.study.pz||0))/6e4)) : 0);

      o.push({
        room: room, id: id, name: p.name || "সদস্য",
        today: today, tot: tot, td: d.filter(function(x){return x.d;}).length, tt: d.length,
        pr: ((p.pr && p.pr[k] ? p.pr[k] : "").split("1").length - 1),
        on: ((rm.pres||{})[id] === true), st: isLive && !(p.brk && p.brk.e > n),
        isV2: true, goal: p.goal || "সাধারণ", mobile: p.mobile || ""
      });
    });
  });

  Object.keys(R).forEach(function(room){
    ["p1","p2"].forEach(function(id){
      var uniq = room + "___" + id;
      if(seen[uniq]) return;
      seen[uniq] = true;

      var p = (R[room]||{})[id] || {};
      if(!p.name && !Object.keys(p.mins||{}).length && !Object.keys(p.days||{}).length) return;
      var d = (p.days && p.days[k] ? p.days[k] : []).filter(function(x){ return !x.x; });
      var tot = 0, z, isLive = act(p.study);
      for(z in (p.mins||{})) tot += p.mins[z] || 0;
      var today = (p.mins && p.mins[k] ? p.mins[k] : 0) + (isLive ? Math.max(0,Math.floor(((p.study.ps||n)-p.study.t-(p.study.pz||0))/6e4)) : 0);

      o.push({
        room: room, id: id, name: p.name || (id==="p1"?"সাথী ১":"সাথী ২"),
        today: today, tot: tot, td: d.filter(function(x){return x.d;}).length, tt: d.length,
        pr: ((p.pr && p.pr[k] ? p.pr[k] : "").split("1").length - 1),
        on: ((R[room].pres||{})[id] === true), st: isLive && !(p.brk && p.brk.e > n),
        isV2: false, goal: "মেডিকেল", mobile: ""
      });
    });
  });

  return o;
}

function lr(){
  try{ return JSON.parse(localStorage.getItem("ad-rooms")||"[]"); }catch(e){ return []; }
}

function load(){
  var bad = [];
  function g(q){
    return q.once("value").then(function(x){ return x.val() || {}; }, function(e){ bad.push(e.code||e.message); return {}; });
  }

  return Promise.all([
    g(db.ref("room_meta")),
    g(db.ref("rooms_v2")),
    g(db.ref("audit_logs").orderByChild("at").limitToLast(120))
  ]).then(function(r){
    M = r[0]; R2 = r[1]; L = r[2];

    var cs = {};
    cs[VIP] = 1;
    Object.keys(M).forEach(function(k){ cs[k]=1; });
    lr().forEach(function(k){ cs[k]=1; });
    var ks = Object.keys(cs);

    return Promise.all(ks.map(function(k){ return g(db.ref("rooms/"+k)); })).then(function(v){
      R = {};
      ks.forEach(function(k,i){ R[k] = v[i]; });
      at = Date.now();
      render();
      if(bad.length) toast("কিছু অংশ লোড হয়নি ("+bad[0]+")");
    });
  }).catch(function(e){
    toast("লোড হয়নি: " + (e.code||e.message));
  });
}

function log(action, room, det, ups){
  var k = db.ref("audit_logs").push().key;
  ups = ups || {};
  ups["audit_logs/"+k] = {
    action: action, by: "admin", targetUid: room || "",
    targetName: rn(room).slice(0,60), details: String(det||"").slice(0,500), at: T
  };
  return db.ref().update(ups).then(function(){
    toast("সফল হয়েছে ✓");
    return load();
  }, function(e){
    toast("ব্যর্থ: " + (e.code||e.message));
  });
}

function deleteSingleLog(kId, lObj){
  var isVip = (lObj.targetUid === VIP) || (lObj.targetUid === "1432014310") || (lObj.targetName && lObj.targetName.indexOf("Queen Room") > -1);
  if(isVip){
    return alert("নিরাপত্তা সতর্কতা: VIP রুমের রেকর্ড স্থায়ী এবং সুরক্ষিত। এটি কোনোভাবেই মোছা যাবে না!");
  }

  if(!confirm("এই লগটি পাকাপাকিভাবে মুছে ফেলতে চান?")) return;

  db.ref("audit_logs/" + kId).remove().then(function(){
    delete L[kId];
    toast("লগ মুছে ফেলা হয়েছে ✓");
    render();
  }).catch(function(e){
    toast("ব্যর্থ: " + (e.code || e.message));
  });
}

function openM(){ var b=$("mbox"); b.textContent=""; $("modal").hidden=false; return b; }
function closeM(){ $("modal").hidden=true; }
$("modal").onclick = function(e){ if(e.target===this) closeM(); };
document.addEventListener("keydown", function(e){ if(e.key==="Escape") closeM(); });

function detail(room, id){
  var m = openM();
  var r = rows().filter(function(x){ return x.room===room && x.id===id; })[0] || {
    name: "অজানা", today: 0, tot: 0, td: 0, tt: 0, pr: 0
  };

  m.appendChild(el("h2", null, r.name + " · " + rn(room)));
  var c = el("div","chips");
  [["আজ", fm(r.today)], ["মোট", fm(r.tot)], ["কাজ", bn(r.td)+"/"+bn(r.tt)], ["নামাজ", bn(r.pr)+"/৫"]].forEach(function(a){
    c.appendChild(el("span","chip", a[0]+": "+a[1]));
  });
  m.appendChild(c);

  if(r.goal) m.appendChild(el("p", "mute", "টার্গেট: " + r.goal + (r.mobile ? " | মোবাইল: " + r.mobile : "")));

  var row = el("div","row");
  row.style.marginTop = "16px";
  if(room !== VIP){
    row.appendChild(btn("🗑 এই সদস্যকে মুছুন", "dn", function(){
      if(!confirm(r.name + " এর ডেটা মুছে ফেলতে চান?")) return;
      var u = {};
      var pth = r.isV2 ? ("rooms_v2/"+room+"/members/"+id) : ("rooms/"+room+"/"+id);
      u[pth] = null;
      closeM();
      log("delete_user", room, id + " ("+r.name+") মুছে ফেলা হলো", u);
    }));
  }
  row.appendChild(btn("বন্ধ","ghost", closeM));
  m.appendChild(row);
}

function metaM(room){
  var m = openM(), d = M[room] || (R2[room] && R2[room].meta) || {};
  m.appendChild(el("h2", null, "রুম অনুমোদন ও মেয়াদ · " + room));

  var n = el("input"); n.placeholder = "রুমের নাম"; n.maxLength = 40;
  n.value = d.name || (room===VIP ? "Queen Room" : "");

  var s = el("select");
  Object.keys(ST).forEach(function(x){
    var o = el("option", null, ST[x]); o.value = x; s.appendChild(o);
  });
  s.value = d.status || "trial";
  s.disabled = room === VIP;

  var curExp = d.expiresAt || d.trialEnds || 0;
  var e = el("input"); e.type = "date";
  e.value = curExp ? key(new Date(curExp)) : "";
  e.disabled = room === VIP;

  m.appendChild(el("small", "mute", "রুমের নাম:")); m.appendChild(n);
  m.appendChild(el("small", "mute", "স্ট্যাটাস:")); m.appendChild(s);
  m.appendChild(el("small", "mute", "মেয়াদ শেষ হওয়ার তারিখ:")); m.appendChild(e);

  if(room !== VIP){
    var quickDiv = el("div","row");
    quickDiv.style.marginTop = "12px";
    quickDiv.appendChild(btn("⚡ + ৩০ দিন অনুমোদন দিন", "alt", function(){
      var nowPlus30 = Date.now() + 30 * 864e5;
      e.value = key(new Date(nowPlus30));
      s.value = "approved";
      toast("৩০ দিন সিলেক্ট হয়েছে, 'সেভ করুন' চাপুন");
    }));
    quickDiv.appendChild(btn("+ ৬০ দিন", "ghost", function(){
      var nowPlus60 = Date.now() + 60 * 864e5;
      e.value = key(new Date(nowPlus60));
      s.value = "approved";
      toast("৬০ দিন সিলেক্ট হয়েছে, 'সেভ করুন' চাপুন");
    }));
    m.appendChild(quickDiv);
  }

  var row = el("div","row");
  row.style.marginTop = "16px";
  row.appendChild(btn("সেভ করুন", null, function(){
    var o = { updatedAt: T };
    if(n.value.trim()) o.name = n.value.trim().slice(0,40);
    if(room !== VIP) {
      o.status = s.value;
      if(e.value) o.expiresAt = new Date(e.value+"T23:59:59").getTime();
    }
    var u = {};
    u["room_meta/"+room] = o;
    if(R2[room]) {
      u["rooms_v2/"+room+"/meta/name"] = o.name;
      u["rooms_v2/"+room+"/meta/status"] = o.status;
      if(o.expiresAt) u["rooms_v2/"+room+"/meta/expiresAt"] = o.expiresAt;
    }
    closeM();
    log("room_edit", room, "স্ট্যাটাস="+o.status+", মেয়াদ="+e.value, u);
  }));
  row.appendChild(btn("বাতিল","ghost", closeM));
  m.appendChild(row);
}

function delRoom(room){
  if(room === VIP) return toast("VIP রুম মোছা যাবে না");
  if(prompt("রুম মুছতে কোডটি হুবহু লিখুন: " + room) !== room) return toast("কোড মেলেনি");
  if(!confirm("রুম " + room + "-এর সব তথ্য মুছে যাবে। নিশ্চিত?")) return;

  var u = {};
  u["rooms/"+room] = null;
  u["rooms_v2/"+room] = null;
  u["room_meta/"+room] = null;
  log("delete_user", room, "পুরো রুম ডিলিট", u);
}

/* ---------- ভিউসমূহ ---------- */
var V = {};

// ১. ওভারভিউ (ক্লিকেবল KPI বাটন)
V.ov = function(m){
  var r = rows();
  var allRooms = Array.from(new Set(Object.keys(R).concat(Object.keys(R2))));
  var on = r.filter(function(x){ return x.on; }).length;
  var st = r.filter(function(x){ return x.st; }).length;
  var sum = r.reduce(function(a,x){ return a + x.today; }, 0);

  var k = el("div","kpi");
  var cardsData = [
    { title: "মোট রুম", val: bn(allRooms.length), click: function(){ view="rooms"; render(); } },
    { title: "মোট সদস্য", val: bn(r.length), click: function(){ F.f="all"; view="users"; render(); } },
    { title: "অনলাইন", val: bn(on), click: function(){ F.f="on"; view="users"; render(); } },
    { title: "এখন পড়ছে", val: bn(st), click: function(){ F.f="st"; view="users"; render(); } },
    { title: "আজকের মোট পড়া", val: fm(sum), click: function(){ F.s="today"; view="users"; render(); } }
  ];

  cardsData.forEach(function(a){
    var c = el("div","card");
    c.title = a.title + " দেখতে চাপুন";
    c.appendChild(el("div","mute", a.title + " ›"));
    c.appendChild(el("b", null, a.val));
    c.onclick = a.click;
    k.appendChild(c);
  });
  m.appendChild(k);

  m.appendChild(el("h3", null, "আজ সবচেয়ে বেশি পড়েছে"));
  r.slice().sort(function(a,b){ return b.today - a.today; }).slice(0, 5).forEach(function(x, i){
    var c = el("div","card sw");
    c.appendChild(el("span", null, bn(i+1) + ". " + x.name + " · " + rn(x.room)));
    c.appendChild(el("b", null, fm(x.today)));
    c.onclick = function(){ detail(x.room, x.id); };
    c.style.cursor = "pointer";
    m.appendChild(c);
  });
};

// ২. রুম তালিকা
V.rooms = function(m){
  var allRoomIds = Array.from(new Set(Object.keys(R).concat(Object.keys(R2))));
  if(!allRoomIds.length){ m.appendChild(el("p","mute","কোনো সক্রিয় রুম নেই।")); return; }

  allRoomIds.forEach(function(room){
    var mem = rows().filter(function(x){ return x.room===room; });
    var d = M[room] || (R2[room] && R2[room].meta) || {};
    var isVip = (room === VIP);
    var c = el("div","card"), h = el("div","sw");

    var curStatus = d.status || (isVip ? "approved" : "trial");
    var expTime = d.expiresAt || d.trialEnds || 0;
    var isExpired = !isVip && expTime && (Date.now() > expTime);

    var badgeText = isVip ? "প্রাইভেট (VIP)" : isExpired ? "মেয়াদ শেষ" : (curStatus === "trial" ? "৩ দিনের ট্রায়াল" : "অনুমোদিত");
    var badgeClass = isVip ? "" : isExpired ? " x" : (curStatus === "trial" ? " s" : "");

    h.appendChild(el("b", null, rn(room) + (isVip ? " (লক করা)" : "")));
    h.appendChild(el("span","badge" + badgeClass, badgeText));
    c.appendChild(h);

    var expMsg = "";
    if(!isVip && expTime){
      var daysLeft = Math.ceil((expTime - Date.now()) / 864e5);
      expMsg = isExpired ? " · মেয়াদোত্তীর্ণ" : (" · মেয়াদ বাকি: " + bn(Math.max(0, daysLeft)) + " দিন");
    }

    c.appendChild(el("div","mute",
      "কোড: " + room + " · সদস্য: " + bn(mem.length) + (isVip ? "/২" : "/৮") +
      " · আজ পড়া: " + fm(mem.reduce(function(a,x){ return a+x.today; }, 0)) + expMsg
    ));

    var ch = el("div","chips");
    mem.forEach(function(x){
      var s = el("span","chip" + (x.on ? " dot" : ""), x.name);
      s.style.cursor = "pointer";
      s.onclick = function(){ detail(x.room, x.id); };
      ch.appendChild(s);
    });
    c.appendChild(ch);

    var row = el("div","row");
    row.appendChild(btn("✏️ অনুমোদন ও মেয়াদ", "ghost", function(){ metaM(room); }));
    row.appendChild(btn("💬 চ্যাট", "ghost", function(){ F.room=room; view="chat"; render(); }));
    if(!isVip){
      row.appendChild(btn("🗑 রুম মুছুন", "dn", function(){ delRoom(room); }));
    }
    c.appendChild(row);
    m.appendChild(c);
  });
};

// ৩. ইউজার তালিকা
V.users = function(m){
  var bar = el("div","row bar");
  var q = el("input"); q.placeholder = "নাম বা রুম দিয়ে খুঁজুন..."; q.value = F.q;

  var f = el("select");
  [["all","সবাই"],["on","অনলাইন"],["st","এখন পড়ছে"]].forEach(function(a){
    var o = el("option", null, a[1]); o.value = a[0]; f.appendChild(o);
  });
  f.value = F.f;

  var s = el("select");
  [["today","আজকের পড়া"],["tot","মোট পড়া"],["name","নাম"]].forEach(function(a){
    var o = el("option", null, a[1]); o.value = a[0]; s.appendChild(o);
  });
  s.value = F.s;

  bar.appendChild(q); bar.appendChild(f); bar.appendChild(s);
  m.appendChild(bar);

  var list = el("div");
  m.appendChild(list);

  function draw(){
    list.textContent = "";
    var t = F.q.trim().toLowerCase();
    var r = rows().filter(function(x){
      var matchText = (x.name + " " + x.room + " " + rn(x.room)).toLowerCase().indexOf(t) > -1;
      var matchFilter = (F.f === "all") || (F.f === "on" ? x.on : x.st);
      return matchText && matchFilter;
    });

    r.sort(function(a,b){
      return F.s === "name" ? a.name.localeCompare(b.name) : b[F.s] - a[F.s];
    });

    if(!r.length){ list.appendChild(el("p","mute","কাউকে পাওয়া যায়নি।")); return; }

    r.forEach(function(x){
      var c = el("div","card sw");
      c.style.cursor = "pointer";

      var l = el("div");
      l.appendChild(el("b", x.on ? "dot" : "", x.name));
      l.appendChild(el("div","mute",
        rn(x.room) + " · কাজ: " + bn(x.td)+"/"+bn(x.tt) +
        " · নামাজ: " + bn(x.pr)+"/৫" + (x.st ? " · 📖 পড়ছে" : "")
      ));
      c.appendChild(l);

      var rt = el("div");
      rt.style.textAlign = "right";
      rt.appendChild(el("b", null, fm(x.today)));
      rt.appendChild(el("div","mute", "মোট: " + fm(x.tot)));
      c.appendChild(rt);

      c.onclick = function(){ detail(x.room, x.id); };
      list.appendChild(c);
    });
  }

  q.oninput = function(){ F.q=q.value; draw(); };
  f.onchange = function(){ F.f=f.value; draw(); };
  s.onchange = function(){ F.s=s.value; draw(); };
  draw();
};

// ৪. চ্যাট পর্যবেক্ষণ
V.chat = function(m){
  var allRoomIds = Array.from(new Set(Object.keys(R).concat(Object.keys(R2))));
  if(!F.room || allRoomIds.indexOf(F.room) < 0) F.room = allRoomIds[0] || "";

  var s = el("select"); s.style.width = "100%";
  allRoomIds.forEach(function(r){
    var o = el("option", null, rn(r) + " (" + r + ")"); o.value = r; s.appendChild(o);
  });
  s.value = F.room;
  s.onchange = function(){ F.room = s.value; render(); };
  m.appendChild(s);

  var c = (R2[F.room] && R2[F.room].chat) || (R[F.room] && R[F.room].chat) || {};
  var isV2 = !!(R2[F.room] && R2[F.room].chat);
  var ks = Object.keys(c).sort().slice(-60).reverse();

  if(!ks.length){ m.appendChild(el("p","mute","এই রুমে কোনো মেসেজ নেই।")); return; }

  ks.forEach(function(k){
    var x = c[k] || {};
    var d = el("div","card");
    d.appendChild(el("b", null, (x.name || x.n || x.uid || "সদস্য") + " · " + fd(x.time || x.t)));
    d.appendChild(el("div", null, x.text || x.x || ""));

    var row = el("div","row");
    row.appendChild(btn("🗑 মুছুন", "dn", function(){
      if(!confirm("মেসেজটি মুছে ফেলতে চান?")) return;
      var u = {};
      var chatPath = isV2 ? ("rooms_v2/"+F.room+"/chat/"+k) : ("rooms/"+F.room+"/chat/"+k);
      u[chatPath] = null;
      log("chat_delete", F.room, (x.name||x.n||"")+": "+(x.text||x.x||"").slice(0,100), u);
    }));
    d.appendChild(row);
    m.appendChild(d);
  });
};

// ৫. ওয়ান-ওয়ে বার্তা ও নোটিশ পাঠান (নতুন ফিচার)
V.broadcast = function(m){
  m.appendChild(el("h2", null, "📢 ওয়ান-ওয়ে বার্তা / নোটিশ পাঠান"));
  m.appendChild(el("p", "mute", "যেকোনো একক স্টুডেন্ট, নির্দিষ্ট কোনো রুমের সদস্য অথবা সকল রুমের সবাইকে মেসেজ পাঠান।"));

  var card = el("div", "card");

  // টার্গেট ড্রপডাউন তৈরি
  var targetSel = el("select");
  targetSel.style.width = "100%";
  targetSel.appendChild(new Option("🌐 সকল রুমের সবাইকে (Global Broadcast)", "all"));

  // রুমভিত্তিক টার্গেট
  var allRoomIds = Array.from(new Set(Object.keys(R).concat(Object.keys(R2))));
  allRoomIds.forEach(function(r){
    targetSel.appendChild(new Option("🏠 রুম: " + rn(r) + " এর সবাইকে", "room:" + r));
  });

  // ব্যক্তিভিত্তিক টার্গেট
  rows().forEach(function(u){
    targetSel.appendChild(new Option("👤 স্টুডেন্ট: " + u.name + " (" + rn(u.room) + ")", "user:" + u.room + ":" + u.id + ":" + u.name));
  });

  var msgArea = el("textarea");
  msgArea.placeholder = "আপনার বার্তাটি লিখুন...";
  msgArea.rows = 4;
  msgArea.style.cssText = "width:100%;margin-top:12px;padding:12px;border-radius:12px;border:1.5px solid var(--line);font:inherit;background:var(--card);color:var(--ink)";

  // @ ট্যাগ অপশন
  var tagDiv = el("div", "row");
  tagDiv.style.marginTop = "10px";
  var chkTag = el("input");
  chkTag.type = "checkbox";
  chkTag.id = "chk_at_tag";
  chkTag.checked = true;
  chkTag.style.cssText = "width:18px;height:18px;cursor:pointer";

  var tagLabel = el("label", null, " @ ইউজারনেম ট্যাগ চালু রাখো (মেসেজের শুরুতে রিসিভারের নাম বসবে)");
  tagLabel.style.cssText = "cursor:pointer;font-weight:600;display:flex;align-items:center;gap:8px";
  tagLabel.prepend(chkTag);
  tagDiv.appendChild(tagLabel);

  var sendBtn = btn("বার্তা পাঠান ➤", "alt", function(){
    var txt = msgArea.value.trim();
    if(!txt) return toast("আগে বার্তা লিখুন!");

    var targetVal = targetSel.value;
    var useTag = chkTag.checked;
    var finalMsg = txt;

    sendBtn.disabled = true;
    toast("পাঠানো হচ্ছে...");

    var tasks = [];

    if(targetVal === "all"){
      if(useTag) finalMsg = "@Everyone, " + txt;
      allRoomIds.forEach(function(rId){
        var chatPath = R2[rId] ? ("rooms_v2/" + rId + "/chat") : ("rooms/" + rId + "/chat");
        tasks.push(db.ref(chatPath).push({ uid:"admin", name:"👑 অ্যাডমিন নোটিশ", text:finalMsg, time:T }));
      });
      tasks.push(db.ref("admin_alerts/global").set({ text:finalMsg, time:Date.now() }));
    } 
    else if(targetVal.startsWith("room:")){
      var rId = targetVal.split(":")[1];
      if(useTag) finalMsg = "@" + rn(rId) + ", " + txt;
      var chatPath = R2[rId] ? ("rooms_v2/" + rId + "/chat") : ("rooms/" + rId + "/chat");
      tasks.push(db.ref(chatPath).push({ uid:"admin", name:"👑 অ্যাডমিন নোটিশ", text:finalMsg, time:T }));
      tasks.push(db.ref("admin_alerts/" + rId + "/all").set({ text:finalMsg, time:Date.now() }));
    }
    else if(targetVal.startsWith("user:")){
      var parts = targetVal.split(":");
      var rId = parts[1], uId = parts[2], uName = parts[3];
      if(useTag) finalMsg = "@" + uName + ", " + txt;
      var chatPath = R2[rId] ? ("rooms_v2/" + rId + "/chat") : ("rooms/" + rId + "/chat");
      tasks.push(db.ref(chatPath).push({ uid:"admin", name:"👑 অ্যাডমিন নোটিশ", text:finalMsg, time:T }));
      tasks.push(db.ref("admin_alerts/" + rId + "/" + uId).set({ text:finalMsg, time:Date.now() }));
    }

    Promise.all(tasks).then(function(){
      sendBtn.disabled = false;
      msgArea.value = "";
      toast("বার্তা সফলভাবে পৌঁছেছে ✓");
      log("notice", targetVal, finalMsg);
    }).catch(function(err){
      sendBtn.disabled = false;
      toast("ব্যর্থ: " + err.message);
    });
  });
  sendBtn.style.marginTop = "14px";
  sendBtn.style.padding = "10px 24px";

  card.appendChild(el("small", "mute", "কার কাছে পাঠাতে চান:"));
  card.appendChild(targetSel);
  card.appendChild(msgArea);
  card.appendChild(tagDiv);
  card.appendChild(sendBtn);
  m.appendChild(card);
};

// ৬. রুম অনুমোদন
V.approvals = function(m){
  m.appendChild(el("h2", null, "নতুন রুমের ট্রায়াল ও অনুমোদন ব্যবস্থাপনা"));
  var v2Rooms = Object.keys(R2);

  if(!v2Rooms.length){ m.appendChild(el("p","mute","কোনো নতুন রুম পাওয়া যায়নি।")); return; }

  v2Rooms.forEach(function(cId){
    var rm = R2[cId] || {}, meta = rm.meta || {}, mems = rm.members || {};
    var memKeys = Object.keys(mems);
    var creator = mems[memKeys[0]] || {};
    var curExp = meta.expiresAt || meta.trialEnds || 0;
    var isExpired = curExp && (Date.now() > curExp);
    var isApproved = (meta.status === "approved" && !isExpired);

    var card = el("div","card");
    card.innerHTML = `
      <div class="sw">
        <div>
          <b style="font-size:18px">${meta.name || cId}</b> (কোড: ${cId})
          <div class="mute" style="margin-top:4px">তৈরি করেছে: <b>${creator.name || 'সদস্য'}</b> ${creator.mobile ? '('+creator.mobile+')' : ''}</div>
          <small class="mute">তৈরির সময়: ${fd(meta.createdAt)} · সদস্য: ${bn(memKeys.length)}/৮ জন</small>
        </div>
        <div>
          <span class="badge ${isApproved ? '' : isExpired ? 'x' : 's'}">
            ${isApproved ? 'অনুমোদিত' : isExpired ? 'মেয়াদ শেষ' : '৩ দিনের ট্রায়াল'}
          </span>
        </div>
      </div>
      <div style="margin-top:10px;font-size:14px;color:var(--mute)">
        বর্তমান মেয়াদ: <b>${curExp ? fd(curExp) : 'সেট করা নেই'}</b> ${isExpired ? '<span style="color:var(--danger)"> (মেয়াদোত্তীর্ণ)</span>' : ''}
      </div>
    `;

    var row = el("div","row");
    row.style.marginTop = "14px";
    row.appendChild(btn("⚡ + ৩০ দিন অনুমোদন দিন", "alt", function(){
      var newDate = Date.now() + (30 * 864e5);
      var u = {};
      u["rooms_v2/"+cId+"/meta/status"] = "approved";
      u["rooms_v2/"+cId+"/meta/expiresAt"] = newDate;
      u["room_meta/"+cId] = { name: meta.name || cId, status: "approved", expiresAt: newDate, updatedAt: T };
      log("room_edit", cId, "৩০ দিন অনুমোদন", u);
    }));

    row.appendChild(btn("+ ৬০ দিন", "ghost", function(){
      var newDate = Date.now() + (60 * 864e5);
      var u = {};
      u["rooms_v2/"+cId+"/meta/status"] = "approved";
      u["rooms_v2/"+cId+"/meta/expiresAt"] = newDate;
      u["room_meta/"+cId] = { name: meta.name || cId, status: "approved", expiresAt: newDate, updatedAt: T };
      log("room_edit", cId, "৬০ দিন অনুমোদন", u);
    }));

    row.appendChild(btn("✏️ কাস্টম তারিখ / স্ট্যাটাস", "ghost", function(){ metaM(cId); }));
    card.appendChild(row);
    m.appendChild(card);
  });
};

// ৭. অডিট লগ
V.log = function(m){
  m.appendChild(el("h2", null, "সিস্টেম অডিট লগ"));
  var ks = Object.keys(L).sort(function(a,b){ return L[b].at - L[a].at; });
  if(!ks.length){ m.appendChild(el("p","mute","কোনো লগ হিস্টোরি নেই।")); return; }

  ks.forEach(function(k){
    var l = L[k] || {};
    var isVipLog = (l.targetUid === VIP) || (l.targetUid === "1432014310") || (l.targetName && l.targetName.indexOf("Queen Room") > -1);
    
    var c = el("div","card");
    var topRow = el("div","sw");
    topRow.appendChild(el("b", null, (AN[l.action] || l.action) + (l.targetName ? " — " + l.targetName : "")));
    
    if(isVipLog){
      topRow.appendChild(el("span","badge s","🔒 VIP স্থায়ী রেকর্ড"));
    } else {
      var delBtn = btn("🗑 মুছুন", "dn", function(){ deleteSingleLog(k, l); });
      delBtn.style.cssText = "padding:3px 10px;font-size:12px;border-radius:8px";
      topRow.appendChild(delBtn);
    }
    c.appendChild(topRow);
    c.appendChild(el("div","mute", fd(l.at) + (l.by ? " · দ্বারা: " + l.by : "")));
    if(l.details) c.appendChild(el("div", null, l.details));
    m.appendChild(c);
  });
};

// ৮. লগ-এর নিচে "💬 অনুপ্রেরণা" কন্ট্রোল (৪ ক্যাটাগরি, ১টি করে মোছা ও বাল্ক পেস্ট অ্যাড)
V.motivation = function(m){
  m.appendChild(el("h2", null, "💬 অনুপ্রেরণা / মোটিভেশন নিয়ন্ত্রণ"));
  m.appendChild(el("p", "mute", "যেকোনো লক্ষ্য নির্বাচন করে তার উক্তিগুলো দেখুন, ডিলিট করুন অথবা একসাথে অনেকগুলো উক্তি পেস্ট করে যোগ করুন।"));

  // ৪টি ক্যাটাগরি বাটন
  var catTabs = el("div", "row");
  catTabs.style.margin = "12px 0";
  [
    { id: "Medical", label: "🩺 Medical" },
    { id: "Engineering", label: "⚙️ Engineering" },
    { id: "Varsity", label: "🏛️ Varsity" },
    { id: "Other", label: "🎯 Other" }
  ].forEach(function(c){
    var b = btn(c.label, activeMotCat === c.id ? "alt" : "ghost", function(){
      activeMotCat = c.id;
      render();
    });
    b.style.padding = "8px 18px";
    catTabs.appendChild(b);
  });
  m.appendChild(catTabs);

  // একসাথে অনেক উক্তি যোগ করার বক্স (Bulk Add)
  var addCard = el("div", "card");
  addCard.appendChild(el("h3", null, "➕ " + activeMotCat + " ক্যাটাগরিতে নতুন উক্তি যোগ করো"));
  var bulkArea = el("textarea");
  bulkArea.placeholder = "এখানে এক বা একাধিক উক্তি পেস্ট করুন। প্রতি লাইনে একটি করে উক্তি রাখবেন...";
  bulkArea.rows = 4;
  bulkArea.style.cssText = "width:100%;margin-top:8px;padding:12px;border-radius:12px;border:1.5px solid var(--line);font:inherit;background:var(--card);color:var(--ink)";
  addCard.appendChild(bulkArea);

  var addBtn = btn("➕ একসাথে সব যোগ করো", null, function(){
    var txt = bulkArea.value.trim();
    if(!txt) return toast("আগে উক্তি লিখুন বা পেস্ট করুন!");
    var lines = txt.split("\n").map(function(s){ return s.trim(); }).filter(function(s){ return s.length > 2; });
    if(!lines.length) return toast("সঠিক উক্তি পাওয়া যায়নি!");

    addBtn.disabled = true;
    var updates = {};
    lines.forEach(function(line){
      var newKey = db.ref("motivational_quotes/" + activeMotCat).push().key;
      updates["motivational_quotes/" + activeMotCat + "/" + newKey] = line;
    });

    db.ref().update(updates).then(function(){
      addBtn.disabled = false;
      bulkArea.value = "";
      toast(lines.length + "টি উক্তি সফলভাবে যোগ হয়েছে ✓");
      render();
    }).catch(function(err){
      addBtn.disabled = false;
      toast("ব্যর্থ: " + err.message);
    });
  });
  addBtn.style.marginTop = "10px";
  addCard.appendChild(addBtn);
  m.appendChild(addCard);

  // বিদ্যমান উক্তিগুলোর তালিকা
  var listCard = el("div", "card");
  listCard.innerHTML = `<h3>📋 ${activeMotCat} এর বর্তমান সকল উক্তি</h3><div id="mot_list">লোড হচ্ছে...</div>`;
  m.appendChild(listCard);

  db.ref("motivational_quotes/" + activeMotCat).once("value").then(function(snap){
    var cont = document.getElementById("mot_list");
    if(!cont) return;
    cont.textContent = "";

    if(!snap.exists()){
      cont.innerHTML = "<p class='mute'>এই ক্যাটাগরিতে এখনো কাস্টম উক্তি নেই। উপরের বক্সে পেস্ট করে যোগ করুন।</p>";
      return;
    }

    var quotesObj = snap.val() || {};
    var qKeys = Object.keys(quotesObj).reverse();
    cont.appendChild(el("p", "mute", "মোট উক্তি: " + bn(qKeys.length) + " টি"));

    qKeys.forEach(function(k, idx){
      var qText = quotesObj[k];
      var r = el("div", "ses");
      r.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--line)";
      
      var txtSpan = el("span", null, bn(idx+1) + ". " + qText);
      txtSpan.style.cssText = "flex:1;font-size:15px;line-height:1.5";
      r.appendChild(txtSpan);

      // ১টি করে ডিলিট করার বাটন
      var delB = btn("🗑", "dn", function(){
        if(!confirm("এই উক্তিটি মুছে ফেলতে চান?")) return;
        db.ref("motivational_quotes/" + activeMotCat + "/" + k).remove().then(function(){
          toast("উক্তিটি মুছে ফেলা হয়েছে ✓");
          render();
        });
      });
      delB.style.cssText = "padding:4px 8px;font-size:13px;border-radius:8px";
      r.appendChild(delB);
      cont.appendChild(r);
    });
  });
};

/* ---------- নেভিগেশন তালিকা ("অনুপ্রেরণা" ঠিক লগ এর নিচে) ---------- */
var NAV = [
  ["ov","📊 ওভারভিউ"],
  ["rooms","🏠 রুম"],
  ["users","👥 ইউজার"],
  ["chat","💬 চ্যাট"],
  ["broadcast","📢 ওয়ান-ওয়ে বার্তা"],
  ["approvals","📝 রুম অনুমোদন"],
  ["log","📜 লগ"],
  ["motivation","💬 অনুপ্রেরণা"] // <--- ঠিক লগ এর নিচে!
];

function dark(){
  var a = document.documentElement.getAttribute("data-theme");
  return a ? a==="dark" : matchMedia("(prefers-color-scheme: dark)").matches;
}

function render(){
  if(!live) return;
  var a = $("app"); a.textContent = "";

  var sh = el("div","shell"), sd = el("nav","side");
  sd.appendChild(el("h1", null, "🛡 অ্যাডমিন"));

  var pendingRoomsCount = Object.keys(R2).filter(function(r){
    var m = (R2[r] && R2[r].meta) || {};
    return m.status === "trial" || (m.expiresAt && Date.now() > m.expiresAt);
  }).length;

  NAV.forEach(function(n){
    var label = n[1];
    if(n[0] === "approvals" && pendingRoomsCount > 0){
      label += " (" + bn(pendingRoomsCount) + ")";
    }
    var b = el("button","nv" + (view===n[0] ? " on" : ""), label);
    b.type = "button";
    b.onclick = function(){ view=n[0]; render(); };
    sd.appendChild(b);
  });

  sd.appendChild(el("div","sp"));
  sd.appendChild(btn("🔄 রিফ্রেশ", "ghost", function(){ load(); }));
  sd.appendChild(btn(dark() ? "☀️ লাইট মোড" : "🌙 ডার্ক মোড", "ghost", function(){
    var n = dark() ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", n);
    try{ localStorage.setItem("ad-theme", n); }catch(e){}
    render();
  }));
  sd.appendChild(btn("🚪 লগআউট", "ghost", function(){
    try{ localStorage.removeItem("ad-ok"); }catch(e){}
    location.reload();
  }));
  sd.appendChild(el("small","mute", "আপডেট: " + fd(at)));

  var mn = el("main","main");
  if(V[view]) V[view](mn);
  sh.appendChild(sd);
  sh.appendChild(mn);
  a.appendChild(sh);
}

function sha(t){
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)).then(function(b){
    return Array.prototype.map.call(new Uint8Array(b), function(x){
      return ("0" + x.toString(16)).slice(-2);
    }).join("");
  });
}

function loginView(msg){
  var a = $("app"); a.textContent = "";
  var c = el("div","login card");
  c.appendChild(el("h2", null, "🛡 অ্যাডমিন লগইন"));

  var e = el("input"); e.type = "text"; e.placeholder = "User ID"; e.autocomplete = "username";
  var p = el("input"); p.type = "password"; p.placeholder = "পাসওয়ার্ড"; p.autocomplete = "current-password";
  var er = el("div","er", msg||"");

  var go = btn("লগইন", null, function(){
    er.textContent = ""; go.disabled = true;
    sha(p.value).then(function(h){
      go.disabled = false;
      if(e.value.trim() === ADMIN_ID && h === PH){
        try{ localStorage.setItem("ad-ok","1"); }catch(x){}
        enter();
      } else {
        er.textContent = "ID বা পাসওয়ার্ড ভুল!";
      }
    }, function(){
      go.disabled = false;
      er.textContent = "ব্রাউজারে ক্রিপ্টোগ্রাফি সাপোর্ট করছে না।";
    });
  });

  p.onkeydown = function(ev){ if(ev.key==="Enter") go.click(); };
  [e, p, er].forEach(function(x){ c.appendChild(x); });
  var r = el("div","row"); r.appendChild(go); c.appendChild(r);
  a.appendChild(c);
}

function enter(){
  if(live) return;
  live = true;
  load();
  setInterval(function(){
    if(document.visibilityState === "visible" && $("modal").hidden) load();
  }, 90000);
}

try{
  var sv = localStorage.getItem("ad-theme");
  if(sv) document.documentElement.setAttribute("data-theme", sv);
}catch(e){}

try{
  if(localStorage.getItem("ad-ok") === "1") enter();
  else loginView();
}catch(e){
  loginView();
}
})();