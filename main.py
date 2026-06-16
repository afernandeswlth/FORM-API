from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = Path(__file__).parent

app = FastAPI(title="WLTH Forms Portal", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── FormHub landing page ───────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
def root():
    return FileResponse(str(BASE_DIR / "FormHub" / "static" / "index.html"))

# ── Mount each form as a sub-app ──────────────────────────────────────────────
from LinkedAccountAPI.main   import app as linked_account_app
from DirectDebitAPI.main     import app as direct_debit_app
from RepaymentChangeAPI.main import app as repayment_change_app
from OpenOffsetAPI.main      import app as open_offset_app
from ProductSwitchAPI.main   import app as product_switch_app
from RedrawAPI.main          import app as redraw_app

app.mount("/linked-account",   linked_account_app)
app.mount("/direct-debit",     direct_debit_app)
app.mount("/repayment-change", repayment_change_app)
app.mount("/open-offset",      open_offset_app)
app.mount("/product-switch",   product_switch_app)
app.mount("/redraw",           redraw_app)
