<template>
  <div>
    <NuxtPage />
  </div>
</template>

<style>
:root {
  --dark:       #1F232D;
  --blue:       #1445C7;
  --blue-hover: #1138A8;
  --grey:       #F5F7FA;
  --border:     #E1E4EA;
  --text:       #1F232D;
  --muted:      #64748B;
  --error:      #DC2626;
  --success:    #059669;
  --radius:     10px;
  --shadow:     0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: var(--grey);
  color: var(--text);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

/* ── Layout ─────────────────────────────────────── */
.container { max-width: 760px; margin: 28px auto; padding: 0 16px 80px; }
.form-title { font-size: 20px; font-weight: 700; margin-bottom: 4px; letter-spacing: -0.01em; }
.form-desc  { font-size: 14px; color: var(--muted); margin-bottom: 28px; line-height: 1.5; }

/* ── Cards ───────────────────────────────────────── */
.card {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 22px 24px;
  margin-bottom: 16px;
  border: 1px solid var(--border);
}
.card-title {
  font-size: 10px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

/* ── Fields ──────────────────────────────────────── */
.field-row { display: flex; gap: 14px; margin-bottom: 14px; flex-wrap: wrap; }
.field { flex: 1; min-width: 140px; }
.field label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 5px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text);
  background: #fff;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-family: inherit;
}
.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(20,69,199,0.1);
}
.field.has-error input,
.field.has-error select,
.field.has-error textarea {
  border-color: var(--error);
}
.err-msg { font-size: 11px; color: var(--error); margin-top: 3px; }

/* ── Toggle pills ────────────────────────────────── */
.toggle-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 6px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.toggle-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.toggle-opt { position: relative; }
.toggle-opt input[type="radio"] { display: none; }
.toggle-opt span {
  display: block;
  padding: 8px 18px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
  white-space: nowrap;
  color: var(--text);
}
.toggle-opt input:checked + span { background: var(--dark); color: #fff; border-color: var(--dark); }
.toggle-opt span:hover { border-color: var(--dark); }

/* ── Borrower selector ───────────────────────────── */
.borrower-selector { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.borrower-selector label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: 2px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s;
  user-select: none;
}
.borrower-selector input[type="radio"] { display: none; }
.borrower-selector label.active { border-color: var(--dark); background: var(--dark); color: #fff; }

/* ── Auth card ───────────────────────────────────── */
.auth-card {
  background: var(--grey);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 18px;
  margin-bottom: 14px;
}
.auth-card-title { font-size: 13px; font-weight: 700; color: var(--dark); margin-bottom: 14px; }

/* ── Submit button ───────────────────────────────── */
.btn-submit {
  width: 100%;
  padding: 15px;
  background: var(--blue);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s, opacity 0.2s;
  letter-spacing: 0.01em;
}
.btn-submit:hover  { background: var(--blue-hover); }
.btn-submit:disabled { opacity: 0.45; cursor: not-allowed; }
</style>
