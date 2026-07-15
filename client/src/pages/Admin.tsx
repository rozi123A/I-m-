import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import {
  Users, Globe, Crown, RefreshCw, ArrowLeft, Lock, Shield,
  Eye, EyeOff, Video, Radio, X, MonitorPlay, Trash2, Play,
  Download, Wallet, Check, Ban, Star, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';

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

function fmtDate(ts: number) {
  return new Date(ts).toLocaleString('ar-EG', { hour12: true, month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
}
function fmtSize(b: number) {
  if (b > 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(b / 1024)} KB`;
}

/* ══════════════════════════════════════════════════════════
   Password Gate
══════════════════════════════════════════════════════════ */
function PasswordGate({ onVerified }: { onVerified: () => void }) {
  const [secret, setSecret] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();

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
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-200">
              <Lock className="w-7 h-7 text-white" />
            </div>

            <h1 className="text-2xl font-black text-gray-900 mb-1">لوحة الإدارة</h1>
            <p className="text-gray-500 text-sm mb-7">أدخل كلمة المرور للدخول</p>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-right">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            )}

            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={secret}
                  onChange={e => setSecret(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="كلمة المرور"
                  dir="ltr"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-10 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={handleSubmit}
                disabled={verifyMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold px-5 py-3 rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all shadow-md shadow-purple-200 disabled:opacity-60 flex-shrink-0"
              >
                {verifyMutation.isPending ? '...' : 'دخول'}
              </button>
            </div>

            <button
              onClick={() => setLocation('/')}
              className="text-gray-400 text-sm hover:text-purple-600 transition-colors flex items-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Reset VIPs Button
══════════════════════════════════════════════════════════ */
function ResetVipsButton() {
  const resetMutation = trpc.gifts.resetAllVips.useMutation({
    onSuccess: () => toast.success("تم سحب VIP من جميع المستخدمين بنجاح"),
    onError: (e) => toast.error(`فشل العملية: ${e.message}`),
  });

  return (
    <button
      onClick={() => confirm("هل أنت متأكد من سحب VIP من جميع المستخدمين؟") && resetMutation.mutate()}
      disabled={resetMutation.isPending}
      className="text-xs font-bold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg px-3 py-1.5 transition-colors"
    >
      {resetMutation.isPending ? "جاري السحب..." : "سحب VIP من الكل"}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   Revoke User VIP Button
══════════════════════════════════════════════════════════ */
function RevokeUserVipButton({ userId }: { userId: number }) {
  const revokeMutation = trpc.gifts.revokeVip.useMutation({
    onSuccess: () => toast.success("تم سحب VIP من المستخدم"),
    onError: (e) => toast.error(e.message),
  });

  return (
    <button
      onClick={(e) => { e.stopPropagation(); revokeMutation.mutate({ userId }); }}
      disabled={revokeMutation.isPending}
      title="سحب VIP"
      className="text-red-400 hover:text-red-600 transition-colors p-0.5"
    >
      <X className="w-3 h-3" />
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   Stats Tab
══════════════════════════════════════════════════════════ */
function StatsTab() {
  const { data: stats, isLoading, refetch } = trpc.admin.countryStats.useQuery();
  const { data: recent } = trpc.admin.newRegistrations.useQuery(50);

  if (isLoading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );

  const totalUsers = recent?.length || 0;
  const vipCount = recent?.filter(u => u.isPremium).length || 0;

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-5 text-center">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-purple-600 text-xs font-bold mb-1">إجمالي المستخدمين</p>
          <p className="text-gray-900 text-3xl font-black">{totalUsers}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-5 text-center">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Crown className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-yellow-600 text-xs font-bold mb-1">أعضاء VIP</p>
          <p className="text-gray-900 text-3xl font-black">{vipCount}</p>
        </div>
      </div>

      {/* Country stats */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-500" />
            <h3 className="font-black text-gray-900 text-base">المستخدمون حسب الدولة</h3>
          </div>
          <div className="flex items-center gap-2">
            <ResetVipsButton />
            <button onClick={() => refetch()} className="text-purple-500 hover:text-purple-700 transition-colors p-1">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {stats?.map(s => (
            <div key={s.country} className="flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-purple-50 rounded-xl transition-colors">
              <span className="text-sm font-semibold text-gray-700">{COUNTRY_NAMES[s.country] || s.country}</span>
              <span className="text-sm font-black text-purple-600">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent registrations */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-purple-500" />
          <h3 className="font-black text-gray-900 text-base">آخر التسجيلات</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {recent?.map(u => (
            <div key={u.id} className="flex items-center gap-3 py-3">
              <img
                src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`}
                alt={u.name || ''}
                className="w-10 h-10 rounded-xl object-cover border border-gray-200 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{u.name}</p>
                <p className="text-xs text-gray-400">{u.gender} • {u.age} سنة • {u.country}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <p className="text-xs text-gray-400">{timeAgo(u.createdAt)}</p>
                {u.isPremium && (
                  <div className="flex items-center gap-1">
                    <Crown className="w-3 h-3 text-yellow-500" />
                    {u.role !== 'admin' && <RevokeUserVipButton userId={u.id} />}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Payments Tab
══════════════════════════════════════════════════════════ */
function PaymentsTab() {
  const { data: payments, refetch, isLoading } = trpc.gifts.getPendingPayments.useQuery();
  const handleMutation = trpc.gifts.handlePaymentRequest.useMutation({
    onSuccess: () => { toast.success("تم تحديث حالة الطلب بنجاح"); refetch(); },
    onError: (e) => toast.error(`فشل التحديث: ${e.message}`),
  });

  const handleAction = (requestId: number, status: 'approved' | 'rejected') => {
    if (!confirm(`هل أنت متأكد من ${status === 'approved' ? 'قبول' : 'رفض'} هذا الطلب؟`)) return;
    handleMutation.mutate({ requestId, status });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      {!payments?.length ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-semibold">لا توجد طلبات دفع معلقة</p>
        </div>
      ) : payments.map((pay) => (
        <div key={pay.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-black text-gray-900 text-base">{pay.userName || 'مستخدم'}</h3>
              <p className="text-xs text-gray-400 mt-0.5">ID: {pay.userId} • {timeAgo(pay.createdAt)}</p>
            </div>
            <span className={`text-xs font-black px-3 py-1 rounded-full ${pay.itemType === 'vip' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {pay.itemType === 'vip' ? '👑 PREMIUM VIP' : `⭐ STARS (${pay.itemAmount})`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
            <div>
              <p className="text-gray-400 text-xs font-bold mb-1">المبلغ</p>
              <p className="text-green-600 font-black">{pay.amount}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold mb-1">الوسيلة</p>
              <p className="text-orange-500 font-bold text-sm">{pay.method === 'binance_pay' ? 'Binance Pay' : 'USDT (TRC20)'}</p>
            </div>
            <div className="col-span-2 border-t border-gray-200 pt-3 mt-1">
              <p className="text-gray-400 text-xs font-bold mb-1">رقم المعاملة (TXID)</p>
              <code className="text-gray-700 text-xs break-all">{pay.transactionId}</code>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleAction(pay.id, 'approved')}
              disabled={handleMutation.isPending}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-60 shadow-sm shadow-green-200"
            >
              <Check className="w-4 h-4" /> قبول وتفعيل
            </button>
            <button
              onClick={() => handleAction(pay.id, 'rejected')}
              disabled={handleMutation.isPending}
              className="flex-1 bg-red-50 text-red-600 border border-red-200 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-all disabled:opacity-60"
            >
              <Ban className="w-4 h-4" /> رفض الطلب
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Active Call types
══════════════════════════════════════════════════════════ */
interface ActiveCall {
  peerId1: string; peerId2: string;
  name1: string; name2: string;
  avatar1: string; avatar2: string;
}
interface RecMeta {
  sessionId: string; name1: string; name2: string;
  startTime: number; size: number;
}

/* ══════════════════════════════════════════════════════════
   Call Watcher (SSE)
══════════════════════════════════════════════════════════ */
function CallWatcher({ call, token, onClose }: { call: ActiveCall; token: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <h3 className="font-black text-gray-900">مراقبة المكالمة</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center justify-center gap-4 py-6 bg-gray-50 rounded-2xl mb-4">
          <div className="text-center">
            <img src={call.avatar1} alt={call.name1} className="w-14 h-14 rounded-2xl mx-auto mb-2 object-cover border-2 border-purple-200" />
            <p className="text-sm font-bold text-gray-800">{call.name1}</p>
          </div>
          <div className="text-gray-400 font-black text-lg">↔</div>
          <div className="text-center">
            <img src={call.avatar2} alt={call.name2} className="w-14 h-14 rounded-2xl mx-auto mb-2 object-cover border-2 border-pink-200" />
            <p className="text-sm font-bold text-gray-800">{call.name2}</p>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400">المراقبة المباشرة عبر SSE</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Calls Tab
══════════════════════════════════════════════════════════ */
function CallsTab({ token }: { token: string }) {
  const [calls, setCalls] = useState<ActiveCall[]>([]);
  const [watching, setWatching] = useState<ActiveCall | null>(null);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const r = await fetch(`/api/admin/active-calls?token=${encodeURIComponent(token)}`);
        const d = await r.json();
        setCalls(d.calls || []);
      } catch {}
    };
    fetchCalls();
    const id = setInterval(fetchCalls, 5000);
    return () => clearInterval(id);
  }, [token]);

  return (
    <div>
      {watching && <CallWatcher call={watching} token={token} onClose={() => setWatching(null)} />}

      {!calls.length ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <Video className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-semibold">لا توجد مكالمات نشطة الآن</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {calls.map((c, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 text-center hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-3">
                <img src={c.avatar1} alt={c.name1} className="w-10 h-10 rounded-xl border-2 border-white shadow-sm object-cover" />
                <img src={c.avatar2} alt={c.name2} className="w-10 h-10 rounded-xl border-2 border-white shadow-sm object-cover -mr-3" />
              </div>
              <p className="text-sm font-bold text-gray-800 mb-3">{c.name1} ↔ {c.name2}</p>
              <button
                onClick={() => setWatching(c)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 hover:from-purple-700 hover:to-pink-600 transition-all"
              >
                <Radio className="w-3.5 h-3.5" /> مراقبة مباشرة
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Recordings Tab
══════════════════════════════════════════════════════════ */
function RecordingsTab({ token }: { token: string }) {
  const [recs, setRecs] = useState<RecMeta[]>([]);
  const [playing, setPlaying] = useState<RecMeta | null>(null);

  const fetchRecs = async () => {
    try {
      const r = await fetch(`/api/admin/recordings?token=${encodeURIComponent(token)}`);
      const d = await r.json();
      setRecs(d.recordings || []);
    } catch {}
  };

  useEffect(() => { fetchRecs(); }, []);

  return (
    <div className="space-y-3">
      {playing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPlaying(null)}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-900">{playing.name1} ↔ {playing.name2}</h3>
              <button onClick={() => setPlaying(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <video
              src={`/api/admin/recording/${playing.sessionId}?token=${encodeURIComponent(token)}`}
              controls autoPlay
              className="w-full rounded-2xl bg-gray-900"
            />
          </div>
        </div>
      )}

      {!recs.length ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <MonitorPlay className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-semibold">لا توجد تسجيلات محفوظة</p>
        </div>
      ) : recs.map(r => (
        <div key={r.sessionId} className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <MonitorPlay className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{r.name1} ↔ {r.name2}</p>
            <p className="text-xs text-gray-400">{fmtDate(r.startTime)} • {fmtSize(r.size)}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={`/api/admin/recording/${r.sessionId}?token=${encodeURIComponent(token)}`}
              download
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={() => setPlaying(r)}
              className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Main Admin Page
══════════════════════════════════════════════════════════ */
export default function Admin() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'stats' | 'calls' | 'payments' | 'recordings'>('stats');
  const [isVerified, setIsVerified] = useState(false);
  const token = sessionStorage.getItem(ADMIN_SESSION_KEY);

  useEffect(() => {
    if (token) setIsVerified(true);
  }, [token]);

  if (!isVerified) return <PasswordGate onVerified={() => setIsVerified(true)} />;

  const tabs = [
    { id: 'stats',      label: 'الإحصائيات',    icon: Globe,       badge: null },
    { id: 'payments',   label: 'الطلبات المالية', icon: Wallet,      badge: 'جديد' },
    { id: 'calls',      label: 'المكالمات',      icon: Video,       badge: null },
    { id: 'recordings', label: 'التسجيلات',      icon: MonitorPlay, badge: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />

      {/* Page header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-purple-200">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-gray-900 text-lg leading-tight">لوحة الإدارة</h1>
              <p className="text-xs text-gray-400">إدارة المستخدمين والمحتوى</p>
            </div>
          </div>
          <button
            onClick={() => setLocation('/')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            الموقع
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto pb-0 scrollbar-hide">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                  active
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.badge && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'stats'      && <StatsTab />}
        {activeTab === 'payments'   && <PaymentsTab />}
        {activeTab === 'calls'      && <CallsTab token={token!} />}
        {activeTab === 'recordings' && <RecordingsTab token={token!} />}
      </div>
    </div>
  );
}
