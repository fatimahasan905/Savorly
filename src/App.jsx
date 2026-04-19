import { useState, useEffect, useCallback } from "react";
import { saveProfile, loadProfile, saveMealBank, loadMealBank,
         saveInventory, loadInventory, saveWeeklyPlan, loadWeeklyPlan,
         signUp, signIn, signOut, getUser } from "./lib/supabase.js";

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  g1:"#1B3D2A", g2:"#265C3F", g3:"#3A7D56", g4:"#6DAA85", g5:"#B3D9C0", g6:"#E8F4EC",
  bg:"#F5F0E8", bg2:"#EDE7DA", bg3:"#E0D9CC", card:"#FAF7F2",
  o1:"#9E4A1A", o2:"#C4612A", o3:"#E0884E", o4:"#F5C9A0", o5:"#FDF0E5",
  r1:"#8B2218", r2:"#B83428", r3:"#D96050", r4:"#F2C4BE", r5:"#FEF1EF",
  dk:"#1E2620", md:"#3D4A40", mu:"#7A8578", lt:"#C8D0CA", wh:"#FFFFFF",
  brd:"#D8D2C6",
};

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = {
  home:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
  calendar:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  bookmark:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>,
  box:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  cart:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6"/></svg>,
  sun:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  user:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  settings:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  chef:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 017.41 6a5.11 5.11 0 019.18 0A4 4 0 0118 13.87V21H6v-7.13z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>,
  plus:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  check:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  x:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chevR:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  chevL:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  thumbUp:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>,
  thumbDn:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg>,
  edit:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  refresh:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  warning:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  link:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  video:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  scan:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="4" height="4"/><rect x="17" y="3" width="4" height="4"/><rect x="3" y="17" width="4" height="4"/><line x1="7" y1="5" x2="17" y2="5"/><line x1="19" y1="7" x2="19" y2="17"/><line x1="17" y1="19" x2="7" y2="19"/><line x1="5" y1="17" x2="5" y2="7"/></svg>,
  photo:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  menu:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  clock:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  fire:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c0 0-4.5 6-4.5 10a4.5 4.5 0 009 0c0-1.8-.8-3.4-1.5-4.5C14.5 9.5 13 12 12 12c-1 0-1.5-1-1.5-1S12 2 12 2z"/></svg>,
};

// ─── SHARED ───────────────────────────────────────────────────────────────────
const inp = {width:"100%",padding:"12px 15px",borderRadius:10,border:`1.5px solid ${C.brd}`,fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none",background:C.wh,color:C.dk};
const lbl = {fontSize:11,fontWeight:700,color:C.mu,display:"block",marginBottom:7,textTransform:"uppercase",letterSpacing:"0.8px"};

// Onboarding screen — fits exactly in viewport, content scrolls, button always pinned at bottom
function Screen({children,bg}){return(<div style={{height:"100dvh",background:bg||C.bg,display:"flex",flexDirection:"column",fontFamily:"'DM Sans',sans-serif",maxWidth:430,margin:"0 auto",overflowX:"hidden",overflowY:"hidden"}}>{children}</div>);}
// Scrollable content area for onboarding — use inside Screen above the button
function OBScroll({children}){return(<div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"0 24px 8px"}}>{children}</div>);}
// Pinned bottom button area for onboarding
function OBBtn({children}){return(<div style={{flexShrink:0,padding:"12px 24px 36px",background:"transparent"}}>{children}</div>);}

