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

function cleanupLingeringBackdrops() {
  document.querySelectorAll(".admin-modal-backdrop, [data-admin-overlay]").forEach(function(o){
    try {
      o.style.display = "none";
      o.style.pointerEvents = "none";
      o.remove();
    } catch(e){}
  });
  var defModal = $("modal");
  if (defModal && defModal.hidden) {
    defModal.style.display = "none";
    defModal.style.pointerEvents = "none";
  }
}
window.cleanupLingeringBackdrops = cleanupLingeringBackdrops;

function openM(){ 
  var b = $("mbox"); 
  b.textContent = ""; 
  var m = $("modal");
  m.hidden = false; 
  m.style.display = "grid"; 
  m.style.pointerEvents = "auto";
  return b; 
}
function closeM(){ 
  var m = $("modal");
  if (m) {
    m.hidden = true; 
    m.style.display = "none"; 
    m.style.pointerEvents = "none";
  }
  cleanupLingeringBackdrops();
}
$("modal").onclick = function(e){ if(e.target===this) closeM(); };
document.addEventListener("keydown", function(e){ if(e.key==="Escape") { closeM(); cleanupLingeringBackdrops(); if(typeof closeActiveDropdown==="function") closeActiveDropdown(); } });

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

  var uidSearchBtn = btn("🔍 ৫-ডিজিট UID সার্চ", "ghost", function(){
    var targetUID = prompt("যে শিক্ষার্থীর সম্পূর্ণ ডিটেইলস দেখতে চান তার ৫-ডিজিটের UID লিখুন (যেমন: 45821):");
    if(!targetUID) return;
    targetUID = targetUID.trim();
    var found = rows().filter(function(x){ return String(x.uid||"").toLowerCase() === targetUID.toLowerCase(); })[0];
    if(found){
      detail(found.room, found.id);
    } else {
      toast("ডাটাবেসে খোঁজা হচ্ছে...");
      db.ref("numeric_uids/" + targetUID).once("value").then(function(snap){
        var uInfo = snap.val();
        if(uInfo && uInfo.roomId && uInfo.memberId){
          detail(uInfo.roomId, uInfo.memberId);
        } else {
          // Check rooms_v2 directly
          db.ref("rooms_v2").once("value").then(function(rSnap){
            var allRooms = rSnap.val() || {};
            var matchRoom = null, matchMemId = null;
            Object.keys(allRooms).forEach(function(rKey){
              var mems = (allRooms[rKey] && allRooms[rKey].members) || {};
              Object.keys(mems).forEach(function(mKey){
                if(String(mems[mKey].uid || "") === targetUID){
                  matchRoom = rKey;
                  matchMemId = mKey;
                }
              });
            });
            if(matchRoom && matchMemId){
              detail(matchRoom, matchMemId);
            } else {
              alert("এই ৬-ডিজিটের UID (" + targetUID + ") দিয়ে কোনো শিক্ষার্থী খুঁজে পাওয়া যায়নি।");
            }
          });
        }
      }).catch(function(){
        alert("এই ৬-ডিজিটের UID (" + targetUID + ") দিয়ে কোনো শিক্ষার্থী খুঁজে পাওয়া যায়নি।");
      });
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

            var baseCls = r.requestedClass.includes("SSC") ? "SSC" : r.requestedClass.includes("Admission") ? "Admission" : "HSC";
            if(r.room && r.memberId){
              upd["rooms_v2/" + r.room + "/members/" + r.memberId + "/cls"] = r.requestedClass;
              upd["rooms_v2/" + r.room + "/members/" + r.memberId + "/classBase"] = baseCls;
              if(r.room === "1432014310"){
                upd["vip_users/" + r.memberId + "/cls"] = r.requestedClass;
                upd["vip_users/" + r.memberId + "/classBase"] = baseCls;
              }
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
    { id: "gk", category: "HSC", titleBn: "সাধারণ জ্ঞান", titleEn: "General Knowledge", chapters: [{ id: "gk_ch1", num: 1, name: "প্রাচীন বাংলা" }, { id: "gk_ch2", num: 2, name: "মুক্তিযুদ্ধ ও সেক্টর" }] },
    { id: "ict", category: "HSC", titleBn: "তথ্য ও যোগাযোগ প্রযুক্তি", titleEn: "ICT", chapters: [{ id: "ict_ch1", num: 1, name: "বিশ্ব ও বাংলাদেশ প্রেক্ষিত" }, { id: "ict_ch2", num: 2, name: "কমিউনিকেশন সিস্টেমস" }] },
    { id: "bangla1", category: "HSC", titleBn: "বাংলা ১ম", titleEn: "Bangla 1st Paper", chapters: [{ id: "ban1_ch1", num: 1, name: "অপরিচিতা" }, { id: "ban1_ch2", num: 2, name: "বিলাসী" }] },
    { id: "bangla2", category: "HSC", titleBn: "বাংলা ২য়", titleEn: "Bangla 2nd Paper", chapters: [{ id: "ban2_ch1", num: 1, name: "উচ্চারণের নিয়ম" }, { id: "ban2_ch2", num: 2, name: "বানানের নিয়ম" }] }
  ];
}

// চ্যাপ্টার টেস্ট / এক্সাম সেট তৈরি ও এডিটের মডাল
function openTestSetEditorModal(ch, existingSet, onSaved, initialTab) {
  var overlay = el("div", "admin-modal-backdrop");
  overlay.setAttribute("data-admin-overlay", "true");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px";

  var modal = el("div", "card admin-modal-dialog");
  modal.style.cssText = "width:100%;max-width:640px;max-height:92vh;overflow-y:auto;background:var(--card);border:1.5px solid var(--line);border-radius:18px;padding:24px;box-shadow:0 24px 48px rgba(0,0,0,0.65);z-index:1050;position:relative";

  var isEdit = (existingSet !== null && existingSet !== undefined);
  var defTitle = isEdit ? existingSet.title : ("টেস্ট: " + ch.name + " বেসিক টেস্ট");
  var defTag = isEdit ? (existingSet.tag || "মক টেস্ট") : "মক টেস্ট";
  var defDur = isEdit ? (existingSet.durationMinutes || 15) : 15;
  var defDesc = isEdit ? (existingSet.desc || "") : "অধ্যায় রিভিশন ও পূর্ণাঙ্গ এমসিকিউ টেস্ট সেট";
  var defQs = isEdit ? (existingSet.questions || []) : [];
  var activeTab = (initialTab === "json") ? "json" : "form";

  modal.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);padding-bottom:14px;margin-bottom:16px">
      <div>
        <h3 style="margin:0 0 4px;font-size:18px;color:var(--ink)">${isEdit ? "✏️ এক্সাম সেট সম্পাদনা (Edit Exam Set)" : "➕ নতুন এক্সাম সেট তৈরি করুন"}</h3>
        <small class="mute" style="font-size:12px">অধ্যায়: ${ch.name} (চ্যাপ্টার ${ch.num})</small>
      </div>
      <button type="button" id="btn_close_test_modal" style="background:transparent;border:none;color:var(--mute);font-size:26px;cursor:pointer;line-height:1;padding:0 4px">×</button>
    </div>

    <!-- 2-Option Tab Navigation Bar -->
    <div style="display:flex;gap:8px;margin-bottom:16px;background:var(--bg);padding:4px;border-radius:12px;border:1px solid var(--line)">
      <button type="button" id="tab_ts_form" style="flex:1;padding:9px 12px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;border:none;transition:all .2s ease;background:var(--a);color:#fff">
        📝 ১ম অপশন: সাধারণ তথ্য ও সময় (General Edit)
      </button>
      <button type="button" id="tab_ts_json" style="flex:1;padding:9px 12px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;border:none;transition:all .2s ease;background:transparent;color:var(--mute)">
        💻 ২য় অপশন: প্রশ্নব্যাংক JSON (Full JSON Editor)
      </button>
    </div>

    <!-- Tab 1: Form View Panel -->
    <div id="panel_ts_form">
      <div style="margin-bottom:12px">
        <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">এক্সাম সেটের নাম (Exam Title):</label>
        <input type="text" id="ts_input_title" value="${defTitle}" placeholder="যেমন: টেস্ট ১: বেসিক কনসেপ্ট — ${ch.name}" style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit;box-sizing:border-box;background:var(--bg);color:var(--ink)" />
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
        <div>
          <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">ট্যাগ / ক্যাটাগরি:</label>
          <input type="text" id="ts_input_tag" value="${defTag}" placeholder="যেমন: মক টেস্ট, বোর্ড প্রশ্ন" style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit;box-sizing:border-box;background:var(--bg);color:var(--ink)" />
        </div>
        <div>
          <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">পরীক্ষার সময়সীমা (মিনিট):</label>
          <input type="number" id="ts_input_dur" min="1" max="180" value="${defDur}" style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit;box-sizing:border-box;background:var(--bg);color:var(--ink);font-weight:700" />
        </div>
      </div>

      <div style="margin-bottom:12px">
        <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">সংক্ষিপ্ত বিবরণ (ঐচ্ছিক):</label>
        <input type="text" id="ts_input_desc" value="${defDesc}" placeholder="যেমন: পাঠ্যবই ও মূল ধারণার ওপর ভিত্তি করে তৈরি মৌলিক এমসিকিউ সেট" style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit;box-sizing:border-box;background:var(--bg);color:var(--ink)" />
      </div>
    </div>

    <!-- Tab 2: Full JSON Questions Editor Panel -->
    <div id="panel_ts_json" style="display:none">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <label class="mute" style="font-size:13px;font-weight:600">এই সেটের অন্তর্গত প্রশ্নসমূহ (JSON Array):</label>
        <div style="display:flex;gap:6px">
          <button type="button" id="ts_btn_load_sample" style="background:transparent;border:1px solid var(--line);color:var(--a);font-size:11.5px;padding:3px 8px;border-radius:6px;cursor:pointer;font-weight:700">📋 ডেমো প্রশ্ন লোড</button>
          <button type="button" id="ts_btn_format_json" style="background:transparent;border:1px solid var(--line);color:var(--b);font-size:11.5px;padding:3px 8px;border-radius:6px;cursor:pointer">✨ Format</button>
        </div>
      </div>
      <textarea id="ts_input_json" rows="11" placeholder='[\\n  {\\n    "question": "প্রশ্ন এখানে...",\\n    "options": ["ক অপশন", "খ অপশন", "গ অপশন", "ঘ অপশন"],\\n    "correct": 0,\\n    "explanation": "ব্যাখ্যা..."\\n  }\\n]' style="width:100%;font-family:monospace;font-size:12.5px;padding:10px;border-radius:10px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);box-sizing:border-box;line-height:1.4"></textarea>
      <small class="mute" style="font-size:11.5px;display:block;margin-top:4px">টিপস: সম্পূর্ণ সেটের সকল প্রশ্ন এখানে একটি JSON অ্যারেতে পেস্ট বা এডিট করুন।</small>
    </div>

    <div id="ts_modal_err" style="color:var(--danger);font-size:13px;margin-top:8px;min-height:1.2em"></div>

    <div class="row" style="margin-top:16px;display:flex;gap:10px">
      <button type="button" class="btn" id="btn_save_test_set" style="flex:1;padding:12px;border-radius:10px;font-weight:700">${isEdit ? "💾 এক্সাম সেট আপডেট করুন" : "➕ এক্সাম সেট তৈরি করুন"}</button>
      <button type="button" class="btn ghost" id="btn_cancel_test_set" style="flex:1;padding:12px;border-radius:10px;font-weight:600">বাতিল</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  if (defQs.length > 0) {
    document.getElementById("ts_input_json").value = JSON.stringify(defQs, null, 2);
  }

  // Tab switching
  var tabBtnForm = document.getElementById("tab_ts_form");
  var tabBtnJson = document.getElementById("tab_ts_json");
  var panelForm = document.getElementById("panel_ts_form");
  var panelJson = document.getElementById("panel_ts_json");

  tabBtnForm.onclick = function() {
    if (activeTab === "form") return;
    activeTab = "form";
    tabBtnForm.style.background = "var(--a)";
    tabBtnForm.style.color = "#fff";
    tabBtnJson.style.background = "transparent";
    tabBtnJson.style.color = "var(--mute)";
    panelForm.style.display = "block";
    panelJson.style.display = "none";
  };

  tabBtnJson.onclick = function() {
    if (activeTab === "json") return;
    activeTab = "json";
    tabBtnJson.style.background = "var(--a)";
    tabBtnJson.style.color = "#fff";
    tabBtnForm.style.background = "transparent";
    tabBtnForm.style.color = "var(--mute)";
    panelForm.style.display = "none";
    panelJson.style.display = "block";
  };

  if (activeTab === "json") {
    tabBtnForm.style.background = "transparent";
    tabBtnForm.style.color = "var(--mute)";
    tabBtnJson.style.background = "var(--a)";
    tabBtnJson.style.color = "#fff";
    panelForm.style.display = "none";
    panelJson.style.display = "block";
  }

  document.getElementById("ts_btn_format_json").onclick = function() {
    try {
      var p = JSON.parse(document.getElementById("ts_input_json").value);
      document.getElementById("ts_input_json").value = JSON.stringify(p, null, 2);
    } catch(e) {
      alert("ভুল JSON সিনট্যাক্স: " + e.message);
    }
  };

  function closeModal() {
    overlay.style.display = "none";
    overlay.style.pointerEvents = "none";
    overlay.remove();
    document.querySelectorAll(".admin-modal-backdrop").forEach(function(o){
      o.style.display = "none";
      o.remove();
    });
  }
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

    // Save to both exam_chapter_tests and examSets node for seamless data hierarchy
    Promise.all([
      db.ref("exam_chapter_tests/" + ch.id + "/" + testId).set(testObj),
      db.ref("examSets/" + ch.id + "/" + testId).set(testObj)
    ]).then(function() {
      toast(isEdit ? "এক্সাম সেট আপডেট হয়েছে ✓" : "নতুন এক্সাম সেট তৈরি হয়েছে ✓");
      closeModal();
      if (onSaved) onSaved(testObj);
    }).catch(function(err) {
      errEl.textContent = "সেভ ব্যর্থ: " + err.message;
    });
  };
}

