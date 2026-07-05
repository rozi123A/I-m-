import { 
  Video, VideoOff, Mic, MicOff, Volume2, VolumeX, 
  PhoneOff, SkipForward, MessageSquare, Heart, 
  ShoppingBag, Gift, Zap, Square, Play, SwitchCamera, Lock
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import PremiumMessageBubble from "@/components/PremiumMessageBubble";
import GiftPanel from "@/components/GiftPanel";

export default function ChatRoom() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<'idle' | 'setup' | 'connecting' | 'waiting' | 'confirming' | 'matched'>('idle');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [showChat, setShowChat] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showGifts, setShowGifts] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [unread, setUnread] = useState(0);
  const [filterGender, setFilterGender] = useState('any');
  const [filterCountry, setFilterCountry] = useState('any');
  
  // Mock data/functions for UI demonstration
  const unreadDmCount = 0;
  const credits = 0;
  const walletQuery = { data: { wallet: 0 } };
  const spendGift = { isPending: false };
  const sendGift = () => {};
  const refetchUnread = () => {};
  const handleNext = () => {};
  const handleEnd = () => setLocation('/');
  const stopSession = () => setStatus('idle');
  const startSession = (g: string, c: string) => {
    setFilterGender(g);
    setFilterCountry(c);
    setStatus('waiting');
  };
  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleMic = () => setIsMicOn(!isMicOn);
  const toggleCamera = () => setFacingMode(f => f === 'user' ? 'environment' : 'user');

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden font-cairo">
      {/* ── Video Area (Top) ────────────────────────────────────────── */}
      <div className="flex-1 relative bg-gray-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500 text-sm">منطقة الفيديو</p>
        </div>
      </div>

      {/* ── Action Panel (Fixed at Bottom) ─────────────────────────── */}
      <div className="flex-shrink-0 bg-gray-900/95 backdrop-blur-2xl border-t border-white/10 px-4 pt-5 pb-8 safe-bottom rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        
        <div className="space-y-4">
          {/* ── Row 1 : التقنيات (Mic, Camera, Speaker, Background) ── */}
          <div className="grid grid-cols-4 gap-2.5">
            {/* Mic */}
            <button
              onClick={toggleMic}
              className={`flex flex-col items-center gap-2 pt-3 pb-2.5 rounded-[18px] transition-all duration-200 active:scale-95 hover:scale-[1.03] ${isMicOn ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/25' : 'bg-red-500/10 text-red-400 hover:bg-red-500/15'}`}
            >
              <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center shadow-md ${isMicOn ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-900/40' : 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-900/40'}`}>
                {isMicOn ? <Mic className="w-[18px] h-[18px] text-white" /> : <MicOff className="w-[18px] h-[18px] text-white" />}
              </div>
              <span className="text-[10.5px] font-bold tracking-wide">{isMicOn ? 'ميكروفون' : 'مكتوم'}</span>
            </button>

            {/* Camera */}
            <button
              onClick={toggleVideo}
              className={`flex flex-col items-center gap-2 pt-3 pb-2.5 rounded-[18px] transition-all duration-200 active:scale-95 hover:scale-[1.03] ${isVideoOn ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25' : 'bg-red-500/10 text-red-400 hover:bg-red-500/15'}`}
            >
              <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center shadow-md ${isVideoOn ? 'bg-gradient-to-br from-indigo-500 to-violet-700 shadow-violet-900/40' : 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-900/40'}`}>
                {isVideoOn ? <Video className="w-[18px] h-[18px] text-white" /> : <VideoOff className="w-[18px] h-[18px] text-white" />}
              </div>
              <span className="text-[10.5px] font-bold tracking-wide">{isVideoOn ? 'كاميرا' : 'مطفأة'}</span>
            </button>

            {/* Speaker */}
            <button
              onClick={() => setIsSpeakerOn(v => !v)}
              className={`flex flex-col items-center gap-2 pt-3 pb-2.5 rounded-[18px] transition-all duration-200 active:scale-95 hover:scale-[1.03] ${isSpeakerOn ? 'bg-teal-500/20 text-teal-300 hover:bg-teal-500/25' : 'bg-red-500/10 text-red-400 hover:bg-red-500/15'}`}
            >
              <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center shadow-md ${isSpeakerOn ? 'bg-gradient-to-br from-teal-500 to-cyan-600 shadow-teal-900/40' : 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-900/40'}`}>
                {isSpeakerOn ? <Volume2 className="w-[18px] h-[18px] text-white" /> : <VolumeX className="w-[18px] h-[18px] text-white" />}
              </div>
              <span className="text-[10.5px] font-bold tracking-wide">{isSpeakerOn ? 'صوت' : 'صامت'}</span>
            </button>

            {/* Camera Switch — الخلفية (Paid Premium) */}
            <button
              onClick={toggleCamera}
              className={`flex flex-col items-center gap-2 pt-3 pb-2.5 rounded-[18px] transition-all duration-200 active:scale-95 ${(user as any)?.isPremium ? 'bg-amber-500/15 text-yellow-300 hover:scale-[1.03] hover:bg-amber-500/22' : 'bg-white/[0.04] text-white/35 cursor-not-allowed'}`}
            >
              <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center shadow-md relative ${(user as any)?.isPremium ? 'bg-gradient-to-br from-yellow-400 to-amber-600 shadow-amber-900/40' : 'bg-gradient-to-br from-slate-600 to-slate-700'}`}>
                <SwitchCamera className={`w-[18px] h-[18px] ${(user as any)?.isPremium ? 'text-gray-900' : 'text-white/40'}`} />
                {!(user as any)?.isPremium && (
                  <Lock className="w-2.5 h-2.5 text-white/50 absolute top-1 right-1" />
                )}
              </div>
              <span className="text-[10.5px] font-bold tracking-wide leading-tight text-center">
                {(user as any)?.isPremium ? (facingMode === 'user' ? 'خلفية' : 'أمامية') : 'تبديل 🔒'}
              </span>
            </button>
          </div>

          {/* ── Row 2 : التفاعل (Chat, Friends, Store, Gift) ── */}
          <div className="grid grid-cols-4 gap-2.5">
            {/* Chat */}
            <button
              onClick={() => { setShowChat(v => !v); setUnread(0); }}
              className="relative flex flex-col items-center gap-2 pt-3 pb-2.5 rounded-[18px] bg-white/[0.07] text-emerald-300 transition-all duration-200 active:scale-95 hover:scale-[1.03] hover:bg-white/[0.11]"
            >
              <div className="w-11 h-11 rounded-[14px] flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-900/40 relative">
                <MessageSquare className="w-[18px] h-[18px] text-white" />
                {unread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-black border-2 border-gray-900 px-0.5">
                    {unread}
                  </span>
                )}
              </div>
              <span className="text-[10.5px] font-bold tracking-wide">دردشة</span>
            </button>

            {/* Friends */}
            <button
              onClick={() => { setShowFriends(v => !v); refetchUnread(); }}
              className="relative flex flex-col items-center gap-2 pt-3 pb-2.5 rounded-[18px] bg-white/[0.07] text-red-300 transition-all duration-200 active:scale-95 hover:scale-[1.03] hover:bg-white/[0.11]"
            >
              <div className="w-11 h-11 rounded-[14px] flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-600 shadow-md shadow-red-900/40 relative">
                <Heart className="w-[18px] h-[18px] text-white" />
                {unreadDmCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-gray-900 text-[9px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-black border-2 border-gray-900 px-0.5">
                    {unreadDmCount > 99 ? '99+' : unreadDmCount}
                  </span>
                )}
              </div>
              <span className="text-[10.5px] font-bold tracking-wide">أصدقاء</span>
            </button>

            {/* Store */}
            <button
              onClick={() => { sessionStorage.setItem('chat_auto_start', 'true'); setLocation('/store?from=chat'); }}
              className="flex flex-col items-center gap-2 pt-3 pb-2.5 rounded-[18px] bg-white/[0.07] text-fuchsia-300 transition-all duration-200 active:scale-95 hover:scale-[1.03] hover:bg-white/[0.11]"
            >
              <div className="w-11 h-11 rounded-[14px] flex items-center justify-center bg-gradient-to-br from-fuchsia-500 to-pink-700 shadow-md shadow-fuchsia-900/40">
                <ShoppingBag className="w-[18px] h-[18px] text-white" />
              </div>
              <span className="text-[10.5px] font-bold tracking-wide">المتجر</span>
            </button>

            {/* Gift */}
            <button
              onClick={() => status === 'matched' ? setShowGifts(v => !v) : undefined}
              disabled={status !== 'matched'}
              className={`flex flex-col items-center gap-2 pt-3 pb-2.5 rounded-[18px] transition-all duration-200 active:scale-95 ${status === 'matched' ? 'bg-orange-500/15 text-orange-300 hover:scale-[1.03] hover:bg-orange-500/22' : 'bg-white/[0.04] text-white/25 cursor-not-allowed'}`}
            >
              <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center shadow-md ${status === 'matched' ? 'bg-gradient-to-br from-orange-400 to-pink-600 shadow-orange-900/40' : 'bg-gradient-to-br from-slate-600 to-slate-700'}`}>
                <Gift className="w-[18px] h-[18px] text-white" />
              </div>
              <span className="text-[10.5px] font-bold tracking-wide">هدية</span>
            </button>
          </div>

          {/* ── Row 3 : التحكم الأساسي (Radar, Search Toggle) ── */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Star Radar Button */}
            <button
              onClick={() => {
                const isSearching = status === 'connecting' || status === 'waiting' || status === 'confirming';
                if (isSearching) {
                  stopSession();
                  toast.info("تم إيقاف البحث. اضغط على الرادار مرة أخرى لضبط الفلاتر.");
                  return;
                }
                setStatus('setup');
              }}
              className={`flex items-center justify-center gap-2.5 py-3.5 rounded-[18px] transition-all duration-200 active:scale-95 hover:scale-[1.02] font-bold text-[13px] tracking-wide ${filterCountry !== 'any' || filterGender !== 'any' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/[0.07] text-purple-300'}`}
            >
              <Zap className="w-4 h-4" />
              الرادار
            </button>

            {/* Quick start / Stop */}
            {(() => {
              const isSearching = status === 'connecting' || status === 'waiting' || status === 'confirming';
              const isMatched   = status === 'matched';
              return (
                <button
                  onClick={() => {
                    if (isMatched)        { handleNext(); }
                    else if (isSearching) { stopSession(); }
                    else                  { 
                      if (filterCountry !== 'any' || filterGender !== 'any') {
                        startSession(filterGender, filterCountry);
                      } else {
                        startSession('any', 'any');
                      }
                    }
                  }}
                  className={`flex items-center justify-center gap-2.5 py-3.5 rounded-[18px] font-bold text-[13px] tracking-wide transition-all duration-200 active:scale-95 shadow-lg ${
                    isSearching
                      ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-900/40 text-white animate-pulse hover:from-red-400 hover:to-rose-500'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-900/40 text-white hover:from-green-400 hover:to-emerald-500 hover:scale-[1.02]'
                  }`}
                >
                  {isSearching
                    ? <Square className="w-4 h-4 fill-white text-white" />
                    : <Play   className="w-4 h-4 fill-white text-white" />
                  }
                  {isSearching ? 'إيقاف البحث' : 'ابدأ مباشرة'}
                </button>
              );
            })()}
          </div>

          {/* Divider before final action row */}
          <div className="h-px bg-white/10 mx-1" />

          {/* ── Row 4 : التحكم في الجلسة (Next, End Call) ── */}
          <div className="flex items-stretch gap-2.5">
            {/* Next */}
            <button
              onClick={handleNext}
              disabled={status === 'connecting' || status === 'waiting' || status === 'confirming'}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[18px] bg-gradient-to-r from-amber-400 to-yellow-400 text-gray-900 font-bold text-sm tracking-wide shadow-md shadow-amber-900/25 hover:brightness-105 hover:shadow-amber-900/35 disabled:opacity-35 disabled:cursor-not-allowed active:scale-[0.97] transition-all duration-150"
            >
              <SkipForward className="w-4 h-4 flex-shrink-0" />
              التالي — شخص جديد
            </button>

            {/* End Call */}
            <button
              onClick={handleEnd}
              className="flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-[18px] bg-gradient-to-br from-red-500 to-rose-600 text-white font-bold text-sm shadow-md shadow-red-900/30 hover:brightness-105 active:scale-[0.97] transition-all duration-150"
            >
              <PhoneOff className="w-4 h-4 flex-shrink-0" />
              <span className="tracking-wide">إنهاء</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
