import { useState, useEffect, Component } from "react";

// ══════════════════════════════════════════════════
// ⚠️  여기에 Apps Script 배포 URL 붙여넣기
// ══════════════════════════════════════════════════
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw9pIOOLYgwbVC9UgEn04kIsI5P2wMdCkc_gqSu2LaoD9-UJoQd2-uc2ewvJ1yR0WSyaQ/exec";
// ══════════════════════════════════════════════════
// 앱 버전 (배포 시 자동 갱신용 - 화면에 작게 표시됨)
const BUILD_VERSION = "v1.0.9";
const BUILD_DATE = "2026-04-29";
// ══════════════════════════════════════════════════

// ── 데이터 ────────────────────────────────────────
// actual = 최초 견적 표시 금액 (후려치기용), real = 실제 청구 기준
const OPEN_TYPES = [
  { id: "handle", label: "문",           actual: 30000,  real: 60000  },
  { id: "fire",   label: "방화문",       actual: 50000,  real: 100000 },
  { id: "aux",    label: "도어락 보조키", actual: 80000,  real: 120000 },
  { id: "main",   label: "도어락 주키",  actual: 80000,  real: 150000 },
  { id: "push",   label: "푸쉬풀",       actual: 80000,  real: 150000 },
];

const INSTALL_TYPES = [
  { id: "key",  label: "열쇠",     base: 50000,  real: 50000   },
  { id: "aux",  label: "보조키",   base: 180000, real: 180000  },
  { id: "main", label: "주키",     base: 230000, real: 230000  },
  { id: "push", label: "푸쉬풀",   base: 350000, real: 350000  },
  { id: "sash", label: "강화유리문", base: 250000, real: 250000  },
  { id: "etc",  label: "기타",     base: 0,      real: 0       },
];

const ETC_INSTALL_ITEMS = [
  { id:"safety_b",  label:"안전고리 기본형",  price:50000  },
  { id:"safety_p",  label:"안전고리 고급형",  price:70000  },
  { id:"closer",    label:"도어클로저",       price:70000  },
  { id:"closer_s",  label:"도어클로저 정지형", price:100000 },
  { id:"horseshoe", label:"말발굽",           price:50000  },
  { id:"handle",    label:"컵핸들",           price:60000  },
  { id:"lever",     label:"방문레바",         price:50000  },
  { id:"gate_lock", label:"현관정",           price:50000  },
  { id:"custom",    label:"직접입력",         price:0      },
];

const PAYMENT_METHODS = [
  { id:"cash",     label:"현금"     },
  { id:"transfer", label:"계좌이체" },
  { id:"card",     label:"카드결제" },
];
const RECEIPT_TYPES = [
  { id:"cash_req",  label:"현금영수증 요청" },
  { id:"cash_done", label:"현금영수증 발급" },
  { id:"tax_req",   label:"세금계산서 요청" },
  { id:"tax_done",  label:"세금계산서 발급" },
  { id:"simple_req",label:"간이영수증 요청" },
  { id:"simple_done",label:"간이영수증 발급"},
];

const PRODUCTS = [
  { id:"lp_h60n",  brand:"락프로",type:"보조키",name:"H60N",     price:180000,cost:30000 },
  { id:"lp_h60s",  brand:"락프로",type:"보조키",name:"H60S",     price:200000,cost:35000 },
  { id:"lp_c50_1", brand:"락프로",type:"보조키",name:"C50 1way", price:180000,cost:29000 },
  { id:"lp_c50_2", brand:"락프로",type:"보조키",name:"C50s 2way",price:200000,cost:36000 },
  { id:"un_t250",  brand:"유니코",type:"보조키",name:"T250",     price:200000,cost:46000 },
  { id:"un_b200",  brand:"유니코",type:"보조키",name:"B200",     price:190000,cost:35000 },
  { id:"lp_m151",  brand:"락프로",type:"주키",  name:"M151N",    price:230000,cost:47000 },
  { id:"lp_t131",  brand:"락프로",type:"주키",  name:"T131S",    price:250000,cost:60000,note:"목문형"},
  { id:"lp_h500",  brand:"락프로",type:"주키",  name:"H500s",    price:260000,cost:59000 },
  { id:"lp_h2000", brand:"락프로",type:"주키",  name:"H2000s",   price:280000,cost:63000 },
  { id:"ms_600",   brand:"마스터",type:"주키",  name:"600s",     price:230000,cost:50000 },
  { id:"ms_7100",  brand:"마스터",type:"주키",  name:"7100s",    price:300000,cost:63000 },
  { id:"lp_h5000", brand:"락프로",type:"푸쉬풀",name:"H5000s",   price:350000,cost:85000  },
  { id:"lp_h5000f",brand:"락프로",type:"푸쉬풀",name:"H5000fs",  price:400000,cost:110000 },
  { id:"ms_8600",  brand:"마스터",type:"푸쉬풀",name:"8600s",    price:350000,cost:85000  },
  { id:"ms_8600f", brand:"마스터",type:"푸쉬풀",name:"8600fs",   price:400000,cost:110000 },
  { id:"ms_8000f", brand:"마스터",type:"푸쉬풀",name:"8000fs",   price:500000,cost:145000 },
  { id:"lp_gl7000",brand:"락프로",type:"강화유리",name:"GL7000s",price:280000,cost:55000 },
  { id:"un_gt250", brand:"유니코",type:"강화유리",name:"GT-250", price:210000,cost:57000 },
  { id:"etc_lever",brand:"-",    type:"기타",  name:"방문레바",   price:50000,cost:11000 },
  { id:"etc_lock", brand:"-",    type:"기타",  name:"현관정",     price:50000,cost:9000  },
  { id:"etc_cup",  brand:"-",    type:"기타",  name:"컵핸들",     price:60000,cost:20000 },
  { id:"etc_closer",brand:"-",   type:"기타",  name:"도어클로져", price:70000,cost:20000 },
];

const REINFORCEMENTS = [
  { id:"r_sm",label:"보강판 소", price:30000,cost:5000 },
  { id:"r_md",label:"보강판 중", price:30000,cost:5000 },
  { id:"r_lg",label:"보강판 대", price:30000,cost:5000 },
  { id:"r_db",label:"직방 보강판",price:30000,cost:5000 },
];

const SURCHARGES = [
  { id:"night",  label:"야간 할증",amount:15000 },
  { id:"weekend",label:"주말 할증",amount:10000 },
];

const CANCEL_REASONS = [
  { label:"고객 변심",          travel:true  },
  { label:"타업체 선택",        travel:true  },
  { label:"출동 중 취소",       travel:true  },
  { label:"연락 두절",          travel:true  },
  { label:"기타 (출장비 O)",    travel:true  },
  { label:"기타 (출장비 X)",    travel:false },
  { label:"작업 불가 (기술 부족)", travel:false },
];
const TRAVEL_FEE = 30000;
const TRAVEL_FEE_SOOMGO = 10000;

// 숨고 가격 계산
const soomgoPrice = (price) => {
  if (!price || price < 10000) return Math.floor((price||0) * 0.7);
  return Math.floor(price * 0.7 / 10000) * 10000;
};
const soomgoOpen  = (price) => {
  if (!price || price < 10000) return Math.floor((price||0) * 0.5);
  return Math.floor(price * 0.5 / 10000) * 10000;
};
const WORK_TYPES = [
  { id:"open",    label:"개문" },
  { id:"install", label:"단순설치" },
  { id:"both",    label:"개문+설치" },
];
const WEEKDAYS = ["일","월","화","수","목","금","토"];
const MONTHS   = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const STATUS_CONFIG = {
  "견적대기": { emoji:"📋", color:"#888",   bg:"#f5f5f5", order:3 },
  "예약":     { emoji:"📅", color:"#7c3aed", bg:"#f5f3ff", order:2 },
  "출동중":   { emoji:"🚗", color:"#2563eb", bg:"#eff6ff", order:1 },
  "작업중":   { emoji:"🔧", color:"#d97706", bg:"#fffbeb", order:0 },
  "완료":     { emoji:"✅", color:"#16a34a", bg:"#f0fdf4", order:4 },
  "취소":     { emoji:"❌", color:"#dc2626", bg:"#fef2f2", order:5 },
};

// ── 유틸 ──────────────────────────────────────────
const fmt  = n => n.toLocaleString("ko-KR");
const fmtInput = v => { const n=String(v).replace(/\D/g,""); return n?Number(n).toLocaleString("ko-KR"):""; };
const parseAmt = v => Number(String(v).replace(/,/g,""))||0;
const formatPhone = v => {
  const d=v.replace(/\D/g,"").slice(0,11);
  if(d.length<4) return d;
  if(d.length<8) return `${d.slice(0,3)}-${d.slice(3)}`;
  return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
};
const todayStr = () => {
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const nowTime = () => {
  const d=new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
};
const getDaysInMonth  = (y,m) => new Date(y,m+1,0).getDate();
const getFirstDayOfMonth = (y,m) => new Date(y,m,1).getDay();

// ── API ──────────────────────────────────────────
// JSONP 호출 카운터 (병렬 호출 시 ID 충돌 방지)
let __gasCounter = 0;
const fetchGAS = (url) => {
  return new Promise((resolve, reject) => {
    // Date.now() + counter + random 으로 절대 충돌 안 나는 ID 생성
    __gasCounter = (__gasCounter + 1) % 1000000;
    const id = "gas_" + Date.now() + "_" + __gasCounter + "_" + Math.floor(Math.random()*1000000);
    const script = document.createElement("script");
    let timeoutId = null;
    
    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      delete window[id];
      try { if (script.parentNode) script.parentNode.removeChild(script); } catch(e) {}
    };
    
    window[id] = (data) => {
      cleanup();
      resolve(data);
    };
    script.src = url + "&callback=" + id;
    script.onerror = () => { cleanup(); reject(new Error("fetch failed")); };
    timeoutId = setTimeout(() => { cleanup(); reject(new Error("timeout")); }, 15000);
    document.head.appendChild(script);
  });
};

const api = {
  getMonth: async (month) => {
    if (SCRIPT_URL === "여기에_URL_붙여넣기") return [];
    try {
      const data = await fetchGAS(`${SCRIPT_URL}?action=getMonth&month=${month}&_=${Date.now()}_${Math.random()}`);
      return Array.isArray(data) ? data : [];
    } catch(e) { return []; }
  },
  getAll: async () => {
    if (SCRIPT_URL === "여기에_URL_붙여넣기") return [];
    try {
      const data = await fetchGAS(`${SCRIPT_URL}?action=getAll&_=${Date.now()}_${Math.random()}`);
      return Array.isArray(data) ? data : [];
    } catch(e) { return []; }
  },
  save: async (record) => {
    if (SCRIPT_URL === "여기에_URL_붙여넣기") return { success:true };
    const url = `${SCRIPT_URL}?action=save&data=${encodeURIComponent(JSON.stringify(record))}&_=${Date.now()}`;
    // 최대 3회 재시도
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await fetchGAS(url);
        if (result && !result.error) return result;
        if (attempt === 2) return result || { success:false, error:"unknown" };
      } catch(e) {
        if (attempt === 2) {
          // 마지막 시도 실패 → POST fallback
          try {
            const body = new URLSearchParams();
            body.append("data", JSON.stringify({ action:"save", record }));
            await fetch(SCRIPT_URL, { method:"POST", body, mode:"no-cors" });
          } catch(e2) {}
          return { success:false, error: e.message };
        }
      }
      await new Promise(r=>setTimeout(r, 500 * (attempt+1))); // 0.5s, 1s 대기
    }
  },
  update: async (id, fields) => {
    if (SCRIPT_URL === "여기에_URL_붙여넣기") return { success:true };
    try {
      const url = `${SCRIPT_URL}?action=update&id=${encodeURIComponent(id)}&fields=${encodeURIComponent(JSON.stringify(fields))}&_=${Date.now()}`;
      const result = await fetchGAS(url);
      return result || { success:true };
    } catch(e) {
      try {
        const body = new URLSearchParams();
        body.append("data", JSON.stringify({ action:"update", id, fields }));
        await fetch(SCRIPT_URL, { method:"POST", body, mode:"no-cors" });
      } catch(e2) {}
      return { success:false, error: e.message };
    }
  },
  delete: async (id) => {
    if (SCRIPT_URL === "여기에_URL_붙여넣기") return { success:true };
    try {
      const url = `${SCRIPT_URL}?action=delete&id=${encodeURIComponent(id)}&_=${Date.now()}`;
      const result = await fetchGAS(url);
      return result || { success:true };
    } catch(e) {
      try {
        const body = new URLSearchParams();
        body.append("data", JSON.stringify({ action:"delete", id }));
        await fetch(SCRIPT_URL, { method:"POST", body, mode:"no-cors" });
      } catch(e2) {}
      return { success:false, error: e.message };
    }
  },
  // ─── 자재 관리 ───
  getMaterials: async () => {
    if (SCRIPT_URL === "여기에_URL_붙여넣기") return [];
    try {
      const data = await fetchGAS(`${SCRIPT_URL}?action=getMaterials&_=${Date.now()}`);
      return Array.isArray(data) ? data : [];
    } catch(e) { return []; }
  },
  saveMaterial: async (material) => {
    if (SCRIPT_URL === "여기에_URL_붙여넣기") return { success:true };
    try {
      const body = new URLSearchParams();
      body.append("data", JSON.stringify({ action:"saveMaterial", material }));
      await fetch(SCRIPT_URL, { method:"POST", body, mode:"no-cors" });
    } catch(e) {}
    return { success:true };
  },
  updateMaterial: async (id, material) => {
    if (SCRIPT_URL === "여기에_URL_붙여넣기") return { success:true };
    try {
      const body = new URLSearchParams();
      body.append("data", JSON.stringify({ action:"updateMaterial", id, material }));
      await fetch(SCRIPT_URL, { method:"POST", body, mode:"no-cors" });
    } catch(e) {}
    return { success:true };
  },
  deleteMaterial: async (id) => {
    if (SCRIPT_URL === "여기에_URL_붙여넣기") return { success:true };
    try {
      const body = new URLSearchParams();
      body.append("data", JSON.stringify({ action:"deleteMaterial", id }));
      await fetch(SCRIPT_URL, { method:"POST", body, mode:"no-cors" });
    } catch(e) {}
    return { success:true };
  },
};

