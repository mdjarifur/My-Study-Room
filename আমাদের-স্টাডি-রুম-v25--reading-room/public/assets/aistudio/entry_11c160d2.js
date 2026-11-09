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
    return (v.length === 11 && v.startsWith("01")) ? v : "";
  }
  function rid(){
    return "m" + Date.now().toString(36) + Math.floor(Math.random()*1e4).toString(36);
  }

  // ১. মূল এন্ট্রি স্ক্রিন
  function showEntryScreen(msg){
    box.innerHTML = `
      <div style="text-align:center">
        <img src="img/dmc.png" class="logo" style="margin:0 auto 10px;display:block" alt="Logo">
        <h1 style="font-size:24px;margin-bottom:6px">আমাদের স্টাডি রুম</h1>
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
        LS("sr-code", c);
        LS("sr_is_vip", "1");
        gate.remove();
        launchApp();
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
              LS("sr-code", c);
              gate.remove();
              launchApp();
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

  // ২. মেম্বার পিকার
  function showMemberPicker(c, rData){
    var mems = rData.members || {};
    var meta = rData.meta || {};
    var ids = Object.keys(mems).filter(function(id){ return id !== "p1" && id !== "p2"; });
    var max = parseInt(meta.max, 10) || 8;
    var isFull = (Object.keys(mems).length >= max);

    var memButtons = ids.map(function(id){
      return `<button class="btn ghost btn-pick" data-id="${id}" style="display:block;width:100%;margin-top:8px;padding:10px;text-align:left;border-radius:12px">👤 ${mems[id].name}</button>`;
    }).join("");

    box.innerHTML = `
      <div style="text-align:center">
        <h2 style="font-size:20px;margin-bottom:4px">${meta.name || "স্টাডি রুম"}</h2>
        <p class="mute" style="margin-top:0;font-size:14px">
          ${isFull ? `রুমের সদস্য পূর্ণ (${Object.keys(mems).length}/${max} জন)` : `তুমি কে? নিজের নামে চাপো। নতুন হলে 'Add Me' চাপো।`}
        </p>

        <div style="max-height:160px;overflow-y:auto;margin:6px 0">
          ${ids.length > 0 ? memButtons : '<p class="mute" style="font-size:13px;padding:10px 0">এই রুমে এখনো কোনো সাধারণ সদস্য নেই।</p>'}
        </div>
        
        ${!isFull ? `
          <button class="btn" id="btn_add_me" style="width:100%;margin-top:8px;padding:12px;background:var(--a);border-radius:12px">➕ Add Me (নতুন সদস্য যোগ দাও)</button>
        ` : `
          <div style="background:var(--bs);padding:10px;border-radius:12px;margin-top:8px">
            <small style="display:block;margin-bottom:6px;color:var(--ink)">সাধারণ সিট পূর্ণ। ভিউয়ার হিসেবে দেখতে পারো:</small>
            <button class="btn alt" id="btn_monitor_join" style="width:100%;padding:9px;border-radius:10px">মনিটর হিসেবে প্রবেশ করো</button>
          </div>
        `}

        <div style="margin-top:14px;border-top:1px dashed var(--line);padding-top:10px">
          <button class="btn ghost" id="btn_toggle_vip" style="width:100%;font-size:13px;padding:9px;border-radius:10px">
            🔒 ভিআইপি হিসেবে প্রবেশ
          </button>
          
          <div id="vip_input_box" style="display:none;margin-top:10px;background:var(--as);padding:12px;border-radius:14px;text-align:left">
            <small style="display:block;font-weight:700;color:var(--a);margin-bottom:6px">VIP Passcode দাও:</small>
            <input type="password" id="vip_pass_inp" placeholder="গোপন VIP পাসকোড লেখো" style="width:100%;padding:9px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit" />
            <div id="vip_err" style="color:var(--danger);font-size:13px;margin-top:4px;min-height:1.2em"></div>
            <button class="btn" id="btn_verify_vip" style="width:100%;margin-top:8px;padding:9px;border-radius:10px">যাচাই করে প্রবেশ করো</button>
          </div>

          <div id="vip_pick_box" style="display:none;margin-top:10px;background:var(--as);padding:12px;border-radius:14px">
            <small style="display:block;font-weight:700;color:var(--a);margin-bottom:8px;text-align:center">সফল! নিজের প্রোফাইল বেছে নাও:</small>
            <div id="vip_dyn_buttons" style="display:flex;gap:8px">
              <span class="mute" style="font-size:13px">লোড হচ্ছে...</span>
            </div>
          </div>
        </div>
        
        <button class="btn ghost" id="btn_picker_back" style="width:100%;margin-top:12px;border-radius:12px">পিছনে</button>
      </div>
    `;

    document.getElementById("btn_toggle_vip").onclick = function(){
      var boxVip = document.getElementById("vip_input_box");
      boxVip.style.display = (boxVip.style.display === "none") ? "block" : "none";
      if(boxVip.style.display === "block") document.getElementById("vip_pass_inp").focus();
    };

    document.getElementById("btn_verify_vip").onclick = function(){
      var pass = document.getElementById("vip_pass_inp").value.trim();
      var er = document.getElementById("vip_err");
      if(pass === "1432014310"){
        LS("sr_is_vip", "1");
        document.getElementById("vip_input_box").style.display = "none";
        document.getElementById("btn_toggle_vip").style.display = "none";

        DB.ref("vip_users").once("value").then(function(vSnap){
          var vData = vSnap.val() || {};
          var p1Obj = vData.p1 || {};
          var p2Obj = vData.p2 || {};

          var name1 = p1Obj.name || LS("vip_p1_name") || "Tasfia Hasan";
          var name2 = p2Obj.name || LS("vip_p2_name") || "Rahman";

          var dynBox = document.getElementById("vip_dyn_buttons");
          dynBox.innerHTML = `
            <button class="btn vip-btn" data-slot="p1" style="flex:1;padding:9px;border-radius:10px">${name1}</button>
            <button class="btn alt vip-btn" data-slot="p2" style="flex:1;padding:9px;border-radius:10px">${name2}</button>
          `;

          dynBox.querySelectorAll(".vip-btn").forEach(function(btnVip){
            btnVip.onclick = function(){
              var slot = btnVip.getAttribute("data-slot");
              var prof = (slot === "p1") ? p1Obj : p2Obj;
              var curName = (slot === "p1") ? name1 : name2;

              var memObj = {
                name: curName,
                college: prof.college || "",
                cls: prof.cls || "HSC",
                goal: prof.goal || "Medical",
                mobile: prof.mobile || "",
                joinedAt: T
              };

              DB.ref("rooms_v2/"+c+"/members/"+slot).update(memObj).then(function(){
                LS("sr-code", c);
                LS("sr-me", slot);
                LS("sr_is_vip", "1");
                gate.remove();
                launchApp();
              });
            };
          });

          document.getElementById("vip_pick_box").style.display = "block";
        });
      } else {
        er.textContent = "ভুল ভিআইপি পাসকোড!";
      }
    };

    box.querySelectorAll(".btn-pick").forEach(function(b){
      b.onclick = function(){
        var mid = b.getAttribute("data-id");
        LS("sr-code", c);
        LS("sr-me", mid);
        gate.remove();
        launchApp();
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
    box.innerHTML = `
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
          <button class="btn ghost" id="btn_add_back" style="flex:1;padding:12px;border-radius:12px">পিছনে</button>
        </div>
      </div>
    `;

    var selGoal = "Medical";
    var customInp = document.getElementById("add_custom_goal");
    var gBtns = box.querySelectorAll(".gl button");

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
      var cls = document.getElementById("add_cls").value.trim();
      var mobRaw = document.getElementById("add_mob").value.trim();
      var mob = normMob(mobRaw);
      var goal = (selGoal === "custom") ? customInp.value.trim() : selGoal;
      var er = document.getElementById("add_err");
      var btnSub = document.getElementById("btn_add_submit");

      if(name.length < 2){ er.textContent = "নাম লেখো।"; return; }
      if(!cls){ er.textContent = "ক্লাস লেখো।"; return; }
      if(mobRaw && !mob){ er.textContent = "মোবাইল নম্বর অবশ্যই ১১ ডিজিটের হতে হবে (01XXXXXXXXX)।"; return; }

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
        var newMem = { name: name, college: college, cls: cls, goal: goal, mobile: mob, joinedAt: T };

        DB.ref("rooms_v2/"+c+"/members/"+newId).set(newMem).then(function(){
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
    box.innerHTML = `
      <div>
        <h2 style="font-size:20px;text-align:center;margin-bottom:4px">নতুন স্টাডি রুম তৈরি</h2>
        <p class="mute" style="text-align:center;margin-top:0;font-size:14px">প্রথম ৩ দিন সম্পূর্ণ ফ্রি ট্রায়াল পাবে</p>
        <input type="text" id="cr_rname" placeholder="রুমের নাম (যেমন: মিশন মেডিকেল)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
        <input type="text" id="cr_code" placeholder="রুমের পাসকোড (কমপক্ষে ৪ অক্ষর)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
        
        <p class="mute" style="font-size:13px;font-weight:600;margin:12px 0 4px">রুমের সর্বোচ্চ সদস্য সংখ্যা নির্ধারণ করো:</p>
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

        <input type="text" id="cr_name" placeholder="তোমার নাম" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
        <input type="text" id="cr_college" placeholder="তোমার স্কুল / কলেজ" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
        <input type="text" id="cr_cls" placeholder="ক্লাস (যেমন: HSC ২০২৭)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
        
        <p class="mute" style="font-size:13px;font-weight:600;margin:12px 0 6px">তোমার টার্গেট</p>
        <div class="gl">
          <button type="button" class="on" data-g="Medical">🩺 Medical</button>
          <button type="button" data-g="Engineering">⚙️ Engineering</button>
          <button type="button" data-g="Varsity">🏛️ Varsity</button>
          <button type="button" class="goal-custom" data-g="custom">🎯 + নিজের লক্ষ্য</button>
        </div>
        <input type="text" id="cr_custom_goal" placeholder="নিজের লক্ষ্য লেখো" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:8px;font:inherit;display:none" />
        
        <input type="tel" id="cr_mob" maxlength="11" oninput="this.value = this.value.replace(/[^0-9০-৯]/g, '').slice(0, 11)" placeholder="মোবাইল (01XXXXXXXXX - ১১ ডিজিট)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
        
        <div id="cr_err" style="color:var(--danger);font-size:14px;margin-top:8px;min-height:1.2em"></div>
        <div class="row" style="margin-top:14px;display:flex;gap:10px">
          <button class="btn" id="btn_cr_submit" style="flex:1;padding:12px;border-radius:12px">রুম বানাও</button>
          <button class="btn ghost" id="btn_cr_back" style="flex:1;padding:12px;border-radius:12px">পিছনে</button>
        </div>
      </div>
    `;

    var selGoal = "Medical";
    var customInp = document.getElementById("cr_custom_goal");
    var gBtns = box.querySelectorAll(".gl button");

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
      var college = document.getElementById("cr_college").value.trim();
      var cls = document.getElementById("cr_cls").value.trim();
      var mobRaw = document.getElementById("cr_mob").value.trim();
      var mob = normMob(mobRaw);
      var goal = (selGoal === "custom") ? customInp.value.trim() : selGoal;
      var er = document.getElementById("cr_err");
      var btnCr = document.getElementById("btn_cr_submit");

      if(!rname){ er.textContent = "রুমের নাম লেখো।"; return; }
      if(!code){ er.textContent = "পাসকোড কমপক্ষে ৪ অক্ষরের দাও।"; return; }
      if(name.length < 2){ er.textContent = "নাম লেখো।"; return; }
      if(mobRaw && !mob){ er.textContent = "মোবাইল নম্বর অবশ্যই ১১ ডিজিটের হতে হবে (01XXXXXXXXX)।"; return; }

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
              cls: cls,
              goal: goal,
              mobile: mob || "",
              joinedAt: Date.now(),
              creator: true
            }
          }
        };

        DB.ref("rooms_v2/" + code).set(newRoomData).then(function(){
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