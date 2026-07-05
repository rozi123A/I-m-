import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { Users, Globe, Crown, RefreshCw, ArrowRight, Lock, Shield, Eye, EyeOff } from 'lucide-react';

const ADMIN_SESSION_KEY = 'admin_mode';

const COUNTRY_NAMES: Record<string, string> = {
  SA:'السعودية 🇸🇦', AE:'الإمارات 🇦🇪', EG:'مصر 🇪🇬', KW:'الكويت 🇰🇼',
  QA:'قطر 🇶🇦', BH:'البحرين 🇧🇭', OM:'عمان 🇴🇲', JO:'الأردن 🇯🇴',
  LB:'لبنان 🇱🇧', IQ:'العراق 🇮🇶', SY:'سوريا 🇸🇾', MA:'المغرب 🇲🇦',
  DZ:'الجزائر 🇩🇿', TN:'تونس 🇹🇳', LY:'ليبيا 🇱🇾', YE:'اليمن 🇾🇪',
  SD:'السودان 🇸🇩', TR:'تركيا 🇹🇷', PK:'باكستان 🇵🇰', IN:'الهند 🇮🇳',
  US:'أمريكا 🇺🇸', GB:'بريطانيا 🇬🇧', DE:'ألمانيا 🇩🇪', FR:'فرنسا 🇫🇷',
  AR:'الأرجنتين 🇦🇷', EC:'الإكوادور 🇪🇨',
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'الآن';
  if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
  if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
  return `منذ ${Math.floor(seconds / 86400)} يوم`;
}