// ════════════════════════════════════════════════
// 메인 앱
// ════════════════════════════════════════════════
// ── 에러 바운더리: 한 컴포넌트에서 에러 나도 앱 전체 죽지 않게 ──
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("앱 에러:", error, info);
  }
  reset = () => this.setState({ hasError: false, error: null });
  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding:"40px 20px",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>😵</div>
          <div style={{fontSize:16,fontWeight:700,color:"#111",marginBottom:8}}>이 화면에서 오류가 발생했어요</div>
          <div style={{fontSize:12,color:"#888",marginBottom:20,wordBreak:"break-all",padding:"0 20px"}}>
            {String(this.state.error?.message || this.state.error || "알 수 없는 오류")}
          </div>
          <button onClick={() => { this.reset(); if (this.props.onReset) this.props.onReset(); }}
            style={{padding:"12px 24px",borderRadius:12,border:"none",background:"#111",color:"#fff",fontFamily:"'Noto Sans KR',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer"}}>
            ← 캘린더로 돌아가기
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [tab, setTab]       = useState("calendar"); // calendar | first | final
  const [records, setRecords] = useState([]);
  const [allTimeRecords, setAllTimeRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false); // 저장 중 더블클릭 방지
  const [toast, setToast]   = useState(null);
  const showToast = (msg, type="success") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 3000);
  };

  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null); // 완료 카드 상세 모달
  const [showCancel, setShowCancel] = useState(null);
  const [confirmDispatch, setConfirmDispatch] = useState(null);
  const [showReserve, setShowReserve] = useState(null); // {id}
  const [reserveForm, setReserveForm] = useState({date:"", time:""});
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [addForm, setAddForm] = useState({
    channel:"office", time:"", workType:"",
    openItems:[], products:[], productFilter:"전체",
    note:"", status:"완료", phone:"", address:"",
    noTravel:false, customTotal:"", customMyE:"",
  });
  const [searchQuery, setSearchQuery] = useState("");

  // 자재 목록 (시트와 동기화 + localStorage 캐시)
  const [productList, setProductList] = useState(()=>{
    try {
      const saved = localStorage.getItem("doorlock_materials");
      return saved ? JSON.parse(saved) : [];
    } catch(e) { return []; }
  });
  const setProductListPersist = (next) => {
    setProductList(prev => {
      const value = typeof next === "function" ? next(prev) : next;
      try { localStorage.setItem("doorlock_materials", JSON.stringify(value)); } catch(e) {}
      return value;
    });
  };
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({name:"",brand:"",type:"",price:"",cost:"",desc:"",note:"",grade:"",feature:"",shape:"",series:"",warranty:"",boxImg:"",installImg:""});
  const [prodBrandFilter, setProdBrandFilter] = useState("전체");
  const [prodTypeFilter,  setProdTypeFilter]  = useState("전체");
  const [prodPriceMode,   setProdPriceMode]   = useState("office"); // office | soomgo
  const [selectedProd,    setSelectedProd]    = useState(null);

  // 최초 견적서 상태
  const [fq, setFq] = useState({
    channel:null, phone:"", address:"", workType:null,
    openItems:[], installItems:[], surcharges:[], memo:"",
    reserveDate:"", reserveTime:"", noTravel:false,
  });
  const [fqStep, setFqStep] = useState("form"); // form | card

  // 최종 견적서 상태
  const [fnq, setFnq] = useState({
    step:"form", channel:null, phone:"", address:"",
    workType:null, openItems:[], products:[],
    reinforcements:[], remodeling:"", surcharges:[],
    fieldNote:"", filterType:"전체", finalAdj:0,
    recordId: null, payment:null, etcItems:[],
  });

  // ── 데이터 로드 ──
  const loadRecords = async () => {
    setLoading(true);
    const monthStr2 = `${year}-${String(month+1).padStart(2,"0")}`;
    
    // 두 호출을 병렬로 동시에 보냄 (시간 절반)
    const monthPromise = api.getMonth(monthStr2);
    const allPromise   = api.getAll();
    
    // 1️⃣ getMonth가 먼저 도착하면 → 캘린더 즉시 표시 + 로딩 해제
    try {
      const data = await monthPromise;
      const mapped = (Array.isArray(data)?data:[]).map(r=>({
        ...r,
        ID: String(r.ID||r["ID"]||""),
        날짜: r["날짜"]||r.date||"",
        시간: r["시간"]||r.time||"",
        채널: r["채널"]||r.channel||"",
        상태: r["상태"]||r.status||"견적대기",
        연락처: r["연락처"]||r.phone||"",
        주소: r["주소"]||r.address||"",
        작업유형: r["작업유형"]||r.workType||"",
        개문유형: r["개문유형"]||r.openType||"",
        제품명: r["제품명"]||r.product||"",
        총금액: Number(r["총금액"]||r.total||0),
        준형수령액: Number(r["준형수령액"]||r.myEarnings||0),
        자재원가: Number(r["자재원가"]||r.materialCost||0),
        할인금액: Number(r["할인금액"]||r.discount||0),
        현장메모: r["현장메모"]||r.note||"",
        취소사유: r["취소사유"]||r.cancelReason||"",
        결제방법: r["결제방법"]||"",
        영수증: r["영수증"]||"",
        결제완료: r["결제완료"]===true || r["결제완료"]==="TRUE" || r["결제완료"]==="true",
        부가세: Number(r["부가세"]||0),
        개문금액: Number(r["개문금액"]||0),
        설치금액: Number(r["설치금액"]||0),
        출장비: Number(r["출장비"]||30000),
      }));
      setRecords(mapped);
      // 시트에 저장된 ID는 localRecords에서 제거 (중복 표시 방지)
      const sheetIdSet = new Set(mapped.map(r=>String(r.ID)));
      setLocalRecords(p => p.filter(r => !sheetIdSet.has(String(r.ID))));
      setLoading(false); // 캘린더 보일 수 있으니 로딩 즉시 해제
    } catch(e) {
      console.error("loadRecords error (month):", e);
      setLoading(false);
    }
    
    // 2️⃣ getAll은 백그라운드로 마저 처리 (대기/예약 탭용)
    try {
      const allData = await allPromise;
      const allMapped = (Array.isArray(allData)?allData:[]).map(r=>({
        ...r,
        ID: String(r.ID||""),
        날짜: r["날짜"]||"", 시간: r["시간"]||"",
        채널: r["채널"]||"", 상태: r["상태"]||"견적대기",
        연락처: r["연락처"]||"", 주소: r["주소"]||"",
        작업유형: r["작업유형"]||"", 개문유형: r["개문유형"]||"",
        제품명: r["제품명"]||"",
        총금액: Number(r["총금액"]||0),
        준형수령액: Number(r["준형수령액"]||0),
        자재원가: Number(r["자재원가"]||0),
        할인금액: Number(r["할인금액"]||0),
        현장메모: r["현장메모"]||"",
        취소사유: r["취소사유"]||"",
        결제방법: r["결제방법"]||"",
        영수증: r["영수증"]||"",
        결제완료: r["결제완료"]===true || r["결제완료"]==="TRUE" || r["결제완료"]==="true",
        부가세: Number(r["부가세"]||0),
        개문금액: Number(r["개문금액"]||0),
        설치금액: Number(r["설치금액"]||0),
        출장비: Number(r["출장비"]||30000),
      }));
      setAllTimeRecords(allMapped);
    } catch(e) {
      console.error("loadRecords error (all):", e);
    }
  };

  useEffect(() => { loadRecords(); }, [year, month]);

  // ── 자재 목록을 시트에서 로드 (앱 시작 시 1번) ──
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const loadMaterials = async () => {
    if (SCRIPT_URL === "여기에_URL_붙여넣기") return;
    setMaterialsLoading(true);
    try {
      const data = await api.getMaterials();
      if (Array.isArray(data) && data.length > 0) {
        // 한국어 헤더 → 앱 내부 키로 변환
        const mapped = data.map(m => ({
          id:    m["ID"]    || m.id    || ("m_" + Date.now()),
          brand: m["브랜드"] || m.brand || "-",
          type:  m["종류"]   || m.type  || "기타",
          name:  m["제품명"] || m.name  || "",
          price: Number(m["소매가"] || m.price || 0),
          cost:  Number(m["원가"]   || m.cost  || 0),
          note:  m["비고"]   || m.note  || "",
          grade:      m["보안등급"]    || m.grade      || "",
          feature:    m["특징"]        || m.feature    || "",
          shape:      m["형태"]        || m.shape      || "",
          series:     m["시리즈연동"]   || m.series     || "",
          warranty:   m["보증"]        || m.warranty   || "",
          boxImg:     m["박스사진URL"]  || m.boxImg     || "",
          installImg: m["장착사진URL"]  || m.installImg || "",
          fromSheet: true,
        }));
        setProductListPersist(mapped);
      }
    } catch(e) { console.error("loadMaterials error:", e); }
    setMaterialsLoading(false);
  };
  useEffect(() => { loadMaterials(); }, []);

  // 모바일 최적화: viewport 메타태그 자동 설정
  useEffect(() => {
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement("meta");
      viewport.name = "viewport";
      document.head.appendChild(viewport);
    }
    viewport.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
  }, []);

  // ── 로컬 레코드 (localStorage 영구 저장) ──
  const [localRecords, setLocalRecordsState] = useState(()=>{
    try {
      const saved = localStorage.getItem("doorlock_records");
      return saved ? JSON.parse(saved) : [];
    } catch(e) { return []; }
  });

  const setLocalRecords = (updater) => {
    setLocalRecordsState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try { localStorage.setItem("doorlock_records", JSON.stringify(next)); } catch(e) {}
      return next;
    });
  };
  const monthStr = `${year}-${String(month+1).padStart(2,"0")}`;
  
  // 통합 자재 목록: 시트(productList)가 우선, 비어있으면 코드 기본값(PRODUCTS) fallback
  const allMaterials = productList.length > 0 ? productList : PRODUCTS;
  const sheetIds = new Set(records.map(r=>String(r.ID)));
  const mergedRecords = [
    ...records,
    ...localRecords.filter(r => r.날짜?.startsWith(monthStr) && !sheetIds.has(String(r.ID)))
  ];

  // 날짜별 맵
  const byDate = {};
  mergedRecords.forEach(r => {
    if (!byDate[r.날짜]) byDate[r.날짜] = [];
    byDate[r.날짜].push(r);
  });

  // 월 통계 (완료된 작업만)
  const completed = mergedRecords.filter(r=>r.상태==="완료");
  const monthTotal    = completed.reduce((a,r)=>a+Number(r.총금액||0),0);
  const monthEarnings = completed.reduce((a,r)=>a+Number(r.준형수령액||0),0);

  // 캘린더 그리드
  const daysInMonth  = getDaysInMonth(year, month);
  const firstDay     = getFirstDayOfMonth(year, month);
  const cells = [];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);
  const dateStr = d => d?`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`:null;
  const isToday = d => { const t=new Date(); return d&&year===t.getFullYear()&&month===t.getMonth()&&d===t.getDate(); };

  const selectedDayRecords = selectedDate
    ? (byDate[selectedDate]||[]).sort((a,b)=>{
        const ao = STATUS_CONFIG[a.상태]?.order??9;
        const bo = STATUS_CONFIG[b.상태]?.order??9;
        return ao - bo;
      })
    : [];

  // ── 최초 견적서 저장 ──
  const saveFirstQuote = (status="견적대기") => {
    if (saving) return; // 더블클릭 방지
    
    // 입력 검증
    if (!fq.channel) { showToast("채널을 선택해주세요","error"); return; }
    if (!fq.workType) { showToast("작업 유형을 선택해주세요","error"); return; }
    if (status==="예약" && !fq.reserveDate) { showToast("예약 날짜를 선택해주세요","error"); return; }
    
    setSaving(true);
    const isSoomgoQuote = fq.channel?.id === "soomgo";
    const travelFee   = fq.noTravel ? 0 : (isSoomgoQuote ? TRAVEL_FEE_SOOMGO : TRAVEL_FEE);
    const needOpen    = fq.workType?.id==="open"    || fq.workType?.id==="both";
    const needInstall = fq.workType?.id==="install" || fq.workType?.id==="both";
    const openTotal   = fq.openItems.reduce((a,i)=>a+(isSoomgoQuote ? soomgoOpen(i.actual||0) : (i.actual||0))*i.qty, 0);
    const installPrice= needInstall ? fq.installItems.reduce((a,i)=>{
      if (i.id === "etc") return a + (i.etcPrice||0);
      const base = isSoomgoQuote && i.base>0 ? soomgoPrice(i.base) : i.base;
      return a + base * i.qty;
    }, 0) : 0;
    const surTotal    = fq.surcharges.reduce((a,s)=>a+s.amount, 0);
    const total       = travelFee+(needOpen?openTotal:0)+installPrice+surTotal;
    const id          = Date.now().toString();
    const isReserve   = status==="예약" && fq.reserveDate;
    const record = {
      id,
      date: isReserve ? fq.reserveDate : todayStr(),
      time: isReserve ? (fq.reserveTime||"00:00") : nowTime(),
      channel: fq.channel?.id || "",
      status,
      phone: fq.phone || "",
      address: fq.address,
      workType: fq.workType?.label || "",
      openType: fq.openItems.map(i=>i.label).join(", "),
      product: needInstall ? fq.installItems.map(i=>i.label).join(", ") : "",
      total, myEarnings: 0, discount: 0, materialCost: 0,
      note: fq.memo, cancelReason: "",
    };
    const saved = {
      ...record, ID: id,
      날짜:record.date, 시간:record.time,
      채널:record.channel, 상태:record.status,
      연락처:record.phone, 주소:record.address,
      작업유형:record.workType, 개문유형:record.openType, 제품명:record.product,
      총금액:record.total, 준형수령액:0, 현장메모:record.note
    };
    setLocalRecords(p=>[...p,saved]);
    if(SCRIPT_URL!=="여기에_URL_붙여넣기") {
      // 시트 저장 후 결과 확인 (JSONP라 응답 받음)
      api.save(record).then(res => {
        if (res && res.error) {
          showToast("⚠️ 시트 저장 실패: " + res.error, "error");
        } else if (res && res.duplicate) {
          // 이미 있는 ID라 무시됨 (정상)
        }
        // 즉시 reload + 3초 후 한 번 더 (캐시/지연 대비)
        loadRecords();
        setTimeout(() => loadRecords(), 3000);
      }).catch(() => {
        showToast("⚠️ 시트 저장 실패. 다시 시도해주세요", "error");
      });
    }
    setFq({channel:null,phone:"",address:"",workType:null,openItems:[],installItems:[],surcharges:[],memo:"",reserveDate:"",reserveTime:"",noTravel:false});
    setFqStep("form");
    setTab(isReserve?"pending":"calendar");
    if(!isReserve) setSelectedDate(todayStr());
    setTimeout(() => setSaving(false), 2000); // 2초 후 락 해제
  };

  // 견적 카드 미리보기용 계산
  const fqNeedOpen    = fq.workType?.id==="open"    || fq.workType?.id==="both";
  const fqNeedInstall = fq.workType?.id==="install" || fq.workType?.id==="both";
  const isSoomgo      = fq.channel?.id==="soomgo";
  const fqTravelFee   = fq.noTravel ? 0 : (isSoomgo ? TRAVEL_FEE_SOOMGO : TRAVEL_FEE);
  const fqOpenTotal   = fq.openItems.reduce((a,i)=>a+(isSoomgo ? soomgoOpen(i.actual) : i.actual)*i.qty, 0);
  const fqInstallPrice= fqNeedInstall ? fq.installItems.reduce((a,i)=>{
    if(i.id==="etc") return a + (i.etcPrice||0);
    const base = isSoomgo && i.base>0 ? soomgoPrice(i.base) : i.base;
    return a + base * i.qty;
  }, 0) : 0;
  const fqSurTotal    = fq.surcharges.reduce((a,s)=>a+s.amount, 0);
  const fqTotal       = fqTravelFee+(fqNeedOpen?fqOpenTotal:0)+fqInstallPrice+fqSurTotal;

  // ── 레코드 삭제 ──
  const deleteRecord = (id) => {
    setLocalRecords(p=>p.filter(r=>String(r.ID)!==String(id)));
    setRecords(p=>p.filter(r=>String(r.ID)!==String(id)));
    setAllTimeRecords(p=>p.filter(r=>String(r.ID)!==String(id)));
    if(SCRIPT_URL!=="여기에_URL_붙여넣기") {
      api.delete(id).catch(()=>{});
      setTimeout(() => loadRecords(), 1500);
    }
    showToast("🗑 삭제됐어요");
  };

  // ── 상태 변경 (Optimistic Update) ──
  const updateStatus = (id, status, extra={}) => {
    const fields = { 상태:status, ...extra };
    // 모든 캐시 즉시 업데이트
    setLocalRecords(p=>p.map(r=>String(r.ID)===String(id)?{...r,...fields}:r));
    setRecords(p=>p.map(r=>String(r.ID)===String(id)?{...r,...fields}:r));
    setAllTimeRecords(p=>p.map(r=>String(r.ID)===String(id)?{...r,...fields}:r));
    // 구글 시트 백그라운드 동기화
    if(SCRIPT_URL!=="여기에_URL_붙여넣기") {
      api.update(id, fields).catch(()=>{});
      setTimeout(() => loadRecords(), 1500);
    }
  };

  // ── 최종 견적서 불러오기 ──
  const loadToFinal = (record) => {
    setFnq({
      step:"form", recordId: record.ID,
      channel: {id:record.채널, label:record.채널==="office"?"사무실":"숨고"},
      phone: record.연락처||record.phone||"",
      address: record.주소||"",
      workType: WORK_TYPES.find(w=>w.label===record.작업유형)||null,
      openItems:[], products:[], reinforcements:[],
      remodeling:"", surcharges:[], fieldNote:"",
      filterType:"전체", finalAdj:0, payment:null, etcItems:[],
    });
    setTab("final");
  };

  // ── 최종 견적서 완료 저장 ──
  const saveFinalQuote = (total, myEarnings, discount, materialCost, note, breakdown={}) => {
    if(fnq.recordId) {
      const fields = {
        상태:"완료", 총금액:total, 준형수령액:myEarnings,
        할인금액:discount, 자재원가:materialCost, 현장메모:note,
        제품명: breakdown.설치제품||"",
        개문내역: breakdown.개문내역||"",
        개문금액: breakdown.개문금액||0,
        설치금액: breakdown.설치금액||0,
        기타항목: breakdown.기타항목||"",
        기타금액: breakdown.기타금액||0,
        개조금액: breakdown.개조금액||0,
        할증내역: breakdown.할증내역||"",
        할증금액: breakdown.할증금액||0,
        결제방법: breakdown.결제방법||"",
        출장비: breakdown.출장비 || (fnq.channel?.id==="soomgo" ? TRAVEL_FEE_SOOMGO : TRAVEL_FEE),
      };
      // localRecords + records 즉시 업데이트 (Optimistic UI)
      setLocalRecords(p=>p.map(r=>String(r.ID)===String(fnq.recordId)?{...r,...fields}:r));
      setRecords(p=>p.map(r=>String(r.ID)===String(fnq.recordId)?{...r,...fields}:r));
      setAllTimeRecords(p=>p.map(r=>String(r.ID)===String(fnq.recordId)?{...r,...fields}:r));
      
      if(SCRIPT_URL!=="여기에_URL_붙여넣기") {
        api.update(fnq.recordId, fields).catch(()=>{});
        // 시트 업데이트가 끝난 후 reload (no-cors 대응)
        setTimeout(() => loadRecords(), 1500);
      }
      
      // UX: 토스트 + 캘린더로 이동
      showToast("✅ 완료 처리됐어요!");
      setTab("calendar");
    }
  };

  // ════════════════════════════════════════
  // 렌더
  // ════════════════════════════════════════
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=DM+Mono:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        details > summary::-webkit-details-marker { display: none; }
        details > summary { list-style: none; }
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#f4f4f2;font-family:'Noto Sans KR',sans-serif;}
        .app{min-height:100vh;max-width:420px;margin:0 auto;padding-bottom:calc(100px + env(safe-area-inset-bottom, 0px));}
        .tab-bar{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:420px;background:#fff;border-top:1px solid #eee;display:flex;padding:8px 0 calc(20px + env(safe-area-inset-bottom, 0px));z-index:100;}
        .tab-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:6px 0;}
        .tab-icon{font-size:20px;}
        .tab-label{font-size:10px;font-weight:700;color:#ccc;}
        .tab-btn.active .tab-label{color:#111;}

        /* 공통 패널 */
        .panel{background:#fff;border-radius:18px;padding:18px;margin:0 12px 12px;box-shadow:0 2px 12px rgba(0,0,0,.06);}
        .ptitle{font-size:10px;font-weight:700;letter-spacing:2.5px;color:#bbb;text-transform:uppercase;margin-bottom:12px;}

        /* 버튼 공통 */
        .sel-btn{flex:1;padding:12px 8px;border-radius:12px;border:1.5px solid #ebebeb;background:#fff;font-family:'Noto Sans KR',sans-serif;font-size:13px;font-weight:600;color:#444;cursor:pointer;transition:all .15s;display:flex;justify-content:space-between;align-items:center;}
        .sel-btn:hover{border-color:#ccc;}
        .sel-btn.on{border-color:#111;background:#111;color:#fff;}
        .sel-row{display:flex;gap:8px;}
        .sel-col{display:flex;flex-direction:column;gap:8px;}
        .sel-col .sel-btn{flex-direction:row;}
        .sub{font-size:11px;opacity:.55;}
        .sel-btn.on .sub{opacity:.6;}

        /* 채널 */
        .ch-btn{flex:1;padding:14px;border-radius:12px;border:1.5px solid #ebebeb;background:#fff;font-family:'Noto Sans KR',sans-serif;font-size:14px;font-weight:700;color:#555;cursor:pointer;transition:all .15s;text-align:center;}
        .ch-btn.office.on{border-color:#2563eb;background:#eff6ff;color:#1d4ed8;}
        .ch-btn.soomgo.on{border-color:#16a34a;background:#f0fdf4;color:#15803d;}

        /* 입력 */
        .input-field{width:100%;border:1.5px solid #ebebeb;border-radius:11px;padding:11px 13px;font-family:'Noto Sans KR',sans-serif;font-size:16px;color:#333;outline:none;transition:border-color .15s;}
        .input-field:focus{border-color:#111;}
        .input-field::placeholder{color:#ddd;}
        .input-gap{display:flex;flex-direction:column;gap:10px;}
        .memo-input{width:100%;border:1.5px solid #ebebeb;border-radius:11px;padding:11px 13px;font-family:'Noto Sans KR',sans-serif;font-size:16px;color:#333;resize:none;outline:none;min-height:64px;transition:border-color .15s;}
        .memo-input:focus{border-color:#111;}
        .memo-input::placeholder{color:#ddd;}

        /* 수량 */
        .qty-row{display:flex;align-items:center;gap:10px;margin-top:10px;}
        .qty-row label{font-size:12px;color:#aaa;font-weight:600;white-space:nowrap;}
        .qty-ctrl{display:flex;align-items:center;border:1.5px solid #e0e0e0;border-radius:9px;overflow:hidden;background:#fff;}
        .qty-btn{width:32px;height:32px;background:#fff;border:none;font-size:16px;cursor:pointer;color:#555;}
        .qty-num{width:32px;text-align:center;font-size:14px;font-weight:700;color:#111;}

        /* 생성 버튼 */
        .gen-btn{width:calc(100% - 32px);margin:0 16px;padding:16px;border-radius:14px;border:none;background:#111;color:#fff;font-family:'Noto Sans KR',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:opacity .15s;}
        .gen-btn:disabled{opacity:.25;cursor:not-allowed;}
        .gen-btn.save{background:linear-gradient(135deg,#2563eb,#1d4ed8);}
        .gen-btn.green{background:linear-gradient(135deg,#16a34a,#15803d);}

        /* 캘린더 헤더 */
        .cal-header{background:#111;padding:16px 16px 0;border-radius:0 0 20px 20px;margin-bottom:12px;}
        .cal-header-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
        .month-nav{display:flex;align-items:center;gap:10px;}
        .nav-btn{width:30px;height:30px;border-radius:50%;border:none;background:rgba(255,255,255,.1);color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
        .month-title{font-size:18px;font-weight:900;color:#fff;letter-spacing:-1px;}
        .month-year{font-size:11px;color:rgba(255,255,255,.4);margin-left:3px;}
        .month-stats{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;}
        .stat-chip{background:rgba(255,255,255,.08);border-radius:20px;padding:5px 10px;font-size:11px;color:rgba(255,255,255,.7);font-weight:600;}
        .stat-chip .val{color:#fff;font-weight:900;margin-left:3px;}
        .stat-chip.green .val{color:#4ade80;}

        /* 캘린더 그리드 */
        .cal-grid{padding:0 12px 14px;}
        .weekdays{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px;}
        .wd{text-align:center;font-size:11px;font-weight:700;color:rgba(255,255,255,.35);padding:4px 0;}
        .days{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;}
        .day-cell{
          min-height:62px;border-radius:8px;
          display:flex;flex-direction:column;
          align-items:center;justify-content:flex-start;
          padding-top:6px;
          cursor:pointer;transition:all .15s;
        }
        .day-cell.empty{background:transparent !important;cursor:default;pointer-events:none;}
        .day-cell:not(.empty):hover{background:rgba(255,255,255,.08);}
        .day-cell.has-rec{background:rgba(255,255,255,.06);}
        .day-cell.sel{background:#fff !important;}
        .day-num{font-size:13px;font-weight:600;color:rgba(255,255,255,.75);line-height:1;}
        .day-cell.sel .day-num{color:#111;}
        .day-cell.today .day-num{background:#e8c96a;color:#000;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;}
        .day-cell.today.sel .day-num{background:#111;color:#e8c96a;}
        .day-dot{display:flex;gap:2px;margin-top:2px;}
        .dot{width:3px;height:3px;border-radius:50%;}
        .dot.office{background:#60a5fa;}
        .dot.soomgo{background:#4ade80;}
        .dot.done{background:#4ade80;}
        .dot.wait{background:#fbbf24;}
        .dot.reserve{background:#7c3aed;}
        .dot.cancel{background:#f87171;}

        /* 작업 카드 */
        .rec-card{background:#fff;border-radius:16px;padding:16px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,.05);border-left:3px solid #ddd;}
        .rec-card.office{border-left-color:#60a5fa;}
        .rec-card.soomgo{border-left-color:#4ade80;}
        .rec-card.취소{border-left-color:#f87171;opacity:.6;}
        .rc-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
        .rc-time{font-size:12px;font-weight:700;color:#aaa;font-family:'DM Mono',monospace;}
        .rc-status{font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;}
        .rc-work{font-size:14px;font-weight:700;color:#111;margin-bottom:3px;}
        .rc-addr{font-size:12px;color:#aaa;margin-bottom:8px;}
        .rc-tag{display:inline-block;background:#f5f5f5;border-radius:6px;padding:3px 8px;font-size:11px;color:#666;font-weight:600;margin-right:4px;margin-bottom:4px;}
        .rc-note{font-size:12px;color:#888;line-height:1.6;padding-top:8px;border-top:1px solid #f0f0f0;margin-top:4px;}
        .rc-bottom{display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid #f5f5f5;margin-top:8px;}
        .rc-total{font-size:13px;font-weight:700;color:#111;}
        .rc-earn{font-size:12px;color:#16a34a;font-weight:700;}
        .rc-actions{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;}
        .rc-btn{padding:7px 12px;border-radius:8px;border:1.5px solid #eee;background:#fff;font-family:'Noto Sans KR',sans-serif;font-size:11px;font-weight:700;color:#555;cursor:pointer;}
        .rc-btn.blue{border-color:#2563eb;color:#2563eb;background:#eff6ff;}
        .rc-btn.green{border-color:#16a34a;color:#16a34a;background:#f0fdf4;}
        .rc-btn.red{border-color:#dc2626;color:#dc2626;background:#fef2f2;}

        /* 취소 모달 */
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;display:flex;align-items:flex-end;justify-content:center;}
        .modal{width:100%;max-width:420px;background:#fff;border-radius:20px 20px 0 0;padding:24px 20px 40px;}
        .modal h3{font-size:16px;font-weight:900;margin-bottom:16px;}
        .cancel-opts{display:flex;flex-direction:column;gap:8px;}
        .cancel-opt{padding:13px 16px;border-radius:12px;border:1.5px solid #eee;background:#fff;font-family:'Noto Sans KR',sans-serif;font-size:14px;font-weight:600;color:#444;cursor:pointer;text-align:left;}
        .cancel-opt:hover{border-color:#dc2626;color:#dc2626;background:#fef2f2;}

        /* 빈 상태 */
        .empty{text-align:center;padding:40px 20px;color:#bbb;font-size:13px;}

        /* 페이지 상단 타이틀 */
        .page-top{padding:24px 16px 8px;display:flex;align-items:center;justify-content:space-between;}
        .page-title{font-size:20px;font-weight:900;letter-spacing:-.5px;color:#111;}
        .page-sub{font-size:12px;color:#aaa;}

        /* 최초/최종 견적 카드 */
        .quote-card{background:#111;border-radius:20px;overflow:hidden;margin:0 16px;box-shadow:0 6px 24px rgba(0,0,0,.12);}
        .qcard-head{padding:22px 22px 18px;}
        .qcard-badge{display:inline-block;background:rgba(255,255,255,.1);color:rgba(255,255,255,.6);font-size:10px;font-weight:700;letter-spacing:2px;padding:4px 10px;border-radius:20px;margin-bottom:12px;}
        .qcard-title{color:#fff;font-size:18px;font-weight:900;letter-spacing:-.5px;margin-bottom:10px;}
        .qcard-info{font-size:12px;color:rgba(255,255,255,.5);}
        .qcard-body{background:#fff;padding:20px 22px;}
        .line-item{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #f5f5f5;}
        .line-item:last-child{border-bottom:none;}
        .line-label{font-size:13px;color:#555;}
        .line-price{font-size:13px;font-weight:700;color:#111;}
        .total-box{background:#f8f8f8;border-radius:14px;padding:16px 18px;margin-top:4px;display:flex;justify-content:space-between;align-items:center;}
        .total-label{font-size:12px;color:#aaa;font-weight:600;}
        .total-price{font-size:26px;font-weight:900;color:#111;letter-spacing:-1px;}
        .total-price span{font-size:14px;font-weight:600;}

        /* 정산박스 */
        .profit-box{background:#1a1a2e;border-radius:16px;padding:18px 20px;margin:0 16px 14px;box-shadow:0 4px 16px rgba(0,0,0,.15);}
        .profit-title{font-size:10px;font-weight:700;letter-spacing:2px;color:#555;margin-bottom:12px;}
        .profit-row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #2a2a3e;}
        .profit-row:last-child{border-bottom:none;padding-top:12px;}
        .profit-label{font-size:12px;color:#888;}
        .profit-val{font-size:13px;font-weight:700;color:#aaa;}
        .profit-row.main .profit-label{font-size:13px;color:#ccc;font-weight:700;}
        .profit-row.main .profit-val{font-size:22px;font-weight:900;color:#4ade80;letter-spacing:-.5px;}

        /* 필터 */
        .filter-row{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;}
        .filter-btn{padding:6px 12px;border-radius:20px;border:1.5px solid #ebebeb;background:#fff;font-family:'Noto Sans KR',sans-serif;font-size:12px;font-weight:600;color:#888;cursor:pointer;}
        .filter-btn.on{border-color:#111;background:#111;color:#fff;}
        .product-list{display:flex;flex-direction:column;gap:7px;max-height:220px;overflow-y:auto;}
        .product-item{display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-radius:11px;border:1.5px solid #ebebeb;cursor:pointer;transition:all .15s;}
        .product-item:hover{border-color:#ccc;}
        .product-item.on{border-color:#111;background:#111;}
        .pname{font-size:13px;font-weight:700;color:#222;}
        .product-item.on .pname{color:#fff;}
        .pbrand{font-size:11px;color:#aaa;}
        .product-item.on .pbrand{color:rgba(255,255,255,.5);}
        .pprice{font-size:14px;font-weight:900;color:#111;}
        .product-item.on .pprice{color:#fff;}

        .reinf-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
        .reinf-btn{padding:12px;border-radius:11px;border:1.5px solid #ebebeb;background:#fff;font-family:'Noto Sans KR',sans-serif;font-size:13px;font-weight:600;color:#555;cursor:pointer;text-align:center;}
        .reinf-btn.on{border-color:#111;background:#111;color:#fff;}
        .rprice{font-size:11px;opacity:.6;margin-top:2px;}
        .sur-btn{flex:1;padding:11px;border-radius:11px;border:1.5px solid #ebebeb;background:#fff;font-family:'Noto Sans KR',sans-serif;font-size:13px;font-weight:600;color:#666;cursor:pointer;text-align:center;}
        .sur-btn.on{border-color:#e8a020;background:#fff8ee;color:#b87000;}
        .price-input{flex:1;border:1.5px solid #e0e0e0;border-radius:9px;background:#fff;padding:8px 10px;font-family:'Noto Sans KR',sans-serif;font-size:13px;font-weight:700;color:#111;outline:none;text-align:right;}
        .price-input:focus{border-color:#111;}
        .open-detail{background:#f8f8f8;border-radius:11px;padding:12px 14px;margin-top:4px;}

        .url-notice{margin:16px;background:#fffbf0;border:1px solid #f5e4b0;border-radius:12px;padding:14px 16px;font-size:12px;color:#997700;line-height:1.7;}
        .url-notice strong{display:block;font-weight:900;margin-bottom:4px;}

        .acts{display:flex;gap:8px;margin:12px 16px 0;}
        .act{flex:1;padding:14px;border-radius:12px;border:1.5px solid #e0e0e0;background:#fff;font-family:'Noto Sans KR',sans-serif;font-size:13px;font-weight:700;color:#555;cursor:pointer;}
        .act.primary{background:#111;border-color:#111;color:#fff;}
      `}</style>

      <div className="app">

        {/* ══════════ 캘린더 탭 ══════════ */}
        {tab==="calendar" && <>
          {loading && (
            <div style={{
              padding:"10px 16px",background:"#fef3c7",borderBottom:"1px solid #fde68a",
              display:"flex",alignItems:"center",gap:10,fontSize:13,color:"#92400e",fontWeight:600
            }}>
              <span className="spinner" style={{
                display:"inline-block",width:14,height:14,border:"2px solid #fde68a",
                borderTopColor:"#92400e",borderRadius:"50%",animation:"spin 0.8s linear infinite"
              }}/>
              데이터 불러오는 중...
            </div>
          )}
          <div className="cal-header">
            <div className="cal-header-top">
              <div className="month-nav">
                <button className="nav-btn" onClick={()=>{if(month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1);setSelectedDate(null);}}>‹</button>
                <div><span className="month-title">{MONTHS[month]}</span><span className="month-year">{year}</span></div>
                <button className="nav-btn" onClick={()=>{if(month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1);setSelectedDate(null);}}>›</button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <button onClick={()=>loadRecords()} disabled={loading} style={{
                  padding:"10px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,.2)",
                  background:"rgba(255,255,255,.08)",color:"#fff",fontSize:18,cursor:"pointer",
                  opacity:loading?0.4:1,minWidth:44,minHeight:44
                }} title="시트에서 다시 불러오기">
                  <span style={{display:"inline-block",animation:loading?"spin 0.8s linear infinite":"none"}}>⟲</span>
                </button>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>이번달 수령</div>
                  <div style={{fontSize:18,fontWeight:900,color:"#4ade80",fontFamily:"'DM Mono',monospace"}}>{fmt(monthEarnings)}원</div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,.25)",marginTop:2,fontFamily:"'DM Mono',monospace"}}>{BUILD_VERSION} · {BUILD_DATE}</div>
                </div>
              </div>
            </div>
            <div className="month-stats">
              <div className="stat-chip">총매출<span className="val">{fmt(monthTotal)}원</span></div>
              <div className="stat-chip">완료<span className="val">{completed.length}건</span></div>
              <div className="stat-chip green">준형<span className="val">{fmt(monthEarnings)}원</span></div>
            </div>
            <div className="cal-grid">
              <div className="weekdays">{WEEKDAYS.map(w=><div key={w} className="wd">{w}</div>)}</div>
              <div className="days">
                {cells.map((d,i)=>{
                  if(!d) return <div key={i} style={{height:52}}/>;
                  const ds=dateStr(d);
                  const recs=ds?(byDate[ds]||[]):[];
                  const dayDone = recs.filter(r=>r.상태==="완료").length;
                  const dayReserve = recs.filter(r=>r.상태==="예약").length;
                  const dayEarnings = recs.filter(r=>r.상태==="완료").reduce((a,r)=>a+Number(r.준형수령액||0),0);
                  return (
                    <div key={i}
                      className={["day-cell",recs.length?"has-rec":"",selectedDate===ds?"sel":"",isToday(d)?"today":""].join(" ")}
                      onClick={()=>setSelectedDate(selectedDate===ds?null:ds)}>
                      <div className="day-num">{d}</div>
                      {recs.length>0&&<div className="day-dot">
                        {recs.slice(0,3).map((r,j)=>{const dc={"완료":"done","예약":"reserve","작업중":"wait","출동중":"office","취소":"cancel"}[r.상태]||(r.채널==="soomgo"?"soomgo":"office");return <div key={j} className={`dot ${dc}`}/>;})}
                      </div>}
                      {(dayDone>0||dayReserve>0||dayEarnings>0)&&(
                        <div style={{width:"100%",padding:"0 2px",marginTop:2}}>
                          {dayDone>0&&<div style={{color:"#4ade80",fontWeight:700,fontSize:8,textAlign:"center",lineHeight:1.3}}>완료{dayDone}</div>}
                          {dayReserve>0&&<div style={{color:"#a78bfa",fontWeight:700,fontSize:8,textAlign:"center",lineHeight:1.3}}>예약{dayReserve}</div>}
                          {dayEarnings>0&&<div style={{color:"#fbbf24",fontWeight:700,fontSize:7,textAlign:"center",lineHeight:1.3}}>{fmt(dayEarnings)}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 날짜 상세 */}
          {selectedDate && (
            <div style={{padding:"0 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontSize:16,fontWeight:900,color:"#111"}}>{Number(selectedDate.split("-")[2])}일 작업</div>
                <button style={{
                  padding:"6px 14px",borderRadius:20,border:"none",
                  background:"#111",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"
                }} onClick={()=>{
                  setAddForm({channel:"office",time:"",workType:"",openType:"",product:"",total:"",myEarnings:"",note:"",status:"완료"});
                  setShowAddRecord(true);
                }}>+ 작업 추가</button>
              </div>
              {selectedDayRecords.length===0
                ? <div className="empty">작업 기록이 없어요</div>
                : selectedDayRecords.map(r=>{
                  const sc = STATUS_CONFIG[r.상태]||STATUS_CONFIG["견적대기"];
                  return (
                    <div key={r.ID} className={`rec-card ${r.채널} ${r.상태==="취소"?"취소":""}`}
                      style={{cursor: r.상태==="완료"?"pointer":"default"}}
                      onClick={()=>{ if(r.상태==="완료") setViewRecord(r); }}>
                      <div className="rc-top">
                        <div className="rc-time">{r.시간}</div>
                        <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
                          <span style={{
                            fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20,
                            background: r.채널==="soomgo"?"#f0fdf4":"#eff6ff",
                            color: r.채널==="soomgo"?"#16a34a":"#2563eb"
                          }}>{r.채널==="soomgo"?"숨고":"사무실"}</span>
                          <div className="rc-status" style={{background:sc.bg,color:sc.color}}>{sc.emoji} {r.상태}</div>
                          {r.상태==="완료"&&(
                            <span style={{
                              fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20,
                              background: r.결제완료?"#f0fdf4":"#fef9c3",
                              color: r.결제완료?"#16a34a":"#92400e"
                            }}>{r.결제완료?"💳 결제완료":"⏳ 결제대기"}</span>
                          )}
                        </div>
                      </div>
                      <div className="rc-work">{r.작업유형}</div>
                      {r.연락처&&<div className="rc-addr">📞 {r.연락처}</div>}
                      {r.주소&&<div className="rc-addr">📍 {r.주소}</div>}
                      <div>
                        {r.개문유형&&<span className="rc-tag">🔑 {r.개문유형}</span>}
                        {r.제품명&&<span className="rc-tag">🔒 {r.제품명}</span>}
                        <span className="rc-tag">{r.채널==="office"?"사무실":"숨고"}</span>
                      </div>
                      {r.상태==="완료"&&(
                        <div className="rc-bottom">
                          <div className="rc-total">{fmt(Number(r.총금액||0))}원</div>
                          <div className="rc-earn">준형 +{fmt(Number(r.준형수령액||0))}원</div>
                        </div>
                      )}
                      {r.상태==="취소"&&Number(r.총금액||0)>0&&(
                        <div className="rc-bottom">
                          <div className="rc-total">출장비 {fmt(Number(r.총금액))}원</div>
                          <div className="rc-earn">준형 +{fmt(Number(r.준형수령액||0))}원</div>
                        </div>
                      )}
                      {r.상태==="취소"&&r.취소사유&&(
                        <div style={{fontSize:11,color:"#aaa",marginTop:4}}>사유: {r.취소사유}</div>
                      )}
                      {/* 액션 버튼 */}
                      {r.상태!=="완료"&&(
                        <div className="rc-actions">
                          {r.상태==="예약"&&<>
                            <button className="rc-btn" style={{borderColor:"#7c3aed",color:"#7c3aed",background:"#f5f3ff"}} onClick={()=>{updateStatus(r.ID,"출동중");showToast("🚗 출동 시작!");}}>🚗 출동 시작</button>
                            <button className="rc-btn" onClick={()=>updateStatus(r.ID,"견적대기")}>↩</button>
                            <button className="rc-btn red" onClick={()=>setShowCancel({id:r.ID,status:"견적대기",channel:r.채널})}>취소</button>
                            <button className="rc-btn" style={{borderColor:"#ddd",color:"#aaa"}} onClick={(e)=>{e.stopPropagation();deleteRecord(r.ID);}}>🗑</button>
                          </>}
                          {r.상태==="견적대기"&&<>
                            <button className="rc-btn blue" onClick={()=>{updateStatus(r.ID,"출동중");showToast("🚗 출동 시작!");}}>🚗 출동 시작</button>
                            <button className="rc-btn" style={{borderColor:"#7c3aed",color:"#7c3aed",background:"#f5f3ff"}} onClick={()=>{setReserveForm({date:"",time:""});setShowReserve({id:r.ID});}}>📅 예약</button>
                            <button className="rc-btn red" onClick={()=>setShowCancel({id:r.ID,status:r.상태,channel:r.채널})}>취소</button>
                            <button className="rc-btn" style={{borderColor:"#ddd",color:"#aaa"}} onClick={()=>deleteRecord(r.ID)}>🗑</button>
                          </>}
                          {r.상태==="출동중"&&<>
                            <button className="rc-btn" style={{borderColor:"#d97706",color:"#d97706",background:"#fffbeb"}} onClick={()=>updateStatus(r.ID,"작업중")}>🔧 작업 시작</button>
                            <button className="rc-btn" onClick={()=>updateStatus(r.ID,"견적대기")}>↩</button>
                            <button className="rc-btn red" onClick={()=>setShowCancel({id:r.ID,status:r.상태,channel:r.채널})}>취소</button>
                          </>}
                          {r.상태==="작업중"&&<>
                            <button className="rc-btn green" onClick={()=>loadToFinal(r)}>✅ 최종 견적서</button>
                            <button className="rc-btn" onClick={()=>updateStatus(r.ID,"출동중")}>↩</button>
                          </>}
                          {r.상태==="취소"&&<>
                            <button className="rc-btn blue" onClick={()=>{
                              setAddForm({
                                channel: r.채널||"office", time: r.시간||"",
                                workType: r.작업유형||"", openType: r.개문유형||"",
                                product: r.제품명||"", address: r.주소||"",
                                total: r.총금액||"", myEarnings: r.준형수령액||"",
                                note: r.현장메모||"", status: "견적대기", editId: r.ID,
                              });
                              setShowAddRecord(true);
                            }}>✏️ 수정</button>
                            <button className="rc-btn" style={{borderColor:"#ddd",color:"#aaa"}} onClick={()=>deleteRecord(r.ID)}>🗑 삭제</button>
                          </>}
                        </div>
                      )}
                      {r.상태==="완료"&&(
                        <div className="rc-actions">
                          <button className="rc-btn" style={{borderColor:"#ddd",color:"#aaa",fontSize:11}} onClick={(e)=>{e.stopPropagation();deleteRecord(r.ID);}}>🗑 삭제</button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
          {!selectedDate&&<div className="empty" style={{paddingTop:24}}>날짜를 선택하면 작업 내역이 보여요</div>}
        </>}

        {/* ══════════ 자재 목록 탭 ══════════ */}
        {tab==="products" && (()=>{
          const allProds = allMaterials;
          const brands = ["전체", ...new Set(allProds.map(p=>p.brand))];
          const types  = ["전체", ...new Set(allProds.map(p=>p.type))];
          const filtered = allProds.filter(p=>
            (prodBrandFilter==="전체"||p.brand===prodBrandFilter) &&
            (prodTypeFilter==="전체"||p.type===prodTypeFilter)
          );
          return <>
          {materialsLoading && (
            <div style={{
              padding:"10px 16px",background:"#fef3c7",borderBottom:"1px solid #fde68a",
              display:"flex",alignItems:"center",gap:10,fontSize:13,color:"#92400e",fontWeight:600
            }}>
              <span style={{
                display:"inline-block",width:14,height:14,border:"2px solid #fde68a",
                borderTopColor:"#92400e",borderRadius:"50%",animation:"spin 0.8s linear infinite"
              }}/>
              자재 불러오는 중...
            </div>
          )}
          <div className="page-top">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%"}}>
              <div>
                <div className="page-title">자재 목록</div>
                <div className="page-sub">{allProds.length}개 제품</div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button style={{padding:"8px 12px",borderRadius:20,border:"1px solid #ddd",background:"#fff",color:"#111",fontSize:14,cursor:"pointer",opacity:materialsLoading?0.5:1}}
                  disabled={materialsLoading}
                  onClick={async()=>{ await loadMaterials(); showToast("✅ 자재 목록 새로고침"); }}
                  title="시트에서 다시 불러오기">
                  <span style={{display:"inline-block",animation:materialsLoading?"spin 0.8s linear infinite":"none"}}>⟲</span>
                </button>
                <button style={{padding:"8px 16px",borderRadius:20,border:"none",background:"#111",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}
                  onClick={()=>{setProductForm({name:"",brand:"",type:"",price:"",cost:"",desc:"",note:"",grade:"",feature:"",shape:"",series:"",warranty:"",boxImg:"",installImg:""});setShowAddProduct(true);}}>
                  + 추가
                </button>
              </div>
            </div>
          </div>

          {/* 사무실/숨고 + 브랜드 필터 */}
          <div style={{padding:"0 16px 8px"}}>
            {/* 가격 모드 토글 */}
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              {[{id:"office",label:"🏢 사무실"},{id:"soomgo",label:"📱 숨고"}].map(m=>(
                <button key={m.id} onClick={()=>setProdPriceMode(m.id)} style={{
                  flex:1,padding:"8px",borderRadius:10,border:"1.5px solid",
                  borderColor:prodPriceMode===m.id?(m.id==="soomgo"?"#16a34a":"#111"):"#eee",
                  background:prodPriceMode===m.id?(m.id==="soomgo"?"#f0fdf4":"#111"):"#fff",
                  color:prodPriceMode===m.id?(m.id==="soomgo"?"#16a34a":"#fff"):"#888",
                  fontFamily:"'Noto Sans KR',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"
                }}>{m.label}</button>
              ))}
            </div>
            {/* 브랜드 필터 */}
            <div style={{display:"flex",gap:7,overflowX:"auto",flexWrap:"nowrap",paddingBottom:4}}>
              {brands.map(b=>(
                <button key={b} onClick={()=>setProdBrandFilter(b)} style={{
                  padding:"6px 14px",borderRadius:20,border:"1.5px solid",whiteSpace:"nowrap",
                  borderColor:prodBrandFilter===b?"#111":"#eee",
                  background:prodBrandFilter===b?"#111":"#fff",
                  color:prodBrandFilter===b?"#fff":"#555",
                  fontFamily:"'Noto Sans KR',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"
                }}>{b}</button>
              ))}
            </div>
          </div>

          {/* 종류 필터 */}
          <div style={{padding:"0 16px 12px",overflowX:"auto"}}>
            <div style={{display:"flex",gap:7,flexWrap:"nowrap"}}>
              {types.map(t=>(
                <button key={t} onClick={()=>setProdTypeFilter(t)} style={{
                  padding:"5px 12px",borderRadius:20,border:"1.5px solid",whiteSpace:"nowrap",
                  borderColor:prodTypeFilter===t?"#2563eb":"#eee",
                  background:prodTypeFilter===t?"#eff6ff":"#fff",
                  color:prodTypeFilter===t?"#2563eb":"#888",
                  fontFamily:"'Noto Sans KR',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"
                }}>{t}</button>
              ))}
            </div>
          </div>

          {/* 제품 목록 */}
          <div style={{padding:"0 16px"}}>
            {filtered.length===0
              ? <div className="empty">해당 제품이 없어요</div>
              : filtered.map(p=>{
                const displayPrice = prodPriceMode==="soomgo" ? soomgoPrice(p.price||0) : (p.price||0);
                return (
                  <div key={p.id||p.name}
                    onClick={()=>setSelectedProd(p)}
                    style={{
                      background:"#fff",borderRadius:14,padding:"14px 16px",
                      marginBottom:8,boxShadow:"0 2px 8px rgba(0,0,0,.05)",
                      display:"flex",justifyContent:"space-between",alignItems:"center",
                      cursor:"pointer"
                    }}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                        <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20,background:"#f0f0f0",color:"#888"}}>{p.brand}</span>
                        <span style={{fontSize:10,color:"#aaa"}}>{p.type}</span>
                      </div>
                      <div style={{fontSize:15,fontWeight:900,color:"#111"}}>{p.name}</div>
                      {p.note&&<div style={{fontSize:11,color:"#aaa",marginTop:2}}>{p.note}</div>}
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:16,fontWeight:900,color: prodPriceMode==="soomgo"?"#16a34a":"#111"}}>{fmt(displayPrice)}원</div>
                      {prodPriceMode==="soomgo"&&<div style={{fontSize:10,color:"#ccc",textDecoration:"line-through"}}>{fmt(p.price||0)}원</div>}
                    </div>
                  </div>
                );
              })
            }
          </div>

          {/* 제품 상세 팝업 */}
          {selectedProd&&(()=>{
            const isDoorlock = ["주키","보조키","푸쉬풀","푸시풀","강화유리"].includes(selectedProd.type);
            return (
            <div className="modal-bg" onClick={()=>setSelectedProd(null)}>
              <div className="modal" style={{maxHeight:"90vh",overflowY:"auto",padding:0}} onClick={e=>e.stopPropagation()}>
                
                {isDoorlock ? (
                  /* ── 도어락 캡처용 카드 ── */
                  <>
                    <div id="capture-card" style={{
                      background:"#fff",padding:"24px 20px",
                      fontFamily:"'Noto Sans KR',sans-serif"
                    }}>
                      {/* 헤더 - 제품명 / 브랜드 */}
                      <div style={{textAlign:"center",marginBottom:18,paddingBottom:14,borderBottom:"2px solid #111"}}>
                        <div style={{fontSize:11,letterSpacing:3,color:"#888",fontWeight:700,marginBottom:4}}>{selectedProd.brand}</div>
                        <div style={{fontSize:24,fontWeight:900,color:"#111",letterSpacing:-0.5}}>{selectedProd.name}</div>
                        <div style={{fontSize:12,color:"#666",marginTop:4}}>{selectedProd.type}</div>
                      </div>

                      {/* 사진 영역 */}
                      <div style={{display:"flex",gap:8,marginBottom:18}}>
                        <div style={{flex:1,aspectRatio:"1",background:"#f5f5f5",borderRadius:12,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          {selectedProd.boxImg ? (
                            <img src={selectedProd.boxImg} alt="제품" style={{width:"100%",height:"100%",objectFit:"cover"}}
                              onError={e=>{ e.target.style.display="none"; e.target.parentNode.innerHTML='<div style="text-align:center;color:#bbb"><div style="font-size:28px;margin-bottom:4px">📦</div><div style="font-size:10px">사진 없음</div></div>'; }}/>
                          ) : (
                            <div style={{textAlign:"center",color:"#bbb"}}>
                              <div style={{fontSize:28,marginBottom:4}}>📦</div>
                              <div style={{fontSize:10}}>제품 사진</div>
                            </div>
                          )}
                        </div>
                        <div style={{flex:1,aspectRatio:"1",background:"#f5f5f5",borderRadius:12,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          {selectedProd.installImg ? (
                            <img src={selectedProd.installImg} alt="장착" style={{width:"100%",height:"100%",objectFit:"cover"}}
                              onError={e=>{ e.target.style.display="none"; e.target.parentNode.innerHTML='<div style="text-align:center;color:#bbb"><div style="font-size:28px;margin-bottom:4px">🔧</div><div style="font-size:10px">사진 없음</div></div>'; }}/>
                          ) : (
                            <div style={{textAlign:"center",color:"#bbb"}}>
                              <div style={{fontSize:28,marginBottom:4}}>🔧</div>
                              <div style={{fontSize:10}}>장착 사진</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 가격 - 강조 (자재 탭에서 선택한 모드 적용) */}
                      <div style={{
                        background:"#111",borderRadius:12,padding:"16px 18px",marginBottom:16,
                        display:"flex",justifyContent:"space-between",alignItems:"center"
                      }}>
                        <div>
                          <div style={{fontSize:11,color:"rgba(255,255,255,.6)",letterSpacing:2,fontWeight:700}}>가 격</div>
                          <div style={{fontSize:9,color:"rgba(255,255,255,.4)",marginTop:2}}>{prodPriceMode==="soomgo"?"📱 숨고":"🏢 사무실"}</div>
                        </div>
                        <span style={{fontSize:22,fontWeight:900,color:"#fff",fontFamily:"'DM Mono',monospace"}}>
                          {fmt(prodPriceMode==="soomgo" ? soomgoPrice(selectedProd.price||0) : (selectedProd.price||0))}원
                        </span>
                      </div>

                      {/* 스펙 정보 */}
                      <div style={{display:"flex",flexDirection:"column",gap:0}}>
                        {[
                          {label:"보안등급", value:selectedProd.grade},
                          {label:"특징/기능", value:selectedProd.feature},
                          {label:"형태", value:selectedProd.shape},
                          {label:"시리즈연동", value:selectedProd.series},
                          {label:"보증", value:selectedProd.warranty},
                          {label:"비고", value:selectedProd.note},
                        ].filter(s=>s.value).map((s,i)=>(
                          <div key={i} style={{display:"flex",padding:"10px 0",borderBottom:"1px solid #f0f0f0",fontSize:13}}>
                            <span style={{flex:"0 0 90px",color:"#888",fontWeight:600}}>{s.label}</span>
                            <span style={{flex:1,color:"#111",fontWeight:500}}>{s.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 액션 버튼 영역 (캡처 영역 밖) */}
                    <div style={{padding:"0 20px 20px"}}>
                      {/* 🔒 내부 정보 (원가/차익) - 캡처 시 안 보임 */}
                      <details style={{background:"#fafafa",borderRadius:10,padding:"10px 12px",marginTop:12,marginBottom:12,fontSize:12}}>
                        <summary style={{cursor:"pointer",textAlign:"center",fontSize:18,listStyle:"none",userSelect:"none"}}>🔒</summary>
                        <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:6,color:"#666"}}>
                          <div style={{display:"flex",justifyContent:"space-between"}}>
                            <span>원가</span>
                            <span style={{fontWeight:700,color:"#111"}}>{fmt(selectedProd.cost||0)}원</span>
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between"}}>
                            <span>소매가 (사무실)</span>
                            <span style={{fontWeight:700,color:"#111"}}>{fmt(selectedProd.price||0)}원</span>
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between"}}>
                            <span>숨고가 (70%)</span>
                            <span style={{fontWeight:700,color:"#16a34a"}}>{fmt(soomgoPrice(selectedProd.price||0))}원</span>
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between"}}>
                            <span>사무실 차익</span>
                            <span style={{fontWeight:700,color:"#2563eb"}}>{fmt((selectedProd.price||0)-(selectedProd.cost||0))}원</span>
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between"}}>
                            <span>숨고 차익</span>
                            <span style={{fontWeight:700,color:"#16a34a"}}>{fmt(soomgoPrice(selectedProd.price||0)-(selectedProd.cost||0))}원</span>
                          </div>
                        </div>
                      </details>
                      
                      {productList.find(x=>x.id===selectedProd.id) && (
                        <div style={{display:"flex",gap:8}}>
                          <button style={{
                            flex:1,padding:"12px",borderRadius:12,border:"1px solid #ddd",
                            background:"#fff",color:"#111",fontFamily:"'Noto Sans KR',sans-serif",
                            fontSize:13,fontWeight:700,cursor:"pointer"
                          }} onClick={()=>{
                            setProductForm({
                              brand: selectedProd.brand||"", name: selectedProd.name||"",
                              type: selectedProd.type||"", price: selectedProd.price||"",
                              cost: selectedProd.cost||"", note: selectedProd.note||"",
                              desc: selectedProd.desc||"",
                              grade: selectedProd.grade||"", feature: selectedProd.feature||"",
                              shape: selectedProd.shape||"", series: selectedProd.series||"",
                              warranty: selectedProd.warranty||"",
                              boxImg: selectedProd.boxImg||"", installImg: selectedProd.installImg||"",
                            });
                            setEditProduct(selectedProd);
                            setSelectedProd(null);
                          }}>✏️ 수정</button>
                          <button style={{
                            flex:1,padding:"12px",borderRadius:12,border:"1px solid #fee2e2",
                            background:"#fff",color:"#dc2626",fontFamily:"'Noto Sans KR',sans-serif",
                            fontSize:13,fontWeight:700,cursor:"pointer"
                          }} onClick={()=>{
                            if (!confirm(`"${selectedProd.name}" 삭제할까요?`)) return;
                            const id = selectedProd.id;
                            setProductListPersist(l=>l.filter(x=>x.id!==id));
                            if (SCRIPT_URL!=="여기에_URL_붙여넣기") { api.deleteMaterial(id).catch(()=>{}); setTimeout(()=>loadMaterials(), 1500); }
                            setSelectedProd(null);
                            showToast("🗑 삭제됐어요");
                          }}>🗑 삭제</button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* ── 부자재 (기존 간단 팝업) ── */
                  <div style={{padding:24}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                      <div>
                        <div style={{fontSize:11,color:"#aaa",marginBottom:4}}>{selectedProd.brand} · {selectedProd.type}</div>
                        <div style={{fontSize:20,fontWeight:900,color:"#111"}}>{selectedProd.name}</div>
                        {selectedProd.note&&<div style={{fontSize:12,color:"#888",marginTop:4}}>{selectedProd.note}</div>}
                      </div>
                      <button style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#aaa"}} onClick={()=>setSelectedProd(null)}>✕</button>
                    </div>

                    <div style={{display:"flex",flexDirection:"column",gap:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #f5f5f5"}}>
                        <span style={{fontSize:13,color:"#888"}}>원가</span>
                        <span style={{fontSize:14,fontWeight:700,color:"#111"}}>{fmt(selectedProd.cost||0)}원</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #f5f5f5"}}>
                        <span style={{fontSize:13,color:"#888"}}>소매가 (사무실)</span>
                        <span style={{fontSize:14,fontWeight:700,color:"#111"}}>{fmt(selectedProd.price||0)}원</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #f5f5f5"}}>
                        <span style={{fontSize:13,color:"#888"}}>숨고가 (70%)</span>
                        <span style={{fontSize:14,fontWeight:700,color:"#16a34a"}}>{fmt(soomgoPrice(selectedProd.price||0))}원</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #f5f5f5"}}>
                        <span style={{fontSize:13,color:"#888"}}>사무실 차익</span>
                        <span style={{fontSize:14,fontWeight:700,color:"#2563eb"}}>{fmt((selectedProd.price||0)-(selectedProd.cost||0))}원</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0"}}>
                        <span style={{fontSize:13,color:"#888"}}>숨고 차익</span>
                        <span style={{fontSize:14,fontWeight:700,color:"#16a34a"}}>{fmt(soomgoPrice(selectedProd.price||0)-(selectedProd.cost||0))}원</span>
                      </div>
                    </div>

                    {productList.find(x=>x.id===selectedProd.id)&&(
                      <div style={{display:"flex",gap:8,marginTop:16}}>
                        <button style={{
                          flex:1,padding:"12px",borderRadius:12,border:"1px solid #ddd",
                          background:"#fff",color:"#111",fontFamily:"'Noto Sans KR',sans-serif",
                          fontSize:13,fontWeight:700,cursor:"pointer"
                        }} onClick={()=>{
                          setProductForm({
                            brand: selectedProd.brand||"", name: selectedProd.name||"",
                            type: selectedProd.type||"", price: selectedProd.price||"",
                            cost: selectedProd.cost||"", note: selectedProd.note||"",
                            desc: selectedProd.desc||"",
                            grade: selectedProd.grade||"", feature: selectedProd.feature||"",
                            shape: selectedProd.shape||"", series: selectedProd.series||"",
                            warranty: selectedProd.warranty||"",
                            boxImg: selectedProd.boxImg||"", installImg: selectedProd.installImg||"",
                          });
                          setEditProduct(selectedProd);
                          setSelectedProd(null);
                        }}>✏️ 수정</button>
                        <button style={{
                          flex:1,padding:"12px",borderRadius:12,border:"1px solid #fee2e2",
                          background:"#fff",color:"#dc2626",fontFamily:"'Noto Sans KR',sans-serif",
                          fontSize:13,fontWeight:700,cursor:"pointer"
                        }} onClick={()=>{
                          if (!confirm(`"${selectedProd.name}" 삭제할까요?`)) return;
                          const id = selectedProd.id;
                          setProductListPersist(l=>l.filter(x=>x.id!==id));
                          if (SCRIPT_URL!=="여기에_URL_붙여넣기") { api.deleteMaterial(id).catch(()=>{}); setTimeout(()=>loadMaterials(), 1500); }
                          setSelectedProd(null);
                          showToast("🗑 삭제됐어요");
                        }}>🗑 삭제</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            );
          })()}

          {/* 자재 추가/수정 모달 */}
          {(showAddProduct || editProduct) && (
            <div className="modal-bg" onClick={()=>{ setShowAddProduct(false); setEditProduct(null); setProductForm({name:"",brand:"",type:"",price:"",cost:"",desc:"",note:"",grade:"",feature:"",shape:"",series:"",warranty:"",boxImg:"",installImg:""}); }}>
              <div className="modal" style={{maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
                <h3 style={{marginBottom:16}}>{editProduct ? "✏️ 자재 수정" : "📦 자재 추가"}</h3>
                {[
                  {key:"brand",label:"브랜드",    placeholder:"예) 락프로"},
                  {key:"name", label:"제품명",    placeholder:"예) H60N"},
                  {key:"type", label:"종류",      placeholder:"예) 보조키"},
                  {key:"price",label:"소매가",    placeholder:"0", type:"number"},
                  {key:"cost", label:"원가(비공개)", placeholder:"0", type:"number"},
                  {key:"note", label:"비고",      placeholder:"예) 목문형, 1way 등"},
                  {key:"grade",label:"보안등급",   placeholder:"예) 1등급, 2등급"},
                  {key:"feature",label:"특징/기능", placeholder:"예) 지문인식, 카드+비번"},
                  {key:"shape",label:"형태",      placeholder:"예) 사각형, 원형"},
                  {key:"series",label:"시리즈연동", placeholder:"예) 가능 / 불가"},
                  {key:"warranty",label:"보증",   placeholder:"예) 1년 무상"},
                  {key:"boxImg",label:"📦 박스사진 URL", placeholder:"https://..."},
                  {key:"installImg",label:"🔧 장착사진 URL", placeholder:"https://..."},
                  {key:"desc", label:"메모",      placeholder:"기타 설명"},
                ].map(f=>(
                  <div key={f.key} style={{marginBottom:14}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:2,marginBottom:6}}>{f.label}</div>
                    <input className="input-field" placeholder={f.placeholder}
                      value={productForm[f.key]||""}
                      onChange={e=>setProductForm(p=>({...p,[f.key]:e.target.value}))}
                      type={f.type||"text"} />
                  </div>
                ))}
                <button style={{
                  width:"100%",padding:"14px",borderRadius:12,border:"none",
                  background:"#111",color:"#fff",fontFamily:"'Noto Sans KR',sans-serif",
                  fontSize:14,fontWeight:700,cursor:"pointer"
                }} onClick={()=>{
                  if(!productForm.name||!productForm.brand) return showToast("브랜드와 제품명을 입력하세요","error");
                  const isEdit = !!editProduct;
                  const id = isEdit ? editProduct.id : ("m_" + Date.now());
                  const newP = {
                    id,
                    brand:productForm.brand, name:productForm.name,
                    type:productForm.type||"기타",
                    price:Number(productForm.price)||0,
                    cost:Number(productForm.cost)||0,
                    note:productForm.note||"", desc:productForm.desc||"",
                    grade:      productForm.grade||"",
                    feature:    productForm.feature||"",
                    shape:      productForm.shape||"",
                    series:     productForm.series||"",
                    warranty:   productForm.warranty||"",
                    boxImg:     productForm.boxImg||"",
                    installImg: productForm.installImg||"",
                    fromSheet: true,
                  };
                  if (isEdit) {
                    setProductListPersist(l => l.map(x => x.id===id ? newP : x));
                    if (SCRIPT_URL!=="여기에_URL_붙여넣기") {
                      api.updateMaterial(id, newP).catch(()=>{});
                      setTimeout(() => loadMaterials(), 1500);
                    }
                  } else {
                    setProductListPersist(l => [...l, newP]);
                    if (SCRIPT_URL!=="여기에_URL_붙여넣기") {
                      api.saveMaterial(newP).catch(()=>{});
                      setTimeout(() => loadMaterials(), 1500);
                    }
                  }
                  setShowAddProduct(false);
                  setEditProduct(null);
                  setProductForm({name:"",brand:"",type:"",price:"",cost:"",desc:"",note:"",grade:"",feature:"",shape:"",series:"",warranty:"",boxImg:"",installImg:""});
                  showToast(isEdit ? "✅ 자재 수정됐어요!" : "✅ 자재 추가됐어요!");
                }}>{editProduct ? "수정" : "추가"}</button>
              </div>
            </div>
          )}
        </>})()}

        {/* ══════════ 대기목록 탭 ══════════ */}
        {tab==="pending" && <>
          <div className="page-top">
            <div className="page-title">대기 목록</div>
            <div className="page-sub">진행 중인 모든 건</div>
          </div>
          <div style={{padding:"0 16px"}}>
            {(()=>{
              // 대기/예약/출동중/작업중은 모든 월에서 가져옴
              const sourceRecs = SCRIPT_URL==="여기에_URL_붙여넣기" ? [] : (allTimeRecords.length>0 ? allTimeRecords : records);
              const allIds = new Set(sourceRecs.map(r=>String(r.ID)));
              const allRecs = [...sourceRecs, ...localRecords.filter(r=>!allIds.has(String(r.ID)))];
              const pending = allRecs
                .filter(r=>["견적대기","예약","출동중","작업중"].includes(r.상태))
                .sort((a,b)=>{
                  const ao = STATUS_CONFIG[a.상태]?.order??9;
                  const bo = STATUS_CONFIG[b.상태]?.order??9;
                  if(ao!==bo) return ao-bo;
                  return (a.날짜+a.시간).localeCompare(b.날짜+b.시간);
                });
              if(pending.length===0) return <div className="empty">대기 중인 건이 없어요 🎉</div>;
              return pending.map(r=>{
                const sc = STATUS_CONFIG[r.상태]||STATUS_CONFIG["견적대기"];
                const isToday = r.날짜===todayStr();
                return (
                  <div key={r.ID} className={`rec-card ${r.채널}`} style={{marginBottom:10}}>
                    <div className="rc-top">
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <div style={{
                          fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:20,
                          background: isToday?"#111":"#f0f0f0",
                          color: isToday?"#fff":"#888"
                        }}>{isToday?"오늘":r.날짜?.slice(5).replace("-","/")} {r.시간}</div>
                      </div>
                      <div className="rc-status" style={{background:sc.bg,color:sc.color}}>{sc.emoji} {r.상태}</div>
                    </div>
                    <div className="rc-work">{r.작업유형}</div>
                    {r.주소&&<div className="rc-addr">📍 {r.주소}</div>}
                    {r.연락처&&<div style={{fontSize:12,color:"#aaa",marginTop:2}}>📞 {r.연락처}</div>}
                    <div style={{marginTop:6}}>
                      {r.개문유형&&<span className="rc-tag">🔑 {r.개문유형}</span>}
                      {r.제품명&&<span className="rc-tag">🔒 {r.제품명}</span>}
                      <span className="rc-tag">{r.채널==="office"?"사무실":"숨고"}</span>
                    </div>
                    {r.현장메모&&<div className="rc-note">{r.현장메모}</div>}
                    <div className="rc-actions">
                      {r.상태==="예약"&&<>
                        <button className="rc-btn blue" onClick={()=>{updateStatus(r.ID,"출동중");showToast("🚗 출동 시작!");}}>🚗 출동 시작</button>
                        <button className="rc-btn" onClick={()=>updateStatus(r.ID,"견적대기")}>견적대기로</button>
                        <button className="rc-btn red" onClick={()=>setShowCancel({id:r.ID,status:"견적대기",channel:r.채널})}>취소</button>
                      </>}
                      {r.상태==="견적대기"&&<>
                        <button className="rc-btn blue" onClick={()=>{updateStatus(r.ID,"출동중");showToast("🚗 출동 시작!");}}>🚗 출동 시작</button>
                        <button className="rc-btn red" onClick={()=>setShowCancel({id:r.ID,status:r.상태,channel:r.채널})}>취소</button>
                      </>}
                      {r.상태==="출동중"&&<>
                        <button className="rc-btn" style={{borderColor:"#d97706",color:"#d97706",background:"#fffbeb"}} onClick={()=>updateStatus(r.ID,"작업중")}>🔧 작업 시작</button>
                        <button className="rc-btn" onClick={()=>updateStatus(r.ID,"견적대기")}>↩</button>
                        <button className="rc-btn red" onClick={()=>setShowCancel({id:r.ID,status:r.상태,channel:r.채널})}>취소</button>
                      </>}
                      {r.상태==="작업중"&&<>
                        <button className="rc-btn green" onClick={()=>{loadToFinal(r);setTab("final");}}>✅ 최종 견적서</button>
                        <button className="rc-btn" onClick={()=>updateStatus(r.ID,"출동중")}>↩</button>
                      </>}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </>}

        {/* ══════════ 검색 탭 ══════════ */}
        {tab==="search" && <>
          <div className="page-top">
            <div className="page-title">작업 검색</div>
            <div className="page-sub">전화번호 · 주소 · 제품</div>
          </div>

          {/* 검색창 */}
          <div style={{padding:"0 16px 16px"}}>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16}}>🔍</span>
              <input
                className="input-field"
                style={{paddingLeft:40,fontSize:15}}
                placeholder="전화번호, 주소, 제품명으로 검색"
                value={searchQuery}
                onChange={e=>setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery&&(
                <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:16,cursor:"pointer",color:"#aaa"}}
                  onClick={()=>setSearchQuery("")}>✕</span>
              )}
            </div>
          </div>

          {/* 검색 결과 */}
          <div style={{padding:"0 16px"}}>
            {searchQuery.trim()===""
              ? <div className="empty">검색어를 입력하세요</div>
              : (() => {
                  const q = searchQuery.toLowerCase();
                  const allSheetIds = new Set(allTimeRecords.map(r=>String(r.ID)));
                  const allRecs = [
                    ...allTimeRecords,
                    ...localRecords.filter(r=>!allSheetIds.has(String(r.ID)))
                  ];
                  const results = allRecs.filter(r =>
                    (r.주소||"").toLowerCase().includes(q) ||
                    (r.연락처||"").replace(/-/g,"").includes(q.replace(/-/g,"")) ||
                    (r.연락처||"").includes(q) ||
                    (r.제품명||"").toLowerCase().includes(q) ||
                    (r.개문유형||"").toLowerCase().includes(q) ||
                    (r.현장메모||"").toLowerCase().includes(q) ||
                    (r.날짜||"").includes(q)
                  ).sort((a,b)=>String(b.날짜||"").localeCompare(String(a.날짜||"")));

                  if(results.length===0) return <div className="empty">검색 결과가 없어요</div>;

                  return results.map(r=>{
                    const sc = STATUS_CONFIG[r.상태]||STATUS_CONFIG["견적대기"];
                    return (
                      <div key={r.ID} className={`rec-card ${r.채널}`} style={{marginBottom:10}}>
                        <div className="rc-top">
                          <div style={{display:"flex",gap:6,alignItems:"center"}}>
                            <div className="rc-time" style={{color:"#555",fontWeight:700}}>{r.날짜}</div>
                            <div className="rc-time">{r.시간}</div>
                          </div>
                          <div className="rc-status" style={{background:sc.bg,color:sc.color,fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:20}}>{sc.emoji} {r.상태}</div>
                        </div>
                        <div className="rc-work">{r.작업유형}</div>
                        {r.주소&&<div className="rc-addr">📍 {r.주소}</div>}
                        <div style={{marginTop:4}}>
                          {r.개문유형&&<span className="rc-tag">🔑 {r.개문유형}</span>}
                          {r.제품명&&<span className="rc-tag">🔒 {r.제품명}</span>}
                          <span className="rc-tag">{r.채널==="office"?"사무실":"숨고"}</span>
                        </div>
                        {r.현장메모&&<div className="rc-note">{r.현장메모}</div>}
                        {r.상태==="완료"&&(
                          <div className="rc-bottom">
                            <div className="rc-total">{fmt(Number(r.총금액||0))}원</div>
                            <div className="rc-earn">준형 +{fmt(Number(r.준형수령액||0))}원</div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()
            }
          </div>
        </>}

        {/* ══════════ 최초 견적서 탭 ══════════ */}
        {tab==="first" && <>
          <div className="page-top">
            <div className="page-title">최초 견적서</div>
            <div className="page-sub">고객 혹할 견적 ㅋㅋ</div>
          </div>

          {SCRIPT_URL==="여기에_URL_붙여넣기"&&(
            <div className="url-notice"><strong>⚠️ 임시 저장 모드</strong>구글 시트 URL 설정 전까지 앱 종료 시 데이터가 사라져요.</div>
          )}

          {/* 채널 */}
          <div className="panel">
            <div className="ptitle">채널</div>
            <div className="sel-row">
              <button className={`ch-btn office ${fq.channel?.id==="office"?"on":""}`} onClick={()=>setFq(f=>({...f,channel:{id:"office",label:"사무실"}}))}>🏢 사무실</button>
              <button className={`ch-btn soomgo ${fq.channel?.id==="soomgo"?"on":""}`} onClick={()=>setFq(f=>({...f,channel:{id:"soomgo",label:"숨고"}}))}>📱 숨고</button>
            </div>
          </div>

          {/* 고객 정보 - 사무실만 표시 (숨고는 빠른 전송 우선) */}
          {fq.channel?.id==="office"&&(
            <div className="panel">
              <div className="ptitle">고객 정보</div>
              <div className="input-gap">
                <input className="input-field" placeholder="연락처 (010-0000-0000)"
                  value={fq.phone} onChange={e=>setFq(f=>({...f,phone:formatPhone(e.target.value)}))} />
                <input className="input-field" placeholder="주소"
                  value={fq.address} onChange={e=>setFq(f=>({...f,address:e.target.value}))} />
              </div>
            </div>
          )}

          {/* 작업 유형 */}
          <div className="panel">
            <div className="ptitle">작업 유형</div>
            <div className="sel-row">
              {WORK_TYPES.map(w=>(
                <button key={w.id} className={`sel-btn ${fq.workType?.id===w.id?"on":""}`}
                  onClick={()=>setFq(f=>({...f,workType:w,openItems:[],installItems:[]}))}>
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* 개문 */}
          {fq.workType&&(fq.workType.id==="open"||fq.workType.id==="both")&&(
            <div className="panel">
              <div className="ptitle">개문 유형 (중복 선택 가능)</div>
              <div className="sel-col">
                {OPEN_TYPES.map(t=>{
                    const displayPrice = fq.channel?.id==="soomgo" ? soomgoOpen(t.actual) : t.actual;
                    return (
                      <button key={t.id} className={`sel-btn ${fq.openItems.find(x=>x.id===t.id)?"on":""}`}
                        onClick={()=>setFq(f=>{
                          const exists=f.openItems.find(x=>x.id===t.id);
                          return {...f,openItems:exists?f.openItems.filter(x=>x.id!==t.id):[...f.openItems,{...t,qty:1}]};
                        })}>
                        <span>{t.label}</span>
                        <span className="sub">{fmt(displayPrice)}원~</span>
                      </button>
                    );
                  })}
              </div>
              {fq.openItems.map(item=>(
                <div key={item.id} className="open-detail" style={{marginTop:8}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#555",marginBottom:6}}>{item.label}</div>
                  <div className="qty-row">
                    <label>수량</label>
                    <div className="qty-ctrl">
                      <button className="qty-btn" onClick={()=>setFq(f=>({...f,openItems:f.openItems.map(x=>x.id===item.id?{...x,qty:Math.max(1,x.qty-1)}:x)}))}>−</button>
                      <div className="qty-num">{item.qty}</div>
                      <button className="qty-btn" onClick={()=>setFq(f=>({...f,openItems:f.openItems.map(x=>x.id===item.id?{...x,qty:x.qty+1}:x)}))}>＋</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 설치 */}
          {fq.workType&&(fq.workType.id==="install"||fq.workType.id==="both")&&(
            <div className="panel">
              <div className="ptitle">설치 유형 (중복 선택 가능)</div>
              <div className="sel-col">
                {INSTALL_TYPES.map(t=>{
                  const displayBase = fq.channel?.id==="soomgo" && t.base>0 ? soomgoPrice(t.base) : t.base;
                  return (
                    <button key={t.id} className={`sel-btn ${fq.installItems.find(x=>x.id===t.id)?"on":""}`}
                      onClick={()=>setFq(f=>{
                        const exists=f.installItems.find(x=>x.id===t.id);
                        return {...f,installItems:exists?f.installItems.filter(x=>x.id!==t.id):[...f.installItems,{...t,qty:1,displayBase}]};
                      })}>
                      <span>{t.label}</span>
                      <span className="sub">{t.base>0?fmt(displayBase)+"원~":"직접 입력"}</span>
                    </button>
                  );
                })}
              </div>
              {fq.installItems.map(item=>{
                const displayBase = fq.channel?.id==="soomgo" && item.base>0 ? soomgoPrice(item.base) : item.base;
                return (
                  <div key={item.id} className="open-detail" style={{marginTop:8}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#555",marginBottom:8}}>{item.label}</div>
                    {item.id==="etc" ? (
                      <div style={{display:"flex",flexDirection:"column",gap:10}}>
                        {/* 기타 항목 선택 */}
                        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                          {ETC_INSTALL_ITEMS.map(e=>{
                            const sel = (item.etcItems||[]).find(x=>x.id===e.id);
                            return (
                              <button key={e.id} style={{
                                padding:"7px 12px",borderRadius:10,border:"1.5px solid",
                                borderColor:sel?"#111":"#eee",
                                background:sel?"#111":"#fff",
                                color:sel?"#fff":"#555",
                                fontFamily:"'Noto Sans KR',sans-serif",fontSize:12,fontWeight:600,cursor:"pointer"
                              }} onClick={()=>{
                                const cur = item.etcItems||[];
                                const next = cur.find(x=>x.id===e.id) ? cur.filter(x=>x.id!==e.id) : [...cur,{...e}];
                                setFq(f=>({...f,installItems:f.installItems.map(x=>x.id==="etc"?{...x,etcItems:next}:x)}));
                              }}>{e.label}{e.price>0?` ${fmt(e.price)}원`:""}</button>
                            );
                          })}
                        </div>
                        {/* 직접 입력 */}
                        {(item.etcItems||[]).find(x=>x.id==="custom")&&(
                          <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:4}}>
                            <input className="input-field" placeholder="작업 내용 직접 입력"
                              value={item.customDesc||""}
                              onChange={e=>setFq(f=>({...f,installItems:f.installItems.map(x=>x.id==="etc"?{...x,customDesc:e.target.value}:x)}))} />
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <input className="input-field" placeholder="금액" type="number"
                                value={item.customPrice||""}
                                onChange={e=>setFq(f=>({...f,installItems:f.installItems.map(x=>x.id==="etc"?{...x,customPrice:Number(e.target.value)}:x)}))} />
                              <span style={{fontSize:12,color:"#aaa",whiteSpace:"nowrap"}}>원~</span>
                            </div>
                          </div>
                        )}
                        {/* 선택된 항목 합계 */}
                        {(item.etcItems||[]).filter(x=>x.id!=="custom").length>0&&(
                          <div style={{fontSize:12,color:"#888",fontWeight:600}}>
                            합계: {fmt((item.etcItems||[]).filter(x=>x.id!=="custom").reduce((a,x)=>a+x.price,0)+(item.customPrice||0))}원~
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="qty-row">
                        <label>수량</label>
                        <div className="qty-ctrl">
                          <button className="qty-btn" onClick={()=>setFq(f=>({...f,installItems:f.installItems.map(x=>x.id===item.id?{...x,qty:Math.max(1,x.qty-1)}:x)}))}>−</button>
                          <div className="qty-num">{item.qty}</div>
                          <button className="qty-btn" onClick={()=>setFq(f=>({...f,installItems:f.installItems.map(x=>x.id===item.id?{...x,qty:x.qty+1}:x)}))}>＋</button>
                        </div>
                        <span style={{fontSize:12,color:"#aaa"}}>{displayBase>0?fmt(displayBase*item.qty)+"원~":"-"}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 메모 */}
          {fq.workType&&(
            <div className="panel">
              <div className="ptitle">문의 내용</div>
              <textarea className="memo-input" placeholder="고객 문의 내용을 입력하세요"
                value={fq.memo} onChange={e=>setFq(f=>({...f,memo:e.target.value}))} />
            </div>
          )}

          {/* 출장비 / 할증 */}
          {fq.workType&&(
            <div className="panel">
              <div className="ptitle">출장비 / 할증</div>
              <div className="sel-col">
                <button style={{
                  display:"flex",justifyContent:"space-between",alignItems:"center",
                  padding:"11px 14px",borderRadius:12,border:"1.5px solid",cursor:"pointer",width:"100%",
                  borderColor:fq.noTravel?"#e74c3c":"#eee",
                  background:fq.noTravel?"#fef2f2":"#fff",
                  fontFamily:"'Noto Sans KR',sans-serif",
                }} onClick={()=>setFq(f=>({...f,noTravel:!f.noTravel}))}>
                  <span style={{fontSize:13,fontWeight:700,color:fq.noTravel?"#e74c3c":"#555"}}>출장비 제외</span>
                  <span style={{fontSize:12,color:fq.noTravel?"#e74c3c":"#aaa"}}>{fq.noTravel?"✓ 제외됨":`기본 ${fmt(isSoomgo?TRAVEL_FEE_SOOMGO:TRAVEL_FEE)}원`}</span>
                </button>
                {SURCHARGES.map(s=>(
                  <button key={s.id} className={`sel-btn ${fq.surcharges.find(x=>x.id===s.id)?"on":""}`}
                    onClick={()=>setFq(f=>{const e=f.surcharges.find(x=>x.id===s.id);return{...f,surcharges:e?f.surcharges.filter(x=>x.id!==s.id):[...f.surcharges,s]};})}>
                    <span>{s.label}</span><span className="sub">+{fmt(s.amount)}원</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 견적 카드 미리보기 버튼 */}
          <button className="gen-btn save"
            disabled={!fq.channel||!fq.workType||(fq.workType.id!=="install"&&fq.openItems.length===0)||(fq.workType.id!=="open"&&fq.installItems.length===0)}
            onClick={()=>setFqStep("card")}>
            견적 카드 보기 →
          </button>
        </>}

        {/* ══════════ 최초 견적서 카드 (모달) ══════════ */}
        {tab==="first" && fqStep==="card" && (
          <div style={{
            position:"fixed",top:0,left:0,right:0,bottom:0,
            background:"rgba(0,0,0,0.85)",zIndex:200,
            overflowY:"auto",padding:"20px 16px 40px",
          }}>
            {/* 캡처용 카드 */}
            <div id="fq-card-capture" style={{background:"#111",borderRadius:20,overflow:"hidden",marginBottom:16,boxShadow:"0 6px 24px rgba(0,0,0,.3)"}}>
              <div style={{padding:"22px 22px 18px"}}>
                <div style={{display:"inline-block",background:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.6)",fontSize:10,fontWeight:700,letterSpacing:2,padding:"4px 10px",borderRadius:20,marginBottom:12}}>방문 견적서 · ESTIMATE</div>
                <div style={{color:"#fff",fontSize:20,fontWeight:900,letterSpacing:"-.5px",marginBottom:8}}>도어락 · 열쇠 전문 출장</div>
                <div style={{color:"rgba(255,255,255,.4)",fontSize:12}}>빠른 출동 · 현장 즉시 처리</div>
              </div>
              <div style={{background:"#fff",padding:"20px 22px"}}>
                {/* 작업 태그 */}
                <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:16}}>
                  {fq.openItems.map(i=>(
                    <span key={i.id} style={{background:"#111",color:"#fff",padding:"6px 12px",borderRadius:20,fontSize:12,fontWeight:700}}>{i.label} 개문{i.qty>1?` ×${i.qty}`:""}</span>
                  ))}
                  {fqNeedInstall&&fq.installItems.map(i=>{
                    const base = i.id==="etc" ? (i.etcPrice||0) : (isSoomgo && i.base>0 ? soomgoPrice(i.base) : i.base);
                    const label = i.id==="etc" ? (i.etcDesc||"기타 작업") : `${i.label} 설치${i.qty>1?` ×${i.qty}`:""}`;
                    return (
                      <span key={i.id} style={{background:"#111",color:"#fff",padding:"6px 12px",borderRadius:20,fontSize:12,fontWeight:700}}>
                        {label}{base>0?` ${fmt(base)}원~`:""}
                      </span>
                    );
                  })}
                  {fq.surcharges.map(s=>(
                    <span key={s.id} style={{background:"#f5f5f5",color:"#555",padding:"6px 12px",borderRadius:20,fontSize:12,fontWeight:700}}>{s.label}</span>
                  ))}
                  <span style={{background:"#f5f5f5",color:"#555",padding:"6px 12px",borderRadius:20,fontSize:12,fontWeight:700}}>출장비 포함</span>
                </div>

                {/* 항목별 */}
                <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#888"}}><span>출장비</span><span style={{fontWeight:700}}>{fmt(fqTravelFee)}원</span></div>
                  {fqNeedOpen&&fq.openItems.map(i=>{
                    const price = isSoomgo ? soomgoOpen(i.actual) : i.actual;
                    return <div key={i.id} style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#888"}}><span>{i.label} 개문{i.qty>1?` ×${i.qty}`:""}</span><span style={{fontWeight:700}}>{fmt(price*i.qty)}원~</span></div>;
                  })}
                  {fqNeedInstall&&fq.installItems.map(i=>{
                    const base = i.id==="etc" ? (i.etcPrice||0) : (isSoomgo && i.base>0 ? soomgoPrice(i.base) : i.base);
                    const label = i.id==="etc" ? (i.etcDesc||"기타 작업") : `${i.label} 설치${i.qty>1?` ×${i.qty}`:""}`;
                    return (
                      <div key={i.id} style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#888"}}>
                        <span>{label}</span>
                        <span style={{fontWeight:700}}>{base>0?fmt(base*(i.id==="etc"?1:i.qty))+"원~":"-"}</span>
                      </div>
                    );
                  })}
                  {fq.surcharges.map(s=>(
                    <div key={s.id} style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#c47800"}}><span>{s.label}</span><span style={{fontWeight:700}}>+{fmt(s.amount)}원</span></div>
                  ))}
                </div>

                <div style={{height:1,background:"#eee",marginBottom:14}}/>

                {/* 총액 */}
                <div style={{background:"#f8f8f8",borderRadius:14,padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:12,color:"#aaa",fontWeight:600}}>예상 견적 금액</div>
                    <div style={{fontSize:11,color:"#ccc",marginTop:2}}>현장 상황에 따라 변동될 수 있습니다</div>
                  </div>
                  <div style={{fontSize:26,fontWeight:900,color:"#111",letterSpacing:"-1px"}}>{fmt(fqTotal)}<span style={{fontSize:14,fontWeight:600}}>원~</span></div>
                </div>

                {/* 안심 칩 */}
                <div style={{display:"flex",gap:7,flexWrap:"wrap",marginTop:14}}>
                  <span style={{background:"#f5f5f5",borderRadius:20,padding:"6px 11px",fontSize:11,fontWeight:600,color:"#777"}}>🔧 현장 즉시 처리</span>
                  <span style={{background:"#f5f5f5",borderRadius:20,padding:"6px 11px",fontSize:11,fontWeight:600,color:"#777"}}>📋 추가비 사전 고지</span>
                  <span style={{background:"#f5f5f5",borderRadius:20,padding:"6px 11px",fontSize:11,fontWeight:600,color:"#777"}}>✅ 작업 후 점검</span>
                </div>

                {/* 안내 */}
                <div style={{marginTop:14,background:"#fffbf0",border:"1px solid #f5e4b0",borderRadius:11,padding:"12px 14px",fontSize:12,color:"#997700",lineHeight:1.8}}>
                  📌 위 금액은 현장 방문 전 예상 금액입니다. 문/잠금장치 상태, 작업환경 등 현장 변수에 따라 금액이 달라질 수 있으며 변동 시 작업 전 먼저 안내드립니다. 😊
                </div>

                {fq.memo&&<div style={{marginTop:12,background:"#f8f8f8",borderRadius:11,padding:"12px 14px",fontSize:12,color:"#666",lineHeight:1.7}}>💬 {fq.memo}</div>}
              </div>
              <div style={{padding:"14px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #f0f0f0",background:"#fff"}}>
                <div style={{fontSize:11,color:"#ccc"}}>출장비 {fmt(fqTravelFee)}원 포함</div>
                <div style={{fontSize:11,color:"#ccc",fontWeight:700}}>{todayStr()}</div>
              </div>
            </div>

            {/* 버튼 */}
            <div style={{display:"flex",gap:8,marginTop:16}}>
              <button className="act" onClick={()=>setFqStep("form")}>← 수정</button>
              <button className="act" style={{flex:1,background:"#2563eb",borderColor:"#2563eb",color:"#fff"}}
                onClick={async()=>{
                  try {
                    const el = document.getElementById("fq-card-capture");
                    const html2canvas = (await import("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js")).default;
                    const canvas = await html2canvas(el, {scale:2, useCORS:true, backgroundColor:"#111"});
                    const link = document.createElement("a");
                    link.download = `견적서_${todayStr()}.png`;
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                    showToast("📸 이미지 저장됐어요!");
                  } catch(e) {
                    showToast("📸 화면 캡처 후 카톡으로 보내세요!", "error");
                  }
                }}>📸 이미지 저장</button>
              <button className="act primary" onClick={()=>{
                saveFirstQuote("견적대기");
                showToast("✅ 견적대기로 저장됐어요!");
              }}>저장</button>
            </div>
          </div>
        )}

        {/* 예약 설정 화면 제거됨 */}

        {/* ══════════ 최종 견적서 탭 ══════════ */}
        {tab==="final" && (
          <ErrorBoundary onReset={()=>setTab("calendar")}>
            <FinalQuoteView fnq={fnq} setFnq={setFnq} onSave={saveFinalQuote} onBack={()=>setTab("calendar")} showToast={showToast} allMaterials={allMaterials} />
          </ErrorBoundary>
        )}

        {/* 완료 카드 상세 모달 */}
        {viewRecord&&(
          <div className="modal-bg" onClick={()=>setViewRecord(null)}>
            <div className="modal" style={{maxHeight:"90vh",overflowY:"auto",padding:0,borderRadius:"20px 20px 0 0"}} onClick={e=>e.stopPropagation()}>
              {/* 견적 카드 */}
              <div style={{background:"#111",padding:"22px 22px 18px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{display:"inline-block",background:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.6)",fontSize:10,fontWeight:700,letterSpacing:2,padding:"4px 10px",borderRadius:20}}>최종 견적서 · FINAL</div>
                  <button style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",color:"#fff",borderRadius:20,padding:"4px 10px",fontSize:11,cursor:"pointer"}}
                    onClick={()=>setViewRecord(v=>({...v,_editingInfo: !v._editingInfo}))}>
                    {viewRecord._editingInfo ? "✓ 완료" : "✏️ 정보수정"}
                  </button>
                </div>
                <div style={{color:"#fff",fontSize:18,fontWeight:900,letterSpacing:"-.5px",marginBottom:8}}>도어락 · 열쇠 전문 출장</div>
                {viewRecord._editingInfo ? (
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    <input value={viewRecord.연락처||""} placeholder="연락처"
                      onChange={e=>setViewRecord(v=>({...v,연락처:formatPhone(e.target.value)}))}
                      style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:8,padding:"8px 10px",color:"#fff",fontSize:13,fontFamily:"'Noto Sans KR',sans-serif",outline:"none"}}/>
                    <input value={viewRecord.주소||""} placeholder="주소"
                      onChange={e=>setViewRecord(v=>({...v,주소:e.target.value}))}
                      style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:8,padding:"8px 10px",color:"#fff",fontSize:13,fontFamily:"'Noto Sans KR',sans-serif",outline:"none"}}/>
                    <button style={{background:"#16a34a",border:"none",color:"#fff",borderRadius:8,padding:"8px",fontSize:12,fontWeight:700,fontFamily:"'Noto Sans KR',sans-serif",cursor:"pointer",marginTop:4}}
                      onClick={()=>{
                        const id = viewRecord.ID;
                        const fields = { 연락처: viewRecord.연락처||"", 주소: viewRecord.주소||"" };
                        // 즉시 반영
                        setLocalRecords(p=>p.map(r=>String(r.ID)===String(id)?{...r,...fields}:r));
                        setRecords(p=>p.map(r=>String(r.ID)===String(id)?{...r,...fields}:r));
                        setAllTimeRecords(p=>p.map(r=>String(r.ID)===String(id)?{...r,...fields}:r));
                        // 시트 동기화
                        if(SCRIPT_URL!=="여기에_URL_붙여넣기") {
                          api.update(id, fields).then(res=>{
                            if(res && res.error) showToast("⚠️ 시트 저장 실패: "+res.error,"error");
                            else showToast("✅ 정보 저장됨");
                          }).catch(()=>showToast("⚠️ 시트 저장 실패","error"));
                        }
                        setViewRecord(v=>({...v,_editingInfo:false}));
                      }}>저장</button>
                  </div>
                ) : (
                  <>
                    {viewRecord.연락처&&<div style={{color:"rgba(255,255,255,.5)",fontSize:12,marginBottom:2}}>{viewRecord.연락처}</div>}
                    {viewRecord.주소&&<div style={{color:"rgba(255,255,255,.5)",fontSize:12}}>📍 {viewRecord.주소}</div>}
                  </>
                )}
              </div>

              <div style={{background:"#fff",padding:"20px 22px"}}>
                {/* 작업 내역 */}
                <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:"#bbb",textTransform:"uppercase",marginBottom:10}}>작업 내역</div>
                <div style={{display:"flex",flexDirection:"column"}}>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #f5f5f5"}}>
                    <span style={{fontSize:13,color:"#555"}}>출장비</span>
                    <span style={{fontSize:13,fontWeight:700}}>{fmt(Number(viewRecord.출장비 || (viewRecord.채널==="soomgo"?TRAVEL_FEE_SOOMGO:TRAVEL_FEE)))}원</span>
                  </div>
                  {viewRecord.개문내역&&Number(viewRecord.개문금액||0)>0&&(
                    <div style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #f5f5f5"}}>
                      <span style={{fontSize:13,fontWeight:700,color:"#111"}}>{viewRecord.개문내역}</span>
                      <span style={{fontSize:13,fontWeight:700}}>{fmt(Number(viewRecord.개문금액))}원</span>
                    </div>
                  )}
                  {viewRecord.제품명&&Number(viewRecord.설치금액||0)>0&&(
                    <div style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #f5f5f5"}}>
                      <span style={{fontSize:13,fontWeight:700,color:"#111"}}>{viewRecord.제품명} 설치</span>
                      <span style={{fontSize:13,fontWeight:700}}>{fmt(Number(viewRecord.설치금액))}원</span>
                    </div>
                  )}
                  {viewRecord.기타항목&&Number(viewRecord.기타금액||0)>0&&(
                    <div style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #f5f5f5"}}>
                      <span style={{fontSize:13,fontWeight:700,color:"#111"}}>{viewRecord.기타항목}</span>
                      <span style={{fontSize:13,fontWeight:700}}>{fmt(Number(viewRecord.기타금액))}원</span>
                    </div>
                  )}
                  {/* 자재 원가 내역 */}
                  {viewRecord.자재원가>0&&(
                    <div style={{background:"#f8f8f8",borderRadius:10,padding:"10px 12px",margin:"6px 0"}}>
                      <div style={{fontSize:11,color:"#aaa",fontWeight:700,letterSpacing:1,marginBottom:4}}>자재 원가</div>
                      <div style={{fontSize:12,color:"#666"}}>{viewRecord.자재내역||`${fmt(viewRecord.자재원가)}원`}</div>
                    </div>
                  )}
                  {viewRecord.보강자재&&Number(viewRecord.보강금액||0)>0&&(
                    <div style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #f5f5f5"}}>
                      <span style={{fontSize:13,color:"#555"}}>{viewRecord.보강자재}</span>
                      <span style={{fontSize:13,fontWeight:700}}>{fmt(Number(viewRecord.보강금액))}원</span>
                    </div>
                  )}
                  {Number(viewRecord.개조금액||0)>0&&(
                    <div style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #f5f5f5"}}>
                      <span style={{fontSize:13,color:"#555"}}>개조비</span>
                      <span style={{fontSize:13,fontWeight:700}}>{fmt(Number(viewRecord.개조금액))}원</span>
                    </div>
                  )}
                  {viewRecord.할증내역&&Number(viewRecord.할증금액||0)>0&&(
                    <div style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #f5f5f5"}}>
                      <span style={{fontSize:13,color:"#c47800"}}>{viewRecord.할증내역}</span>
                      <span style={{fontSize:13,fontWeight:700,color:"#c47800"}}>+{fmt(Number(viewRecord.할증금액))}원</span>
                    </div>
                  )}
                  {Number(viewRecord.할인금액||0)>0&&(
                    <div style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #f5f5f5"}}>
                      <span style={{fontSize:13,color:"#e74c3c"}}>할인</span>
                      <span style={{fontSize:13,fontWeight:700,color:"#e74c3c"}}>- {fmt(Number(viewRecord.할인금액))}원</span>
                    </div>
                  )}
                  {viewRecord.결제방법==="카드결제"&&Number(viewRecord.부가세||0)>0&&(
                    <div style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #f5f5f5"}}>
                      <span style={{fontSize:13,color:"#7c3aed",fontWeight:600}}>부가세 10% (카드)</span>
                      <span style={{fontSize:13,fontWeight:700,color:"#7c3aed"}}>+{fmt(Number(viewRecord.부가세))}원</span>
                    </div>
                  )}
                </div>

                {/* 총액 */}
                <div style={{background:"#f8f8f8",borderRadius:14,padding:"16px 18px",marginTop:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:12,color:"#aaa",fontWeight:600}}>최종 금액{viewRecord.결제방법==="카드결제"&&Number(viewRecord.부가세||0)>0?" (부가세 포함)":""}</div>
                  <div style={{fontSize:26,fontWeight:900,color:"#111",letterSpacing:"-1px"}}>
                    {fmt(Number(viewRecord.총금액||0)+(viewRecord.결제방법==="카드결제"?Number(viewRecord.부가세||0):0))}
                    <span style={{fontSize:14,fontWeight:600}}>원</span>
                  </div>
                </div>

                {/* 현장메모 */}
                {viewRecord.현장메모&&(
                  <div style={{marginTop:12,background:"#f8f8f8",borderRadius:11,padding:"12px 14px",fontSize:12,color:"#666",lineHeight:1.7}}>
                    📋 {viewRecord.현장메모}
                  </div>
                )}

                {/* 결제 방법 */}
                <div style={{marginTop:16}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:2,marginBottom:10}}>결제 방법</div>
                  <div style={{display:"flex",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                    {PAYMENT_METHODS.map(p=>(
                      <button key={p.id} style={{
                        padding:"8px 14px",borderRadius:10,border:"1.5px solid",
                        borderColor: viewRecord.결제방법===p.label?"#111":"#eee",
                        background: viewRecord.결제방법===p.label?"#111":"#fff",
                        color: viewRecord.결제방법===p.label?"#fff":"#555",
                        fontFamily:"'Noto Sans KR',sans-serif",fontSize:12,fontWeight:600,cursor:"pointer",
                      }} onClick={()=>{
                        const vat = p.label==="카드결제" ? Math.round(Number(viewRecord.총금액||0)*0.1) : 0;
                        const updated = {...viewRecord, 결제방법:p.label, 부가세:vat};
                        setViewRecord(updated);
                        updateStatus(viewRecord.ID,"완료",{결제방법:p.label, 부가세:vat});
                        if(vat>0) showToast(`카드결제 — 부가세 ${fmt(vat)}원 추가`);
                        else showToast(`${p.label} 선택됨`);
                      }}>{p.label}</button>
                    ))}
                  </div>
                  {viewRecord.결제방법==="카드결제"&&Number(viewRecord.부가세||0)>0&&(
                    <div style={{fontSize:12,color:"#e74c3c",fontWeight:600,marginBottom:10}}>
                      부가세 10% = +{fmt(Number(viewRecord.부가세))}원 (합계 {fmt(Number(viewRecord.총금액||0)+Number(viewRecord.부가세))})원
                    </div>
                  )}
                  <div style={{fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:2,marginBottom:8}}>영수증</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {RECEIPT_TYPES.map(r=>(
                      <button key={r.id} style={{
                        padding:"7px 12px",borderRadius:10,border:"1.5px solid",
                        borderColor: viewRecord.영수증===r.label?"#2563eb":"#eee",
                        background: viewRecord.영수증===r.label?"#eff6ff":"#fff",
                        color: viewRecord.영수증===r.label?"#2563eb":"#777",
                        fontFamily:"'Noto Sans KR',sans-serif",fontSize:11,fontWeight:600,cursor:"pointer",
                      }} onClick={()=>{
                        const newVal = viewRecord.영수증===r.label ? "" : r.label;
                        const updated = {...viewRecord, 영수증:newVal};
                        setViewRecord(updated);
                        updateStatus(viewRecord.ID,"완료",{영수증:newVal});
                        showToast(newVal ? `🧾 ${newVal}` : "영수증 선택 해제됨");
                      }}>🧾 {r.label}</button>
                    ))}
                  </div>

                  {/* 결제 완료 체크 */}
                  <div style={{marginTop:14,display:"flex",alignItems:"center",justifyContent:"space-between",background: viewRecord.결제완료?"#f0fdf4":"#fef9c3",borderRadius:12,padding:"12px 16px"}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color: viewRecord.결제완료?"#16a34a":"#92400e"}}>
                        {viewRecord.결제완료?"💳 결제 완료":"⏳ 결제 대기"}
                      </div>
                      {viewRecord.결제방법&&<div style={{fontSize:11,color:"#888",marginTop:2}}>{viewRecord.결제방법}{viewRecord.영수증?" · "+viewRecord.영수증:""}</div>}
                    </div>
                    <button style={{
                      padding:"8px 16px",borderRadius:20,border:"none",
                      background: viewRecord.결제완료?"#dc2626":"#16a34a",
                      color:"#fff",fontFamily:"'Noto Sans KR',sans-serif",
                      fontSize:12,fontWeight:700,cursor:"pointer"
                    }} onClick={()=>{
                      const updated = {...viewRecord, 결제완료: !viewRecord.결제완료};
                      setViewRecord(updated);
                      updateStatus(viewRecord.ID,"완료",{결제완료: !viewRecord.결제완료});
                      showToast(updated.결제완료?"💳 결제 완료 처리됐어요!":"결제 대기로 변경됐어요");
                    }}>{viewRecord.결제완료?"취소":"결제 완료"}</button>
                  </div>

                  {(viewRecord.결제방법||viewRecord.영수증)&&(
                    <div style={{marginTop:8,background:"#f8f8f8",borderRadius:10,padding:"10px 12px",fontSize:12,color:"#555"}}>
                      {viewRecord.결제방법&&<span style={{fontWeight:700}}>{viewRecord.결제방법}</span>}
                      {viewRecord.결제방법&&viewRecord.영수증&&" · "}
                      {viewRecord.영수증&&<span style={{color:"#2563eb",fontWeight:700}}>{viewRecord.영수증}</span>}
                    </div>
                  )}
                </div>

                {/* 사무실 정산 */}
                <div style={{marginTop:16,background:"#1a1a2e",borderRadius:14,padding:"16px 18px"}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:"#555",marginBottom:12}}>📊 사무실 정산 (비공개)</div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #2a2a3e"}}>
                    <span style={{fontSize:12,color:"#888"}}>총 청구액</span>
                    <span style={{fontSize:13,fontWeight:700,color:"#aaa"}}>{fmt(Number(viewRecord.총금액||0))}원</span>
                  </div>
                  {Number(viewRecord.자재원가||0)>0&&(
                    <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #2a2a3e"}}>
                      <span style={{fontSize:12,color:"#888"}}>자재 원가</span>
                      <span style={{fontSize:13,fontWeight:700,color:"#aaa"}}>- {fmt(Number(viewRecord.자재원가))}원</span>
                    </div>
                  )}
                  <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #2a2a3e"}}>
                    <span style={{fontSize:12,color:"#888"}}>순이익</span>
                    <span style={{fontSize:13,fontWeight:700,color:"#aaa"}}>{fmt(Number(viewRecord.총금액||0)-Number(viewRecord.자재원가||0))}원</span>
                  </div>
                  {viewRecord.채널==="office"&&(
                    <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #2a2a3e"}}>
                      <div>
                        <div style={{fontSize:12,color:"#888"}}>사무실 입금액</div>
                        <div style={{fontSize:10,color:"#555",marginTop:2}}>순이익 50% + 자재원가 {fmt(Number(viewRecord.자재원가||0))}원</div>
                      </div>
                      <span style={{fontSize:13,fontWeight:700,color:"#e74c3c"}}>- {fmt(Math.round((Number(viewRecord.총금액||0)-Number(viewRecord.자재원가||0))*0.5)+Number(viewRecord.자재원가||0))}원</span>
                    </div>
                  )}
                  <div style={{display:"flex",justifyContent:"space-between",paddingTop:12}}>
                    <span style={{fontSize:13,fontWeight:700,color:"#ccc"}}>준형 수령</span>
                    <span style={{fontSize:22,fontWeight:900,color:"#4ade80"}}>{fmt(Number(viewRecord.준형수령액||0))}원</span>
                  </div>
                </div>

                <button style={{
                  width:"100%",marginTop:16,padding:"14px",borderRadius:12,
                  border:"none",background:"#111",color:"#fff",
                  fontFamily:"'Noto Sans KR',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer"
                }} onClick={()=>setViewRecord(null)}>닫기</button>
              </div>
            </div>
          </div>
        )}

        {/* 예약 설정 모달 */}
        {showReserve&&(
          <div className="modal-bg" onClick={()=>setShowReserve(null)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <h3 style={{marginBottom:16}}>📅 방문 예약 설정</h3>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:2,marginBottom:8}}>방문 날짜</div>
                <input type="date" className="input-field"
                  value={reserveForm.date}
                  onChange={e=>setReserveForm(f=>({...f,date:e.target.value}))} />
              </div>
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:2,marginBottom:8}}>방문 시간</div>
                <input className="input-field" placeholder="예) 10:00"
                  value={reserveForm.time}
                  maxLength={5}
                  onChange={e=>{
                    let v=e.target.value.replace(/[^0-9]/g,"").slice(0,4);
                    if (v.length >= 3) {
                      let hh = v.slice(0,2), mm = v.slice(2,4);
                      if (Number(hh) > 23) hh = "23";
                      if (mm.length === 2 && Number(mm) > 59) mm = "59";
                      v = hh + ":" + mm;
                    }
                    setReserveForm(f=>({...f,time:v}));
                  }} />
              </div>
              {reserveForm.date&&(
                <div style={{background:"#f5f3ff",border:"1px solid #ddd6fe",borderRadius:10,padding:"12px 14px",marginBottom:16,fontSize:13,color:"#7c3aed",fontWeight:700}}>
                  📅 {reserveForm.date} {reserveForm.time||""} 방문 예정
                </div>
              )}
              <div style={{display:"flex",gap:8}}>
                <button className="cancel-opt" style={{flex:1,textAlign:"center",color:"#888"}}
                  onClick={()=>setShowReserve(null)}>취소</button>
                <button className="cancel-opt" style={{
                  flex:1,textAlign:"center",
                  background: reserveForm.date?"#7c3aed":"#ccc",
                  color:"#fff", borderColor: reserveForm.date?"#7c3aed":"#ccc",
                  cursor: reserveForm.date?"pointer":"not-allowed"
                }} onClick={()=>{
                  if(!reserveForm.date) return;
                  // 날짜 변경 + 예약 상태로
                  const fields = {
                    상태:"예약",
                    날짜: reserveForm.date,
                    시간: reserveForm.time||"00:00",
                  };
                  setLocalRecords(p=>p.map(r=>String(r.ID)===String(showReserve.id)?{...r,...fields}:r));
                  if(SCRIPT_URL!=="여기에_URL_붙여넣기") api.update(showReserve.id,fields).catch(()=>{});
                  setShowReserve(null);
                  showToast(`📅 ${reserveForm.date} ${reserveForm.time||""} 예약됐어요!`);
                }}>예약 확정</button>
              </div>
            </div>
          </div>
        )}

        {/* 취소 모달 */}
        {showCancel&&(
          <div className="modal-bg" onClick={()=>setShowCancel(null)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              {showCancel.status==="견적대기" ? (<>
                {/* 출동 전 취소 - 자유 입력 */}
                <h3 style={{marginBottom:12}}>취소 사유</h3>
                <textarea className="memo-input" placeholder="취소 사유를 입력하세요 (공란 가능)"
                  id="cancelReasonInput" style={{marginBottom:14}} />
                <button style={{
                  width:"100%",padding:"13px",borderRadius:12,border:"none",
                  background:"#111",color:"#fff",fontFamily:"'Noto Sans KR',sans-serif",
                  fontSize:14,fontWeight:700,cursor:"pointer"
                }} onClick={()=>{
                  const reason = document.getElementById("cancelReasonInput")?.value||"";
                  updateStatus(showCancel.id,"취소",{취소사유:reason,총금액:0,준형수령액:0});
                  setShowCancel(null);
                }}>취소 처리</button>
              </>) : (<>
                {/* 출동 후 취소 */}
                <h3 style={{marginBottom:8}}>취소 사유</h3>
                <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#16a34a",lineHeight:1.6}}>
                  ✅ 출동 후 취소 — <strong>출장비 {showCancel.channel==="soomgo"?"10,000":"30,000"}원 수익 확정</strong>
                </div>
                <div className="cancel-opts">
                  {[
                    {label:"고객 변심",           travel:true },
                    {label:"연락 두절",           travel:true },
                    {label:"출동 중 취소",         travel:true },
                    {label:"기타 (출장비 O)",      travel:true },
                    {label:"기타 (출장비 X)",      travel:false},
                    {label:"작업 불가 (기술 부족)", travel:false},
                  ].map(r=>{
                    const hasTravelFee = r.travel;
                    return (
                      <button key={r.label} className="cancel-opt" onClick={()=>{
                        const tFee = showCancel.channel==="soomgo" ? 10000 : 30000;
                        updateStatus(showCancel.id,"취소",{
                          취소사유:r.label,
                          총금액: hasTravelFee?tFee:0,
                          준형수령액: hasTravelFee?tFee:0,
                        });
                        setShowCancel(null);
                        if(hasTravelFee) showToast(`✅ 출장비 ${fmt(tFee)}원 수익 확정!`);
                        else showToast("출장비 미청구 처리됨","error");
                      }}>
                        <span>{r.label}</span>
                        <span style={{fontSize:10,fontWeight:700,marginLeft:6,padding:"2px 6px",borderRadius:10,
                          background:r.travel?"#f0fdf4":"#fef2f2",color:r.travel?"#16a34a":"#dc2626"
                        }}>{r.travel?"출장비 O":"출장비 X"}</span>
                      </button>
                    );
                  })}
                </div>
              </>)}
            </div>
          </div>
        )}

        {showAddRecord&&(()=>{
          const af = addForm;
          const isSoomgo = af.channel==="soomgo";
          const needOpen = af.workType==="개문"||af.workType==="개문+설치";
          const needInstall = af.workType==="단순설치"||af.workType==="개문+설치";
          const travelFee = af.noTravel ? 0 : (isSoomgo ? TRAVEL_FEE_SOOMGO : TRAVEL_FEE);
          const openTotal = (af.openItems||[]).reduce((a,i)=>{
            const base = i.customPrice != null && i.customPrice !== "" ? Number(i.customPrice) : (isSoomgo?soomgoOpen(i.actual):i.actual);
            return a + base * (i.qty||1);
          },0);
          const prodTotal = (af.products||[]).reduce((a,p)=>{
            const base = p.customPrice != null && p.customPrice !== "" ? Number(p.customPrice) : (isSoomgo?soomgoPrice(p.price):p.price);
            return a + base * (p.qty||1);
          },0);
          const subTotal  = travelFee+(needOpen?openTotal:0)+(needInstall?prodTotal:0);
          const costTotal = (af.products||[]).reduce((a,p)=>a+p.cost*(p.qty||1),0);
          const myE       = isSoomgo ? subTotal-costTotal : Math.round((subTotal-costTotal)*0.5);
          const filteredP = (af.productFilter||"전체")==="전체" ? allMaterials : allMaterials.filter(p=>p.type===af.productFilter);
          const fmtTime = v => {
            const d = v.replace(/\D/g,"").slice(0,4);
            if (d.length < 3) return d;
            let hh = d.slice(0,2), mm = d.slice(2);
            // 시간 검증: 24를 넘으면 23으로, 분이 59를 넘으면 59로
            if (Number(hh) > 23) hh = "23";
            if (mm.length === 2 && Number(mm) > 59) mm = "59";
            return hh + ":" + mm;
          };

          return (
          <div className="modal-bg" onClick={()=>setShowAddRecord(false)}>
            <div style={{position:"fixed",top:"3%",left:"50%",transform:"translateX(-50%)",width:"93%",maxWidth:480,maxHeight:"92vh",overflowY:"auto",background:"#f5f5f7",borderRadius:20,zIndex:400}} onClick={e=>e.stopPropagation()}>

              <div style={{background:"#111",padding:"16px 20px 14px",borderRadius:"20px 20px 0 0",position:"sticky",top:0,zIndex:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,.5)",fontWeight:700,letterSpacing:2,marginBottom:4}}>작업 추가 · {selectedDate}</div>
                    <div style={{fontSize:16,fontWeight:900,color:"#fff"}}>직접 기록</div>
                  </div>
                  <button style={{background:"rgba(255,255,255,.15)",border:"none",color:"#fff",borderRadius:20,padding:"6px 14px",fontFamily:"'Noto Sans KR',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}} onClick={()=>setShowAddRecord(false)}>✕ 닫기</button>
                </div>
              </div>

              <div className="panel" style={{marginTop:10}}>
                <div className="ptitle">채널</div>
                <div style={{display:"flex",gap:8}}>
                  {[{id:"office",label:"🏢 사무실"},{id:"soomgo",label:"📱 숨고"}].map(ch=>(
                    <button key={ch.id} style={{flex:1,padding:"11px",borderRadius:12,border:"1.5px solid",borderColor:af.channel===ch.id?(ch.id==="soomgo"?"#16a34a":"#111"):"#eee",background:af.channel===ch.id?(ch.id==="soomgo"?"#f0fdf4":"#111"):"#fff",color:af.channel===ch.id?(ch.id==="soomgo"?"#16a34a":"#fff"):"#aaa",fontFamily:"'Noto Sans KR',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer"}} onClick={()=>setAddForm(f=>({...f,channel:ch.id}))}>{ch.label}</button>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="ptitle">상태</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {["완료","견적대기","출동중","예약","취소"].map(s=>{const sc=STATUS_CONFIG[s]||STATUS_CONFIG["견적대기"];return <button key={s} style={{padding:"7px 12px",borderRadius:20,border:"1.5px solid",borderColor:af.status===s?sc.color:"#eee",background:af.status===s?sc.bg:"#fff",color:af.status===s?sc.color:"#aaa",fontFamily:"'Noto Sans KR',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}} onClick={()=>setAddForm(f=>({...f,status:s}))}>{sc.emoji} {s}</button>;})}
                </div>
              </div>

              <div className="panel">
                <div className="ptitle">작업 유형</div>
                <div style={{display:"flex",gap:8,marginBottom:needOpen||needInstall?14:0}}>
                  {WORK_TYPES.map(w=>(<button key={w.id} style={{flex:1,padding:"10px",borderRadius:12,border:"1.5px solid",borderColor:af.workType===w.label?"#111":"#eee",background:af.workType===w.label?"#111":"#fff",color:af.workType===w.label?"#fff":"#555",fontFamily:"'Noto Sans KR',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}} onClick={()=>setAddForm(f=>({...f,workType:w.label,openItems:[],products:[]}))}>{w.label}</button>))}
                </div>
                {needOpen&&<div style={{marginTop:8}}>
                  <div style={{fontSize:11,color:"#aaa",fontWeight:700,letterSpacing:2,marginBottom:8}}>개문 유형 (중복 선택)</div>
                  {OPEN_TYPES.map(t=>{
                    const sel=(af.openItems||[]).find(x=>x.id===t.id);
                    const defaultPrice = isSoomgo?soomgoOpen(t.actual):t.actual;
                    const currentPrice = sel ? (sel.customPrice != null && sel.customPrice !== "" ? Number(sel.customPrice) : defaultPrice) : defaultPrice;
                    return(
                    <div key={t.id}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:10,marginBottom:6,cursor:"pointer",border:"1.5px solid",borderColor:sel?"#111":"#eee",background:sel?"#111":"#fff"}} onClick={()=>setAddForm(f=>{const cur=f.openItems||[];return{...f,openItems:cur.find(x=>x.id===t.id)?cur.filter(x=>x.id!==t.id):[...cur,{...t,qty:1,customPrice:""}]};})}>
                        <span style={{fontSize:13,fontWeight:700,color:sel?"#fff":"#111"}}>{t.label}</span>
                        <span style={{fontSize:12,color:sel?"rgba(255,255,255,.6)":"#aaa"}}>{fmt(defaultPrice)}원~</span>
                      </div>
                      {sel&&(
                        <div style={{paddingLeft:4,marginBottom:8}}>
                          <div className="qty-row">
                            <label style={{fontSize:12,color:"#888"}}>수량</label>
                            <div className="qty-ctrl">
                              <button className="qty-btn" onClick={()=>setAddForm(f=>({...f,openItems:f.openItems.map(x=>x.id===t.id?{...x,qty:Math.max(1,x.qty-1)}:x)}))}>−</button>
                              <div className="qty-num">{sel.qty}</div>
                              <button className="qty-btn" onClick={()=>setAddForm(f=>({...f,openItems:f.openItems.map(x=>x.id===t.id?{...x,qty:x.qty+1}:x)}))}>＋</button>
                            </div>
                            <span style={{fontSize:12,color:"#aaa"}}>{fmt(currentPrice*sel.qty)}원</span>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}>
                            <label style={{fontSize:11,color:"#888",minWidth:48}}>개당가</label>
                            <input type="number" placeholder={String(defaultPrice)}
                              value={sel.customPrice||""}
                              onChange={e=>setAddForm(f=>({...f,openItems:f.openItems.map(x=>x.id===t.id?{...x,customPrice:e.target.value}:x)}))}
                              style={{flex:1,padding:"6px 10px",borderRadius:8,border:"1px solid #ddd",fontSize:13,fontFamily:"'Noto Sans KR',sans-serif",outline:"none"}} />
                            <span style={{fontSize:11,color:"#aaa"}}>원</span>
                          </div>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>}
                {needInstall&&<div style={{marginTop:needOpen?14:0}}>
                  <div style={{fontSize:11,color:"#aaa",fontWeight:700,letterSpacing:2,marginBottom:8}}>제품 선택 (중복 가능)</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{["전체","보조키","주키","푸쉬풀","강화유리","기타"].map(t=>(<button key={t} style={{padding:"5px 12px",borderRadius:20,border:"1.5px solid",borderColor:(af.productFilter||"전체")===t?"#2563eb":"#eee",background:(af.productFilter||"전체")===t?"#eff6ff":"#fff",color:(af.productFilter||"전체")===t?"#2563eb":"#888",fontFamily:"'Noto Sans KR',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}} onClick={()=>setAddForm(f=>({...f,productFilter:t}))}>{t}</button>))}</div>
                  <div style={{maxHeight:180,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>{filteredP.map(p=>{
                    const defaultPrice=isSoomgo?soomgoPrice(p.price):p.price;
                    const sel=(af.products||[]).find(x=>x.id===p.id);
                    const currentPrice = sel ? (sel.customPrice != null && sel.customPrice !== "" ? Number(sel.customPrice) : defaultPrice) : defaultPrice;
                    return(
                    <div key={p.id}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:10,cursor:"pointer",border:"1.5px solid",borderColor:sel?"#111":"#eee",background:sel?"#111":"#fff"}} onClick={()=>setAddForm(f=>{const cur=f.products||[];return{...f,products:cur.find(x=>x.id===p.id)?cur.filter(x=>x.id!==p.id):[...cur,{...p,qty:1,customPrice:""}]};})}>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:sel?"#fff":"#111"}}>{p.brand} {p.name}</div>
                          <div style={{fontSize:11,color:sel?"rgba(255,255,255,.5)":"#aaa"}}>{p.type}</div>
                        </div>
                        <span style={{fontSize:13,fontWeight:700,color:sel?"#fff":"#111"}}>{fmt(defaultPrice)}원</span>
                      </div>
                      {sel&&(
                        <div style={{paddingLeft:4,marginTop:4,marginBottom:6}}>
                          <div className="qty-row">
                            <label style={{fontSize:12,color:"#888"}}>수량</label>
                            <div className="qty-ctrl">
                              <button className="qty-btn" onClick={()=>setAddForm(f=>({...f,products:f.products.map(x=>x.id===p.id?{...x,qty:Math.max(1,(x.qty||1)-1)}:x)}))}>−</button>
                              <div className="qty-num">{sel.qty||1}</div>
                              <button className="qty-btn" onClick={()=>setAddForm(f=>({...f,products:f.products.map(x=>x.id===p.id?{...x,qty:(x.qty||1)+1}:x)}))}>＋</button>
                            </div>
                            <span style={{fontSize:12,color:"#aaa"}}>{fmt(currentPrice*(sel.qty||1))}원</span>
                            <button style={{marginLeft:"auto",background:"#fee2e2",border:"none",borderRadius:20,padding:"3px 10px",fontSize:11,color:"#dc2626",fontWeight:700,cursor:"pointer"}} onClick={()=>setAddForm(f=>({...f,products:f.products.filter(x=>x.id!==p.id)}))}>✕</button>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}>
                            <label style={{fontSize:11,color:"#888",minWidth:48}}>개당가</label>
                            <input type="number" placeholder={String(defaultPrice)}
                              value={sel.customPrice||""}
                              onChange={e=>setAddForm(f=>({...f,products:f.products.map(x=>x.id===p.id?{...x,customPrice:e.target.value}:x)}))}
                              style={{flex:1,padding:"6px 10px",borderRadius:8,border:"1px solid #ddd",fontSize:13,fontFamily:"'Noto Sans KR',sans-serif",outline:"none"}} />
                            <span style={{fontSize:11,color:"#aaa"}}>원</span>
                          </div>
                        </div>
                      )}
                    </div>
                    );
                  })}</div>
                </div>}
              </div>

              <div className="panel">
                <div className="ptitle">고객 정보</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {/* 출장비 토글 */}
                  <button style={{
                    display:"flex",justifyContent:"space-between",alignItems:"center",
                    padding:"11px 14px",borderRadius:12,border:"1.5px solid",cursor:"pointer",
                    borderColor:af.noTravel?"#e74c3c":"#eee",
                    background:af.noTravel?"#fef2f2":"#fff",
                    fontFamily:"'Noto Sans KR',sans-serif",
                  }} onClick={()=>setAddForm(f=>({...f,noTravel:!f.noTravel}))}>
                    <span style={{fontSize:13,fontWeight:700,color:af.noTravel?"#e74c3c":"#555"}}>출장비 제외</span>
                    <span style={{fontSize:12,color:af.noTravel?"#e74c3c":"#aaa"}}>{af.noTravel?"✓ 제외됨":`기본 ${fmt(isSoomgo?TRAVEL_FEE_SOOMGO:TRAVEL_FEE)}원`}</span>
                  </button>
                  <input className="input-field" placeholder="시간 (예: 1430 → 14:30)" value={af.time} onChange={e=>setAddForm(f=>({...f,time:fmtTime(e.target.value)}))} />
                  <input className="input-field" placeholder="연락처 (01012345678 → 자동 - 삽입)" value={af.phone||""} onChange={e=>setAddForm(f=>({...f,phone:formatPhone(e.target.value)}))} />
                  <input className="input-field" placeholder="주소" value={af.address||""} onChange={e=>setAddForm(f=>({...f,address:e.target.value}))} />
                </div>
              </div>

              {af.workType&&<div className="panel">
                <div className="ptitle">금액 정산 (자동)</div>
                <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#888"}}><span>출장비</span><span style={{fontWeight:700}}>{fmt(travelFee)}원</span></div>
                  {needOpen&&(af.openItems||[]).map(i=>{
                    const price = i.customPrice != null && i.customPrice !== "" ? Number(i.customPrice) : (isSoomgo?soomgoOpen(i.actual):i.actual);
                    return (<div key={i.id} style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#888"}}><span>{i.label}{i.qty>1?` ×${i.qty}`:""}</span><span style={{fontWeight:700}}>{fmt(price*i.qty)}원</span></div>);
                  })}
                  {needInstall&&(af.products||[]).map(p=>{
                    const price = p.customPrice != null && p.customPrice !== "" ? Number(p.customPrice) : (isSoomgo?soomgoPrice(p.price):p.price);
                    return (<div key={p.id} style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#888"}}><span>{p.brand} {p.name}{(p.qty||1)>1?` ×${p.qty||1}`:""}</span><span style={{fontWeight:700}}>{fmt(price*(p.qty||1))}원</span></div>);
                  })}
                  <div style={{height:1,background:"#eee",margin:"4px 0"}}/>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:900,color:"#111"}}><span>합계</span><span>{fmt(subTotal)}원</span></div>
                </div>
                <div style={{background:"#f0fdf4",borderRadius:12,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div><div style={{fontSize:12,color:"#16a34a",fontWeight:700}}>준형 수령 예상</div><div style={{fontSize:11,color:"#aaa",marginTop:2}}>{isSoomgo?"숨고 100%":"사무실 50%"}</div></div>
                  <div style={{fontSize:20,fontWeight:900,color:"#16a34a"}}>{fmt(myE)}원</div>
                </div>
                
                {/* 실제 받은 금액 직접 입력 (자동 계산 덮어쓰기) */}
                <div style={{background:"#fef9c3",border:"1px solid #fde68a",borderRadius:12,padding:"12px 14px",marginBottom:12}}>
                  <div style={{fontSize:11,color:"#92400e",fontWeight:700,letterSpacing:1,marginBottom:8}}>💰 실제 금액 (수동 입력 — 비워두면 자동 계산값 사용)</div>
                  <div style={{display:"flex",gap:8}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10,color:"#92400e",marginBottom:4}}>실제 청구액</div>
                      <input className="input-field" type="number" placeholder={String(subTotal)}
                        value={af.customTotal||""}
                        onChange={e=>setAddForm(f=>({...f,customTotal:e.target.value}))} />
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10,color:"#92400e",marginBottom:4}}>실제 수령액</div>
                      <input className="input-field" type="number" placeholder={String(myE)}
                        value={af.customMyE||""}
                        onChange={e=>setAddForm(f=>({...f,customMyE:e.target.value}))} />
                    </div>
                  </div>
                </div>
                
                <textarea className="memo-input" placeholder="현장 메모" value={af.note||""} onChange={e=>setAddForm(f=>({...f,note:e.target.value}))} />
              </div>}

              <div style={{padding:"4px 12px 24px"}}>
                <button disabled={saving} style={{width:"100%",padding:"15px",borderRadius:14,border:"none",background:saving?"#999":"#111",color:"#fff",fontFamily:"'Noto Sans KR',sans-serif",fontSize:15,fontWeight:700,cursor:saving?"wait":"pointer",opacity:saving?0.6:1}} onClick={()=>{
                  if (saving) return;
                  setSaving(true);
                  const id=Date.now().toString();
                  const openLabel=(af.openItems||[]).map(i=>`${i.label}${i.qty>1?` ×${i.qty}`:""}`).join(", ");
                  const prodLabel=(af.products||[]).map(p=>`${p.brand} ${p.name}${(p.qty||1)>1?` ×${p.qty||1}`:""}`).join(", ");
                  // 사용자가 실제 금액을 입력하면 그것을 사용, 아니면 자동 계산
                  const finalTotal = af.customTotal !== "" && af.customTotal != null ? Number(af.customTotal) : subTotal;
                  const finalMyE = af.customMyE !== "" && af.customMyE != null ? Number(af.customMyE) : myE;
                  const saved={
                    ID:id, 날짜:selectedDate, 시간:af.time||nowTime(),
                    채널:af.channel, 상태:af.status,
                    연락처:af.phone||"", 주소:af.address||"",
                    작업유형:af.workType,
                    개문유형:openLabel, 개문금액:needOpen?openTotal:0,
                    제품명:prodLabel, 설치금액:needInstall?prodTotal:0,
                    총금액:finalTotal, 준형수령액:finalMyE,
                    자재원가:costTotal,
                    자재내역:(af.products||[]).map(p=>`${p.brand} ${p.name}${(p.qty||1)>1?` ×${p.qty||1}`:""}`).join(", "),
                    현장메모:af.note||"",
                  };
                  setLocalRecords(p=>[...p,saved]);
                  if(SCRIPT_URL!=="여기에_URL_붙여넣기") {
                    api.save({id, date:selectedDate, time:saved.시간, channel:af.channel, status:af.status, phone:af.phone, address:af.address, workType:af.workType, openType:openLabel, product:prodLabel, total:finalTotal, myEarnings:finalMyE, materialCost:costTotal, note:af.note}).then(res => {
                      if (res && res.error) {
                        showToast("⚠️ 시트 저장 실패: " + res.error, "error");
                      }
                      loadRecords();
                      setTimeout(() => loadRecords(), 3000);
                    }).catch(() => {
                      showToast("⚠️ 시트 저장 실패. 다시 시도해주세요", "error");
                    });
                  }
                  setAddForm({channel:"office",time:"",workType:"",status:"완료",phone:"",address:"",note:"",openItems:[],products:[],productFilter:"전체",noTravel:false,customTotal:"",customMyE:""});
                  setShowAddRecord(false);
                  showToast("✅ 저장됐어요!");
                  setTimeout(() => setSaving(false), 2000);
                }}>{saving ? "저장 중..." : "✅ 저장"}</button>
              </div>
            </div>
          </div>
          );
        })()}

        {/* Toast */}
        {toast && (
          <div style={{
            position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)",
            background: toast.type==="error" ? "#dc2626" : "#111",
            color:"#fff", padding:"12px 24px", borderRadius:30,
            fontSize:14, fontWeight:700, zIndex:300,
            boxShadow:"0 4px 20px rgba(0,0,0,.3)",
            whiteSpace:"nowrap",
            animation:"fadeIn .2s ease",
          }}>{toast.msg}</div>
        )}

        {/* 탭바 */}
        <div className="tab-bar">
          <div className={`tab-btn ${tab==="calendar"?"active":""}`} onClick={()=>setTab("calendar")}>
            <div className="tab-icon">📅</div>
            <div className="tab-label">캘린더</div>
          </div>
          <div className={`tab-btn ${tab==="first"?"active":""}`} onClick={()=>setTab("first")}>
            <div className="tab-icon">📋</div>
            <div className="tab-label">최초견적</div>
          </div>
          <div className={`tab-btn ${tab==="pending"?"active":""}`} onClick={()=>setTab("pending")}>
            <div className="tab-icon">📌</div>
            <div className="tab-label">대기/예약</div>
          </div>
          <div className={`tab-btn ${tab==="products"?"active":""}`} onClick={()=>setTab("products")}>
            <div className="tab-icon">📦</div>
            <div className="tab-label">자재</div>
          </div>
          <div className={`tab-btn ${tab==="search"?"active":""}`} onClick={()=>setTab("search")}>
            <div className="tab-icon">🔍</div>
            <div className="tab-label">검색</div>
          </div>
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════
// 검색 화면은 App 컴포넌트 안에 inline으로 렌더
// ════════════════════════════════════════════════

// ════════════════════════════════════════════════
// 최종 견적서 컴포넌트
// ════════════════════════════════════════════════
function FinalQuoteView({ fnq, setFnq, onSave, onBack, showToast, isManual, selectedDate, allMaterials = [] }) {
  // 방어: fnq가 비어있거나 필수 필드가 없을 때 안전하게
  const f = {
    step: "form",
    channel: null,
    phone: "",
    address: "",
    workType: null,
    openItems: [],
    products: [],
    reinforcements: [],
    remodeling: "",
    surcharges: [],
    fieldNote: "",
    filterType: "전체",
    finalAdj: 0,
    recordId: null,
    payment: null,
    etcItems: [],
    ...(fnq || {}),
  };
  // 배열 필드 강제 보정 (혹시 시트에서 잘못된 값이 와도 안전)
  if (!Array.isArray(f.openItems))     f.openItems = [];
  if (!Array.isArray(f.products))      f.products = [];
  if (!Array.isArray(f.reinforcements))f.reinforcements = [];
  if (!Array.isArray(f.surcharges))    f.surcharges = [];
  if (!Array.isArray(f.etcItems))      f.etcItems = [];
  
  const set = (key, val) => setFnq(p=>({...p,[key]:val}));

  const needOpen    = f.workType?.id==="open"    || f.workType?.id==="both";
  const needInstall = f.workType?.id==="install" || f.workType?.id==="both";

  const fmt = n=>n.toLocaleString("ko-KR");
  const fmtInput = v=>{const n=String(v).replace(/\D/g,"");return n?Number(n).toLocaleString("ko-KR"):"";};
  const parseAmt = v=>Number(String(v).replace(/,/g,""))||0;
  const formatPhone = v=>{const d=v.replace(/\D/g,"").slice(0,11);if(d.length<4)return d;if(d.length<8)return `${d.slice(0,3)}-${d.slice(3)}`;return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;};

  const fnqIsSoomgo   = f.channel?.id==="soomgo";
  const fnqTravelFee  = fnqIsSoomgo ? TRAVEL_FEE_SOOMGO : TRAVEL_FEE;
  const openTotal    = f.openItems.reduce((a,i)=>a+(i.customPrice||(fnqIsSoomgo?soomgoOpen(i.actual):i.actual))*i.qty,0);
  const productPrice = (f.products||[]).reduce((a,p)=>a+(fnqIsSoomgo?soomgoPrice(p.price):p.price)*(p.qty||1),0);
  const reinforcementTotal = f.reinforcements.reduce((a,r)=>a+r.price,0);
  const remodelingAmt = parseAmt(f.remodeling);
  const surTotal     = f.surcharges.reduce((a,s)=>a+s.amount,0);
  const total        = fnqTravelFee+(needOpen?openTotal:0)+(needInstall?productPrice:0)+reinforcementTotal+remodelingAmt+surTotal;
  const finalTotal   = total - (Number(f.finalAdj)||0);
  const totalCost    = (f.products||[]).reduce((a,p)=>a+p.cost*(p.qty||1),0)+f.reinforcements.reduce((a,r)=>a+r.cost,0);
  const myEarnings   = fnqIsSoomgo ? finalTotal-totalCost : Math.round((finalTotal-totalCost)*0.5);

  const typeOpts = ["전체","보조키","주키","푸쉬풀","강화유리","기타"];
  const filteredProducts = f.filterType==="전체" ? allMaterials : allMaterials.filter(p=>p.type===f.filterType);

  const toggleOpen = (t) => {
    const exists = f.openItems.find(x=>x.id===t.id);
    const updated = exists ? f.openItems.filter(x=>x.id!==t.id) : [...f.openItems,{...t,qty:1,customPrice:null}];
    const typeMap={handle:"기타",fire:"기타",aux:"보조키",main:"주키",push:"푸쉬풀"};
    if(!exists&&typeMap[t.id]) set("filterType",typeMap[t.id]);
    set("openItems",updated);
  };
  const toggleProduct=(p)=>set("products",(f.products||[]).find(x=>x.id===p.id)?(f.products||[]).filter(x=>x.id!==p.id):[...(f.products||[]),p]);
  const updateOpen=(id,field,val)=>set("openItems",f.openItems.map(x=>x.id===id?{...x,[field]:val}:x));
  const toggleReinf=(r)=>set("reinforcements",f.reinforcements.find(x=>x.id===r.id)?f.reinforcements.filter(x=>x.id!==r.id):[...f.reinforcements,r]);
  const toggleSur=(s)=>set("surcharges",f.surcharges.find(x=>x.id===s.id)?f.surcharges.filter(x=>x.id!==s.id):[...f.surcharges,s]);

  const canGen = f.workType && (!needOpen||f.openItems.length>0) && (!needInstall||(f.products||[]).length>0);

  if(f.step==="card") return (
    <>
      <div style={{padding:"24px 0 16px"}}>
        {/* 고객 정보 수정 (카드 위 — 캡처에 안 들어감) */}
        <div style={{padding:"0 16px 16px"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:"#aaa",marginBottom:8}}>📝 고객 정보 (수정 가능)</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <input className="input-field" placeholder="연락처" value={f.phone||""} onChange={e=>set("phone",formatPhone(e.target.value))} />
            <input className="input-field" placeholder="주소" value={f.address||""} onChange={e=>set("address",e.target.value)} />
          </div>
        </div>
        {/* 견적 카드 */}
        <div className="quote-card">
          <div className="qcard-head">
            <div className="qcard-badge">{isManual ? `작업 추가 · ${selectedDate}` : "최종 견적서 · FINAL"}</div>
            <div className="qcard-title">도어락 · 열쇠 전문 출장</div>
            {f.phone&&<div className="qcard-info">{f.phone}</div>}
            {f.address&&<div className="qcard-info">📍 {f.address}</div>}
          </div>
          <div className="qcard-body">
            <div className="line-item"><span className="line-label">출장비</span><span className="line-price">{fmt(fnqTravelFee)}원</span></div>
            {needOpen&&f.openItems.map(i=>(
              <div key={i.id} className="line-item">
                <span className="line-label" style={{fontWeight:700}}>{i.label} 개문{i.qty>1?` ×${i.qty}`:""}</span>
                <span className="line-price">{fmt((i.customPrice||i.actual)*i.qty)}원</span>
              </div>
            ))}
            {needInstall&&(f.products||[]).map(p=>(
              <div key={p.id} className="line-item">
                <span className="line-label" style={{fontWeight:700}}>{p.brand} {p.name}{(p.qty||1)>1?` ×${p.qty||1}`:""} 설치</span>
                <span className="line-price">{fmt(p.price*(p.qty||1))}원</span>
              </div>
            ))}
            {f.reinforcements.map(r=>(
              <div key={r.id} className="line-item"><span className="line-label">{r.label}</span><span className="line-price">{fmt(r.price)}원</span></div>
            ))}
            {remodelingAmt>0&&<div className="line-item"><span className="line-label">개조비</span><span className="line-price">{fmt(remodelingAmt)}원</span></div>}
            {f.surcharges.map(s=>(
              <div key={s.id} className="line-item"><span className="line-label">{s.label}</span><span className="line-price" style={{color:"#c47800"}}>+{fmt(s.amount)}원</span></div>
            ))}
            {f.finalAdj>0&&<div className="line-item"><span className="line-label" style={{color:"#e74c3c"}}>할인</span><span className="line-price" style={{color:"#e74c3c"}}>- {fmt(f.finalAdj)}원</span></div>}
            <div className="total-box">
              <div className="total-label">최종 금액</div>
              <div className="total-price">{fmt(finalTotal)}<span>원</span></div>
            </div>
            {f.fieldNote&&<div style={{marginTop:14,background:"#f8f8f8",borderRadius:11,padding:"12px 14px",fontSize:12,color:"#666",lineHeight:1.7}}>📋 {f.fieldNote}</div>}
          </div>
        </div>

        {/* 사무실 정산 */}
        <div className="profit-box" style={{marginTop:14}}>
          <div className="profit-title">📊 사무실 정산 (비공개)</div>
          <div className="profit-row"><span className="profit-label">총 청구액</span><span className="profit-val">{fmt(finalTotal)}원</span></div>
          {(f.products||[]).map(p=><div key={p.id} className="profit-row"><span className="profit-label">{p.type} · {p.brand} {p.name}</span><span className="profit-val">- {fmt(p.cost*(p.qty||1))}원</span></div>)}
          {f.reinforcements.map(r=><div key={r.id} className="profit-row"><span className="profit-label">보강판 · {r.label}</span><span className="profit-val">- {fmt(r.cost)}원</span></div>)}
          <div className="profit-row"><span className="profit-label">순이익</span><span className="profit-val">{fmt(finalTotal-totalCost)}원</span></div>
          {f.channel?.id==="office"&&<div className="profit-row"><span className="profit-label">사무실 입금 (50% + 자재 {fmt(totalCost)}원)</span><span className="profit-val">- {fmt(Math.round((finalTotal-totalCost)*0.5)+totalCost)}원</span></div>}
          <div className="profit-row main"><span className="profit-label">준형</span><span className="profit-val">{fmt(myEarnings)}원</span></div>
        </div>

        <div className="acts">
          <button className="act" onClick={()=>set("step","form")}>← 수정</button>
          <button className="act primary" onClick={()=>{
            const breakdown = {
              출장비: fnqTravelFee,
              개문내역: needOpen ? f.openItems.map(i=>`${i.label} 개문${i.qty>1?` ×${i.qty}`:""}`).join(", ") : "",
              개문금액: needOpen ? openTotal : 0,
              설치제품: needInstall ? (f.products||[]).map(p=>`${p.brand} ${p.name}`).join(", ") : "",
              설치금액: needInstall ? productPrice : 0,
              기타항목: (f.etcItems||[]).map(i=>i.label).join(", "),
              기타금액: (f.etcItems||[]).reduce((a,i)=>a+i.price,0),
              보강자재: f.reinforcements.map(r=>r.label).join(", "),
              보강금액: reinforcementTotal,
              개조금액: remodelingAmt,
              할증내역: f.surcharges.map(s=>s.label).join(", "),
              할증금액: surTotal,
              결제방법: f.payment?.label||"",
            };
            onSave(finalTotal, myEarnings, f.finalAdj, totalCost, f.fieldNote, breakdown);
            showToast("✅ 완료로 저장됐어요!");
            onBack();
          }}>✅ 완료 저장</button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="page-top">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%"}}>
          <div className="page-title">{isManual ? "작업 추가" : "최종 견적서"}</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {!isManual && f.recordId&&<div style={{fontSize:11,background:"#f0fdf4",color:"#16a34a",padding:"4px 10px",borderRadius:20,fontWeight:700}}>연동됨</div>}
            {isManual&&<button style={{
              padding:"6px 14px",borderRadius:20,border:"1.5px solid #eee",
              background:"#fff",color:"#555",fontFamily:"'Noto Sans KR',sans-serif",
              fontSize:12,fontWeight:700,cursor:"pointer"
            }} onClick={onBack}>✕ 닫기</button>}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="ptitle">채널</div>
        <div className="sel-row">
          <button className={`ch-btn office ${f.channel?.id==="office"?"on":""}`} onClick={()=>set("channel",{id:"office",label:"사무실"})}>🏢 사무실</button>
          <button className={`ch-btn soomgo ${f.channel?.id==="soomgo"?"on":""}`} onClick={()=>set("channel",{id:"soomgo",label:"숨고"})}>📱 숨고</button>
        </div>
      </div>

      <div className="panel">
        <div className="ptitle">고객 정보</div>
        <div className="input-gap">
          <input className="input-field" placeholder="연락처" value={f.phone} onChange={e=>set("phone",formatPhone(e.target.value))} />
          <input className="input-field" placeholder="주소" value={f.address} onChange={e=>set("address",e.target.value)} />
        </div>
      </div>

      <div className="panel">
        <div className="ptitle">작업 유형</div>
        <div className="sel-row">
          {WORK_TYPES.map(w=>(
            <button key={w.id} className={`sel-btn ${f.workType?.id===w.id?"on":""}`}
              onClick={()=>setFnq(p=>({...p,workType:w,openItems:[],product:null}))}>
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {f.workType&&needOpen&&(
        <div className="panel">
          <div className="ptitle">개문 유형 (중복 선택)</div>
          <div className="sel-col">
            {OPEN_TYPES.map(t=>(
              <button key={t.id} className={`sel-btn ${f.openItems.find(x=>x.id===t.id)?"on":""}`} onClick={()=>toggleOpen(t)}>
                <span>{t.label}</span><span className="sub">{fmt(t.actual)}원</span>
              </button>
            ))}
          </div>
          {f.openItems.map(item=>(
            <div key={item.id} className="open-detail" style={{marginTop:8}}>
              <div style={{fontSize:12,fontWeight:700,color:"#555",marginBottom:8}}>{item.label}</div>
              <div className="qty-row">
                <label>수량</label>
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={()=>updateOpen(item.id,"qty",Math.max(1,item.qty-1))}>−</button>
                  <div className="qty-num">{item.qty}</div>
                  <button className="qty-btn" onClick={()=>updateOpen(item.id,"qty",item.qty+1)}>＋</button>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
                <label style={{fontSize:12,color:"#aaa",whiteSpace:"nowrap"}}>청구 금액</label>
                <input className="price-input" placeholder={fmt(item.actual)}
                  value={item.customPrice?fmtInput(item.customPrice):""}
                  onChange={e=>updateOpen(item.id,"customPrice",parseAmt(e.target.value)||null)} />
                <span style={{fontSize:12,color:"#aaa"}}>원</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {f.workType&&needInstall&&(
        <div className="panel">
          <div className="ptitle">제품 선택 (중복 가능) {(f.products||[]).length>0&&<span style={{color:"#111",background:"#f0f0f0",borderRadius:20,padding:"2px 8px",fontSize:10}}>{(f.products||[]).length}개 선택</span>}</div>
          <div className="filter-row">
            {typeOpts.map(t=><button key={t} className={`filter-btn ${f.filterType===t?"on":""}`} onClick={()=>set("filterType",t)}>{t}</button>)}
          </div>
          <div className="product-list">
            {filteredProducts.map(p=>{
              const displayPrice = fnqIsSoomgo ? soomgoPrice(p.price) : p.price;
              return (
              <div key={p.id} className={`product-item ${(f.products||[]).find(x=>x.id===p.id)?"on":""}`} onClick={()=>toggleProduct(p)}>
                <div><div className="pname">{p.brand} {p.name}</div><div className="pbrand">{p.type}{p.note?` · ${p.note}`:""}</div></div>
                <div style={{textAlign:"right"}}>
                  <div className="pprice">{fmt(displayPrice)}원</div>
                  {fnqIsSoomgo&&<div style={{fontSize:10,color:"rgba(255,255,255,.5)"}}>정가 {fmt(p.price)}원</div>}
                </div>
              </div>
            );})}
          </div>

          {/* 선택된 제품 수량 조절 */}
          {(f.products||[]).length>0&&(
            <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:14}}>
              {(f.products||[]).map(item=>(
                <div key={item.id} className="open-detail">
                  <div style={{fontSize:12,fontWeight:700,color:"#555",marginBottom:8}}>{item.brand} {item.name}</div>
                  <div className="qty-row">
                    <label>수량</label>
                    <div className="qty-ctrl">
                      <button className="qty-btn" onClick={()=>set("products",(f.products||[]).map(x=>x.id===item.id?{...x,qty:Math.max(1,(x.qty||1)-1)}:x))}>−</button>
                      <div className="qty-num">{item.qty||1}</div>
                      <button className="qty-btn" onClick={()=>set("products",(f.products||[]).map(x=>x.id===item.id?{...x,qty:(x.qty||1)+1}:x))}>＋</button>
                    </div>
                    <span style={{fontSize:12,color:"#aaa"}}>{fmt(item.price*(item.qty||1))}원</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="panel">
        <div className="ptitle">개조비 (선택)</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <input className="input-field" placeholder="0" value={fmtInput(f.remodeling)}
            onChange={e=>set("remodeling",parseAmt(e.target.value))} style={{textAlign:"right"}} />
          <span style={{fontSize:13,color:"#aaa",whiteSpace:"nowrap"}}>원</span>
        </div>
      </div>

      <div className="panel">
        <div className="ptitle">현장 작업 내용</div>
        <textarea className="memo-input" placeholder="실제 작업 내용을 기록해 주세요" value={f.fieldNote} onChange={e=>set("fieldNote",e.target.value)} />
      </div>

      <div className="panel">
        <div className="ptitle">할증 (선택)</div>
        <div className="sel-row">
          {SURCHARGES.map(s=>(
            <button key={s.id} className={`sur-btn ${f.surcharges.find(x=>x.id===s.id)?"on":""}`} onClick={()=>toggleSur(s)}>
              {s.label}<br/><span style={{fontSize:12,fontWeight:700}}>+{fmt(s.amount)}원</span>
            </button>
          ))}
        </div>
      </div>

      {/* 총액 미리보기 */}
      {f.workType&&(
        <div className="panel">
          <div className="ptitle">총액 확인</div>
          <div style={{background:"#f8f8f8",borderRadius:12,padding:"14px 16px",marginBottom:12}}>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#aaa"}}><span>출장비</span><span>{fmt(fnqTravelFee)}원</span></div>
              {needOpen&&f.openItems.map(i=>(
                <div key={i.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#aaa"}}>
                  <span>{i.label} 개문{i.qty>1?` ×${i.qty}`:""}</span><span>{fmt((i.customPrice||i.actual)*i.qty)}원</span>
                </div>
              ))}
              {needInstall&&(f.products||[]).map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#aaa"}}><span>{p.brand} {p.name}</span><span>{fmt(p.price)}원</span></div>)}
              {f.reinforcements.map(r=><div key={r.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#aaa"}}><span>{r.label}</span><span>{fmt(r.price)}원</span></div>)}
              {remodelingAmt>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#aaa"}}><span>개조비</span><span>{fmt(remodelingAmt)}원</span></div>}
              {f.surcharges.map(s=><div key={s.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#c47800"}}><span>{s.label}</span><span>+{fmt(s.amount)}원</span></div>)}
              <div style={{height:1,background:"#e8e8e8",margin:"4px 0"}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:900,color:"#111"}}><span>소계</span><span>{fmt(total)}원</span></div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:12,color:"#aaa",whiteSpace:"nowrap"}}>할인 금액</span>
            <input className="input-field" placeholder="0" value={fmtInput(f.finalAdj)}
              onChange={e=>set("finalAdj",parseAmt(e.target.value))} style={{textAlign:"right"}} />
            <span style={{fontSize:12,color:"#aaa"}}>원</span>
          </div>
          {f.finalAdj>0&&(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10,padding:"10px 14px",background:"#111",borderRadius:10}}>
              <span style={{fontSize:12,color:"rgba(255,255,255,.6)"}}>할인 후 최종</span>
              <span style={{fontSize:20,fontWeight:900,color:"#fff"}}>{fmt(finalTotal)}원</span>
            </div>
          )}
        </div>
      )}

      <button className="gen-btn green" disabled={!canGen} onClick={()=>set("step","card")}>최종 견적서 생성 →</button>
    </>
  );
}
