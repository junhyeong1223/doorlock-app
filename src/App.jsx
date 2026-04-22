import { useState, useEffect } from "react";

// ══════════════════════════════════════════════════
// ⚠️  여기에 Apps Script 배포 URL 붙여넣기
// ══════════════════════════════════════════════════
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw9pIOOLYgwbVC9UgEn04kIsI5P2wMdCkc_gqSu2LaoD9-UJoQd2-uc2ewvJ1yR0WSyaQ/exec";
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
  { id: "key",  label: "열쇠",   base: 50000,  real: 50000   },
  { id: "aux",  label: "보조키", base: 180000, real: 180000  },
  { id: "main", label: "주키",   base: 230000, real: 230000  },
  { id: "push", label: "푸쉬풀", base: 350000, real: 350000  },
  { id: "sash", label: "샷시문", base: 250000, real: 250000  },
  { id: "etc",  label: "기타",   base: 0,      real: 0       },
];

const ETC_INSTALL_ITEMS = [
  { id:"horseshoe", label:"말발굽",     price:50000  },
  { id:"closer",    label:"도어클로저", price:70000  },
  { id:"closer_s",  label:"도어클로저 정지형", price:100000 },
  { id:"safety",    label:"안전고리 기본", price:50000 },
  { id:"safety_p",  label:"안전고리 고급", price:70000 },
  { id:"handle",    label:"컵핸들",     price:60000  },
  { id:"lever",     label:"방문레바",   price:50000  },
  { id:"gate_lock", label:"현관정",     price:50000  },
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
  { label:"고객 변심",      travel:true  },
  { label:"타업체 선택",    travel:true  },
  { label:"출동 중 취소",   travel:true  },
  { label:"연락 두절",      travel:true  },
  { label:"작업 불가 (기술 부족)", travel:false },
  { label:"기타",           travel:true  },
];
const TRAVEL_FEE = 30000;
const TRAVEL_FEE_SOOMGO = 10000;

// 숨고 가격 계산
const soomgoPrice = (price) => Math.floor(price * 0.7 / 10000) * 10000;
const soomgoOpen  = (price) => Math.floor(price * 0.5 / 10000) * 10000;
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
const api = {
  getMonth: async (month) => {
    if (SCRIPT_URL === "여기에_URL_붙여넣기") return [];
    const res = await fetch(`${SCRIPT_URL}?action=getMonth&month=${month}`);
    return res.json();
  },
  save: async (record) => {
    if (SCRIPT_URL === "여기에_URL_붙여넣기") {
      return { success:true, id: Date.now().toString() };
    }
    const res = await fetch(SCRIPT_URL, {
      method:"POST", body:JSON.stringify({ action:"save", record })
    });
    return res.json();
  },
  update: async (id, fields) => {
    if (SCRIPT_URL === "여기에_URL_붙여넣기") return { success:true };
    const res = await fetch(SCRIPT_URL, {
      method:"POST", body:JSON.stringify({ action:"update", id, fields })
    });
    return res.json();
  },
  delete: async (id) => {
    if (SCRIPT_URL === "여기에_URL_붙여넣기") return { success:true };
    const res = await fetch(SCRIPT_URL, {
      method:"POST", body:JSON.stringify({ action:"delete", id })
    });
    return res.json();
  },
};

