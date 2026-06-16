<template>
  <div>
    <NuxtPage />
  </div>
</template>

<style>
:root {
  --dark: #1a1a2e;
  --blue: #1565C0;
  --grey: #f4f4f6;
  --border: #d0d5dd;
  --text: #1a1a2e;
  --muted: #667085;
  --error: #d32f2f;
  --success: #2e7d32;
  --radius: 10px;
  --shadow: 0 2px 12px rgba(0,0,0,0.08);
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f0f2f5; color: var(--text); min-height: 100vh;
}
.container { max-width: 780px; margin: 32px auto; padding: 0 16px 60px; }
.form-title { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
.form-desc  { font-size: 14px; color: var(--muted); margin-bottom: 28px; }
.card {
  background: #fff; border-radius: var(--radius);
  box-shadow: var(--shadow); padding: 24px; margin-bottom: 20px;
}
.card-title {
  font-size: 15px; font-weight: 700; color: var(--dark);
  margin-bottom: 18px; padding-bottom: 10px; border-bottom: 1px solid var(--border);
}
.field-row { display: flex; gap: 14px; margin-bottom: 14px; flex-wrap: wrap; }
.field { flex: 1; min-width: 140px; }
.field label { display: block; font-size: 12px; font-weight: 600; color: var(--muted); margin-bottom: 5px; }
.field input, .field select, .field textarea {
  width: 100%; padding: 10px 12px; border: 1.5px solid var(--border);
  border-radius: 8px; font-size: 14px; color: var(--text);
  background: #fff; outline: none; transition: border-color 0.2s; font-family: inherit;
}
.field input:focus, .field select:focus, .field textarea:focus { border-color: var(--dark); }
.field.has-error input, .field.has-error select, .field.has-error textarea { border-color: var(--error); }
.err-msg { font-size: 11px; color: var(--error); margin-top: 3px; }
.toggle-label { display: block; font-size: 12px; font-weight: 600; color: var(--muted); margin-bottom: 6px; }
.toggle-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.toggle-opt { position: relative; }
.toggle-opt input[type="radio"] { display: none; }
.toggle-opt span {
  display: block; padding: 8px 16px; border: 1.5px solid var(--border);
  border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all 0.15s; user-select: none; white-space: nowrap;
}
.toggle-opt input:checked + span { background: var(--dark); color: #fff; border-color: var(--dark); }
.toggle-opt span:hover { border-color: var(--dark); }
.borrower-selector { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.borrower-selector label {
  display: flex; align-items: center; gap: 6px; padding: 8px 16px;
  border: 2px solid var(--border); border-radius: 8px; cursor: pointer;
  font-size: 14px; font-weight: 500; transition: all 0.15s; user-select: none;
}
.borrower-selector input[type="radio"] { display: none; }
.borrower-selector label.active { border-color: var(--dark); background: var(--dark); color: #fff; }
.auth-card {
  background: var(--grey); border: 1px solid var(--border);
  border-radius: 8px; padding: 18px; margin-bottom: 14px;
}
.auth-card-title { font-size: 13px; font-weight: 700; color: var(--dark); margin-bottom: 14px; }
.btn-submit {
  width: 100%; padding: 15px; background: var(--dark); color: #fff;
  border: none; border-radius: 10px; font-size: 16px; font-weight: 700;
  cursor: pointer; margin-top: 8px; transition: opacity 0.2s;
}
.btn-submit:hover { opacity: 0.88; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