// ২-অপশন বিশিষ্ট আধুনিক পপ-আপ মডাল: অপশন ১ (সাধারণ এডিট) এবং অপশন ২ (জেসন কোড এডিট)
function openQuestionEditorModal(ch, existingQ, qIdx, questionsList, onSaved, initialTab) {
  var overlay = el("div", "admin-modal-backdrop");
  overlay.setAttribute("data-admin-overlay", "true");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px";

  var modal = el("div", "card admin-modal-dialog");
  modal.style.cssText = "width:100%;max-width:640px;max-height:92vh;overflow-y:auto;background:var(--card);border:1.5px solid var(--line);border-radius:18px;padding:24px;box-shadow:0 24px 48px rgba(0,0,0,0.65);z-index:1050;position:relative";

  var isEdit = (existingQ !== null && existingQ !== undefined);
  var activeTab = (initialTab === "json") ? "json" : "form"; // "form" or "json"

  // Base state
  var currentQObj = isEdit ? JSON.parse(JSON.stringify(existingQ)) : {
    question: "",
    options: ["", "", "", ""],
    correct: 0,
    explanation: ""
  };
  while ((currentQObj.options || []).length < 4) {
    currentQObj.options.push("");
  }

  modal.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);padding-bottom:14px;margin-bottom:16px">
      <div>
        <h3 style="margin:0 0 4px;font-size:18px;color:var(--ink)">${isEdit ? "✏️ প্রশ্ন সম্পাদনা ও সেটিংস" : "➕ নতুন প্রশ্ন ও সেটিংস"}</h3>
        <small class="mute" style="font-size:12px">অধ্যায়: ${ch.name} (চ্যাপ্টার ${ch.num})</small>
      </div>
      <button type="button" id="btn_close_q_modal" style="background:transparent;border:none;color:var(--mute);font-size:26px;cursor:pointer;line-height:1;padding:0 4px">×</button>
    </div>

    <!-- Duration Setting Box -->
    <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg);border:1.5px solid var(--line);border-radius:12px;padding:10px 14px;margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:18px">⏱</span>
        <div>
          <strong style="font-size:13.5px;color:var(--ink);display:block">পরীক্ষার সময়সীমা (মিনিট)</strong>
          <small class="mute" style="font-size:11.5px">এই অধ্যায়ের পরীক্ষার ডিফল্ট টাইমার নির্ধারণ করুন</small>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <input type="number" id="modal_ch_duration" min="1" max="180" value="15" style="width:65px;padding:6px 8px;border-radius:8px;border:1.5px solid var(--line);font-weight:700;text-align:center;font-size:14px;background:var(--card);color:var(--ink)" />
        <span class="mute" style="font-size:13px;font-weight:600">মিনিট</span>
      </div>
    </div>

    <!-- 2-Option Tab Navigation Bar -->
    <div style="display:flex;gap:8px;margin-bottom:16px;background:var(--bg);padding:4px;border-radius:12px;border:1px solid var(--line)">
      <button type="button" id="tab_btn_form" style="flex:1;padding:9px 12px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;border:none;transition:all .2s ease;background:var(--a);color:#fff">
        📝 ১ম অপশন: সাধারণ এডিট (Form View)
      </button>
      <button type="button" id="tab_btn_json" style="flex:1;padding:9px 12px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;border:none;transition:all .2s ease;background:transparent;color:var(--mute)">
        💻 ২য় অপশন: জেসন কোড এডিট (JSON Editor)
      </button>
    </div>

    <!-- Tab 1: Form View Panel -->
    <div id="panel_form_view">
      <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:6px">প্রশ্নের বিবরণ (Question Title):</label>
      <textarea id="q_input_text" rows="3" placeholder="প্রশ্ন এখানে লিখুন..." style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);font-size:14px;box-sizing:border-box;margin-bottom:14px;font:inherit;background:var(--bg);color:var(--ink)"></textarea>

      <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:8px">৪টি অপশন (ক, খ, গ, ঘ):</label>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:800;color:var(--a);width:26px;text-align:center">ক)</span>
          <input type="text" id="q_opt_0" placeholder="প্রথম অপশন" style="flex:1;padding:9px 12px;border-radius:8px;border:1.5px solid var(--line);font:inherit;background:var(--bg);color:var(--ink)" />
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:800;color:var(--a);width:26px;text-align:center">খ)</span>
          <input type="text" id="q_opt_1" placeholder="দ্বিতীয় অপশন" style="flex:1;padding:9px 12px;border-radius:8px;border:1.5px solid var(--line);font:inherit;background:var(--bg);color:var(--ink)" />
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:800;color:var(--a);width:26px;text-align:center">গ)</span>
          <input type="text" id="q_opt_2" placeholder="তৃতীয় অপশন" style="flex:1;padding:9px 12px;border-radius:8px;border:1.5px solid var(--line);font:inherit;background:var(--bg);color:var(--ink)" />
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:800;color:var(--a);width:26px;text-align:center">ঘ)</span>
          <input type="text" id="q_opt_3" placeholder="চতুর্থ অপশন" style="flex:1;padding:9px 12px;border-radius:8px;border:1.5px solid var(--line);font:inherit;background:var(--bg);color:var(--ink)" />
        </div>
      </div>

      <div style="margin-bottom:14px">
        <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:6px">সঠিক উত্তর নির্বাচন করুন (Correct Answer):</label>
        <select id="q_input_correct" style="width:100%;padding:10px 12px;border-radius:8px;border:1.5px solid var(--line);font:inherit;font-weight:600;background:var(--bg);color:var(--ink)">
          <option value="0">ক (প্রথম অপশন)</option>
          <option value="1">খ (দ্বিতীয় অপশন)</option>
          <option value="2">গ (তৃতীয় অপশন)</option>
          <option value="3">ঘ (চতুর্থ অপশন)</option>
        </select>
      </div>

      <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:6px">উত্তরের ব্যাখ্যা / সল্যুশন (ঐচ্ছিক):</label>
      <input type="text" id="q_input_exp" placeholder="যেমন: এই সূত্রের মূল কারণ হলো..." style="width:100%;padding:10px 12px;border-radius:8px;border:1.5px solid var(--line);font:inherit;box-sizing:border-box;background:var(--bg);color:var(--ink)" />
    </div>

    <!-- Tab 2: Full JSON Editor Panel -->
    <div id="panel_json_view" style="display:none">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <label class="mute" style="font-size:13px;font-weight:600">প্রশ্নের সম্পূর্ণ JSON কোড:</label>
        <button type="button" id="btn_format_json" style="background:transparent;border:1px solid var(--line);color:var(--a);font-size:11.5px;padding:3px 8px;border-radius:6px;cursor:pointer">✨ Format JSON</button>
      </div>
      <textarea id="q_json_code" rows="11" placeholder="{\n  &quot;question&quot;: &quot;...&quot;,\n  &quot;options&quot;: [&quot;ক&quot;, &quot;খ&quot;, &quot;গ&quot;, &quot;ঘ&quot;],\n  &quot;correct&quot;: 0,\n  &quot;explanation&quot;: &quot;...&quot;\n}" style="width:100%;padding:12px;border-radius:10px;border:1.5px solid var(--line);font-family:monospace;font-size:13px;box-sizing:border-box;background:var(--bg);color:var(--ink);line-height:1.4"></textarea>
      <small class="mute" style="font-size:11.5px;display:block;margin-top:4px">টিপস: আপনি সরাসরি সম্পূর্ণ অবজেক্টটি কপি-পেস্ট বা সম্পাদনা করতে পারবেন।</small>
    </div>

    <div id="q_modal_err" style="color:var(--danger);font-size:13px;margin-top:10px;min-height:1.2em"></div>

    <div class="row" style="margin-top:18px;display:flex;gap:10px">
      <button type="button" class="btn" id="btn_save_q_item" style="flex:1;padding:12px;border-radius:10px;font-weight:700">${isEdit ? "💾 পরিবর্তন সংরক্ষণ করুন" : "➕ নতুন প্রশ্ন যোগ করুন"}</button>
      <button type="button" class="btn ghost" id="btn_cancel_q_item" style="flex:1;padding:12px;border-radius:10px;font-weight:600">বাতিল</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Load duration from DB
  var durInput = document.getElementById("modal_ch_duration");
  db.ref("exam_chapter_durations/" + ch.id).once("value").then(function(dSnap){
    if (dSnap.val()) durInput.value = dSnap.val();
  }).catch(function(){});

  // Populate Form
  document.getElementById("q_input_text").value = currentQObj.question || "";
  var opts = currentQObj.options || [];
  if (opts[0] !== undefined) document.getElementById("q_opt_0").value = opts[0];
  if (opts[1] !== undefined) document.getElementById("q_opt_1").value = opts[1];
  if (opts[2] !== undefined) document.getElementById("q_opt_2").value = opts[2];
  if (opts[3] !== undefined) document.getElementById("q_opt_3").value = opts[3];
  document.getElementById("q_input_correct").value = String(currentQObj.correct || 0);
  document.getElementById("q_input_exp").value = currentQObj.explanation || "";

  // Populate JSON
  document.getElementById("q_json_code").value = JSON.stringify(currentQObj, null, 2);

  // Tab switching logic
  var btnFormTab = document.getElementById("tab_btn_form");
  var btnJsonTab = document.getElementById("tab_btn_json");
  var panelForm = document.getElementById("panel_form_view");
  var panelJson = document.getElementById("panel_json_view");

  function getFormQObject() {
    var o0 = document.getElementById("q_opt_0").value.trim();
    var o1 = document.getElementById("q_opt_1").value.trim();
    var o2 = document.getElementById("q_opt_2").value.trim();
    var o3 = document.getElementById("q_opt_3").value.trim();
    var options = [o0, o1];
    if (o2) options.push(o2);
    if (o3) options.push(o3);
    var cor = parseInt(document.getElementById("q_input_correct").value, 10) || 0;
    if (cor >= options.length) cor = 0;
    return {
      question: document.getElementById("q_input_text").value.trim(),
      options: options,
      correct: cor,
      explanation: document.getElementById("q_input_exp").value.trim()
    };
  }

  function applyQObjectToForm(obj) {
    if (!obj) return;
    document.getElementById("q_input_text").value = obj.question || "";
    var op = obj.options || [];
    document.getElementById("q_opt_0").value = op[0] || "";
    document.getElementById("q_opt_1").value = op[1] || "";
    document.getElementById("q_opt_2").value = op[2] || "";
    document.getElementById("q_opt_3").value = op[3] || "";
    document.getElementById("q_input_correct").value = String(obj.correct || 0);
    document.getElementById("q_input_exp").value = obj.explanation || "";
  }

  btnFormTab.onclick = function() {
    if (activeTab === "form") return;
    // Sync JSON back to Form
    try {
      var parsed = JSON.parse(document.getElementById("q_json_code").value);
      applyQObjectToForm(parsed);
    } catch(e) {}
    activeTab = "form";
    btnFormTab.style.background = "var(--a)";
    btnFormTab.style.color = "#fff";
    btnJsonTab.style.background = "transparent";
    btnJsonTab.style.color = "var(--mute)";
    panelForm.style.display = "block";
    panelJson.style.display = "none";
  };

  btnJsonTab.onclick = function() {
    if (activeTab === "json") return;
    // Sync Form into JSON
    var curObj = getFormQObject();
    document.getElementById("q_json_code").value = JSON.stringify(curObj, null, 2);
    activeTab = "json";
    btnJsonTab.style.background = "var(--a)";
    btnJsonTab.style.color = "#fff";
    btnFormTab.style.background = "transparent";
    btnFormTab.style.color = "var(--mute)";
    panelForm.style.display = "none";
    panelJson.style.display = "block";
  };

  if (activeTab === "json") {
    btnFormTab.style.background = "transparent";
    btnFormTab.style.color = "var(--mute)";
    btnJsonTab.style.background = "var(--a)";
    btnJsonTab.style.color = "#fff";
    panelForm.style.display = "none";
    panelJson.style.display = "block";
  }

  document.getElementById("btn_format_json").onclick = function() {
    try {
      var p = JSON.parse(document.getElementById("q_json_code").value);
      document.getElementById("q_json_code").value = JSON.stringify(p, null, 2);
    } catch(e) {
      alert("ভুল JSON সিনট্যাক্স: " + e.message);
    }
  };

  function closeModal() {
    overlay.style.display = "none";
    overlay.style.pointerEvents = "none";
    overlay.remove();
    document.querySelectorAll(".admin-modal-backdrop").forEach(function(o){
      o.style.display = "none";
      o.remove();
    });
  }
  document.getElementById("btn_close_q_modal").onclick = closeModal;
  document.getElementById("btn_cancel_q_item").onclick = closeModal;
  overlay.onclick = function(e){ if (e.target === overlay) closeModal(); };

  document.getElementById("btn_save_q_item").onclick = function() {
    var errEl = document.getElementById("q_modal_err");
    errEl.textContent = "";

    var finalObj = null;
    if (activeTab === "json") {
      try {
        finalObj = JSON.parse(document.getElementById("q_json_code").value);
        if (!finalObj.question || !Array.isArray(finalObj.options) || finalObj.options.length < 2) {
          errEl.textContent = "JSON অবজেক্টে অবশ্যই 'question' এবং কমপক্ষে ২টি 'options' থাকতে হবে।";
          return;
        }
      } catch(e) {
        errEl.textContent = "JSON কোডে সিনট্যাক্স ভুল: " + e.message;
        return;
      }
    } else {
      finalObj = getFormQObject();
      if (!finalObj.question) { errEl.textContent = "প্রশ্নের বিবরণ লিখুন।"; return; }
      if (!finalObj.options[0] || !finalObj.options[1]) { errEl.textContent = "কমপক্ষে ২টি অপশন (ক ও খ) পূরণ করুন।"; return; }
    }

    // Save duration if changed
    var durVal = Number(durInput.value) || 15;
    db.ref("exam_chapter_durations/" + ch.id).set(durVal).catch(function(){});

    var updatedList = (questionsList || []).slice();
    if (isEdit) {
      updatedList[qIdx] = finalObj;
    } else {
      updatedList.push(finalObj);
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

    // Action Buttons
    var rightActions = el("div");
    rightActions.style.cssText = "display:flex;align-items:center;gap:8px;flex-wrap:wrap";

    var addTestBtn = btn("➕ নতুন টেস্ট সেট যোগ করুন", null, function(){
      openTestSetEditorModal(ch, null, function(){
        loadAndRenderExamSets();
      });
    });
    addTestBtn.style.cssText = "padding:7px 15px;border-radius:9px;font-weight:700;font-size:13px;background:#34d399;color:#064e3b;border:none;box-shadow:0 2px 8px rgba(52,211,153,0.35);cursor:pointer";
    rightActions.appendChild(addTestBtn);

    topBar.appendChild(rightActions);
    qCard.appendChild(topBar);

    // Section: Exam Sets Container (Option 2 Modern Glass Cards)
    var listContainer = el("div");
    listContainer.id = "admin_exam_sets_container";
    qCard.appendChild(listContainer);

    // ১. Set Name Edit Modal
    function openSetNameEditModal(ch, ts, onSaved) {
      var overlay = el("div", "admin-modal-backdrop");
      overlay.setAttribute("data-admin-overlay", "true");
      overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px";
      var m = el("div", "card admin-modal-dialog");
      m.style.cssText = "width:100%;max-width:480px;background:var(--card);border:1.5px solid var(--line);border-radius:16px;padding:22px;box-shadow:0 20px 45px rgba(0,0,0,0.6);z-index:1050;position:relative";
      m.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid var(--line);padding-bottom:10px">
          <h3 style="margin:0;font-size:17px;color:var(--ink)">✏️ Set Name Edit (সেটের নাম পরিবর্তন)</h3>
          <button type="button" id="btn_close_name_modal" style="background:transparent;border:none;color:var(--mute);font-size:20px;cursor:pointer">✕</button>
        </div>
        <div style="margin-bottom:14px">
          <label class="mute" style="font-size:13px;display:block;margin-bottom:6px">এক্সাম সেটের বর্তমান নাম:</label>
          <input type="text" id="set_name_input" value="${ts.title || ''}" placeholder="যেমন: সেট ১, মডেল টেস্ট ৩" style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit;background:var(--bg);color:var(--ink);box-sizing:border-box" />
          <div id="set_name_err" style="color:var(--danger);font-size:12.5px;margin-top:6px;min-height:1.2em"></div>
        </div>
        <div class="row" style="display:flex;gap:10px;margin-top:16px">
          <button type="button" class="btn" id="btn_save_set_name" style="flex:1;padding:11px;border-radius:10px">💾 সেভ করুন</button>
          <button type="button" class="btn ghost" id="btn_cancel_set_name" style="flex:1;padding:11px;border-radius:10px">বাতিল</button>
        </div>
      `;
      overlay.appendChild(m);
      document.body.appendChild(overlay);
      var inp = m.querySelector("#set_name_input");
      var er = m.querySelector("#set_name_err");
      setTimeout(function(){ if(inp) inp.focus(); }, 50);
      function close() {
        overlay.style.display = "none";
        overlay.style.pointerEvents = "none";
        overlay.remove();
        document.querySelectorAll(".admin-modal-backdrop").forEach(function(o){
          o.style.display = "none";
          o.remove();
        });
      }
      m.querySelector("#btn_close_name_modal").onclick = close;
      m.querySelector("#btn_cancel_set_name").onclick = close;
      overlay.onclick = function(e){ if(e.target === overlay) close(); };
      m.querySelector("#btn_save_set_name").onclick = function(){
        var val = inp.value.trim();
        if(!val){ er.textContent = "সেটের একটি নাম লিখুন।"; return; }
        var updatePayload = {
          title: val,
          updatedAt: Date.now()
        };
        var p1 = db.ref("exam_chapter_tests/" + ch.id + "/" + ts.id).update(updatePayload);
        var p2 = db.ref("examSets/" + ch.id + "/" + ts.id).update(updatePayload);
        var p3 = db.ref("examSets/" + ts.id).update(updatePayload).catch(function(){});
        Promise.all([p1, p2, p3]).then(function(){
          ts.title = val;
          toast("সেটের নাম পরিবর্তিত হয়েছে ✓");
          close();
          if(onSaved) onSaved();
        }).catch(function(err){
          console.warn("Set name update fallback:", err);
          db.ref("exam_chapter_tests/" + ch.id + "/" + ts.id + "/title").set(val);
          db.ref("examSets/" + ch.id + "/" + ts.id + "/title").set(val);
          ts.title = val;
          toast("সেটের নাম পরিবর্তিত হয়েছে ✓");
          close();
          if(onSaved) onSaved();
        });
      };
    }

    // ২. Time Edit Modal (with timeLimit update & auth fallback - Point 1)
    function openTimeEditModal(ch, ts, onSaved) {
      var overlay = el("div", "admin-modal-backdrop");
      overlay.setAttribute("data-admin-overlay", "true");
      overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px";
      var m = el("div", "card admin-modal-dialog");
      m.style.cssText = "width:100%;max-width:480px;background:var(--card);border:1.5px solid var(--line);border-radius:16px;padding:22px;box-shadow:0 20px 45px rgba(0,0,0,0.6);z-index:1050;position:relative";
      var curDur = ts.durationMinutes || ts.timeLimit || 15;
      m.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid var(--line);padding-bottom:10px">
          <h3 style="margin:0;font-size:17px;color:var(--ink)">⏱️ Time Edit (সময়সীমা পরিবর্তন)</h3>
          <button type="button" id="btn_close_time_modal" style="background:transparent;border:none;color:var(--mute);font-size:20px;cursor:pointer">✕</button>
        </div>
        <div style="margin-bottom:12px">
          <label class="mute" style="font-size:13px;display:block;margin-bottom:6px">দ্রুত নির্বাচন করুন (ক্লিক করুন):</label>
          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:8px;margin-bottom:12px" id="time_presets_row">
            <button type="button" class="btn ghost time-preset-btn" data-dur="10">১০ মি.</button>
            <button type="button" class="btn ghost time-preset-btn" data-dur="15">১৫ মি.</button>
            <button type="button" class="btn ghost time-preset-btn" data-dur="20">২০ মি.</button>
            <button type="button" class="btn ghost time-preset-btn" data-dur="25">২৫ মি.</button>
            <button type="button" class="btn ghost time-preset-btn" data-dur="30">৩০ মি.</button>
            <button type="button" class="btn ghost time-preset-btn" data-dur="40">৪০ মি.</button>
            <button type="button" class="btn ghost time-preset-btn" data-dur="50">৫০ মি.</button>
            <button type="button" class="btn ghost time-preset-btn" data-dur="60">৬০ মি.</button>
          </div>
          <label class="mute" style="font-size:13px;display:block;margin-bottom:6px">অথবা নির্দিষ্ট মিনিট লিখুন:</label>
          <input type="number" id="set_time_input" min="1" max="180" value="${curDur}" style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit;background:var(--bg);color:var(--ink);font-weight:700;font-size:16px;box-sizing:border-box" />
          <div id="set_time_err" style="color:var(--danger);font-size:12.5px;margin-top:6px;min-height:1.2em"></div>
        </div>
        <div class="row" style="display:flex;gap:10px;margin-top:16px">
          <button type="button" class="btn" id="btn_save_set_time" style="flex:1;padding:11px;border-radius:10px">💾 সময় সেট করুন</button>
          <button type="button" class="btn ghost" id="btn_cancel_set_time" style="flex:1;padding:11px;border-radius:10px">বাতিল</button>
        </div>
      `;
      overlay.appendChild(m);
      document.body.appendChild(overlay);
      var inp = m.querySelector("#set_time_input");
      var er = m.querySelector("#set_time_err");
      m.querySelectorAll(".time-preset-btn").forEach(function(b){
        b.onclick = function(){
          inp.value = b.getAttribute("data-dur");
        };
      });
      function close() {
        overlay.style.display = "none";
        overlay.style.pointerEvents = "none";
        overlay.remove();
        cleanupLingeringBackdrops();
      }
      m.querySelector("#btn_close_time_modal").onclick = close;
      m.querySelector("#btn_cancel_set_time").onclick = close;
      overlay.onclick = function(e){ if(e.target === overlay) close(); };
      m.querySelector("#btn_save_set_time").onclick = function(){
        var val = parseInt(inp.value, 10);
        if(!val || val < 1 || val > 180){ er.textContent = "সঠিক মিনিট লিখুন (১ থেকে ১৮০)।"; return; }

        var btnSave = m.querySelector("#btn_save_set_time");
        if(btnSave) {
          btnSave.disabled = true;
          btnSave.textContent = "⏳ সেভ হচ্ছে...";
        }

        var updatePayload = {
          timeLimit: val,
          durationMinutes: val,
          updatedAt: Date.now()
        };

        function doSave() {
          var p1 = db.ref("exam_chapter_tests/" + ch.id + "/" + ts.id).update(updatePayload);
          var p2 = db.ref("examSets/" + ch.id + "/" + ts.id).update(updatePayload);
          var p3 = db.ref("examSets/" + ts.id).update(updatePayload).catch(function(){});
          var p4 = db.ref("exam_chapter_durations/" + ch.id).set(val).catch(function(){});

          Promise.all([p1, p2, p3, p4]).then(function(){
            ts.timeLimit = val;
            ts.durationMinutes = val;
            toast("সময়সীমা " + val + " মিনিটে পরিবর্তিত হয়েছে ✓");
            close();
            if(onSaved) onSaved();
          }).catch(function(err){
            console.warn("Time edit update fallback:", err);
            var directPayload = {};
            directPayload["exam_chapter_tests/" + ch.id + "/" + ts.id + "/timeLimit"] = val;
            directPayload["exam_chapter_tests/" + ch.id + "/" + ts.id + "/durationMinutes"] = val;
            directPayload["examSets/" + ch.id + "/" + ts.id + "/timeLimit"] = val;
            directPayload["examSets/" + ch.id + "/" + ts.id + "/durationMinutes"] = val;
            db.ref().update(directPayload).then(function(){
              ts.timeLimit = val;
              ts.durationMinutes = val;
              toast("সময়সীমা " + val + " মিনিটে পরিবর্তিত হয়েছে ✓");
              close();
              if(onSaved) onSaved();
            }).catch(function(finalErr){
              if(btnSave) {
                btnSave.disabled = false;
                btnSave.textContent = "💾 সময় সেট করুন";
              }
              er.textContent = "ত্রুটি: " + (finalErr.message || finalErr);
            });
          });
        }

        if (window.firebase && firebase.auth && !firebase.auth().currentUser) {
          firebase.auth().signInAnonymously().then(doSave).catch(doSave);
        } else {
          doSave();
        }
      };
    }

    // ৩. Individual Qn Edit Modal (Question Manager)
    function openIndividualQuestionManagerModal(ch, ts, onSaved) {
      var overlay = el("div", "admin-modal-backdrop");
      overlay.setAttribute("data-admin-overlay", "true");
      overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px";
      
      var modal = el("div", "card admin-modal-dialog");
      modal.style.cssText = "width:100%;max-width:740px;max-height:92vh;overflow-y:auto;background:var(--card);border:1.5px solid var(--line);border-radius:18px;padding:24px;box-shadow:0 24px 50px rgba(0,0,0,0.7);z-index:1050;position:relative";
      
      function renderManager() {
        var questions = ts.questions || [];
        modal.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);padding-bottom:14px;margin-bottom:16px;flex-wrap:wrap;gap:10px">
            <div>
              <h3 style="margin:0 0 4px;font-size:18px;color:var(--ink)">📝 ${ts.title}</h3>
              <p class="mute" style="margin:0;font-size:13px">একক প্রশ্ন সম্পাদনা ও ব্যবস্থাপনা (মোট ${questions.length}টি প্রশ্ন)</p>
            </div>
            <div style="display:flex;gap:8px">
              <button type="button" class="btn" id="btn_modal_add_single_q" style="padding:7px 14px;font-size:12.5px;border-radius:10px;background:#10b981;color:#fff;border:none;font-weight:700">➕ নতুন প্রশ্ন যোগ করুন</button>
              <button type="button" id="btn_modal_close_iqm" style="background:transparent;border:none;color:var(--mute);font-size:22px;cursor:pointer">✕</button>
            </div>
          </div>
          <div id="iqm_questions_list" style="display:flex;flex-direction:column;gap:12px;max-height:60vh;overflow-y:auto;padding-right:4px">
            ${questions.length === 0 ? '<p class="mute" style="text-align:center;padding:30px">এই সেটে এখনও কোনো প্রশ্ন নেই। উপরে "➕ নতুন প্রশ্ন যোগ করুন" বাটনে চাপুন।</p>' : ''}
          </div>
          <div style="margin-top:16px;border-top:1px solid var(--line);padding-top:12px;display:flex;justify-content:flex-end">
            <button type="button" class="btn ghost" id="btn_iqm_done" style="padding:8px 20px;border-radius:10px">সম্পন্ন ✓</button>
          </div>
        `;

        var listEl = modal.querySelector("#iqm_questions_list");
        questions.forEach(function(q, qIdx) {
          var item = el("div");
          item.style.cssText = "background:rgba(255,255,255,0.04);border:1px solid var(--line);border-radius:12px;padding:14px 16px;display:flex;justify-content:space-between;align-items:flex-start;gap:14px";
          
          var letters = ["(ক)", "(খ)", "(গ)", "(ঘ)", "(ঙ)"];
          var optionsHTML = (q.options || []).map(function(opt, oIdx) {
            var isCor = (q.correct === oIdx);
            return `<div style="font-size:13px;color:${isCor ? '#34d399' : 'var(--mute)'};font-weight:${isCor ? '700' : '500'};margin-top:3px">${letters[oIdx] || ''} ${opt} ${isCor ? '✓ (সঠিক উত্তর)' : ''}</div>`;
          }).join('');

          item.innerHTML = `
            <div style="flex:1;min-width:0">
              <div style="font-size:14.5px;font-weight:700;color:var(--ink);margin-bottom:6px">
                <span style="color:var(--a);margin-right:6px">প্রশ্ন ${qIdx + 1}:</span> ${q.question || 'প্রশ্ন উল্লেখ নেই'}
              </div>
              <div style="margin-left:14px">${optionsHTML}</div>
              ${q.explanation ? `<small style="display:block;margin-top:6px;margin-left:14px;color:#94a3b8;font-style:italic">ব্যাখ্যা: ${q.explanation}</small>` : ''}
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
              <button type="button" class="btn ghost btn-iqm-edit" data-idx="${qIdx}" style="padding:4px 10px;font-size:12px;border-radius:8px">✏️ এডিট</button>
              <button type="button" class="btn dn btn-iqm-del" data-idx="${qIdx}" style="padding:4px 10px;font-size:12px;border-radius:8px">🗑️ মুছুন</button>
            </div>
          `;
          listEl.appendChild(item);
        });

        modal.querySelectorAll(".btn-iqm-edit").forEach(function(btnEl) {
          btnEl.onclick = function() {
            var idx = parseInt(btnEl.getAttribute("data-idx"), 10);
            openQuestionEditorModal(ch, questions[idx], idx, questions, function(savedQ) {
              questions[idx] = savedQ;
              saveQuestionsToDB();
            });
          };
        });

        modal.querySelectorAll(".btn-iqm-del").forEach(function(btnEl) {
          btnEl.onclick = function() {
            var idx = parseInt(btnEl.getAttribute("data-idx"), 10);
            if (!confirm("আপনি কি নিশ্চিতভাবে এই প্রশ্নটি মুছে ফেলতে চান?")) return;
            questions.splice(idx, 1);
            saveQuestionsToDB();
          };
        });

        modal.querySelector("#btn_modal_add_single_q").onclick = function() {
          openQuestionEditorModal(ch, null, -1, questions, function(newQ) {
            questions.push(newQ);
            saveQuestionsToDB();
          });
        };

        function close() {
          overlay.style.display = "none";
          overlay.style.pointerEvents = "none";
          overlay.remove();
          document.querySelectorAll(".admin-modal-backdrop").forEach(function(o){
            o.style.display = "none";
            o.remove();
          });
        }
        modal.querySelector("#btn_modal_close_iqm").onclick = close;
        modal.querySelector("#btn_iqm_done").onclick = close;
        overlay.onclick = function(e) { if (e.target === overlay) close(); };
      }

      function saveQuestionsToDB() {
        ts.questions = ts.questions || [];
        ts.qCount = ts.questions.length;
        Promise.all([
          db.ref("exam_chapter_tests/" + ch.id + "/" + ts.id + "/questions").set(ts.questions),
          db.ref("exam_chapter_tests/" + ch.id + "/" + ts.id + "/qCount").set(ts.questions.length),
          db.ref("examSets/" + ch.id + "/" + ts.id + "/questions").set(ts.questions),
          db.ref("examSets/" + ch.id + "/" + ts.id + "/qCount").set(ts.questions.length)
        ]).then(function() {
          toast("প্রশ্ন সংরক্ষিত হয়েছে ✓");
          renderManager();
          if (onSaved) onSaved();
        }).catch(function(err) {
          toast("ত্রুটি: " + err.message);
        });
      }

      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      renderManager();
    }

    function loadAndRenderExamSets() {
      listContainer.innerHTML = "<p class='mute' style='text-align:center;padding:24px'>এক্সাম সেট লোড হচ্ছে...</p>";
      Promise.all([
        db.ref("exam_chapter_tests/" + ch.id).once("value").catch(function(){ return { val: function(){ return null; } }; }),
        db.ref("examSets/" + ch.id).once("value").catch(function(){ return { val: function(){ return null; } }; }),
        db.ref("exam_questions/" + ch.id).once("value").catch(function(){ return { val: function(){ return []; } }; })
      ]).then(function(snaps){
        var val1 = snaps[0].val() || {};
        var val2 = snaps[1].val() || {};
        var legacyQs = snaps[2].val() || [];
        var merged = Object.assign({}, val1, val2);

        var sets = [];
        if (merged && typeof merged === "object") {
          sets = Object.keys(merged)
            .filter(function(k){ return k !== "_initialized" && merged[k] && typeof merged[k] === "object" && merged[k].title; })
            .map(function(k){ return { id: k, ...merged[k] }; });
        }

        // If no exam sets exist yet, initialize default presets so students and admins have instant sets
        var isChapterInitialized = (merged && merged._initialized) || sessionStorage.getItem('ch_deleted_' + ch.id);
        if (!sets.length && !isChapterInitialized) {
          var defaultPresets = [
            {
              id: "test_" + ch.id + "_basic",
              title: "অধ্যায়ভিত্তিক বেসিক টেস্ট — " + ch.name,
              tag: "মৌলিক ধারণা",
              durationMinutes: 15,
              desc: "পাঠ্যবই ও মূল ধারণার ওপর ভিত্তি করে তৈরি মৌলিক এমসিকিউ সেট",
              questions: Array.isArray(legacyQs) && legacyQs.length ? legacyQs : [],
              qCount: Array.isArray(legacyQs) && legacyQs.length ? legacyQs.length : 10
            },
            {
              id: "test_" + ch.id + "_special",
              title: "চ্যাপ্টার স্পেশাল মডেল টেস্ট — " + ch.name,
              tag: "মক টেস্ট",
              durationMinutes: 20,
              desc: "স্ট্যান্ডার্ড টাইমিং ও পূর্ণাঙ্গ চ্যাপ্টার রিভিশন টেস্ট",
              questions: Array.isArray(legacyQs) && legacyQs.length ? legacyQs : [],
              qCount: Array.isArray(legacyQs) && legacyQs.length ? legacyQs.length : 20
            },
            {
              id: "test_" + ch.id + "_board",
              title: "বিগত বছরের বোর্ড ও ভর্তি প্রশ্ন — " + ch.name,
              tag: "প্রিভিয়াস ইয়ার্স",
              durationMinutes: 15,
              desc: "বিগত বিভিন্ন বোর্ড ও ভর্তি পরীক্ষায় আসা শীর্ষ প্রশ্নাবলী",
              questions: Array.isArray(legacyQs) && legacyQs.length ? legacyQs : [],
              qCount: Array.isArray(legacyQs) && legacyQs.length ? legacyQs.length : 15
            }
          ];
          var seedObj = { _initialized: true };
          defaultPresets.forEach(function(p){ seedObj[p.id] = p; });
          db.ref("exam_chapter_tests/" + ch.id).update(seedObj).catch(function(){});
          db.ref("examSets/" + ch.id).update(seedObj).catch(function(){});
          sets = defaultPresets;
        }

        renderExamSetCards(sets);
      }).catch(function(){
        renderExamSetCards([]);
      });
    }

    function renderExamSetCards(setList) {
      listContainer.textContent = "";
      if (!setList || !setList.length) {
        listContainer.innerHTML = `
          <div style="text-align:center;padding:40px 16px;background:rgba(30,41,59,0.5);border-radius:14px;border:1.5px dashed rgba(255,255,255,0.12);margin-top:10px">
            <div style="font-size:32px;margin-bottom:8px">📚</div>
            <h4 style="margin:0 0 6px;font-size:16px;color:#f8fafc">এই অধ্যায়ে এখনও কোনো এক্সাম সেট যোগ করা হয়নি</h4>
            <p class="mute" style="font-size:13px;margin:0 0 16px;color:#94a3b8">উপরের '➕ নতুন টেস্ট সেট যোগ করুন' বাটনে চাপ দিয়ে প্রথম এক্সাম সেট তৈরি করুন।</p>
          </div>
        `;
        return;
      }

      var statsBar = el("div");
      statsBar.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:10px 16px;margin-bottom:14px;border-radius:12px;background:rgba(30,41,59,0.7);border:1px solid rgba(255,255,255,0.08);font-size:13px;color:#94a3b8";
      statsBar.innerHTML = "<span>মোট সক্রিয় এক্সাম সেট: <strong style='color:#f8fafc'>" + bn(setList.length) + "টি</strong></span><span style='color:#38bdf8;font-weight:700'>Option 2: Modern Glass Cards (Exam Sets)</span>";
      listContainer.appendChild(statsBar);

      // Question Cards List (Exam Sets)
      var qListContainer = el("div");
      qListContainer.style.cssText = "display:flex;flex-direction:column;overflow:visible;position:relative";

      // Global click listener to close open dropdown
      var activeOpenDropdown = null;
      var activeOpenCard = null;
      function closeActiveDropdown() {
        if (activeOpenDropdown) {
          activeOpenDropdown.remove();
          activeOpenDropdown = null;
        }
        if (activeOpenCard) {
          activeOpenCard.classList.remove("dropdown-active");
          activeOpenCard.style.zIndex = "";
          activeOpenCard = null;
        }
        cleanupLingeringBackdrops();
      }
      document.addEventListener("click", function(e) {
        if (!e.target.closest(".q-glass-actions-col")) {
          closeActiveDropdown();
        }
      });

      setList.forEach(function(ts, idx){
        var card = el("div", "q-glass-card");
        card.style.cssText = "position:relative;overflow:visible";

        // Left info column (Title & Subtitle with Questions & Duration)
        var leftCol = el("div");
        leftCol.style.cssText = "flex:1;min-width:0";

        var qTitle = el("div", "q-glass-title");
        qTitle.textContent = ts.title;
        leftCol.appendChild(qTitle);

        var qNum = (ts.questions && Array.isArray(ts.questions)) ? ts.questions.length : (ts.qCount || 0);
        var dur = ts.durationMinutes || ts.timeLimit || 15;

        var timeBadge = el("div", "q-glass-time-badge");
        timeBadge.innerHTML = "মোট প্রশ্ন: " + bn(qNum) + "টি &nbsp;·&nbsp; সময়: " + bn(dur) + " মিনিট";
        leftCol.appendChild(timeBadge);

        card.appendChild(leftCol);

        // Right actions column (Edit on top, Remove underneath, matching image_f232fbf4.png)
        var actionsCol = el("div", "q-glass-actions-col");
        actionsCol.style.cssText = "position:relative;overflow:visible;z-index:9999";

        // Yellow Edit Button
        var editBtn = el("button", "btn-glass-edit");
        editBtn.type = "button";
        editBtn.innerHTML = "✏️ এডিট";
        actionsCol.appendChild(editBtn);

        // Red Remove Button with Firebase remove() binding & confirm prompt (Requirement 4)
        var removeBtn = el("button", "btn-glass-remove");
        removeBtn.type = "button";
        removeBtn.innerHTML = "🗑️ রিমুভ";
        removeBtn.addEventListener("click", function(e) {
          e.preventDefault();
          e.stopPropagation();
          closeActiveDropdown();
          cleanupLingeringBackdrops();

          if (!confirm("আপনি কি নিশ্চিত এই সেটটি মুছে ফেলতে চান?")) return;

          removeBtn.disabled = true;
          removeBtn.innerHTML = "⏳ ডিলিট হচ্ছে...";

          sessionStorage.setItem('ch_deleted_' + ch.id, '1');

          var targetId = ts.id;
          var p1 = db.ref("exam_chapter_tests/" + ch.id + "/" + targetId).remove();
          var p2 = db.ref("examSets/" + ch.id + "/" + targetId).remove();
          var p3 = db.ref("exam_sets/" + ch.id + "/" + targetId).remove().catch(function(){});
          var p4 = db.ref("examSets/" + targetId).remove().catch(function(){});
          var p5 = db.ref("exam_sets/" + targetId).remove().catch(function(){});
          var p6 = db.ref("exam_chapter_tests/" + ch.id + "/_initialized").set(true);

          Promise.all([p1, p2, p3, p4, p5, p6]).then(function() {
            toast("এক্সাম সেটটি সফলভাবে মুছে ফেলা হয়েছে ✓");
            card.remove();
            cleanupLingeringBackdrops();
            loadAndRenderExamSets();
          }).catch(function(err) {
            console.warn("Delete issue, direct fallback:", err);
            db.ref("exam_chapter_tests/" + ch.id + "/" + targetId).set(null);
            db.ref("examSets/" + ch.id + "/" + targetId).set(null);
            db.ref("exam_chapter_tests/" + ch.id + "/_initialized").set(true);
            toast("এক্সাম সেটটি মুছে ফেলা হয়েছে ✓");
            card.remove();
            cleanupLingeringBackdrops();
            loadAndRenderExamSets();
          });
        });
        actionsCol.appendChild(removeBtn);

        // Edit button click -> toggles 4-Button Edit System Menu (Requirement 2: z-index 99999)
        editBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          var existingMenu = actionsCol.querySelector(".q-edit-dropdown");
          if (existingMenu) {
            closeActiveDropdown();
            return;
          }
          closeActiveDropdown();

          // Elevate current card to top layer so dropdown is never covered
          activeOpenCard = card;
          card.classList.add("dropdown-active");
          card.style.zIndex = "9999";

          var dropdown = el("div", "q-edit-dropdown");
          dropdown.style.zIndex = "99999";
          dropdown.style.position = "absolute";
          activeOpenDropdown = dropdown;

          dropdown.innerHTML = `
            <div class="q-edit-dropdown-header">🛠️ ৪-বাটন এডিট সিস্টেম</div>
            
            <button type="button" class="q-edit-dropdown-item" id="opt_set_name_edit">
              <span style="font-size:16px;margin-right:8px;line-height:1">✏️</span>
              <div style="flex:1">
                <div style="font-weight:700;color:#f8fafc">১. Set Name Edit</div>
                <div style="font-size:11px;color:#94a3b8">সেটের নাম/টাইটেল পরিবর্তন</div>
              </div>
            </button>

            <button type="button" class="q-edit-dropdown-item" id="opt_set_time_edit">
              <span style="font-size:16px;margin-right:8px;line-height:1">⏱️</span>
              <div style="flex:1">
                <div style="font-weight:700;color:#f8fafc">২. Time Edit</div>
                <div style="font-size:11px;color:#94a3b8">নির্ধারিত সময়সীমা পরিবর্তন</div>
              </div>
            </button>

            <button type="button" class="q-edit-dropdown-item" id="opt_set_individual_edit">
              <span style="font-size:16px;margin-right:8px;line-height:1">📝</span>
              <div style="flex:1">
                <div style="font-weight:700;color:#f8fafc">৩. Individual Qn Edit</div>
                <div style="font-size:11px;color:#94a3b8">একক প্রশ্ন ফর্ম এডিটর</div>
              </div>
            </button>

            <button type="button" class="q-edit-dropdown-item" id="opt_set_json_edit">
              <span style="font-size:16px;margin-right:8px;line-height:1">💻</span>
              <div style="flex:1">
                <div style="font-weight:700;color:#f8fafc">৪. Full JSON File Edit</div>
                <div style="font-size:11px;color:#94a3b8">সব প্রশ্ন একসাথে JSON এডিট</div>
              </div>
            </button>
          `;

          // ১. Set Name Edit
          dropdown.querySelector("#opt_set_name_edit").onclick = function(ev) {
            ev.stopPropagation();
            closeActiveDropdown();
            openSetNameEditModal(ch, ts, function(){
              loadAndRenderExamSets();
            });
          };

          // ২. Time Edit
          dropdown.querySelector("#opt_set_time_edit").onclick = function(ev) {
            ev.stopPropagation();
            closeActiveDropdown();
            openTimeEditModal(ch, ts, function(){
              loadAndRenderExamSets();
            });
          };

          // ৩. Individual Qn Edit
          dropdown.querySelector("#opt_set_individual_edit").onclick = function(ev) {
            ev.stopPropagation();
            closeActiveDropdown();
            openIndividualQuestionManagerModal(ch, ts, function(){
              loadAndRenderExamSets();
            });
          };

          // ৪. Full JSON File Edit
          dropdown.querySelector("#opt_set_json_edit").onclick = function(ev) {
            ev.stopPropagation();
            closeActiveDropdown();
            openTestSetEditorModal(ch, ts, function(){
              loadAndRenderExamSets();
            }, "json");
          };

          actionsCol.appendChild(dropdown);
          activeOpenDropdown = dropdown;
        });

        card.appendChild(actionsCol);
        qListContainer.appendChild(card);
      });

      listContainer.appendChild(qListContainer);
    }

    loadAndRenderExamSets();
    container.appendChild(qCard);
    return;
  }

  // LEVEL 2: অধ্যায় পরিচালনা (Graphical Cards & Dynamic Navigation, No '২. অধ্যায়...' Title)
  if (selectedSubId && !selectedChapId) {
    var activeSub = filteredSubs.find(function(s){ return s.id === selectedSubId; });
    if (!activeSub) {
      selectedSubId = null;
      renderQBankView(container, allSubs);
      return;
    }

    var chapCard = el("div", "card");
    chapCard.id = "admin_chap_card";

    // Top Header with Back to Subjects & Add Chapter (Removed "২. অধ্যায় নির্বাচন ও পরিচালনা")
    var chHeader = el("div", "sw");
    chHeader.style.cssText = "align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;border-bottom:1px solid var(--line);padding-bottom:14px;margin-bottom:16px";

    var leftSide = el("div");
    leftSide.style.cssText = "display:flex;align-items:center;gap:12px;flex-wrap:wrap";

    var backToSubsBtn = btn("← সকল বিষয়ে ফিরে যান", "ghost", function(){
      selectedSubId = null;
      selectedChapId = null;
      renderQBankView(container, allSubs);
    });
    backToSubsBtn.style.cssText = "padding:7px 15px;font-size:13px;border-radius:10px;border:1.5px solid var(--line);font-weight:700";
    leftSide.appendChild(backToSubsBtn);

    var titleHeader = el("div");
    titleHeader.innerHTML = "<h3 style='margin:0;font-size:18px;color:var(--ink)'><span style='color:var(--a)'>" + activeSub.titleBn + "</span> <small class='mute' style='font-size:12px;font-weight:600'>(" + activeExamCategory + " — " + (activeSub.chapters ? activeSub.chapters.length : 0) + "টি অধ্যায়)</small></h3>";
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

      var openJsonBtn = btn("📋 প্রশ্নব্যাংক ও সেটিংস ›", "alt", function(e) {
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
      gradient: "linear-gradient(135deg, #022c22 0%, #064e3b 40%, #059669 75%, #10b981 100%)",
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
  document.body.classList.add("admin-login-active");
  var a = $("app"); a.textContent = "";

  var wrap = el("div", "admin-glass-wrapper");
  var c = el("div", "admin-glass-card");

  c.innerHTML = `
    <div class="admin-glass-badge">🛡️</div>
    <h2 class="admin-glass-title"><span style="margin-right:8px;vertical-align:middle;display:inline-block">🛡️</span>অ্যাডমিন লগইন</h2>
    <p class="admin-glass-sub">আমাদের অধ্যয়ন কক্ষ — সিকিউর অ্যাডমিন পোর্টাল</p>
    
    <div class="admin-input-group">
      <label class="admin-input-label" for="admin_uid_inp">👤 User ID</label>
      <input type="text" id="admin_uid_inp" class="admin-glass-input" placeholder="User ID লিখুন" autocomplete="username" />
    </div>

    <div class="admin-input-group">
      <label class="admin-input-label" for="admin_pass_inp">🔑 পাসওয়ার্ড</label>
      <input type="password" id="admin_pass_inp" class="admin-glass-input" placeholder="পাসওয়ার্ড লিখুন" autocomplete="current-password" />
    </div>

    <div class="admin-glass-err" id="admin_err_msg">${msg || ""}</div>

    <button type="button" class="admin-glass-btn" id="btn_admin_login">
      লগইন করুন ➔
    </button>
  `;

  wrap.appendChild(c);
  a.appendChild(wrap);

  var e = document.getElementById("admin_uid_inp");
  var p = document.getElementById("admin_pass_inp");
  var er = document.getElementById("admin_err_msg");
  var go = document.getElementById("btn_admin_login");

  setTimeout(function(){ if(e) e.focus(); }, 100);

  function handleLogin(){
    er.textContent = "";
    go.disabled = true;
    go.style.opacity = "0.75";

    sha(p.value).then(function(h){
      db.ref("admin_config/password_hash").once("value").then(function(snap){
        go.disabled = false;
        go.style.opacity = "1";
        var validHash = snap.val() || PH;
        if(e.value.trim() === ADMIN_ID && h === validHash){
          try{ localStorage.setItem("ad-ok","1"); }catch(x){}
          document.body.classList.remove("admin-login-active");
          enter();
        } else {
          er.textContent = "ID বা পাসওয়ার্ড ভুল!";
          p.value = "";
          p.focus();
        }
      }).catch(function(){
        go.disabled = false;
        go.style.opacity = "1";
        if(e.value.trim() === ADMIN_ID && h === PH){
          try{ localStorage.setItem("ad-ok","1"); }catch(x){}
          document.body.classList.remove("admin-login-active");
          enter();
        } else {
          er.textContent = "ID বা পাসওয়ার্ড ভুল!";
        }
      });
    }, function(){
      go.disabled = false;
      go.style.opacity = "1";
      er.textContent = "ব্রাউজারে ক্রিপ্টোগ্রাফি সাপোর্ট করছে না।";
    });
  }

  go.onclick = handleLogin;
  p.onkeydown = function(ev){ if(ev.key === "Enter") handleLogin(); };
  e.onkeydown = function(ev){ if(ev.key === "Enter") p.focus(); };
}

function enter(){
  document.body.classList.remove("admin-login-active");
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