// ════════════════════════════════════════════════
// 메인 앱
// ════════════════════════════════════════════════
export default function App() {
  const [tab, setTab]       = useState("calendar"); // calendar | first | final
  const [records, setRecords] = useState([]);
  const [allTimeRecords, setAllTimeRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast]   = useState(null);
  const showToast = (msg, type="success") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 3000);
  };

  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null); // 완료 카드 상세 모달
  const [showCancel, setShowCancel] = useState(null);
  const [confirmDispatch, setConfirmDispatch] = useState(null);
  const [showReserve, setShowReserve] = useState(null); // {id}
  const [reserveForm, setReserveForm] = useState({date:"", time:""});
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [addForm, setAddForm] = useState({
    channel:"office", time:"", workType:"", openType:"",
    product:"", total:"", myEarnings:"", note:"", status:"완료"
  });
  const [searchQuery, setSearchQuery] = useState("");

  // 자재 목록
  const [productList, setProductList] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({name:"",brand:"",type:"",price:"",cost:"",desc:""});

  // 최초 견적서 상태
  const [fq, setFq] = useState({
    channel:null, phone:"", address:"", workType:null,
    openItems:[], installItems:[], surcharges:[], memo:"",
    reserveDate:"", reserveTime:"",
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
    const monthStr = `${year}-${String(month+1).padStart(2,"0")}`;
    const data = await api.getMonth(monthStr);
    setRecords(Array.isArray(data) ? data : []);
    // 전체 기록도 로드 (검색용)
    const allData = await api.getAll();
    setAllTimeRecords(Array.isArray(allData) ? allData : []);
    setLoading(false);
  };

  useEffect(() => { loadRecords(); }, [year, month]);

  // ── 로컬 레코드 (항상 localRecords + 시트 records 합산) ──
  const [localRecords, setLocalRecords] = useState([]);
  const monthStr = `${year}-${String(month+1).padStart(2,"0")}`;
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

  // 월 통계 (완료 + 출장비 발생한 취소건 포함)
  const billable = mergedRecords.filter(r=>r.상태==="완료"||(r.상태==="취소"&&Number(r.총금액||0)>0));
  const monthTotal    = billable.reduce((a,r)=>a+Number(r.총금액||0),0);
  const monthEarnings = billable.reduce((a,r)=>a+Number(r.준형수령액||0),0);
  const completed     = mergedRecords.filter(r=>r.상태==="완료");

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
    const needOpen    = fq.workType?.id==="open"    || fq.workType?.id==="both";
    const needInstall = fq.workType?.id==="install" || fq.workType?.id==="both";
    const openTotal   = fq.openItems.reduce((a,i)=>a+(i.actual||0)*i.qty, 0);
    const installPrice= needInstall&&fq.installItems.reduce((a,i)=>a+i.base*i.qty,0);
    const surTotal    = fq.surcharges.reduce((a,s)=>a+s.amount, 0);
    const total       = TRAVEL_FEE+(needOpen?openTotal:0)+installPrice+surTotal;
    const id          = Date.now().toString();
    const isReserve   = status==="예약" && fq.reserveDate;
    const record = {
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
      api.save(record).then(()=>loadRecords()).catch(()=>{});
    }
    setFq({channel:null,phone:"",address:"",workType:null,openItems:[],installItems:[],surcharges:[],memo:"",reserveDate:"",reserveTime:""});
    setFqStep("form");
    setTab(isReserve?"pending":"calendar");
    if(!isReserve) setSelectedDate(todayStr());
  };

  // 견적 카드 미리보기용 계산
  const fqNeedOpen    = fq.workType?.id==="open"    || fq.workType?.id==="both";
  const fqNeedInstall = fq.workType?.id==="install" || fq.workType?.id==="both";
  const isSoomgo      = fq.channel?.id==="soomgo";
  const fqTravelFee   = isSoomgo ? TRAVEL_FEE_SOOMGO : TRAVEL_FEE;
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
    if(SCRIPT_URL!=="여기에_URL_붙여넣기") {
      api.delete(id).then(()=>loadRecords()).catch(()=>{});
    }
    showToast("🗑 삭제됐어요");
  };

  // ── 상태 변경 ──
  const updateStatus = (id, status, extra={}) => {
    const fields = { 상태:status, ...extra };
    setLocalRecords(p=>p.map(r=>String(r.ID)===String(id)?{...r,...fields}:r));
    if(SCRIPT_URL!=="여기에_URL_붙여넣기") {
      api.update(id, fields).then(()=>loadRecords()).catch(()=>{});
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
        보강자재: breakdown.보강자재||"",
        보강금액: breakdown.보강금액||0,
        개조금액: breakdown.개조금액||0,
        할증내역: breakdown.할증내역||"",
        기타항목: breakdown.기타항목||"",
        기타금액: breakdown.기타금액||0,
        결제방법: breakdown.결제방법||"",
      };
      setLocalRecords(p=>p.map(r=>String(r.ID)===String(fnq.recordId)?{...r,...fields}:r));
      if(SCRIPT_URL!=="여기에_URL_붙여넣기") {
        api.update(fnq.recordId, fields).then(()=>loadRecords()).catch(()=>{});
      }
    }
  };

  // ════════════════════════════════════════
  // 렌더
  // ════════════════════════════════════════
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#f4f4f2;font-family:'Noto Sans KR',sans-serif;}
        .app{min-height:100vh;max-width:420px;margin:0 auto;padding-bottom:100px;}

        /* 탭바 */
        .tab-bar{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:420px;background:#fff;border-top:1px solid #eee;display:flex;padding:8px 0 20px;z-index:100;}
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
        .input-field{width:100%;border:1.5px solid #ebebeb;border-radius:11px;padding:11px 13px;font-family:'Noto Sans KR',sans-serif;font-size:14px;color:#333;outline:none;transition:border-color .15s;}
        .input-field:focus{border-color:#111;}
        .input-field::placeholder{color:#ddd;}
        .input-gap{display:flex;flex-direction:column;gap:10px;}
        .memo-input{width:100%;border:1.5px solid #ebebeb;border-radius:11px;padding:11px 13px;font-family:'Noto Sans KR',sans-serif;font-size:13px;color:#333;resize:none;outline:none;min-height:64px;transition:border-color .15s;}
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
          height:40px;border-radius:8px;
          display:flex;flex-direction:column;
          align-items:center;justify-content:center;
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
          <div className="cal-header">
            <div className="cal-header-top">
              <div className="month-nav">
                <button className="nav-btn" onClick={()=>{if(month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1);setSelectedDate(null);}}>‹</button>
                <div><span className="month-title">{MONTHS[month]}</span><span className="month-year">{year}</span></div>
                <button className="nav-btn" onClick={()=>{if(month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1);setSelectedDate(null);}}>›</button>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>이번달 수령</div>
                <div style={{fontSize:18,fontWeight:900,color:"#4ade80",fontFamily:"'DM Mono',monospace"}}>{fmt(monthEarnings)}원</div>
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
                  if(!d) return <div key={i} style={{height:40}}/>;
                  const ds=dateStr(d);
                  const recs=ds?(byDate[ds]||[]):[];
                  return (
                    <div key={i}
                      className={["day-cell",recs.length?"has-rec":"",selectedDate===ds?"sel":"",isToday(d)?"today":""].join(" ")}
                      onClick={()=>setSelectedDate(selectedDate===ds?null:ds)}>
                      <div className="day-num">{d}</div>
                      {recs.length>0&&<div className="day-dot">
                        {recs.slice(0,3).map((r,j)=>{const dc={"완료":"done","예약":"reserve","작업중":"wait","출동중":"office","취소":"cancel"}[r.상태]||(r.채널==="soomgo"?"soomgo":"office");return <div key={j} className={`dot ${dc}`}/>;})}
                      </div>}
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
        {tab==="products" && <>
          <div className="page-top">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%"}}>
              <div>
                <div className="page-title">자재 목록</div>
                <div className="page-sub">제품 관리</div>
              </div>
              <button style={{
                padding:"8px 16px",borderRadius:20,border:"none",
                background:"#111",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"
              }} onClick={()=>{setProductForm({name:"",brand:"",type:"",price:"",cost:"",desc:""});setEditProduct(null);setShowAddProduct(true);}}>
                + 추가
              </button>
            </div>
          </div>

          <div style={{padding:"0 16px"}}>
            {/* 기본 제품 목록 (단가표 기반) */}
            {[...PRODUCTS, ...productList].length === 0
              ? <div className="empty">자재가 없어요</div>
              : (() => {
                const allProds = [...PRODUCTS, ...productList];
                const types = [...new Set(allProds.map(p=>p.type))];
                return types.map(type=>(
                  <div key={type} style={{marginBottom:20}}>
                    <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:"#aaa",marginBottom:10,textTransform:"uppercase"}}>{type}</div>
                    {allProds.filter(p=>p.type===type).map(p=>(
                      <div key={p.id||p.name} style={{
                        background:"#fff",borderRadius:14,padding:"14px 16px",
                        marginBottom:8,boxShadow:"0 2px 8px rgba(0,0,0,.05)",
                        display:"flex",justifyContent:"space-between",alignItems:"center"
                      }}>
                        <div>
                          <div style={{fontSize:14,fontWeight:700,color:"#111"}}>{p.brand} {p.name}</div>
                          {p.desc&&<div style={{fontSize:12,color:"#aaa",marginTop:2}}>{p.desc}</div>}
                          <div style={{fontSize:12,color:"#888",marginTop:4}}>
                            원가 {fmt(p.cost||0)}원 → 소매 {fmt(p.price||0)}원
                          </div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:16,fontWeight:900,color:"#111"}}>{fmt(p.price||0)}원</div>
                          {productList.find(x=>x.id===p.id)&&(
                            <button style={{
                              marginTop:6,padding:"4px 10px",borderRadius:8,border:"1px solid #eee",
                              background:"#fff",fontSize:11,color:"#aaa",cursor:"pointer"
                            }} onClick={()=>{
                              setProductList(l=>l.filter(x=>x.id!==p.id));
                              showToast("🗑 삭제됐어요");
                            }}>삭제</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ));
              })()
            }
          </div>

          {/* 자재 추가 모달 */}
          {showAddProduct&&(
            <div className="modal-bg" onClick={()=>setShowAddProduct(false)}>
              <div className="modal" style={{maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
                <h3 style={{marginBottom:16}}>📦 자재 추가</h3>
                {[
                  {key:"brand",label:"브랜드",placeholder:"예) 락프로"},
                  {key:"name", label:"제품명", placeholder:"예) H60N"},
                  {key:"type", label:"종류",   placeholder:"예) 보조키"},
                  {key:"price",label:"소매가", placeholder:"0"},
                  {key:"cost", label:"원가",   placeholder:"0"},
                  {key:"desc", label:"설명",   placeholder:"간단 설명 (선택)"},
                ].map(f=>(
                  <div key={f.key} style={{marginBottom:14}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:2,marginBottom:6}}>{f.label}</div>
                    <input className="input-field" placeholder={f.placeholder}
                      value={productForm[f.key]}
                      onChange={e=>setProductForm(p=>({...p,[f.key]:e.target.value}))}
                      type={f.key==="price"||f.key==="cost"?"number":"text"}
                    />
                  </div>
                ))}
                <button style={{
                  width:"100%",padding:"14px",borderRadius:12,border:"none",
                  background:"#111",color:"#fff",fontFamily:"'Noto Sans KR',sans-serif",
                  fontSize:14,fontWeight:700,cursor:"pointer"
                }} onClick={()=>{
                  if(!productForm.name||!productForm.brand) return showToast("브랜드와 제품명을 입력하세요","error");
                  const newP = {
                    id: "custom_"+Date.now(),
                    brand: productForm.brand,
                    name: productForm.name,
                    type: productForm.type||"기타",
                    price: Number(productForm.price)||0,
                    cost: Number(productForm.cost)||0,
                    desc: productForm.desc,
                  };
                  setProductList(l=>[...l,newP]);
                  setShowAddProduct(false);
                  showToast("✅ 자재 추가됐어요!");
                }}>추가</button>
              </div>
            </div>
          )}
        </>}

        {/* ══════════ 대기목록 탭 ══════════ */}
        {tab==="pending" && <>
          <div className="page-top">
            <div className="page-title">대기 목록</div>
            <div className="page-sub">진행 중인 모든 건</div>
          </div>
          <div style={{padding:"0 16px"}}>
            {(()=>{
              const allRecs = [...(SCRIPT_URL==="여기에_URL_붙여넣기"?[]:records), ...localRecords.filter(r=>!records.find(s=>String(s.ID)===String(r.ID)))];
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
                  // 전체 레코드에서 검색 (로컬 + 시트)
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
                  ).sort((a,b)=>b.날짜?.localeCompare(a.날짜));

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
                    <div style={{fontSize:12,fontWeight:700,color:"#555",marginBottom:6}}>{item.label}</div>
                    {item.id==="etc" ? (
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        <input className="input-field" placeholder="작업 내용 입력 (예: 안전고리 설치)"
                          value={item.etcDesc||""}
                          onChange={e=>setFq(f=>({...f,installItems:f.installItems.map(x=>x.id===item.id?{...x,etcDesc:e.target.value}:x)}))} />
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <input className="input-field" placeholder="금액" style={{textAlign:"right"}}
                            value={item.etcPrice?fmtInput(item.etcPrice):""}
                            onChange={e=>setFq(f=>({...f,installItems:f.installItems.map(x=>x.id===item.id?{...x,etcPrice:parseAmt(e.target.value)}:x)}))} />
                          <span style={{fontSize:12,color:"#aaa",whiteSpace:"nowrap"}}>원~</span>
                        </div>
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
                <div style={{marginTop:14,background:"#fffbf0",border:"1px solid #f5e4b0",borderRadius:11,padding:"12px 14px",fontSize:12,color:"#997700",lineHeight:1.7}}>
                  📌 현장 상황(난이도, 추가 부품 등)에 따라 금액이 변동될 수 있으며, 변동 시 작업 전 반드시 사전에 안내드립니다.
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
        {tab==="final" && <FinalQuoteView fnq={fnq} setFnq={setFnq} onSave={saveFinalQuote} onBack={()=>setTab("calendar")} showToast={showToast} />}

        {/* 완료 카드 상세 모달 */}
        {viewRecord&&(
          <div className="modal-bg" onClick={()=>setViewRecord(null)}>
            <div className="modal" style={{maxHeight:"90vh",overflowY:"auto",padding:0,borderRadius:"20px 20px 0 0"}} onClick={e=>e.stopPropagation()}>
              {/* 견적 카드 */}
              <div style={{background:"#111",padding:"22px 22px 18px"}}>
                <div style={{display:"inline-block",background:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.6)",fontSize:10,fontWeight:700,letterSpacing:2,padding:"4px 10px",borderRadius:20,marginBottom:12}}>최종 견적서 · FINAL</div>
                <div style={{color:"#fff",fontSize:18,fontWeight:900,letterSpacing:"-.5px",marginBottom:8}}>도어락 · 열쇠 전문 출장</div>
                {viewRecord.연락처&&<div style={{color:"rgba(255,255,255,.5)",fontSize:12,marginBottom:2}}>{viewRecord.연락처}</div>}
                {viewRecord.주소&&<div style={{color:"rgba(255,255,255,.5)",fontSize:12}}>📍 {viewRecord.주소}</div>}
              </div>

              <div style={{background:"#fff",padding:"20px 22px"}}>
                {/* 작업 내역 */}
                <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:"#bbb",textTransform:"uppercase",marginBottom:10}}>작업 내역</div>
                <div style={{display:"flex",flexDirection:"column"}}>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #f5f5f5"}}>
                    <span style={{fontSize:13,color:"#555"}}>출장비</span>
                    <span style={{fontSize:13,fontWeight:700}}>30,000원</span>
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
                      <span style={{fontSize:12,color:"#888"}}>사무실 배분 (50%)</span>
                      <span style={{fontSize:13,fontWeight:700,color:"#aaa"}}>- {fmt(Math.round((Number(viewRecord.총금액||0)-Number(viewRecord.자재원가||0))*0.5))}원</span>
                    </div>
                  )}
                  <div style={{display:"flex",justifyContent:"space-between",paddingTop:12}}>
                    <span style={{fontSize:13,fontWeight:700,color:"#ccc"}}>준형</span>
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
                <input type="time" className="input-field"
                  value={reserveForm.time}
                  onChange={e=>setReserveForm(f=>({...f,time:e.target.value}))} />
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
                    {label:"고객 변심",   travel:true },
                    {label:"연락 두절",   travel:true },
                    {label:"출동 중 취소",travel:true },
                    {label:"기타",        travel:true },
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

        {showAddRecord&&(
          <div className="modal-bg" onClick={()=>setShowAddRecord(false)}>
            <div className="modal" style={{maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
              <h3 style={{marginBottom:16}}>📝 작업 추가 — {selectedDate}</h3>

              {/* 채널 */}
              <div style={{fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:2,marginBottom:8}}>채널</div>
              <div style={{display:"flex",gap:8,marginBottom:16}}>
                {["office","soomgo"].map(ch=>(
                  <button key={ch} style={{
                    flex:1,padding:"10px",borderRadius:10,border:"1.5px solid",
                    borderColor:addForm.channel===ch?"#111":"#eee",
                    background:addForm.channel===ch?"#111":"#fff",
                    color:addForm.channel===ch?"#fff":"#555",
                    fontFamily:"'Noto Sans KR',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer"
                  }} onClick={()=>setAddForm(f=>({...f,channel:ch}))}>
                    {ch==="office"?"🏢 사무실":"📱 숨고"}
                  </button>
                ))}
              </div>

              {/* 상태 */}
              <div style={{fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:2,marginBottom:8}}>상태</div>
              <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
                {["완료","견적대기","출동중","취소"].map(s=>(
                  <button key={s} style={{
                    padding:"7px 12px",borderRadius:20,border:"1.5px solid",
                    borderColor:addForm.status===s?"#111":"#eee",
                    background:addForm.status===s?"#111":"#fff",
                    color:addForm.status===s?"#fff":"#555",
                    fontFamily:"'Noto Sans KR',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"
                  }} onClick={()=>setAddForm(f=>({...f,status:s}))}>{s}</button>
                ))}
              </div>

              {/* 시간 */}
              <div style={{fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:2,marginBottom:8}}>시간</div>
              <input type="time" style={{width:"100%",border:"1.5px solid #eee",borderRadius:10,padding:"10px 12px",fontFamily:"'Noto Sans KR',sans-serif",fontSize:14,marginBottom:16,outline:"none"}}
                value={addForm.time} onChange={e=>setAddForm(f=>({...f,time:e.target.value}))} />

              {/* 작업유형 */}
              <div style={{fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:2,marginBottom:8}}>작업 유형</div>
              <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
                {["개문만","설치만","개문 + 설치"].map(w=>(
                  <button key={w} style={{
                    padding:"7px 12px",borderRadius:20,border:"1.5px solid",
                    borderColor:addForm.workType===w?"#111":"#eee",
                    background:addForm.workType===w?"#111":"#fff",
                    color:addForm.workType===w?"#fff":"#555",
                    fontFamily:"'Noto Sans KR',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"
                  }} onClick={()=>setAddForm(f=>({...f,workType:w}))}>{w}</button>
                ))}
              </div>

              {/* 개문유형 */}
              <div style={{fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:2,marginBottom:8}}>개문 유형</div>
              <input className="input-field" placeholder="예) 도어락 주키" style={{marginBottom:16}}
                value={addForm.openType} onChange={e=>setAddForm(f=>({...f,openType:e.target.value}))} />

              {/* 제품명 */}
              <div style={{fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:2,marginBottom:8}}>제품명</div>
              <input className="input-field" placeholder="예) 락프로 H2000s" style={{marginBottom:16}}
                value={addForm.product} onChange={e=>setAddForm(f=>({...f,product:e.target.value}))} />

              {/* 주소 */}
              <div style={{fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:2,marginBottom:8}}>주소</div>
              <input className="input-field" placeholder="예) 강남구 테헤란로 123" style={{marginBottom:16}}
                value={addForm.address||""} onChange={e=>setAddForm(f=>({...f,address:e.target.value}))} />

              {/* 총금액 */}
              <div style={{fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:2,marginBottom:8}}>총 청구액</div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                <input className="input-field" placeholder="0"
                  value={fmtInput(addForm.total)}
                  onChange={e=>setAddForm(f=>({...f,total:parseAmt(e.target.value)}))}
                  style={{textAlign:"right"}} />
                <span style={{fontSize:13,color:"#aaa"}}>원</span>
              </div>

              {/* 준형 수령액 */}
              <div style={{fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:2,marginBottom:8}}>준형 수령액</div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                <input className="input-field" placeholder="0"
                  value={fmtInput(addForm.myEarnings)}
                  onChange={e=>setAddForm(f=>({...f,myEarnings:parseAmt(e.target.value)}))}
                  style={{textAlign:"right"}} />
                <span style={{fontSize:13,color:"#aaa"}}>원</span>
              </div>

              {/* 메모 */}
              <div style={{fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:2,marginBottom:8}}>메모</div>
              <textarea className="memo-input" placeholder="작업 내용 메모" style={{marginBottom:20}}
                value={addForm.note} onChange={e=>setAddForm(f=>({...f,note:e.target.value}))} />

              {/* 저장 */}
              <button style={{
                width:"100%",padding:"14px",borderRadius:12,border:"none",
                background:"#111",color:"#fff",fontFamily:"'Noto Sans KR',sans-serif",
                fontSize:15,fontWeight:700,cursor:"pointer"
              }} onClick={async()=>{
                try {
                  const record = {
                    date: selectedDate,
                    time: addForm.time || "00:00",
                    channel: addForm.channel,
                    status: addForm.status,
                    address: addForm.address||"",
                    workType: addForm.workType,
                    openType: addForm.openType,
                    product: addForm.product,
                    total: addForm.total||0,
                    myEarnings: addForm.myEarnings||0,
                    discount:0, materialCost:0,
                    note: addForm.note,
                    cancelReason:"",
                  };
                  const result = await api.save(record);
                  const saved = {
                    ...record, ID:result.id||Date.now().toString(),
                    날짜:record.date, 시간:record.time,
                    채널:record.channel, 상태:record.status,
                    주소:record.address, 작업유형:record.workType,
                    개문유형:record.openType, 제품명:record.product,
                    총금액:record.total, 준형수령액:record.myEarnings,
                    현장메모:record.note,
                  };
                  setLocalRecords(p=>[...p,saved]);
                  if(SCRIPT_URL!=="여기에_URL_붙여넣기") loadRecords();
                  setShowAddRecord(false);
                  showToast("✅ 저장됐어요!");
                } catch(e) {
                  showToast("❌ 저장 실패: "+e.message, "error");
                }
              }}>저장</button>
            </div>
          </div>
        )}

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
function FinalQuoteView({ fnq, setFnq, onSave, onBack, showToast }) {
  const f = fnq;
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
  const filteredProducts = f.filterType==="전체" ? PRODUCTS : PRODUCTS.filter(p=>p.type===f.filterType);

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
        {/* 견적 카드 */}
        <div className="quote-card">
          <div className="qcard-head">
            <div className="qcard-badge">최종 견적서 · FINAL</div>
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
          {(f.products||[]).map(p=><div key={p.id} className="profit-row"><span className="profit-label">{p.type} · {p.brand} {p.name}</span><span className="profit-val">- {fmt(p.cost)}원</span></div>)}
          {f.reinforcements.map(r=><div key={r.id} className="profit-row"><span className="profit-label">보강판 · {r.label}</span><span className="profit-val">- {fmt(r.cost)}원</span></div>)}
          <div className="profit-row"><span className="profit-label">순이익</span><span className="profit-val">{fmt(finalTotal-totalCost)}원</span></div>
          {f.channel?.id==="office"&&<div className="profit-row"><span className="profit-label">사무실 배분 (50%)</span><span className="profit-val">- {fmt(Math.round((finalTotal-totalCost)*0.5))}원</span></div>}
          <div className="profit-row main"><span className="profit-label">준형</span><span className="profit-val">{fmt(myEarnings)}원</span></div>
        </div>

        <div className="acts">
          <button className="act" onClick={()=>set("step","form")}>← 수정</button>
          <button className="act primary" onClick={()=>{
            const breakdown = {
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
        <div className="page-title">최종 견적서</div>
        {f.recordId&&<div style={{fontSize:11,background:"#f0fdf4",color:"#16a34a",padding:"4px 10px",borderRadius:20,fontWeight:700}}>연동됨</div>}
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
        <div className="ptitle">보강판 (선택)</div>
        <div className="reinf-grid">
          {REINFORCEMENTS.map(r=>(
            <button key={r.id} className={`reinf-btn ${f.reinforcements.find(x=>x.id===r.id)?"on":""}`} onClick={()=>toggleReinf(r)}>
              {r.label}<div className="rprice">{fmt(r.price)}원</div>
            </button>
          ))}
        </div>
      </div>

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