/* ══════════════════════════════════════════════════════════
   Password Gate — independent of user role
══════════════════════════════════════════════════════════ */
function PasswordGate({ onVerified }: { onVerified: () => void }) {
  const [secret, setSecret] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const verifyMutation = trpc.admin.verifySecret.useMutation({
    onSuccess: (data) => {
      if (data.verified) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, data.token);
        onVerified();
      }
    },
    onError: (e) => setError(e.message),
  });

  const activateMutation = trpc.admin.activate.useMutation();

  const handleSubmit = () => {
    setError('');
    if (!secret.trim()) return;
    verifyMutation.mutate(
      { secret: secret.trim() },
      {
        onSuccess: () => {
          activateMutation.mutate({ secret: secret.trim() });
        },
      }
    );
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%', backgroundColor: '#030712',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%', maxWidth: '380px',
        backgroundColor: '#111827',
        border: '1px solid #374151',
        borderRadius: '20px', padding: '32px 24px', textAlign: 'center',
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '16px',
          backgroundColor: '#7c3aed',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Lock style={{ width: '28px', height: '28px', color: 'white' }} />
        </div>

        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 900, marginBottom: '6px' }}>
          لوحة الإدارة
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '28px' }}>
          أدخل كلمة المرور للدخول
        </p>

        {error && (
          <div style={{
            backgroundColor: '#451a1a', border: '1px solid #991b1b',
            borderRadius: '10px', padding: '10px 14px', marginBottom: '16px',
            color: '#fca5a5', fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type={showPw ? 'text' : 'password'}
              value={secret}
              onChange={e => setSecret(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="كلمة المرور"
              dir="ltr"
              style={{
                width: '100%', boxSizing: 'border-box',
                backgroundColor: '#1f2937',
                border: '1px solid #4b5563',
                borderRadius: '12px', padding: '12px 40px 12px 14px',
                color: 'white', fontSize: '15px', outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              style={{
                position: 'absolute', left: '12px', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#9ca3af', padding: 0,
              }}
            >
              {showPw
                ? <EyeOff style={{ width: '16px', height: '16px' }} />
                : <Eye style={{ width: '16px', height: '16px' }} />
              }
            </button>
          </div>
          <button
            onClick={handleSubmit}
            disabled={verifyMutation.isPending}
            style={{
              backgroundColor: '#7c3aed', color: 'white', border: 'none',
              borderRadius: '12px', padding: '12px 20px',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              opacity: verifyMutation.isPending ? 0.6 : 1,
              flexShrink: 0,
            }}
          >
            {verifyMutation.isPending ? '...' : 'دخول'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Admin Dashboard
══════════════════════════════════════════════════════════ */
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [, setLocation] = useLocation();

  const { data: registrations, isLoading: regLoading, refetch, isFetching } =
    trpc.admin.newRegistrations.useQuery(50, { refetchInterval: 30_000 });

  const { data: countryStats } =
    trpc.admin.countryStats.useQuery(undefined, { refetchInterval: 30_000 });

  const totalUsers = registrations?.length ?? 0;
  const premiumCount = registrations?.filter(u => u.isPremium).length ?? 0;
  const todayCount = registrations?.filter(u => {
    const d = new Date(u.createdAt);
    return d.toDateString() === new Date().toDateString();
  }).length ?? 0;
  const maxCount = Math.max(...(countryStats?.map(s => s.count) ?? [1]), 1);

  if (regLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #a855f7', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#030712', color: 'white' }}>
      <div style={{ padding: '16px', maxWidth: '672px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingTop: '16px' }}>
          <button onClick={() => setLocation('/')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px' }}>
            <ArrowRight style={{ width: '20px', height: '20px' }} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 900 }}>لوحة الإدارة</h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>مراقبة التسجيلات والدول</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => refetch()}
              style={{
                padding: '8px', borderRadius: '10px', background: '#1f2937',
                border: 'none', cursor: 'pointer', color: 'white',
                animation: isFetching ? 'spin 0.8s linear infinite' : 'none',
              }}
            >
              <RefreshCw style={{ width: '16px', height: '16px' }} />
            </button>
            <button
              onClick={() => { sessionStorage.removeItem(ADMIN_SESSION_KEY); onLogout(); }}
              style={{
                padding: '8px 14px', borderRadius: '10px',
                background: '#450a0a', border: '1px solid #991b1b',
                cursor: 'pointer', color: '#fca5a5', fontSize: '12px', fontWeight: 700,
              }}
            >
              خروج
            </button>
          </div>
        </div>

        {/* Admin badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          backgroundColor: '#1e1b4b', border: '1px solid #4338ca',
          borderRadius: '12px', padding: '10px 14px', marginBottom: '20px',
        }}>
          <Shield style={{ width: '18px', height: '18px', color: '#a78bfa' }} />
          <span style={{ color: '#c4b5fd', fontSize: '13px', fontWeight: 700 }}>دخلت كمدير — صلاحيات كاملة</span>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: '#4c1d95', border: '1px solid #7c3aed', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
            <Users style={{ width: '20px', height: '20px', color: '#c084fc', margin: '0 auto 4px' }} />
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: 'white' }}>{totalUsers}</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#d8b4fe' }}>المستخدمون</p>
          </div>
          <div style={{ backgroundColor: '#713f12', border: '1px solid #a16207', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
            <Crown style={{ width: '20px', height: '20px', color: '#facc15', margin: '0 auto 4px' }} />
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: 'white' }}>{premiumCount}</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#fde047' }}>Premium</p>
          </div>
          <div style={{ backgroundColor: '#064e3b', border: '1px solid #059669', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
            <Globe style={{ width: '20px', height: '20px', color: '#4ade80', margin: '0 auto 4px' }} />
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: 'white' }}>{todayCount}</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#86efac' }}>اليوم</p>
          </div>
        </div>

        {/* Country Stats */}
        {countryStats && countryStats.length > 0 && (
          <div style={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe style={{ width: '16px', height: '16px', color: '#60a5fa' }} />
              المستخدمون حسب الدولة
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {countryStats.map(s => (
                <div key={s.country} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', width: '110px', textAlign: 'right', color: '#e5e7eb', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {COUNTRY_NAMES[s.country] ?? s.country}
                  </span>
                  <div style={{ flex: 1, height: '8px', backgroundColor: '#374151', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', backgroundColor: '#9333ea', borderRadius: '99px', width: `${(s.count / maxCount) * 100}%`, transition: 'width 0.5s' }} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', width: '24px', textAlign: 'left', flexShrink: 0 }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Registrations List */}
        <div style={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #1f2937' }}>
            <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users style={{ width: '16px', height: '16px', color: '#c084fc' }} />
              آخر التسجيلات
            </h2>
          </div>
          {registrations && registrations.length > 0 ? (
            <div>
              {registrations.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid #1f2937' }}>
                  <img
                    src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1f2937', flexShrink: 0 }}
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.name || 'مجهول'}
                      </span>
                      {u.isPremium && <Crown style={{ width: '12px', height: '12px', color: '#facc15', flexShrink: 0 }} />}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {u.country ? (COUNTRY_NAMES[u.country] ?? u.country) : '🌍 غير معروفة'}
                      </span>
                      <span style={{ color: '#374151', fontSize: '10px' }}>•</span>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>{u.loginMethod ?? 'guest'}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#4b5563', flexShrink: 0 }}>
                    {timeAgo(u.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '48px', textAlign: 'center', color: '#4b5563', fontSize: '14px' }}>
              لا يوجد مستخدمون حتى الآن
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', color: '#374151', fontSize: '11px', marginTop: '16px', paddingBottom: '24px' }}>
          يتحدث تلقائياً كل 30 ثانية
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Main Export — routes between gate and dashboard
══════════════════════════════════════════════════════════ */
export default function Admin() {
  const [verified, setVerified] = useState(() =>
    !!sessionStorage.getItem(ADMIN_SESSION_KEY)
  );

  if (!verified) {
    return <PasswordGate onVerified={() => setVerified(true)} />;
  }

  return <AdminDashboard onLogout={() => setVerified(false)} />;
}
