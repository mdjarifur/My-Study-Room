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
        isV2: true, goal: p.goal || "সাধারণ", mobile: p.mobile || "",
        uid: p.uid || id, cls: p.cls || p.classBase || "HSC",
        college: p.college || "", pin: p.pin || ""
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
        isV2: false, goal: "মেডিকেল", mobile: "",
        uid: (id === "p1" ? "UID-TASFIA" : "UID-RAHMAN"),
        cls: "HSC", college: "DMC", pin: "1432"
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
      if(bad.length) console.warn("Sync info:", bad);
    });
  }).catch(function(e){
    console.warn("Load warning:", e);
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

  if(r.goal || r.mobile) m.appendChild(el("p", "mute", "🎯 টার্গেট: " + (r.goal || "সাধারণ") + (r.mobile ? " · 📱 মোবাইল: " + r.mobile : "")));
  m.appendChild(el("div", "mute", "🆔 UID: " + (r.uid || id) + " · 🎓 শ্রেণি: " + (r.cls || "HSC") + (r.college ? " · 🏫 প্রতিষ্ঠান: " + r.college : "") + (r.pin ? " · 🔐 PIN: " + r.pin : "")));

  var row = el("div","row");
  row.style.marginTop = "16px";
  row.style.flexWrap = "wrap";
  row.style.gap = "8px";

  var blkBtn = btn("🚫 পরীক্ষা এক্সেস চেক...", "ghost", function(){
    var targetId = r.uid || id;
    db.ref("exam_blocked_targets/" + targetId).once("value").then(function(snap){
      var isBlk = snap.val() && snap.val().blocked;
      if(isBlk){
        if(!confirm("এই শিক্ষার্থীর পরীক্ষা দেওয়ার নিষেধাজ্ঞা তুলে দিতে চান?")) return;
        db.ref("exam_blocked_targets/" + targetId).remove().then(function(){
          toast("পরীক্ষার এক্সেস পুনরায় সচল করা হয়েছে ✓");
          blkBtn.textContent = "🚫 পরীক্ষা ব্লক করুন";
          blkBtn.className = "btn dn";
        });
      } else {
        if(!confirm("আপনি কি নিশ্চিত যে এই শিক্ষার্থীর পরীক্ষা দেওয়া সাময়িকভাবে স্থগিত করতে চান?")) return;
        db.ref("exam_blocked_targets/" + targetId).set({
          blocked: true,
          blockedAt: Date.now(),
          targetName: r.name,
          room: room
        }).then(function(){
          toast("পরীক্ষা দেওয়ার সুবিধা ব্লক করা হয়েছে ✓");
          blkBtn.textContent = "✅ পরীক্ষা আনব্লক করুন";
          blkBtn.className = "btn alt";
        });
      }
    });
  });
  blkBtn.style.padding = "6px 14px";
  blkBtn.style.fontSize = "13px";
  // Initial check
  db.ref("exam_blocked_targets/" + (r.uid || id)).once("value").then(function(s){
    var isBlk = s.val() && s.val().blocked;
    blkBtn.textContent = isBlk ? "✅ পরীক্ষা আনব্লক করুন" : "🚫 পরীক্ষা ব্লক করুন";
    blkBtn.className = isBlk ? "btn alt" : "btn dn";
  });
  row.appendChild(blkBtn);

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
  var q = el("input"); q.placeholder = "🔍 নাম, রুম কোড বা UID দিয়ে খুঁজুন..."; q.value = F.q;
  q.style.flex = "2";

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

  var uidSearchBtn = btn("🔍 ৬-ডিজিট UID সার্চ", "ghost", function(){
    var targetUID = prompt("যে শিক্ষার্থীর সম্পূর্ণ ডিটেইলস দেখতে চান তার ৬-ডিজিটের UID লিখুন (যেমন: 123456):");
    if(!targetUID) return;
    targetUID = targetUID.trim();
    var found = rows().filter(function(x){ return String(x.uid||"").toLowerCase() === targetUID.toLowerCase(); })[0];
    if(found){
      detail(found.room, found.id);
    } else {
      alert("এই ৬-ডিজিটের UID (" + targetUID + ") দিয়ে কোনো শিক্ষার্থী খুঁজে পাওয়া যায়নি।");
    }
  });
  uidSearchBtn.style.padding = "8px 12px";
  uidSearchBtn.style.fontSize = "12.5px";

  bar.appendChild(q); bar.appendChild(f); bar.appendChild(s); bar.appendChild(uidSearchBtn);
  m.appendChild(bar);

  var list = el("div");
  m.appendChild(list);

  function draw(){
    list.textContent = "";
    var t = F.q.trim().toLowerCase();
    var r = rows().filter(function(x){
      var matchText = (x.name + " " + x.room + " " + rn(x.room) + " " + (x.uid || "") + " " + (x.cls || "") + " " + (x.college || "") + " " + (x.mobile || "")).toLowerCase().indexOf(t) > -1;
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
      var titleRow = el("div");
      titleRow.appendChild(el("b", x.on ? "dot" : "", x.name));
      if(x.uid){
        var uBadge = el("span", "badge", x.uid);
        uBadge.style.cssText = "font-size:11px;padding:2px 6px;margin-left:6px;background:rgba(59,130,246,0.15);color:#60a5fa";
        titleRow.appendChild(uBadge);
      }
      if(x.cls){
        var cBadge = el("span", "badge", x.cls);
        cBadge.style.cssText = "font-size:11px;padding:2px 6px;margin-left:4px;background:rgba(16,185,129,0.15);color:#34d399";
        titleRow.appendChild(cBadge);
      }
      l.appendChild(titleRow);

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

// ৬. রুম ও ক্লাস অনুমোদন
var activeApprovalTab = "rooms";

V.approvals = function(m){
  m.appendChild(el("h2", null, "অনুমোদন ব্যবস্থাপনা"));

  var tabs = el("div", "row");
  tabs.style.margin = "12px 0 16px";
  
  var bRooms = btn("🏠 রুম অনুমোদন", activeApprovalTab === "rooms" ? "alt" : "ghost", function(){
    activeApprovalTab = "rooms";
    render();
  });
  var bClass = btn("🎓 ক্লাস পরিবর্তনের আবেদন", activeApprovalTab === "class_requests" ? "alt" : "ghost", function(){
    activeApprovalTab = "class_requests";
    render();
  });
  tabs.appendChild(bRooms);
  tabs.appendChild(bClass);
  m.appendChild(tabs);

  if(activeApprovalTab === "class_requests"){
    var reqCard = el("div", "card");
    reqCard.innerHTML = "<h3>🎓 শিক্ষার্থীদের ক্লাস পরিবর্তনের আবেদনসমূহ</h3><div id='class_req_list'>লোড হচ্ছে...</div>";
    m.appendChild(reqCard);

    db.ref("class_change_requests").once("value").then(function(snap){
      var cont = document.getElementById("class_req_list");
      if(!cont) return;
      cont.textContent = "";

      var data = snap.val();
      if(!data){
        cont.innerHTML = "<p class='mute'>বর্তমানে কোনো ক্লাস পরিবর্তনের আবেদন জমা নেই।</p>";
        return;
      }

      var keys = Object.keys(data).reverse();
      keys.forEach(function(k){
        var r = data[k];
        var item = el("div", "ses");
        item.style.cssText = "padding:14px;border-radius:12px;margin-bottom:10px;background:var(--bg);border:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px";

        var left = el("div");
        var safeRoom = r.roomName || rn(r.room) || "স্টাডি রুম";
        var isPending = (!r.status || r.status === "pending");

        left.innerHTML = `
          <div>
            <strong style="font-size:16px;color:var(--ink)">${r.name || "শিক্ষার্থী"}</strong>
            <span style="font-size:12px;color:var(--mute);margin-left:6px">(${r.uid || "UID"}) · রুম: ${safeRoom}</span>
          </div>
          <div style="margin-top:6px;font-size:13.5px">
            বর্তমান ক্লাস: <span class="badge s">${r.oldClass || "--"}</span> ➔ 
            আবেদনকৃত ক্লাস: <span class="badge" style="background:var(--as);color:var(--a);font-weight:700">${r.requestedClass || "--"}</span>
          </div>
          <small class="mute" style="display:block;margin-top:4px">আবেদনের সময়: ${fd(r.requestedAt)} · স্ট্যাটাস: <strong style="color:${isPending ? '#eab308' : r.status==='approved' ? '#10b981' : '#ef4444'}">${isPending ? 'অপেক্ষমাণ' : r.status==='approved' ? 'অনুমোদিত' : 'বাতিল'}</strong></small>
        `;
        item.appendChild(left);

        var actions = el("div", "row");
        actions.style.margin = "0";

        if(isPending){
          var approveBtn = btn("✅ অনুমোদন", "alt", function(){
            var upd = {};
            upd["class_change_requests/" + k + "/status"] = "approved";
            upd["class_change_requests/" + k + "/reviewedAt"] = T;

            if(r.room && r.memberId){
              upd["rooms_v2/" + r.room + "/members/" + r.memberId + "/cls"] = r.requestedClass;
            }

            db.ref().update(upd).then(function(){
              toast("ক্লাস পরিবর্তনের আবেদন অনুমোদিত হয়েছে ✓");
              render();
            });
          });
          approveBtn.style.padding = "4px 12px";
          actions.appendChild(approveBtn);

          var rejectBtn = btn("❌ বাতিল", "ghost", function(){
            db.ref("class_change_requests/" + k + "/status").set("rejected").then(function(){
              toast("আবেদন বাতিল করা হয়েছে");
              render();
            });
          });
          rejectBtn.style.padding = "4px 12px";
          actions.appendChild(rejectBtn);
        }

        var delReqBtn = btn("🗑 মুছুন", "dn", function(){
          if(!confirm("এই আবেদন রেকর্ডটি মুছে ফেলতে চান?")) return;
          db.ref("class_change_requests/" + k).remove().then(function(){
            toast("আবেদন রেকর্ড মুছে ফেলা হয়েছে ✓");
            render();
          });
        });
        delReqBtn.style.padding = "4px 10px";
        actions.appendChild(delReqBtn);

        item.appendChild(actions);
        cont.appendChild(item);
      });
    }).catch(function(){
      var cont = document.getElementById("class_req_list");
      if(cont) cont.innerHTML = "<p class='mute'>আবেদন তালিকা লোড করা যায়নি।</p>";
    });

    return;
  }

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

      var actionBox = el("div", "row");
      actionBox.style.margin = "0";

      // উক্তি এডিট বাটন
      var editB = btn("✏️", "ghost", function(){
        var newText = prompt("উক্তিটি এডিট করুন:", qText);
        if(!newText || newText.trim() === qText) return;
        db.ref("motivational_quotes/" + activeMotCat + "/" + k).set(newText.trim()).then(function(){
          toast("উক্তি আপডেট হয়েছে ✓");
          render();
        });
      });
      editB.style.cssText = "padding:4px 8px;font-size:13px;border-radius:8px;margin-right:4px";
      actionBox.appendChild(editB);

      // ১টি করে ডিলিট করার বাটন
      var delB = btn("🗑", "dn", function(){
        if(!confirm("এই উক্তিটি মুছে ফেলতে চান?")) return;
        db.ref("motivational_quotes/" + activeMotCat + "/" + k).remove().then(function(){
          toast("উক্তিটি মুছে ফেলা হয়েছে ✓");
          render();
        });
      });
      delB.style.cssText = "padding:4px 8px;font-size:13px;border-radius:8px";
      actionBox.appendChild(delB);
      r.appendChild(actionBox);
      cont.appendChild(r);
    });
  });
};

/* ---------- ৯. ডায়নামিক এক্সাম ম্যানেজমেন্ট সিস্টেম ---------- */
var activeExamTab = "qbank";
var activeExamCategory = "HSC";
var selectedSubId = null;
var selectedChapId = null;

function getDefaultSubs() {
  if (activeExamCategory === "SSC") {
    return [
      { id: "ssc_phy", category: "SSC", titleBn: "পদার্থবিজ্ঞান (SSC)", titleEn: "Physics", chapters: [{ id: "ssc_phy_ch1", num: 1, name: "ভৌত রাশি ও পরিমাপ" }, { id: "ssc_phy_ch2", num: 2, name: "গতি" }] },
      { id: "ssc_chem", category: "SSC", titleBn: "রসায়ন (SSC)", titleEn: "Chemistry", chapters: [{ id: "ssc_chem_ch1", num: 1, name: "পদার্থের অবস্থা" }, { id: "ssc_chem_ch2", num: 2, name: "পদার্থের গঠন" }] },
      { id: "ssc_bio", category: "SSC", titleBn: "জীববিজ্ঞান (SSC)", titleEn: "Biology", chapters: [{ id: "ssc_bio_ch1", num: 1, name: "জীবন পাঠ" }, { id: "ssc_bio_ch2", num: 2, name: "জীবকোষ ও টিস্যু" }] },
      { id: "ssc_math", category: "SSC", titleBn: "সাধারণ গণিত (SSC)", titleEn: "General Math", chapters: [{ id: "ssc_math_ch1", num: 1, name: "বাস্তব সংখ্যা" }, { id: "ssc_math_ch2", num: 2, name: "সেট ও ফাংশন" }] }
    ];
  } else if (activeExamCategory === "Admission") {
    return [
      { id: "adm_med_bio", category: "Admission", titleBn: "মেডিকেল জীববিজ্ঞান", titleEn: "Medical Biology", chapters: [{ id: "adm_bio_ch1", num: 1, name: "কোষ ও বংশগতি" }, { id: "adm_bio_ch2", num: 2, name: "মানব শারীরতত্ত্ব" }] },
      { id: "adm_med_chem", category: "Admission", titleBn: "মেডিকেল ও ভার্সিটি রসায়ন", titleEn: "Admission Chemistry", chapters: [{ id: "adm_chem_ch1", num: 1, name: "গুণগত ও জৈব রসায়ন" }] },
      { id: "adm_eng_phy", category: "Admission", titleBn: "ইঞ্জিনিয়ারিং পদার্থবিজ্ঞান", titleEn: "Engineering Physics", chapters: [{ id: "adm_phy_ch1", num: 1, name: "বলবিদ্যা ও গতিবিদ্যা" }] },
      { id: "adm_eng_math", category: "Admission", titleBn: "ইঞ্জিনিয়ারিং উচ্চতর গণিত", titleEn: "Engineering Math", chapters: [{ id: "adm_math_ch1", num: 1, name: "ক্যালকুলাস ও কনিক্স" }] },
      { id: "adm_gk_eng", category: "Admission", titleBn: "জিকে ও ইংরেজি (ভর্তি)", titleEn: "GK & English", chapters: [{ id: "adm_gk_ch1", num: 1, name: "সাধারণ জ্ঞান বাংলাদেশ ও বিশ্ব" }] }
    ];
  }
  return [
    { id: "phy1", category: "HSC", titleBn: "পদার্থবিজ্ঞান ১ম", titleEn: "Physics 1st Paper", chapters: [{ id: "phy1_ch1", num: 1, name: "ভৌত জগৎ ও পরিমাপ" }, { id: "phy1_ch2", num: 2, name: "ভেক্টর" }, { id: "phy1_ch3", num: 3, name: "গতিবিদ্যা" }, { id: "phy1_ch4", num: 4, name: "নিউটনীয় বলবিদ্যা" }] },
    { id: "phy2", category: "HSC", titleBn: "পদার্থবিজ্ঞান ২য়", titleEn: "Physics 2nd Paper", chapters: [{ id: "phy2_ch1", num: 1, name: "তাপগতিবিদ্যা" }, { id: "phy2_ch2", num: 2, name: "স্থির তড়িৎ" }, { id: "phy2_ch3", num: 3, name: "চল তড়িৎ" }] },
    { id: "chem1", category: "HSC", titleBn: "রসায়ন ১ম", titleEn: "Chemistry 1st Paper", chapters: [{ id: "chem1_ch1", num: 1, name: "ল্যাবরেটরির নিরাপদ ব্যবহার" }, { id: "chem1_ch2", num: 2, name: "গুণগত রসায়ন" }, { id: "chem1_ch3", num: 3, name: "পর্যায়বৃত্ত ধর্ম" }] },
    { id: "chem2", category: "HSC", titleBn: "রসায়ন ২য়", titleEn: "Chemistry 2nd Paper", chapters: [{ id: "chem2_ch1", num: 1, name: "পরিবেশ রসায়ন" }, { id: "chem2_ch2", num: 2, name: "জৈব রসায়ন" }, { id: "chem2_ch3", num: 3, name: "পরিমাণগত রসায়ন" }, { id: "chem2_ch4", num: 4, name: "তড়িৎ রসায়ন" }] },
    { id: "math1", category: "HSC", titleBn: "উচ্চতর গণিত ১ম", titleEn: "Higher Math 1st Paper", chapters: [{ id: "math1_ch1", num: 1, name: "ম্যাট্রিক্স ও নির্ণায়ক" }, { id: "math1_ch3", num: 3, name: "সরলরেখা" }, { id: "math1_ch4", num: 4, name: "বৃত্ত" }] },
    { id: "math2", category: "HSC", titleBn: "উচ্চতর গণিত ২য়", titleEn: "Higher Math 2nd Paper", chapters: [{ id: "math2_ch1", num: 1, name: "বাস্তব সংখ্যা" }, { id: "math2_ch3", num: 3, name: "জটিল সংখ্যা" }, { id: "math2_ch6", num: 6, name: "কনিক্স" }] },
    { id: "bio1", category: "HSC", titleBn: "জীববিজ্ঞান ১ম", titleEn: "Biology 1st Paper", chapters: [{ id: "bio1_ch1", num: 1, name: "কোষ ও এর গঠন" }, { id: "bio1_ch2", num: 2, name: "কোষ বিভাজন" }] },
    { id: "bio2", category: "HSC", titleBn: "জীববিজ্ঞান ২য়", titleEn: "Biology 2nd Paper", chapters: [{ id: "bio2_ch1", num: 1, name: "প্রাণীর বিভিন্নতা" }, { id: "bio2_ch4", num: 4, name: "রক্ত ও সংবহন" }] },
    { id: "eng", category: "HSC", titleBn: "ইংরেজি", titleEn: "English", chapters: [{ id: "eng_ch1", num: 1, name: "Parts of Speech" }, { id: "eng_ch2", num: 2, name: "Right Form of Verbs" }] },
    { id: "gk", category: "HSC", titleBn: "সাধারণ জ্ঞান", titleEn: "General Knowledge", chapters: [{ id: "gk_ch1", num: 1, name: "প্রাচীন বাংলা" }, { id: "gk_ch2", num: 2, name: "মুক্তিযুদ্ধ ও সেক্টর" }] }
  ];
}

// চ্যাপ্টার টেস্ট / এক্সাম সেট তৈরি ও এডিটের মডাল
function openTestSetEditorModal(ch, existingSet, onSaved) {
  var overlay = el("div");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;z-index:99999;padding:16px";

  var modal = el("div", "card");
  modal.style.cssText = "width:100%;max-width:620px;max-height:92vh;overflow-y:auto;background:var(--card);border:1.5px solid var(--line);border-radius:18px;padding:24px;box-shadow:0 20px 40px rgba(0,0,0,0.6)";

  var isEdit = (existingSet !== null && existingSet !== undefined);
  var defTitle = isEdit ? existingSet.title : ("অধ্যায়ভিত্তিক টেস্ট — " + ch.name);
  var defTag = isEdit ? existingSet.tag : "মক টেস্ট";
  var defDur = isEdit ? (existingSet.durationMinutes || 15) : 15;
  var defDesc = isEdit ? (existingSet.desc || "") : "অধ্যায় রিভিশন ও পূর্ণাঙ্গ এমসিকিউ টেস্ট";
  var defQs = isEdit ? (existingSet.questions || []) : [];

  modal.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:16px">
      <h3 style="margin:0;font-size:18px;color:var(--ink)">${isEdit ? "✏️ টেস্ট সেট এডিট করুন" : "➕ নতুন টেস্ট / এক্সাম সেট যোগ করুন"}</h3>
      <button type="button" id="btn_close_test_modal" style="background:transparent;border:none;color:var(--mute);font-size:24px;cursor:pointer;line-height:1">×</button>
    </div>
    <div>
      <div style="margin-bottom:12px">
        <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">টেস্টের নাম:</label>
        <input type="text" id="ts_input_title" value="${defTitle}" placeholder="যেমন: অধ্যায়ভিত্তিক বেসিক টেস্ট — ${ch.name}" style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit;box-sizing:border-box" />
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
        <div>
          <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">ট্যাগ / ধরন:</label>
          <input type="text" id="ts_input_tag" value="${defTag}" placeholder="যেমন: মৌলিক ধারণা, মক টেস্ট" style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit;box-sizing:border-box" />
        </div>
        <div>
          <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">সময়সীমা (মিনিট):</label>
          <input type="number" id="ts_input_dur" min="1" max="180" value="${defDur}" style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit;box-sizing:border-box" />
        </div>
      </div>

      <div style="margin-bottom:12px">
        <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">বিবরণ (ঐচ্ছিক):</label>
        <input type="text" id="ts_input_desc" value="${defDesc}" placeholder="সংক্ষিপ্ত বিবরণ" style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit;box-sizing:border-box" />
      </div>

      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <label class="mute" style="font-size:13px;font-weight:600">প্রশ্নব্যাংক JSON কোড (ঐচ্ছিক):</label>
          <button type="button" id="ts_btn_load_sample" style="background:transparent;border:none;color:var(--a);font-size:12px;cursor:pointer;font-weight:700">📋 ডেমো প্রশ্ন লোড</button>
        </div>
        <textarea id="ts_input_json" rows="8" placeholder='[\\n  {\\n    "question": "প্রশ্ন এখানে...",\\n    "options": ["ক অপশন", "খ অপশন", "গ অপশন", "ঘ অপশন"],\\n    "correct": 0,\\n    "explanation": "ব্যাখ্যা..."\\n  }\\n]' style="width:100%;font-family:monospace;font-size:12px;padding:10px;border-radius:10px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);box-sizing:border-box"></textarea>
      </div>

      <div id="ts_modal_err" style="color:var(--danger);font-size:13px;margin-top:4px;min-height:1.2em"></div>

      <div class="row" style="margin-top:16px;display:flex;gap:10px">
        <button type="button" class="btn" id="btn_save_test_set" style="flex:1;padding:11px;border-radius:10px">${isEdit ? "আপডেট করুন" : "টেস্ট সেট সেভ করুন"}</button>
        <button type="button" class="btn ghost" id="btn_cancel_test_set" style="flex:1;padding:11px;border-radius:10px">বাতিল</button>
      </div>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  if (defQs.length > 0) {
    document.getElementById("ts_input_json").value = JSON.stringify(defQs, null, 2);
  }

  function closeModal() { overlay.remove(); }
  document.getElementById("btn_close_test_modal").onclick = closeModal;
  document.getElementById("btn_cancel_test_set").onclick = closeModal;
  overlay.onclick = function(e){ if (e.target === overlay) closeModal(); };

  document.getElementById("ts_btn_load_sample").onclick = function() {
    var sample = [
      {
        question: ch.name + " সম্পর্কিত মৌলিক তথ্য কোনটি?",
        options: ["বয়েল ও চার্লসের সূত্র", "নিউটনের প্রথম সূত্র", "মেন্ডেলের সূত্র", "ফ্যারাডের সূত্র"],
        correct: 0,
        explanation: "এই অধ্যায়ের মূল ভিত্তি।"
      },
      {
        question: ch.name + " এর গুরুত্বপূর্ণ বৈশিষ্ট্য কোনটি?",
        options: ["আদর্শ আচরণ প্রদর্শন", "বাস্তব গ্যাসের বিচ্যুতি", "তাপমাত্রা বৃদ্ধি", "সবগুলো সত্য"],
        correct: 3,
        explanation: "অধ্যায়ের বিস্তারিত ধারণা।"
      }
    ];
    document.getElementById("ts_input_json").value = JSON.stringify(sample, null, 2);
  };

  document.getElementById("btn_save_test_set").onclick = function() {
    var title = document.getElementById("ts_input_title").value.trim();
    var tag = document.getElementById("ts_input_tag").value.trim() || "মক টেস্ট";
    var dur = parseInt(document.getElementById("ts_input_dur").value, 10) || 15;
    var desc = document.getElementById("ts_input_desc").value.trim();
    var jsonTxt = document.getElementById("ts_input_json").value.trim();
    var errEl = document.getElementById("ts_modal_err");

    if (!title) { errEl.textContent = "টেস্টের নাম লিখুন।"; return; }

    var questions = [];
    if (jsonTxt) {
      try {
        questions = JSON.parse(jsonTxt);
        if (!Array.isArray(questions)) {
          errEl.textContent = "JSON কোড অবশ্যই একটি Array (তালিকা) হতে হবে!";
          return;
        }
      } catch(e) {
        errEl.textContent = "JSON সিনট্যাক্স ভুল: " + e.message;
        return;
      }
    }

    var testId = (isEdit && existingSet.id) ? existingSet.id : ("test_" + ch.id + "_" + Date.now().toString().slice(-6));
    var testObj = {
      id: testId,
      title: title,
      tag: tag,
      durationMinutes: dur,
      desc: desc || ("⏱ " + dur + " মিনিট · 📝 " + questions.length + "টি প্রশ্ন"),
      questions: questions,
      qCount: questions.length,
      updatedAt: Date.now()
    };

    db.ref("exam_chapter_tests/" + ch.id + "/" + testId).set(testObj).then(function() {
      toast(isEdit ? "টেস্ট সেট আপডেট হয়েছে ✓" : "নতুন টেস্ট সেট তৈরি হয়েছে ✓");
      closeModal();
      if (onSaved) onSaved(testObj);
    }).catch(function(err) {
      errEl.textContent = "সেভ ব্যর্থ: " + err.message;
    });
  };
}

// একক প্রশ্ন যোগ ও এডিটের আধুনিক পপ-আপ মডাল
function openQuestionEditorModal(ch, existingQ, qIdx, questionsList, onSaved) {
  var overlay = el("div");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;z-index:99999;padding:16px";

  var modal = el("div", "card");
  modal.style.cssText = "width:100%;max-width:560px;max-height:92vh;overflow-y:auto;background:var(--card);border:1.5px solid var(--line);border-radius:18px;padding:24px;box-shadow:0 20px 40px rgba(0,0,0,0.6)";

  var isEdit = (existingQ !== null && existingQ !== undefined);
  modal.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:16px">
      <h3 style="margin:0;font-size:18px;color:var(--ink)">${isEdit ? "✏️ প্রশ্ন এডিট করুন" : "➕ নতুন প্রশ্ন যোগ করুন"}</h3>
      <button type="button" id="btn_close_q_modal" style="background:transparent;border:none;color:var(--mute);font-size:24px;cursor:pointer;line-height:1">×</button>
    </div>
    <div>
      <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">প্রশ্নের বিবরণ:</label>
      <textarea id="q_input_text" rows="3" placeholder="প্রশ্ন এখানে লিখুন..." style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);font-size:14px;box-sizing:border-box;margin-bottom:12px;font:inherit"></textarea>

      <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:6px">অপশনসমূহ (ক, খ, গ, ঘ):</label>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:700;color:var(--a);width:24px">ক)</span>
          <input type="text" id="q_opt_0" placeholder="প্রথম অপশন" style="flex:1;padding:8px 12px;border-radius:8px;border:1.5px solid var(--line);font:inherit" />
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:700;color:var(--a);width:24px">খ)</span>
          <input type="text" id="q_opt_1" placeholder="দ্বিতীয় অপশন" style="flex:1;padding:8px 12px;border-radius:8px;border:1.5px solid var(--line);font:inherit" />
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:700;color:var(--a);width:24px">গ)</span>
          <input type="text" id="q_opt_2" placeholder="তৃতীয় অপশন" style="flex:1;padding:8px 12px;border-radius:8px;border:1.5px solid var(--line);font:inherit" />
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:700;color:var(--a);width:24px">ঘ)</span>
          <input type="text" id="q_opt_3" placeholder="চতুর্থ অপশন" style="flex:1;padding:8px 12px;border-radius:8px;border:1.5px solid var(--line);font:inherit" />
        </div>
      </div>

      <div style="margin-bottom:12px">
        <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">সঠিক উত্তর নির্বাচন করুন:</label>
        <select id="q_input_correct" style="width:100%;padding:9px 12px;border-radius:8px;border:1.5px solid var(--line);font:inherit;font-weight:600">
          <option value="0">ক (প্রথম অপশন)</option>
          <option value="1">খ (দ্বিতীয় অপশন)</option>
          <option value="2">গ (তৃতীয় অপশন)</option>
          <option value="3">ঘ (চতুর্থ অপশন)</option>
        </select>
      </div>

      <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">উত্তরের ব্যাখ্যা (ঐচ্ছিক):</label>
      <input type="text" id="q_input_exp" placeholder="যেমন: এই সূত্রের মূল কারণ হলো..." style="width:100%;padding:9px 12px;border-radius:8px;border:1.5px solid var(--line);font:inherit;box-sizing:border-box" />

      <div id="q_modal_err" style="color:var(--danger);font-size:13px;margin-top:8px;min-height:1.2em"></div>

      <div class="row" style="margin-top:16px;display:flex;gap:10px">
        <button type="button" class="btn" id="btn_save_q_item" style="flex:1;padding:11px;border-radius:10px">${isEdit ? "আপডেট করুন" : "যোগ করুন"}</button>
        <button type="button" class="btn ghost" id="btn_cancel_q_item" style="flex:1;padding:11px;border-radius:10px">বাতিল</button>
      </div>
    </div>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  if (isEdit) {
    document.getElementById("q_input_text").value = existingQ.question || "";
    var opts = existingQ.options || [];
    if (opts[0]) document.getElementById("q_opt_0").value = opts[0];
    if (opts[1]) document.getElementById("q_opt_1").value = opts[1];
    if (opts[2]) document.getElementById("q_opt_2").value = opts[2];
    if (opts[3]) document.getElementById("q_opt_3").value = opts[3];
    document.getElementById("q_input_correct").value = String(existingQ.correct || 0);
    document.getElementById("q_input_exp").value = existingQ.explanation || "";
  }

  function closeModal() { overlay.remove(); }
  document.getElementById("btn_close_q_modal").onclick = closeModal;
  document.getElementById("btn_cancel_q_item").onclick = closeModal;
  overlay.onclick = function(e){ if (e.target === overlay) closeModal(); };

  document.getElementById("btn_save_q_item").onclick = function(){
    var qText = document.getElementById("q_input_text").value.trim();
    var o0 = document.getElementById("q_opt_0").value.trim();
    var o1 = document.getElementById("q_opt_1").value.trim();
    var o2 = document.getElementById("q_opt_2").value.trim();
    var o3 = document.getElementById("q_opt_3").value.trim();
    var cor = parseInt(document.getElementById("q_input_correct").value, 10) || 0;
    var exp = document.getElementById("q_input_exp").value.trim();
    var errEl = document.getElementById("q_modal_err");

    if (!qText) { errEl.textContent = "প্রশ্নের বিবরণ লিখুন।"; return; }
    if (!o0 || !o1) { errEl.textContent = "কমপক্ষে ২টি অপশন (ক ও খ) পূরণ করুন।"; return; }

    var options = [o0, o1];
    if (o2) options.push(o2);
    if (o3) options.push(o3);
    if (cor >= options.length) cor = 0;

    var newObj = {
      question: qText,
      options: options,
      correct: cor,
      explanation: exp || ""
    };

    var updatedList = (questionsList || []).slice();
    if (isEdit) {
      updatedList[qIdx] = newObj;
    } else {
      updatedList.push(newObj);
    }

    db.ref("exam_questions/" + ch.id).set(updatedList).then(function(){
      toast(isEdit ? "প্রশ্ন আপডেট হয়েছে ✓" : "নতুন প্রশ্ন যোগ হয়েছে ✓");
      closeModal();
      onSaved(updatedList);
    }).catch(function(err){
      errEl.textContent = "সেভ ব্যর্থ: " + err.message;
    });
  };
}

