// public/js/entry.js - ১০০% নির্ভুল রুম তৈরি ও সেভ ইঞ্জিন
(function(){
  function LS(k,v){
    try{
      if(v===undefined) return localStorage.getItem(k);
      if(v===null) localStorage.removeItem(k);
      else localStorage.setItem(k,v);
    }catch(e){}
    return null;
  }

  function launchApp(){
    var s = document.createElement("script");
    s.src = "js/app.js";
    document.body.appendChild(s);
    var p = document.createElement("script");
    p.src = "js/points.js";
    document.body.appendChild(p);
  }

  // রুম কোড থাকলে সরাসরি অ্যাপ চালু
  if(LS("sr-code") && LS("sr-me")){
    launchApp();
    return;
  }

  var DB = window.db || firebase.database();
  var T = firebase.database.ServerValue.TIMESTAMP;

  var gate = document.createElement("div");
  gate.className = "modal";
  gate.style.cssText = "z-index:50;background:var(--bg)";
  var box = document.createElement("div");
  box.className = "mbox";
  box.style.maxWidth = "440px";
  gate.appendChild(box);
  document.body.appendChild(gate);

  function clean(v){
    v = String(v||"").trim().replace(/[.$#\[\]\/]/g,"_");
    return v.length>=4 && v.length<=40 ? v : "";
  }
  function normMob(v){
    v = String(v||"").replace(/[০-৯]/g,function(d){ return "০১২৩৪৫৬৭৮৯".indexOf(d); }).replace(/[^0-9]/g,"");
    if(v.startsWith("880")) v = v.slice(2);
    else if(v.startsWith("88")) v = v.slice(2);
    return /^01[3-9][0-9]{8}$/.test(v) ? v : "";
  }
  function rid(){
    return "m" + Date.now().toString(36) + Math.floor(Math.random()*1e4).toString(36);
  }

  // ১. মূল এন্ট্রি স্ক্রিন
  function showEntryScreen(msg){
    box.innerHTML = `
      <div style="text-align:center">
        <img src="img/dmc.png" class="logo" style="margin:0 auto 10px;display:block" alt="Logo">
        <h1 style="font-size:24px;margin-bottom:6px">আমাদের অধ্যয়ন কক্ষ</h1>
        <p class="mute" style="margin-top:0">রুমের পাসকোড দিয়ে প্রবেশ করো</p>
        <input type="text" id="sr_passcode_input" placeholder="গোপন পাসকোড লেখো" style="width:100%;padding:12px 14px;border-radius:14px;border:1.5px solid var(--line);font:inherit;outline:none" autocomplete="off" />
        <div id="sr_err" style="color:var(--danger);margin-top:8px;font-size:14px;min-height:1.2em">${msg||""}</div>
        <div class="row" style="margin-top:14px;display:flex;gap:10px">
          <button class="btn" id="btn_enter" style="flex:1;padding:12px;border-radius:12px">প্রবেশ করো</button>
          <button class="btn ghost" id="btn_create_room" style="flex:1;padding:12px;border-radius:12px">নতুন রুম তৈরি করো</button>
        </div>
      </div>
    `;

    var inp = document.getElementById("sr_passcode_input");
    var btnEnter = document.getElementById("btn_enter");
    var btnCreate = document.getElementById("btn_create_room");
    var er = document.getElementById("sr_err");

    btnCreate.onclick = function(){ showCreateRoomForm(); };

    function handleEnter(){
      var c = clean(inp.value);
      if(!c){ er.textContent = "সঠিক পাসকোড দাও (কমপক্ষে ৪ অক্ষর)।"; return; }
      er.textContent = "খোঁজা হচ্ছে...";
      btnEnter.disabled = true;

      // কুইন রুম (VIP রুম 1432014310)
      if(c === "1432014310"){
        showQueenRoomPicker(c);
        return;
      }

      DB.ref("rooms_v2/"+c).once("value").then(function(snap){
        btnEnter.disabled = false;
        if(snap.exists()){
          var rVal = snap.val();
          var meta = rVal.meta || {};
          var curExp = meta.expiresAt || meta.trialEnds || 0;

          if(curExp && Date.now() > curExp && meta.status !== "approved"){
            er.textContent = "🚫 ৩ দিনের ফ্রি ট্রায়াল শেষ! ব্যবহারের জন্য অ্যাডমিনের অনুমতি প্রয়োজন।";
            return;
          }
          if(meta.status === "suspended" || meta.status === "blocked"){
            er.textContent = "🚫 রুমটি সাময়িকভাবে বন্ধ আছে।";
            return;
          }

          showMemberPicker(c, rVal);
        } else {
          DB.ref("rooms/"+c).once("value").then(function(s2){
            if(s2.exists()){
              var r1 = s2.val() || {};
              var convertedMembers = {
                p1: { name: r1.n1 || "সাথী ১", cls: "HSC", goal: "মেডিকেল", uid: r1.p1Uid || "143201" },
                p2: { name: r1.n2 || "সাথী ২", cls: "HSC", goal: "মেডিকেল", uid: r1.p2Uid || "143202" }
              };
              var convertedData = {
                meta: { name: r1.name || "স্টাডি রুম", max: 2, status: "approved" },
                members: convertedMembers
              };
              showMemberPicker(c, convertedData);
            } else {
              er.textContent = "এই পাসকোডে কোনো রুম নেই। 'নতুন রুম তৈরি করো' চাপো।";
            }
          });
        }
      }).catch(function(err){
        btnEnter.disabled = false;
        er.textContent = "সংযোগ সমস্যা: " + err.message;
      });
    }

    btnEnter.onclick = handleEnter;
    inp.onkeydown = function(e){ if(e.key === "Enter") handleEnter(); };
  }

  function getOrMakeUID(){
    var u = LS("sr_uid");
    if(!u || !/^\d{5,6}$/.test(u)){
      u = String(Math.floor(10000 + Math.random() * 90000));
      LS("sr_uid", u);
    }
    return u;
  }

  // ৪ ডিজিটের পার্সোনাল পিন যাচাই বা সেট
  function promptPersonalPin(c, mid, memName, onSuccess, onCancel){
    DB.ref("user_pins/" + mid).once("value").then(function(snap){
      var pinData = snap.val();
      var storedPin = (pinData && pinData.pin) || LS("sr_pin_" + mid);

      if(storedPin){
        // Existing PIN - Verify
        box.innerHTML = `
          <div style="text-align:center">
            <h2 style="font-size:20px;margin-bottom:4px">🔐 ব্যক্তিগত পিন দিন</h2>
            <p class="mute" style="margin-top:0;font-size:14px">হ্যালো <strong>${memName}</strong>! রুমে প্রবেশের জন্য তোমার ৪ ডিজিটের PIN দাও:</p>
            <input type="password" id="pin_val_inp" maxlength="4" placeholder="••••" style="text-align:center;font-size:26px;letter-spacing:10px;width:160px;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);outline:none;font-weight:700;margin:12px auto;display:block" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" />
            <div id="pin_err" style="color:var(--danger);font-size:14px;margin-top:6px;min-height:1.2em"></div>
            <div class="row" style="margin-top:16px;display:flex;gap:10px">
              <button class="btn" id="btn_pin_submit" style="flex:1;padding:12px;border-radius:12px">প্রবেশ করো</button>
              <button class="btn ghost" id="btn_pin_back" style="flex:1;padding:12px;border-radius:12px">পিছনে</button>
            </div>
          </div>
        `;

        var inp = document.getElementById("pin_val_inp");
        var btnSub = document.getElementById("btn_pin_submit");
        var er = document.getElementById("pin_err");
        setTimeout(function(){ inp.focus(); }, 50);

        function checkPin(){
          var val = inp.value.trim();
          if(val === String(storedPin)){
            onSuccess();
          } else {
            er.textContent = "ভুল পিন! আবার চেষ্টা করো।";
            inp.value = "";
            inp.focus();
          }
        }

        btnSub.onclick = checkPin;
        inp.onkeydown = function(e){ if(e.key === "Enter") checkPin(); };
        document.getElementById("btn_pin_back").onclick = onCancel;
      } else {
        // First Time - Set 4-digit PIN
        box.innerHTML = `
          <div style="text-align:center">
            <h2 style="font-size:20px;margin-bottom:4px">🆕 ৪ ডিজিটের পিন সেট করুন</h2>
            <p class="mute" style="margin-top:0;font-size:14px">হ্যালো <strong>${memName}</strong>! পরবর্তীতে রুমে প্রবেশের জন্য ৪ ডিজিটের গোপন PIN সেট করো:</p>
            <input type="password" id="pin_new_inp" maxlength="4" placeholder="৪ ডিজিটের গোপন PIN" style="text-align:center;font-size:18px;letter-spacing:6px;width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);outline:none;margin-top:10px" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" />
            <input type="password" id="pin_conf_inp" maxlength="4" placeholder="পিন পুনরায় নিশ্চিত করো" style="text-align:center;font-size:18px;letter-spacing:6px;width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);outline:none;margin-top:10px" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" />
            <div id="pin_err" style="color:var(--danger);font-size:14px;margin-top:8px;min-height:1.2em"></div>
            <div class="row" style="margin-top:16px;display:flex;gap:10px">
              <button class="btn" id="btn_pin_save" style="flex:1;padding:12px;border-radius:12px">পিন সেভ করে প্রবেশ করো</button>
              <button class="btn ghost" id="btn_pin_back" style="flex:1;padding:12px;border-radius:12px">পিছনে</button>
            </div>
          </div>
        `;

        var pNew = document.getElementById("pin_new_inp");
        var pConf = document.getElementById("pin_conf_inp");
        var btnSav = document.getElementById("btn_pin_save");
        var er2 = document.getElementById("pin_err");
        setTimeout(function(){ pNew.focus(); }, 50);

        btnSav.onclick = function(){
          var v1 = pNew.value.trim();
          var v2 = pConf.value.trim();
          if(v1.length !== 4){
            er2.textContent = "পিন ঠিক ৪ ডিজিটের হতে হবে।";
            return;
          }
          if(v1 !== v2){
            er2.textContent = "দুটো পিন মেলেনি, আবার লিখুন।";
            return;
          }

          LS("sr_pin_" + mid, v1);
          DB.ref("user_pins/" + mid).set({ pin: v1, updatedAt: Date.now() }).catch(function(){});
          DB.ref("rooms_v2/" + c + "/members/" + mid + "/pin").set(v1).catch(function(){});
          onSuccess();
        };

        document.getElementById("btn_pin_back").onclick = onCancel;
      }
    }).catch(function(){
      // Network fallback
      onSuccess();
    });
  }

  // কুইন রুম (VIP 1432014310) মেম্বার পিকার
  function showQueenRoomPicker(c){
    DB.ref("vip_users").once("value").then(function(vSnap){
      var vData = vSnap.val() || {};
      var p1Obj = vData.p1 || {};
      var p2Obj = vData.p2 || {};

      var name1 = p1Obj.name || LS("vip_p1_name") || "Tasfia Hasan";
      var name2 = p2Obj.name || LS("vip_p2_name") || "Rahman";

      box.innerHTML = `
        <div style="text-align:center">
          <img src="img/dmc.png" class="logo" style="margin:0 auto 10px;display:block" alt="Logo">
          <h2 style="font-size:20px;margin-bottom:4px">👑 Queen Room (VIP)</h2>
          <p class="mute" style="margin-top:0;font-size:14px">তুমি কে? নিজের নামে চাপ দিয়ে প্রবেশ করো:</p>
          <div style="display:flex;flex-direction:column;gap:10px;margin:18px 0">
            <button class="btn btn-queen-pick" data-slot="p1" style="padding:13px 16px;border-radius:12px;font-size:16px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px">
              👸 ${name1}
            </button>
            <button class="btn alt btn-queen-pick" data-slot="p2" style="padding:13px 16px;border-radius:12px;font-size:16px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px">
              🤴 ${name2}
            </button>
          </div>
          <button class="btn ghost" id="btn_queen_back" style="width:100%;margin-top:6px;border-radius:12px">পিছনে</button>
        </div>
      `;

      box.querySelectorAll(".btn-queen-pick").forEach(function(b){
        b.onclick = function(){
          var slot = b.getAttribute("data-slot");
          var curName = (slot === "p1") ? name1 : name2;
          promptPersonalPin(c, slot, curName, function(){
            LS("sr-code", c);
            LS("sr-me", slot);
            LS("sr-name", curName);
            LS("sr_is_vip", "1");
            gate.remove();
            launchApp();
          }, function(){
            showQueenRoomPicker(c);
          });
        };
      });

      document.getElementById("btn_queen_back").onclick = function(){
        showEntryScreen();
      };
    }).catch(function(){
      LS("sr-code", c);
      LS("sr-me", "p1");
      LS("sr-name", "Tasfia Hasan");
      LS("sr_is_vip", "1");
      gate.remove();
      launchApp();
    });
  }

  // ২. মেম্বার পিকার
  function showMemberPicker(c, rData){
    var mems = rData.members || {};
    var meta = rData.meta || {};
    var ids = Object.keys(mems);
    var max = parseInt(meta.max, 10) || 8;
    var isFull = (ids.length >= max);

    var memButtons = ids.map(function(id){
      var m = mems[id] || {};
      var init = (m.name || "?").trim().charAt(0).toUpperCase();
      var sub = (m.cls ? m.cls : "") + (m.goal ? (m.cls ? " · " : "") + m.goal : "");
      return `
        <button class="btn ghost btn-pick" data-id="${id}" style="display:flex;align-items:center;justify-content:space-between;width:100%;margin-top:8px;padding:12px 14px;border-radius:12px;border:1.5px solid var(--line);text-align:left;background:var(--card)">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:36px;height:36px;border-radius:10px;background:var(--as);color:var(--a);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px">${init}</div>
            <div>
              <strong style="display:block;font-size:15px;color:var(--ink)">${m.name || "সদস্য"}</strong>
              ${sub ? `<small class="mute" style="font-size:12px">${sub}</small>` : ''}
            </div>
          </div>
          <span style="font-size:13px;color:var(--a);font-weight:600">প্রবেশ ›</span>
        </button>
      `;
    }).join("");

    box.innerHTML = `
      <div style="text-align:center">
        <h2 style="font-size:20px;margin-bottom:4px">${meta.name || "স্টাডি রুম"}</h2>
        <p class="mute" style="margin-top:0;font-size:14px">
          ${isFull ? `রুমের সদস্য পূর্ণ (${ids.length}/${max} জন)` : `তুমি কে? নিজের প্রোফাইলে ক্লিক করো এবং ৪-ডিজিটের পিন দিয়ে লগইন করো:`}
        </p>

        <div style="max-height:220px;overflow-y:auto;margin:10px 0;padding-right:2px">
          ${ids.length > 0 ? memButtons : '<p class="mute" style="font-size:13px;padding:14px 0">এই রুমে এখনো কোনো সদস্য যোগ হয়নি।</p>'}
        </div>
        
        ${!isFull ? `
          <button class="btn" id="btn_add_me" style="width:100%;margin-top:8px;padding:12px;background:var(--a);border-radius:12px">➕ Add Me (নতুন সদস্য যোগ দাও)</button>
        ` : `
          <div style="background:var(--bs);padding:10px;border-radius:12px;margin-top:8px">
            <small style="display:block;margin-bottom:6px;color:var(--ink)">সাধারণ সিট পূর্ণ। ভিউয়ার হিসেবে দেখতে পারো:</small>
            <button class="btn alt" id="btn_monitor_join" style="width:100%;padding:9px;border-radius:10px">মনিটর হিসেবে প্রবেশ করো</button>
          </div>
        `}
        
        <button class="btn ghost" id="btn_picker_back" style="width:100%;margin-top:12px;border-radius:12px">পিছনে</button>
      </div>
    `;

    box.querySelectorAll(".btn-pick").forEach(function(b){
      b.onclick = function(){
        var mid = b.getAttribute("data-id");
        var mObj = mems[mid] || {};
        var mName = mObj.name || "সদস্য";
        promptPersonalPin(c, mid, mName, function(){
          LS("sr-code", c);
          LS("sr-me", mid);
          var u = mObj.uid;
          if(!u || !/^\d{5,6}$/.test(String(u))){
            u = String(Math.floor(10000 + Math.random() * 90000));
            DB.ref("rooms_v2/" + c + "/members/" + mid + "/uid").set(u).catch(function(){});
            DB.ref("numeric_uids/" + u).set({ roomId: c, memberId: mid, name: mName, createdAt: Date.now() }).catch(function(){});
          }
          LS("sr_uid", u);
          if(mObj.classBase) LS("sr_class", mObj.classBase);
          else if(mObj.cls) {
            var cb = mObj.cls.includes("SSC") ? "SSC" : mObj.cls.includes("Admission") ? "Admission" : "HSC";
            LS("sr_class", cb);
          }
          gate.remove();
          launchApp();
        }, function(){
          showMemberPicker(c, rData);
        });
      };
    });

    if(document.getElementById("btn_add_me")){
      document.getElementById("btn_add_me").onclick = function(){
        showAddMeForm(c, rData);
      };
    }

    if(document.getElementById("btn_monitor_join")){
      document.getElementById("btn_monitor_join").onclick = function(){
        LS("sr-code", c);
        LS("sr-me", "mon");
        gate.remove();
        launchApp();
      };
    }

    document.getElementById("btn_picker_back").onclick = function(){
      showEntryScreen();
    };
  }

  // ৩. নতুন মেম্বার ফর্ম (Add Me)
  function showAddMeForm(c, rData){
    var autoUID = getOrMakeUID();
    box.innerHTML = `
      <div>
        <h2 style="font-size:20px;text-align:center;margin-bottom:4px">রুমে যোগ দাও (Add Me)</h2>
        <div style="text-align:center;margin-bottom:8px">
          <span style="font-size:12px;background:var(--as);color:var(--a);padding:3px 10px;border-radius:20px;font-weight:700">অটো আইডি: ${autoUID}</span>
        </div>
        
        <input type="text" id="add_name" placeholder="তোমার পুরো নাম" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:6px;font:inherit" />
        <input type="text" id="add_college" placeholder="তোমার স্কুল / কলেজ" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
        
        <p class="mute" style="font-size:13px;font-weight:600;margin:12px 0 6px">তোমার ক্লাস নির্বাচন করো:</p>
        <div class="row" id="add_cls_buttons" style="display:flex;gap:8px;margin-bottom:8px">
          <button type="button" class="btn cls-btn on" data-c="HSC" style="flex:1;padding:8px 0;font-size:13.5px;border-radius:10px">🎓 HSC</button>
          <button type="button" class="btn ghost cls-btn" data-c="SSC" style="flex:1;padding:8px 0;font-size:13.5px;border-radius:10px">📖 SSC</button>
          <button type="button" class="btn ghost cls-btn" data-c="Admission" style="flex:1;padding:8px 0;font-size:13.5px;border-radius:10px">🎯 Admission</button>
        </div>
        
        <input type="tel" id="add_year" maxlength="4" placeholder="পাসের বছর (শুধুই সংখ্যা, যেমন: 2026)" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);font:inherit" />
        
        <p class="mute" style="font-size:13px;font-weight:600;margin:12px 0 6px">তোমার টার্গেট:</p>
        <div class="gl" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <button type="button" class="on" data-g="Medical" style="padding:10px 6px;border-radius:10px">🩺 Medical</button>
          <button type="button" data-g="Engineering" style="padding:10px 6px;border-radius:10px">⚙️ Engineering</button>
          <button type="button" data-g="Varsity" style="padding:10px 6px;border-radius:10px">🏛️ Varsity</button>
          <button type="button" class="goal-custom" data-g="custom" style="padding:10px 6px;border-radius:10px">🎯 + Add your Goal</button>
        </div>
        <input type="text" id="add_custom_goal" placeholder="নিজের লক্ষ্য লেখো" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:8px;font:inherit;display:none" />
        
        <input type="tel" id="add_mob" maxlength="11" oninput="this.value = this.value.replace(/[^0-9০-৯]/g, '').slice(0, 11)" placeholder="মোবাইল (01XXXXXXXXX - ১১ ডিজিট)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
        
        <p class="mute" style="font-size:13px;font-weight:600;margin:12px 0 4px">৪ ডিজিটের গোপন পিন (Personal PIN সেট করুন):</p>
        <input type="password" id="add_pin" maxlength="4" placeholder="৪ ডিজিটের গোপন PIN (যেমন: 1234)" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);font:inherit;text-align:center;letter-spacing:4px" />

        <div id="add_err" style="color:var(--danger);font-size:14px;margin-top:8px;min-height:1.2em"></div>
        <div class="row" style="margin-top:14px;display:flex;gap:10px">
          <button class="btn" id="btn_add_submit" style="flex:1;padding:12px;border-radius:12px">যোগ দাও</button>
          <button class="btn ghost" id="btn_add_back" style="flex:1;padding:12px;border-radius:12px">পিছনে</button>
        </div>
      </div>
    `;

    var selClass = "HSC";
    var selGoal = "Medical";
    var customInp = document.getElementById("add_custom_goal");
    var gBtns = box.querySelectorAll(".gl button");
    var cBtns = box.querySelectorAll(".cls-btn");

    cBtns.forEach(function(b){
      b.onclick = function(){
        cBtns.forEach(function(x){ x.className = "btn ghost cls-btn"; });
        b.className = "btn cls-btn on";
        selClass = b.getAttribute("data-c");
      };
    });

    gBtns.forEach(function(b){
      b.onclick = function(){
        gBtns.forEach(function(x){ x.classList.remove("on"); });
        b.classList.add("on");
        selGoal = b.getAttribute("data-g");
        customInp.style.display = (selGoal === "custom") ? "block" : "none";
        if(selGoal === "custom") customInp.focus();
      };
    });

    document.getElementById("btn_add_back").onclick = function(){
      showMemberPicker(c, rData);
    };

    document.getElementById("btn_add_submit").onclick = function(){
      var name = document.getElementById("add_name").value.trim();
      var college = document.getElementById("add_college").value.trim();
      var year = document.getElementById("add_year").value.trim();
      var pin = document.getElementById("add_pin").value.trim();
      var mobRaw = document.getElementById("add_mob").value.trim();
      var mob = normMob(mobRaw);
      var goal = (selGoal === "custom") ? customInp.value.trim() : selGoal;
      var er = document.getElementById("add_err");
      var btnSub = document.getElementById("btn_add_submit");

      if(name.length < 2){ er.textContent = "নাম লেখো।"; return; }
      if(year.length !== 4){ er.textContent = "পাসের সাল ৪ সংখ্যার হতে হবে (যেমন: 2026)।"; return; }
      if(pin.length !== 4){ er.textContent = "৪ ডিজিটের গোপন PIN লেখো।"; return; }
      if(mobRaw && !mob){ er.textContent = "সঠিক ১১ ডিজিটের মোবাইল নম্বর দাও (যেমন: 017XXXXXXXX)।"; return; }

      btnSub.disabled = true;
      er.textContent = "যোগ করা হচ্ছে...";

      DB.ref("rooms_v2/"+c).once("value").then(function(sNow){
        var curMems = (sNow.val() && sNow.val().members) || {};
        var maxM = (sNow.val() && sNow.val().meta && sNow.val().meta.max) || 8;
        if(Object.keys(curMems).length >= maxM){
          btnSub.disabled = false;
          er.textContent = "রুমটি এইমাত্র পূর্ণ হয়ে গেছে।";
          return;
        }

        var newId = rid();
        var fullClassStr = selClass + (year ? " (" + year + ")" : "");
        var newMem = {
          name: name,
          college: college,
          cls: fullClassStr,
          classBase: selClass,
          passingYear: year,
          goal: goal,
          mobile: mob,
          uid: autoUID,
          pin: pin,
          joinedAt: T
        };

        DB.ref("rooms_v2/"+c+"/members/"+newId).set(newMem).then(function(){
          LS("sr_pin_" + newId, pin);
          LS("sr_class", selClass);
          LS("sr_uid", autoUID);
          LS("sr-name", name);
          DB.ref("user_pins/" + newId).set({ pin: pin, updatedAt: Date.now() }).catch(function(){});
          DB.ref("numeric_uids/" + autoUID).set({ roomId: c, memberId: newId, name: name, createdAt: Date.now() }).catch(function(){});
          LS("sr-code", c);
          LS("sr-me", newId);
          gate.remove();
          launchApp();
        }).catch(function(err){
          btnSub.disabled = false;
          er.textContent = "সেভ হয়নি: " + err.message;
        });
      }).catch(function(err){
        btnSub.disabled = false;
        er.textContent = "এরর: " + err.message;
      });
    };
  }

  // ৪. নতুন রুম তৈরি (সরাসরি সেভ ও সম্পূর্ণ এরর হ্যান্ডলার সহ)
  function showCreateRoomForm(){
    var autoUID = getOrMakeUID();
    box.innerHTML = `
      <div>
        <h2 style="font-size:20px;text-align:center;margin-bottom:4px">নতুন স্টাডি রুম তৈরি</h2>
        <p class="mute" style="text-align:center;margin-top:0;font-size:13px">প্রথম ৩ দিন সম্পূর্ণ ফ্রি ট্রায়াল পাবে</p>
        <input type="text" id="cr_rname" placeholder="রুমের নাম (যেমন: মিশন মেডিকেল)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:8px;font:inherit" />
        <input type="text" id="cr_code" placeholder="রুমের পাসকোড (কমপক্ষে ৪ অক্ষর)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:8px;font:inherit" />
        
        <p class="mute" style="font-size:13px;font-weight:600;margin:10px 0 4px">রুমের সর্বোচ্চ সদস্য সংখ্যা নির্ধারণ করো:</p>
        <select id="cr_max_members" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);font:inherit">
          <option value="1">১ জন (একক রুম - শুধু আমি পড়ব)</option>
          <option value="2">২ জন (পার্টনার রুম)</option>
          <option value="3">৩ জন</option>
          <option value="4">৪ জন</option>
          <option value="5">৫ জন</option>
          <option value="6">৬ জন</option>
          <option value="7">৭ জন</option>
          <option value="8" selected>৮ জন (সর্বোচ্চ)</option>
        </select>

        <input type="text" id="cr_name" placeholder="তোমার নাম" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:8px;font:inherit" />
        <input type="text" id="cr_college" placeholder="তোমার স্কুল / কলেজ" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:8px;font:inherit" />
        
        <p class="mute" style="font-size:13px;font-weight:600;margin:10px 0 4px">তোমার ক্লাস নির্বাচন করো:</p>
        <div class="row" id="cr_cls_buttons" style="display:flex;gap:8px;margin-bottom:8px">
          <button type="button" class="btn cr-cls-btn on" data-c="HSC" style="flex:1;padding:8px 0;font-size:13.5px;border-radius:10px">🎓 HSC</button>
          <button type="button" class="btn ghost cr-cls-btn" data-c="SSC" style="flex:1;padding:8px 0;font-size:13.5px;border-radius:10px">📖 SSC</button>
          <button type="button" class="btn ghost cr-cls-btn" data-c="Admission" style="flex:1;padding:8px 0;font-size:13.5px;border-radius:10px">🎯 Admission</button>
        </div>

        <input type="tel" id="cr_year" maxlength="4" placeholder="পাসের বছর (শুধুই সংখ্যা, যেমন: 2026)" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);font:inherit" />
        
        <p class="mute" style="font-size:13px;font-weight:600;margin:10px 0 4px">তোমার টার্গেট:</p>
        <div class="gl" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <button type="button" class="on" data-g="Medical" style="padding:10px 6px;border-radius:10px">🩺 Medical</button>
          <button type="button" data-g="Engineering" style="padding:10px 6px;border-radius:10px">⚙️ Engineering</button>
          <button type="button" data-g="Varsity" style="padding:10px 6px;border-radius:10px">🏛️ Varsity</button>
          <button type="button" class="goal-custom" data-g="custom" style="padding:10px 6px;border-radius:10px">🎯 + Add your Goal</button>
        </div>
        <input type="text" id="cr_custom_goal" placeholder="নিজের লক্ষ্য লেখো" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:6px;font:inherit;display:none" />
        
        <input type="tel" id="cr_mob" maxlength="11" oninput="this.value = this.value.replace(/[^0-9০-৯]/g, '').slice(0, 11)" placeholder="মোবাইল (01XXXXXXXXX - ১১ ডিজিট)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:8px;font:inherit" />
        
        <p class="mute" style="font-size:13px;font-weight:600;margin:10px 0 4px">৪ ডিজিটের গোপন পিন (Personal PIN সেট করুন):</p>
        <input type="password" id="cr_pin" maxlength="4" placeholder="৪ ডিজিটের গোপন PIN" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);font:inherit;text-align:center;letter-spacing:4px" />

        <div id="cr_err" style="color:var(--danger);font-size:14px;margin-top:8px;min-height:1.2em"></div>
        <div class="row" style="margin-top:14px;display:flex;gap:10px">
          <button class="btn" id="btn_cr_submit" style="flex:1;padding:12px;border-radius:12px">রুম বানাও</button>
          <button class="btn ghost" id="btn_cr_back" style="flex:1;padding:12px;border-radius:12px">পিছনে</button>
        </div>
      </div>
    `;

    var selClass = "HSC";
    var selGoal = "Medical";
    var customInp = document.getElementById("cr_custom_goal");
    var gBtns = box.querySelectorAll(".gl button");
    var cBtns = box.querySelectorAll(".cr-cls-btn");

    cBtns.forEach(function(b){
      b.onclick = function(){
        cBtns.forEach(function(x){ x.className = "btn ghost cr-cls-btn"; });
        b.className = "btn cr-cls-btn on";
        selClass = b.getAttribute("data-c");
      };
    });

    gBtns.forEach(function(b){
      b.onclick = function(){
        gBtns.forEach(function(x){ x.classList.remove("on"); });
        b.classList.add("on");
        selGoal = b.getAttribute("data-g");
        customInp.style.display = (selGoal === "custom") ? "block" : "none";
        if(selGoal === "custom") customInp.focus();
      };
    });

    document.getElementById("btn_cr_back").onclick = function(){
      showEntryScreen();
    };

    document.getElementById("btn_cr_submit").onclick = function(){
      var rname = document.getElementById("cr_rname").value.trim();
      var code = clean(document.getElementById("cr_code").value);
      var maxLimit = parseInt(document.getElementById("cr_max_members").value, 10) || 8;
      var name = document.getElementById("cr_name").value.trim();
      var college = (document.getElementById("cr_college") ? document.getElementById("cr_college").value.trim() : "");
      var year = document.getElementById("cr_year").value.trim();
      var pin = document.getElementById("cr_pin").value.trim();
      var mobRaw = document.getElementById("cr_mob").value.trim();
      var mob = normMob(mobRaw);
      var goal = (selGoal === "custom") ? customInp.value.trim() : selGoal;
      var er = document.getElementById("cr_err");
      var btnCr = document.getElementById("btn_cr_submit");

      if(!rname){ er.textContent = "রুমের নাম লেখো।"; return; }
      if(!code){ er.textContent = "পাসকোড কমপক্ষে ৪ অক্ষরের দাও।"; return; }
      if(name.length < 2){ er.textContent = "নাম লেখো।"; return; }
      if(year.length !== 4){ er.textContent = "পাসের সাল ৪ সংখ্যার হতে হবে (যেমন: 2026)।"; return; }
      if(pin.length !== 4){ er.textContent = "৪ ডিজিটের গোপন PIN লেখো।"; return; }
      if(mobRaw && !mob){ er.textContent = "সঠিক ১১ ডিজিটের মোবাইল নম্বর দাও (যেমন: 017XXXXXXXX)।"; return; }

      btnCr.disabled = true;
      er.textContent = "রুম তৈরি করা হচ্ছে...";

      // কোড আগেই ব্যবহার হয়েছে কি না চেক করা
      DB.ref("rooms_v2/"+code).once("value").then(function(snap){
        if(snap.exists() || code === "1432014310"){
          btnCr.disabled = false;
          er.textContent = "এই পাসকোড আগেই ব্যবহার হয়েছে, অন্য পাসকোড দাও।";
          return;
        }

        var trialEnd = Date.now() + (3 * 864e5);
        var creatorId = rid();
        var fullClassStr = selClass + (year ? " (" + year + ")" : "");

        // সরাসরি rooms_v2 তে সেভ (কোনো রুলস বা রুট পারমিশন কনফ্লিক্ট ছাড়া)
        var newRoomData = {
          meta: {
            name: rname,
            createdAt: Date.now(),
            trialEnds: trialEnd,
            status: "trial",
            max: maxLimit
          },
          members: {
            [creatorId]: {
              name: name,
              college: college,
              cls: fullClassStr,
              classBase: selClass,
              passingYear: year,
              goal: goal,
              mobile: mob || "",
              uid: autoUID,
              pin: pin,
              joinedAt: Date.now(),
              creator: true
            }
          }
        };

        DB.ref("rooms_v2/" + code).set(newRoomData).then(function(){
          LS("sr_pin_" + creatorId, pin);
          LS("sr_class", selClass);
          LS("sr_uid", autoUID);
          LS("sr-name", name);
          DB.ref("user_pins/" + creatorId).set({ pin: pin, updatedAt: Date.now() }).catch(function(){});
          DB.ref("numeric_uids/" + autoUID).set({ roomId: code, memberId: creatorId, name: name, createdAt: Date.now() }).catch(function(){});

          // রুম মেটাতে ব্যাকআপ
          DB.ref("room_meta/" + code).set({
            name: rname,
            status: "trial",
            expiresAt: trialEnd,
            updatedAt: Date.now()
          }).catch(function(){});

          LS("sr-code", code);
          LS("sr-me", creatorId);
          gate.remove();
          launchApp();
        }).catch(function(err){
          btnCr.disabled = false;
          er.textContent = "রুম সেভ ব্যর্থ: " + err.message;
        });

      }).catch(function(err){
        btnCr.disabled = false;
        er.textContent = "সংযোগ এরর: " + err.message;
      });
    };
  }

  showEntryScreen();
})();