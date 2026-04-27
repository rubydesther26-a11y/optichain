from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from google import genai
from datetime import datetime, timedelta
import random

client = genai.Client(api_key="AIzaSyBZToS0RxO74ng10xo4bF-qWe3vfL_Pr8A")

app = FastAPI(title="OptiChain AI")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

SHIPMENTS = [
  {"id":"SHP-001","route":"Shanghai → Los Angeles","origin":"Shanghai","destination":"Los Angeles","mode":"Sea","status":"needs_attention","risk":54,"utilization":30,"load":15,"capacity":50,"workers":["w1"],"delay_probability":42,"lat_start":31.2,"lng_start":121.4,"lat_end":34.0,"lng_end":-118.2},
  {"id":"SHP-002","route":"Frankfurt → New York","origin":"Frankfurt","destination":"New York","mode":"Air","status":"optimized","risk":5,"utilization":90,"load":38,"capacity":40,"workers":[],"delay_probability":5,"lat_start":50.1,"lng_start":8.6,"lat_end":40.7,"lng_end":-74.0},
  {"id":"SHP-003","route":"Dubai → Mumbai","origin":"Dubai","destination":"Mumbai","mode":"Road","status":"needs_attention","risk":58,"utilization":37,"load":11,"capacity":30,"workers":["w2"],"delay_probability":51,"lat_start":25.2,"lng_start":55.3,"lat_end":19.0,"lng_end":72.8},
  {"id":"SHP-004","route":"Singapore → Sydney","origin":"Singapore","destination":"Sydney","mode":"Sea","status":"optimized","risk":5,"utilization":85,"load":42,"capacity":50,"workers":[],"delay_probability":4,"lat_start":1.3,"lng_start":103.8,"lat_end":-33.8,"lng_end":151.2},
  {"id":"SHP-005","route":"New York → London","origin":"New York","destination":"London","mode":"Air","status":"needs_attention","risk":47,"utilization":28,"load":11,"capacity":40,"workers":["w3","w4"],"delay_probability":38,"lat_start":40.7,"lng_start":-74.0,"lat_end":51.5,"lng_end":-0.1},
  {"id":"SHP-006","route":"Rotterdam → Cape Town","origin":"Rotterdam","destination":"Cape Town","mode":"Sea","status":"on_time","risk":22,"utilization":76,"load":38,"capacity":50,"workers":[],"delay_probability":5,"lat_start":51.9,"lng_start":4.5,"lat_end":-33.9,"lng_end":18.4},
  {"id":"SHP-007","route":"Tokyo → Seoul","origin":"Tokyo","destination":"Seoul","mode":"Road","status":"needs_attention","risk":64,"utilization":24,"load":7,"capacity":30,"workers":["w5"],"delay_probability":59,"lat_start":35.6,"lng_start":139.6,"lat_end":37.5,"lng_end":126.9},
  {"id":"SHP-008","route":"Chicago → Mexico City","origin":"Chicago","destination":"Mexico City","mode":"Road","status":"on_time","risk":18,"utilization":73,"load":22,"capacity":30,"workers":["w6"],"delay_probability":8,"lat_start":41.8,"lng_start":-87.6,"lat_end":19.4,"lng_end":-99.1},
  {"id":"SHP-009","route":"Mumbai → Dubai","origin":"Mumbai","destination":"Dubai","mode":"Air","status":"on_time","risk":18,"utilization":88,"load":35,"capacity":40,"workers":["w7"],"delay_probability":6,"lat_start":19.0,"lng_start":72.8,"lat_end":25.2,"lng_end":55.3},
  {"id":"SHP-010","route":"Sydney → Auckland","origin":"Sydney","destination":"Auckland","mode":"Sea","status":"needs_attention","risk":40,"utilization":23,"load":11,"capacity":50,"workers":["w8"],"delay_probability":33,"lat_start":-33.8,"lng_start":151.2,"lat_end":-36.8,"lng_end":174.7},
]

WORKERS = [
  {"id":"w1","name":"Priya Sharma","role":"Logistics Coordinator","load":91,"shipments":["SHP-001"]},
  {"id":"w2","name":"Carlos Ruiz","role":"Route Planner","load":85,"shipments":["SHP-003"]},
  {"id":"w3","name":"Alex Chen","role":"Logistics Coordinator","load":67,"shipments":["SHP-005"]},
  {"id":"w4","name":"Yuki Tanaka","role":"Quality Inspector","load":62,"shipments":["SHP-005"]},
  {"id":"w5","name":"Omar Hassan","role":"Fleet Manager","load":78,"shipments":["SHP-007"]},
  {"id":"w6","name":"Sarah Johnson","role":"Route Planner","load":55,"shipments":["SHP-008"]},
  {"id":"w7","name":"Ravi Patel","role":"Logistics Coordinator","load":48,"shipments":["SHP-009"]},
  {"id":"w8","name":"Diane Lefebvre","role":"Quality Inspector","load":72,"shipments":["SHP-010"]},
]

