"use client";

import "./dashboard.css";


// ================= TYPES =================

export type Owner = {
  name: string;
  role?: string;
  membership?: string;
  avatar?: string;
};

export type FinancialData = {
  monthlyIncome: number;
  occupied: number;
  totalUnits: number;
  available: number;
  months?: string[];
};

export type RequestData = {
  id: string | number;
  initials?: string;
  name: string;
  property: string;
  status: string;
};

export type PaymentData = {
  id: string | number;
  initials?: string;
  name: string;
  date: string;
  amount: number;
  status: string;
};

export type AttentionData = {
  id: string | number;
  title: string;
  description: string;
  action: string;
  type?: "warning" | "normal";
};

export type OwnerDashboardData = {
  owner: Owner;
  financial: FinancialData;
  attention: AttentionData[];
  requests: RequestData[];
  payments: PaymentData[];
  totalProperties: number;
};


// ================= ICONS =================

function SearchIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function PropertyIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 21h18" />
      <path d="M5 21V8l7-5 7 5v13" />
      <path d="M9 21v-6h6v6" />
      <path d="M9 10h.01M15 10h.01" />
    </svg>
  );
}

function RequestIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 5h16v14H4z" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.6h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V6h2.6v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v2.6H21a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 3v18" />
    </svg>
  );
}


// ================= HELPER =================

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}


// ================= COMPONENT =================

export type OwnerDashboardProps = {
  data: OwnerDashboardData;
};

export default function OwnerDashboard({
  data,
}: OwnerDashboardProps) {
  const {
    owner,
    financial,
    attention,
    requests,
    payments,
    totalProperties,
  } = data;

  return (
    <main className="dashboard-page">
      <aside className="sidebar">
        <div className="brand">SpotNest</div>

        <div className="owner-profile">
          <div className="profile-image">
            {owner.avatar ? (
              <img src={owner.avatar} alt={owner.name} />
            ) : (
              getInitials(owner.name)
            )}
          </div>
          <div className="profile-info">
            <h4>{owner.name}</h4>
            <p>{owner.role ?? "Property Owner"}</p>
            {owner.membership && <span>{owner.membership}</span>}
          </div>
        </div>

        <nav className="main-navigation">
          <a className="nav-item active">
            <DashboardIcon />
            <span>Dashboard</span>
          </a>
          <a className="nav-item">
            <PropertyIcon />
            <span>Properties</span>
          </a>
          <a className="nav-item">
            <RequestIcon />
            <span>Requests</span>
          </a>
          <a className="nav-item">
            <PaymentIcon />
            <span>Payments</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <a className="nav-item">
            <SettingsIcon />
            <span>Settings</span>
          </a>
          <a className="nav-item">
            <span className="help-icon">?</span>
            <span>Help & Support</span>
          </a>
          <a className="nav-item logout">
            <LogoutIcon />
            <span>Logout</span>
          </a>
        </div>
      </aside>

      <section className="main-area">
        <header className="top-header">
          <div className="search-box">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search properties, tenants..."
            />
          </div>

          <button className="notification-button">
            <BellIcon />
            <span className="notification-dot"></span>
          </button>
        </header>

        <div className="dashboard-content">
          <div className="welcome-row">
            <div>
              <h1>Welcome back, {owner.name}</h1>
              <p>Here's what's happening with your properties today.</p>
            </div>
            <div className="welcome-actions">
              <button className="secondary-button">
                <span>◉</span>View Requests
              </button>
              <button className="primary-button">
                <span>＋</span>Add Property
              </button>
            </div>
          </div>

          <div className="top-dashboard-grid">
            <section className="card financial-card">
              <div className="card-header">
                <h2>Financial Overview</h2>
                <button className="period-button">Last 6 Months⌄</button>
              </div>

              <div className="financial-stats">
                <div className="income-stat">
                  <span>Monthly Income</span>
                  <strong>{formatCurrency(financial.monthlyIncome)}</strong>
                </div>

                <div className="occupied-stat">
                  <span>Occupied</span>
                  <strong>
                    {financial.occupied}
                    <small>/ {financial.totalUnits}</small>
                  </strong>
                </div>

                <div className="available-stat">
                  <span>Available</span>
                  <strong>{financial.available}</strong>
                </div>
              </div>

              <div className="chart">
                <div className="chart-line"></div>
                <div className="chart-line"></div>
                <div className="chart-line"></div>
                <div className="chart-line"></div>
                <div className="months">
                  {(financial.months ?? []).map((month) => (
                    <span key={month}>{month}</span>
                  ))}
                </div>
              </div>
            </section>

            <div className="right-top-column">
              <section className="card attention-card">
                <h2>
                  <span className="warning-icon">!</span>Attention
                </h2>

                {attention.map((item) => (
                  <div key={item.id} className="attention-item">
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                    </div>
                    <button>{item.action}</button>
                  </div>
                ))}
              </section>

              <section className="total-properties-card">
                <p>Total Properties Managed</p>
                <div>
                  <strong>{totalProperties}</strong>
                  <span>units</span>
                </div>
              </section>
            </div>
          </div>

          <div className="bottom-grid">
            <section className="card recent-card">
              <div className="card-header">
                <h2>Recent Requests</h2>
                <button className="view-all">View All</button>
              </div>

              <div className="request-list">
                {requests.map((request) => (
                  <div key={request.id} className="request-row">
                    <div className="person-avatar">
                      {request.initials ?? getInitials(request.name)}
                    </div>
                    <div className="person-details">
                      <strong>{request.name}</strong>
                      <span>◉ {request.property}</span>
                    </div>
                    <span className="status-badge">{request.status}</span>
                  </div>
                ))}

                {requests.length === 0 && (
                  <p className="empty-message">No recent requests</p>
                )}
              </div>
            </section>

            <section className="card recent-card">
              <div className="card-header">
                <h2>Recent Payments</h2>
                <button className="view-all">View All</button>
              </div>

              <div className="payment-list">
                {payments.map((payment) => (
                  <div key={payment.id} className="payment-row">
                    <div className="payment-avatar">
                      {payment.initials ?? getInitials(payment.name)}
                    </div>
                    <div className="payment-details">
                      <strong>{payment.name}</strong>
                      <span>{payment.date}</span>
                    </div>
                    <div className="payment-amount">
                      <strong>{formatCurrency(payment.amount)}</strong>
                      <span>{payment.status}</span>
                    </div>
                  </div>
                ))}

                {payments.length === 0 && (
                  <p className="empty-message">No recent payments</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
