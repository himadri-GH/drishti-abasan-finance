import styles from "./page.module.css";
import { getDashboardData, getPaymentOptions } from "@/db/dashboard";
import { PaymentForm } from "./payment-form";
import { UnitSetupForm } from "./unit-setup-form";
import { ExpenseForm } from "./expense-form";

export const dynamic = "force-dynamic";

const money = (amount: number) => `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default async function Home() {
  const dashboard = await getDashboardData("2026-08");
  const paymentOptions = await getPaymentOptions();
  const collectionPercent = dashboard.expected ? Math.round((dashboard.collected / dashboard.expected) * 100) : 0;

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>DA</span>
          <span><strong>Drishti</strong><small>Abasan finance</small></span>
        </div>
        <div className={styles.sectionLabel}>Workspace</div>
        <nav className={styles.nav} aria-label="Main navigation">
          <a className={styles.active} href="#overview"><span>◈</span> Overview</a>
          <a href="#collections"><span>◌</span> Collections <b>12</b></a>
          <a href="/expenses"><span>↗</span> Expenses</a>
          <a href="/units"><span>⌂</span> Units & owners</a>
          <a href="/reports"><span>▥</span> Reports</a>
        </nav>
        <div className={styles.sectionLabel}>Manage</div>
        <nav className={styles.nav} aria-label="Management navigation">
          <a href="#staff"><span>♙</span> Vendors & staff</a>
          <a href="#settings"><span>⚙</span> Society settings</a>
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.sync}><span className={styles.dot} /> Cloud sync active <small>· Turso</small></div>
          <div className={styles.user}><span>AR</span><div><strong>Admin</strong><small>Building committee</small></div><i>•••</i></div>
        </div>
      </aside>

      <main className={styles.content} id="overview">
        <header className={styles.header}>
          <div><p className={styles.eyebrow}>Thursday, 21 August 2026</p><h1>Good morning, Admin <span>✦</span></h1></div>
          <div className={styles.headerActions}><button className={styles.iconButton} aria-label="Notifications">♢</button>{paymentOptions.length === 0 && <UnitSetupForm />}<ExpenseForm /><PaymentForm options={paymentOptions} /></div>
        </header>

        <section className={styles.heroGrid} aria-label="Financial overview">
          <div className={`${styles.panel} ${styles.balancePanel}`}>
            <div className={styles.panelTop}><div><p className={styles.eyebrow}>Total liquid balance</p><h2>{money(dashboard.balance)}<span>.00</span></h2></div><span className={styles.period}>August 2026⌄</span></div>
            <div className={styles.chart} aria-label="Balance trend chart"><span className={styles.chartLine} /><span className={styles.chartFill} /><div className={styles.chartLabels}><small>01 Aug</small><small>08 Aug</small><small>15 Aug</small><small>21 Aug</small></div></div>
            <div className={styles.balanceFooter}><span><i className={styles.incomeDot} /> Inflow <strong>{money(dashboard.inflow)}</strong></span><span><i className={styles.expenseDot} /> Outflow <strong>{money(dashboard.outflow)}</strong></span><span className={styles.positive}>{dashboard.inflow || dashboard.outflow ? "Live" : "Ready"} <small>from Turso</small></span></div>
          </div>
          <div className={`${styles.panel} ${styles.collectionPanel}`} id="collections">
            <div className={styles.panelTop}><div><p className={styles.eyebrow}>August collections</p><h3>{money(dashboard.collected)}</h3></div><span className={styles.successBadge}>{dashboard.expected ? "On track" : "Set up charges"}</span></div>
            <div className={styles.progressTrack}><span style={{ width: `${collectionPercent}%` }} /></div><div className={styles.collectionMeta}><strong>{collectionPercent}%</strong><span>of {money(dashboard.expected)} expected</span></div>
            <div className={styles.collectionStats}><div><strong>{dashboard.paidUnits}</strong><small>Paid units</small></div><div><strong>{dashboard.awaiting}</strong><small>Awaiting</small></div><div><strong>{dashboard.overdue}</strong><small>Overdue</small></div></div>
            <a className={styles.textLink} href="#collections">View collection list <span>↗</span></a>
          </div>
        </section>

        <section className={styles.lowerGrid}>
          <div className={`${styles.panel} ${styles.activityPanel}`} id="expenses">
            <div className={styles.panelHeading}><div><p className={styles.eyebrow}>Treasury snapshot</p><h3>Recent activity</h3></div><button className={styles.quietButton}>View ledger <span>↗</span></button></div>
            <div className={styles.activityList}>{dashboard.payments.length ? dashboard.payments.map((item) => <div className={styles.activityRow} key={`${item.label}-${item.amount}`}><span className={`${styles.activityIcon} ${styles[item.tone]}`}>↓</span><div><strong>{item.label}</strong><small>{item.detail}</small></div><b className={styles[item.tone]}>+{money(item.amount)}</b></div>) : <div className={styles.emptyState}>No payments recorded yet. Start with a payment receipt.</div>}</div>
          </div>
          <div className={`${styles.panel} ${styles.actionsPanel}`}>
            <div className={styles.panelHeading}><div><p className={styles.eyebrow}>Quick actions</p><h3>Keep things moving</h3></div></div>
            <div className={styles.actionList}><a href="#payment"><span>＋</span><div><strong>Record a payment</strong><small>Issue a digital receipt</small></div><b>→</b></a><a href="#expense"><span>↗</span><div><strong>Add an expense</strong><small>Log a voucher or bill</small></div><b>→</b></a><a href="#report"><span>▥</span><div><strong>Generate report</strong><small>Monthly balance sheet</small></div><b>→</b></a></div>
          </div>
        </section>

        <footer className={styles.footer}><span>Drishti Abasan · Finance workspace</span><span>Last synced just now <i className={styles.dot} /></span></footer>
      </main>
    </div>
  );
}
