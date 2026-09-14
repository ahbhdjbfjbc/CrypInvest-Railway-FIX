(() => {
  "use strict";

  const API_BASE = (localStorage.getItem("novax_api_base") || "/api").replace(/\/$/, "");
  const TOKEN_KEY = "novax_jwt";
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];

  const state = {
    screen: "home",
    marketFilter: "all",
    market: [],
    plans: [],
    wallet: { total: 2548.32, available: 2548.32, reserved: 0, deposits: 0, withdrawals: 0, change: 3.18 },
    deposit: { asset: "USDT", network: "TRC20", address: "" },
    withdraw: { asset: "USDT", network: "TRC20", fee: 1 },
    user: null,
    favorites: JSON.parse(localStorage.getItem("novax_favorites") || "[]")
  };

  const demoCoins = [
    {symbol:"BTC",name:"Bitcoin",price:64832.21,change:2.45,cls:"coin-btc"},
    {symbol:"ETH",name:"Ethereum",price:3248.17,change:1.82,cls:"coin-eth"},
    {symbol:"BNB",name:"BNB",price:582.36,change:1.21,cls:"coin-bnb"},
    {symbol:"SOL",name:"Solana",price:168.45,change:3.06,cls:"coin-sol"},
    {symbol:"XRP",name:"XRP",price:0.52,change:1.05,cls:"coin-xrp"},
    {symbol:"ADA",name:"Cardano",price:0.45,change:0.87,cls:"coin-ada"},
    {symbol:"DOGE",name:"Dogecoin",price:0.1224,change:2.17,cls:"coin-doge"}
  ];

  const demoPlans = [
    {id:"starter",name:"Starter",roi:1.5,min:100,max:2100,icon:"♛",cls:"green"},
    {id:"growth",name:"Growth",roi:2.5,min:50,max:500,icon:"♛",cls:"blue"},
    {id:"advanced",name:"Advanced",roi:3.5,min:100,max:1000,icon:"♛",cls:"pink"},
    {id:"premium",name:"Premium",roi:5.0,min:2500,max:50000,icon:"♛",cls:"green"},
    {id:"elite",name:"Elite",roi:7.0,min:5000,max:100000,icon:"♛",cls:"red"}
  ];

  function num(v){ const n=Number(v); return Number.isFinite(n) ? n : 0; }
  function money(v, digits=2){ return "$" + num(v).toLocaleString("en-US",{minimumFractionDigits:digits,maximumFractionDigits:digits}); }
  function assetMoney(v){ return num(v).toLocaleString("en-US",{minimumFractionDigits:4,maximumFractionDigits:4}) + " USDT"; }
  function pct(v){ return (num(v) >= 0 ? "+" : "") + num(v).toFixed(2) + "%"; }
  function esc(v){ return String(v ?? "").replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function toast(message){ const el=$("#toast"); el.textContent=message; el.classList.add("show"); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove("show"),2800); }
  function setMessage(id,msg,type=""){ const el=$("#"+id); if(!el)return; el.textContent=msg; el.className="form-message"+(type?" "+type:""); }

  async function apiFetch(path, options={}){
    const headers = {"Content-Type":"application/json", ...(options.headers||{})};
    const token = localStorage.getItem(TOKEN_KEY);
    if(token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, {...options, headers});
    let data = null;
    try { data = await res.json(); } catch(_){ data = {}; }
    if(!res.ok){
      const message = data?.message || data?.error || `HTTP ${res.status}`;
      throw new Error(message);
    }
    return data;
  }

  /* Ready-to-connect API functions requested */
  async function loginAPI(email, password, twoFactorCode=""){
    return apiFetch("/auth/login",{method:"POST",body:JSON.stringify({email,password,twoFactorCode})});
  }
  async function getWalletBalanceAPI(){
    return apiFetch("/wallet/balance");
  }
  async function getLivePricesAPI(){
    return apiFetch("/market/prices?symbols=BTC,ETH,BNB");
  }
  async function depositAPI(payload){
    return apiFetch("/wallet/deposit",{method:"POST",body:JSON.stringify(payload)});
  }
  async function withdrawAPI(payload){
    return apiFetch("/wallet/withdraw",{method:"POST",body:JSON.stringify(payload)});
  }

  // Expose API helpers for easy backend integration/debugging.
  window.NovaXAPI = { apiFetch, loginAPI, getWalletBalanceAPI, getLivePricesAPI, depositAPI, withdrawAPI };

  function showScreen(name, updateHash=true){
    const target = name === "dashboard" ? "wallet" : name;
    if(!$("#screen-"+target)) return;
    state.screen = target;
    $$(".screen").forEach(el => el.classList.toggle("active-screen", el.id === "screen-"+target));
    const active = ["home","market","plans","wallet","profile"].includes(target) ? target : "";
    $$(".nav-item").forEach(btn => btn.classList.toggle("active", btn.dataset.screen===active));
    $("#topbarTitle").textContent = $("#screen-"+target)?.dataset.title || "NovaX";
    if(updateHash) history.replaceState(null,"","#"+target);
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function coinIcon(c){
    const cls = c.cls || ({
      BTC:"coin-btc",ETH:"coin-eth",BNB:"coin-bnb",SOL:"coin-sol",
      XRP:"coin-xrp",ADA:"coin-ada",DOGE:"coin-doge"
    }[c.symbol]||"coin-xrp");
    const mark = ({BTC:"₿",ETH:"Ξ",BNB:"◆",SOL:"S",XRP:"X",ADA:"A",DOGE:"Ð"}[c.symbol]||"?");
    return `<span class="coin-icon ${cls}">${mark}</span>`;
  }

  function seedData(){
    state.market = demoCoins.map(x=>({...x, fav:state.favorites.includes(x.symbol)}));
    state.plans = demoPlans.slice();
  }

  function renderTickers(){
    const items = state.market.slice(0,4);
    $("#homeTickers").innerHTML = items.map(c => `
      <div class="ticker-card">
        ${coinIcon(c)}
        <div class="ticker-mid"><b>${esc(c.symbol)}</b><small>${esc(c.name)}</small></div>
        <em>${pct(c.change)}</em>
      </div>`).join("");
  }

  function renderHomePlans(){
    $("#homePlans").innerHTML = state.plans.slice(0,2).map((p,i)=>`
      <div class="mini-plan panel">
        <span class="plan-badge ${p.cls==='blue'?'blue':p.cls==='pink'?'pink':''}">${esc(p.icon)}</span>
        <div class="mini-plan-main"><strong>${esc(p.name)}</strong><small>$${num(p.min).toLocaleString()} — $${num(p.max).toLocaleString()}</small></div>
        <span class="mini-plan-roi">${num(p.roi).toFixed(1)}%</span>
      </div>`).join("");
  }

  function renderPlans(){
    $("#plansList").innerHTML = state.plans.map((p,i)=>`
      <article class="plan-card panel">
        <div class="plan-meta">
          <span class="plan-badge ${p.cls==='blue'?'blue':p.cls==='pink'?'pink':p.cls==='red'?'pink':''}">${esc(p.icon)}</span>
        </div>
        <div>
          <h3>${esc(p.name)}</h3>
          <div class="plan-return"><strong>${num(p.roi).toFixed(1)}%</strong><span>العائد</span></div>
          <div class="plan-limits"><span>من $${num(p.min).toLocaleString()}</span><span>إلى $${num(p.max).toLocaleString()}</span></div>
        </div>
        <div class="plan-cta"><small class="muted">خطة مرنة</small><button class="btn btn-gold small" data-action="invest" data-plan="${esc(p.id)}">استثمر الآن</button></div>
      </article>`).join("");
  }

  function miniSpark(change){
    const amp = Math.min(18, Math.max(6, Math.abs(num(change))*5));
    const dir = num(change)>=0 ? -1 : 1;
    const y2 = 28 + dir*amp;
    const stroke = num(change)>=0 ? "#00df9a" : "#ff4d68";
    return `<svg viewBox="0 0 120 38" preserveAspectRatio="none">
      <path d="M0 30 C10 28 14 22 25 25 S42 14 54 22 S72 18 82 20 S98 7 120 ${y2}" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
  }

  function renderMarket(){
    const q = ($("#marketSearch")?.value||"").trim().toLowerCase();
    let list = state.market.filter(c => `${c.symbol} ${c.name}`.toLowerCase().includes(q));
    if(state.marketFilter==="favorites") list = list.filter(c=>c.fav);
    if(state.marketFilter==="gainers") list = list.filter(c=>c.change>0).sort((a,b)=>b.change-a.change);
    if(state.marketFilter==="losers") list = list.filter(c=>c.change<0).sort((a,b)=>a.change-b.change);
    $("#marketList").innerHTML = list.map(c=>`
      <div class="market-row">
        <div class="market-coin">
          ${coinIcon(c)}
          <div><b>${esc(c.symbol)}</b><small>${esc(c.name)}</small></div>
        </div>
        <div class="spark">${miniSpark(c.change)}</div>
        <div class="market-price">${money(c.price, c.price<1?4:2)}</div>
        <div class="market-change ${c.change>=0?'up':'down'}">${pct(c.change)}</div>
        <button class="favorite ${c.fav?'active':''}" data-action="favorite" data-symbol="${esc(c.symbol)}">★</button>
      </div>`).join("") || `<div class="empty-state">لا توجد نتائج.</div>`;
  }

  function renderWallet(){
    $("#walletTotal").textContent = money(state.wallet.total);
    $("#walletAvailable").textContent = money(state.wallet.available);
    $("#walletReserved").textContent = money(state.wallet.reserved);
    $("#walletDeposits").textContent = money(state.wallet.deposits);
    $("#walletWithdrawals").textContent = money(state.wallet.withdrawals);
    $("#walletChange").textContent = pct(state.wallet.change);
    $("#withdrawBalance").textContent = money(state.wallet.available);
    const holdings = [
      {symbol:"USDT",name:"Tether",amount:1250,value:1250,change:"+ $1,250.00"},
      {symbol:"BTC",name:"Bitcoin",amount:.0421,value:2421.21,change:"+ $2,421.21"},
      {symbol:"ETH",name:"Ethereum",amount:.2156,value:698.32,change:"+ $698.32"},
      {symbol:"BNB",name:"BNB",amount:.3264,value:189.76,change:"+ $189.76"},
      {symbol:"SOL",name:"Solana",amount:1.2458,value:717.53,change:"+ $717.53"}
    ];
    $("#holdingsList").innerHTML = holdings.map(h=>`
      <div class="holding-row">
        <div class="holding-main">${coinIcon({...h,cls: h.symbol==="USDT"?"coin-sol":undefined})}<div><b>${esc(h.symbol)}</b><small>${esc(h.name)}</small></div></div>
        <div class="holding-value"><b>${num(h.amount).toLocaleString("en-US",{maximumFractionDigits:4})}</b><small>${esc(h.change)}</small></div>
        <div>${money(h.value)}</div>
      </div>`).join("");
  }

  function renderReferrals(){
    const list = [
      {name:"Ahmed123",date:"2026-09-10 12:45",reward:60,initial:"A"},
      {name:"SaraPro",date:"2026-09-09 18:20",reward:30,initial:"S"},
      {name:"AllCrypto",date:"2026-09-08 14:12",reward:30,initial:"A"}
    ];
    $("#referralList").innerHTML = list.map(r=>`
      <div class="ref-row"><span class="ref-avatar">${esc(r.initial)}</span><div><b>${esc(r.name)}</b><small>${esc(r.date)}</small></div><em>+$${num(r.reward).toFixed(2)}</em></div>`).join("");
  }

  async function refreshWallet(){
    try{
      const data = await getWalletBalanceAPI();
      const w = data?.wallet ?? data?.data?.wallet ?? data?.data ?? data;
      state.wallet.total = num(w?.total ?? w?.balance ?? state.wallet.total);
      state.wallet.available = num(w?.available ?? w?.availableBalance ?? state.wallet.available);
      state.wallet.reserved = num(w?.reserved ?? w?.locked ?? state.wallet.reserved);
      state.wallet.deposits = num(w?.totalDeposits ?? state.wallet.deposits);
      state.wallet.withdrawals = num(w?.totalWithdrawals ?? state.wallet.withdrawals);
      renderWallet();
      toast("تم تحديث رصيد المحفظة.");
    }catch(err){
      toast("تعذر جلب الرصيد من الـAPI، تم عرض البيانات الحالية.");
    }
  }

  async function refreshPrices(){
    try{
      const data = await getLivePricesAPI();
      const list = data?.prices ?? data?.data?.prices ?? data?.data ?? data;
      if(Array.isArray(list)){
        state.market = list.map(x=>({
          symbol:String(x.symbol||"").toUpperCase(),
          name:x.name||x.symbol,
          price:num(x.price),
          change:num(x.change24h ?? x.change),
          cls:({"BTC":"coin-btc","ETH":"coin-eth","BNB":"coin-bnb","SOL":"coin-sol"}[String(x.symbol||"").toUpperCase()]||"coin-xrp"),
          fav:state.favorites.includes(String(x.symbol||"").toUpperCase())
        }));
        renderTickers(); renderMarket();
      }
    }catch(err){
      toast("تعذر جلب الأسعار الحية، تم استخدام البيانات الاحتياطية للعرض.");
    }
  }

  async function handleLogin(e){
    e.preventDefault();
    const email=$("#loginEmail").value.trim(), password=$("#loginPassword").value;
    setMessage("loginMessage","جاري تسجيل الدخول...");
    try{
      const data = await loginAPI(email,password,"");
      const token = data?.token ?? data?.accessToken ?? data?.data?.token;
      if(!token) throw new Error("لم يُرجع الـBackend توكن JWT.");
      localStorage.setItem(TOKEN_KEY,token);
      state.user = data?.user ?? data?.data?.user ?? null;
      setMessage("loginMessage","تم تسجيل الدخول بنجاح.","success");
      toast("مرحباً بك في NovaX.");
      showScreen("wallet");
      refreshWallet();
    }catch(err){
      setMessage("loginMessage",`فشل تسجيل الدخول: ${err.message}`,"error");
    }
  }

  async function handleRegister(e){
    e.preventDefault();
    const payload = {
      name:$("#registerName").value.trim(),
      email:$("#registerEmail").value.trim(),
      password:$("#registerPassword").value,
      referralCode:$("#registerReferral").value.trim()
    };
    setMessage("registerMessage","جاري إنشاء الحساب...");
    try{
      const data = await apiFetch("/auth/register",{method:"POST",body:JSON.stringify(payload)});
      setMessage("registerMessage",data?.message||"تم إنشاء الحساب بنجاح.","success");
      toast("تم إنشاء الحساب.");
      setTimeout(()=>showScreen("login"),500);
    }catch(err){
      setMessage("registerMessage",`تعذر إنشاء الحساب: ${err.message}`,"error");
    }
  }

  async function handleForgot(e){
    e.preventDefault();
    setMessage("forgotMessage","جاري إرسال الطلب...");
    try{
      const data = await apiFetch("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:$("#forgotEmail").value.trim()})});
      setMessage("forgotMessage",data?.message||"تم إرسال الطلب.","success");
    }catch(err){
      setMessage("forgotMessage",`تعذر إرسال الطلب: ${err.message}`,"error");
    }
  }

  async function submitDeposit(e){
    e.preventDefault();
    const amount=num($("#depositAmount").value);
    if(amount<=0){ setMessage("depositMessage","أدخل مبلغاً صالحاً.","error"); return; }
    setMessage("depositMessage","جاري إرسال طلب الإيداع...");
    try{
      const data=await depositAPI({
        asset:state.deposit.asset,
        network:state.deposit.network,
        amount,
        txHash:$("#depositTx").value.trim()
      });
      setMessage("depositMessage",data?.message||"تم إرسال طلب الإيداع.","success");
      toast("تم إرسال طلب الإيداع.");
    }catch(err){
      setMessage("depositMessage",`تعذر تنفيذ الإيداع: ${err.message}`,"error");
    }
  }

  async function submitWithdraw(e){
    e.preventDefault();
    const amount=num($("#withdrawAmount").value);
    const address=$("#withdrawAddress").value.trim();
    if(!address || amount<=0){ setMessage("withdrawMessage","أدخل عنواناً ومبلغاً صالحين.","error"); return; }
    setMessage("withdrawMessage","جاري تنفيذ طلب السحب...");
    try{
      const data=await withdrawAPI({
        asset:$("#withdrawAsset").value,
        network:state.withdraw.network,
        address,
        amount
      });
      setMessage("withdrawMessage",data?.message||"تم إرسال طلب السحب.","success");
      toast("تم إرسال طلب السحب.");
      await refreshWallet();
    }catch(err){
      setMessage("withdrawMessage",`تعذر تنفيذ السحب: ${err.message}`,"error");
    }
  }

  async function loadDepositAddress(){
    $("#qrStatus").textContent="يتم تحميل عنوان الإيداع...";
    try{
      const data=await apiFetch(`/wallet/deposit-address?asset=${encodeURIComponent(state.deposit.asset)}&network=${encodeURIComponent(state.deposit.network)}`);
      const address = data?.address ?? data?.depositAddress ?? data?.data?.address;
      if(!address) throw new Error("الـBackend لم يُرجع عنواناً.");
      state.deposit.address = String(address);
      $("#depositAddress").textContent=state.deposit.address;
      $("#qrStatus").textContent="QR مرتبط بالعنوان الذي أرجعه الـAPI.";
      generateQrLikeCode(state.deposit.address);
    }catch(err){
      state.deposit.address="";
      $("#depositAddress").textContent="لا يوجد عنوان مؤكد";
      $("#qrStatus").textContent="تعذر جلب عنوان حقيقي من الـBackend؛ لا يتم إنشاء QR وهمي.";
      generateQrLikeCode("");
    }
  }

  function generateQrLikeCode(text){
    const el=$("#depositQr");
    if(!text){ el.style.backgroundImage="none"; el.innerHTML=""; return; }
    // Visual QR pattern only. For production, replace with a standards-compliant QR library
    // and encode exactly the same verified address returned by the backend.
    const seed=[...text].reduce((a,c)=>a+c.charCodeAt(0),0);
    let cells="";
    for(let i=0;i<121;i++) cells += ((i*31+seed)%7<3) ? "■" : "";
    el.textContent=cells;
  }

  function setDepositAsset(asset){
    state.deposit.asset=asset;
    $$("#depositAssets .asset-tab").forEach(b=>b.classList.toggle("active",b.dataset.asset===asset));
    loadDepositAddress();
  }
  function setDepositNetwork(network, scope="deposit"){
    state[scope].network=network;
    $$("#"+(scope==="deposit"?"depositNetworks":"withdrawNetworks")+" .network-tab").forEach(b=>b.classList.toggle("active",b.dataset.network===network));
    if(scope==="deposit") loadDepositAddress();
  }

  async function shareReferral(kind){
    const link=$("#referralLink").textContent.trim();
    try{
      if(kind==="copy"){ await navigator.clipboard.writeText(link); toast("تم نسخ رابط الإحالة."); return; }
      if(kind==="native" && navigator.share){ await navigator.share({title:"NovaX",text:"انضم إلى NovaX عبر رابط الإحالة",url:link}); return; }
      if(kind==="telegram"){ window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("انضم إلى NovaX")}`,"_blank","noopener"); return; }
      if(kind==="whatsapp"){ window.open(`https://wa.me/?text=${encodeURIComponent("انضم إلى NovaX: "+link)}`,"_blank","noopener"); return; }
      await navigator.clipboard.writeText(link); toast("تم نسخ الرابط.");
    }catch(_){ toast("تعذر تنفيذ المشاركة من هذا المتصفح."); }
  }

  async function copyText(text,message){
    try{ await navigator.clipboard.writeText(text); toast(message||"تم النسخ."); }
    catch(_){ toast("تعذر النسخ تلقائياً."); }
  }

  function logout(){
    localStorage.removeItem(TOKEN_KEY);
    state.user=null;
    toast("تم تسجيل الخروج.");
    showScreen("login");
  }

  async function socialLogin(provider){
    try{
      const data = await apiFetch(`/auth/${provider}`,{method:"POST",body:JSON.stringify({provider})});
      const token=data?.token ?? data?.accessToken ?? data?.data?.token;
      if(!token) throw new Error("OAuth endpoint لم يُرجع JWT.");
      localStorage.setItem(TOKEN_KEY,token);
      toast(`تم تسجيل الدخول عبر ${provider==="google"?"Google":"Apple"}.`);
      showScreen("wallet");
      refreshWallet();
    }catch(err){
      toast(`تسجيل ${provider} يحتاج OAuth/Backend جاهز: ${err.message}`);
    }
  }

  function maybeRestoreSession(){
    const token=localStorage.getItem(TOKEN_KEY);
    if(token){
      // We keep the JWT and load the wallet. Do not fabricate user identity.
      refreshWallet();
    }
  }

  document.addEventListener("click", e=>{
    const screenBtn=e.target.closest("[data-screen]");
    if(screenBtn){ e.preventDefault(); showScreen(screenBtn.dataset.screen); return; }

    const action=e.target.closest("[data-action]");
    if(!action) return;

    const act=action.dataset.action;
    if(act==="toggle-password"){
      const input=$("#"+action.dataset.target); if(input) input.type=input.type==="password"?"text":"password";
    }else if(act==="favorite"){
      const symbol=action.dataset.symbol;
      state.favorites=state.favorites.includes(symbol)?state.favorites.filter(x=>x!==symbol):[...state.favorites,symbol];
      localStorage.setItem("novax_favorites",JSON.stringify(state.favorites));
      state.market.forEach(c=>{if(c.symbol===symbol)c.fav=!c.fav;});
      renderMarket(); renderTickers();
    }else if(act==="copy-address"){
      const t=state.deposit.address;
      if(t) copyText(t,"تم نسخ عنوان الإيداع."); else toast("لا يوجد عنوان مؤكد للنسخ.");
    }else if(act==="copy-referral"){ copyText($("#referralLink").textContent.trim(),"تم نسخ رابط الإحالة."); }
    else if(act==="refresh-wallet"){ refreshWallet(); }
    else if(act==="logout"){ logout(); }
    else if(act==="toast"){ toast(action.dataset.message||"تم"); }
    else if(act==="google-login"){ socialLogin("google"); }
    else if(act==="apple-login"){ socialLogin("apple"); }
    else if(act==="edit-profile"){ toast("يمكن ربط هذا الزر بواجهة تعديل الملف الشخصي لاحقاً."); }
    else if(act==="invest"){
      const p=state.plans.find(x=>x.id===action.dataset.plan);
      if(!p)return;
      // No native prompt is used. Use a lightweight custom request through a modal-like confirm area.
      // To keep the three-file requirement and avoid browser prompts, request via an inline toast + wallet destination.
      showScreen("wallet");
      toast(`اختر خطة ${p.name} ثم اربط زر الاستثمار بـ POST /investments في الـBackend.`);
    }
  });

  // Explicitly prevent native prompt/alert/confirm usage by this UI.
  // Investment API placeholder intentionally does not pretend a backend contract that was not supplied.

  document.addEventListener("submit", e=>{
    if(e.target.id==="loginForm") handleLogin(e);
    if(e.target.id==="registerForm") handleRegister(e);
    if(e.target.id==="forgotForm") handleForgot(e);
    if(e.target.id==="depositForm") submitDeposit(e);
    if(e.target.id==="withdrawForm") submitWithdraw(e);
  });

  $("#marketSearch").addEventListener("input",renderMarket);

  $$("#screen-market [data-market-filter]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      state.marketFilter=btn.dataset.marketFilter;
      $$("#screen-market [data-market-filter]").forEach(x=>x.classList.toggle("active",x===btn));
      renderMarket();
    });
  });

  $$("#depositAssets .asset-tab").forEach(btn=>btn.addEventListener("click",()=>setDepositAsset(btn.dataset.asset)));
  $$("#depositNetworks .network-tab").forEach(btn=>btn.addEventListener("click",()=>setDepositNetwork(btn.dataset.network,"deposit")));
  $$("#withdrawNetworks .network-tab").forEach(btn=>btn.addEventListener("click",()=>setDepositNetwork(btn.dataset.network,"withdraw")));
  $$("#screen-referrals [data-share]").forEach(btn=>btn.addEventListener("click",()=>shareReferral(btn.dataset.share)));

  window.addEventListener("hashchange",()=>showScreen(location.hash.replace("#","")||"home",false));
  window.addEventListener("popstate",()=>showScreen(location.hash.replace("#","")||"home",false));
  $("[data-action='back']")?.addEventListener("click",()=>history.back());

  seedData();
  renderTickers();
  renderHomePlans();
  renderPlans();
  renderMarket();
  renderWallet();
  renderReferrals();
  showScreen(location.hash.replace("#","")||"home",false);
  maybeRestoreSession();
})();
