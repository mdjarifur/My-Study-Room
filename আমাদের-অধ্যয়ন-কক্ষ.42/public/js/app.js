// public/js/app.js - ১০০% সিকিউর ভিআইপি লক, নিখুঁত টাইমার ও টাস্ক ইঞ্জিন
(function(){
var $=function(i){return document.getElementById(i)};
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function bn(n){return Number(n||0).toLocaleString("bn-BD")}
function key(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
var db=null,P={},me=null,ready=false,lastFin=0,dirty={},first=true,PEND=[],ref=null,CODE="";
try{CODE=localStorage.getItem("sr-code")||""}catch(e){}
var MON=false;
try{me=localStorage.getItem("sr-me")}catch(e){}if(me==="mon"){MON=true;me="p1"}

// টাইমার ও গ্লোবাল ভ্যারিয়েবল
var RW=0, SP=0, SK="", BT=0, CE=null;

var LOGOS = { Medical: "img/dmc.png", Engineering: "img/eng.png", Varsity: "img/ver.png" };
function getLogo(g){ return LOGOS[g] || "img/dmc.png"; }

// অনুপ্রেরণামূলক উক্তি ভাণ্ডার
var MS = [
  "দারুণ! ডাক্তার হওয়ার পথে আরেক ধাপ এগোলে।",
  "এক এক করে কাজ শেষ, এভাবেই মেডিকেলের সিট কাছে আসে।",
  "রোগীর পাশে দাঁড়ানোর দিনটা আরও কাছে এল।",
  "সাদা অ্যাপ্রনের স্বপ্নে আরেকটা ইট বসালে।",
  "প্রতিদিনের এই অভ্যাসই ভবিষ্যতের ডাক্তার বানায়।",
  "চমৎকার! ধারাবাহিকতাই মেডিকেলের চাবিকাঠি।",
  "এগিয়ে যাও, ভবিষ্যতের ডাক্তার! আরেকটা কাজ জমা হলো।",
  "আস-সালাতু খাইরুম মিনান নাওম। ঘুমের চেয়ে নামাজ উত্তম, আজকের প্রথম জয় ফজরে ওঠা।",
  "ঘুমের চেয়ে স্বপ্ন বড়। সময়মতো ঘুমাও, সময়মতো উঠো, স্বপ্নটাকে কাজে লাগাও।",
  "ফজরের ডাক আসে ঘুমের সবচেয়ে গভীর সময়ে, তাই ওঠার জয়টাও সবচেয়ে বড়।",
  "যে সকালে বিছানা ছাড়ে, সে দিনের অর্ধেক জিতে নেয়।",
  "অ্যালার্ম বাজলে ভাবো, সাদা অ্যাপ্রন তোমাকে ডাকছে। ওঠো।",
  "ঘুম প্রতি রাতেই আসবে, কিন্তু এই সময়টা আর ফিরবে না।",
  "রাতে ঠিকমতো ঘুমাও, ভোরে ওঠার শক্তি পাবে। ভালো ঘুম পড়াকেও মাথায় বসিয়ে দেয়।",
  "ফজর পড়ে পড়তে বসলে সকালটা তোমার, ফোনের নয়।",
  "ঘুম আরামের, কিন্তু স্বপ্ন তার চেয়েও মিষ্টি। উঠে পড়ো!",
  "কম্বলের ওম ভালো লাগে, কিন্তু ডাক্তারের চেম্বার আরও ভালো লাগবে।",
  "পাঁচ মিনিট আরও ঘুমানোর লোভ সামলাতে পারলে অনেক কিছুই সামলাতে পারবে।",
  "রাতে সময়মতো ঘুমানো মানে সকালের জন্য নিজেকে উপহার দেওয়া।",
  "ঘুম শরীরের ওষুধ। ঠিক সময়ে নাও, বাকি সময়টা স্বপ্নের জন্য রাখো।",
  "যে স্বপ্ন তোমাকে ভোরে জাগায়, সেই স্বপ্নই একদিন তোমাকে সাদা অ্যাপ্রন পরাবে।",
  "ফজরের পর ঘুমে না ফিরে বই খুলো। ভোরের শান্ত সময়টাই পড়ার সেরা সময়।",
  "একদিন কেউ তোমাকে বলবে, ডাক্তার সাহেব, আপনি আমার প্রাণ বাঁচিয়েছেন।",
  "আজকের পড়া একদিন কারও ব্যথা কমানোর শক্তি হয়ে ফিরবে।",
  "ডাক্তার হওয়া মানে মানুষের সবচেয়ে কঠিন সময়ে পাশে থাকা। তুমি সেই প্রস্তুতিই নিচ্ছো।",
  "এক পাতা পড়া মানে এক রোগীর কাছে আরেকটু যোগ্য হওয়া।",
  "মেডিকেলের সুযোগ মেধার ওপর নির্ভর করে, আর মেধা তৈরি হয় রোজকার পড়ায়।",
  "একশ নম্বরের পরীক্ষায় প্রতিটা নম্বর গোনা হয়। আজকের কাজ থেকেও একটা নম্বর জমলো।",
  "পরীক্ষার আগে নতুন কিছু নয়, পুরোনো পড়াই বারবার ঝালাও। সেটাই জেতার পথ।",
  "এমবিবিএস শুধু একটা ডিগ্রি নয়, মানুষের জন্য কাজ করার সুযোগ।",
  "তোমার স্টেথোস্কোপ এখন বইয়ের ভেতরে অপেক্ষা করছে। এগিয়ে যাও।",
  "সেই দিনটার কথা ভাবো, যেদিন মা বলবেন, আমার সন্তান ডাক্তার।",
  "আজ যে সময় দিচ্ছো, কাল সেটাই হবে তোমার পরিচয়।",
  "রোগীর হাত ধরার আগে আজ বইয়ের পাতা ধরো।",
  "হাজার মাইলের পথও এক পা দিয়েই শুরু হয়। আরেক পা এগোলে।",
  "আজকের মনোযোগই কালকের ফলাফল।",
  "ক্লান্ত লাগলে বিশ্রাম নাও, হাল ছেড়ো না।",
  "মেডিকেলের স্বপ্ন তোমার হাতের নাগালে, এগিয়ে চলো!"
];

var SQ = [
  "মেধাবী নয়, তোমাকে হতে হবে প্রচণ্ড পরিশ্রমী।",
  "আজকের পড়া একদিন স্টেজের হাততালিতে ফিরে আসবে।",
  "গরিব-দুঃখীরা তোমার অপেক্ষায় আছে। আল্লাহ কবে তোমাকে তাদের কাছে পাঠাবেন, যেন তুমি তাদের পাশে দাঁড়াতে পারো।",
  "বাবা-মায়ের ঘাম ঝরানো পরিশ্রম আর রক্ত পানি করা উপার্জনের মূল্য দাও।",
  "আমিই হবো আমার পরিবারের প্রথম DMCian।",
  "Motivation-এর অপেক্ষা করো না, Discipline দিয়ে নিজেকে চালাও।",
  "তোমার হাতের চিকিৎসায় একদিন কোনো মায়ের সন্তান সুস্থ হয়ে বাড়ি ফিরবে।",
  "মনে রেখো, তোমার জন্য দুজন মানুষ নিজেদের অনেক স্বপ্ন বিসর্জন দিয়েছেন।",
  "সাদা অ্যাপ্রন শুধু সম্মান নয়, এটা মানুষের প্রতি বিশাল দায়িত্ব।",
  "হাজারো প্রতিযোগীর ভিড়ে নিজের জায়গা তৈরি করতে হলে, হাজারো মানুষের চেয়ে বেশি ধারাবাহিক হতে হবে।",
  "DMC কোনো অসম্ভব স্বপ্ন নয়, যদি প্রতিদিনের পরিশ্রম সত্যি হয়।"
];

var ENG_QUOTES = [
  "ইঞ্জিনিয়ার হওয়ার স্বপ্ন দেখো, কারণ পৃথিবী বদলায় তাদের হাতেই যারা স্বপ্ন দেখে।",
  "আজকের পরিশ্রমই কালকের ইঞ্জিনিয়ারিং ডিগ্রির ভিত্তি।",
  "প্রতিটি সমীকরণ মেলানোর মতোই জীবনের সমস্যারও সমাধান আছে।",
  "কঠিন অংক ভয় পাওয়ার জিনিস নয়, জয় করার চ্যালেঞ্জ।",
  "অনুশীলনই মানুষকে নিখুঁত করে (Practice makes perfect)।",
  "আজ যে প্রশ্নটা কঠিন লাগছে, কাল সেটাই তোমার সবচেয়ে সহজ হবে।",
  "বুয়েট-কুয়েটের স্বপ্ন শুরু হয় একটি সিদ্ধান্ত থেকে, আজ থেকেই পড়া শুরু করো।",
  "ব্যর্থতা মানে শেষ নয়, এটা পরের চেষ্টার ডেটা।",
  "প্রতিদিন একটু একটু করে এগোলেই পাহাড়সমান লক্ষ্যও ছোট হয়ে যায়।",
  "ইঞ্জিনিয়ার মানে সমস্যা দেখে পালানো নয়, সমাধান বানানো।",
  "ফিজিক্সের সূত্র মুখস্থ নয়, বুঝে শেখো, বুঝলেই জয়।",
  "ম্যাথ তোমার বন্ধু হয়ে যাবে, যদি রোজ তার সাথে সময় কাটাও।",
  "কখনো হাল ছেড়ো না (Never give up)।",
  "ভর্তি পরীক্ষার প্রস্তুতি ম্যারাথন, স্প্রিন্ট নয়।",
  "রাত জেগে পড়ার কষ্ট একদিন গর্বের গল্প হবে।",
  "নিজের সাথে প্রতিযোগিতা করো, গতকালের তোমাকে হারাও।",
  "ধৈর্য ধরো, বড় সেতুও একটা একটা ইট দিয়েই তৈরি হয়।",
  "কনসেপ্ট ক্লিয়ার থাকলে কঠিন প্রশ্নও সহজ লাগে।",
  "আজকের ঘাম আগামীর সাফল্যের সার।",
  "ছোট ছোট লক্ষ্য ঠিক করো, প্রতিটি পূরণে বড় স্বপ্ন কাছে আসবে।",
  "কেমিস্ট্রির প্রতিটি বিক্রিয়ার মতো তোমার পরিশ্রমও ফল দেবে।",
  "ইঞ্জিনিয়ারিং মানে কল্পনাকে বাস্তবে রূপ দেওয়া।",
  "মডেল টেস্ট দাও, ভুল ধরো, আবার চেষ্টা করো।",
  "বাবা-মায়ের চোখের স্বপ্নটাই তোমার সবচেয়ে বড় অনুপ্রেরণা।",
  "ইঞ্জিনিয়াররাই বানায় আগামী দিনের পৃথিবী, সেই দলে তুমিও থাকবে।",
  "তোমার হাতের কলমই একদিন সেতু আর শহরের নকশা আঁকবে।",
  "তোমার প্রস্তুতিই তোমার আত্মবিশ্বাস।",
  "স্বপ্নের ক্যাম্পাসে নিজের নাম কল্পনা করো, তারপর পড়তে বসো।"
];

var VAR_QUOTES = [
  "স্বপ্নটা বড় হলে পরিশ্রমটাও বড় হতে হয়।",
  "আজকের কষ্টই আগামী দিনের সফলতার গল্প লিখবে।",
  "থেমে যেও না, তোমার স্বপ্ন তোমার অপেক্ষায়।",
  "একটা আসন, হাজারো প্রতিযোগী—নিজেকে সেরাদের একজন করে তোলো।",
  "সময় নষ্ট করলে স্বপ্ন একদিন তোমাকে ক্ষমা করবে না।",
  "নিজের সঙ্গে প্রতিদিন প্রতিযোগিতা করো, অন্যের সঙ্গে নয়।",
  "আজ একটু বেশি পড়ো, কাল একটু বেশি এগিয়ে থাকবে।",
  "সফলতা ভাগ্যে নয়, নিয়মিত পরিশ্রমে তৈরি হয়।",
  "তোমার স্বপ্নের বিশ্ববিদ্যালয় তোমার অপেক্ষায় আছে।",
  "একদিন তোমার পরিশ্রমই তোমার পরিচয় হবে।",
  "পড়ার টেবিলে কাটানো সময় কখনো বৃথা যায় না।",
  "আজকের ত্যাগ একদিন তোমার গর্ব হয়ে ফিরবে।",
  "একদিন তোমার নামের পাশে কাঙ্ক্ষিত বিশ্ববিদ্যালয়ের পরিচয় থাকবে।",
  "হাল ছেড়ো না, হয়তো সফলতা আর মাত্র এক ধাপ দূরে।",
  "প্রতিদিন একটু একটু করে এগিয়ে যাওয়াই বড় সফলতা।",
  "ক্যাম্পাসের লাল বাসে বসে স্বপ্ন ছোঁয়ার আনন্দ আজকের নিয়মিত পড়ার ওপরই নির্ভর করে।",
  "কার্জন হল আর সবুজ চত্বর তোমার পদচারণার অপেক্ষায় আছে।",
  "প্রতিটি মডেল টেস্ট তোমাকে আরও অভিজ্ঞ করে তুলছে।",
  "স্বপ্নের বিশ্ববিদ্যালয়ে নিজের নাম কল্পনা করো, তারপর পড়তে বসো।",
  "ইনশাআল্লাহ, একদিন তোমার পরিচয় হবে তোমার স্বপ্নের বিশ্ববিদ্যালয়ের একজন শিক্ষার্থী হিসেবে।"
];

var OTH_QUOTES = [
  "লক্ষ্য ছাড়া জীবন হালবিহীন নৌকার মতো, আগে লক্ষ্য ঠিক করো।",
  "আজ শুরু করো, কারণ কাল কখনো আসে না।",
  "স্বপ্ন দেখাটা শুরু মাত্র, পূরণ করতে হলে কাজ করতে হয়।",
  "ছোট ছোট পদক্ষেপই তোমাকে বড় গন্তব্যে পৌঁছে দেবে।",
  "ব্যর্থতা মানে হেরে যাওয়া নয়, শেখার আরেকটি সুযোগ।",
  "নিজের ওপর বিশ্বাস রাখো, অর্ধেক জয় সেখানেই।",
  "প্রতিদিন একটু একটু করে নিজেকে আগের চেয়ে ভালো করো।",
  "কষ্ট ছাড়া কেউ কখনো সোনা পায়নি।",
  "যে থেমে যায়, সে হেরে যায়; যে চলতে থাকে, সে জেতে।",
  "সময়কে কাজে লাগাও, সময়ই তোমার সবচেয়ে বড় সম্পদ।",
  "আজকের কষ্ট কালকের গর্ব হয়ে ফিরে আসবে।",
  "শৃঙ্খলা হলো স্বপ্ন আর সাফল্যের মধ্যকার সেতু।",
  "প্রতিটি সকাল একটি নতুন সুযোগ নিয়ে আসে।",
  "অনুশীলনই মানুষকে নিখুঁত করে।",
  "কঠিন সময়ই মানুষকে শক্ত করে গড়ে তোলে।",
  "সাফল্যের কোনো শর্টকাট নেই, আছে শুধু নিরলস পরিশ্রম।",
  "তোমার চেষ্টাই তোমার পরিচয় গড়ে দেবে।",
  "ধৈর্য আর অধ্যবসায়ের কাছে কোনো বাধাই টেকে না।"
];

var MOT = {
  Medical: MS.concat(SQ),
  Engineering: ENG_QUOTES,
  Varsity: VAR_QUOTES,
  Other: OTH_QUOTES
};

var DEF_SUBJ = ["Bangla", "English", "ICT", "Physics", "Chemistry", "Biology", "Higher Math", "General Math"];
function getSubjects(){
  var list = DEF_SUBJ.slice();
  try {
    var saved = JSON.parse(localStorage.getItem("sr_custom_subj") || "[]");
    saved.forEach(function(s){
      if(list.indexOf(s) < 0 && s.trim()) list.push(s.trim());
    });
    if(P && P.custom_subjects){
      var cObj = P.custom_subjects;
      Object.keys(cObj).forEach(function(k){
        var val = typeof cObj[k] === "string" ? cObj[k].trim() : (cObj[k] && cObj[k].name ? cObj[k].name.trim() : "");
        if(val && list.indexOf(val) < 0) list.push(val);
      });
    }
  } catch(e){}
  return list;
}
function saveSubject(name){
  name = String(name || "").trim().slice(0, 30);
  if(!name) return;
  var list = [];
  try {
    list = JSON.parse(localStorage.getItem("sr_custom_subj") || "[]");
  } catch(e){}
  if(list.indexOf(name) < 0 && DEF_SUBJ.indexOf(name) < 0){
    list.push(name);
    localStorage.setItem("sr_custom_subj", JSON.stringify(list));
  }
  try {
    if(ref && CODE){
      ref.child("custom_subjects").push(name).catch(function(){});
    }
    if(CODE === "1432014310"){
      var dbx = window.db || firebase.database();
      dbx.ref("vip_custom_subjects").push(name).catch(function(){});
    }
  } catch(e){}
}

function getMembers(){
  if(CODE === "1432014310"){
    return ["p1", "p2"];
  }
  var keys = Object.keys(P).filter(function(k){
    return k !== "meta" && k !== "members" && k !== "exam" && k !== "chat" && k !== "pres" && k !== "bk" && k !== "pass_request" && typeof P[k] === "object" && P[k] !== null && P[k].name;
  });
  if(keys.length === 0) return [me || "m1"];
  return keys;
}

function getOrderedMembers(){
  var mems = getMembers();
  if(!me) return mems;
  var rest = mems.filter(function(x){ return x !== me; });
  return [me].concat(rest);
}

function other(){
  var mems = getMembers();
  var o = mems.filter(function(x){ return x !== me; });
  return o[0] || (me==="p1"?"p2":"p1");
}

function nm(id){
  if(id === "p1") return pl(id).name || localStorage.getItem("vip_p1_name") || "Tasfia Hasan";
  if(id === "p2") return pl(id).name || localStorage.getItem("vip_p2_name") || "Rahman";
  return pl(id).name || "সাথী";
}

function pl(id){
  var p=P[id]||{};
  var defName = (id==="p1") ? (localStorage.getItem("vip_p1_name")||"Tasfia Hasan") : (id==="p2") ? (localStorage.getItem("vip_p2_name")||"Rahman") : "";
  return{
    name:p.name||defName,cls:p.cls||"",college:p.college||"",goal:p.goal||"Medical",mobile:p.mobile||"",
    days:p.days||{},mins:p.mins||{},study:p.study||null,sess:p.sess||[],
    pr:p.pr||{},brk:p.brk||null,sc:p.sc||[]
  };
}
function pct(p,k){var a=(p.days[k]||[]).filter(function(x){return !x.x});return a.length?Math.round(a.filter(function(x){return x.d}).length/a.length*100):null}
function cnt(p,k){var a=(p.days[k]||[]).filter(function(x){return !x.x});return[a.filter(function(x){return x.d}).length,a.length]}

// ডাটাবেস সেভ ও সেন্ট্রাল ভিআইপি সিঙ্ক
function put(id,fn){
  if(MON)return;
  if(first){PEND.push([id,fn]);toast("ডেটাবেসের সাথে সংযোগ হচ্ছে, একটু অপেক্ষা করো…");return}
  var p=JSON.parse(JSON.stringify(pl(id)));
  fn(p);
  P[id]=p;
  dirty[id]=NOW();
  if(id === me && p.name){
    try { localStorage.setItem("sr-name", p.name); } catch(e){}
  }
  render();

  if(ref) {
    ref.child(id).set(p).catch(function(){toast("সেভ হয়নি, ইন্টারনেট আছে তো?")});
    
    if(CODE !== "1432014310"){
      ref.child("members/" + id).update({
        name: p.name || "",
        college: p.college || "",
        cls: p.cls || "",
        goal: p.goal || "Medical",
        mobile: p.mobile || ""
      }).catch(function(){});
    }
  }

  // ভিআইপি ইউজারদের টাস্ক সেন্ট্রাল ক্লাউডে সিঙ্ক
  if(id === "p1" || id === "p2"){
    var dbx = window.db || firebase.database();
    dbx.ref("vip_users/" + id).update({
      name: p.name || "",
      college: p.college || "",
      cls: p.cls || "",
      goal: p.goal || "Medical",
      mobile: p.mobile || "",
      days: p.days || {},
      mins: p.mins || {},
      pr: p.pr || {},
      sc: p.sc || []
    }).catch(function(){});
  }
}
var tt;function toast(m,ms){var c=$("cheer");if(!c)return;c.textContent=m;c.classList.add("show");clearTimeout(tt);tt=setTimeout(function(){c.classList.remove("show")},ms||3600)}

// নিখুঁত টাইমার গণনা
function sRem(s){
  if(!s || !s.t) return 0;
  var elapsed = s.ps ? (s.ps - s.t - (s.pz||0)) : (NOW() - s.t - (s.pz||0));
  return Math.max(0, (s.d || 180) * 6e4 - elapsed);
}
function sEl(s){return (s.d||180)*6e4-sRem(s)}
function active(s){return !!(s && s.t && sRem(s) > 0)}
function brkOn(p){return !!(p.brk && p.brk.e > NOW())}
function resumeStudy(q,at){var x=q.study;if(x&&x.ps){x.pz=(x.pz||0)+Math.max(0,at-x.ps);delete x.ps}}
function liveMin(p,k){var m=p.mins[k]||0;if(active(p.study)&&!p.study.ps)m+=Math.floor(sEl(p.study)/6e4);return m}
function sumMin(p){var t=0;for(var k in p.mins)t+=p.mins[k]||0;return t}
function totMin(p){return sumMin(p)+(active(p.study)&&!p.study.ps?Math.floor(sEl(p.study)/6e4):0)}
function fmtClock(ms){var s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60);s%=60;var p=function(n){return String(n).padStart(2,"0")};return(h?h+":":"")+p(m)+":"+p(s)}
function fmtHM(m){var h=Math.floor(m/60);return(h?bn(h)+" ঘণ্টা ":"")+bn(m%60)+" মিনিট"}
function fmtHMs(m){return bn(Math.floor(m/60))+"ঘ "+bn(m%60)+"মি"}
function todayMin(p){return liveMin(p,key(new Date()))}

function sumBtn(){
  var b=$("sumBtn");if(!me)return;
  var mems = getOrderedMembers();
  var parts = mems.map(function(id){
    var isMe = (id === me && !MON);
    return (isMe?"তুমি":nm(id)) + " " + fmtHMs(todayMin(pl(id)));
  });
  var t = "⏳ আজকের পড়া: " + parts.join(" · ");
  if(b.dataset.s===t)return;b.dataset.s=t;b.textContent="";b.appendChild(el("span",null,t));b.appendChild(el("span","mute","বিস্তারিত ›"));
}

function detail(id){
  var m=$("modal"),b=$("mbox");b.textContent="";b.style.maxWidth="560px";
  m.hidden=false;m.removeAttribute("hidden");m.style.setProperty("display","grid","important");
  var p=pl(id),tabs=el("div","row");tabs.style.marginTop="0";
  var mems = getOrderedMembers();
  mems.forEach(function(x){
    var t=el("button","btn"+(x===id?"":" ghost")+(x!==me?" alt":""),nm(x));
    t.type="button";t.onclick=function(){detail(x)};tabs.appendChild(t);
  });
  var cl=el("button","btn ghost","✕");cl.type="button";cl.setAttribute("aria-label","বন্ধ করো");
  cl.onclick=function(){m.hidden=true;m.setAttribute("hidden","");m.style.setProperty("display","none","important");};
  tabs.appendChild(cl);b.appendChild(tabs);
  var tk=key(new Date()),big=el("div","big",fmtHM(todayMin(p)));big.style.color="var(--a)";b.appendChild(big);b.appendChild(el("div","mute","আজকের পড়া"));
  var S=(p.sess||[]).filter(function(x){return key(new Date(x.a))===tk}).reverse(),by={},st=0;
  S.forEach(function(x){by[x.s]=(by[x.s]||0)+x.m;st+=x.m});
  var chips=el("div","now");Object.keys(by).sort(function(a,c){return by[c]-by[a]}).forEach(function(k){chips.appendChild(el("span",id===me?"":"o",k+": "+fmtHM(by[k])))});b.appendChild(chips);
  var rest=(p.mins[tk]||0)-st;if(rest>0)b.appendChild(el("p","mute","বিস্তারিত ছাড়া হিসাব: "+fmtHM(rest)));
  if(active(p.study))b.appendChild(el("p",null,"এখন চলছে: "+p.study.s+(p.study.tp?" — "+p.study.tp:"")));
  b.appendChild(el("h2",null,"সেশনের তালিকা"));
  if(!S.length)b.appendChild(el("p","mute","এখনো কোনো সেশন সেভ হয়নি।"));
  var tf={hour:"numeric",minute:"2-digit"};
  S.forEach(function(x){
    var r=el("div","ses"),l=el("div"),a=new Date(x.a),e=new Date(x.a+x.m*6e4);
    l.appendChild(el("b",null,x.s+(x.tp?" — "+x.tp:"")));
    l.appendChild(el("small",null,a.toLocaleDateString("bn-BD",{day:"numeric",month:"short"})+", "+a.toLocaleTimeString("bn-BD",tf)+" থেকে "+e.toLocaleTimeString("bn-BD",tf)));
    r.appendChild(l);r.appendChild(el("b",null,fmtHM(x.m)));b.appendChild(r);
  });
}

function finish(auto){
  var st=pl(me).study;if(!st||lastFin===st.t)return;lastFin=st.t;
  var m=Math.round(Math.min(sEl(st),(st.d||180)*6e4)/6e4),k=key(new Date()),nme=nm(me);
  put(me,function(q){q.study=null;q.brk=null;if(m>0){q.mins[k]=(q.mins[k]||0)+m;q.sess=q.sess||[];q.sess.push({a:st.t,s:st.s,tp:st.tp||"",m:m});if(q.sess.length>300)q.sess=q.sess.slice(-300)}});
  
  var myGoal = pl(me).goal || "Medical";
  var cat = MOT[myGoal] ? myGoal : "Other";
  var pool = MOT[cat];
  toast(m>0 ? pool[Math.floor(Math.random()*pool.length)] + " ("+bn(m)+" মিনিট জমা হলো)" : "সেশন থামানো হলো");
  if(auto===true)longBeep(function(){speakCompletionMessage(nme)});
}

function sBox(id,p){var on=P.pres&&P.pres[id]===true,run=active(p.study)&&!p.study.ps&&!brkOn(p);
  if(!on&&!run)return null;return el("div","sbox"+(on?" dot":""),run?"এখন পড়ছে":"")}

function card(id,isMe){
  var p=pl(id),k=key(new Date()),pc=pct(p,k),c=cnt(p,k);
  var d=el("div","pc"+(isMe?"":" o"));
  d.setAttribute("role","button");d.tabIndex=0;d.setAttribute("aria-label",nm(id)+": ইতিহাস ও ব্যাকআপ");
  d.onclick=function(){hist(id)};
  d.appendChild(el("b","n",nm(id)+(isMe&&!MON?" (তুমি)":"")));
  var pr=el("div","prow");pr.appendChild(el("div","big",pc==null?"–":bn(pc)+"%"));var sb=sBox(id,p);if(sb)pr.appendChild(sb);d.appendChild(pr);
  var b=el("div","bar"),i=el("i");i.style.width=(pc||0)+"%";b.appendChild(i);d.appendChild(b);
  d.appendChild(el("div","mute",c[1]?bn(c[0])+"/"+bn(c[1])+" কাজ শেষ":"এখনো কাজ যোগ হয়নি"));
  d.appendChild(el("div","mute","আজ পড়া: "+bn(liveMin(p,k))+" মিনিট"));
  if(p.college) d.appendChild(el("div","mute", "কলেজ: " + p.college));
  return d;
}

function taskList(ul,id,editable){
  var k=key(new Date()),all=(pl(id).days[k]||[]).filter(function(x){return !x.x}),arr=all.filter(function(x){return !x.h});ul.textContent="";
  if(!arr.length){ul.appendChild(el("li","mute",all.length?"সব কাজ শেষ। ইতিহাসে দেখা যাবে।":editable?"উপরে লিখে প্রথম কাজটা যোগ করো।":"এখনো কোনো কাজ যোগ হয়নি।"));return}
  arr.forEach(function(t){
    var li=el("li",(t.d?"done":"")+(editable?"":" ro"));
    var c=el("button","chk",t.d?"✓":"");c.type="button";c.setAttribute("aria-label",t.t);
    if(editable)c.onclick=function(){
      put(me,function(p){p.days[k].forEach(function(x){if(x.i===t.i)x.d=t.d?0:1})});
      if(!t.d){
        var a=pl(me).days[k].filter(function(x){return !x.x});
        var myGoal = pl(me).goal || "Medical";
        var cat = MOT[myGoal] ? myGoal : "Other";
        var pool = MOT[cat];
        toast(a.every(function(x){return x.d})?"আজকের সব কাজ শেষ! দারুণ একটা দিন।" : pool[Math.floor(Math.random()*pool.length)], 8000);
      }
    };else c.disabled=true;
    li.appendChild(c);li.appendChild(el("span","txt",t.t));
    if(editable){var x=el("button","del","×");x.type="button";x.setAttribute("aria-label","মুছে ফেলো");x.onclick=function(){put(me,function(p){p.days[k].forEach(function(y){if(y.i===t.i){if(y.d)y.h=1;else y.x=1}})})};li.appendChild(x)}
    ul.appendChild(li);
  });
}

var TS={s:"Bangla",tp:"",d:45},CR=2*Math.PI*90,addingCustomSubject=false;
function timerBox(){
  var box=$("timer");box.textContent="";var st=pl(me).study;
  if(active(st)){
    if(brkOn(pl(me))){var bb=el("button","sumbtn","");bb.type="button";bb.appendChild(el("span",null,"☕ "+nm(me)+" ("+bn(pl(me).brk.m)+") মিনিটের Break নিচ্ছে।"));bb.appendChild(el("span","mute","ঘড়ি দেখো ›"));bb.onclick=function(){brkModal(me)};box.appendChild(bb);return}
    var rem0=sRem(st),tot=(st.d||180)*6e4,w=el("div","ringw");
    w.innerHTML='<svg class="ring" viewBox="0 0 220 220" aria-hidden="true"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3fcaa2"/><stop offset="1" stop-color="#a995ff"/></linearGradient></defs><circle class="rt" cx="110" cy="110" r="90"/><circle class="rp" id="rp" cx="110" cy="110" r="90" stroke-dasharray="565.49" stroke-dashoffset="0"/></svg>';
    var rc=el("div","rc"),cd=el("b","cd");cd.dataset.own=me;cd.dataset.tot=tot;cd.dataset.ring="1";cd.textContent=fmtClock(rem0);
    rc.appendChild(cd);rc.appendChild(el("div",null,st.s));if(st.tp)rc.appendChild(el("div","mute",st.tp));w.appendChild(rc);box.appendChild(w);
    w.querySelector("#rp").style.strokeDashoffset=CR*(1-Math.max(0,rem0)/tot);
    var b=el("button","btn alt","থামাও ও সেভ করো");b.type="button";b.style.cssText="display:block;margin:12px auto 0";b.onclick=finish;box.appendChild(b);
  }else if(addingCustomSubject){
    var af=el("div","row");af.style.marginTop="0";
    var ni=el("input");ni.type="text";ni.placeholder="নতুন বিষয়ের নাম (যেমন: Physics, Biology)...";ni.style.cssText="flex:1;min-width:180px";
    var ab=el("button","btn","✓ যোগ করো");ab.type="button";
    ab.onclick=function(){
      var v=ni.value.trim();
      if(!v) return toast("বিষয়ের নাম লিখুন");
      saveSubject(v);
      TS.s=v;
      addingCustomSubject=false;
      timerBox();
    };
    var cb=el("button","btn ghost","বাতিল");cb.type="button";
    cb.onclick=function(){
      addingCustomSubject=false;
      timerBox();
    };
    af.appendChild(ni);af.appendChild(ab);af.appendChild(cb);box.appendChild(af);
    setTimeout(function(){ ni.focus(); }, 50);
  }else{
    var f=el("div","row");f.style.marginTop="0";
    var sel=el("select");sel.setAttribute("aria-label","বিষয়");
    var subjs = getSubjects();
    if(subjs.indexOf(TS.s) < 0) TS.s = subjs[0] || "Bangla";
    subjs.forEach(function(x){var o=el("option",null,x);o.value=x;sel.appendChild(o)});
    sel.value=TS.s;
    sel.onchange=function(){TS.s=sel.value};

    var addSubBtn = el("button","btn ghost","➕ বিষয় যোগ");
    addSubBtn.type = "button";
    addSubBtn.style.cssText = "padding:8px 12px;font-size:14px;white-space:nowrap";
    addSubBtn.onclick = function(){
      addingCustomSubject = true;
      timerBox();
    };

    var ds=el("select");ds.setAttribute("aria-label","সময়");[25,45,60,90,120].forEach(function(n){var o=el("option",null,bn(n)+" মিনিট");o.value=n;ds.appendChild(o)});ds.value=TS.d;ds.onchange=function(){TS.d=Number(ds.value)};
    var tp=el("input","tr");tp.type="text";tp.maxLength=60;tp.placeholder="টপিক (যেমন: কবিতা / ব্যাকরণ)";tp.value=TS.tp;tp.oninput=function(){TS.tp=tp.value};tp.setAttribute("aria-label","টপিক");
    var go=el("button","btn","পড়া শুরু ▶");go.type="button";
    go.onclick=function(){
      unlockAudio();
      put(me, function(q){
        q.study = { s: TS.s, tp: TS.tp.trim(), t: NOW(), d: TS.d, pz: 0 };
        delete q.study.ps;
        q.brk = null;
      });
    };
    f.appendChild(sel);f.appendChild(addSubBtn);f.appendChild(ds);f.appendChild(tp);f.appendChild(go);box.appendChild(f);
  }
}

function dm(p,k){return k===key(new Date())?liveMin(p,k):(p.mins[k]||0)}
function drow(n,m,c,f,hi,cl){var r=el("div","dr "+cl+(hi?" hi":"")),t=el("div","dn");t.appendChild(el("b",null,n));var st=el("div","ds");st.appendChild(el("span",null,"⏱ "+fmtHMs(m)));st.appendChild(el("span",null,"✅ "+bn(c[0])+"/"+bn(c[1])+" কাজ"));t.appendChild(st);r.appendChild(t);
  var q=el("div","dsc");q.appendChild(el("b",null,bn(f)));q.appendChild(el("small",null,"স্কোর"));r.appendChild(q);var bar=el("div","dbar"),i=el("i");i.style.width=f+"%";bar.appendChild(i);r.appendChild(bar);return r}

function board(){
  var w=$("board");w.textContent="";var A=pl(me),B=pl(other()),wa=0,wb=0,wj=0,n=0;
  for(var i=0;i<7;i++){
    var d=new Date();d.setDate(d.getDate()-i);var k=key(d),ca=cnt(A,k),cb=cnt(B,k),ma=dm(A,k),mb=dm(B,k);
    if(!ca[1]&&!cb[1]&&!ma&&!mb)continue;n++;
    var ta=ca[1]?ca[0]/ca[1]*100:0,tb=cb[1]?cb[0]/cb[1]*100:0,tt=ma+mb,fa=Math.round((tt?ma/tt*100:0)/2+ta/2),fb=Math.round((tt?mb/tt*100:0)/2+tb/2),win,w1=false,w2=false;
    if(Math.abs(ma-mb)<=5){win="🤝 Joint Winner";wj++;w1=w2=true}
    else if(fa>fb){win="🏆 "+nm(me);wa++;w1=true}else if(fb>fa){win="🏆 "+nm(other());wb++;w2=true}else win="সমান";
    var card=el("div","dl"),hd=el("div","dh");hd.appendChild(el("b",null,d.toLocaleDateString("bn-BD",{day:"numeric",month:"short"})));hd.appendChild(el("span","dwn",win));card.appendChild(hd);
    card.appendChild(drow(nm(me),ma,ca,fa,w1,"g"));card.appendChild(drow(nm(other()),mb,cb,fb,w2,"v"));w.appendChild(card);
  }
  if(!n){w.appendChild(el("p","mute","কাজ যোগ করলে বা পড়লে এখানে হিসাব আসবে।"));return}
  w.appendChild(el("p",null,"জয়: "+nm(me)+" "+bn(wa)+" বার, "+nm(other())+" "+bn(wb)+" বার"+(wj?" · Joint "+bn(wj)+" বার":"")));
}

var root=document.documentElement,mb=$("mode");
function dark(){var a=root.getAttribute("data-theme");return a?a==="dark":matchMedia("(prefers-color-scheme: dark)").matches}
function pm(){if(mb) mb.textContent=dark()?"☀️ লাইট":"🌙 ডার্ক"}
try{var sv=localStorage.getItem("sr-theme");if(sv)root.setAttribute("data-theme",sv)}catch(e){}
if(mb){
  mb.onclick=function(){var n=dark()?"light":"dark";root.setAttribute("data-theme",n);try{localStorage.setItem("sr-theme",n)}catch(e){}pm()};
}

// রুম পাসকোড পরিবর্তনের লাইভ নোটিফিকেশন ব্যানার
function renderPassRequestBanner(){
  var pr = P.pass_request;
  var bannerId = "pass_req_banner";
  var existing = $(bannerId);
  if(existing) existing.remove();

  if(!pr || pr.resolved || pr.rejected || (NOW() - pr.at > 600000)) return;

  var b = el("div", "card");
  b.id = bannerId;
  b.style.cssText = "background:linear-gradient(90deg,var(--as),var(--bs));border:2px solid var(--b);margin-bottom:14px;padding:14px;border-radius:16px";

  if(pr.byId === me){
    b.innerHTML = `
      <div class="sw">
        <div><b>🔑 পাসকোড পরিবর্তন রিকোয়েস্ট:</b> তোমার দেওয়া নতুন পাসকোড: <b>"${pr.newPass}"</b> (অন্যান্য মেম্বারদের ভোটের অপেক্ষায়...)</div>
        <button class="btn dn" id="btn_cancel_pr" style="padding:4px 12px;font-size:13px">বাতিল করো</button>
      </div>
    `;
    b.querySelector("#btn_cancel_pr").onclick = function(){
      ref.child("pass_request/rejected").set(true);
    };
  } else {
    b.innerHTML = `
      <div class="sw">
        <div>📢 <b>${pr.by}</b> রুমের পাসকোড পরিবর্তন করতে চাচ্ছে। নতুন পাসকোড: <b>"${pr.newPass}"</b></div>
        <div class="row" style="margin:0">
          <button class="btn" id="btn_pr_yes" style="padding:6px 16px;font-size:13px">✅ হ্যাঁ</button>
          <button class="btn dn" id="btn_pr_no" style="padding:6px 16px;font-size:13px">❌ না</button>
        </div>
      </div>
    `;

    b.querySelector("#btn_pr_yes").onclick = function(){
      var newCode = pr.newPass;
      var oldCode = CODE;
      var dbx = window.db || firebase.database();
      
      dbx.ref("rooms_v2/" + oldCode).once("value", function(sn){
        var rData = sn.val() || {};
        rData.pass_request = { resolved: true };
        var u = {};
        u["rooms_v2/" + newCode] = rData;
        u["rooms_v2/" + oldCode] = null;
        u["room_meta/" + newCode] = { name: (rData.meta && rData.meta.name) || newCode, status: "approved", updatedAt: T };
        u["room_meta/" + oldCode] = null;

        dbx.ref().update(u).then(function(){
          localStorage.setItem("sr-code", newCode);
          location.reload();
        });
      });
    };

    b.querySelector("#btn_pr_no").onclick = function(){
      ref.child("pass_request/rejected").set(true);
      toast("পাসকোড পরিবর্তনের আবেদন বাতিল করা হয়েছে");
    };
  }

  var main = document.querySelector("main");
  if(main) main.insertBefore(b, main.firstChild);
}

// রুমের নতুন পাসকোড চাওয়ার মডাল
function showPassRequestModal(){
  var m=$("modal"),b=$("mbox");
  if(!m || !b) return;
  m.hidden=false;m.removeAttribute("hidden");m.style.setProperty("display","grid","important");

  b.innerHTML = `
    <div>
      <h2 style="font-size:22px;text-align:center;margin-bottom:4px">🔑 রুমের পাসকোড পরিবর্তন রিকোয়েস্ট</h2>
      <p class="mute" style="text-align:center;margin-top:0;font-size:14px">নতুন পাসকোড দাও। রুমের অন্য সদস্যরা 'হ্যাঁ' ভোট দিলে এটি কার্যকর হবে।</p>
      
      <input type="text" id="req_new_pass_inp" placeholder="রুমের নতুন পাসকোড (কমপক্ষে ৪ অক্ষর)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
      <div id="req_err" style="color:var(--danger);font-size:13px;margin-top:6px;min-height:1.2em"></div>

      <div class="row" style="margin-top:16px;display:flex;gap:10px">
        <button class="btn" id="btn_send_pass_req" style="flex:1;padding:12px;border-radius:12px">রিকোয়েস্ট পাঠাও</button>
        <button class="btn ghost" id="btn_cancel_pass_req" style="flex:1;padding:12px;border-radius:12px">বাতিল</button>
      </div>
    </div>
  `;

  document.getElementById("btn_cancel_pass_req").onclick = function(){
    m.hidden = true; m.setAttribute("hidden",""); m.style.setProperty("display","none","important");
  };

  document.getElementById("btn_send_pass_req").onclick = function(){
    var newP = document.getElementById("req_new_pass_inp").value.trim().replace(/[.$#\[\]\/]/g,"_");
    var er = document.getElementById("req_err");
    if(newP.length < 4){ er.textContent = "পাসকোড কমপক্ষে ৪ অক্ষরের দাও।"; return; }
    if(newP === CODE){ er.textContent = "এটিই বর্তমান পাসকোড, অন্য একটি দাও।"; return; }

    ref.child("pass_request").set({
      by: nm(me),
      byId: me,
      newPass: newP,
      at: NOW()
    }).then(function(){
      m.hidden = true; m.setAttribute("hidden",""); m.style.setProperty("display","none","important");
      toast("পাসকোড পরিবর্তনের রিকোয়েস্ট পাঠানো হয়েছে ✓");
    });
  };
}

function render(){
  document.body.classList.toggle("mon",MON);
  var dateEl = $("date");
  if(dateEl) dateEl.textContent = new Date().toLocaleDateString("bn-BD",{weekday:"long",day:"numeric",month:"long"});
  pm();

  if(!CODE){
    try{localStorage.removeItem("sr-code");localStorage.removeItem("sr-me");}catch(e){}
    location.reload();
    return;
  }
  if(!me){chooser();return}

  renderPassRequestBanner();

  var whoEl = $("who");
  if(whoEl){
    whoEl.textContent = MON ? "মনিটর" : "✏️ " + nm(me);
    whoEl.onclick = function(ev){
      if(ev){ ev.preventDefault(); ev.stopPropagation(); }
      if(!MON && me) editProfileModal(me);
    };
  }

  var curProf = pl(me);
  var myGoal = curProf.goal || "Medical";
  if(curProf.cls){
    var baseCls = curProf.cls.includes("SSC") ? "SSC" : curProf.cls.includes("Admission") ? "Admission" : "HSC";
    try { localStorage.setItem("sr_class", baseCls); } catch(e){}
  }
  var logoImg = document.querySelector(".brand .logo");
  if(logoImg){
    logoImg.src = getLogo(myGoal);
    logoImg.alt = myGoal + " লোগো";
  }

  var mems = getOrderedMembers();

  var now=$("now");
  if(now){
    now.textContent="";
    mems.forEach(function(id,i){
      var p=pl(id),st=p.study,o=i?"o":"";
      if(brkOn(p)){var bk=el("button","stat brkc"+(i?" o":""),"☕ "+nm(id)+" ("+bn(p.brk.m)+") মিনিটের Break নিচ্ছে।");bk.type="button";bk.onclick=function(){brkModal(id)};now.appendChild(bk);return}
      if(active(st)&&!p.study.ps){var sp=el("span",o+" stat"+(P.pres&&P.pres[id]===true?" dot":""),nm(id)+" এখন পড়ছে: "+st.s+(st.tp?" — "+st.tp:"")+" · ");var c=el("span","cd");c.dataset.own=id;c.textContent=fmtClock(sRem(st));sp.appendChild(c);sp.appendChild(document.createTextNode(" বাকি"));now.appendChild(sp)}
    });
  }

  var duo=$("duo");
  if(duo){
    duo.textContent="";
    mems.forEach(function(id){
      duo.appendChild(card(id, id===me));
    });
  }

  sumBtn();

  var otherMembers = mems.filter(function(x){ return x !== me; });
  var oTitle = $("oTitle");
  var theirsUl = $("theirs");
  if(otherMembers.length > 0){
    if(oTitle) oTitle.textContent = nm(other())+" এর আজকের কাজ";
    if(theirsUl) taskList(theirsUl, other(), false);
  } else {
    if(oTitle) oTitle.textContent = "অন্যান্য সাথীর কাজ";
    if(theirsUl) theirsUl.innerHTML = "<li class='mute'>একক রুম — অন্য কোনো বন্ধু কোড দিয়ে যুক্ত হলে তার কাজ এখানে দেখতে পাবে।</li>";
  }

  var mTitle = $("mTitle");
  if(mTitle) mTitle.textContent = MON?nm(me)+" এর আজকের কাজ":"আমার কাজ";
  var mineUl = $("mine");
  if(mineUl) taskList(mineUl, me, !MON);

  timerBox();board();wboard();examSync();prayUI();chatUI();scUI();
}

// রুম সুইচ মডাল
function roomSwitcherModal(){
  var m=$("modal"),b=$("mbox");
  if(!m || !b) return;
  b.textContent="";b.style.maxWidth="440px";
  m.hidden=false;m.removeAttribute("hidden");m.style.setProperty("display","grid","important");

  b.innerHTML = `
    <div>
      <h2 style="font-size:22px;text-align:center;margin-bottom:4px">🔄 রুম পরিবর্তন করো</h2>
      <p class="mute" style="text-align:center;margin-top:0;font-size:14px">যে রুমে যেতে চাও তার পাসকোড দাও:</p>
      
      <div style="display:flex;gap:8px;margin-top:14px">
        <input type="text" id="sw_code_inp" placeholder="রুমের পাসকোড লেখো" style="flex:1;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);font:inherit" />
        <button class="btn" id="btn_sw_go" style="padding:10px 18px;border-radius:12px">যাও ›</button>
      </div>
      <div id="sw_err" style="color:var(--danger);font-size:13px;margin-top:6px;min-height:1.2em"></div>

      <div style="margin-top:16px;display:flex;gap:10px">
        <button class="btn ghost" id="btn_sw_close" style="width:100%;padding:10px;border-radius:12px">বাতিল</button>
      </div>
    </div>
  `;

  document.getElementById("btn_sw_go").onclick = function(){
    var c = document.getElementById("sw_code_inp").value.trim().replace(/[.$#\[\]\/]/g,"_");
    var er = document.getElementById("sw_err");
    if(c.length < 4){ er.textContent = "কমপক্ষে ৪ অক্ষরের পাসকোড দাও।"; return; }
    
    var dbx = window.db || firebase.database();
    er.textContent = "খোঁজা হচ্ছে...";

    if(c === "1432014310"){
      doSwitchRoom(c, "p2");
      return;
    }

    dbx.ref("rooms_v2/" + c).once("value", function(sn){
      if(sn.exists()){
        m.hidden = true;
        CODE = c;
        localStorage.setItem("sr-code", c);
        if(ref) ref.off();
        P = {};
        connect();
        chooser(true);
      } else {
        er.textContent = "এই পাসকোডে কোনো রুম পাওয়া যায়নি।";
      }
    });
  };

  document.getElementById("btn_sw_close").onclick = function(){
    m.hidden = true; m.setAttribute("hidden", ""); m.style.setProperty("display", "none", "important");
  };

  function doSwitchRoom(newCode, newMe){
    try {
      localStorage.setItem("sr-code", newCode);
      if(newMe) localStorage.setItem("sr-me", newMe);
    } catch(e){}
    CODE = newCode;
    m.hidden = true;
    m.setAttribute("hidden", "");
    m.style.setProperty("display", "none", "important");
    if(ref) ref.off();
    P = {};
    connect();
    toast("রুমে প্রবেশ করা হয়েছে ✓");
  }
}

// সিলেক্টর মডাল: এখানে কোনো ভিআইপি নাম সবার সামনে থাকবে না! সম্পূর্ণ পাসওয়ার্ড-লকড থাকবে!
function chooser(canCancel){
  var m=$("modal"),b=$("mbox");
  if(!m || !b) return;
  b.textContent="";b.style.maxWidth="460px";
  m.hidden=false;m.removeAttribute("hidden");m.style.setProperty("display","grid","important");
  
  b.appendChild(el("div","wic","👥"));
  var h=el("h1",null,"আপনি কে? (Who are you?)");h.style.cssText="text-align:center;font-size:24px";b.appendChild(h);
  var sub=el("p","mute","অ্যাপে প্রবেশ করতে নিজের প্রোফাইল বেছে নিন বা নতুন যোগ দিন");sub.style.textAlign="center";b.appendChild(sub);

  var mems = getMembers();

  // ১. রুমের মেম্বারদের তালিকা (ভিআইপি রুম বাদে সাধারণ মেম্বারদের দেখাবে)
  mems.filter(function(id){
    return CODE === "1432014310" || (id !== "p1" && id !== "p2");
  }).forEach(function(id, idx){
    var pName = nm(id);
    var x=el("button","pf"+(idx%2===1?" o":""));x.type="button";x.appendChild(el("i","pd"));
    x.appendChild(el("span",null,pName));x.appendChild(el("b",null,"›"));
    x.onclick=function(){
      if(pl(id).name) enter(id);
      else editProfileModal(id);
    };
    b.appendChild(x);
  });

  // ২. "➕ Add Me (নতুন সদস্য যোগ দাও)" বোতাম (ভিআইপি রুম বাদে)
  if(CODE !== "1432014310" && mems.length < 8){
    var addMeBtn = el("button","btn","➕ Add Me (নতুন সদস্য যোগ দাও)");
    addMeBtn.type = "button";
    addMeBtn.style.cssText = "display:block;width:100%;margin-top:10px;padding:12px;background:var(--a);border-radius:12px;font-size:15px";
    addMeBtn.onclick = function(){
      showAddMeModal();
    };
    b.appendChild(addMeBtn);
  }

  var hr=el("hr");hr.style.cssText="border:0;border-top:1px solid var(--line);margin:14px 0";b.appendChild(hr);

  // ৩. মনিটর মোড
  var mb=el("div","mnb");mb.appendChild(el("div","mute","Monitor Mode (ভিউয়ার)"));
  var go=el("button","orb","মনিটর হিসেবে প্রবেশ করুন");go.type="button";
  go.onclick=function(){try{localStorage.setItem("sr-me","mon")}catch(e){}MON=true;me="p1";m.hidden=true;m.setAttribute("hidden","");m.style.setProperty("display","none","important");render()};
  mb.appendChild(go);b.appendChild(mb);

  // ৪. ১০০% সুরক্ষিত ভিআইপি এন্ট্রি (কোনো নাম আগে দেখাবে না, পাসকোড ছাড়া নাম আসা অসম্ভব)
  if(CODE !== "1432014310"){
    var vipSec = el("div");
    vipSec.style.cssText = "margin-top:12px;padding-top:10px;border-top:1px dashed var(--line)";
    vipSec.innerHTML = `
      <button class="btn ghost" id="btn_sec_vip_toggle" style="width:100%;font-size:13px;padding:9px;border-radius:10px">
        🔒 ভিআইপি হিসেবে প্রবেশ
      </button>
      <div id="sec_vip_pass_box" style="display:none;margin-top:8px;background:var(--as);padding:12px;border-radius:12px;text-align:left">
        <small style="display:block;font-weight:700;color:var(--a);margin-bottom:6px">VIP Passcode দিন:</small>
        <input type="password" id="sec_vip_pass_inp" placeholder="গোপন VIP পাসকোড লেখো" style="width:100%;padding:8px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit" />
        <div id="sec_vip_err" style="color:var(--danger);font-size:12px;margin-top:4px"></div>
        <button class="btn" id="btn_sec_vip_verify" style="width:100%;margin-top:8px;padding:8px;border-radius:8px">যাচাই করো</button>
      </div>
      <div id="sec_vip_unlock_box" style="display:none;margin-top:8px;background:var(--as);padding:12px;border-radius:12px">
        <small style="display:block;font-weight:700;color:var(--a);margin-bottom:8px;text-align:center">সফল! নিজের প্রোফাইল বেছে নিন:</small>
        <div id="sec_vip_btn_group" style="display:flex;gap:8px"></div>
      </div>
    `;

    vipSec.querySelector("#btn_sec_vip_toggle").onclick = function(){
      var pBox = vipSec.querySelector("#sec_vip_pass_box");
      pBox.style.display = (pBox.style.display === "none") ? "block" : "none";
      if(pBox.style.display === "block") vipSec.querySelector("#sec_vip_pass_inp").focus();
    };

    vipSec.querySelector("#btn_sec_vip_verify").onclick = function(){
      var pass = vipSec.querySelector("#sec_vip_pass_inp").value.trim();
      var er = vipSec.querySelector("#sec_vip_err");
      if(pass === "1432014310"){
        localStorage.setItem("sr_is_vip", "1");
        vipSec.querySelector("#sec_vip_pass_box").style.display = "none";
        vipSec.querySelector("#btn_sec_vip_toggle").style.display = "none";

        var dbx = window.db || firebase.database();
        dbx.ref("vip_users").once("value", function(vSnap){
          var vData = vSnap.val() || {};
          var n1 = (vData.p1 && vData.p1.name) || localStorage.getItem("vip_p1_name") || "Tasfia Hasan";
          var n2 = (vData.p2 && vData.p2.name) || localStorage.getItem("vip_p2_name") || "Rahman";

          var btnGroup = vipSec.querySelector("#sec_vip_btn_group");
          btnGroup.innerHTML = `
            <button class="btn sec-vip-btn" data-slot="p1" style="flex:1;padding:9px;border-radius:10px">${n1}</button>
            <button class="btn alt sec-vip-btn" data-slot="p2" style="flex:1;padding:9px;border-radius:10px">${n2}</button>
          `;

          btnGroup.querySelectorAll(".sec-vip-btn").forEach(function(sBtn){
            sBtn.onclick = function(){
              var slot = sBtn.getAttribute("data-slot");
              var prof = (slot === "p1") ? (vData.p1 || {}) : (vData.p2 || {});
              var curName = (slot === "p1") ? n1 : n2;

              var memObj = {
                name: curName,
                college: prof.college || "",
                cls: prof.cls || "HSC",
                goal: prof.goal || "Medical",
                mobile: prof.mobile || ""
              };

              ref.child("members/" + slot).update(memObj);
              ref.child(slot).update({
                name: curName,
                college: prof.college || "",
                cls: prof.cls || "HSC",
                goal: prof.goal || "Medical",
                mobile: prof.mobile || "",
                days: prof.days || {},
                mins: prof.mins || {},
                pr: prof.pr || {},
                sc: prof.sc || []
              });

              enter(slot);
            };
          });

          vipSec.querySelector("#sec_vip_unlock_box").style.display = "block";
        });
      } else {
        er.textContent = "ভুল ভিআইপি পাসকোড!";
      }
    };

    b.appendChild(vipSec);
  }

  // ৫. প্রোফাইল এডিট বাটন
  if(me && !MON){
    var editSelfBtn = el("button","btn ghost","✏️ আমার প্রোফাইল এডিট করো");
    editSelfBtn.type = "button";
    editSelfBtn.style.cssText = "display:block;width:100%;margin-top:10px;padding:10px;border-radius:12px;border:1.5px solid var(--line)";
    editSelfBtn.onclick = function(){ editProfileModal(me); };
    b.appendChild(editSelfBtn);
  }

  // ৬. পাসকোড পরিবর্তনের রিকোয়েস্ট বোতাম
  if(CODE !== "1432014310" && me && !MON){
    var prBtn = el("button","btn ghost","🔑 রুমের পাসকোড বদলাও (রিকোয়েস্ট)");
    prBtn.type = "button";
    prBtn.style.cssText = "display:block;width:100%;margin-top:8px;padding:10px;border-radius:12px;border:1.5px solid var(--line)";
    prBtn.onclick = function(){ showPassRequestModal(); };
    b.appendChild(prBtn);
  }

  // ৭. রুম পরিবর্তন বাটন
  var switchBtn = el("button","btn ghost","🔄 রুম পরিবর্তন করুন (অন্য রুমে যাও)");
  switchBtn.type = "button";
  switchBtn.style.cssText = "display:block;width:100%;margin-top:8px;padding:10px;border-radius:12px;border:1.5px solid var(--line)";
  switchBtn.onclick = function(){
    roomSwitcherModal();
  };
  b.appendChild(switchBtn);

  // ৮. রুম ত্যাগ বাটন (ভিআইপি রুমে এটি থাকবে না!)
  if(CODE !== "1432014310"){
    var leaveBtn = el("button","btn dn","🚪 এই রুম পাকাপাকি ত্যাগ করুন (Leave Room)");
    leaveBtn.type = "button";
    leaveBtn.style.cssText = "display:block;width:100%;margin-top:8px;padding:10px;border-radius:12px;font-size:14px";
    leaveBtn.onclick = function(){
      if(!confirm("তুমি কি নিশ্চিত যে এই রুমের মেম্বারশিপ ছেড়ে দিতে চাও? এই রুমে তোমার সিট খালি হয়ে যাবে।")) return;
      if(ref && me && me !== "mon"){
        ref.child(me).remove();
        ref.child("members/" + me).remove();
      }
      try{
        localStorage.removeItem("sr-code");
        localStorage.removeItem("sr-me");
      }catch(e){}
      location.reload();
    };
    b.appendChild(leaveBtn);
  }

  if(canCancel){
    var c=el("button","btn ghost","বাতিল");c.type="button";c.style.marginTop="8px";
    c.onclick=function(){m.hidden=true;m.setAttribute("hidden","");m.style.setProperty("display","none","important");};
    b.appendChild(c);
  }
}

// Add Me ফর্ম সরাসরি মডালে ওপেন হওয়া
function showAddMeModal(){
  var m=$("modal"),b=$("mbox");
  if(!m || !b) return;

  b.innerHTML = `
    <div>
      <h2 style="font-size:20px;text-align:center;margin-bottom:4px">রুমে যোগ দাও (Add Me)</h2>
      <p class="mute" style="text-align:center;margin-top:0;font-size:14px">নিজের তথ্য পূরণ করে রুমে যোগ দাও</p>
      <input type="text" id="add_name" placeholder="তোমার পুরো নাম" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
      <input type="text" id="add_college" placeholder="তোমার স্কুল / কলেজ" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
      <input type="text" id="add_cls" placeholder="ক্লাস (যেমন: HSC ২০২৭ / পরীক্ষার্থী)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
      
      <p class="mute" style="font-size:13px;font-weight:600;margin:12px 0 6px">তোমার টার্গেট</p>
      <div class="gl">
        <button type="button" class="on" data-g="Medical">🩺 Medical</button>
        <button type="button" data-g="Engineering">⚙️ Engineering</button>
        <button type="button" data-g="Varsity">🏛️ Varsity</button>
        <button type="button" class="goal-custom" data-g="custom">🎯 + নিজের লক্ষ্য</button>
      </div>
      <input type="text" id="add_custom_goal" placeholder="নিজের লক্ষ্য লেখো" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:8px;font:inherit;display:none" />
      
      <input type="tel" id="add_mob" maxlength="11" oninput="this.value = this.value.replace(/[^0-9০-৯]/g, '').slice(0, 11)" placeholder="মোবাইল (01XXXXXXXXX - ১১ ডিজিট)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
      
      <div id="add_err" style="color:var(--danger);font-size:14px;margin-top:8px;min-height:1.2em"></div>
      <div class="row" style="margin-top:14px;display:flex;gap:10px">
        <button class="btn" id="btn_add_submit" style="flex:1;padding:12px;border-radius:12px">যোগ দাও</button>
        <button class="btn ghost" id="btn_add_cancel" style="flex:1;padding:12px;border-radius:12px">পিছনে</button>
      </div>
    </div>
  `;

  var selGoal = "Medical";
  var customInp = document.getElementById("add_custom_goal");
  var gBtns = b.querySelectorAll(".gl button");

  gBtns.forEach(function(btnG){
    btnG.onclick = function(){
      gBtns.forEach(function(x){ x.classList.remove("on"); });
      btnG.classList.add("on");
      selGoal = btnG.getAttribute("data-g");
      customInp.style.display = (selGoal === "custom") ? "block" : "none";
      if(selGoal === "custom") customInp.focus();
    };
  });

  document.getElementById("btn_add_cancel").onclick = function(){
    chooser(true);
  };

  document.getElementById("btn_add_submit").onclick = function(){
    var name = document.getElementById("add_name").value.trim();
    var college = document.getElementById("add_college").value.trim();
    var cls = document.getElementById("add_cls").value.trim();
    var mobRaw = document.getElementById("add_mob").value.trim();
    var mob = mobRaw.replace(/[০-৯]/g, function(d){ return "০১২৩৪৫৬৭৮৯".indexOf(d); }).replace(/[^0-9]/g, "");
    var goal = (selGoal === "custom") ? customInp.value.trim() : selGoal;
    var er = document.getElementById("add_err");

    if(mobRaw && !/^01[3-9][0-9]{8}$/.test(mob)){
      er.textContent = "সঠিক ১১ ডিজিটের মোবাইল নম্বর দাও (যেমন: 017XXXXXXXX)।";
      return;
    }

    var newId = "m" + Date.now().toString(36) + Math.floor(Math.random()*1e3).toString(36);
    var newMem = { name: name, college: college, cls: cls, goal: goal, mobile: mob, joinedAt: T };

    ref.child("members/" + newId).set(newMem);
    ref.child(newId).set(newMem);
    enter(newId);
  };
}

// প্রোফাইল এডিটর
function editProfileModal(id){
  var m = $("modal"), b = $("mbox");
  if(!m || !b) return;

  m.hidden = false;
  m.removeAttribute("hidden");
  m.style.setProperty("display", "grid", "important");
  b.textContent = "";
  b.style.maxWidth = "460px";

  var cur = pl(id);
  var curUid = cur.uid || localStorage.getItem("sr_uid");
  if(!curUid || !/^\d{5,6}$/.test(curUid)){
    curUid = String(Math.floor(10000 + Math.random() * 90000));
  }
  try { localStorage.setItem("sr_uid", curUid); } catch(e){}

  var curBaseCls = cur.classBase || (cur.cls && cur.cls.includes("SSC") ? "SSC" : cur.cls && cur.cls.includes("Admission") ? "Admission" : "HSC");
  var curYearMatch = (cur.cls && cur.cls.match(/[0-9]{4}/)) ? cur.cls.match(/[0-9]{4}/)[0] : (cur.passingYear || "");

  b.innerHTML = `
    <div>
      <h2 style="font-size:22px;text-align:center;margin-bottom:4px">প্রোফাইল সেটিংস</h2>
      <p class="mute" style="text-align:center;margin-top:0;font-size:13.5px">তোমার ব্যক্তিগত তথ্য ও লক্ষ্য আপডেট করো</p>
      
      <!-- Auto UID Card -->
      <div style="background:var(--as);padding:10px 14px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div>
          <small style="color:var(--mute);font-size:11.5px;display:block">তোমার পার্সোনাল আইডি (UID):</small>
          <strong style="color:var(--a);font-size:14px;letter-spacing:1px">${curUid}</strong>
        </div>
        <button type="button" class="btn ghost" id="btn_copy_uid" style="padding:4px 10px;font-size:12px;border-radius:8px">📋 কপি</button>
      </div>

      <input type="text" id="prof_name" placeholder="তোমার পুরো নাম" value="${cur.name||''}" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:4px;font:inherit" />
      <input type="text" id="prof_college" placeholder="তোমার স্কুল / কলেজ" value="${cur.college||''}" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
      
      <p class="mute" style="font-size:13px;font-weight:600;margin:12px 0 6px">তোমার ক্লাস:</p>
      <div class="row" id="prof_cls_buttons" style="display:flex;gap:8px;margin-bottom:8px">
        <button type="button" class="btn prof-cls-btn ${curBaseCls==='HSC'?'on':'ghost'}" data-c="HSC" style="flex:1;padding:8px 0;font-size:13.5px;border-radius:10px">🎓 HSC</button>
        <button type="button" class="btn prof-cls-btn ${curBaseCls==='SSC'?'on':'ghost'}" data-c="SSC" style="flex:1;padding:8px 0;font-size:13.5px;border-radius:10px">📖 SSC</button>
        <button type="button" class="btn prof-cls-btn ${curBaseCls==='Admission'?'on':'ghost'}" data-c="Admission" style="flex:1;padding:8px 0;font-size:13.5px;border-radius:10px">🎯 Admission</button>
      </div>

      <input type="tel" id="prof_year" maxlength="4" placeholder="পাসের বছর (শুধুই সংখ্যা, যেমন: 2026)" value="${curYearMatch}" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);font:inherit" />
      <small style="color:var(--mute);font-size:11.5px;display:block;margin-top:4px">* ক্লাস পরিবর্তন করলে তা অ্যাডমিন অনুমোদনের পর সক্রিয় হবে।</small>

      <p class="mute" style="font-size:13px;font-weight:600;margin:12px 0 6px">তোমার টার্গেট:</p>
      <div class="gl">
        <button type="button" class="${cur.goal==='Medical'?'on':''}" data-g="Medical">🩺 Medical</button>
        <button type="button" class="${cur.goal==='Engineering'?'on':''}" data-g="Engineering">⚙️ Engineering</button>
        <button type="button" class="${cur.goal==='Varsity'?'on':''}" data-g="Varsity">🏛️ Varsity</button>
        <button type="button" class="goal-custom ${['Medical','Engineering','Varsity'].indexOf(cur.goal)<0?'on':''}" data-g="custom">🎯 + নিজের লক্ষ্য</button>
      </div>
      <input type="text" id="prof_custom_goal" placeholder="নিজের লক্ষ্য লেখো" value="${['Medical','Engineering','Varsity'].indexOf(cur.goal)<0?cur.goal:''}" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:8px;font:inherit;display:${['Medical','Engineering','Varsity'].indexOf(cur.goal)<0?'block':'none'}" />
      
      <input type="tel" id="prof_mob" maxlength="11" oninput="this.value = this.value.replace(/[^0-9০-৯]/g, '').slice(0, 11)" placeholder="মোবাইল (01XXXXXXXXX - ১১ ডিজিট)" value="${cur.mobile||''}" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
      
      <!-- PIN Change Section -->
      <div style="margin-top:14px;border-top:1px dashed var(--line);padding-top:10px;text-align:left">
        <small style="font-weight:700;color:var(--ink);display:block;margin-bottom:6px">🔐 ৪ ডিজিটের ব্যক্তিগত পিন (PIN) পরিবর্তন:</small>
        <div style="display:flex;gap:8px">
          <input type="password" id="prof_cur_pin" maxlength="4" placeholder="বর্তমান PIN" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" style="flex:1;padding:8px 10px;border-radius:10px;border:1.5px solid var(--line);font:inherit;text-align:center" />
          <input type="password" id="prof_new_pin" maxlength="4" placeholder="নতুন ৪-ডিজিট PIN" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" style="flex:1;padding:8px 10px;border-radius:10px;border:1.5px solid var(--line);font:inherit;text-align:center" />
        </div>
      </div>

      <div id="prof_err" style="color:var(--danger);font-size:14px;margin-top:8px;min-height:1.2em"></div>
      
      <div class="row" style="margin-top:16px;display:flex;gap:10px">
        <button class="btn" id="btn_prof_save" style="flex:1;padding:12px;border-radius:12px">সেভ করো</button>
        <button class="btn ghost" id="btn_prof_close" style="flex:1;padding:12px;border-radius:12px">বাতিল</button>
      </div>
    </div>
  `;

  var selGoal = cur.goal || "Medical";
  var selClass = curBaseCls;
  var customInp = document.getElementById("prof_custom_goal");
  var gBtns = b.querySelectorAll(".gl button");
  var clsBtns = b.querySelectorAll(".prof-cls-btn");

  document.getElementById("btn_copy_uid").onclick = function(){
    navigator.clipboard.writeText(curUid).then(function(){
      toast("UID কপি হয়েছে ✓");
    }).catch(function(){});
  };

  clsBtns.forEach(function(cb){
    cb.onclick = function(){
      clsBtns.forEach(function(x){ x.className = "btn prof-cls-btn ghost"; });
      cb.className = "btn prof-cls-btn on";
      selClass = cb.getAttribute("data-c");
    };
  });

  gBtns.forEach(function(btnEl){
    btnEl.onclick = function(){
      gBtns.forEach(function(x){ x.classList.remove("on"); });
      btnEl.classList.add("on");
      selGoal = btnEl.getAttribute("data-g");
      customInp.style.display = (selGoal === "custom") ? "block" : "none";
      if(selGoal === "custom") customInp.focus();
    };
  });

  document.getElementById("btn_prof_close").onclick = function(){
    m.hidden = true;
    m.setAttribute("hidden", "");
    m.style.setProperty("display", "none", "important");
  };

  document.getElementById("btn_prof_save").onclick = function(){
    var nameVal = document.getElementById("prof_name").value.trim();
    var collegeVal = document.getElementById("prof_college").value.trim();
    var yearVal = document.getElementById("prof_year").value.trim();
    var mobRaw = document.getElementById("prof_mob").value.trim();
    var mobVal = mobRaw.replace(/[০-৯]/g, function(d){ return "০১২৩৪৫৬৭৮৯".indexOf(d); }).replace(/[^0-9]/g, "");
    var goalVal = (selGoal === "custom") ? customInp.value.trim() : selGoal;
    var er = document.getElementById("prof_err");

    if(!nameVal){
      er.textContent = "নাম লিখুন।";
      return;
    }

    if(mobRaw && !/^01[3-9][0-9]{8}$/.test(mobVal)){
      er.textContent = "সঠিক ১১ ডিজিটের মোবাইল নম্বর দাও (যেমন: 017XXXXXXXX)।";
      return;
    }

    // PIN Change Check
    var curPinInput = document.getElementById("prof_cur_pin").value.trim();
    var newPinInput = document.getElementById("prof_new_pin").value.trim();
    var savedPin = localStorage.getItem("sr_pin_" + id) || (cur && cur.pin);

    if(newPinInput){
      if(newPinInput.length !== 4){
        er.textContent = "নতুন পিন অবশ্যই ঠিক ৪ ডিজিটের হতে হবে।";
        return;
      }
      if(savedPin && curPinInput !== String(savedPin)){
        er.textContent = "বর্তমান পিনটি সঠিক নয়!";
        return;
      }

      // Update PIN
      try { localStorage.setItem("sr_pin_" + id, newPinInput); } catch(e){}
      var dbx = window.db || firebase.database();
      dbx.ref("user_pins/" + id).set({ pin: newPinInput, updatedAt: Date.now() }).catch(function(){});
      if(CODE !== "1432014310"){
        dbx.ref("rooms_v2/" + CODE + "/members/" + id + "/pin").set(newPinInput).catch(function(){});
      }
    }

    // Class Change Request Handling
    var fullRequestedCls = selClass + (yearVal ? " (" + yearVal + ")" : "");
    var isClassChanged = (selClass !== curBaseCls);

    if(isClassChanged){
      var changeReq = {
        uid: curUid,
        memberId: id,
        room: CODE,
        roomName: (P.meta && P.meta.name) || (CODE === "1432014310" ? "Queen Room" : "স্টাডি রুম"),
        name: nameVal,
        oldClass: cur.cls || curBaseCls,
        requestedClass: fullRequestedCls,
        passingYear: yearVal,
        requestedAt: Date.now(),
        status: "pending"
      };
      var dbx2 = window.db || firebase.database();
      dbx2.ref("class_change_requests").push(changeReq).catch(function(){});
      toast("আপনার Class পরিবর্তনের আবেদনটি অ্যাডমিন প্যানেলে পাঠানো হয়েছে।", 5000);
    }

    enter(id);
    put(id, function(p){
      p.name = nameVal;
      p.college = collegeVal;
      p.goal = goalVal;
      p.mobile = mobVal;
      p.uid = curUid;
      if(!isClassChanged){
        p.cls = fullRequestedCls;
        p.classBase = selClass;
        p.passingYear = yearVal;
      }
    });

    if(id === "p1" || id === "p2"){
      try {
        localStorage.setItem("vip_" + id + "_name", nameVal);
      } catch(e){}
      var dbx3 = window.db || firebase.database();
      dbx3.ref("vip_users/" + id).update({
        name: nameVal,
        college: collegeVal,
        goal: goalVal,
        mobile: mobVal,
        uid: curUid
      }).catch(function(){});
    }

    var logoImg = document.querySelector(".brand .logo");
    if(logoImg) logoImg.src = getLogo(goalVal);
    var whoEl = $("who");
    if(whoEl) whoEl.textContent = "✏️ " + nameVal;

    QB = {};
    setQ($("qt"));

    m.hidden = true;
    m.setAttribute("hidden", "");
    m.style.setProperty("display", "none", "important");
    if(!isClassChanged){
      toast("প্রোফাইল আপডেট হয়েছে ✓");
    }
  };
}

var whoTop = $("who");
if(whoTop){
  whoTop.onclick = function(e){
    if(e){ e.preventDefault(); e.stopPropagation(); }
    if(!MON && me) editProfileModal(me);
  };
}

var QB = {};
function nextQ(){
  var myGoal = (me && pl(me).goal) || "Medical";
  var cat = MOT[myGoal] ? myGoal : "Other";
  if(!QB[cat] || !QB[cat].length){
    QB[cat] = MOT[cat].slice().sort(function(){ return Math.random() - 0.5; });
  }
  return QB[cat].pop() || MOT[cat][0];
}

function setQ(q){
  if(!q) return;
  var t = nextQ();
  q.textContent = t;
  var myGoal = (me && pl(me).goal) || "Medical";
  q.classList.toggle("sp", myGoal === "Medical" && SQ.indexOf(t) > -1);
}

function qInit(){
  var q=$("qt");
  setQ(q);
  setInterval(function(){
    if(!q) return;
    q.classList.add("f");
    setTimeout(function(){
      setQ(q);
      q.classList.remove("f");
    }, 400);
  }, 30000);
}

function examSync(){
  var b=$("exam");if(!b)return;
  var x=P.exam||{},t=x.t,k=t+"|"+(x.n||"");if(exB===k)return;exB=k;b.textContent="";
  b.appendChild(el("h2",null,"🎯 "+(x.n||"পরীক্ষার")+" কাউন্টডাউন"));var c=el("div","exc");c.id="exn";b.appendChild(c);
  var r=el("div","row");r.style.marginTop="8px";
  var n=el("input","tr");n.type="text";n.maxLength=40;n.placeholder="পরীক্ষার নাম (যেমন: HSC, মডেল টেস্ট)";n.value=x.n||"";n.setAttribute("aria-label","পরীক্ষার নাম");
  var i=el("input");i.type="datetime-local";i.setAttribute("aria-label","পরীক্ষার তারিখ");
  if(t)i.value=new Date(t-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,16);
  var s=el("button","btn ghost",t?"সেভ করো":"সেট করো");s.type="button";
  s.onclick=function(){var v=new Date(i.value).getTime();if(!v||!ref){toast("আগে একটা তারিখ বেছে নাও");return}ref.child("exam").set({t:v,n:n.value.trim()})};
  if(!MON){r.appendChild(n);r.appendChild(i);r.appendChild(s);b.appendChild(r)}examTick()
}

function examTick(){var c=$("exn");if(!c)return;var t=P.exam&&P.exam.t;if(!t){c.textContent="তারিখ সেট করা হয়নি";return}
  var ms=t-NOW();if(ms<=0){c.textContent="পরীক্ষার সময় হয়ে গেছে। সবার জন্য দোয়া, আল্লাহ ভরসা!";return}
  var s=Math.floor(ms/1000),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);s%=60;
  c.textContent=bn(d)+" দিন "+bn(h)+" ঘণ্টা "+bn(m)+" মিনিট "+bn(s)+" সেকেন্ড"}

function chatUI(){var l=$("cl");if(!l)return;var c=P.chat||{},ks=Object.keys(c).sort().slice(-100),near=l.scrollHeight-l.scrollTop-l.clientHeight<80;l.textContent="";
  if(!ks.length)l.appendChild(el("p","mute","এখনো কোনো মেসেজ নেই। প্রথম মেসেজটা তুমিই পাঠাও।"));
  ks.forEach(function(k){var m=c[k],d=el("div","msg"+(m.u===me?" me":""));if(m.u!==me)d.appendChild(el("small",null,m.n||nm(m.u)));
    d.appendChild(el("span",null,m.x||""));if(m.e)d.appendChild(el("small","ed","*"));var ts=el("small","mt",m.t?new Date(m.t).toLocaleTimeString("bn-BD",{hour:"numeric",minute:"2-digit"}):"");
    if(m.u===me){var ed=el("button","del","✎");ed.type="button";ed.setAttribute("aria-label","মেসেজ এডিট");ed.onclick=function(){chatEditStart(k,m.x)};ts.appendChild(ed);var x=el("button","del","×");x.type="button";x.setAttribute("aria-label","মেসেজ মুছো");x.onclick=function(){ask("এই মেসেজটা মুছতে চাও?",function(){ref.child("chat/"+k).remove()})};ts.appendChild(x)}
    d.appendChild(ts);l.appendChild(d)});
  if(near)l.scrollTop=l.scrollHeight}

function chatEditStart(k,t){CE=k;var i=$("ci");i.value=t||"";i.focus();$("cx").hidden=false;$("csb").textContent="সেভ ✓"}
function chatEditEnd(){CE=null;$("ci").value="";$("cx").hidden=true;$("csb").textContent="পাঠাও ➤"}
var cxBtn = $("cx"); if(cxBtn) cxBtn.onclick = chatEditEnd;

function chatSend(){var i=$("ci"),v=i.value.trim();if(!v||!me||!ref||MON)return;
  if(CE){var o=P.chat&&P.chat[CE];if(!o||o.u!==me){toast("মেসেজটা আর নেই");chatEditEnd();return}
    if(v!==o.x){ref.child("chat/"+CE+"/x").set(v.slice(0,500));ref.child("chat/"+CE+"/e").set(1).catch(function(){toast("এডিট হয়নি, ইন্টারনেট দেখো")})}chatEditEnd();return}ref.child("chat").push({u:me,n:nm(me),x:v.slice(0,500),t:firebase.database.ServerValue.TIMESTAMP}).catch(function(){toast("মেসেজ যায়নি, ইন্টারনেট দেখো")});i.value=""}

function delDay(k){var p=pl(me),f=function(x){return key(new Date(x.a))===k},d={days:p.days[k]||null,mins:p.mins[k]||0,pr:p.pr[k]||null,sess:p.sess.filter(f)};
  ref.child("bk/"+me+"_"+Date.now()).set({o:me,k:k,t:Date.now(),d:d}).then(function(){put(me,function(q){delete q.days[k];delete q.mins[k];delete q.pr[k];q.sess=q.sess.filter(function(x){return !f(x)})});toast("ব্যাকআপ রেখে মুছে ফেলা হয়েছে");hist(me,k)}).catch(function(){toast("ব্যাকআপ হয়নি, তাই কিছু মোছা হয়নি")})}
function restore(v){var d=v.d||{};put(me,function(q){if(d.days)q.days[v.k]=d.days;if(d.mins)q.mins[v.k]=d.mins;if(d.pr)q.pr[v.k]=d.pr;q.sess=q.sess.filter(function(x){return key(new Date(x.a))!==v.k}).concat(d.sess||[])});toast("ফিরিয়ে আনা হয়েছে");hist(me,v.k)}

function hist(id,k){
  k = k || key(new Date());
  var m=$("modal"),b=$("mbox");b.textContent="";b.style.maxWidth="560px";
  m.hidden=false;m.removeAttribute("hidden");m.style.setProperty("display","grid","important");
  var p=pl(id),tabs=el("div","row");tabs.style.marginTop="0";
  var mems = getOrderedMembers();
  mems.forEach(function(x){
    var t=el("button","btn"+(x===id?"":" ghost")+(x!==me?" alt":""),nm(x));
    t.type="button";t.onclick=function(){hist(x,k)};tabs.appendChild(t);
  });
  var cl=el("button","btn ghost","✕");cl.type="button";cl.setAttribute("aria-label","বন্ধ করো");
  cl.onclick=function(){m.hidden=true;m.setAttribute("hidden","");m.style.setProperty("display","none","important");};
  var wbn=el("button","btn ghost","📊 সাপ্তাহিক");wbn.type="button";wbn.onclick=function(){weeklyHist()};tabs.appendChild(wbn);tabs.appendChild(cl);b.appendChild(tabs);
  var di=el("input");di.type="date";di.value=k;di.style.cssText="width:100%;margin-top:10px";di.onchange=function(){if(di.value)hist(id,di.value)};b.appendChild(di);
  var a=p.days[k]||[],c=cnt(p,k),ss=(p.sess||[]).filter(function(x){return key(new Date(x.a))===k}),pr=p.pr[k]||"00000";
  b.appendChild(el("h2",null,"কাজ "+bn(c[0])+"/"+bn(c[1])+" শেষ · পড়া "+fmtHM(p.mins[k]||0)));
  a.forEach(function(t){var r=el("div","ses"),tx=el("span",t.d||t.x?"mute":"",(t.x?"✕ ":t.d?"✓ ":"○ ")+t.t+(t.x?" (মোছা)":""));if(t.x)tx.style.textDecoration="line-through";r.appendChild(tx);
    if(id===me&&!MON){var dl=el("button","del","🗑");dl.type="button";dl.setAttribute("aria-label","কাজটা পাকাপাকি মুছো");dl.onclick=function(){ask("আপনি কি নিশ্চিত যে এই কাজটা ইতিহাস থেকে পাকাপাকি মুছতে চান? এটা আর ফেরানো যাবে না।",function(){delTask(k,t.i)},function(){hist(id,k)})};r.appendChild(dl)}
    b.appendChild(r)});
  b.appendChild(el("p",null,"নামাজ: "+PR.map(function(n,i){return n+(pr[i]==="1"?" ✓":" ✗")}).join(" · ")));
  ss.forEach(function(x){var r=el("div","ses");r.appendChild(el("span",null,x.s+(x.tp?" — "+x.tp:"")));r.appendChild(el("b",null,fmtHM(x.m)));b.appendChild(r)});
  if(!a.length&&!ss.length&&!p.mins[k])b.appendChild(el("p","mute","এই দিনের কোনো হিসাব নেই।"));
  if(id!==me||MON)return;
  var bt=el("button","btn ghost","🗑 এই দিনের হিসাব মুছো");bt.type="button";bt.style.marginTop="12px";
  bt.onclick=function(){b.textContent="";b.appendChild(el("h2",null,"আপনি কি নিশ্চিত যে এই দিনের ("+k+") History-টি ডিলিট করতে চান?"));b.appendChild(el("p","mute","ডিলিটের আগে ব্যাকআপ তৈরি হবে।"));
    var r=el("div","row"),y=el("button","btn alt","Confirm Delete"),n=el("button","btn ghost","Cancel");y.type=n.type="button";y.onclick=function(){delDay(k)};n.onclick=function(){hist(me,k)};r.appendChild(y);r.appendChild(n);b.appendChild(r)};
  b.appendChild(bt);
  var bk=P.bk||{},bl=Object.keys(bk).filter(function(x){return bk[x].o===me}).sort().reverse();
  b.appendChild(el("h2",null,"ব্যাকআপ ("+bn(bl.length)+")"));
  bl.forEach(function(x){var v=bk[x],r=el("div","ses"),rb=el("button","btn ghost","ফিরিয়ে আনো");rb.type="button";rb.onclick=function(){restore(v)};r.appendChild(el("span",null,v.k+" · মোছা: "+new Date(v.t).toLocaleDateString("bn-BD",{day:"numeric",month:"short"})));r.appendChild(rb);b.appendChild(r)})}

// আজকের কাজ সাবমিট লজিক
var addForm = $("addForm");
if(addForm){
  addForm.onsubmit = function(e){
    if(e) { e.preventDefault(); e.stopPropagation(); }
    var inp = $("newTask");
    var v = inp ? inp.value.trim() : "";
    if(!v || !me || MON) return false;

    var dt = new Date(), late = dt.getHours() >= 22;
    if(late) dt.setDate(dt.getDate() + 1);
    var k = key(dt);

    put(me, function(p){
      p.days = p.days || {};
      p.days[k] = p.days[k] || [];
      p.days[k].push({ i: NOW() + "" + Math.floor(Math.random()*1e3), t: v, d: 0 });
    });

    if(inp) inp.value = "";
    if(late) toast("রাত ১০টার পর যোগ করা কাজ আগামীকালের তালিকায় গেছে", 6000);
    return false;
  };
}

var cfForm = $("cf"); if(cfForm) cfForm.addEventListener("submit",function(e){e.preventDefault();chatSend()});
var emCont = $("em"); if(emCont) { emCont.innerHTML = ""; ["😊","👍","🔥","💪","🤲","❤️"].forEach(function(e){var x=el("button","pill",e);x.type="button";x.onclick=function(){$("ci").value+=e;$("ci").focus()};emCont.appendChild(x)}); }

function speakBreak(){var S=window.speechSynthesis;if(!S)return;S.cancel();var N=nm(me),V=S.getVoices(),hasBn=V.some(function(x){return x.lang.toLowerCase().indexOf("bn")===0});
  function sp(t,l){var v=V.filter(function(x){return x.lang.replace("_","-").toLowerCase().indexOf(l.slice(0,2))===0})[0];if(!v&&l==="bn-BD")return;var u=new SpeechSynthesisUtterance(t);u.lang=l;if(v)u.voice=v;u.rate=.92;S.speak(u)}
  if(N){sp(N,"en-US");sp(N,"en-US")}
  sp("তোমার বিরতির সময় শেষ হলো। এবার নিজের টেবিলে গিয়ে আবার মন দিয়ে পড়তে বসো, তোমার লক্ষ্য পূরণের জন্য।","bn-BD");
  sp("Your break time is over. Now go to your table and study again, hard, to achieve your goal.","en-US");
  if(!hasBn)toast("এই ব্রাউজারে বাংলা ভয়েস নেই, তাই শুধু ইংরেজি অংশ বাজবে")}

function prayUI(){
  var c=$("pray");if(!c)return;var k=key(new Date());c.textContent="";
  c.appendChild(el("h2",null,"🕌 প্রতিদিনের সালাত/নামাজ ট্র্যাকার"));

  var mems = getOrderedMembers();
  mems.forEach(function(id,j){
    var isMe = (id===me && !MON),s=pl(id).pr[k]||"00000",n=s.split("").filter(function(x){return x==="1"}).length;
    c.appendChild(el("div","mute",nm(id)+(isMe?" (তুমি)":"")+" · "+bn(n)+"/"+bn(5)));
    var g=el("div","pg"+(isMe?"":" o"));
    PR.forEach(function(z,i){var on=s[i]==="1",b=el("button","pbx"+(on?" on":""));b.type="button";b.setAttribute("aria-pressed",on);b.appendChild(el("b",null,z));b.appendChild(el("span",null,on?"✓ আদায় হয়েছে":"বাকি আছে"));
      if(isMe)b.onclick=function(){put(me,function(q){var a=(q.pr[k]||"00000").split("");a[i]=a[i]==="1"?"0":"1";q.pr[k]=a.join("")})};else b.disabled=true;g.appendChild(b)});c.appendChild(g)
  });
}

var swbBtn = $("swb"); if(swbBtn) swbBtn.onclick=function(){chooser(true)};

function ask(t,ok,bk){
  var m=$("modal"),b=$("mbox");b.textContent="";b.style.maxWidth="";
  m.hidden=false;m.removeAttribute("hidden");m.style.setProperty("display","grid","important");
  b.appendChild(el("h2",null,t));
  var r=el("div","row"),y=el("button","btn alt","হ্যাঁ, মুছো"),n=el("button","btn ghost","বাতিল");
  y.type=n.type="button";
  y.onclick=function(){m.hidden=true;m.setAttribute("hidden","");m.style.setProperty("display","none","important");ok();};
  n.onclick=function(){m.hidden=true;m.setAttribute("hidden","");m.style.setProperty("display","none","important");if(bk)bk();};
  r.appendChild(y);r.appendChild(n);b.appendChild(r);
}

var cclrBtn = $("cclr"); if(cclrBtn) cclrBtn.onclick=function(){if(!ref)return;ask("চ্যাটের সব মেসেজ মুছে যাবে সবার। আর ফেরানো যাবে না। মুছবে?",function(){ref.child("chat").remove()})};

function brkModal(id){
  var p=pl(id);if(!brkOn(p))return;var m=$("modal"),b=$("mbox"),tot=(p.brk.m||1)*6e4;b.textContent="";b.style.maxWidth="380px";
  m.hidden=false;m.removeAttribute("hidden");m.style.setProperty("display","grid","important");
  b.classList.add("pop");setTimeout(function(){b.classList.remove("pop")},600);
  var h=el("h2",null,"☕ "+nm(id)+" ("+bn(p.brk.m)+") মিনিটের Break নিচ্ছে।");h.style.textAlign="center";b.appendChild(h);
  var w=el("div","ringw");w.innerHTML='<svg class="ring" viewBox="0 0 220 220" aria-hidden="true"><defs><linearGradient id="brg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3fcaa2"/><stop offset="1" stop-color="#a995ff"/></linearGradient></defs><circle class="rt" cx="110" cy="110" r="90"/><circle class="rp" id="brp" style="stroke:url(#brg)" cx="110" cy="110" r="90" stroke-dasharray="565.49" stroke-dashoffset="0"/></svg>';
  var rc=el("div","rc"),cd=el("b","bd");cd.dataset.own=id;cd.dataset.tot=tot;var rem=Math.max(0,p.brk.e-NOW());cd.textContent=fmtClock(rem);rc.appendChild(cd);rc.appendChild(el("div","mute","বিরতি শেষ হতে বাকি"));w.appendChild(rc);b.appendChild(w);
  w.querySelector("#brp").style.strokeDashoffset=CR*(1-rem/tot);
  var r=el("div","row");r.style.justifyContent="center";var cl=el("button","btn ghost","বন্ধ করো");cl.type="button";
  cl.onclick=function(){m.hidden=true;m.setAttribute("hidden","");m.style.setProperty("display","none","important");};
  r.appendChild(cl);b.appendChild(r);
}

var DN=["শনি","রবি","সোম","মঙ্গল","বুধ","বৃহ","শুক্র"];
function dfmt(d){return d.toLocaleDateString("bn-BD",{day:"numeric",month:"short"})}
function wkStart(d){var x=new Date(d.getTime());x.setHours(0,0,0,0);x.setDate(x.getDate()-(x.getDay()+1)%7);return x}
function wkKeys(st){var a=[];for(var i=0;i<7;i++){var d=new Date(st.getTime());d.setDate(d.getDate()+i);a.push(key(d))}return a}
function wkStat(p,ks){var c=0,t=0,m=0;ks.forEach(function(k){var a=(p.days[k]||[]).filter(function(x){return !x.x});t+=a.length;c+=a.filter(function(x){return x.d}).length;m+=dm(p,k)});return{c:c,t:t,m:m}}
function wkCalc(st){var ks=wkKeys(st),A=wkStat(pl(me),ks),B=wkStat(pl(other()),ks),tc=A.c+B.c,tm=A.m+B.m,
  fa=Math.round((tm?A.m/tm*100:0)/2+(tc?A.c/tc*100:0)/2),fb=Math.round((tm?B.m/tm*100:0)/2+(tc?B.c/tc*100:0)/2);
  return{ks:ks,A:A,B:B,fa:fa,fb:fb,has:!!(A.t||B.t||A.m||B.m),win:fa>fb?1:fb>fa?2:0}}

function wboard(){var c=$("wk");if(!c)return;var st=wkStart(new Date()),w=wkCalc(st),fri=new Date().getDay()===5,en=new Date(st.getTime());en.setDate(en.getDate()+6);c.textContent="";
  var h=el("div","wkh");h.appendChild(el("div","wkt","👑 সাপ্তাহিক লিডারবোর্ড"));h.appendChild(el("span","wkb"+(fri?" fr":""),fri?"🎉 সপ্তাহের ফলাফল":"চলমান সপ্তাহ"));c.appendChild(h);
  c.appendChild(el("div","wks",dfmt(st)+" – "+dfmt(en)+" · শনিবার থেকে শুক্রবার"));
  if(!w.has){c.appendChild(el("p","wks","এই সপ্তাহে এখনো কোনো হিসাব নেই। কাজ যোগ করো আর পড়া শুরু করো!"));return}
  var R=[{id:me,s:w.A,f:w.fa},{id:other(),s:w.B,f:w.fb}];if(w.win===2)R.reverse();
  if(fri){var f=el("div","wkf"),wn=w.win===0?null:R[0];f.appendChild(el("b",null,wn?"🏆 এই সপ্তাহের বিজয়ী: "+nm(wn.id):"🤝 এই সপ্তাহে দুজনেই বিজয়ী"));
    f.appendChild(el("div","wks",wn?"পুরো সপ্তাহে "+bn(wn.s.c)+"টা কাজ শেষ আর "+fmtHM(wn.s.m)+" পড়া। এই ধারাবাহিকতাই স্বপ্নের পথ।":"দুজনেই সমান তালে লড়েছো। এভাবেই একে অপরকে এগিয়ে নাও।"));c.appendChild(f)}
  else c.appendChild(el("div","wks",w.win===0?"এখন দুজনেই সমান। শুক্রবারে চূড়ান্ত ফল।":"এখন এগিয়ে: "+nm(R[0].id)+"। শুক্রবারে চূড়ান্ত ফল।"));
  var g=el("div","wkp");R.forEach(function(r,i){var top=i===0||w.win===0,d=el("div","wkr"+(top?" lead":"")+(r.id===me?" g":" v"));
    d.appendChild(el("div","wkm",(top?"🥇":"🥈")+(w.win===0?" Joint":i===0?" ১ম":" ২য়")));d.appendChild(el("b",null,nm(r.id)));
    var n=el("div","wkn");n.appendChild(el("span",null,bn(r.s.c)));n.appendChild(el("small",null,"টা কাজ শেষ"));d.appendChild(n);
    d.appendChild(el("div","wkx","⏱ "+fmtHM(r.s.m)+" · স্কোর "+bn(r.f)));
    var bar=el("div","wbar"),fi=el("i");fi.style.width=r.f+"%";bar.appendChild(fi);d.appendChild(bar);g.appendChild(d)});c.appendChild(g);
  var mx=1,cs=w.ks.map(function(k){var a=(pl(me).days[k]||[]).filter(function(y){return y.d&&!y.x}).length,b=(pl(other()).days[k]||[]).filter(function(y){return y.d&&!y.x}).length;mx=Math.max(mx,a,b);return[a,b]});
  c.appendChild(el("div","wks","দিন অনুযায়ী শেষ করা কাজ"));var ch=el("div","wch");
  cs.forEach(function(v,i){var col=el("div","wcc"),bs=el("div","wcb");v.forEach(function(n,j){var b=el("i",j?"v":"g");b.style.height=Math.max(3,n/mx*100)+"%";b.title=bn(n);bs.appendChild(b)});col.appendChild(bs);col.appendChild(el("small",null,DN[i]));ch.appendChild(col)});c.appendChild(ch)}

function weeklyHist(){var m=$("modal"),b=$("mbox");b.textContent="";b.style.maxWidth="560px";
  m.hidden=false;m.removeAttribute("hidden");m.style.setProperty("display","grid","important");
  var tabs=el("div","row");tabs.style.marginTop="0";
  var mems = getOrderedMembers();
  mems.forEach(function(x){var t=el("button","btn ghost"+(x!==me?" alt":""),nm(x));t.type="button";t.onclick=function(){hist(x)};tabs.appendChild(t)});
  var wbn=el("button","btn","📊 সাপ্তাহিক");wbn.type="button";tabs.appendChild(wbn);
  var cl=el("button","btn ghost","✕");cl.type="button";cl.setAttribute("aria-label","বন্ধ করো");
  cl.onclick=function(){m.hidden=true;m.setAttribute("hidden","");m.style.setProperty("display","none","important");};
  tabs.appendChild(cl);b.appendChild(tabs);
  b.appendChild(el("h2",null,"আগের সপ্তাহগুলোর ফলাফল"));var cur=key(wkStart(new Date())),set={};
  [pl(me),pl(other())].forEach(function(p){Object.keys(p.days).concat(Object.keys(p.mins)).forEach(function(k){set[key(wkStart(new Date(k+"T00:00:00")))]=1})});
  var ws=Object.keys(set).filter(function(k){return k<cur}).sort().reverse(),shown=0;
  ws.forEach(function(k){var st=new Date(k+"T00:00:00"),w=wkCalc(st),en=new Date(st.getTime());en.setDate(en.getDate()+6);if(!w.has)return;shown++;
    var r=el("div","dl"),hd=el("div","dh");hd.appendChild(el("b",null,dfmt(st)+" – "+dfmt(en)));hd.appendChild(el("span","dwn",w.win===0?"🤝 Joint Winner":"🏆 "+nm(w.win===1?me:other())));r.appendChild(hd);
    r.appendChild(drow(nm(me),w.A.m,[w.A.c,w.A.t],w.fa,w.win!==2,"g"));r.appendChild(drow(nm(other()),w.B.m,[w.B.c,w.B.t],w.fb,w.win!==1,"v"));b.appendChild(r)});
  if(!shown)b.appendChild(el("p","mute","এখনো কোনো পুরনো সপ্তাহের হিসাব নেই।"))}

function normUrl(u){u=(u||"").trim();if(!u)return"";if(!/^[a-z][a-z0-9+.-]*:/i.test(u))u="https://"+u;try{var x=new URL(u);return x.protocol==="https:"||x.protocol==="http:"?x.href:""}catch(e){return""}}
function closeMenus(){document.querySelectorAll(".scp").forEach(function(x){x.remove()})}
document.addEventListener("click",closeMenus);

function scMenu(t,s){closeMenus();var m=el("div","scp");
  [["✏️ এডিট",function(){scForm(s)}],["🗑 ডিলিট",function(){ask("আপনি কি নিশ্চিত যে «"+s.n+"» শর্টকাটটা মুছতে চান?",function(){put(me,function(q){q.sc=(q.sc||[]).filter(function(x){return x.i!==s.i})})})}]].forEach(function(o){var b=el("button",null,o[0]);b.type="button";b.onclick=function(e){e.stopPropagation();closeMenus();o[1]()};m.appendChild(b)});t.appendChild(m)}

function scForm(s){var m=$("modal"),b=$("mbox");b.textContent="";b.style.maxWidth="";
  m.hidden=false;m.removeAttribute("hidden");m.style.setProperty("display","grid","important");
  b.appendChild(el("h1",null,s?"শর্টকাট এডিট":"নতুন শর্টকাট"));
  var n=el("input");n.type="text";n.maxLength=20;n.placeholder="নাম (যেমন: Khan Academy)";n.value=s?s.n:"";n.style.cssText="width:100%;margin-top:12px";n.setAttribute("aria-label","শর্টকাটের নাম");b.appendChild(n);
  var u=el("input");u.type="text";u.maxLength=300;u.placeholder="ওয়েবসাইটের লিংক (https://...)";u.value=s?s.u:"";u.style.cssText="width:100%;margin-top:10px";u.setAttribute("aria-label","ওয়েবসাইটের লিংক");b.appendChild(u);
  var er=el("p","mute","");b.appendChild(er);var r=el("div","row"),ok=el("button","btn",s?"সেভ":"যোগ করো"),cn=el("button","btn ghost","বাতিল");ok.type=cn.type="button";
  cn.onclick=function(){m.hidden=true;m.setAttribute("hidden","");m.style.setProperty("display","none","important");};
  ok.onclick=function(){var nv=n.value.trim(),url=normUrl(u.value);if(!nv){er.textContent="নাম লেখো।";return}if(!url){er.textContent="সঠিক ওয়েবসাইটের লিংক দাও (https://...)।";return}
    if(!s&&pl(me).sc.length>=30){er.textContent="সর্বোচ্চ ৩০টা শর্টকাট রাখা যায়।";return}
    put(me,function(q){q.sc=q.sc||[];if(s)q.sc.forEach(function(x){if(x.i===s.i){x.n=nv;x.u=url}});else q.sc.push({i:NOW()+""+Math.floor(Math.random()*1e3),n:nv,u:url})});
    m.hidden=true;m.setAttribute("hidden","");m.style.setProperty("display","none","important");};
  r.appendChild(ok);r.appendChild(cn);b.appendChild(r);setTimeout(function(){n.focus()},0)}

function scUI(){var c=$("scard");if(!c||MON)return;var L=pl(me).sc,k=JSON.stringify(L);if(c.dataset.k===k)return;c.dataset.k=k;c.textContent="";c.appendChild(el("h2",null,"🔗 পড়ার শর্টকাট"));var g=el("div","sct");
  L.forEach(function(s){var t=el("div","sc"),a=el("a","sca");if(/^https?:\/\//i.test(s.u)){a.href=s.u;a.target="_blank";a.rel="noopener noreferrer"}a.setAttribute("aria-label",s.n);
    a.appendChild(el("i","sci",(s.n||"?").trim().charAt(0).toUpperCase()));a.appendChild(el("span",null,s.n));t.appendChild(a);
    var mb=el("button","scm","⋮");mb.type="button";mb.setAttribute("aria-label",s.n+" মেনু");mb.onclick=function(e){e.stopPropagation();scMenu(t,s)};t.appendChild(mb);g.appendChild(t)});
  var ad=el("button","sc scadd");ad.type="button";ad.appendChild(el("i","sci","+"));ad.appendChild(el("span",null,"যোগ করো"));ad.onclick=function(){scForm()};g.appendChild(ad);c.appendChild(g)}

function delTask(k,i){put(me,function(q){q.days[k]=(q.days[k]||[]).filter(function(x){return x.i!==i})});toast("কাজটা পাকাপাকি মুছে গেছে");hist(me,k)}

function carryUI(){var m=$("modal"),b=$("mbox"),p=pl(me),td=key(new Date()),taken={},list=[];
  m.hidden=false;m.removeAttribute("hidden");m.style.setProperty("display","grid","important");
  b.textContent="";b.style.maxWidth="520px";
  Object.keys(p.days).forEach(function(k){(p.days[k]||[]).forEach(function(x){if(x.f)taken[x.f]=1})});
  Object.keys(p.days).sort().reverse().forEach(function(k){if(k>=td)return;(p.days[k]||[]).forEach(function(x){if(!x.d&&!x.x&&!taken[k+"|"+x.i])list.push({k:k,x:x})})});
  b.appendChild(el("h2",null,"আগের অসম্পূর্ণ কাজ"));
  var row=el("div","row"),cn=el("button","btn ghost",list.length?"বাতিল":"বন্ধ করো");cn.type="button";
  cn.onclick=function(){m.hidden=true;m.setAttribute("hidden","");m.style.setProperty("display","none","important");};
  if(!list.length){b.appendChild(el("p","mute","আগের দিনের কোনো অসম্পূর্ণ কাজ নেই।"));row.appendChild(cn);b.appendChild(row);return}
  var ck=[];list.forEach(function(it){var r=el("label","ses"),l=el("span");l.appendChild(el("b",null,it.x.t));l.appendChild(el("small",null,new Date(it.k+"T00:00:00").toLocaleDateString("bn-BD",{day:"numeric",month:"short"})));
    var c=el("input");c.type="checkbox";c.style.cssText="width:20px;height:20px;accent-color:var(--a);flex:none";c.setAttribute("aria-label",it.x.t);ck.push(c);r.appendChild(l);r.appendChild(c);b.appendChild(r)});
  var go=el("button","btn","আজকের তালিকায় যোগ করো");go.type="button";
  go.onclick=function(){var sel=list.filter(function(it,j){return ck[j].checked});if(!sel.length){toast("আগে কাজ বেছে নাও");return}
    put(me,function(q){sel.forEach(function(it,j){(q.days[td]=q.days[td]||[]).push({i:NOW()+""+j+Math.floor(Math.random()*1e3),t:it.x.t,d:0,f:it.k+"|"+it.x.i})})});
    m.hidden=true;m.setAttribute("hidden","");m.style.setProperty("display","none","important");
    toast(bn(sel.length)+"টা কাজ আজকের তালিকায় যোগ হয়েছে")};
  row.appendChild(go);row.appendChild(cn);b.appendChild(row)}
var carryBtn = $("carry"); if(carryBtn) carryBtn.onclick=function(){if(!MON)carryUI()};

function visOn(){return document.visibilityState==="visible"&&document.hasFocus()}
function setPres(on){if(MON||!me||!ref)return;ref.child("pres/"+me).set(on).catch(function(){})}
function goOnline(){if(MON||!me||!ref)return;var r=ref.child("pres/"+me);r.onDisconnect().set(false).then(function(){r.set(visOn())}).catch(function(){})}
var pt;function visSync(){if(MON||!me||!ref)return;clearTimeout(pt);if(visOn())setPres(true);else pt=setTimeout(function(){if(!visOn())setPres(false)},1500)}
document.addEventListener("visibilitychange",visSync);window.addEventListener("focus",visSync);window.addEventListener("blur",visSync);
window.addEventListener("pagehide",function(){if(ref&&!MON&&me)try{ref.child("pres/"+me).set(false)}catch(e){}});

function enter(id){try{localStorage.setItem("sr-me",id)}catch(e){}MON=false;me=id;
  var m=$("modal"); if(m){ m.hidden=true; m.setAttribute("hidden",""); m.style.setProperty("display","none","important"); }
  goOnline();render();
}

function clrBrk(){put(me,function(q){q.brk=null;resumeStudy(q,NOW())})}
function brkSync(){
  if(!me)return;
  var p=pl(me),s=p.study;
  if(brkOn(p)&&!BR.run){
    BR.run=true;BR.end=p.brk.e;BR.m=p.brk.m||BR.m;BR.rem=Math.round((BR.end-NOW())/1000);
  } else if(s&&s.ps&&!BR.run&&!brkOn(p)&&NOW()>RW){
    RW=NOW()+2000;
    put(me,function(q){resumeStudy(q,NOW())});
  }
}

function unlockAudio(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume()}catch(e){}
  try{var S=window.speechSynthesis;if(S&&window.SpeechSynthesisUtterance){var u=new SpeechSynthesisUtterance(" ");u.volume=0;S.speak(u)}}catch(e){}}
function bestVoice(){var S=window.speechSynthesis;if(!S)return null;var b=null,bs=-1;
  S.getVoices().filter(function(v){return /^en/i.test(v.lang)}).forEach(function(v){var c=(/natural|neural/i.test(v.name)?4:0)+(/online/i.test(v.name)?3:0)+(/google/i.test(v.name)?2:0)+(/en[-_](us|gb)/i.test(v.lang)?1:0);if(c>bs){bs=c;b=v}});return b}
function longBeep(cb){var done=false;function fin(){if(done)return;done=true;if(cb)cb()}
  try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();
    var o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+.05;o.type="sine";o.frequency.value=880;o.connect(g);g.connect(AC.destination);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.3,t+.03);g.gain.setValueAtTime(.3,t+1.47);g.gain.linearRampToValueAtTime(0,t+1.5);
    o.onended=fin;o.start(t);o.stop(t+1.5)}catch(e){fin();return}
  setTimeout(fin,2000)}
function speakCompletionMessage(userName){var S=window.speechSynthesis;if(!S||!window.SpeechSynthesisUtterance||NOW()-SP<8000)return;SP=NOW();
  try{S.cancel();var n=nm(me),u=new SpeechSynthesisUtterance("Well done"+(n?", "+n:"")+"! You have completed your task perfectly. You can take a short break."),v=bestVoice();
    u.lang=v?v.lang:"en-US";if(v)u.voice=v;u.rate=.95;u.pitch=1;u.volume=1;u.onerror=function(e){console.warn("speech error",e&&e.error)};S.speak(u)}catch(e){console.warn(e)}}

// ডাটাবেস সংযোগ ও সেন্ট্রাল সিঙ্ক
function connect(){
  var warnEl = $("warn");
  if(!window.firebase || (!window.db && (typeof FB_CONFIG==="undefined" || !FB_CONFIG.databaseURL))){
    if(warnEl) {
      warnEl.textContent = (CODE === "1432014310") ? "ডেটাবেসের সাথে যোগ হচ্ছে না। ইন্টারনেট আছে তো? Firebase-এর কোড ঠিকমতো বসানো আছে তো?" : "দুঃখিত, আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন এবং পেজটি রিফ্রেশ দিন।";
      warnEl.hidden = false;
    }
    return;
  }
  var dbx = window.db || (firebase.apps.length ? firebase.database() : firebase.initializeApp(FB_CONFIG).database());

  var roomPath = (CODE === "1432014310") ? ("rooms/" + CODE) : ("rooms_v2/" + CODE);
  ref = dbx.ref(roomPath);

  // ভিআইপি ইউজারদের টাস্ক ও পড়ার সময় সব রুমে একই রাখা
  if(me === "p1" || me === "p2"){
    dbx.ref("vip_users/" + me).once("value", function(vipSnap){
      if(vipSnap.exists()){
        var vData = vipSnap.val() || {};
        ref.child(me).update({
          name: vData.name || (me==="p1"?"Tasfia Hasan":"Rahman"),
          college: vData.college || "",
          cls: vData.cls || "",
          goal: vData.goal || "Medical",
          mobile: vData.mobile || "",
          days: vData.days || {},
          mins: vData.mins || {},
          pr: vData.pr || {},
          sc: vData.sc || []
        });
      }
    });
  }

  dbx.ref(".info/serverTimeOffset").on("value",function(o){OFF=o.val()||0});
  ref.on("value",function(sn){
    var d=sn.val()||{},ch=first;first=false;
    if(d.members){
      Object.keys(d.members).forEach(function(mid){
        d[mid] = d[mid] || {};
        if(!d[mid].name) d[mid].name = d.members[mid].name;
        if(!d[mid].college) d[mid].college = d.members[mid].college;
        if(!d[mid].cls) d[mid].cls = d.members[mid].cls;
        if(!d[mid].goal) d[mid].goal = d.members[mid].goal;
        if(!d[mid].mobile) d[mid].mobile = d.members[mid].mobile;
      });
    }
    for(var id in d){if(id===me&&NOW()-(dirty[id]||0)<4000)continue;if(JSON.stringify(P[id])!==JSON.stringify(d[id])){P[id]=d[id];ch=true}}
    for(var k in P){if(!(k in d)&&!(k===me&&NOW()-(dirty[k]||0)<4000)){delete P[k];ch=true}}
    if(P[me] && P[me].name){
      try { localStorage.setItem("sr-name", P[me].name); } catch(e){}
    }
    if(ch)render();
    var q=PEND;PEND=[];q.forEach(function(x){put(x[0],x[1])});
  },function(e){
    if(warnEl) {
      warnEl.textContent = (CODE === "1432014310") ? "ডেটাবেসের সাথে যোগ হচ্ছে না। ইন্টারনেট আছে তো? Firebase-এর কোড ঠিকমতো বসানো আছে তো?" : "দুঃখিত, আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন এবং পেজটি রিফ্রেশ দিন।";
      warnEl.hidden = false;
    }
  });

  dbx.ref(".info/connected").on("value",function(sn){
    clearTimeout(connect.wt);
    if(sn.val()){
      if(warnEl) warnEl.hidden = true;
      goOnline();
    } else {
      connect.wt = setTimeout(function(){
        if(warnEl) {
          warnEl.textContent = (CODE === "1432014310") ? "ডেটাবেসের সাথে যোগ হচ্ছে না। ইন্টারনেট আছে তো? Firebase-এর কোড ঠিকমতো বসানো আছে তো?" : "দুঃখিত, আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন এবং পেজটি রিফ্রেশ দিন।";
          warnEl.hidden = false;
        }
      }, 4000);
    }
  });
}

var OFF=0;function NOW(){return Date.now()+OFF}
var PR=["ফজর","যোহর","আসর","মাগরিব","এশা"],exB="init",BR={m:5,rem:300,end:0,run:false,snd:true},AC=null;

function beep(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();[0,.3,.6].forEach(function(d){var o=AC.createOscillator(),g=AC.createGain();o.frequency.value=880;o.connect(g);g.connect(AC.destination);g.gain.setValueAtTime(.0001,AC.currentTime+d);g.gain.linearRampToValueAtTime(.2,AC.currentTime+d+.02);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d+.25);o.start(AC.currentTime+d);o.stop(AC.currentTime+d+.26)})}catch(e){}}

function brInit(){var b=$("brk");if(!b)return;if(window.speechSynthesis)speechSynthesis.getVoices();b.textContent="";b.appendChild(el("h2",null,"☕ ব্রেক টাইমার"));
  var t=el("div","clk","05:00");t.id="bt";t.style.cssText="font-size:34px;text-align:center";b.appendChild(t);
  var r=el("div","row");r.style.justifyContent="center";
  var mi=el("input");mi.type="text";mi.setAttribute("inputmode","numeric");mi.maxLength=20;mi.placeholder="Break for ....";mi.style.cssText="width:150px;flex:none";mi.setAttribute("aria-label","Break for");
  function applyBreak(){var v=mi.value.trim();if(!v)return true;mi.value="";var n=parseInt(v.replace(/[০-৯]/g,function(d){return "০১২৩৪৫৬৭৮৯".indexOf(d)}).replace(/[^0-9]/g,""),10);
    if(!n||n<1){toast("মিনিট লেখো (যেমন 10)");return false}if(BR.run){toast("ব্রেক চলছে, শেষ হলে সময় বদলাও");return false}
    BR.m=Math.max(1,Math.min(120,n));BR.rem=BR.m*60;brTick();toast("ব্রেক "+bn(BR.m)+" মিনিট সেট হয়েছে");return true}
  mi.onkeydown=function(e){if(e.key==="Enter"){e.preventDefault();applyBreak()}};r.appendChild(mi);
  function B(l,f,c){var x=el("button","btn"+c,l);x.type="button";x.onclick=f;r.appendChild(x);return x}
  B("শুরু",function(){if(BR.run)return;if(!applyBreak())return;if(BR.rem<=0)BR.rem=BR.m*60;BR.end=NOW()+BR.rem*1000;BR.run=true;unlockAudio();put(me,function(q){q.brk={e:BR.end,m:BR.m};if(q.study&&active(q.study)&&!q.study.ps)q.study.ps=NOW()})},"");
  B("পজ",function(){if(BR.run){BR.rem=Math.max(0,Math.round((BR.end-NOW())/1000));BR.run=false;clrBrk()}brTick()}," alt");
  B("রিসেট",function(){var w=BR.run;BR.run=false;BR.rem=BR.m*60;if(w)clrBrk();brTick()}," ghost");
  var sn=B("🔔 সাউন্ড চালু",function(){BR.snd=!BR.snd;sn.textContent=BR.snd?"🔔 সাউন্ড চালু":"🔕 সাউন্ড বন্ধ"}," ghost");B("🔊 টেস্ট",function(){beep();setTimeout(speakBreak,900)}," ghost");b.appendChild(r)}

function brTick(){var t=$("bt");if(!t)return;if(BR.run){BR.rem=Math.max(0,Math.round((BR.end-NOW())/1000));if(!BR.rem){BR.run=false;RW=NOW()+8500;if(BR.snd){beep();setTimeout(speakBreak,900)}toast("☕ বিরতি শেষ! আবার পড়তে বসো।",8000);put(me,function(q){q.brk=null});setTimeout(function(){put(me,function(q){resumeStudy(q,NOW())})},8000)}}t.textContent=fmtClock(BR.rem*1000)}

// প্রতি ১ সেকেন্ডে টাইমারের মসৃণ গণনা
setInterval(function(){
  brTick();examTick();
  var now=NOW();
  document.querySelectorAll(".bd[data-own]").forEach(function(c){var pb=pl(c.dataset.own).brk,rem=pb&&pb.e>NOW()?pb.e-NOW():0;c.textContent=fmtClock(rem);var rp=$("brp");if(rp)rp.style.strokeDashoffset=CR*(1-rem/Number(c.dataset.tot))});
  document.querySelectorAll(".cd[data-own]").forEach(function(c){var sx=pl(c.dataset.own).study;if(!sx)return;var rem=sRem(sx);c.textContent=fmtClock(rem);var rp=c.dataset.ring&&$("rp");if(rp)rp.style.strokeDashoffset=CR*(1-Math.max(0,rem)/Number(c.dataset.tot))});
  var st=me&&!MON&&pl(me).study;if(st&&st.t&&!st.ps&&sRem(st)<=0)finish(true);
  if(!MON)brkSync();
  sumBtn();if(++BT%15===0){board();wboard()}
},1000);

// ইনিশিয়ালাইজেশন
brInit();
qInit();
render();

if(CODE) {
  connect();

  var dbx = window.db || (firebase.apps.length ? firebase.database() : firebase.initializeApp(FB_CONFIG).database());
  var lastAlertTime = 0;

  function checkAdminAlert(snap){
    if(snap.exists()){
      var val = snap.val();
      if(val && val.time && val.time > lastAlertTime && (Date.now() - val.time < 864e5)){
        lastAlertTime = val.time;
        toast("📢 " + val.text, 9000);
      }
    }
  }

  dbx.ref("admin_alerts/global").on("value", checkAdminAlert);
  dbx.ref("admin_alerts/" + CODE + "/all").on("value", checkAdminAlert);
  if(me) dbx.ref("admin_alerts/" + CODE + "/" + me).on("value", checkAdminAlert);

  dbx.ref("motivational_quotes").on("value", function(sn){
    if(sn.exists()){
      var remote = sn.val() || {};
      ["Medical","Engineering","Varsity","Other"].forEach(function(cat){
        if(remote[cat]){
          MOT[cat] = Object.values(remote[cat]);
        }
      });
      QB = {};
    }
  });
}

})();