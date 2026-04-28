import { useState, useEffect, useRef } from "react";
import {
  Sun, Moon, Settings, Plus, Flame, Check, Pencil, Trash2,
  BarChart2, Home, Bell, Target, Leaf, ChevronLeft, ChevronRight,
  Activity, Calendar, Award, TrendingUp, Zap, X
} from "lucide-react";

// ================================================================
// 🐛 INTENTIONAL BUG:
//   Кнопка перемикання теми (Sun/Moon в хедері) оновлює стейт `isDark`
//   і візуально міняє іконку та стиль самої кнопки —
//   але фон сторінки захардкоджений як DARK_THEME і ніколи не читає isDark.
//   Результат: кнопка реагує, але тема не змінюється.
// ================================================================

const DARK = {
  bg:       "#0c0a09",
  surface:  "#1c1917",
  border:   "#292524",
  border2:  "#44403c",
  text:     "#fafaf9",
  textMid:  "#a8a29e",
  textDim:  "#57534e",
  textFaint:"#44403c",
};

const TODAY = new Date().toISOString().split("T")[0];

function formatDate(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().split("T")[0];
}

function calculateStreak(completions) {
  let streak = 0;
  for (let i = 0; i <= 90; i++) {
    if (completions[formatDate(i)]) streak++;
    else break;
  }
  return streak;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

const ICON_OPTIONS = [
  { id:"activity",  El: Activity  },
  { id:"zap",       El: Zap       },
  { id:"flame",     El: Flame     },
  { id:"target",    El: Target    },
  { id:"trending",  El: TrendingUp},
  { id:"award",     El: Award     },
  { id:"calendar",  El: Calendar  },
  { id:"leaf",      El: Leaf      },
  { id:"bell",      El: Bell      },
  { id:"bar",       El: BarChart2 },
];

const COLORS = [
  { name:"coral",  ring:"#f87171", bg:"rgba(248,113,113,0.12)", text:"#fca5a5" },
  { name:"amber",  ring:"#fbbf24", bg:"rgba(251,191,36,0.12)",  text:"#fcd34d" },
  { name:"lime",   ring:"#84cc16", bg:"rgba(132,204,22,0.12)",  text:"#a3e635" },
  { name:"teal",   ring:"#2dd4bf", bg:"rgba(45,212,191,0.12)",  text:"#5eead4" },
  { name:"sky",    ring:"#38bdf8", bg:"rgba(56,189,248,0.12)",  text:"#7dd3fc" },
  { name:"violet", ring:"#a78bfa", bg:"rgba(167,139,250,0.12)", text:"#c4b5fd" },
  { name:"rose",   ring:"#fb7185", bg:"rgba(251,113,133,0.12)", text:"#fda4af" },
  { name:"orange", ring:"#f97316", bg:"rgba(249,115,22,0.12)",  text:"#fb923c" },
];

const INITIAL_HABITS = [
  { id:1, name:"Ранкова пробіжка", iconId:"activity", color:COLORS[2],
    completions:{ [formatDate(1)]:true,[formatDate(2)]:true,[formatDate(3)]:true,[formatDate(4)]:true,[formatDate(5)]:true },
    createdAt:Date.now()-86400000*10 },
  { id:2, name:"Читати 20 хвилин", iconId:"award", color:COLORS[5],
    completions:{ [formatDate(1)]:true,[formatDate(2)]:true,[TODAY]:true },
    createdAt:Date.now()-86400000*7 },
  { id:3, name:"Пити воду (2л)", iconId:"zap", color:COLORS[3],
    completions:{ [formatDate(1)]:true,[TODAY]:true },
    createdAt:Date.now()-86400000*5 },
  { id:4, name:"Медитація", iconId:"leaf", color:COLORS[4],
    completions:{ [formatDate(3)]:true,[formatDate(2)]:true },
    createdAt:Date.now()-86400000*14 },
];

const INITIAL_SETTINGS = {
  dailyGoal: 3,
  reminderEnabled: false,
  reminderTime: "08:00",
  showStreak: true,
};

// ─── helpers ──────────────────────────────────────────────────
const b = (extra={}) => ({
  border:"none", cursor:"pointer", fontFamily:"inherit",
  boxSizing:"border-box", ...extra
});

function getIconEl(iconId) {
  return ICON_OPTIONS.find(i => i.id === iconId)?.El || Activity;
}

// ─── Toast ────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:999, display:"flex", flexDirection:"column", gap:8 }}>
      {toasts.map(t => (
        <div key={t.id} onClick={()=>remove(t.id)} style={{
          display:"flex", alignItems:"center", gap:10,
          padding:"11px 16px", borderRadius:14, fontSize:13, fontWeight:600,
          cursor:"pointer", animation:"toastIn .25s ease",
          background: t.type==="success"?"rgba(134,239,172,0.1)":t.type==="error"?"rgba(252,165,165,0.1)":"rgba(255,255,255,0.07)",
          border:`1px solid ${t.type==="success"?"rgba(134,239,172,.25)":t.type==="error"?"rgba(252,165,165,.25)":"rgba(255,255,255,.1)"}`,
          color: t.type==="success"?"#86efac":t.type==="error"?"#fca5a5":"#e2e8f0",
          backdropFilter:"blur(12px)",
        }}>
          {t.type==="success" ? <Check size={14}/> : t.type==="error" ? <X size={14}/> : <Activity size={14}/>}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Modal wrapper ─────────────────────────────────────────────
function Modal({ children, maxWidth=460 }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:55, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.75)", backdropFilter:"blur(10px)", padding:16 }}>
      <div style={{ background:DARK.surface, border:`1px solid ${DARK.border2}`, borderRadius:24, padding:28, width:"100%", maxWidth, maxHeight:"92vh", overflowY:"auto" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Confirm ──────────────────────────────────────────────────
function ConfirmModal({ open, name, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <Modal maxWidth={360}>
      <div style={{ width:44, height:44, borderRadius:12, background:"rgba(220,38,38,0.15)", border:"1px solid rgba(220,38,38,0.3)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
        <Trash2 size={20} color="#f87171" />
      </div>
      <h3 style={{ color:DARK.text, fontWeight:800, fontSize:18, marginBottom:6 }}>Видалити звичку?</h3>
      <p style={{ color:DARK.textDim, fontSize:13, marginBottom:24 }}>"{name}" та весь прогрес буде видалено назавжди.</p>
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onCancel}  style={b({ flex:1, padding:"10px 0", borderRadius:12, background:DARK.border, border:`1px solid ${DARK.border2}`, color:DARK.textMid, fontSize:13, fontWeight:600 })}>Скасувати</button>
        <button onClick={onConfirm} style={b({ flex:1, padding:"10px 0", borderRadius:12, background:"#dc2626", color:"white", fontSize:13, fontWeight:700 })}>Видалити</button>
      </div>
    </Modal>
  );
}

// ─── Settings ─────────────────────────────────────────────────
function SettingsPanel({ settings, onSave, onClose }) {
  const [local, setLocal] = useState({ ...settings });
  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }));

  const Row = ({ label, sub, children }) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderBottom:`1px solid ${DARK.border}` }}>
      <div>
        <p style={{ color:DARK.text, fontSize:14, fontWeight:600 }}>{label}</p>
        {sub && <p style={{ color:DARK.textDim, fontSize:12, marginTop:2 }}>{sub}</p>}
      </div>
      {children}
    </div>
  );

  const Toggle = ({ on, onToggle, accent="#f97316" }) => (
    <button onClick={onToggle} style={b({
      width:44, height:24, borderRadius:99, padding:"2px",
      background: on ? accent : DARK.border2,
      transition:"background .2s",
      display:"flex", alignItems:"center",
      justifyContent: on ? "flex-end" : "flex-start",
    })}>
      <span style={{ width:20, height:20, borderRadius:"50%", background:"white", display:"block", transition:"all .2s" }} />
    </button>
  );

  return (
    <Modal maxWidth={420}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <div style={{ width:40, height:40, borderRadius:11, background:"rgba(249,115,22,0.15)", border:"1px solid rgba(249,115,22,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Settings size={18} color="#f97316" />
        </div>
        <div>
          <h2 style={{ color:DARK.text, fontWeight:900, fontSize:18 }}>Налаштування</h2>
          <p style={{ color:DARK.textDim, fontSize:12 }}>Персоналізуй свій досвід</p>
        </div>
      </div>

      <Row label="Ціль на день" sub="Скільки звичок виконати">
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button onClick={()=>set("dailyGoal", Math.max(1, local.dailyGoal-1))} style={b({ width:30, height:30, borderRadius:8, background:DARK.border, border:`1px solid ${DARK.border2}`, color:DARK.text, fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" })}>−</button>
          <span style={{ color:"#f97316", fontWeight:900, fontSize:22, minWidth:28, textAlign:"center" }}>{local.dailyGoal}</span>
          <button onClick={()=>set("dailyGoal", Math.min(20, local.dailyGoal+1))} style={b({ width:30, height:30, borderRadius:8, background:DARK.border, border:`1px solid ${DARK.border2}`, color:DARK.text, fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" })}>+</button>
        </div>
      </Row>

      <Row label="Нагадування" sub="Щоденне нагадування">
        <Toggle on={local.reminderEnabled} onToggle={()=>set("reminderEnabled", !local.reminderEnabled)} />
      </Row>

      {local.reminderEnabled && (
        <Row label="Час нагадування" sub="Коли нагадувати щодня">
          <input
            type="time" value={local.reminderTime}
            onChange={e=>set("reminderTime", e.target.value)}
            style={{ background:DARK.border, border:`1px solid ${DARK.border2}`, borderRadius:10, padding:"6px 12px", color:"#f97316", fontSize:14, fontWeight:700, outline:"none", fontFamily:"inherit" }}
          />
        </Row>
      )}

      <Row label="Показувати стрік" sub="Відображати стрік на карточках">
        <Toggle on={local.showStreak} onToggle={()=>set("showStreak", !local.showStreak)} accent="#f97316" />
      </Row>

      <div style={{ display:"flex", gap:10, marginTop:24 }}>
        <button onClick={onClose} style={b({ flex:1, padding:"12px 0", borderRadius:14, background:DARK.border, border:`1px solid ${DARK.border2}`, color:DARK.textMid, fontSize:13, fontWeight:700 })}>Скасувати</button>
        <button onClick={()=>{ onSave(local); onClose(); }} style={b({ flex:1, padding:"12px 0", borderRadius:14, background:"#f97316", color:"#0c0a09", fontSize:13, fontWeight:800 })}>Зберегти</button>
      </div>
    </Modal>
  );
}

// ─── Habit Form ────────────────────────────────────────────────
function HabitForm({ initial, onSave, onCancel }) {
  const [name,    setName]  = useState(initial?.name    || "");
  const [iconId,  setIconId]= useState(initial?.iconId  || "activity");
  const [color,   setColor] = useState(initial?.color   || COLORS[0]);
  const [err,     setErr]   = useState("");

  const submit = () => {
    if (!name.trim())          { setErr("Назва обов'язкова"); return; }
    if (name.trim().length>50) { setErr("Максимум 50 символів"); return; }
    onSave({ name:name.trim(), iconId, color });
  };

  return (
    <Modal>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
        <div style={{ width:40, height:40, borderRadius:11, background:"rgba(249,115,22,0.15)", border:"1px solid rgba(249,115,22,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          {initial ? <Pencil size={18} color="#f97316"/> : <Plus size={18} color="#f97316"/>}
        </div>
        <h2 style={{ color:DARK.text, fontWeight:900, fontSize:18 }}>{initial?"Редагувати звичку":"Нова звичка"}</h2>
      </div>

      <div style={{ marginBottom:18 }}>
        <label style={{ color:DARK.textMid, fontSize:11, textTransform:"uppercase", letterSpacing:"0.1em", display:"block", marginBottom:8 }}>Назва *</label>
        <input
          value={name} onChange={e=>{setName(e.target.value);setErr("");}}
          placeholder="Наприклад: Читати 30 хвилин"
          style={{ width:"100%", background:DARK.border, border:`1.5px solid ${err?"#ef4444":DARK.border2}`, borderRadius:12, padding:"11px 14px", color:DARK.text, fontSize:14, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}
        />
        {err && <p style={{ color:"#f87171", fontSize:12, marginTop:5 }}>{err}</p>}
      </div>

      <div style={{ marginBottom:18 }}>
        <label style={{ color:DARK.textMid, fontSize:11, textTransform:"uppercase", letterSpacing:"0.1em", display:"block", marginBottom:10 }}>Іконка</label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {ICON_OPTIONS.map(({ id, El }) => (
            <button key={id} onClick={()=>setIconId(id)} style={b({
              width:42, height:42, borderRadius:11,
              background: iconId===id?"rgba(249,115,22,0.15)":"transparent",
              border:`1.5px solid ${iconId===id?"#f97316":DARK.border2}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all .15s",
            })}>
              <El size={18} color={iconId===id?"#f97316":DARK.textDim} />
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:26 }}>
        <label style={{ color:DARK.textMid, fontSize:11, textTransform:"uppercase", letterSpacing:"0.1em", display:"block", marginBottom:10 }}>Колір</label>
        <div style={{ display:"flex", gap:9, flexWrap:"wrap" }}>
          {COLORS.map(c => (
            <button key={c.name} onClick={()=>setColor(c)} style={b({
              width:28, height:28, borderRadius:"50%", background:c.ring,
              border:`3px solid ${color.name===c.name?"white":"transparent"}`,
              transition:"all .15s",
            })} />
          ))}
        </div>
      </div>

      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onCancel} style={b({ flex:1, padding:"12px 0", borderRadius:14, background:DARK.border, border:`1px solid ${DARK.border2}`, color:DARK.textMid, fontSize:13, fontWeight:700 })}>Скасувати</button>
        <button onClick={submit} style={b({ flex:1, padding:"12px 0", borderRadius:14, background:"#f97316", color:"#0c0a09", fontSize:13, fontWeight:800 })}>{initial?"Зберегти":"Створити"}</button>
      </div>
    </Modal>
  );
}

// ─── Monthly Stats ─────────────────────────────────────────────
function MonthStats({ habits }) {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const todayDay    = now.getDate();
  const monthLabel  = now.toLocaleDateString("uk-UA", { month:"long", year:"numeric" });

  const dailyCounts = Array.from({ length:daysInMonth }, (_, i) => {
    const day = i + 1;
    return habits.reduce((sum, h) =>
      sum + Object.keys(h.completions).filter(ds => {
        const d = new Date(ds);
        return d.getFullYear()===year && d.getMonth()===month && d.getDate()===day;
      }).length, 0);
  });

  const maxVal     = Math.max(...dailyCounts, 1);
  const total      = dailyCounts.reduce((a,b)=>a+b,0);
  const activeDays = dailyCounts.filter(c=>c>0).length;
  const bestStreak = habits.reduce((max,h)=>Math.max(max,calculateStreak(h.completions)),0);
  const totalAll   = habits.reduce((sum,h)=>sum+Object.keys(h.completions).length,0);

  const statCards = [
    { label:"Цього місяця",     val:total,       unit:"виконань",            Icon:Calendar   },
    { label:"Активних днів",    val:activeDays,  unit:`з ${daysInMonth}`,    Icon:Check      },
    { label:"Найдовший стрік",  val:bestStreak,  unit:"днів",                Icon:Flame      },
    { label:"За весь час",      val:totalAll,    unit:"виконань",            Icon:Award      },
    { label:"Середнє/день",     val:activeDays?Math.round(total/activeDays*10)/10:0, unit:"цього місяця", Icon:TrendingUp },
    { label:"Відслідковується", val:habits.length, unit:"звичок",            Icon:Activity   },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
        {statCards.map(({ label, val, unit, Icon }, i) => (
          <div key={i} style={{ background:DARK.surface, border:`1px solid ${DARK.border}`, borderRadius:18, padding:"16px 14px" }}>
            <Icon size={18} color="#f97316" style={{ marginBottom:8 }} />
            <p style={{ color:"#f97316", fontWeight:900, fontSize:22 }}>{val}</p>
            <p style={{ color:DARK.textDim, fontSize:11, marginTop:2 }}>{unit}</p>
            <p style={{ color:DARK.textFaint, fontSize:10, marginTop:1 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ background:DARK.surface, border:`1px solid ${DARK.border}`, borderRadius:20, padding:"20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <p style={{ color:DARK.text, fontWeight:800, fontSize:15 }}>Щоденна активність</p>
            <p style={{ color:DARK.textDim, fontSize:12, marginTop:2, textTransform:"capitalize" }}>{monthLabel}</p>
          </div>
          <BarChart2 size={18} color={DARK.textDim} />
        </div>

        <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:80 }}>
          {dailyCounts.map((c, i) => {
            const h   = (c / maxVal) * 100;
            const isTd = i+1===todayDay;
            return (
              <div key={i} title={`${i+1}: ${c}`} style={{
                flex:1, borderRadius:"3px 3px 0 0",
                background: isTd?"#f97316":c>0?"rgba(249,115,22,0.4)":DARK.border,
                height:`${Math.max(h, c>0?6:2)}%`,
                minHeight:2, transition:"height .3s ease",
                boxShadow: isTd?"0 0 8px #f9731660":"none",
              }}/>
            );
          })}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
          <span style={{ color:DARK.textFaint, fontSize:10 }}>1</span>
          <span style={{ color:"#f97316", fontSize:10, fontWeight:700 }}>сьогодні ({todayDay})</span>
          <span style={{ color:DARK.textFaint, fontSize:10 }}>{daysInMonth}</span>
        </div>
      </div>

      {/* Per-habit */}
      <div style={{ background:DARK.surface, border:`1px solid ${DARK.border}`, borderRadius:20, padding:"20px" }}>
        <p style={{ color:DARK.text, fontWeight:800, fontSize:15, marginBottom:16 }}>По звичках</p>
        {habits.length===0 && <p style={{ color:DARK.textDim, fontSize:13 }}>Додай звички щоб побачити статистику</p>}
        {habits.map(h => {
          const HIcon = getIconEl(h.iconId);
          const streak = calculateStreak(h.completions);
          const tot    = Object.keys(h.completions).length;
          const maxTot = habits.reduce((m,hh)=>Math.max(m,Object.keys(hh.completions).length),1);
          return (
            <div key={h.id} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <HIcon size={15} color={h.color.text} />
                  <span style={{ color:DARK.textMid, fontSize:13, fontWeight:600 }}>{h.name}</span>
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <span style={{ color:h.color.text, fontSize:12, fontWeight:700 }}>{streak}д</span>
                  <span style={{ color:DARK.textDim, fontSize:12 }}>{tot} всього</span>
                </div>
              </div>
              <div style={{ height:5, background:DARK.border, borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", background:h.color.ring, width:`${(tot/maxTot)*100}%`, borderRadius:99, transition:"width .4s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week Grid ─────────────────────────────────────────────────
function WeekGrid({ completions, color, onToggle }) {
  const days   = Array.from({ length:7 }, (_,i)=>formatDate(6-i));
  const labels = ["Пн","Вт","Ср","Чт","Пт","Сб","Нд"];
  return (
    <div style={{ display:"flex", gap:5 }}>
      {days.map((day,i) => {
        const done    = !!completions[day];
        const isToday = day===TODAY;
        const dow     = new Date(day).getDay();
        const lbl     = labels[dow===0?6:dow-1];
        return (
          <div key={day} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <span style={{ fontSize:9, color:isToday?color.text:DARK.textDim, fontWeight:isToday?800:400 }}>{lbl}</span>
            <button onClick={()=>onToggle(day)} style={b({
              width:30, height:30, borderRadius:8,
              border:`1.5px solid ${done?color.ring:DARK.border2}`,
              background: done?color.bg:"transparent",
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all .15s",
              boxShadow: done?`0 0 8px ${color.ring}50`:"none",
            })}>
              {done && <Check size={13} color={color.text} strokeWidth={3} />}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Habit Card ────────────────────────────────────────────────
function HabitCard({ habit, settings, onToggle, onEdit, onDelete }) {
  const HIcon    = getIconEl(habit.iconId);
  const streak   = calculateStreak(habit.completions);
  const todayDone= !!habit.completions[TODAY];
  const total    = Object.keys(habit.completions).length;

  return (
    <div style={{
      background:DARK.surface, borderRadius:20, padding:"18px 20px",
      border:`1px solid ${todayDone?habit.color.ring+"55":DARK.border}`,
      boxShadow: todayDone?`0 0 24px ${habit.color.ring}10`:"none",
      transition:"all .2s",
    }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:46, height:46, borderRadius:14, background:habit.color.bg, border:`1px solid ${habit.color.ring}40`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <HIcon size={22} color={habit.color.text} />
          </div>
          <div>
            <p style={{ color:DARK.text, fontWeight:700, fontSize:15 }}>{habit.name}</p>
            <div style={{ display:"flex", gap:10, marginTop:4, alignItems:"center" }}>
              {settings.showStreak && (
                <span style={{ display:"flex", alignItems:"center", gap:4, color:habit.color.text, fontSize:12, fontWeight:700 }}>
                  <Flame size={12} /> {streak}д
                </span>
              )}
              <span style={{ color:DARK.textFaint, fontSize:12 }}>всього {total}</span>
            </div>
          </div>
        </div>

        <div style={{ display:"flex", gap:5, flexShrink:0 }}>
          <button onClick={()=>onToggle(TODAY)} style={b({
            padding:"7px 14px", borderRadius:10, fontSize:12, fontWeight:700,
            background: todayDone?habit.color.bg:habit.color.ring,
            border:`1.5px solid ${habit.color.ring}`,
            color: todayDone?habit.color.text:"#0c0a09",
            display:"flex", alignItems:"center", gap:6,
            transition:"all .15s",
          })}>
            {todayDone && <Check size={13} strokeWidth={3}/>}
            {todayDone?"Готово":"Відмітити"}
          </button>
          <button onClick={onEdit} style={b({ padding:"7px 9px", borderRadius:10, background:"transparent", border:`1px solid ${DARK.border}`, color:DARK.textDim, display:"flex", alignItems:"center", justifyContent:"center" })}>
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} style={b({ padding:"7px 9px", borderRadius:10, background:"transparent", border:`1px solid ${DARK.border}`, color:DARK.textDim, display:"flex", alignItems:"center", justifyContent:"center" })}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <WeekGrid completions={habit.completions} color={habit.color} onToggle={onToggle} />
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────
export default function App() {
  const load = (k, fb) => { try { return JSON.parse(localStorage.getItem(k)) || fb; } catch { return fb; } };

  const [habits,       setHabits]       = useState(()=>load("hf4_habits",   INITIAL_HABITS));
  const [settings,     setSettings]     = useState(()=>load("hf4_settings", INITIAL_SETTINGS));
  const [page,         setPage]         = useState("home");
  const [isDark,       setIsDark]       = useState(true);   // 🐛 BUG: toggled but never used in styles
  const [showForm,     setShowForm]     = useState(false);
  const [editHabit,    setEditHabit]    = useState(null);
  const [confirmHabit, setConfirmHabit] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [toasts,       setToasts]       = useState([]);
  const [filter,       setFilter]       = useState("all");
  const nextId = useRef(Date.now());

  useEffect(()=>{ localStorage.setItem("hf4_habits",   JSON.stringify(habits));   }, [habits]);
  useEffect(()=>{ localStorage.setItem("hf4_settings", JSON.stringify(settings)); }, [settings]);

  const toast = (msg, type="success") => {
    const id = Date.now();
    setToasts(p=>[...p,{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)), 3000);
  };

  const handleAdd    = f => { setHabits(p=>[{...f,id:++nextId.current,completions:{},createdAt:Date.now()},...p]); setShowForm(false); toast("Нову звичку додано!"); };
  const handleEdit   = f => { setHabits(p=>p.map(h=>h.id===editHabit.id?{...h,...f}:h)); setEditHabit(null); toast("Збережено","info"); };
  const handleDelete = () => { setHabits(p=>p.filter(h=>h.id!==confirmHabit.id)); setConfirmHabit(null); toast("Видалено","error"); };
  const handleToggle = (hId, day) => {
    setHabits(p=>p.map(h=>{
      if(h.id!==hId) return h;
      const c={...h.completions};
      if(c[day]) delete c[day]; else c[day]=true;
      return {...h,completions:c};
    }));
  };

  const doneToday = habits.filter(h=>h.completions[TODAY]).length;
  const goalMet   = doneToday >= settings.dailyGoal;
  const progress  = habits.length ? Math.round((doneToday/habits.length)*100) : 0;

  const filtered = habits.filter(h=>{
    if(filter==="pending" && !!h.completions[TODAY]) return false;
    if(filter==="done"    && !h.completions[TODAY])  return false;
    if(filter==="streak"  && calculateStreak(h.completions)<2) return false;
    return true;
  });

  return (
    // 🐛 BUG: background always uses DARK.bg regardless of isDark state
    <div style={{ minHeight:"100vh", background:DARK.bg, fontFamily:"'Nunito',sans-serif", color:DARK.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        button,input,textarea,select{font-family:'Nunito',sans-serif}
        @keyframes toastIn{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:${DARK.bg}}
        ::-webkit-scrollbar-thumb{background:${DARK.border2};border-radius:99px}
      `}</style>

      {/* Header */}
      <header style={{ borderBottom:`1px solid ${DARK.surface}`, padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:"rgba(12,10,9,0.92)", backdropFilter:"blur(16px)", zIndex:30 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#f97316,#ea580c)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Leaf size={17} color="white" />
          </div>
          <div>
            <span style={{ fontWeight:900, fontSize:18, letterSpacing:"-0.03em" }}>HabitFlow</span>
            <span style={{ color:DARK.textFaint, fontSize:12, marginLeft:8 }}>
              {new Date().toLocaleDateString("uk-UA",{weekday:"short",day:"numeric",month:"short"})}
            </span>
            
          </div>
        </div>

        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <button onClick={()=>setPage("home")} style={b({
            padding:"7px 14px", borderRadius:10, fontSize:12, fontWeight:700,
            display:"flex", alignItems:"center", gap:6,
            background:page==="home"?"#f97316":"transparent",
            border:`1px solid ${page==="home"?"#f97316":DARK.border}`,
            color:page==="home"?"#0c0a09":DARK.textDim,
          })}>
            <Home size={14}/> Головна
          </button>
          <button onClick={()=>setPage("stats")} style={b({
            padding:"7px 14px", borderRadius:10, fontSize:12, fontWeight:700,
            display:"flex", alignItems:"center", gap:6,
            background:page==="stats"?"#f97316":"transparent",
            border:`1px solid ${page==="stats"?"#f97316":DARK.border}`,
            color:page==="stats"?"#0c0a09":DARK.textDim,
          })}>
            <BarChart2 size={14}/> Статистика
          </button>

          {/* 🐛 BUG: isDark state updates, button icon changes — but page stays dark */}
          <button onClick={()=>setIsDark(p=>!p)} title="Змінити тему" style={b({
            padding:"7px 10px", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center",
            background: isDark?"transparent":"rgba(255,255,255,0.08)",
            border:`1px solid ${isDark?DARK.border:"rgba(255,255,255,0.2)"}`,
            color: isDark?DARK.textDim:"#fcd34d",
            transition:"all .2s",
          })}>
            {isDark ? <Sun size={16}/> : <Moon size={16}/>}
          </button>

          <button onClick={()=>setShowSettings(true)} style={b({ padding:"7px 10px", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", background:"transparent", border:`1px solid ${DARK.border}`, color:DARK.textDim })}>
            <Settings size={16}/>
          </button>
          <button onClick={()=>setShowForm(true)} style={b({
            padding:"7px 14px", borderRadius:10, fontSize:12, fontWeight:800,
            display:"flex", alignItems:"center", gap:6,
            background:"#f97316", color:"#0c0a09",
          })}>
            <Plus size={14}/> Нова
          </button>
        </div>
      </header>

      <main style={{ maxWidth:700, margin:"0 auto", padding:"28px 16px" }}>

        {/* ── HOME ──────────────────────────────────────── */}
        {page==="home" && (
          <>
            {/* Today card */}
            <div style={{ background:goalMet?"rgba(132,204,22,0.07)":DARK.surface, border:`1px solid ${goalMet?"#84cc1640":DARK.border}`, borderRadius:22, padding:"22px", marginBottom:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div>
                  <p style={{ color:DARK.textMid, fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em" }}>
                    {new Date().toLocaleDateString("uk-UA",{weekday:"long",day:"numeric",month:"long"})}
                  </p>
                  <p style={{ color:DARK.text, fontWeight:900, fontSize:22, marginTop:4 }}>
                    {goalMet ? "Ціль досягнута!" : doneToday===0 ? "Починаємо день!" : "Гарний темп!"}
                  </p>
                  {settings.reminderEnabled && (
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:6 }}>
                      <Bell size={12} color={DARK.textDim}/>
                      <p style={{ color:DARK.textDim, fontSize:12 }}>Нагадування о {settings.reminderTime}</p>
                    </div>
                  )}
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ color:"#f97316", fontWeight:900, fontSize:36, lineHeight:1 }}>{doneToday}</p>
                  <p style={{ color:DARK.textDim, fontSize:13 }}>з {settings.dailyGoal}</p>
                </div>
              </div>
              <div style={{ height:8, background:DARK.border, borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:99, background:"linear-gradient(90deg,#f97316,#fbbf24)", width:`${Math.min(progress,100)}%`, transition:"width .5s ease" }} />
              </div>
              <p style={{ color:DARK.textFaint, fontSize:11, marginTop:8, textAlign:"right" }}>{progress}% виконано</p>
            </div>

            {/* Filters */}
            <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
              {[["all","Всі"],["pending","Залишилось"],["done","Виконані"],["streak","Стрік 2+"]].map(([v,l])=>(
                <button key={v} onClick={()=>setFilter(v)} style={b({
                  padding:"8px 16px", borderRadius:11, fontSize:12, fontWeight:700,
                  background:filter===v?"#f97316":DARK.surface,
                  border:`1px solid ${filter===v?"#f07014":DARK.border}`,
                  color:filter===v?"#0c0a09":DARK.textDim,
                })}>{l}</button>
              ))}
            </div>

            {filtered.length===0 ? (
              <div style={{ textAlign:"center", padding:"64px 0" }}>
                <div style={{ width:64, height:64, borderRadius:20, background:DARK.surface, border:`1px solid ${DARK.border}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                  <Leaf size={28} color={DARK.textDim}/>
                </div>
                <p style={{ fontSize:16, fontWeight:700, color:DARK.textDim }}>
                  {filter==="pending"&&goalMet?"Всі виконані!":"Нічого не знайдено"}
                </p>
                <p style={{ fontSize:13, marginTop:6, color:DARK.textFaint }}>
                  {filter==="all"?"Додай свою першу звичку":"Спробуй інший фільтр"}
                </p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {filtered.map((h,i)=>(
                  <div key={h.id} style={{ animation:`fadeUp .3s ease ${i*.05}s both` }}>
                    <HabitCard
                      habit={h} settings={settings}
                      onToggle={day=>handleToggle(h.id,day)}
                      onEdit={()=>setEditHabit(h)}
                      onDelete={()=>setConfirmHabit(h)}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {page==="stats" && <MonthStats habits={habits} />}

        <p style={{ textAlign:"center", color:DARK.textFaint, fontSize:11, marginTop:40, fontWeight:600 }}>
          HabitFlow · {habits.reduce((s,h)=>s+Object.keys(h.completions).length,0)} виконань всього
        </p>
      </main>

      {showForm     && <HabitForm onSave={handleAdd}  onCancel={()=>setShowForm(false)} />}
      {editHabit    && <HabitForm initial={editHabit} onSave={handleEdit} onCancel={()=>setEditHabit(null)} />}
      {showSettings && <SettingsPanel settings={settings} onSave={s=>{ setSettings(s); toast("Налаштування збережено","info"); }} onClose={()=>setShowSettings(false)} />}
      <ConfirmModal open={!!confirmHabit} name={confirmHabit?.name} onConfirm={handleDelete} onCancel={()=>setConfirmHabit(null)} />
      <Toast toasts={toasts} remove={id=>setToasts(p=>p.filter(t=>t.id!==id))} />
    </div>
  );
}