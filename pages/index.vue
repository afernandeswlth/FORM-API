<template>
  <div class="page">

    <!-- Header -->
    <header class="site-header">
      <div class="header-inner">
        <div class="brand">
          <svg class="w-mark" viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <polygon points="3,5 18,5 49,85 34,85" fill="white"/>
            <polygon points="34,85 49,85 67,5 52,5" fill="white"/>
            <polygon points="52,5 67,5 82,85 67,85" fill="white"/>
            <polygon points="67,85 82,85 97,5 82,5" fill="white"/>
          </svg>
          <span class="wordmark">WLTH</span>
        </div>
        <span class="portal-tag">Forms Portal</span>
      </div>
    </header>

    <!-- Hero strip -->
    <div class="hero">
      <div class="hero-inner">
        <h1 class="hero-title">Submit a Form</h1>
        <p class="hero-sub">Select the form you need to complete and submit digitally to the WLTH team.</p>
      </div>
    </div>

    <!-- Form grid -->
    <main class="main">
      <div class="form-grid">
        <NuxtLink
          v-for="form in forms"
          :key="form.path"
          :to="form.path"
          class="form-card"
        >
          <div class="card-num">{{ form.num }}</div>
          <div class="card-body">
            <div class="card-name">{{ form.title }}</div>
            <div class="card-desc">{{ form.desc }}</div>
          </div>
          <div class="card-cta">
            Start
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        </NuxtLink>

        <div v-for="soon in comingSoon" :key="soon.title" class="form-card disabled">
          <span class="soon-badge">Coming Soon</span>
          <div class="card-body" style="margin-top: 8px;">
            <div class="card-name">{{ soon.title }}</div>
            <div class="card-desc">{{ soon.desc }}</div>
          </div>
        </div>
      </div>
    </main>

    <footer class="site-footer">
      WLTH Lend Pty Ltd (CRN 525 873) as authorised credit representative of WLTH Pty Ltd (ACN 639 591 245 · AFSL and ACL 525 752)
    </footer>

  </div>
</template>

<script setup lang="ts">
useHead({ title: 'WLTH Forms Portal' })

const forms = [
  {
    num: '01',
    path: '/direct-debit',
    title: 'Direct Debit Request',
    desc: 'Arrange automatic loan repayments to be debited from your nominated bank account.',
  },
  {
    num: '02',
    path: '/linked-account',
    title: 'Linked Account Nomination',
    desc: 'Nominate a bank account to link to your loan for direct debit or offset purposes.',
  },
  {
    num: '03',
    path: '/repayment-change',
    title: 'Repayment Change',
    desc: 'Request a change to your repayment amount or frequency.',
  },
  {
    num: '04',
    path: '/open-offset',
    title: 'Open Offset Account',
    desc: 'Open an offset account to be linked to your WLTH home loan.',
  },
  {
    num: '05',
    path: '/product-switch',
    title: 'Product Switch',
    desc: 'Switch your existing loan to a different repayment type or interest rate type.',
  },
  {
    num: '06',
    path: '/redraw',
    title: 'Redraw Request',
    desc: 'Access available redraw funds from your WLTH loan account.',
  },
]

const comingSoon = [
  {
    title: 'Permanent Principal Reduction',
    desc: 'Request a permanent reduction to your outstanding loan principal.',
  },
]
</script>

<style scoped>
.page { display: flex; flex-direction: column; min-height: 100vh; background: #F5F7FA; }

/* Header */
.site-header {
  background: #1F232D;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  height: 60px;
  display: flex;
  align-items: center;
}
.header-inner {
  max-width: 1080px;
  width: 100%;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand       { display: flex; align-items: center; gap: 10px; }
.w-mark      { width: 24px; height: 22px; }
.wordmark    { font-size: 16px; font-weight: 800; letter-spacing: 0.08em; color: #fff; }
.portal-tag  {
  font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.45);
  letter-spacing: 0.1em; text-transform: uppercase;
}

/* Hero strip */
.hero { background: #1F232D; padding: 0 32px 40px; }
.hero-inner { max-width: 1080px; margin: 0 auto; }
.hero-title {
  font-size: 28px; font-weight: 700; color: #fff;
  letter-spacing: -0.02em; margin-bottom: 8px;
}
.hero-sub { font-size: 15px; color: rgba(255,255,255,0.55); line-height: 1.5; max-width: 480px; }

/* Main */
.main { flex: 1; max-width: 1080px; width: 100%; margin: 0 auto; padding: 32px 32px 64px; }

/* Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 760px) { .form-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 480px) { .form-grid { grid-template-columns: 1fr; } }

/* Form card */
.form-card {
  background: #fff;
  border: 1px solid #E1E4EA;
  border-radius: 12px;
  padding: 22px 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.12s;
  position: relative;
  min-height: 180px;
}
.form-card:hover {
  border-color: #1445C7;
  box-shadow: 0 4px 24px rgba(20,69,199,0.12);
  transform: translateY(-2px);
}
.form-card:hover .card-cta { color: #1445C7; }
.form-card.disabled {
  opacity: 0.6;
  pointer-events: none;
  background: #FAFBFC;
}

.card-num {
  font-size: 11px;
  font-weight: 700;
  color: #1445C7;
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
}
.form-card.disabled .card-num { color: #aaa; }

.card-body { flex: 1; }
.card-name {
  font-size: 14px;
  font-weight: 700;
  color: #1F232D;
  margin-bottom: 6px;
  line-height: 1.3;
}
.card-desc {
  font-size: 13px;
  color: #64748B;
  line-height: 1.5;
}

.card-cta {
  font-size: 13px;
  font-weight: 600;
  color: #1F232D;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.15s;
}

.soon-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: #EEF2FF;
  color: #1445C7;
  padding: 3px 8px;
  border-radius: 20px;
}

/* Footer */
.site-footer {
  text-align: center;
  font-size: 12px;
  color: #94A3B8;
  padding: 20px 24px;
  border-top: 1px solid #E1E4EA;
  background: #fff;
}
</style>