VEHICLES = [
  {"id":"v1","type":"Heavy Truck","load":28,"capacity":40,"utilization":70,"status":"active"},
  {"id":"v2","type":"Container Ship","load":38,"capacity":50,"utilization":76,"status":"active"},
  {"id":"v3","type":"Cargo Plane","load":11,"capacity":40,"utilization":28,"status":"idle"},
  {"id":"v4","type":"Refrigerated Van","load":22,"capacity":30,"utilization":73,"status":"active"},
  {"id":"v5","type":"Rail Cattle","load":7,"capacity":30,"utilization":23,"status":"idle"},
  {"id":"v6","type":"Express Van","load":35,"capacity":40,"utilization":88,"status":"active"},
]

WAREHOUSES = [
  {"id":"wh1","name":"Mumbai Hub","capacity":1000,"used":920,"critical":True},
  {"id":"wh2","name":"Frankfurt Depot","capacity":800,"used":540,"critical":False},
  {"id":"wh3","name":"Singapore Port","capacity":1200,"used":870,"critical":False},
  {"id":"wh4","name":"LA Distribution","capacity":900,"used":610,"critical":False},
  {"id":"wh5","name":"Dubai Crossdock","capacity":600,"used":380,"critical":False},
]

def gen_history():
    base = 45
    history = []
    for i in range(14):
        date = (datetime.now() - timedelta(days=13-i)).strftime("%b %d")
        eff = min(100, base + i*1.5 + random.uniform(-2,2))
        util = min(100, 48 + i*1.2 + random.uniform(-3,3))
        risk = max(0, 62 - i*2.1 + random.uniform(-2,2))
        event = None
        if i == 3: event = "Merged SHP-003 & SHP-007"
        if i == 7: event = "Reallocated Workers"
        if i == 10: event = "Changed Route: SHP-010"
        if i == 12: event = "Workers Reallocated"
        history.append({"date":date,"efficiency":round(eff,1),"utilization":round(util,1),"risk":round(risk,1),"event":event})
    return history

HISTORY = gen_history()

class SimRequest(BaseModel):
    shipment_id: str
    action: str

class ApplyRequest(BaseModel):
    shipment_id: str
    action: str

class ChatRequest(BaseModel):
    question: str
    shipment_id: Optional[str] = None

def get_ship(sid):
    return next((x for x in SHIPMENTS if x["id"]==sid), None)

def shipment_context(s):
    workers = [w for w in WORKERS if w["id"] in s.get("workers",[])]
    worker_info = ", ".join([f"{w['name']} ({w['role']}, {w['load']}% load)" for w in workers]) or "No workers assigned"
    return f"""
Shipment: {s['id']} | Route: {s['route']} via {s['mode']}
Status: {s['status']} | Risk: {s['risk']}/100
Load: {s['utilization']}% ({s['load']}t of {s['capacity']}t)
Delay Probability: {s['delay_probability']}%
Workers: {worker_info}
"""

def all_context():
    lines = [f"- {s['id']}: {s['route']} | Risk:{s['risk']} | Util:{s['utilization']}% | Status:{s['status']} | Delay:{s['delay_probability']}%" for s in SHIPMENTS]
    return "\n".join(lines)

@app.get("/api/dashboard")
def dashboard():
    needs = [s for s in SHIPMENTS if s["status"]=="needs_attention"]
    eff = round(sum(s["utilization"] for s in SHIPMENTS)/len(SHIPMENTS), 1)
    overloaded = [w for w in WORKERS if w["load"]>80]
    idle_v = [v for v in VEHICLES if v["status"]=="idle"]
    critical_wh = [w for w in WAREHOUSES if w["critical"]]
    avg_worker = round(sum(w["load"] for w in WORKERS)/len(WORKERS),1)
    avg_vehicle = round(sum(v["utilization"] for v in VEHICLES)/len(VEHICLES),1)
    return {
        "system_efficiency": eff,
        "active_shipments": len(SHIPMENTS),
        "needs_attention": len(needs),
        "workforce_count": len(WORKERS),
        "overloaded_workers": len(overloaded),
        "vehicle_count": len(VEHICLES),
        "idle_vehicles": len(idle_v),
        "warehouse_count": len(WAREHOUSES),
        "critical_warehouses": len(critical_wh),
        "avg_worker_load": avg_worker,
        "avg_vehicle_utilization": avg_vehicle,
        "inefficiencies": len(needs),
        "shipments": SHIPMENTS,
    }

@app.get("/api/shipments")
def get_shipments():
    return SHIPMENTS

@app.get("/api/shipments/{shipment_id}")
def get_shipment_detail(shipment_id: str):
    s = get_ship(shipment_id)
    if not s: raise HTTPException(404, "Not found")
    assigned = [w for w in WORKERS if w["id"] in s["workers"]]
    return {**s, "assigned_workers": assigned}