// ৩-লেভেলের ডাইনামিক ইন-প্লেস কোশ্চেন ব্যাংক ভিউয়ার (জিরো স্ক্রলিং)
function renderQBankView(container, allSubs) {
  container.textContent = "";
  window.scrollTo(0, 0);
  try { container.scrollIntoView({ behavior: "instant", block: "start" }); } catch(e){}

  var filteredSubs = (allSubs || []).filter(function(s) {
    if (!s.category) return activeExamCategory === "HSC";
    return s.category === activeExamCategory;
  });

  // LEVEL 3: অধ্যায়ের সমস্ত প্রশ্ন প্রদর্শন, নতুন প্রশ্ন যোগ, এডিট ও রিমুভ
  if (selectedSubId && selectedChapId) {
    var activeSub = filteredSubs.find(function(s){ return s.id === selectedSubId; });
    var ch = activeSub && (activeSub.chapters || []).find(function(c){ return c.id === selectedChapId; });
    if (!activeSub || !ch) {
      selectedChapId = null;
      renderQBankView(container, allSubs);
      return;
    }

    var qCard = el("div", "card");
    qCard.id = "admin_q_mgmt_card";

    // Top Navigation & Action Header
    var topBar = el("div", "sw");
    topBar.style.cssText = "align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;border-bottom:1px solid var(--line);padding-bottom:14px;margin-bottom:16px";

    var leftNav = el("div");
    leftNav.style.cssText = "display:flex;align-items:center;gap:10px;flex-wrap:wrap";
    
    var backBtn = btn("← অধ্যায় তালিকায় ফিরে যান", "ghost", function(){
      selectedChapId = null;
      renderQBankView(container, allSubs);
    });
    backBtn.style.cssText = "padding:6px 14px;font-size:13px;border-radius:10px;border:1.5px solid var(--line);font-weight:600";
    leftNav.appendChild(backBtn);

    var titleBox = el("div");
    titleBox.innerHTML = "<h3 style='margin:0;font-size:17px;color:var(--ink)'>" + activeSub.titleBn + " › <span style='color:var(--a)'>অধ্যায় " + ch.num + ": " + ch.name + "</span></h3>";
    leftNav.appendChild(titleBox);
    topBar.appendChild(leftNav);

    // Right Action Buttons
    var rightActions = el("div");
    rightActions.style.cssText = "display:flex;align-items:center;gap:8px;flex-wrap:wrap";

    // Duration Input Box
    var durBox = el("div");
    durBox.style.cssText = "display:flex;align-items:center;gap:6px;background:var(--bg);padding:4px 10px;border-radius:10px;border:1px solid var(--line)";
    durBox.appendChild(el("span", "mute", "⏱ সময়:"));
    var durInput = el("input");
    durInput.type = "number";
    durInput.min = "1";
    durInput.max = "180";
    durInput.value = "15";
    durInput.style.cssText = "width:60px;padding:4px 6px;border-radius:6px;border:1px solid var(--line);font-weight:700;text-align:center;font:inherit";
    durBox.appendChild(durInput);
    durBox.appendChild(el("span", "mute", "মি."));
    rightActions.appendChild(durBox);

    db.ref("exam_chapter_durations/" + ch.id).once("value").then(function(dSnap){
      if(dSnap.val()) durInput.value = dSnap.val();
    }).catch(function(){});
    durInput.onchange = function(){
      var v = Number(durInput.value) || 15;
      db.ref("exam_chapter_durations/" + ch.id).set(v).then(function(){
        toast("সময়সীমা " + v + " মিনিট সেভ হয়েছে ✓");
      }).catch(function(){});
    };

    var addQBtn = btn("➕ নতুন প্রশ্ন যোগ করুন", null, function(){
      db.ref("exam_questions/" + ch.id).once("value").then(function(snap){
        var curList = snap.val() || [];
        if (!Array.isArray(curList)) curList = Object.values(curList);
        openQuestionEditorModal(ch, null, null, curList, function(newList){
          loadAndRenderQuestions(newList);
        });
      });
    });
    addQBtn.style.cssText = "padding:8px 14px;border-radius:10px;font-weight:700;font-size:13px;background:var(--a);color:#fff";
    rightActions.appendChild(addQBtn);

    var addTestBtn = btn("➕ নতুন টেস্ট সেট যোগ", null, function(){
      openTestSetEditorModal(ch, null, function(){
        loadAndRenderTestSets();
      });
    });
    addTestBtn.style.cssText = "padding:8px 14px;border-radius:10px;font-weight:700;font-size:13px;background:var(--b);color:#fff";
    rightActions.appendChild(addTestBtn);

    var bulkToggleBtn = btn("📥 বাল্ক JSON এডিটর", "ghost", function(){
      bulkCard.style.display = (bulkCard.style.display === "none") ? "block" : "none";
    });
    bulkToggleBtn.style.cssText = "padding:8px 14px;border-radius:10px;font-size:13px;border:1.5px solid var(--line)";
    rightActions.appendChild(bulkToggleBtn);

    topBar.appendChild(rightActions);
    qCard.appendChild(topBar);

    // Collapsible Bulk JSON Card
    var bulkCard = el("div");
    bulkCard.style.cssText = "display:none;background:var(--bg);border:1.5px solid var(--line);border-radius:14px;padding:16px;margin-bottom:18px";
    bulkCard.innerHTML = "<h4 style='margin:0 0 6px;font-size:15px'>📥 সম্পূর্ণ প্রশ্নব্যাংক JSON কোড</h4><p class='mute' style='font-size:12.5px;margin:0 0 10px'>একসাথে একাধিক প্রশ্ন কপি/পেস্ট করতে নিচের টেক্সট এরিয়া ব্যবহার করুন:</p>";
    
    var bulkTa = el("textarea");
    bulkTa.rows = 8;
    bulkTa.style.cssText = "width:100%;font-family:monospace;font-size:12.5px;padding:10px;border-radius:10px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);box-sizing:border-box";
    bulkTa.placeholder = '[\n  {\n    "question": "প্রশ্ন এখানে লিখুন...",\n    "options": ["ক অপশন", "খ অপশন", "গ অপশন", "ঘ অপশন"],\n    "correct": 0,\n    "explanation": "ব্যাখ্যা..."\n  }\n]';
    bulkCard.appendChild(bulkTa);

    var bulkActions = el("div", "row");
    bulkActions.style.cssText = "margin-top:10px;display:flex;gap:10px";

    var saveBulkBtn = btn("💾 সম্পূর্ণ JSON সেভ করুন", null, function(){
      var txt = bulkTa.value.trim();
      if(!txt) return toast("আগে JSON কোড পেস্ট করুন!");
      try {
        var parsed = JSON.parse(txt);
        if(!Array.isArray(parsed) || !parsed.length) return alert("ভুল ফরম্যাট! প্রশ্নব্যাংক অবশ্যই প্রশ্নের একটি তালিকা (Array) হতে হবে।");
        db.ref("exam_questions/" + ch.id).set(parsed).then(function(){
          toast("সফলভাবে " + parsed.length + "টি প্রশ্ন সেভ হয়েছে ✓");
          bulkCard.style.display = "none";
          loadAndRenderQuestions(parsed);
        }).catch(function(err){
          toast("সেভ ব্যর্থ: " + err.message);
        });
      } catch(e) {
        alert("JSON সিনট্যাক্স ভুল:\n" + e.message);
      }
    });
    saveBulkBtn.style.padding = "7px 16px";
    bulkActions.appendChild(saveBulkBtn);

    var sampleBulkBtn = btn("📋 ডেমো ফরম্যাট লোড করুন", "ghost", function(){
      var sample = [
        {
          question: ch.name + " সম্পর্কিত মৌলিক তথ্য কোনটি?",
          options: ["বয়েল ও চার্লসের সূত্র", "নিউটনের প্রথম সূত্র", "মেন্ডেলের সূত্র", "ফ্যারাডের সূত্র"],
          correct: 0,
          explanation: "এই অধ্যায়ের মূল ভিত্তি।"
        }
      ];
      bulkTa.value = JSON.stringify(sample, null, 2);
    });
    sampleBulkBtn.style.padding = "7px 12px";
    bulkActions.appendChild(sampleBulkBtn);

    bulkCard.appendChild(bulkActions);
    qCard.appendChild(bulkCard);

    // Section 1: Chapter Test Sets Container (Student Portal Sync)
    var testSetsBox = el("div");
    testSetsBox.style.cssText = "background:var(--bg);border:1.5px solid var(--line);border-radius:14px;padding:16px;margin-bottom:20px";
    testSetsBox.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
        <div>
          <h4 style="margin:0 0 2px;font-size:16px;color:var(--ink)">📚 এই অধ্যায়ের টেস্ট / এক্সাম সেটসমূহ (Live Student Portal Sync)</h4>
          <small class="mute">শিক্ষার্থীদের পোর্টালে হুবহু এই টেস্টগুলো পরীক্ষা হিসেবে দৃশ্যমান হবে</small>
        </div>
        <button type="button" id="btn_inline_add_test" class="btn" style="padding:6px 14px;font-size:12.5px;background:var(--b);color:#fff">➕ নতুন টেস্ট সেট</button>
      </div>
      <div id="admin_chapter_tests_list"></div>
    `;
    qCard.appendChild(testSetsBox);

    testSetsBox.querySelector("#btn_inline_add_test").onclick = function(){
      openTestSetEditorModal(ch, null, function(){
        loadAndRenderTestSets();
      });
    };

    function loadAndRenderTestSets() {
      var listEl = testSetsBox.querySelector("#admin_chapter_tests_list");
      listEl.innerHTML = "<p class='mute' style='font-size:13px;padding:10px 0'>টেস্ট সেট লোড হচ্ছে...</p>";
      db.ref("exam_chapter_tests/" + ch.id).once("value").then(function(snap){
        var val = snap.val();
        listEl.textContent = "";
        var sets = [];
        if (val && typeof val === "object") {
          sets = Object.keys(val).map(function(k){ return { id: k, ...val[k] }; });
        }
        if (!sets.length) {
          listEl.innerHTML = `
            <div style="padding:16px;border-radius:10px;background:var(--card);border:1px dashed var(--line);text-align:center">
              <span style="font-size:13.5px;color:var(--mute)">এখনও কোনো কাস্টম টেস্ট সেট তৈরি করা হয়নি। শিক্ষার্থীরা ডিফল্ট বেসিক ও মক টেস্ট দেখতে পাচ্ছে।</span>
            </div>
          `;
          return;
        }

        var grid = el("div");
        grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px";
        sets.forEach(function(ts){
          var card = el("div");
          card.style.cssText = "padding:12px 14px;background:var(--card);border:1.5px solid var(--line);border-radius:10px;display:flex;flex-direction:column;justify-content:space-between;gap:8px";
          card.innerHTML = `
            <div>
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                <span class="badge" style="font-size:11px;padding:2px 8px">${ts.tag || 'মক টেস্ট'}</span>
                <span class="mute" style="font-size:12px">⏱ ${ts.durationMinutes || 15} মি. · 📝 ${(ts.questions ? ts.questions.length : ts.qCount) || 0}টি প্রশ্ন</span>
              </div>
              <strong style="font-size:14.5px;color:var(--ink);display:block;line-height:1.4">${ts.title}</strong>
              <small class="mute" style="font-size:12px">${ts.desc || ''}</small>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:6px;border-top:1px solid var(--line);padding-top:8px">
              <button type="button" class="btn ghost btn-edit-ts" style="padding:4px 10px;font-size:12px">✏️ এডিট</button>
              <button type="button" class="btn ghost btn-del-ts" style="padding:4px 10px;font-size:12px;color:var(--danger);border-color:var(--danger)">🗑️ ডিলিট</button>
            </div>
          `;

          card.querySelector(".btn-edit-ts").onclick = function(){
            openTestSetEditorModal(ch, ts, function(){
              loadAndRenderTestSets();
            });
          };

          card.querySelector(".btn-del-ts").onclick = function(){
            if (!confirm("আপনি কি নিশ্চিতভাবে '" + ts.title + "' টেস্ট সেটটি মুছে ফেলতে চান?")) return;
            db.ref("exam_chapter_tests/" + ch.id + "/" + ts.id).remove().then(function(){
              toast("টেস্ট সেট মুছে ফেলা হয়েছে ✓");
              loadAndRenderTestSets();
            });
          };

          grid.appendChild(card);
        });
        listEl.appendChild(grid);
      }).catch(function(){
        listEl.innerHTML = "<p class='mute'>টেস্ট সেট লোড করা যায়নি।</p>";
      });
    }

    loadAndRenderTestSets();

    // Section 2: Questions List Container
    var listContainer = el("div");
    listContainer.id = "admin_q_items_container";
    qCard.appendChild(listContainer);

    function loadAndRenderQuestions(givenList) {
      if (givenList && Array.isArray(givenList)) {
        renderItems(givenList);
        bulkTa.value = JSON.stringify(givenList, null, 2);
      } else {
        listContainer.innerHTML = "<p class='mute' style='text-align:center;padding:24px'>প্রশ্ন লোড হচ্ছে...</p>";
        db.ref("exam_questions/" + ch.id).once("value").then(function(snap){
          var val = snap.val();
          var arr = [];
          if (val && Array.isArray(val)) arr = val;
          else if (val && typeof val === "object") arr = Object.values(val);
          bulkTa.value = arr.length ? JSON.stringify(arr, null, 2) : "";
          renderItems(arr);
        }).catch(function(){
          renderItems([]);
        });
      }
    }

    function renderItems(qList) {
      listContainer.textContent = "";
      if (!qList || !qList.length) {
        listContainer.innerHTML = `
          <div style="text-align:center;padding:40px 16px;background:var(--bg);border-radius:14px;border:1.5px dashed var(--line);margin-top:10px">
            <div style="font-size:32px;margin-bottom:8px">📝</div>
            <h4 style="margin:0 0 6px;font-size:16px;color:var(--ink)">এই অধ্যায়ে এখনও কোনো প্রশ্ন যোগ করা হয়নি</h4>
            <p class="mute" style="font-size:13px;margin:0 0 16px">উপরের '➕ নতুন প্রশ্ন যোগ করুন' বা '📥 বাল্ক JSON এডিটর' দিয়ে প্রশ্ন যুক্ত করুন।</p>
          </div>
        `;
        return;
      }

      var statsBar = el("div");
      statsBar.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:8px 0;margin-bottom:8px;border-bottom:1.5px solid var(--line);font-size:13.5px;color:var(--mute)";
      statsBar.innerHTML = "<span>মোট সংরক্ষিত প্রশ্ন: <strong>" + bn(qList.length) + "</strong> টি</span><span style='color:var(--a);font-weight:600'>✓ লাইভ সেভড</span>";
      listContainer.appendChild(statsBar);

      qList.forEach(function(item, idx){
        var itemCard = el("div");
        itemCard.style.cssText = "padding:16px;border-radius:12px;margin-bottom:12px;background:var(--bg);border:1.5px solid var(--line);display:flex;justify-content:space-between;align-items:flex-start;gap:14px;transition:all .2s ease";

        var leftContent = el("div");
        leftContent.style.flex = "1";

        var qTitle = el("div");
        qTitle.style.cssText = "font-size:15.5px;font-weight:700;color:var(--ink);margin-bottom:8px;line-height:1.45";
        qTitle.textContent = bn(idx + 1) + ". " + item.question;
        leftContent.appendChild(qTitle);

        var optsGrid = el("div");
        optsGrid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:6px;margin-bottom:6px";
        
        var banglaLetters = ["ক", "খ", "গ", "ঘ", "ঙ"];
        (item.options || []).forEach(function(opt, oi){
          var isCor = (oi === item.correct);
          var optEl = el("div");
          optEl.style.cssText = "padding:6px 10px;border-radius:8px;font-size:13px;display:flex;align-items:center;gap:6px;" +
            (isCor 
              ? "background:rgba(16,185,129,0.15);border:1px solid #10b981;color:#10b981;font-weight:700" 
              : "background:var(--card);border:1px solid var(--line);color:var(--ink)");
          optEl.innerHTML = `<span>${banglaLetters[oi] || oi+1})</span> <span style="flex:1">${opt}</span> ${isCor ? '<span title="সঠিক উত্তর">✓</span>' : ''}`;
          optsGrid.appendChild(optEl);
        });
        leftContent.appendChild(optsGrid);

        if (item.explanation) {
          var expEl = el("div", "mute");
          expEl.style.cssText = "font-size:12px;margin-top:6px;padding-left:4px;color:var(--mute)";
          expEl.innerHTML = "💡 <em>ব্যাখ্যা: " + item.explanation + "</em>";
          leftContent.appendChild(expEl);
        }

        itemCard.appendChild(leftContent);

        // Action Buttons (Edit, Remove, Test)
        var actionsBox = el("div");
        actionsBox.style.cssText = "display:flex;gap:6px;align-items:center;flex-shrink:0";

        var editB = btn("✏️ এডিট", "ghost", function(){
          openQuestionEditorModal(ch, item, idx, qList, function(updatedList){
            loadAndRenderQuestions(updatedList);
          });
        });
        editB.style.cssText = "padding:6px 10px;font-size:12px;border-radius:8px;border:1px solid var(--line)";
        actionsBox.appendChild(editB);

        var delB = btn("🗑 রিমুভ", "dn", function(){
          if(!confirm("আপনি কি নিশ্চিতভাবে " + bn(idx + 1) + " নম্বর প্রশ্নটি মুছে ফেলতে চান?")) return;
          var nextList = qList.slice();
          nextList.splice(idx, 1);
          db.ref("exam_questions/" + ch.id).set(nextList).then(function(){
            toast("প্রশ্নটি মুছে ফেলা হয়েছে ✓");
            loadAndRenderQuestions(nextList);
          });
        });
        delB.style.cssText = "padding:6px 10px;font-size:12px;border-radius:8px;background:#ef4444;color:#fff;border:none";
        actionsBox.appendChild(delB);

        itemCard.appendChild(actionsBox);
        listContainer.appendChild(itemCard);
      });
    }

    loadAndRenderQuestions();
    container.appendChild(qCard);
    return;
  }

  // LEVEL 2: অধ্যায় নির্বাচন ও পরিচালনা (বাটনে চাপ দেওয়ার সাথে সাথে দেখাবে)
  if (selectedSubId && !selectedChapId) {
    var activeSub = filteredSubs.find(function(s){ return s.id === selectedSubId; });
    if (!activeSub) {
      selectedSubId = null;
      renderQBankView(container, allSubs);
      return;
    }

    var chapCard = el("div", "card");
    chapCard.id = "admin_chap_card";

    // Top Header with Back to Subjects & Add Chapter
    var chHeader = el("div", "sw");
    chHeader.style.cssText = "align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;border-bottom:1px solid var(--line);padding-bottom:14px;margin-bottom:16px";

    var leftSide = el("div");
    leftSide.style.cssText = "display:flex;align-items:center;gap:10px;flex-wrap:wrap";

    var backToSubsBtn = btn("← সব বিষয়ে ফিরে যান", "ghost", function(){
      selectedSubId = null;
      selectedChapId = null;
      renderQBankView(container, allSubs);
    });
    backToSubsBtn.style.cssText = "padding:6px 14px;font-size:13px;border-radius:10px;border:1.5px solid var(--line);font-weight:600";
    leftSide.appendChild(backToSubsBtn);

    var titleHeader = el("div");
    titleHeader.innerHTML = "<h3 style='margin:0;font-size:18px;color:var(--ink)'>২. অধ্যায় নির্বাচন ও পরিচালনা — <span style='color:var(--a)'>" + activeSub.titleBn + "</span> <small class='mute' style='font-size:12px'>(" + activeExamCategory + ")</small></h3>";
    leftSide.appendChild(titleHeader);
    chHeader.appendChild(leftSide);

    var addChBtn = btn("➕ নতুন চ্যাপ্টার যোগ করুন", null, function() {
      var cNum = prompt("অধ্যায় নম্বর (যেমন: ১, ২, ৫):");
      if (!cNum) return;
      var cName = prompt("অধ্যায়ের নাম লিখুন (যেমন: পরিবেশ রসায়ন):");
      if (!cName) return;

      var chapters = activeSub.chapters || [];
      var newChapId = activeSub.id + "_ch" + cNum + "_" + Date.now().toString().slice(-4);
      chapters.push({ id: newChapId, num: cNum, name: cName });

      db.ref("exam_subjects/" + activeSub.id + "/chapters").set(chapters).then(function() {
        toast("নতুন চ্যাপ্টার যোগ হয়েছে ✓");
        activeSub.chapters = chapters;
        renderQBankView(container, allSubs);
      });
    });
    addChBtn.style.cssText = "padding:7px 16px;border-radius:10px;font-size:13px;font-weight:700";
    chHeader.appendChild(addChBtn);
    chapCard.appendChild(chHeader);

    var chapters = activeSub.chapters || [];
    if (!chapters.length) {
      chapCard.innerHTML += `
        <div style="text-align:center;padding:40px 16px;background:var(--bg);border-radius:14px;border:1.5px dashed var(--line);margin-top:10px">
          <div style="font-size:32px;margin-bottom:8px">📖</div>
          <h4 style="margin:0 0 6px;font-size:16px;color:var(--ink)">এই বিষয়ের অধীনে এখনও কোনো চ্যাপ্টার নেই</h4>
          <p class="mute" style="font-size:13px;margin:0 0 16px">উপরের '➕ নতুন চ্যাপ্টার যোগ করুন' বাটনে চাপ দিয়ে প্রথম চ্যাপ্টার যুক্ত করুন।</p>
        </div>
      `;
      container.appendChild(chapCard);
      return;
    }

    var chList = el("div");
    chList.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;margin-top:14px";

    chapters.forEach(function(ch) {
      var row = el("div");
      row.style.cssText = "padding:16px;border-radius:14px;background:var(--bg);border:1.5px solid var(--line);transition:all .2s ease;display:flex;flex-direction:column;justify-content:space-between;gap:12px;cursor:pointer";

      var top = el("div");
      top.innerHTML = "<div style='color:var(--a);font-weight:700;font-size:13px;margin-bottom:4px'>অধ্যায় " + ch.num + "</div><div style='font-size:16px;font-weight:700;color:var(--ink);line-height:1.4'>" + ch.name + "</div>";
      top.onclick = function() {
        selectedChapId = ch.id;
        renderQBankView(container, allSubs);
      };
      row.appendChild(top);

      var footer = el("div");
      footer.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:6px;border-top:1px solid var(--line);padding-top:10px;margin:0";

      var openJsonBtn = btn("📋 প্রশ্নসমূহ ও প্রশ্নব্যাংক ›", "alt", function(e) {
        e.stopPropagation();
        selectedChapId = ch.id;
        renderQBankView(container, allSubs);
      });
      openJsonBtn.style.cssText = "padding:6px 12px;font-size:12.5px;border-radius:8px;font-weight:700";
      footer.appendChild(openJsonBtn);

      var actBtns = el("div");
      actBtns.style.cssText = "display:flex;gap:4px;align-items:center";

      var editBtn = el("button", "btn ghost");
      editBtn.type = "button";
      editBtn.innerHTML = "✏️";
      editBtn.title = "অধ্যায় এডিট করুন";
      editBtn.style.cssText = "padding:6px 8px;font-size:13px;border-radius:8px;cursor:pointer";
      editBtn.onclick = function(e) {
        e.stopPropagation();
        var newName = prompt("অধ্যায়ের নতুন নাম লিখুন:", ch.name);
        if (!newName || newName === ch.name) return;
        ch.name = newName.trim();
        db.ref("exam_subjects/" + activeSub.id + "/chapters").set(chapters).then(function() {
          toast("চ্যাপ্টারের নাম আপডেট হয়েছে ✓");
          renderQBankView(container, allSubs);
        });
      };
      actBtns.appendChild(editBtn);

      var delChBtn = el("button", "btn dn");
      delChBtn.type = "button";
      delChBtn.innerHTML = "🗑️";
      delChBtn.title = "অধ্যায় ডিলিট করুন";
      delChBtn.style.cssText = "padding:6px 8px;font-size:13px;border-radius:8px;cursor:pointer;background:#ef4444;color:#fff;border:none";
      delChBtn.onclick = function(e) {
        e.stopPropagation();
        if (!confirm("আপনি কি নিশ্চিতভাবে '" + ch.name + "' চ্যাপ্টারটি ডিলিট করতে চান? এর অধীনে থাকা সমস্ত প্রশ্ন মুছে যাবে।")) return;
        var remaining = chapters.filter(function(c) { return c.id !== ch.id; });
        db.ref("exam_subjects/" + activeSub.id + "/chapters").set(remaining).then(function() {
          db.ref("exam_questions/" + ch.id).remove().catch(function(){});
          toast("চ্যাপ্টার ডিলিট করা হয়েছে ✓");
          activeSub.chapters = remaining;
          renderQBankView(container, allSubs);
        });
      };
      actBtns.appendChild(delChBtn);

      footer.appendChild(actBtns);
      row.appendChild(footer);
      chList.appendChild(row);
    });

    chapCard.appendChild(chList);
    container.appendChild(chapCard);
    return;
  }

  // LEVEL 1: বিষয় নির্বাচন করুন (মূল স্ক্রিন)
  var subCard = el("div", "card");
  var subHeader = el("div", "sw");
  subHeader.style.cssText = "align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:16px";
  
  var titleH = el("h3", null, "১. বিষয় নির্বাচন করুন (Subject Hierarchy) — " + activeExamCategory);
  titleH.style.margin = "0";
  subHeader.appendChild(titleH);

  var addSubBtn = btn("➕ নতুন বিষয় যোগ করুন", null, function() {
    var nameBn = prompt("নতুন বিষয়ের নাম বাংলায় লিখুন (যেমন: তথ্য ও যোগাযোগ প্রযুক্তি):");
    if (!nameBn) return;
    var nameEn = prompt("English Name (e.g. ICT):") || nameBn;
    var newId = "subj_" + activeExamCategory.toLowerCase() + "_" + Date.now();
    var newSub = {
      category: activeExamCategory,
      titleBn: nameBn,
      titleEn: nameEn,
      tag: activeExamCategory,
      gradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
      chapters: []
    };
    db.ref("exam_subjects/" + newId).set(newSub).then(function() {
      toast("নতুন বিষয় তৈরি হয়েছে ✓");
      selectedSubId = newId;
      selectedChapId = null;
      allSubs.push(newSub);
      renderQBankView(container, allSubs);
    });
  });
  addSubBtn.style.cssText = "padding:7px 16px;border-radius:10px;font-size:13px;font-weight:700";
  subHeader.appendChild(addSubBtn);
  subCard.appendChild(subHeader);

  var subGrid = el("div");
  subGrid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;margin:14px 0";

  filteredSubs.forEach(function(s) {
    var card = el("div");
    card.style.cssText = "padding:18px;border-radius:14px;cursor:pointer;transition:all .2s ease;border:1.5px solid var(--line);background:var(--card);display:flex;flex-direction:column;justify-content:space-between;gap:12px;box-shadow:0 2px 8px rgba(0,0,0,0.04)";
    
    var top = el("div");
    top.onclick = function() {
      selectedSubId = s.id;
      selectedChapId = null;
      renderQBankView(container, allSubs);
    };
    var tag = el("div", "mute", s.titleEn || activeExamCategory);
    tag.style.cssText = "font-size:11.5px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;font-weight:700;color:var(--a)";
    var title = el("div", null, s.titleBn);
    title.style.cssText = "font-size:17px;font-weight:700;color:var(--ink);line-height:1.4";
    var count = el("div", "mute", (s.chapters ? s.chapters.length : 0) + "টি অধ্যায় সংযুক্ত");
    count.style.cssText = "font-size:12.5px;margin-top:6px";
    top.appendChild(tag);
    top.appendChild(title);
    top.appendChild(count);
    card.appendChild(top);

    var actions = el("div");
    actions.style.cssText = "display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--line);padding-top:10px;margin-top:4px";

    var selectBtn = el("span", null, "অধ্যায়গুলো দেখুন ›");
    selectBtn.style.cssText = "font-size:13px;font-weight:700;color:var(--a);cursor:pointer";
    selectBtn.onclick = function() {
      selectedSubId = s.id;
      selectedChapId = null;
      renderQBankView(container, allSubs);
    };
    actions.appendChild(selectBtn);

    var iconGroup = el("div");
    iconGroup.style.cssText = "display:flex;gap:4px;align-items:center";

    var sEdit = el("button");
    sEdit.type = "button";
    sEdit.innerHTML = "✏️";
    sEdit.title = "বিষয়ের নাম এডিট করুন";
    sEdit.style.cssText = "background:transparent;border:1px solid var(--line);padding:4px 7px;font-size:12px;cursor:pointer;border-radius:6px;color:inherit";
    sEdit.onclick = function(e) {
      e.stopPropagation();
      var newBn = prompt("বিষয়ের নতুন বাংলা নাম লিখুন:", s.titleBn);
      if (!newBn) return;
      var newEn = prompt("বিষয়ের নতুন ইংরেজি নাম লিখুন:", s.titleEn || s.titleBn);
      db.ref("exam_subjects/" + s.id + "/titleBn").set(newBn.trim());
      db.ref("exam_subjects/" + s.id + "/titleEn").set((newEn || newBn).trim()).then(function() {
        toast("বিষয় আপডেট হয়েছে ✓");
        s.titleBn = newBn.trim();
        s.titleEn = (newEn || newBn).trim();
        renderQBankView(container, allSubs);
      });
    };
    iconGroup.appendChild(sEdit);

    var sDel = el("button");
    sDel.type = "button";
    sDel.innerHTML = "🗑️";
    sDel.title = "বিষয় ডিলিট করুন";
    sDel.style.cssText = "background:transparent;border:1px solid #fca5a5;padding:4px 7px;font-size:12px;cursor:pointer;border-radius:6px;color:#ef4444";
    sDel.onclick = function(e) {
      e.stopPropagation();
      if (!confirm("আপনি কি নিশ্চিতভাবে '" + s.titleBn + "' বিষয়টি মুছে ফেলতে চান? এর অধীনে থাকা সব অধ্যায় মুছে যাবে।")) return;
      db.ref("exam_subjects/" + s.id).remove().then(function() {
        toast("বিষয় মুছে ফেলা হয়েছে ✓");
        var idx = allSubs.indexOf(s);
        if (idx > -1) allSubs.splice(idx, 1);
        renderQBankView(container, allSubs);
      });
    };
    iconGroup.appendChild(sDel);

    actions.appendChild(iconGroup);
    card.appendChild(actions);
    subGrid.appendChild(card);
  });

  subCard.appendChild(subGrid);
  container.appendChild(subCard);
}

function renderSchedulingUI(m) {
  var formCard = el("div", "card");
  var titleH = el("h3", null, "➕ নতুন পরীক্ষা শিডিউলিং ও অটো-অ্যাক্টিভেশন");
  titleH.style.cssText = "color:#10b981;font-weight:700;font-size:18px;margin-bottom:6px";
  formCard.appendChild(titleH);

  var formGrid = el("div");
  formGrid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px;margin-top:14px";

  // Exam Title
  var titleBox = el("div");
  titleBox.appendChild(el("label", "mute", "পরীক্ষার নাম:"));
  var titleInput = el("input");
  titleInput.placeholder = "যেমন: রসায়ন ২য় পত্র মডেল টেস্ট";
  titleInput.style.cssText = "width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--line);font-size:14px";
  titleBox.appendChild(titleInput);
  formGrid.appendChild(titleBox);

  // Subject Name
  var subBox = el("div");
  subBox.appendChild(el("label", "mute", "বিষয় / পেপারের নাম:"));
  var subInput = el("input");
  subInput.placeholder = "যেমন: রসায়ন ২য় পত্র (জৈব রসায়ন)";
  subInput.style.cssText = "width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--line);font-size:14px";
  subBox.appendChild(subInput);
  formGrid.appendChild(subBox);

  // Target Type
  var targetBox = el("div");
  targetBox.appendChild(el("label", "mute", "টার্গেট ইউজার / রুম:"));
  var targetSelect = el("select");
  targetSelect.style.cssText = "width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--line);font-size:14px";
  [
    ["all", "সকল শিক্ষার্থী (All Users)"],
    ["room", "নির্দিষ্ট রুম কোড (Room Code)"],
    ["uid", "নির্দিষ্ট ইউজার UID"]
  ].forEach(function(o) {
    var opt = el("option", null, o[1]); opt.value = o[0]; targetSelect.appendChild(opt);
  });
  targetBox.appendChild(targetSelect);
  formGrid.appendChild(targetBox);

  // Target Value
  var valBox = el("div");
  valBox.appendChild(el("label", "mute", "রুম কোড বা UID:"));
  var valInput = el("input");
  valInput.placeholder = "যেমন: 1432014310 বা 14320 (সবাই হলে ফাঁকা রাখুন)";
  valInput.style.cssText = "width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--line);font-size:14px";
  valBox.appendChild(valInput);
  formGrid.appendChild(valBox);

  // Scheduled Date Time
  var dtBox = el("div");
  dtBox.appendChild(el("label", "mute", "তারিখ ও সময় (Auto-Activation):"));
  var dtInput = el("input");
  dtInput.type = "datetime-local";
  dtInput.style.cssText = "width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--line);font-size:14px";
  dtBox.appendChild(dtInput);
  formGrid.appendChild(dtBox);

  // Duration
  var durBox = el("div");
  durBox.appendChild(el("label", "mute", "টাইমার / সময়সীমা:"));
  var durSelect = el("select");
  durSelect.style.cssText = "width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--line);font-size:14px";
  [
    ["15", "১৫ মিনিট"],
    ["30", "৩০ মিনিট"],
    ["45", "৪৫ মিনিট"],
    ["60", "৬০ মিনিট (১ ঘণ্টা)"],
    ["90", "৯০ মিনিট (১.৫ ঘণ্টা)"],
    ["120", "১২০ মিনিট (২ ঘণ্টা)"]
  ].forEach(function(d) {
    var opt = el("option", null, d[1]); opt.value = d[0]; durSelect.appendChild(opt);
  });
  durSelect.value = "30";
  durBox.appendChild(durSelect);
  formGrid.appendChild(durBox);

  // PDF Link
  var pdfBox = el("div");
  pdfBox.style.gridColumn = "1 / -1";
  pdfBox.appendChild(el("label", "mute", "প্রশ্নপত্রের PDF লিংক (ঐচ্ছিক - ড্রাইভ বা ওয়েব লিংক):"));
  var pdfInput = el("input");
  pdfInput.placeholder = "https://drive.google.com/file/d/.../view?usp=sharing";
  pdfInput.style.cssText = "width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--line);font-size:14px";
  pdfBox.appendChild(pdfInput);
  formGrid.appendChild(pdfBox);

  // JSON Code Textarea
  var jsonBox = el("div");
  jsonBox.style.gridColumn = "1 / -1";
  jsonBox.appendChild(el("label", "mute", "প্রশ্নের JSON কোড (ঐচ্ছিক - কুইজ/প্রশ্ন সরাসরি শিডিউল করতে নিচে পেস্ট করুন):"));
  var jsonArea = el("textarea");
  jsonArea.rows = 7;
  jsonArea.style.cssText = "width:100%;font-family:monospace;font-size:13px;padding:12px;border-radius:10px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);box-sizing:border-box";
  jsonArea.placeholder = '[\n  {\n    "question": "নিচের কোনটি উদ্ভিদের বৃদ্ধি নিয়ন্ত্রক হরমোন?",\n    "options": ["অক্সিন", "ইনসুলিন", "থাইরক্সিন", "হিমোগ্লোবিন"],\n    "correct": 0\n  }\n]';
  jsonBox.appendChild(jsonArea);
  formGrid.appendChild(jsonBox);

  formCard.appendChild(formGrid);

  var btnGroup = el("div", "row");
  btnGroup.style.marginTop = "16px";

  var publishBtn = btn("পরীক্ষা শিডিউল ও অ্যাসাইন করুন", null, function() {
    var title = titleInput.value.trim();
    if (!title) return toast("পরীক্ষার নাম লিখুন!");

    var examObj = {
      title: title,
      category: activeExamCategory,
      subjectName: subInput.value.trim() || "সাধারণ বিষয়",
      target: targetSelect.value,
      targetValue: valInput.value.trim() || "all",
      scheduledDate: dtInput.value || "আজকে",
      durationMinutes: Number(durSelect.value) || 30,
      pdfUrl: pdfInput.value.trim() || null,
      createdAt: Date.now()
    };

    var qText = jsonArea.value.trim();
    if (qText) {
      try {
        var parsedQ = JSON.parse(qText);
        if (Array.isArray(parsedQ)) {
          examObj.questions = parsedQ;
        } else {
          return alert("ভুল ফরম্যাট! প্রশ্নের JSON অবশ্যই একটি Array হতে হবে।");
        }
      } catch (err) {
        return alert("JSON সিনট্যাক্স ভুল! কোড ঠিকভাবে পরীক্ষা করুন:\n" + err.message);
      }
    }

    publishBtn.disabled = true;
    db.ref("assigned_exams").push(examObj).then(function() {
      publishBtn.disabled = false;
      toast("পরীক্ষা সফলভাবে অ্যাসাইন করা হয়েছে ✓");
      render();
    }).catch(function(err) {
      publishBtn.disabled = false;
      toast("ব্যর্থ: " + err.message);
    });
  });
  publishBtn.style.cssText = "padding:10px 24px;border-radius:10px;font-size:15px;font-weight:700";
  btnGroup.appendChild(publishBtn);

  formCard.appendChild(btnGroup);
  m.appendChild(formCard);

  // Existing Scheduled Exams
  var listCard = el("div", "card");
  listCard.innerHTML = "<h3>📋 বর্তমানে সক্রিয় ও নির্ধারিত পরীক্ষাসমূহ</h3><div id='admin_exam_list'>লোড হচ্ছে...</div>";
  m.appendChild(listCard);

  db.ref("assigned_exams").once("value").then(function(snap) {
    var c = document.getElementById("admin_exam_list");
    if (!c) return;
    c.textContent = "";

    var data = snap.val();
    if (!data) {
      c.innerHTML = "<p class='mute'>বর্তমানে কোনো নির্ধারিত পরীক্ষা নেই।</p>";
      return;
    }

    var keys = Object.keys(data).reverse();
    keys.forEach(function(k) {
      var ex = data[k];
      var row = el("div", "ses");
      row.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid var(--line);flex-wrap:wrap;gap:8px";

      var info = el("div");
      var catBadge = ex.category ? `<span class="badge" style="font-size:11px;padding:2px 7px;margin-right:6px">${ex.category}</span>` : "";
      info.innerHTML = catBadge + "<strong>" + ex.title + "</strong> (" + (ex.subjectName || "") + ")<div class='mute' style='font-size:12.5px'>টার্গেট: " + (ex.target === "room" ? "রুম " + ex.targetValue : ex.target === "uid" ? "ইউজার " + ex.targetValue : "সকল শিক্ষার্থী") + " · সময়: " + ex.durationMinutes + " মিনিট · তারিখ: " + (ex.scheduledDate || "আজ") + "</div>";
      row.appendChild(info);

      var actionGroup = el("div", "row");
      actionGroup.style.margin = "0";

      var editB = btn("✏️ এডিট", "ghost", function() {
        var newTitle = prompt("পরীক্ষার নতুন নাম লিখুন:", ex.title);
        if (!newTitle) return;
        var newDur = prompt("নতুন সময়সীমা (মিনিট):", ex.durationMinutes || 30);
        db.ref("assigned_exams/" + k).update({
          title: newTitle,
          durationMinutes: Number(newDur) || ex.durationMinutes
        }).then(function() {
          toast("পরীক্ষার তথ্য আপডেট হয়েছে ✓");
          render();
        });
      });
      editB.style.cssText = "padding:4px 10px;font-size:12px;border-radius:8px;margin-right:4px";
      actionGroup.appendChild(editB);

      var delB = btn("🗑 মুছুন", "dn", function() {
        if (!confirm("আপনি কি নিশ্চিত যে '" + ex.title + "' পরীক্ষাটি মুছে ফেলতে চান?")) return;
        db.ref("assigned_exams/" + k).remove().then(function() {
          toast("পরীক্ষা মুছে ফেলা হয়েছে ✓");
          render();
        });
      });
      delB.style.cssText = "padding:4px 10px;font-size:12px;border-radius:8px";
      actionGroup.appendChild(delB);

      row.appendChild(actionGroup);
      c.appendChild(row);
    });
  });

  // 1. Exam Access Blocker Section
  var blockCard = el("div", "card");
  blockCard.innerHTML = `
    <h3>🚫 পরীক্ষা এক্সেস কন্ট্রোল ও ব্লকার (Exam Access Control)</h3>
    <p class="mute" style="font-size:13px;margin:0 0 12px">নির্দিষ্ট শিক্ষার্থী (UID) বা পুরো রুমের ডিজিটাল পরীক্ষা সাময়িকভাবে স্থগিত বা চালু করুন</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
      <input type="text" id="admin_blk_target" placeholder="ইউজার UID বা রুম কোড লিখুন" style="flex:1;min-width:200px;padding:9px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit" />
      <input type="text" id="admin_blk_reason" placeholder="স্থগিতের কারণ (ঐচ্ছিক)" style="flex:1;min-width:180px;padding:9px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit" />
      <button class="btn dn" id="btn_admin_block_target" style="padding:9px 16px;border-radius:10px">🚫 ব্লক করুন</button>
      <button class="btn ghost" id="btn_admin_unblock_target" style="padding:9px 16px;border-radius:10px">✅ আনব্লক করুন</button>
    </div>
    <div id="admin_blocked_list_container" style="background:var(--bg);border-radius:12px;padding:10px;border:1px solid var(--line)">লোড হচ্ছে...</div>
  `;
  m.appendChild(blockCard);

  function refreshBlockedList(){
    db.ref("exam_blocked_targets").once("value").then(function(bSnap){
      var bCont = document.getElementById("admin_blocked_list_container");
      if(!bCont) return;
      bCont.innerHTML = "";
      var bData = bSnap.val();
      if(!bData || Object.keys(bData).length === 0){
        bCont.innerHTML = "<span class='mute' style='font-size:13px'>বর্তমানে কোনো শিক্ষার্থী বা রুম ব্লক করা নেই।</span>";
        return;
      }
      var ul = el("div");
      Object.keys(bData).forEach(function(tId){
        var info = bData[tId];
        var item = el("div", "row");
        item.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid var(--line);font-size:13px";
        item.innerHTML = `<div><strong style="color:var(--danger)">🚫 ${tId}</strong> ${info.targetName ? "("+info.targetName+")" : ""} <span class="mute">${info.reason ? "· কারণ: " + info.reason : ""}</span></div>`;
        var unb = btn("আনব্লক", "ghost", function(){
          db.ref("exam_blocked_targets/" + tId).remove().then(function(){
            toast(tId + " এর পরীক্ষা এক্সেস সচল করা হয়েছে ✓");
            refreshBlockedList();
          });
        });
        unb.style.cssText = "padding:3px 10px;font-size:12px;border-radius:6px";
        item.appendChild(unb);
        ul.appendChild(item);
      });
      bCont.appendChild(ul);
    }).catch(function(){});
  }
  refreshBlockedList();

  var blkInp = document.getElementById("admin_blk_target");
  var blkRsn = document.getElementById("admin_blk_reason");
  var btnBlk = document.getElementById("btn_admin_block_target");
  var btnUnblk = document.getElementById("btn_admin_unblock_target");

  if(btnBlk){
    btnBlk.onclick = function(){
      var t = blkInp.value.trim();
      if(!t) return toast("টার্গেট UID বা রুম কোড লিখুন!");
      db.ref("exam_blocked_targets/" + t).set({
        blocked: true,
        blockedAt: Date.now(),
        reason: blkRsn.value.trim() || "অ্যাডমিন কর্তৃক পরীক্ষা সাময়িক স্থগিত"
      }).then(function(){
        toast(t + " ব্লক করা হয়েছে ✓");
        blkInp.value = "";
        blkRsn.value = "";
        refreshBlockedList();
      });
    };
  }

  if(btnUnblk){
    btnUnblk.onclick = function(){
      var t = blkInp.value.trim();
      if(!t) return toast("টার্গেট UID বা রুম কোড লিখুন!");
      db.ref("exam_blocked_targets/" + t).remove().then(function(){
        toast(t + " আনব্লক করা হয়েছে ✓");
        blkInp.value = "";
        refreshBlockedList();
      });
    };
  }
}

function renderAdminResultsUI(m) {
  var card = el("div", "card");
  card.innerHTML = "<h3>🏆 শিক্ষার্থীদের পরীক্ষার ফলাফল ও লিডারবোর্ড রেকর্ড</h3><div id='admin_res_table'>লোড হচ্ছে...</div>";
  m.appendChild(card);

  db.ref("exam_leaderboard").limitToLast(100).once("value").then(function(snap) {
    var cont = document.getElementById("admin_res_table");
    if (!cont) return;
    cont.textContent = "";

    var data = snap.val();
    if (!data) {
      cont.innerHTML = "<p class='mute'>এখনও কোনো পরীক্ষার ফলাফল জমা হয়নি।</p>";
      return;
    }

    var keys = Object.keys(data).reverse();
    cont.appendChild(el("p", "mute", "মোট জমা হওয়া ফলাফল: " + keys.length + " টি"));

    var table = el("table");
    table.style.cssText = "width:100%;border-collapse:collapse;font-size:13.5px;margin-top:10px";
    table.innerHTML = `
      <thead>
        <tr style="background:var(--bg);text-align:left">
          <th style="padding:8px 10px;border-bottom:1px solid var(--line)">শিক্ষার্থীর নাম</th>
          <th style="padding:8px 10px;border-bottom:1px solid var(--line)">Room Name</th>
          <th style="padding:8px 10px;border-bottom:1px solid var(--line)">পরীক্ষার নাম</th>
          <th style="padding:8px 10px;border-bottom:1px solid var(--line)">নম্বর</th>
          <th style="padding:8px 10px;border-bottom:1px solid var(--line)">শতাংশ</th>
          <th style="padding:8px 10px;border-bottom:1px solid var(--line)">সময়</th>
          <th style="padding:8px 10px;border-bottom:1px solid var(--line)">অ্যাকশন</th>
        </tr>
      </thead>
      <tbody id="admin_res_tbody"></tbody>
    `;
    cont.appendChild(table);

    var tbody = document.getElementById("admin_res_tbody");
    keys.forEach(function(k) {
      var r = data[k];
      var tr = el("tr");
      var timeFormatted = r.timeSpentSeconds ? Math.floor(r.timeSpentSeconds / 60) + "মি " + (r.timeSpentSeconds % 60) + "সে" : "--";
      var safeRoom = r.roomName || rn(r.room) || (r.room === "1432014310" ? "Queen Room" : "স্টাডি রুম");

      tr.innerHTML = `
        <td style="padding:8px 10px;border-bottom:1px solid var(--line)"><strong>${r.name || "শিক্ষার্থী"}</strong></td>
        <td style="padding:8px 10px;border-bottom:1px solid var(--line);color:var(--a);font-weight:600">${safeRoom}</td>
        <td style="padding:8px 10px;border-bottom:1px solid var(--line)">${r.examTitle || "মডেল টেস্ট"}</td>
        <td style="padding:8px 10px;border-bottom:1px solid var(--line);font-weight:700;color:${r.penalty ? "var(--danger)" : "var(--a)"}">${r.score}/${r.total} ${r.penalty ? "(শাস্তি: ০)" : ""}</td>
        <td style="padding:8px 10px;border-bottom:1px solid var(--line);font-weight:700">${r.percentage}%</td>
        <td style="padding:8px 10px;border-bottom:1px solid var(--line)">${timeFormatted}</td>
        <td style="padding:8px 10px;border-bottom:1px solid var(--line);white-space:nowrap"></td>
      `;

      var actTd = tr.children[6];
      var editBtn = btn("✏️", "ghost", function() {
        var newScore = prompt("নতুন নম্বর লিখুন (মোট: " + (r.total || 0) + "):", r.score);
        if (newScore === null) return;
        var sNum = Number(newScore) || 0;
        var newPct = Math.round((sNum / (r.total || 1)) * 100);
        db.ref("exam_leaderboard/" + k).update({
          score: sNum,
          percentage: newPct
        }).then(function() {
          toast("ফলাফল আপডেট হয়েছে ✓");
          render();
        });
      });
      editBtn.style.cssText = "padding:3px 8px;font-size:12px;border-radius:6px;margin-right:4px";
      actTd.appendChild(editBtn);

      var delBtn = btn("🗑", "dn", function() {
        if (!confirm("আপনি কি নিশ্চিত যে " + (r.name || "এই শিক্ষার্থীর") + " রেজাল্টটি মুছে ফেলতে চান?")) return;
        db.ref("exam_leaderboard/" + k).remove().then(function() {
          toast("রেজাল্ট মুছে ফেলা হয়েছে ✓");
          render();
        });
      });
      delBtn.style.cssText = "padding:3px 8px;font-size:12px;border-radius:6px";
      actTd.appendChild(delBtn);

      tbody.appendChild(tr);
    });
  }).catch(function() {
    var cont = document.getElementById("admin_res_table");
    if (cont) cont.innerHTML = "<p class='mute'>এখনও কোনো পরীক্ষার ফলাফল জমা হয়নি অথবা ডেটাবেসের সংযোগ অপেক্ষমাণ।</p>";
  });
}

V.exams = function(m) {
  m.appendChild(el("h2", null, "📝 ডায়নামিক এক্সাম ম্যানেজমেন্ট ও কোশ্চেন কন্ট্রোল"));
  m.appendChild(el("p", "mute", "বিষয় ও অধ্যায়ভিত্তিক প্রশ্নব্যাংক আপলোড (JSON), লাইভ পরীক্ষা শিডিউলিং ও লিডারবোর্ড নিয়ন্ত্রণ করুন।"));

  // ৩টি ক্লাস ক্যাটাগরি বাটন
  var catRow = el("div", "row");
  catRow.style.margin = "12px 0 8px 0";
  [
    { id: "HSC", label: "🎓 HSC" },
    { id: "SSC", label: "📖 SSC" },
    { id: "Admission", label: "🎯 Admission" }
  ].forEach(function(c) {
    var b = btn(c.label, activeExamCategory === c.id ? "alt" : "ghost", function() {
      activeExamCategory = c.id;
      selectedSubId = null;
      selectedChapId = null;
      render();
    });
    b.style.cssText = "padding:8px 18px;font-weight:600;font-size:14px;border-radius:10px";
    catRow.appendChild(b);
  });
  m.appendChild(catRow);

  var tabs = el("div", "row");
  tabs.style.margin = "10px 0 14px 0";
  [
    { id: "qbank", label: "📚 বিষয় ও প্রশ্নব্যাংক (JSON)" },
    { id: "schedule", label: "📅 পরীক্ষা শিডিউলিং ও অ্যাসাইন" },
    { id: "results", label: "🏆 এক্সাম ফলাফল ও লিডারবোর্ড" }
  ].forEach(function(tb) {
    var b = btn(tb.label, activeExamTab === tb.id ? "alt" : "ghost", function() {
      activeExamTab = tb.id;
      render();
    });
    b.style.padding = "8px 16px";
    tabs.appendChild(b);
  });
  m.appendChild(tabs);

  if (activeExamTab === "qbank") {
    var qbankArea = el("div");
    qbankArea.id = "admin_qbank_area";
    m.appendChild(qbankArea);

    db.ref("exam_subjects").once("value").then(function(snap) {
      var dbSubs = snap.val();
      var subsList = [];
      if (dbSubs && typeof dbSubs === "object") {
        subsList = Object.keys(dbSubs).map(function(k) {
          return { id: k, ...dbSubs[k] };
        });
      }
      if (!subsList.length) {
        subsList = getDefaultSubs();
        var seedObj = {};
        subsList.forEach(function(s) { seedObj[s.id] = s; });
        db.ref("exam_subjects").update(seedObj).catch(function(){});
      }
      renderQBankView(qbankArea, subsList);
    }).catch(function() {
      renderQBankView(qbankArea, getDefaultSubs());
    });
  } else if (activeExamTab === "schedule") {
    renderSchedulingUI(m);
  } else if (activeExamTab === "results") {
    renderAdminResultsUI(m);
  }
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
  ["motivation","💬 অনুপ্রেরণা"],
  ["exams","📝 এক্সাম কন্ট্রোল"] // <--- নতুন ডায়নামিক এক্সাম ম্যানেজমেন্ট সিস্টেম
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
  sd.appendChild(btn("🔑 পাসওয়ার্ড পরিবর্তন", "ghost", changeAdminPasswordModal));
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

function changeAdminPasswordModal() {
  var oldPass = prompt("বর্তমান অ্যাডমিন পাসওয়ার্ড লিখুন:");
  if (!oldPass) return;
  sha(oldPass).then(function(oldHash) {
    db.ref("admin_config/password_hash").once("value").then(function(snap) {
      var currentHash = snap.val() || PH;
      if (oldHash !== currentHash) {
        return alert("বর্তমান পাসওয়ার্ড সঠিক নয়!");
      }
      var newPass = prompt("নতুন অ্যাডমিন পাসওয়ার্ড লিখুন (কমপক্ষে ৬ অক্ষর):");
      if (!newPass || newPass.trim().length < 6) {
        return alert("নতুন পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে!");
      }
      var confirmPass = prompt("নতুন পাসওয়ার্ডটি পুনরায় লিখুন:");
      if (newPass.trim() !== (confirmPass || "").trim()) {
        return alert("নতুন পাসওয়ার্ড মেলেনি!");
      }
      sha(newPass.trim()).then(function(newHash) {
        db.ref("admin_config/password_hash").set(newHash).then(function() {
          toast("অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে ✓");
          alert("পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! পরবর্তী লগইনে নতুন পাসওয়ার্ড ব্যবহার করুন।");
        }).catch(function(err) {
          alert("পাসওয়ার্ড আপডেট করা যায়নি: " + err.message);
        });
      });
    });
  });
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
      db.ref("admin_config/password_hash").once("value").then(function(snap){
        go.disabled = false;
        var validHash = snap.val() || PH;
        if(e.value.trim() === ADMIN_ID && h === validHash){
          try{ localStorage.setItem("ad-ok","1"); }catch(x){}
          enter();
        } else {
          er.textContent = "ID বা পাসওয়ার্ড ভুল!";
        }
      }).catch(function(){
        go.disabled = false;
        if(e.value.trim() === ADMIN_ID && h === PH){
          try{ localStorage.setItem("ad-ok","1"); }catch(x){}
          enter();
        } else {
          er.textContent = "ID বা পাসওয়ার্ড ভুল!";
        }
      });
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