// Meal type icons — used in daily/weekly plan
const MealIcon={
  breakfast:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  lunch:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
  snack:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  dinner:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  second_snack:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  supper:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
};
function Dots({n,cur}){return(<div style={{display:"flex",gap:5,justifyContent:"center",paddingTop:16}}>{Array.from({length:n}).map((_,i)=>(<div key={i} style={{width:i===cur?22:7,height:7,borderRadius:4,background:i<cur?C.g4:i===cur?C.g2:C.brd,transition:"all 0.3s"}}/>))}</div>);}
function Pill({label,on,toggle,color,bg}){const ac=color||C.g2,abc=bg||C.g6;return(<button onClick={toggle} style={{padding:"8px 14px",borderRadius:20,border:`1.5px solid ${on?ac:C.brd}`,background:on?abc:C.wh,color:on?ac:C.mu,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s"}}>{label}</button>);}
function Tag({label,color}){const c=color||C.g2;return(<span style={{padding:"3px 9px",borderRadius:20,background:c+"22",color:c,fontSize:11,fontWeight:700,flexShrink:0}}>{label}</span>);}
function Hdr({icon,title,sub}){return(<div style={{padding:"14px 24px 8px"}}><div style={{color:C.g3,marginBottom:10,width:28}}>{icon}</div><h2 style={{fontFamily:"'Fraunces',serif",fontSize:25,color:C.dk,marginBottom:5,lineHeight:1.25,fontWeight:700}}>{title}</h2><p style={{color:C.mu,fontSize:13,lineHeight:1.6}}>{sub}</p></div>);}
function Btn({label,onClick,disabled,secondary,small,color}){const bg=disabled?C.lt:secondary?C.card:color||C.g2,tc=disabled?C.wh:secondary?C.md:C.wh;return(<button onClick={onClick} disabled={disabled} style={{width:small?"auto":"100%",padding:small?"9px 18px":"14px",borderRadius:12,border:secondary?`1.5px solid ${C.brd}`:"none",background:bg,color:tc,fontSize:small?13:15,fontWeight:700,cursor:disabled?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"all 0.15s"}}>{label}</button>);}

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const GOALS=[{k:"lose",l:"Lose weight",d:"Calorie deficit"},{k:"maintain",l:"Stay healthy",d:"Maintenance"},{k:"gain",l:"Gain weight",d:"Calorie surplus"},{k:"muscle",l:"Build muscle",d:"High protein"},{k:"glucose",l:"Blood sugar",d:"Low glycaemic"},{k:"heart",l:"Heart health",d:"Low sodium"},{k:"energy",l:"More energy",d:"Balanced macros"},{k:"gut",l:"Gut health",d:"High fibre"}];
const HC=["Type 2 Diabetes","Type 1 Diabetes","High Blood Pressure","High Cholesterol","PCOS","IBS / IBD","Thyroid Disorder","Celiac Disease","Kidney Disease"];
const ALLERGENS=["Gluten","Dairy","Lactose","Eggs","Peanuts","Tree Nuts","Shellfish","Fish","Soy","Sesame","Sulphites","Mustard"];
const SUBS={"Gluten":[{a:"Rice flour",n:"1:1 in most baked goods"},{a:"Oat flour (GF)",n:"Lighter texture"},{a:"Almond flour",n:"Denser, adds fat"}],"Dairy":[{a:"Oat milk",n:"Neutral, froths well"},{a:"Coconut milk",n:"Richer, good in curries"},{a:"Soy milk",n:"Highest protein alt"}],"Lactose":[{a:"Lactose-free milk",n:"Same taste, no reaction"},{a:"Oat milk",n:"Good for cooking"},{a:"Hard cheese",n:"Naturally low lactose"}],"Eggs":[{a:"Flax egg",n:"1 tbsp ground flax + 3 tbsp water"},{a:"Aquafaba",n:"Whipped chickpea water"},{a:"Banana",n:"For baking, adds sweetness"}],"Peanuts":[{a:"Sunflower seed butter",n:"Closest in texture"},{a:"Almond butter",n:"Richer flavour"},{a:"Tahini",n:"Works in sauces"}],"Shellfish":[{a:"King oyster mushrooms",n:"Mimics scallop texture"},{a:"Firm white fish",n:"Similar texture"},{a:"Hearts of palm",n:"Works in ceviche"}],"Fish":[{a:"Tofu",n:"Best marinated and baked"},{a:"Tempeh",n:"Higher protein, firmer"},{a:"Chickpeas",n:"Protein replacement"}],"Soy":[{a:"Coconut aminos",n:"Replaces soy sauce 1:1"},{a:"Chickpeas",n:"Protein replacement"},{a:"Sunflower seed butter",n:"Replaces tofu"}],"Sesame":[{a:"Hemp seeds",n:"Similar nutty flavour"},{a:"Pumpkin seeds",n:"For garnish"},{a:"Sunflower butter",n:"For tahini use"}]};
const CU=["Italian","Japanese","Mexican","Indian","Thai","Mediterranean","Chinese","Middle Eastern","French","Korean","Turkish","Greek","Moroccan","Pakistani","American"];
const BF=["Eggs & toast","Overnight oats","Greek yogurt bowl","Avocado toast","Smoothie bowl","Shakshuka","Pancakes","Granola","Ful Medames","Halloumi wrap","Bircher muesli","Chia pudding"];
const LN=["Caesar salad","Grain bowl","Chicken wrap","Lentil soup","Pasta salad","Sushi bowl","Falafel pita","Tuna sandwich","Roast veg box","Leftovers","Ramen","Niçoise salad"];
const DN=["Grilled chicken","Stir fry","Pasta","Salmon & veg","Lentil dal","Curry","Tacos","Sheet pan veg","Grilled fish","Beef stew","Mujaddara","Butter chicken"];
const HL=["Cilantro","Olives","Blue cheese","Anchovies","Liver","Eggplant","Brussels sprouts","Beetroot","Mushrooms","Bell peppers","Celery","Fennel","Raw onion","Tofu","Lima beans","Okra","Bitter melon","Jackfruit","Cauliflower","Courgette"];
const QUIPS={"Cilantro":"The soap crowd has weighed in. Noted.","Olives":"The Mediterranean is not coming back from this.","Blue cheese":"The mould IS the point. But okay.","Anchovies":"The anchovy lobby will hear about this.","Liver":"Your childhood had consequences.","Eggplant":"The texture enjoyers are grieving. Briefly.","Brussels sprouts":"You just haven't had them roasted properly. Fine.","Beetroot":"The stain AND the taste. A two-front war.","Mushrooms":"Someone wronged you with mushrooms. We're sorry.","Bell peppers":"You said no. We heard you.","Celery":"The crunch that follows you into your dreams.","Fennel":"Aniseed trauma. Clinically valid.","Raw onion":"Cooked is different. I will not push it.","Tofu":"You deserve texture. We fully get it.","Lima beans":"The mealy bean. A reasonable nemesis.","Okra":"It is always about the slime.","Bitter melon":"The bravest answer on this list.","Jackfruit":"Not fooled by the pulled pork thing.","Cauliflower":"Pretending to be rice and pizza did not help.","Courgette":"The vegetable that infiltrates everything uninvited."};
const INV_SEED=[{id:1,name:"Chicken breast",cat:"Protein",qty:"600g",d:2},{id:2,name:"Basmati rice",cat:"Grains",qty:"1.2kg",d:45},{id:3,name:"Eggs",cat:"Protein",qty:"8",d:10},{id:4,name:"Greek yogurt",cat:"Dairy",qty:"400g",d:4},{id:5,name:"Spinach",cat:"Vegetables",qty:"150g",d:3},{id:6,name:"Cherry tomatoes",cat:"Vegetables",qty:"200g",d:6},{id:7,name:"Garlic",cat:"Aromatics",qty:"1 bulb",d:14},{id:8,name:"Olive oil",cat:"Pantry",qty:"400ml",d:60},{id:9,name:"Lemons",cat:"Citrus",qty:"3",d:12},{id:10,name:"Oat milk",cat:"Dairy alt",qty:"800ml",d:4},{id:11,name:"Rolled oats",cat:"Grains",qty:"800g",d:50},{id:12,name:"Chickpeas",cat:"Legumes",qty:"2 cans",d:120},{id:13,name:"Feta cheese",cat:"Dairy",qty:"200g",d:8}];
const MB_SEED=[{id:1,title:"Garlic lemon chicken & rice",time:"25 min",cal:480,prot:42,tag:"High protein",desc:"Pan-seared chicken with basmati rice and wilted spinach.",source:"manual",mealType:"dinner",ingredients:["Chicken breast","Basmati rice","Garlic","Spinach","Olive oil","Lemon"],steps:["Season chicken with garlic, lemon zest, salt, and pepper.","Cook rice according to packet directions.","Sear chicken in olive oil 6 min each side.","Wilt spinach in same pan and serve."]},{id:2,title:"Greek yogurt power bowl",time:"8 min",cal:310,prot:26,tag:"Quick",desc:"Layered oats and yogurt with tomatoes and lemon.",source:"manual",mealType:"breakfast",ingredients:["Greek yogurt","Rolled oats","Cherry tomatoes","Lemon","Feta cheese"],steps:["Layer oats and yogurt.","Scatter halved tomatoes and crumbled feta.","Finish with olive oil and lemon juice."]},{id:3,title:"Chickpea & spinach sauté",time:"18 min",cal:370,prot:18,tag:"Plant-based",desc:"One-pan weeknight staple.",source:"manual",mealType:"lunch",ingredients:["Chickpeas","Spinach","Garlic","Cherry tomatoes","Olive oil","Lemon"],steps:["Sauté garlic in olive oil 1 min.","Add chickpeas and tomatoes, cook 5 min.","Fold in spinach until wilted.","Season with lemon and chilli flakes."]},{id:4,title:"Overnight oats",time:"5 min",cal:340,prot:18,tag:"Meal prep",desc:"Make Sunday, eat all week.",source:"manual",mealType:"breakfast",ingredients:["Rolled oats","Oat milk","Greek yogurt","Honey","Chia seeds"],steps:["Mix oats, milk and yogurt.","Add chia seeds and honey.","Refrigerate overnight."]}];
const DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const GROCERY_ITEMS=[{name:"Smoked salmon",reason:"High-protein breakfast add to your eggs and lemon",tag:"Protein",qty:"150g",est:"$6"},{name:"Tahini",reason:"Unlocks your chickpeas — 3 more dishes instantly",tag:"Pantry unlock",qty:"300g",est:"$5"},{name:"Cherry tomatoes",reason:"You buy these 3× a month and you're nearly out",tag:"Restock",qty:"400g",est:"$4"},{name:"Quinoa",reason:"Rotates with rice for a fuller amino acid profile",tag:"Upgrade",qty:"500g",est:"$5"},{name:"Baby spinach",reason:"Down to 150g — don't let this gap happen mid-week",tag:"Restock",qty:"200g",est:"$3"},{name:"Peanut butter",reason:"No allergy flagged. Strong protein add to morning oats",tag:"New add",qty:"400g",est:"$6"}];

function calcMacros(p){const w=parseFloat(p.weight)||65,h=parseFloat(p.height)||165,a=parseFloat(p.age)||28;const bmr=p.sex==="male"?10*w+6.25*h-5*a+5:10*w+6.25*h-5*a-161;const tdee=bmr*1.55;const cal=(p.goals||[]).includes("lose")?tdee-450:(p.goals||[]).includes("gain")?tdee+400:tdee;const prot=(p.goals||[]).includes("muscle")?Math.round(w*2.2):Math.round(w*1.8);return{calories:Math.round(cal),protein:prot};}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({onComplete}){
  const[mode,setMode]=useState("login");
  const[email,setEmail]=useState("");
  const[password,setPassword]=useState("");
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");
  const submit=async()=>{
    setLoading(true);setError("");
    const fn=mode==="login"?signIn:signUp;
    const{error:err}=await fn(email,password);
    if(err){setError(err.message);setLoading(false);}
    else{onComplete();}
  };
  return(
    <Screen>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"40px 28px"}}>
        <div style={{color:C.g3,marginBottom:14}}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2a9 9 0 00-9 9c0 6 9 13 9 13s9-7 9-13a9 9 0 00-9-9z"/><circle cx="12" cy="10" r="3"/></svg></div>
        <h1 style={{fontFamily:"'Fraunces',serif",fontSize:32,color:C.dk,fontWeight:700,marginBottom:6}}>Savorly</h1>
        <p style={{color:C.mu,fontSize:14,marginBottom:36,lineHeight:1.6}}>{mode==="login"?"Welcome back. Sign in to your kitchen.":"Create your account to get started."}</p>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><label style={lbl}>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" style={inp}/></div>
          <div><label style={lbl}>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={inp}/></div>
          {error&&<p style={{fontSize:12,color:C.r2,fontWeight:600}}>{error}</p>}
          <Btn onClick={submit} disabled={loading||!email||!password} label={loading?"Please wait...":(mode==="login"?"Sign in":"Create account")}/>
          <button onClick={()=>setMode(m=>m==="login"?"signup":"login")} style={{background:"none",border:"none",color:C.g2,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",padding:"4px 0"}}>
            {mode==="login"?"Don't have an account? Sign up →":"Already have an account? Sign in →"}
          </button>
          <div style={{textAlign:"center",color:C.mu,fontSize:11,lineHeight:1.6,padding:"12px 0 0"}}>
            Your data is stored securely in your own account.<br/>We never share or sell it.
          </div>
        </div>
      </div>
    </Screen>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Welcome({go}){return(<div style={{minHeight:"100vh",background:C.g2,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"52px 32px",textAlign:"center",fontFamily:"'DM Sans',sans-serif",maxWidth:430,margin:"0 auto"}}><div style={{width:60,height:60,borderRadius:18,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:26,color:"rgba(255,255,255,0.9)"}}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2a9 9 0 00-9 9c0 6 9 13 9 13s9-7 9-13a9 9 0 00-9-9z"/><circle cx="12" cy="10" r="3"/></svg></div><h1 style={{fontFamily:"'Fraunces',serif",fontSize:44,color:C.wh,marginBottom:8,lineHeight:1.05,fontWeight:700}}>Savorly</h1><p style={{color:"rgba(255,255,255,0.65)",fontSize:15,marginBottom:8,lineHeight:1.6}}>Your personal kitchen intelligence.</p><p style={{color:"rgba(255,255,255,0.4)",fontSize:13,marginBottom:52,lineHeight:1.7}}>Recipes built from what you have.<br/>Macros calibrated to your body.<br/>Zero waste. Zero guesswork.</p><button onClick={go} style={{width:"100%",maxWidth:280,padding:"16px",borderRadius:14,border:"none",background:C.wh,color:C.g2,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Get started →</button><p style={{color:"rgba(255,255,255,0.25)",fontSize:11,marginTop:18}}>3-minute setup · All data saved to your account</p></div>);}

function OB_Name({p,sp,go}){return(<Screen><Dots n={12} cur={0}/><Hdr icon={Icon.user} title="Nice to meet you." sub="Your name and biological sex — for macro calculations only."/><OBScroll><div style={{display:"flex",flexDirection:"column",gap:18,paddingTop:8}}><div><label style={lbl}>First name</label><input value={p.name} onChange={e=>sp({...p,name:e.target.value})} placeholder="What do we call you?" style={inp}/></div><div><label style={lbl}>Biological sex</label><div style={{display:"flex",gap:10}}>{["Male","Female"].map(s=>(<button key={s} onClick={()=>sp({...p,sex:s.toLowerCase()})} style={{flex:1,padding:"14px",borderRadius:12,cursor:"pointer",border:`1.5px solid ${p.sex===s.toLowerCase()?C.g2:C.brd}`,background:p.sex===s.toLowerCase()?C.g6:C.wh,fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:14,color:p.sex===s.toLowerCase()?C.g2:C.md}}>{s}</button>))}</div></div></div></OBScroll><OBBtn><Btn onClick={go} disabled={!p.name||!p.sex}/></OBBtn></Screen>);}

function OB_Body({p,sp,go}){const tog=k=>sp(prev=>{const gs=prev.goals||[];return{...prev,goals:gs.includes(k)?gs.filter(x=>x!==k):[...gs,k]};});return(<Screen><Dots n={12} cur={1}/><Hdr icon={Icon.settings} title={`Alright, ${p.name||"friend"}.`} sub="Body stats for macro targets. Then every goal you're working toward — select all that apply."/><OBScroll><div style={{display:"flex",flexDirection:"column",gap:14,paddingTop:8}}><div style={{display:"flex",gap:10}}>{[["age","Age","28"],["weight","Weight kg","65"],["height","Height cm","165"]].map(([k,l,ph])=>(<div key={k} style={{flex:1}}><label style={lbl}>{l}</label><input type="number" value={p[k]||""} onChange={e=>sp({...p,[k]:e.target.value})} placeholder={ph} style={{...inp,padding:"12px 10px"}}/></div>))}</div><div><label style={{...lbl,marginBottom:12}}>Goals (select all that apply)</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{GOALS.map(g=>{const on=(p.goals||[]).includes(g.k);return(<button key={g.k} onClick={()=>tog(g.k)} style={{padding:"12px",borderRadius:12,textAlign:"left",cursor:"pointer",border:`1.5px solid ${on?C.g2:C.brd}`,background:on?C.g6:C.wh,fontFamily:"'DM Sans',sans-serif"}}><div style={{fontSize:13,fontWeight:700,color:on?C.g2:C.dk}}>{g.l}</div><div style={{fontSize:11,color:C.mu,marginTop:2}}>{g.d}</div></button>);})}</div></div></div></OBScroll><OBBtn><Btn onClick={go} disabled={!p.age||!p.weight||!p.height||!(p.goals||[]).length}/></OBBtn></Screen>);}

function OB_Meals({p,sp,go}){const slots=["Breakfast","Lunch","Snack","Dinner","Second snack","Supper"];const cookDays=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];const togSlot=s=>sp(prev=>{const ms=prev.mealtimes||[];return{...prev,mealtimes:ms.includes(s)?ms.filter(x=>x!==s):[...ms,s]};});const togCook=d=>sp(prev=>{const cd=prev.cookDays||[];return{...prev,cookDays:cd.includes(d)?cd.filter(x=>x!==d):[...cd,d]};});return(<Screen><Dots n={12} cur={2}/><Hdr icon={Icon.sun} title="How do you eat day-to-day?" sub="Select every meal you typically have. Then tell us when you prefer to cook."/><OBScroll><div style={{display:"flex",flexDirection:"column",gap:18,paddingTop:8}}><div><label style={lbl}>Daily meals</label><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{slots.map(s=>(<Pill key={s} label={s} on={(p.mealtimes||[]).includes(s)} toggle={()=>togSlot(s)}/>))}</div></div><div><label style={lbl}>Preferred cook days</label><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{cookDays.map(d=>(<Pill key={d} label={d.slice(0,3)} on={(p.cookDays||[]).includes(d)} toggle={()=>togCook(d)}/>))}</div>{(p.cookDays||[]).length>0&&(<p style={{fontSize:12,color:C.mu,marginTop:8}}>Meal prep batches built for {(p.cookDays||[]).join(" and ")}.</p>)}</div></div></OBScroll><OBBtn><Btn onClick={go} disabled={!(p.mealtimes||[]).length}/></OBBtn></Screen>);}
function OB_Health({h,sh,go}){const tog=c=>sh(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c]);return(<Screen><Dots n={12} cur={3}/><Hdr icon={Icon.warning} title="Any health considerations?" sub="We'll adjust macro guidance and flag relevant ingredients. Skip if none apply."/><OBScroll><div style={{display:"flex",flexDirection:"column",gap:14,paddingTop:8}}><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{HC.map(c=><Pill key={c} label={c} on={h.includes(c)} toggle={()=>tog(c)} color={C.o2} bg={C.o5}/>)}</div>{h.length>0&&(<div style={{padding:"13px 15px",borderRadius:10,background:C.o5,border:`1px solid ${C.o4}`}}><p style={{fontSize:12,color:C.o1,fontWeight:700,lineHeight:1.5}}>Adjusting for: {h.join(", ")}.</p></div>)}</div></OBScroll><OBBtn><Btn onClick={go} label={h.length===0?"None — skip →":"Continue →"}/></OBBtn></Screen>);}
function OB_Macros({p,macros,setMacros,go}){const calc=calcMacros(p);useEffect(()=>{setMacros(calc);},[]);const adj=(k,v)=>setMacros(mx=>({...mx,[k]:Math.max(0,mx[k]+v)}));return(<Screen><Dots n={12} cur={4}/><Hdr icon={Icon.fire} title="Your daily targets." sub="Calculated from your stats and goals. Fine-tune below."/><OBScroll><div style={{display:"flex",flexDirection:"column",gap:14,paddingTop:8}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{[{k:"calories",unit:"kcal",l:"Calories",c:C.o2,bg:C.o5},{k:"protein",unit:"g",l:"Protein",c:C.g2,bg:C.g6}].map(x=>(<div key={x.k} style={{padding:"18px 14px",borderRadius:14,background:x.bg,border:`1.5px solid ${x.c}30`,textAlign:"center"}}><div style={{fontFamily:"'Fraunces',serif",fontSize:36,color:x.c,fontWeight:700}}>{macros[x.k]||calc[x.k]}</div><div style={{fontSize:10,color:C.mu,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginTop:3}}>{x.unit} · {x.l}</div></div>))}</div><div style={{background:C.wh,borderRadius:12,padding:"16px",border:`1.5px solid ${C.brd}`}}>{[{k:"calories",step:50},{k:"protein",step:5}].map(({k,step})=>(<div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}><span style={{fontSize:13,fontWeight:700,color:C.md,textTransform:"capitalize"}}>{k}</span><div style={{display:"flex",alignItems:"center",gap:10}}><button onClick={()=>adj(k,-step)} style={{width:30,height:30,borderRadius:8,border:`1.5px solid ${C.brd}`,background:C.bg,color:C.md,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>−</button><span style={{fontSize:14,fontWeight:700,color:C.dk,minWidth:48,textAlign:"center"}}>{macros[k]||calc[k]}</span><button onClick={()=>adj(k,step)} style={{width:30,height:30,borderRadius:8,border:`1.5px solid ${C.brd}`,background:C.bg,color:C.md,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>+</button></div></div>))}</div></div></OBScroll><OBBtn><Btn onClick={go} label="Looks good →"/></OBBtn></Screen>);}
function OB_Allergens({al,sal,go}){const tog=a=>sal(p=>p.includes(a)?p.filter(x=>x!==a):[...p,a]);return(<Screen><Dots n={12} cur={5}/><Hdr icon={Icon.warning} title="Allergies or intolerances?" sub="Including lactose. Permanently excluded from every recipe and shopping suggestion."/><OBScroll><div style={{display:"flex",flexDirection:"column",gap:14,paddingTop:8}}><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{ALLERGENS.map(a=><Pill key={a} label={a} on={al.includes(a)} toggle={()=>tog(a)} color={C.r2} bg={C.r5}/>)}</div>{al.length>0&&(<div style={{padding:"13px 15px",borderRadius:10,background:C.r5,border:`1px solid ${C.r4}`}}><p style={{fontSize:12,color:C.r1,fontWeight:700}}>Permanently excluded: {al.join(", ")}.</p></div>)}</div></OBScroll><OBBtn><Btn onClick={go} label={al.length===0?"No allergies — skip →":"Continue →"}/></OBBtn></Screen>);}
function OB_Subs({al,go}){const[sel,setSel]=useState({});const togSub=(allergen,sub)=>setSel(p=>({...p,[allergen]:p[allergen]===sub.a?null:sub.a}));const relevant=al.filter(a=>SUBS[a]);return(<Screen><Dots n={12} cur={6}/><Hdr icon={Icon.refresh} title="Your substitutes." sub="Pick your preferred swap per allergen."/><OBScroll><div style={{display:"flex",flexDirection:"column",gap:18,paddingTop:8}}>{relevant.length===0?(<div style={{padding:"24px",borderRadius:12,background:C.g6,textAlign:"center"}}><p style={{fontSize:14,color:C.g1,fontWeight:700}}>No substitutes needed.</p></div>):relevant.map(allergen=>(<div key={allergen}><p style={{fontSize:11,fontWeight:700,color:C.mu,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:10}}>Instead of {allergen}</p><div style={{display:"flex",flexDirection:"column",gap:8}}>{SUBS[allergen].map(sub=>{const on=sel[allergen]===sub.a;return(<button key={sub.a} onClick={()=>togSub(allergen,sub)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",borderRadius:12,cursor:"pointer",border:`1.5px solid ${on?C.g2:C.brd}`,background:on?C.g6:C.wh,fontFamily:"'DM Sans',sans-serif",textAlign:"left"}}><div><p style={{fontSize:13,fontWeight:700,color:on?C.g2:C.dk}}>{sub.a}</p><p style={{fontSize:11,color:C.mu,marginTop:2}}>{sub.n}</p></div>{on&&<div style={{color:C.g3}}>{Icon.check}</div>}</button>);})}</div></div>))}</div></OBScroll><OBBtn><Btn onClick={go} label="Continue →"/></OBBtn></Screen>);}
function OB_Cuisines({cu,scu,go}){const tog=c=>scu(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c]);return(<Screen><Dots n={12} cur={7}/><Hdr icon={Icon.bookmark} title="What cuisines do you love?" sub="Pick as many as you want."/><OBScroll><div style={{paddingTop:8}}><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{CU.map(c=><Pill key={c} label={c} on={cu.includes(c)} toggle={()=>tog(c)}/>)}</div></div></OBScroll><OBBtn><Btn onClick={go} disabled={cu.length===0} label={cu.length>0?`${cu.length} selected →`:"Pick at least one →"}/></OBBtn></Screen>);}
function OB_Faves({meals,setMeals,go}){const tog=(cat,item)=>setMeals(m=>({...m,[cat]:m[cat].includes(item)?m[cat].filter(x=>x!==item):[...m[cat],item]}));return(<Screen><Dots n={12} cur={8}/><Hdr icon={Icon.chef} title="What do you usually eat?" sub="Tap anything you've made or genuinely enjoyed."/><OBScroll><div style={{display:"flex",flexDirection:"column",gap:20,paddingTop:8}}>{[{key:"breakfast",l:"Breakfasts",data:BF},{key:"lunch",l:"Lunches",data:LN},{key:"dinner",l:"Dinners",data:DN}].map(s=>(<div key={s.key}><p style={{fontSize:11,fontWeight:700,color:C.mu,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.7px"}}>{s.l}</p><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{s.data.map(item=><Pill key={item} label={item} on={meals[s.key].includes(item)} toggle={()=>tog(s.key,item)}/>)}</div></div>))}</div></OBScroll><OBBtn><Btn onClick={go} label="These are mine →"/></OBBtn></Screen>);}
function OB_Confess({dis,sdis,go}){const[quip,setQuip]=useState("");const[custom,setCustom]=useState("");const tog=item=>{if(!dis.includes(item))setQuip(QUIPS[item]||"Noted. Gone.");sdis(p=>p.includes(item)?p.filter(x=>x!==item):[...p,item]);};const addCustom=()=>{if(custom.trim()&&!dis.includes(custom.trim())){sdis(p=>[...p,custom.trim()]);setQuip(`${custom.trim()} — banished. No questions asked.`);setCustom("");}};return(<Screen><Dots n={12} cur={9}/><div style={{padding:"14px 24px 8px",flexShrink:0}}><div style={{color:C.r2,marginBottom:10}}>{Icon.x}</div><h2 style={{fontFamily:"'Fraunces',serif",fontSize:25,color:C.dk,marginBottom:5,fontWeight:700}}>The Confession Booth.</h2><p style={{color:C.mu,fontSize:13,lineHeight:1.6}}>Tell us what has personally wronged you. We will not judge. (Much.)</p></div>{quip&&(<div style={{margin:"0 24px 8px",padding:"11px 14px",borderRadius:10,background:C.g6,border:`1px solid ${C.g5}`,flexShrink:0}}><p style={{fontSize:13,color:C.g1,fontWeight:700,fontStyle:"italic"}}>{quip}</p></div>)}<OBScroll><div style={{display:"flex",flexDirection:"column",gap:14,paddingTop:4}}><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{HL.map(item=>(<button key={item} onClick={()=>tog(item)} style={{padding:"8px 14px",borderRadius:20,border:`1.5px solid ${dis.includes(item)?C.r2:C.brd}`,background:dis.includes(item)?C.r5:C.wh,color:dis.includes(item)?C.r1:C.mu,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s",textDecoration:dis.includes(item)?"line-through":"none"}}>{item}</button>))}</div><div style={{display:"flex",gap:8}}><input value={custom} onChange={e=>setCustom(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCustom()} placeholder="Add your own nemesis ingredient..." style={{...inp,flex:1}}/><button onClick={addCustom} style={{padding:"10px 14px",borderRadius:10,border:"none",background:C.g2,color:C.wh,cursor:"pointer",display:"flex",alignItems:"center"}}>{Icon.plus}</button></div>{dis.length>0&&(<p style={{fontSize:12,color:C.mu}}>Blacklisted: {dis.slice(0,5).join(", ")}{dis.length>5?` + ${dis.length-5} more`:""}</p>)}</div></OBScroll><OBBtn><Btn onClick={go} label={dis.length===0?"I eat everything → (respect)":`Banish these ${dis.length} →`}/></OBBtn></Screen>);}
function OB_Inventory({inv,sinv,go}){
  const[phase,setPhase]=useState("idle");
  const[items,setItems]=useState(inv.length?inv:[]);
  const[newName,setNewName]=useState("");
  const[newQty,setNewQty]=useState("");
  const[newCat,setNewCat]=useState("Vegetables");
  const CATS=["Vegetables","Protein","Dairy","Grains","Legumes","Pantry","Citrus","Aromatics","Dairy alt","Other"];
  const scan=()=>{setPhase("scanning");setTimeout(()=>{const merged=[...items,...INV_SEED.filter(s=>!items.find(i=>i.name===s.name))];setItems(merged);sinv(merged);setPhase("done");},2200);};
  const addItem=()=>{
    if(!newName.trim())return;
    const item={id:Date.now(),name:newName.trim(),cat:newCat,qty:newQty.trim()||"1 unit",d:14};
    const updated=[...items,item];setItems(updated);sinv(updated);
    setNewName("");setNewQty("");
  };
  const removeItem=(id)=>{const updated=items.filter(i=>i.id!==id);setItems(updated);sinv(updated);};
  return(
    <Screen>
      <Dots n={12} cur={10}/>
      <Hdr icon={Icon.scan} title="What's in your kitchen?" sub="Scan with your camera or add items yourself. Every recipe uses only what you have."/>
      <OBScroll>
        <div style={{display:"flex",flexDirection:"column",gap:12,paddingTop:8}}>
          {phase==="idle"&&(
            <>
              <div onClick={scan} style={{border:`1.5px dashed ${C.brd}`,borderRadius:14,padding:"20px",display:"flex",flexDirection:"column",alignItems:"center",gap:8,background:C.wh,cursor:"pointer"}}>
                <div style={{color:C.g3}}>{Icon.scan}</div>
                <p style={{fontSize:14,fontWeight:700,color:C.dk}}>Scan your kitchen</p>
                <p style={{fontSize:12,color:C.mu,textAlign:"center",lineHeight:1.6}}>AI identifies items, quantities, and freshness from photos.</p>
                <span style={{padding:"8px 18px",borderRadius:20,background:C.g2,color:C.wh,fontSize:13,fontWeight:700}}>Open camera</span>
              </div>
              <div style={{textAlign:"center",fontSize:12,color:C.mu}}>— or add manually —</div>
            </>
          )}
          {phase==="scanning"&&(
            <div style={{padding:"28px 24px",borderRadius:14,background:C.g6,border:`1.5px solid ${C.g5}`,textAlign:"center"}}>
              <div style={{color:C.g3,marginBottom:10,display:"inline-block",animation:"spin 1.2s linear infinite"}}>{Icon.refresh}</div>
              <p style={{fontSize:14,fontWeight:700,color:C.g1}}>Scanning kitchen...</p>
            </div>
          )}
          {/* Manual add form — always visible once scan is done or if idle */}
          {phase!=="scanning"&&(
            <div style={{background:C.wh,borderRadius:14,padding:"14px",border:`1.5px solid ${C.brd}`}}>
              <p style={{fontSize:11,fontWeight:700,color:C.mu,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:12}}>Add an item</p>
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                <input value={newName} onChange={e=>setNewName(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&addItem()}
                  placeholder="Item name e.g. Chicken breast" style={inp}/>
                <div style={{display:"flex",gap:8}}>
                  <input value={newQty} onChange={e=>setNewQty(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&addItem()}
                    placeholder="Qty e.g. 500g" style={{...inp,flex:1}}/>
                  <select value={newCat} onChange={e=>setNewCat(e.target.value)}
                    style={{...inp,flex:1,cursor:"pointer"}}>
                    {CATS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <button onClick={addItem} style={{padding:"11px",borderRadius:10,border:"none",
                  background:newName.trim()?C.g2:C.lt,color:C.wh,fontSize:13,fontWeight:700,
                  cursor:newName.trim()?"pointer":"not-allowed",fontFamily:"'DM Sans',sans-serif",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                  {Icon.plus} Add to kitchen
                </button>
              </div>
            </div>
          )}
          {items.length>0&&(
            <>
              <div style={{padding:"10px 14px",borderRadius:10,background:C.g6,border:`1px solid ${C.g5}`}}>
                <p style={{fontSize:12,color:C.g1,fontWeight:700}}>{items.length} item{items.length!==1?"s":""} in your kitchen</p>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {items.map(item=>{
                  const col=item.d<=3?C.r2:item.d<=7?C.o2:C.g2;
                  return(
                    <div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                      padding:"10px 12px",borderRadius:10,background:C.wh,borderLeft:`3px solid ${col}`}}>
                      <div>
                        <p style={{fontSize:13,fontWeight:700,color:C.dk}}>{item.name}</p>
                        <p style={{fontSize:11,color:C.mu}}>{item.cat} · {item.qty}</p>
                      </div>
                      <button onClick={()=>removeItem(item.id)} style={{background:"none",border:"none",
                        color:C.r2,cursor:"pointer",padding:"4px",display:"flex"}}>
                        {Icon.x}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </OBScroll>
      <OBBtn>
        <Btn onClick={go} disabled={phase==="scanning"}
          label={items.length>0?`${items.length} items confirmed →`:"Skip for now →"}/>
      </OBBtn>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </Screen>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const TABS=[{k:"home",l:"Home",icon:Icon.home},{k:"plan",l:"Plan",icon:Icon.calendar},{k:"mealbank",l:"Meals",icon:Icon.bookmark},{k:"kitchen",l:"Kitchen",icon:Icon.box},{k:"shop",l:"Shop",icon:Icon.cart}];
const SIDEBAR=[{k:"home",l:"Home",icon:Icon.home},{k:"plan",l:"Weekly Plan",icon:Icon.calendar},{k:"daily",l:"Daily Plan",icon:Icon.sun},{k:"mealbank",l:"Meal Bank",icon:Icon.bookmark},{k:"kitchen",l:"Inventory",icon:Icon.box},{k:"shop",l:"Grocery List",icon:Icon.cart},{k:"profile",l:"Profile",icon:Icon.user},{k:"settings",l:"Settings",icon:Icon.settings}];
const TABLABELS={home:"Home",plan:"Weekly Plan",daily:"Daily Plan",mealbank:"Meal Bank",kitchen:"Inventory",shop:"Grocery List",profile:"Profile",settings:"Settings"};

function MainApp({profile,macros,inv,mealbank,setMealbank,weeklyPlan,setWeeklyPlan,onSignOut}){
  const[tab,setTab]=useState("home");
  const[sidebar,setSidebar]=useState(false);
  const mealtimes=profile.mealtimes||["Breakfast","Lunch","Dinner"];
  const cookDays=profile.cookDays||["Sunday","Wednesday"];

  // Auto-save meal bank changes to Supabase/localStorage
  const updateMealBank=useCallback(async(fn)=>{
    setMealbank(prev=>{const next=typeof fn==="function"?fn(prev):fn;saveMealBank(next);return next;});
  },[]);

  const updateWeeklyPlan=useCallback(async(fn)=>{
    setWeeklyPlan(prev=>{const next=typeof fn==="function"?fn(prev):fn;saveWeeklyPlan(next);return next;});
  },[]);

  // ── RECIPE GENERATION via our secure API route ──
  const generateRecipes=async()=>{
    // Pull the last 14 recipe titles from the meal bank to tell the AI what NOT to repeat
    const recentTitles = mealbank.slice(-14).map(r=>r.title).filter(Boolean);
    // Random seed forces a different creative direction every call
    const sessionSeed = Math.random().toString(36).slice(2,10);
    // Save seed to localStorage so rapid re-taps still get variety
    localStorage.setItem('savorly_last_seed', sessionSeed);
    const res=await fetch("/api/generate-recipes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      inventory:inv,
      macros,
      cuisines:profile.cuisines||[],
      allergens:profile.allergens||[],
      dislikes:profile.dislikes||[],
      goals:profile.goals||[],
      recentTitles,
      sessionSeed,
    })});
    if(!res.ok)throw new Error("Generation failed");
    const{recipes}=await res.json();
    return recipes;
  };

  // ── RECIPE URL PARSING via our secure API route ──
  const parseRecipeUrl=async(url)=>{
    const res=await fetch("/api/parse-recipe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url})});
    if(!res.ok)throw new Error("Parse failed");
    const{recipe}=await res.json();
    return recipe;
  };

  function HomeTab(){
    const urgent=inv.filter(i=>i.d<=3);
    return(<div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{background:C.g2,borderRadius:16,padding:"20px",color:C.wh}}>
        <p style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.7px",color:"rgba(255,255,255,0.55)",marginBottom:4}}>Good morning</p>
        <h2 style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:700,marginBottom:16}}>{profile.name||"Friend"}</h2>
        {[{l:"Calories",v:0,max:macros.calories,u:"kcal"},{l:"Protein",v:0,max:macros.protein,u:"g"}].map(m=>(<div key={m.l} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.7)"}}>{m.l}</span><span style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.85)"}}>0 / {m.max}{m.u}</span></div><div style={{height:7,borderRadius:4,background:"rgba(255,255,255,0.15)"}}><div style={{height:"100%",borderRadius:4,background:"rgba(255,255,255,0.7)",width:"0%"}}/></div></div>))}
      </div>
      {urgent.length>0&&(<div style={{padding:"13px 15px",borderRadius:12,background:C.r5,border:`1.5px solid ${C.r4}`,display:"flex",gap:12}}><div style={{color:C.r2,flexShrink:0,marginTop:1}}>{Icon.warning}</div><div><p style={{fontSize:13,fontWeight:700,color:C.r1,marginBottom:2}}>Use these today</p><p style={{fontSize:12,color:C.r2,lineHeight:1.5}}>{urgent.map(i=>i.name).join(", ")}</p></div></div>)}
      <div style={{background:C.wh,borderRadius:14,padding:"16px",border:`1.5px solid ${C.brd}`}}>
        <p style={{fontSize:11,fontWeight:700,color:C.mu,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:10}}>Tonight's suggestion</p>
        <h3 style={{fontFamily:"'Fraunces',serif",fontSize:17,color:C.dk,fontWeight:700,marginBottom:8}}>{mealbank[0]?.title||"Generate your first recipe"}</h3>
        <div style={{display:"flex",gap:12,marginBottom:12}}><span style={{fontSize:12,color:C.mu,display:"flex",alignItems:"center",gap:4}}><span style={{color:C.g3}}>{Icon.clock}</span>{mealbank[0]?.time||"—"}</span><span style={{fontSize:12,color:C.mu,display:"flex",alignItems:"center",gap:4}}><span style={{color:C.o2}}>{Icon.fire}</span>{mealbank[0]?.cal||"—"} kcal</span></div>
        <button onClick={()=>setTab("mealbank")} style={{padding:"9px 18px",borderRadius:20,border:`1.5px solid ${C.g4}`,background:C.g6,color:C.g2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Open Meal Bank →</button>
      </div>
      <div style={{background:C.wh,borderRadius:14,padding:"16px",border:`1.5px solid ${C.brd}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><p style={{fontSize:11,fontWeight:700,color:C.mu,textTransform:"uppercase",letterSpacing:"0.7px"}}>Kitchen snapshot</p><span style={{fontSize:12,color:C.g2,fontWeight:700}}>{inv.length} items</span></div>
        {inv.slice(0,5).map(item=>{const col=item.d<=3?C.r2:item.d<=7?C.o2:C.g2;return(<div key={item.id} style={{display:"flex",justifyContent:"space-between",paddingBottom:9,borderBottom:`1px solid ${C.bg3}`,marginBottom:9}}><div style={{display:"flex",gap:8,alignItems:"center"}}><div style={{width:7,height:7,borderRadius:"50%",background:col,flexShrink:0}}/><span style={{fontSize:13,color:C.dk,fontWeight:600}}>{item.name}</span></div><span style={{fontSize:11,color:col,fontWeight:700}}>{item.d<=3?"Urgent":item.d<=7?`${item.d}d left`:item.qty}</span></div>);})}
      </div>
    </div>);
  }

  // ── MEAL PLANNING RULES ENGINE ──────────────────────────────────────────────
  // Rule 1: Daily calories must be within ±50 of target
  // Rule 2: Daily protein must be ≥ target and ≤ target + 5g
  // Rule 3: Dinners rotate through chicken / beef / fish / vegetables each week
  // Rule 4: No recipe repeats more than 2× in a week or 2× in a month

  const DINNER_ROTATION = ["chicken","beef","fish","vegetables"];
  const getDinnerProteinType = (title="") => {
    const t = title.toLowerCase();
    if(t.includes("chicken")||t.includes("poultry")||t.includes("turkey")) return "chicken";
    if(t.includes("beef")||t.includes("steak")||t.includes("lamb")||t.includes("pork")||t.includes("mince")) return "beef";
    if(t.includes("salmon")||t.includes("fish")||t.includes("tuna")||t.includes("cod")||t.includes("shrimp")||t.includes("prawn")||t.includes("seafood")) return "fish";
    return "vegetables";
  };

  const validateDay = (dayRecipes) => {
    const allRecs = dayRecipes.filter(Boolean);
    const totCal = allRecs.reduce((s,r)=>s+(r?.cal||0),0);
    const totProt = allRecs.reduce((s,r)=>s+(r?.prot||0),0);
    const calOk = totCal===0 || (totCal >= macros.calories-50 && totCal <= macros.calories+50);
    const protOk = totProt===0 || (totProt >= macros.protein && totProt <= macros.protein+5);
    return { calOk, protOk, totCal, totProt };
  };

  const validateWeekRepeat = (plan) => {
    // Count recipe usage across the week
    const counts = {};
    DAYS.forEach(d=>{
      Object.values(plan[d]||{}).forEach(entry=>{
        if(entry?.recipe?.id){
          counts[entry.recipe.id]=(counts[entry.recipe.id]||0)+1;
        }
      });
    });
    return counts; // id -> count, flag any > 2
  };

  const validateDinnerRotation = (plan) => {
    // Check dinners across the week have variety
    const dinnerTypes = DAYS.map(d=>{
      const dinnerSlot = Object.entries(plan[d]||{}).find(([s])=>s.includes("dinner"));
      return dinnerSlot?.[1]?.recipe ? getDinnerProteinType(dinnerSlot[1].recipe.title) : null;
    }).filter(Boolean);
    const counts = {};
    dinnerTypes.forEach(t=>counts[t]=(counts[t]||0)+1);
    return counts; // type -> count, ideal is ≤2 of same type in a week
  };

  // Smart Fill: auto-assign recipes following all rules
  const smartFillWeek = (currentPlan) => {
    const mealSlotsForUser=(mealtimes||["Breakfast","Lunch","Dinner"]).map(m=>m.toLowerCase().replace(/ /g,"_"));
    const newPlan = JSON.parse(JSON.stringify(currentPlan));
    const weekUsage = {}; // recipeId -> count this week
    const dinnerTypeUsage = {}; // type -> count this week

    DAYS.forEach((day,dayIdx)=>{
      const daySlots = mealSlotsForUser;
      const assignedIds = [];

      daySlots.forEach(slot=>{
        const mealType = slot.includes("breakfast")?"breakfast":slot.includes("lunch")?"lunch":slot.includes("dinner")?"dinner":"snack";
        const isDinner = slot.includes("dinner");

        // Find best recipe for this slot
        const candidates = mealbank
          .filter(r=>r.mealType===mealType)
          .filter(r=>(weekUsage[r.id]||0)<2) // not used 2x this week
          .filter(r=>!assignedIds.includes(r.id)); // not already used today

        let chosen = null;

        if(isDinner && candidates.length>0){
          // Try to use the rotation type for this day
          const targetType = DINNER_ROTATION[dayIdx % DINNER_ROTATION.length];
          const rotationMatch = candidates.filter(r=>getDinnerProteinType(r.title)===targetType);
          // Prefer rotation match, but also prefer types not overused this week
          const notOverused = candidates.filter(r=>(dinnerTypeUsage[getDinnerProteinType(r.title)]||0)<2);
          chosen = rotationMatch[0] || notOverused[0] || candidates[0];
        } else {
          chosen = candidates[0] || mealbank.find(r=>r.mealType===mealType);
        }

        if(chosen){
          newPlan[day] = newPlan[day]||{};
          newPlan[day][slot] = {...(newPlan[day][slot]||{}), recipe:chosen, rating:null, confirmed:null};
          weekUsage[chosen.id] = (weekUsage[chosen.id]||0)+1;
          assignedIds.push(chosen.id);
          if(isDinner) dinnerTypeUsage[getDinnerProteinType(chosen.title)] = (dinnerTypeUsage[getDinnerProteinType(chosen.title)]||0)+1;
        }
      });
    });
    return newPlan;
  };

  function WeeklyPlanTab(){
    const mealSlotsForUser=(mealtimes||["Breakfast","Lunch","Dinner"]).map(m=>m.toLowerCase().replace(/ /g,"_"));
    const mealLabel={breakfast:"Breakfast",lunch:"Lunch",snack:"Snack",dinner:"Dinner",second_snack:"Snack 2",supper:"Supper"};
    const mealIcon=(slot)=>MealIcon[slot]||MealIcon[slot.split("_")[0]]||null;
    const[plan,setPlanLocal]=useState(()=>{
      if(weeklyPlan&&Object.keys(weeklyPlan).length)return weeklyPlan;
      const p={};DAYS.forEach(d=>{p[d]={};mealSlotsForUser.forEach(s=>{const mt=s.includes("breakfast")?"breakfast":s.includes("lunch")?"lunch":s.includes("dinner")?"dinner":"snack";p[d][s]={recipe:mealbank.find(r=>r.mealType===mt)||null,rating:null,confirmed:null};});});return p;
    });
    const[adding,setAdding]=useState(null);
    const setLocal=(fn)=>{setPlanLocal(p=>{const n=typeof fn==="function"?fn(p):fn;updateWeeklyPlan(n);return n;});};
    const setRating=(d,s,r)=>setLocal(p=>({...p,[d]:{...p[d],[s]:{...p[d][s],rating:r}}}));
    const setConf=(d,s,v)=>setLocal(p=>({...p,[d]:{...p[d],[s]:{...p[d][s],confirmed:v}}}));
    const assign=(d,s,rec)=>{setLocal(p=>({...p,[d]:{...p[d],[s]:{...p[d][s],recipe:rec}}}));setAdding(null);};
    const doSmartFill=()=>setLocal(p=>smartFillWeek(p));

    // Compute rule violations
    const weekRepeatCounts = validateWeekRepeat(plan);
    const dinnerTypes = validateDinnerRotation(plan);

    // Warnings summary
    const repeatViolations = Object.entries(weekRepeatCounts).filter(([,c])=>c>2).length;
    const dominantDinner = Object.entries(dinnerTypes).find(([,c])=>c>2);

    if(adding)return(
      <div style={{padding:"0 20px 32px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 0"}}>
          <button onClick={()=>setAdding(null)} style={{background:"none",border:"none",color:C.g2,cursor:"pointer",display:"flex"}}>{Icon.chevL}</button>
          <h3 style={{fontFamily:"'Fraunces',serif",fontSize:18,color:C.dk,fontWeight:700}}>Pick from Meal Bank</h3>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {mealbank.map(r=>{
            const weekCount=weekRepeatCounts[r.id]||0;
            const tooManyThisWeek=weekCount>=2;
            return(
              <div key={r.id} onClick={()=>!tooManyThisWeek&&assign(adding.day,adding.slot,r)} style={{padding:"13px 14px",borderRadius:12,background:tooManyThisWeek?C.bg2:C.wh,cursor:tooManyThisWeek?"not-allowed":"pointer",border:`1.5px solid ${tooManyThisWeek?C.brd:C.g4}`,display:"flex",justifyContent:"space-between",alignItems:"center",opacity:tooManyThisWeek?0.5:1}}>
                <div>
                  <p style={{fontSize:14,fontWeight:700,color:C.dk}}>{r.title}</p>
                  <p style={{fontSize:11,color:C.mu,marginTop:2}}>{r.time} · {r.cal} kcal · {r.prot}g protein</p>
                  {tooManyThisWeek&&<p style={{fontSize:11,color:C.r2,fontWeight:700,marginTop:2}}>Used {weekCount}× this week — max reached</p>}
                </div>
                {!tooManyThisWeek&&<div style={{color:C.lt}}>{Icon.chevR}</div>}
              </div>
            );
          })}
        </div>
      </div>
    );

    return(
      <div style={{padding:"14px 20px 32px",display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <h3 style={{fontFamily:"'Fraunces',serif",fontSize:20,color:C.dk,fontWeight:700}}>Weekly Plan</h3>
            <p style={{fontSize:12,color:C.mu,marginTop:2}}>Rate · confirm · track rules</p>
          </div>
          <button onClick={doSmartFill} style={{padding:"8px 14px",borderRadius:20,border:"none",background:C.g2,color:C.wh,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6}}>{Icon.refresh} Smart fill</button>
        </div>

        {/* Rules summary bar */}
        <div style={{background:C.wh,borderRadius:12,padding:"12px 14px",border:`1.5px solid ${C.brd}`,display:"flex",flexDirection:"column",gap:8}}>
          <p style={{fontSize:11,fontWeight:800,color:C.mu,textTransform:"uppercase",letterSpacing:"0.7px"}}>Weekly rules</p>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {[
              {label:"Dinner variety",ok:!dominantDinner,msg:dominantDinner?`Too much ${dominantDinner[0]} — aim to rotate chicken · beef · fish · veg`:"Chicken · beef · fish · veg rotation on track"},
              {label:"No repeat meals",ok:repeatViolations===0,msg:repeatViolations>0?`${repeatViolations} recipe${repeatViolations>1?"s":""} used more than twice this week`:"No recipe used more than twice"},
            ].map((r,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                <div style={{width:16,height:16,borderRadius:"50%",background:r.ok?C.g2:C.r2,flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{color:C.wh,fontSize:10,fontWeight:800}}>{r.ok?"✓":"!"}</span>
                </div>
                <p style={{fontSize:12,color:r.ok?C.g1:C.r1,fontWeight:r.ok?500:700,lineHeight:1.4}}>{r.msg}</p>
              </div>
            ))}
          </div>
        </div>

        {DAYS.map((day,dayIdx)=>{
          // Compute daily macro totals for this day
          const dayRecipes = mealSlotsForUser.map(s=>plan[day]?.[s]?.recipe).filter(Boolean);
          const {calOk,protOk,totCal,totProt} = validateDay(dayRecipes);
          const hasRecipes = dayRecipes.length>0;
          const dayBorderCol = hasRecipes&&(!calOk||!protOk)?C.r3:hasRecipes&&calOk&&protOk?C.g4:C.brd;

          return(
            <div key={day} style={{background:C.wh,borderRadius:14,overflow:"hidden",border:`1.5px solid ${dayBorderCol}`}}>
              <div style={{padding:"9px 14px",background:C.bg2,borderBottom:`1px solid ${C.brd}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <p style={{fontSize:11,fontWeight:800,color:C.md,textTransform:"uppercase",letterSpacing:"0.7px"}}>{day}</p>
                {hasRecipes&&(
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:10,fontWeight:700,color:calOk?C.g2:C.r2}}>{totCal} kcal {calOk?"✓":"⚠"}</span>
                    <span style={{fontSize:10,fontWeight:700,color:protOk?C.g2:C.r2}}>{totProt}g prot {protOk?"✓":"⚠"}</span>
                  </div>
                )}
              </div>

              {/* Day-level macro warnings */}
              {hasRecipes&&(!calOk||!protOk)&&(
                <div style={{padding:"8px 14px",background:C.r5,borderBottom:`1px solid ${C.r4}`}}>
                  {!calOk&&<p style={{fontSize:11,color:C.r1,fontWeight:700}}>{totCal<macros.calories-50?`⬇ ${macros.calories-totCal} kcal under target — add a snack`:`⬆ ${totCal-macros.calories} kcal over target — swap a meal`}</p>}
                  {!protOk&&<p style={{fontSize:11,color:C.r1,fontWeight:700,marginTop:2}}>{totProt<macros.protein?`⬇ ${macros.protein-totProt}g protein short — add a high-protein meal`:`⬆ ${totProt-macros.protein-5}g over protein max — swap a meal`}</p>}
                </div>
              )}
              {hasRecipes&&calOk&&protOk&&(
                <div style={{padding:"6px 14px",background:C.g6,borderBottom:`1px solid ${C.g5}`}}>
                  <p style={{fontSize:11,color:C.g1,fontWeight:700}}>Day on target — {totCal} kcal · {totProt}g protein</p>
                </div>
              )}

              {mealSlotsForUser.map((slot,si)=>{
                const entry=plan[day]?.[slot];const rec=entry?.recipe;const conf=entry?.confirmed;const rat=entry?.rating;
                const repeatCount=rec?weekRepeatCounts[rec.id]||0:0;
                const isOverRepeat=repeatCount>2;
                const isDinnerSlot=slot.includes("dinner");
                const dinnerType=rec&&isDinnerSlot?getDinnerProteinType(rec.title):null;
                const dinnerTypeColor={chicken:C.o2,beef:C.r2,fish:C.g2,vegetables:C.g3}[dinnerType]||C.mu;

                return(
                  <div key={slot} style={{padding:"10px 14px",borderBottom:si<mealSlotsForUser.length-1?`1px solid ${C.bg3}`:"none",background:conf===true?C.g6:conf===false?C.r5:isOverRepeat?"#FFF8F0":"transparent"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
                          <span style={{color:C.mu,display:"flex",flexShrink:0}}>{mealIcon(slot)}</span>
                          <p style={{fontSize:10,fontWeight:700,color:C.mu,textTransform:"uppercase",letterSpacing:"0.6px"}}>{mealLabel[slot]||slot}</p>
                          {dinnerType&&<Tag label={dinnerType} color={dinnerTypeColor}/>}
                          {isOverRepeat&&<Tag label="Repeat ×3" color={C.r2}/>}
                        </div>
                        {rec?(<p style={{fontSize:13,fontWeight:700,color:isOverRepeat?C.r1:C.dk,lineHeight:1.3}}>{rec.title}</p>):(<button onClick={()=>setAdding({day,slot})} style={{fontSize:12,color:C.g2,fontWeight:700,background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",padding:0,display:"flex",alignItems:"center",gap:5}}>{Icon.plus} Add meal</button>)}
                      </div>
                      {rec&&(
                        <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0,marginLeft:10}}>
                          <button onClick={()=>setRating(day,slot,"up")} style={{width:28,height:28,borderRadius:8,border:`1.5px solid ${rat==="up"?C.g2:C.brd}`,background:rat==="up"?C.g6:"transparent",color:rat==="up"?C.g2:C.mu,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{Icon.thumbUp}</button>
                          <button onClick={()=>setRating(day,slot,"down")} style={{width:28,height:28,borderRadius:8,border:`1.5px solid ${rat==="down"?C.r2:C.brd}`,background:rat==="down"?C.r5:"transparent",color:rat==="down"?C.r2:C.mu,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{Icon.thumbDn}</button>
                        </div>
                      )}
                    </div>
                    {rec&&(
                      <div style={{display:"flex",gap:8,marginTop:8,alignItems:"center"}}>
                        <span style={{fontSize:11,color:C.mu}}>{rec.time} · {rec.cal}kcal · {rec.prot}g</span>
                        <div style={{flex:1}}/>
                        <span style={{fontSize:11,color:C.mu,fontWeight:600}}>Made it?</span>
                        <button onClick={()=>setConf(day,slot,true)} style={{padding:"3px 9px",borderRadius:12,border:`1.5px solid ${conf===true?C.g2:C.brd}`,background:conf===true?C.g2:"transparent",color:conf===true?C.wh:C.mu,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Yes</button>
                        <button onClick={()=>setConf(day,slot,false)} style={{padding:"3px 9px",borderRadius:12,border:`1.5px solid ${conf===false?C.r2:C.brd}`,background:conf===false?C.r2:"transparent",color:conf===false?C.wh:C.mu,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>No</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  function DailyPlanTab(){
    const today=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
    const slotMap={Breakfast:"breakfast",Lunch:"lunch",Snack:"snack",Dinner:"dinner","Second snack":"snack",Supper:"dinner"};
    const dailyPlan=mealtimes.map((m,i)=>{const type=slotMap[m]||"lunch";const rec=mealbank.find(r=>r.mealType===type)||mealbank[i%mealbank.length];return{meal:m,recipe:rec};});
    const totCal=dailyPlan.reduce((s,d)=>s+(d.recipe?.cal||0),0);
    const totProt=dailyPlan.reduce((s,d)=>s+(d.recipe?.prot||0),0);
    const calOk=totCal===0||(totCal>=macros.calories-50&&totCal<=macros.calories+50);
    const protOk=totProt===0||(totProt>=macros.protein&&totProt<=macros.protein+5);
    const calPct=Math.min(100,(totCal/macros.calories)*100);
    const protPct=Math.min(100,(totProt/macros.protein)*100);

    return(
      <div style={{padding:"14px 20px 32px",display:"flex",flexDirection:"column",gap:14}}>
        <div><h3 style={{fontFamily:"'Fraunces',serif",fontSize:20,color:C.dk,fontWeight:700}}>Today</h3><p style={{fontSize:12,color:C.mu,marginTop:2}}>{today}</p></div>

        {/* Macro targets with pass/fail */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[
            {l:"Calories",val:totCal,target:macros.calories,unit:"kcal",ok:calOk,pct:calPct,ac:C.o2,bg:C.o5,bd:C.o4,hint:`Target: ${macros.calories-50}–${macros.calories+50}`},
            {l:"Protein",val:totProt,target:macros.protein,unit:"g",ok:protOk,pct:protPct,ac:C.g2,bg:C.g6,bd:C.g5,hint:`Target: ${macros.protein}–${macros.protein+5}g`},
          ].map(m=>(
            <div key={m.l} style={{padding:"14px",borderRadius:12,background:totCal===0?m.bg:m.ok?m.bg:C.r5,border:`1.5px solid ${totCal===0?m.bd:m.ok?m.bd:C.r4}`,textAlign:"center"}}>
              <p style={{fontFamily:"'Fraunces',serif",fontSize:26,color:totCal===0?m.ac:m.ok?m.ac:C.r2,fontWeight:700}}>{m.val}{m.unit==="g"?"g":""}</p>
              <p style={{fontSize:10,color:C.mu,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginTop:2}}>{m.l}</p>
              <div style={{height:5,borderRadius:3,background:"rgba(0,0,0,0.08)",marginTop:8,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,background:m.ok?m.ac:C.r2,width:`${m.pct}%`,transition:"width 0.4s"}}/></div>
              <p style={{fontSize:10,color:C.mu,marginTop:5}}>{m.hint}</p>
              {totCal>0&&!m.ok&&<p style={{fontSize:10,color:C.r2,fontWeight:700,marginTop:3}}>{m.l==="Calories"?(totCal<macros.calories-50?`${macros.calories-50-totCal} short`:`${totCal-macros.calories-50} over`):(totProt<macros.protein?`${macros.protein-totProt}g short`:`${totProt-macros.protein-5}g over`)}</p>}
              {totCal>0&&m.ok&&<p style={{fontSize:10,color:m.ac,fontWeight:700,marginTop:3}}>On target</p>}
            </div>
          ))}
        </div>

        {/* Macro rules reminder */}
        <div style={{padding:"11px 14px",borderRadius:10,background:C.wh,border:`1.5px solid ${C.brd}`}}>
          <p style={{fontSize:11,fontWeight:800,color:C.mu,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:6}}>Daily rules</p>
          <p style={{fontSize:12,color:C.md,lineHeight:1.6}}>Calories must land within <strong>±50 kcal</strong> of your {macros.calories} target. Protein must be between <strong>{macros.protein}g and {macros.protein+5}g</strong>.</p>
        </div>

        {dailyPlan.map((item,i)=>(
          <div key={i} style={{background:C.wh,borderRadius:13,overflow:"hidden",border:`1.5px solid ${C.brd}`}}>
            <div style={{padding:"7px 14px",background:C.bg2,borderBottom:`1px solid ${C.brd}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{color:C.mu,display:"flex"}}>{MealIcon[{Breakfast:"breakfast",Lunch:"lunch",Snack:"snack",Dinner:"dinner","Second snack":"second_snack",Supper:"supper"}[item.meal]]||MealIcon.lunch}</span>
                <p style={{fontSize:10,fontWeight:800,color:C.mu,textTransform:"uppercase",letterSpacing:"0.7px"}}>{item.meal}</p>
              </div>
              {item.recipe&&item.recipe.mealType==="dinner"&&(
                <Tag label={getDinnerProteinType(item.recipe.title)} color={{chicken:C.o2,beef:C.r2,fish:C.g2,vegetables:C.g3}[getDinnerProteinType(item.recipe.title)]||C.mu}/>
              )}
            </div>
            <div style={{padding:"12px 14px"}}>
              {item.recipe?(
                <>
                  <h4 style={{fontSize:14,fontWeight:700,color:C.dk,marginBottom:4}}>{item.recipe.title}</h4>
                  <div style={{display:"flex",gap:12}}>
                    <span style={{fontSize:11,color:C.mu}}>{item.recipe.time}</span>
                    <span style={{fontSize:11,color:C.mu}}>{item.recipe.cal} kcal</span>
                    <span style={{fontSize:11,color:C.mu}}>{item.recipe.prot}g protein</span>
                  </div>
                </>
              ):(
                <p style={{fontSize:13,color:C.mu}}>Nothing planned</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  function MealBankTab(){
    const[showAdd,setShowAdd]=useState(false);const[url,setUrl]=useState("");const[parsing,setParsing]=useState(false);const[filter,setFilter]=useState("all");const[editIdx,setEditIdx]=useState(null);const[viewRecipe,setViewRecipe]=useState(null);const[aiLoading,setAiLoading]=useState(false);const[parseErr,setParseErr]=useState("");
    const parseUrl=async()=>{if(!url.trim())return;setParsing(true);setParseErr("");try{const rec=await parseRecipeUrl(url);updateMealBank(p=>[...p,rec]);setUrl("");setShowAdd(false);}catch(e){setParseErr("Couldn't extract that recipe. Try a direct recipe page URL.");}finally{setParsing(false);};};
    const genAi=async()=>{setAiLoading(true);try{const recs=await generateRecipes();updateMealBank(p=>[...p,...recs.map((r,i)=>({...r,id:Date.now()+i,source:"ai"}))]);setTab("mealbank");}catch{}finally{setAiLoading(false);};};
    const del=(id)=>{if(viewRecipe?.id===id)setViewRecipe(null);updateMealBank(p=>p.filter(r=>r.id!==id));};
    const filtered=filter==="all"?mealbank:mealbank.filter(r=>r.source===filter);
    const srcCol={tiktok:C.r2,instagram:C.o2,youtube:C.r2,web:C.g2,manual:C.g2,ai:C.g3};
    const srcIcon={tiktok:Icon.video,instagram:Icon.link,youtube:Icon.video,web:Icon.link,manual:Icon.chef,ai:Icon.refresh};

    // ── RECIPE DETAIL VIEW ──
    if(viewRecipe){
      const r=viewRecipe;const sc=srcCol[r.source]||C.g2;
      return(
        <div style={{paddingBottom:32}}>
          <div style={{background:C.g2,padding:"20px 20px 24px"}}>
            <button onClick={()=>setViewRecipe(null)} style={{background:"rgba(255,255,255,0.15)",border:"none",color:C.wh,padding:"7px 14px",borderRadius:20,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,marginBottom:16,display:"flex",alignItems:"center",gap:6}}>{Icon.chevL} Back</button>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}><Tag label={r.source==="ai"?"AI Generated":r.source||"manual"} color="rgba(255,255,255,0.3)"/></div>
            <h2 style={{fontFamily:"'Fraunces',serif",fontSize:24,color:C.wh,fontWeight:700,lineHeight:1.2,marginBottom:12}}>{r.title}</h2>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.7)",lineHeight:1.6,marginBottom:14}}>{r.desc}</p>
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              {[{i:Icon.clock,v:r.time},{i:Icon.fire,v:`${r.cal} kcal`},{i:Icon.chef,v:`${r.prot}g protein`},{i:null,v:r.tag}].map((x,i)=>x.v&&(
                <span key={i} style={{fontSize:12,color:"rgba(255,255,255,0.75)",fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
                  {x.i&&<span style={{opacity:0.8}}>{x.i}</span>}{x.v}
                </span>
              ))}
            </div>
          </div>
          <div style={{padding:"20px 20px 0",display:"flex",flexDirection:"column",gap:24}}>
            {r.prepTip&&(
              <div style={{padding:"12px 14px",borderRadius:12,background:C.g6,border:`1px solid ${C.g5}`,display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{color:C.g3,flexShrink:0,marginTop:1}}>{Icon.clock}</span>
                <p style={{fontSize:13,color:C.g1,fontWeight:600,lineHeight:1.5}}>{r.prepTip}</p>
              </div>
            )}
            {r.chefTip&&(
              <div style={{padding:"12px 14px",borderRadius:12,background:C.o5,border:`1px solid ${C.o4}`,display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{color:C.o2,flexShrink:0,marginTop:1}}>{Icon.chef}</span>
                <div>
                  <p style={{fontSize:10,fontWeight:800,color:C.o2,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:4}}>Chef's tip</p>
                  <p style={{fontSize:13,color:C.o1,fontWeight:500,lineHeight:1.6}}>{r.chefTip}</p>
                </div>
              </div>
            )}
            {(r.ingredients||[]).length>0&&(
              <div>
                <p style={{fontSize:11,fontWeight:800,color:C.mu,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:14}}>Ingredients</p>
                <div style={{display:"flex",flexDirection:"column",gap:0}}>
                  {r.ingredients.map((ing,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:`1px solid ${C.bg3}`}}>
                      <div style={{width:7,height:7,borderRadius:"50%",background:C.g4,flexShrink:0}}/>
                      <span style={{fontSize:14,color:C.md,fontWeight:500}}>{ing}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(r.steps||[]).length>0&&(
              <div>
                <p style={{fontSize:11,fontWeight:800,color:C.mu,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:16}}>Method</p>
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  {r.steps.map((step,i)=>(
                    <div key={i} style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                      <div style={{width:28,height:28,borderRadius:"50%",background:C.g2,color:C.wh,fontSize:12,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
                      <p style={{fontSize:14,color:C.md,lineHeight:1.7,fontWeight:400,paddingTop:4}}>{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{display:"flex",gap:10,paddingTop:8}}>
              <button onClick={()=>{setEditIdx(mealbank.findIndex(x=>x.id===r.id));setViewRecipe(null);}} style={{flex:1,padding:"13px",borderRadius:12,border:`1.5px solid ${C.brd}`,background:C.wh,color:C.md,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>{Icon.edit} Edit</button>
              <button onClick={()=>del(r.id)} style={{padding:"13px 18px",borderRadius:12,border:`1.5px solid ${C.r4}`,background:C.r5,color:C.r2,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:7}}>{Icon.trash}</button>
            </div>
          </div>
        </div>
      );
    }

    // ── EDIT VIEW ──
    if(editIdx!==null){const r=mealbank[editIdx];return(<div style={{padding:"0 20px 32px"}}><div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 0"}}><button onClick={()=>setEditIdx(null)} style={{background:"none",border:"none",color:C.g2,cursor:"pointer",display:"flex"}}>{Icon.chevL}</button><h3 style={{fontFamily:"'Fraunces',serif",fontSize:18,color:C.dk,fontWeight:700}}>Edit recipe</h3></div><div style={{display:"flex",flexDirection:"column",gap:14}}>{[["title","Recipe name"],["time","Cook time"],["desc","Description"]].map(([k,l])=>(<div key={k}><label style={lbl}>{l}</label><input value={r[k]||""} onChange={e=>updateMealBank(p=>p.map((x,i)=>i===editIdx?{...x,[k]:e.target.value}:x))} style={inp}/></div>))}<div><label style={lbl}>Ingredients (one per line)</label><textarea value={(r.ingredients||[]).join("\n")} onChange={e=>updateMealBank(p=>p.map((x,i)=>i===editIdx?{...x,ingredients:e.target.value.split("\n")}:x))} style={{...inp,height:100,resize:"none",fontFamily:"'DM Sans',sans-serif"}}/></div><div><label style={lbl}>Steps (one per line)</label><textarea value={(r.steps||[]).join("\n")} onChange={e=>updateMealBank(p=>p.map((x,i)=>i===editIdx?{...x,steps:e.target.value.split("\n")}:x))} style={{...inp,height:100,resize:"none",fontFamily:"'DM Sans',sans-serif"}}/></div><Btn onClick={()=>setEditIdx(null)} label="Save changes"/></div></div>);}

    // ── LIST VIEW ──
    return(<div style={{padding:"14px 20px 32px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><h3 style={{fontFamily:"'Fraunces',serif",fontSize:20,color:C.dk,fontWeight:700}}>Meal Bank</h3><p style={{fontSize:12,color:C.mu,marginTop:2}}>{mealbank.length} recipes saved</p></div><div style={{display:"flex",gap:8}}><button onClick={genAi} disabled={aiLoading} style={{padding:"8px 12px",borderRadius:20,border:"none",background:C.g6,color:C.g2,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5}}><span style={{display:"flex"}}>{Icon.refresh}</span>{aiLoading?"Generating...":"AI recipes"}</button><button onClick={()=>setShowAdd(!showAdd)} style={{padding:"8px 14px",borderRadius:20,border:"none",background:C.g2,color:C.wh,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5}}>{Icon.plus} Save</button></div></div>
      {showAdd&&(<div style={{padding:"14px",borderRadius:12,background:C.wh,border:`1.5px solid ${C.brd}`,display:"flex",flexDirection:"column",gap:10}}><p style={{fontSize:11,fontWeight:700,color:C.mu,textTransform:"uppercase",letterSpacing:"0.6px"}}>Paste a link from Instagram, TikTok, YouTube, or any recipe site</p><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..." style={inp}/>{parseErr&&<p style={{fontSize:12,color:C.r2,fontWeight:600}}>{parseErr}</p>}{parsing?(<p style={{fontSize:13,color:C.g2,fontWeight:700}}>Extracting recipe...</p>):(<div style={{display:"flex",gap:8}}><Btn onClick={parseUrl} label="Extract recipe" small/><Btn onClick={()=>{setShowAdd(false);setUrl("");setParseErr("");}} label="Cancel" small secondary/></div>)}</div>)}
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>{["all","manual","ai","instagram","tiktok","youtube"].map(f=>(<button key={f} onClick={()=>setFilter(f)} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${filter===f?C.g2:C.brd}`,background:filter===f?C.g6:C.wh,color:filter===f?C.g2:C.mu,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",textTransform:"capitalize"}}>{f==="all"?"All":f==="ai"?"AI Generated":f}</button>))}</div>
      {filtered.map((r)=>{const sc=srcCol[r.source]||C.g2;return(
        <div key={r.id} onClick={()=>setViewRecipe(r)} style={{background:C.wh,borderRadius:13,border:`1.5px solid ${C.brd}`,overflow:"hidden",cursor:"pointer",transition:"transform 0.1s"}}>
          <div style={{padding:"13px 14px"}}>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}><span style={{color:sc}}>{srcIcon[r.source]||Icon.chef}</span><Tag label={r.source==="ai"?"AI Generated":r.source||"manual"} color={sc}/></div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <h4 style={{fontSize:14,fontWeight:700,color:C.dk,lineHeight:1.3,marginBottom:3}}>{r.title}</h4>
                <p style={{fontSize:11,color:C.mu,lineHeight:1.4,marginBottom:8}}>{r.desc}</p>
                <div style={{display:"flex",gap:10}}>
                  <span style={{fontSize:11,color:C.mu,display:"flex",alignItems:"center",gap:4}}><span style={{color:C.g3}}>{Icon.clock}</span>{r.time}</span>
                  <span style={{fontSize:11,color:C.mu}}>{r.cal} kcal</span>
                  <span style={{fontSize:11,color:C.mu}}>{r.prot}g protein</span>
                </div>
              </div>
              <div style={{color:C.lt,marginLeft:10,marginTop:2,flexShrink:0}}>{Icon.chevR}</div>
            </div>
          </div>
        </div>
      );})}
    </div>);
  }

  function KitchenTab(){
    const cats=[...new Set(inv.map(i=>i.cat))];const urg=inv.filter(i=>i.d<=3).length;const soon=inv.filter(i=>i.d>3&&i.d<=7).length;const good=inv.filter(i=>i.d>7).length;
    return(<div style={{padding:"14px 20px 32px",display:"flex",flexDirection:"column",gap:14}}><div><h3 style={{fontFamily:"'Fraunces',serif",fontSize:20,color:C.dk,fontWeight:700}}>Inventory</h3><p style={{fontSize:12,color:C.mu,marginTop:2}}>{inv.length} items tracked</p></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>{[{l:"Urgent",n:urg,c:C.r2,bg:C.r5},{l:"Use soon",n:soon,c:C.o2,bg:C.o5},{l:"Good",n:good,c:C.g2,bg:C.g6}].map(s=>(<div key={s.l} style={{padding:"12px 10px",borderRadius:12,background:s.bg,textAlign:"center",border:`1.5px solid ${s.c}22`}}><p style={{fontFamily:"'Fraunces',serif",fontSize:26,color:s.c,fontWeight:700}}>{s.n}</p><p style={{fontSize:10,color:s.c,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.4px"}}>{s.l}</p></div>))}</div>{cats.map(cat=>(<div key={cat}><p style={{fontSize:11,fontWeight:700,color:C.mu,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:9}}>{cat}</p><div style={{display:"flex",flexDirection:"column",gap:7}}>{inv.filter(i=>i.cat===cat).map(item=>{const col=item.d<=3?C.r2:item.d<=7?C.o2:C.g2;return(<div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 13px",borderRadius:11,background:C.wh,borderLeft:`3px solid ${col}`}}><div><p style={{fontSize:13,fontWeight:700,color:C.dk}}>{item.name}</p><p style={{fontSize:11,color:C.mu}}>{item.qty} remaining</p></div><div style={{textAlign:"right"}}><p style={{fontSize:12,color:col,fontWeight:700}}>{item.d<=3?"Use now":item.d<=7?"Use soon":item.d<30?`${item.d}d`:"Long shelf"}</p><p style={{fontSize:10,color:C.mu}}>{item.d<=30?`Restock ~${item.d}d`:"Pantry stable"}</p></div></div>);})}</div></div>))}</div>);
  }

  function ShopTab(){
    const[checked,setChecked]=useState([]);const tog=n=>setChecked(p=>p.includes(n)?p.filter(x=>x!==n):[...p,n]);
    return(<div style={{padding:"14px 20px 32px",display:"flex",flexDirection:"column",gap:14}}>
      <div><h3 style={{fontFamily:"'Fraunces',serif",fontSize:20,color:C.dk,fontWeight:700}}>Shopping List</h3><p style={{fontSize:12,color:C.mu,marginTop:2}}>Based on your inventory gaps and shopping history</p></div>
      <div style={{padding:"12px 14px",borderRadius:10,background:C.g6,border:`1px solid ${C.g5}`}}><p style={{fontSize:13,color:C.g1,fontWeight:700}}>{checked.length} of {GROCERY_ITEMS.length} items checked off</p></div>
      {GROCERY_ITEMS.map((item,i)=>(<div key={i} onClick={()=>tog(item.name)} style={{display:"flex",gap:12,padding:"13px 14px",borderRadius:12,background:C.wh,cursor:"pointer",border:`1.5px solid ${checked.includes(item.name)?C.g3:C.brd}`,opacity:checked.includes(item.name)?0.65:1,transition:"all 0.15s"}}>
        <div style={{width:20,height:20,borderRadius:6,flexShrink:0,marginTop:2,border:`1.5px solid ${checked.includes(item.name)?C.g2:C.brd}`,background:checked.includes(item.name)?C.g2:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:C.wh}}>{checked.includes(item.name)&&Icon.check}</div>
        <div style={{flex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <p style={{fontSize:14,fontWeight:700,color:C.dk,textDecoration:checked.includes(item.name)?"line-through":"none"}}>{item.name}</p>
            <Tag label={item.tag} color={item.tag==="Restock"?C.o2:C.g2}/>
          </div>
          <p style={{fontSize:11,color:C.mu,lineHeight:1.5}}>{item.reason}</p>
          <p style={{fontSize:11,color:C.mu,marginTop:3,fontWeight:600}}>Qty: {item.qty}</p>
        </div>
      </div>))}
    </div>);
  }

  function ProfileTab(){return(<div style={{padding:"14px 20px 32px",display:"flex",flexDirection:"column",gap:14}}><div style={{background:C.g2,borderRadius:16,padding:"24px",textAlign:"center"}}><div style={{width:56,height:56,borderRadius:"50%",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",color:C.wh}}>{Icon.user}</div><h2 style={{fontFamily:"'Fraunces',serif",fontSize:22,color:C.wh,fontWeight:700}}>{profile.name||"Your profile"}</h2><p style={{fontSize:13,color:"rgba(255,255,255,0.55)",marginTop:4}}>{profile.sex} · age {profile.age}</p></div><div style={{background:C.wh,borderRadius:14,padding:"16px",border:`1.5px solid ${C.brd}`}}><p style={{fontSize:11,fontWeight:700,color:C.mu,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:14}}>Daily targets</p>{[{l:"Calories",v:macros.calories,u:"kcal"},{l:"Protein",v:macros.protein,u:"g"}].map(m=>(<div key={m.l} style={{display:"flex",justifyContent:"space-between",paddingBottom:10,borderBottom:`1px solid ${C.bg3}`,marginBottom:10}}><span style={{fontSize:13,color:C.md,fontWeight:600}}>{m.l}</span><span style={{fontSize:13,color:C.dk,fontWeight:700}}>{m.v} {m.u}</span></div>))}</div>{profile.goals?.length>0&&(<div style={{background:C.wh,borderRadius:14,padding:"16px",border:`1.5px solid ${C.brd}`}}><p style={{fontSize:11,fontWeight:700,color:C.mu,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:12}}>Goals</p><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{profile.goals.map(g=>{const gObj=GOALS.find(x=>x.k===g);return gObj?<Tag key={g} label={gObj.l}/>:null;})}</div></div>)}<button onClick={onSignOut} style={{width:"100%",padding:"13px",borderRadius:12,border:`1.5px solid ${C.brd}`,background:C.wh,color:C.r2,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Sign out</button></div>);}

  function SettingsTab(){const items=[{l:"Notifications",d:"Meal reminders and prep alerts"},{l:"Units",d:"Metric · grams · ml"},{l:"Cook schedule",d:"Edit your preferred cook days"},{l:"Data & privacy",d:"What we store and how"},{l:"About Savorly",d:"Version 2.0"}];return(<div style={{padding:"14px 20px 32px",display:"flex",flexDirection:"column",gap:14}}><h3 style={{fontFamily:"'Fraunces',serif",fontSize:20,color:C.dk,fontWeight:700}}>Settings</h3><div style={{background:C.wh,borderRadius:14,overflow:"hidden",border:`1.5px solid ${C.brd}`}}>{items.map((item,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",borderBottom:i<items.length-1?`1px solid ${C.bg3}`:"none",cursor:"pointer"}}><div><p style={{fontSize:14,fontWeight:700,color:C.dk}}>{item.l}</p><p style={{fontSize:11,color:C.mu,marginTop:2}}>{item.d}</p></div><div style={{color:C.lt}}>{Icon.chevR}</div></div>))}</div></div>);}

  const renderContent=()=>{switch(tab){case"home":return<HomeTab/>;case"plan":return<WeeklyPlanTab/>;case"daily":return<DailyPlanTab/>;case"mealbank":return<MealBankTab/>;case"kitchen":return<KitchenTab/>;case"shop":return<ShopTab/>;case"profile":return<ProfileTab/>;case"settings":return<SettingsTab/>;default:return<HomeTab/>;}};

  return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",fontFamily:"'DM Sans',sans-serif",maxWidth:430,margin:"0 auto",overflowX:"hidden"}}>
    {sidebar&&(<div style={{position:"fixed",inset:0,zIndex:100,maxWidth:430,margin:"0 auto"}}><div onClick={()=>setSidebar(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.35)"}}/><div style={{position:"absolute",top:0,left:0,bottom:0,width:240,background:C.bg,display:"flex",flexDirection:"column",padding:"52px 0 32px",zIndex:10}}><div style={{padding:"0 20px 20px",borderBottom:`1px solid ${C.brd}`}}><div style={{color:C.g3,marginBottom:6}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2a9 9 0 00-9 9c0 6 9 13 9 13s9-7 9-13a9 9 0 00-9-9z"/><circle cx="12" cy="10" r="3"/></svg></div><h2 style={{fontFamily:"'Fraunces',serif",fontSize:17,color:C.dk,fontWeight:700}}>Savorly</h2></div><div style={{flex:1,overflowY:"auto",padding:"10px 0"}}>{SIDEBAR.map(item=>(<button key={item.k} onClick={()=>{setTab(item.k);setSidebar(false);}} style={{width:"100%",display:"flex",gap:12,alignItems:"center",padding:"12px 20px",background:tab===item.k?C.g6:"transparent",border:"none",cursor:"pointer",color:tab===item.k?C.g2:C.md,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:tab===item.k?700:500,borderLeft:`3px solid ${tab===item.k?C.g2:"transparent"}`,textAlign:"left"}}><span style={{color:tab===item.k?C.g2:C.mu}}>{item.icon}</span>{item.l}</button>))}</div></div></div>)}
    <div style={{background:C.bg,borderBottom:`1px solid ${C.brd}`,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}><button onClick={()=>setSidebar(true)} style={{background:"none",border:"none",cursor:"pointer",color:C.md,padding:0,display:"flex"}}>{Icon.menu}</button><h1 style={{fontFamily:"'Fraunces',serif",fontSize:16,color:C.dk,fontWeight:700}}>{TABLABELS[tab]||"Savorly"}</h1><div style={{width:22}}/></div>
    <div style={{flex:1,overflowY:"auto",paddingBottom:68}}>{renderContent()}</div>
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.wh,borderTop:`1px solid ${C.brd}`,display:"flex",padding:"10px 0 16px",boxShadow:"0 -3px 16px rgba(0,0,0,0.06)"}}>{TABS.map(t=>(<button key={t.k} onClick={()=>setTab(t.k)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"4px 0",border:"none",background:"transparent",cursor:"pointer",color:tab===t.k?C.g2:C.mu,fontFamily:"'DM Sans',sans-serif",transition:"all 0.12s"}}>{t.icon}<span style={{fontSize:9,fontWeight:tab===t.k?800:600,letterSpacing:"0.2px"}}>{t.l}</span></button>))}</div>
  </div>);
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App(){
  useEffect(()=>{
    const link=document.createElement("link");link.href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700;900&family=DM+Sans:wght@400;500;600;700&display=swap";link.rel="stylesheet";document.head.appendChild(link);
    const s=document.createElement("style");
    // 100dvh on mobile accounts for browser chrome — prevents button cutoff
    s.textContent=`*{box-sizing:border-box;margin:0;padding:0;}body{background:#F5F0E8;}input,textarea{outline:none;}input:focus,textarea:focus{border-color:#3A7D56!important;}textarea{font-family:'DM Sans',sans-serif;}`;
    document.head.appendChild(s);
    return()=>{try{document.head.removeChild(link);document.head.removeChild(s);}catch{}};
  },[]);

  const[step,setStep]=useState(0);
  const[profile,setProfile]=useState({name:"",sex:"",age:"",weight:"",height:"",goals:[],mealtimes:[],cookDays:[],cuisines:[],allergens:[],dislikes:[]});
  const[health,setHealth]=useState([]);
  const[macros,setMacros]=useState({calories:2000,protein:120});
  const[allergens,setAllergens]=useState([]);
  const[cuisines,setCuisines]=useState([]);
  const[meals,setMeals]=useState({breakfast:[],lunch:[],dinner:[]});
  const[dislikes,setDislikes]=useState([]);
  const[inventory,setInventory]=useState([]);
  const[mealbank,setMealbank]=useState(MB_SEED);
  const[weeklyPlan,setWeeklyPlan]=useState({});
  const[authed,setAuthed]=useState(false);
  const[loadingAuth,setLoadingAuth]=useState(true);

  useEffect(()=>{
    // ── Step 1: Check localStorage first (works even without Supabase) ──
    // This is what prevents re-onboarding. If the user has completed setup on
    // this device before, we load their data and skip straight to the app.
    const localOnboarded = localStorage.getItem('savorly_onboarded');
    const localProfile = localStorage.getItem('savorly_profile');

    if(localOnboarded==='true' && localProfile){
      try{
        const prof = JSON.parse(localProfile);
        setProfile(prof);
        if(prof.macros) setMacros(prof.macros);
        const localInv=localStorage.getItem('savorly_inventory');
        const localMB=localStorage.getItem('savorly_mealbank');
        const localWP=localStorage.getItem('savorly_weeklyplan');
        if(localInv) setInventory(JSON.parse(localInv));
        if(localMB) setMealbank(JSON.parse(localMB));
        if(localWP) setWeeklyPlan(JSON.parse(localWP));
        setStep(99);
        setLoadingAuth(false);
        return; // skip Supabase check — data is already loaded
      }catch(e){
        // Corrupt localStorage — clear and re-onboard
        localStorage.clear();
      }
    }

    // ── Step 2: Check Supabase for returning user on a new device ──
    getUser().then(user=>{
      if(user){
        Promise.all([loadProfile(),loadInventory(),loadMealBank(),loadWeeklyPlan()]).then(([prof,inv,mb,wp])=>{
          if(prof){
            setProfile(prof);
            if(prof.macros)setMacros(prof.macros);
            // Cache to localStorage so future loads are instant
            localStorage.setItem('savorly_onboarded','true');
            localStorage.setItem('savorly_profile',JSON.stringify(prof));
            setStep(99);
          }
          if(inv){setInventory(inv);localStorage.setItem('savorly_inventory',JSON.stringify(inv));}
          if(mb){setMealbank(mb);localStorage.setItem('savorly_mealbank',JSON.stringify(mb));}
          if(wp){setWeeklyPlan(wp);localStorage.setItem('savorly_weeklyplan',JSON.stringify(wp));}
          setAuthed(true);
        });
      }
      setLoadingAuth(false);
    });
  },[]);

  const next=()=>setStep(s=>s+1);

  const finishOnboarding=async()=>{
    const finalProfile={...profile,goals:profile.goals,mealtimes:profile.mealtimes,cookDays:profile.cookDays,cuisines,allergens,dislikes,health,macros};
    setProfile(finalProfile);
    // Save to localStorage — this is what makes the app remember you
    localStorage.setItem('savorly_onboarded','true');
    localStorage.setItem('savorly_profile',JSON.stringify(finalProfile));
    localStorage.setItem('savorly_inventory',JSON.stringify(inventory));
    localStorage.setItem('savorly_mealbank',JSON.stringify(mealbank));
    // Save to Supabase if available (syncs across devices)
    await saveProfile(finalProfile);
    await saveInventory(inventory);
    await saveMealBank(mealbank);
    setStep(99);
  };

  const handleSignOut=async()=>{
    // Clear localStorage so next user on this device starts fresh
    localStorage.removeItem('savorly_onboarded');
    localStorage.removeItem('savorly_profile');
    localStorage.removeItem('savorly_inventory');
    localStorage.removeItem('savorly_mealbank');
    localStorage.removeItem('savorly_weeklyplan');
    await signOut();
    setStep(0);
    setAuthed(false);
  };

  if(loadingAuth)return(<div style={{height:"100dvh",background:C.g2,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}><p style={{color:"rgba(255,255,255,0.6)",fontSize:14}}>Loading...</p></div>);

  if(!authed&&step===0)return(<Welcome go={next}/>);
  if(!authed&&step===1)return <OB_Name p={profile} sp={setProfile} go={next}/>;
  if(!authed&&step===2)return <OB_Body p={profile} sp={setProfile} go={next}/>;
  if(!authed&&step===3)return <OB_Meals p={profile} sp={setProfile} go={next}/>;
  if(!authed&&step===4)return <OB_Health h={health} sh={setHealth} go={next}/>;
  if(!authed&&step===5)return <OB_Macros p={profile} macros={macros} setMacros={setMacros} go={next}/>;
  if(!authed&&step===6)return <OB_Allergens al={allergens} sal={setAllergens} go={next}/>;
  if(!authed&&step===7)return <OB_Subs al={allergens} go={next}/>;
  if(!authed&&step===8)return <OB_Cuisines cu={cuisines} scu={setCuisines} go={next}/>;
  if(!authed&&step===9)return <OB_Faves meals={meals} setMeals={setMeals} go={next}/>;
  if(!authed&&step===10)return <OB_Confess dis={dislikes} sdis={setDislikes} go={next}/>;
  if(!authed&&step===11)return <OB_Inventory inv={inventory} sinv={setInventory} go={finishOnboarding}/>;

  return(<MainApp profile={profile} macros={macros} inv={inventory.length?inventory:INV_SEED} mealbank={mealbank} setMealbank={setMealbank} weeklyPlan={weeklyPlan} setWeeklyPlan={setWeeklyPlan} onSignOut={handleSignOut}/>);
}
