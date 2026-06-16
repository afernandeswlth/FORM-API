<template>
  <div>
    <header class="site-header">
      <span class="logo">WLTH</span>
      <span class="header-sub">FORMS PORTAL</span>
    </header>

    <main>
      <h1 class="page-title">Submit a Form</h1>
      <p class="page-sub">Select the form you would like to complete and submit digitally.</p>

      <div class="form-grid">
        <NuxtLink v-for="form in forms" :key="form.path" :to="form.path" class="form-card">
          <div class="card-icon">{{ form.icon }}</div>
          <div class="card-title">{{ form.title }}</div>
          <div class="card-desc">{{ form.desc }}</div>
          <div class="card-action">
            Start form
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        </NuxtLink>

        <div v-for="soon in comingSoon" :key="soon.title" class="form-card disabled">
          <span class="soon-badge">Coming Soon</span>
          <div class="card-icon">{{ soon.icon }}</div>
          <div class="card-title">{{ soon.title }}</div>
          <div class="card-desc">{{ soon.desc }}</div>
        </div>
      </div>
    </main>

    <footer class="site-footer">
      WLTH Lend Pty Ltd (CRN 525 873) as authorised by WLTH Pty Ltd (ACN 639 591 245 and AFSL and ACL 525 752)
    </footer>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'WLTH Forms Portal' })

const forms = [
  { path: '/direct-debit',     icon: '💳', title: 'Direct Debit Request',      desc: 'Arrange for your loan repayments to be automatically debited from your nominated account.' },
  { path: '/linked-account',   icon: '🏦', title: 'Linked Account Nomination', desc: 'Set up a new bank account to be linked to your loan for direct debit or offset purposes.' },
  { path: '/repayment-change', icon: '🔄', title: 'Repayment Change',          desc: 'Request a change to your repayment amount or repayment frequency.' },
  { path: '/open-offset',      icon: '⚖️', title: 'Open Offset',              desc: 'Open an offset account to be linked to your home loan.' },
  { path: '/product-switch',   icon: '🔀', title: 'Product Switch',            desc: 'Switch your existing loan to a different repayment type or interest rate type.' },
  { path: '/redraw',           icon: '💸', title: 'Redraw Request',            desc: 'Access available redraw funds from your WLTH loan account.' },
]

const comingSoon = [
  { icon: '📉', title: 'Permanent Principal Reduction', desc: 'Request a permanent reduction to your outstanding loan principal.' },
]
</script>

<style scoped>
.site-header {
  background: #1a1a2e; padding: 0 40px; height: 64px;
  display: flex; align-items: center; justify-content: space-between;
}
.logo       { color: #fff; font-weight: 800; font-size: 1.25rem; letter-spacing: .05em; }
.header-sub { color: rgba(255,255,255,.45); font-size: .8rem; letter-spacing: .04em; }
main { max-width: 1020px; margin: 0 auto; padding: 48px 24px 64px; }
.page-title { font-size: 1.75rem; font-weight: 700; color: #1a1a2e; margin-bottom: 8px; }
.page-sub   { font-size: .95rem; color: #757575; margin-bottom: 40px; }
.form-grid  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
@media (max-width: 720px) { .form-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .form-grid { grid-template-columns: 1fr; } }
.form-card {
  background: #fff; border: 1.5px solid #e0e0e0; border-radius: 12px;
  padding: 26px 22px 22px; display: flex; flex-direction: column; gap: 8px;
  position: relative; transition: box-shadow .15s, border-color .15s, transform .12s;
  min-height: 190px; text-decoration: none; color: inherit; cursor: pointer;
}
.form-card:hover { border-color: #1565C0; box-shadow: 0 4px 20px rgba(21,101,192,.15); transform: translateY(-2px); }
.form-card:hover .card-action { color: #1565C0; }
.form-card.disabled { background: #f5f5f5; opacity: .72; pointer-events: none; }
.card-icon   { font-size: 1.8rem; line-height: 1; margin-bottom: 4px; }
.card-title  { font-size: .95rem; font-weight: 700; color: #1a1a2e; }
.card-desc   { font-size: .8rem; color: #757575; line-height: 1.5; flex: 1; }
.card-action { font-size: .82rem; font-weight: 600; color: #1a1a2e; margin-top: 8px; display: flex; align-items: center; gap: 4px; }
.soon-badge  { position: absolute; top: 14px; right: 14px; background: #e8eaf6; color: #5c6bc0; font-size: .68rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 3px 8px; border-radius: 20px; }
.site-footer { text-align: center; font-size: .75rem; color: #757575; padding: 20px; border-top: 1px solid #e0e0e0; background: #fff; }
</style>