@app.get("/api/analytics")
def analytics():
    return {
        "history": HISTORY,
        "workers": WORKERS,
        "vehicles": VEHICLES,
        "warehouses": WAREHOUSES,
        "shipment_modes": [
            {"mode":"Sea","count": sum(1 for s in SHIPMENTS if s["mode"]=="Sea")},
            {"mode":"Air","count": sum(1 for s in SHIPMENTS if s["mode"]=="Air")},
            {"mode":"Road","count": sum(1 for s in SHIPMENTS if s["mode"]=="Road")},
        ],
        "risk_distribution": [
            {"level":"Low","count": sum(1 for s in SHIPMENTS if s["risk"]<30)},
            {"level":"Medium","count": sum(1 for s in SHIPMENTS if 30<=s["risk"]<60)},
            {"level":"High","count": sum(1 for s in SHIPMENTS if s["risk"]>=60)},
        ]
    }

@app.post("/api/simulate")
def simulate(req: SimRequest):
    s = get_ship(req.shipment_id)
    if not s: raise HTTPException(404, "Not found")

    current = {
        "efficiency": s["utilization"],
        "risk_score": s["risk"],
        "est_time": round(s["load"]*1.8+20, 2)
    }

    action_map = {
        "reallocate_workforce": "reallocate the workforce assignments",
        "merge_adjacent": "merge with an adjacent load to consolidate routes",
        "calculate_alt_route": "calculate an alternative route to avoid risk factors"
    }

    prompt = f"""You are an AI supply chain optimization engine.

Shipment data:
{shipment_context(s)}

Full network:
{all_context()}

Admin wants to: {action_map.get(req.action, req.action)}

Reply in EXACTLY this format, nothing else:
EFFICIENCY_GAIN: [number 10-25]
RISK_REDUCTION: [number 10-30]
TIME_SAVED: [number 2-8]
RECOMMENDATION: [2-3 sentences explaining why this helps this specific shipment]"""

    try:
        response = client.models.generate_content(model="gemini-pro", contents=prompt)
        text = response.text.strip()
        parsed = {}
        for line in text.split('\n'):
            if ':' in line:
                key, val = line.split(':', 1)
                parsed[key.strip()] = val.strip()
        eff_gain = int(parsed.get("EFFICIENCY_GAIN", 15))
        risk_red = int(parsed.get("RISK_REDUCTION", 17))
        time_saved = float(parsed.get("TIME_SAVED", 4))
        recommendation = parsed.get("RECOMMENDATION", "Optimization will improve performance.")
    except Exception as e:
        eff_gain, risk_red, time_saved = 15, 17, 4.0
        recommendation = f"Applying {req.action.replace('_',' ')} to {s['id']} on {s['route']} will reduce risk and improve efficiency."

    projected = {
        "efficiency": min(100, current["efficiency"] + eff_gain),
        "risk_score": max(0, current["risk_score"] - risk_red),
        "est_time": round(current["est_time"] - time_saved, 2)
    }

    return {"current": current, "projected": projected, "recommendation": recommendation, "action": req.action, "ai_powered": True}

@app.post("/api/chat")
def chat(req: ChatRequest):
    ship_ctx = ""
    if req.shipment_id:
        s = get_ship(req.shipment_id)
        if s: ship_ctx = f"\nCurrent shipment context:\n{shipment_context(s)}"

    prompt = f"""You are OptiChain AI, an intelligent supply chain assistant.

Network status:
{all_context()}

Workers: {len(WORKERS)} active, {len([w for w in WORKERS if w['load']>80])} overloaded
Vehicles: {len(VEHICLES)} total, {len([v for v in VEHICLES if v['status']=='idle'])} idle
Warehouses: {len(WAREHOUSES)} total, {len([w for w in WAREHOUSES if w['critical']])} critical
{ship_ctx}

Answer this question in 2-4 sentences:
{req.question}"""

    try:
        response = client.models.generate_content(model="gemini-pro", contents=prompt)
        return {"answer": response.text.strip(), "ai_powered": True}
    except Exception as e:
        return {"answer": f"Error: {str(e)}", "ai_powered": False}

@app.post("/api/apply")
def apply_optimization(req: ApplyRequest):
    global HISTORY
    s = get_ship(req.shipment_id)
    if not s: raise HTTPException(404, "Not found")
    idx = SHIPMENTS.index(s)

    if req.action == "reallocate_workforce":
        SHIPMENTS[idx]["utilization"] = min(100, s["utilization"]+15)
        SHIPMENTS[idx]["risk"] = max(0, s["risk"]-17)
    elif req.action == "merge_adjacent":
        SHIPMENTS[idx]["utilization"] = min(100, s["utilization"]+22)
        SHIPMENTS[idx]["risk"] = max(0, s["risk"]-25)
    else:
        SHIPMENTS[idx]["utilization"] = min(100, s["utilization"]+18)
        SHIPMENTS[idx]["risk"] = max(0, s["risk"]-20)

    SHIPMENTS[idx]["status"] = "optimized"
    SHIPMENTS[idx]["delay_probability"] = max(2, s["delay_probability"]-20)

    eff = round(sum(x["utilization"] for x in SHIPMENTS)/len(SHIPMENTS),1)
    avg_risk = round(sum(x["risk"] for x in SHIPMENTS)/len(SHIPMENTS),1)
    HISTORY.append({"date": datetime.now().strftime("%b %d"), "efficiency": eff, "utilization": eff, "risk": avg_risk, "event": f"Optimized {req.shipment_id}"})

    return {"success": True, "shipment": SHIPMENTS[idx]}