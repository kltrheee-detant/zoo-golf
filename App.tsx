
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  FileText, 
  Wallet, 
  LayoutDashboard, 
  Plus, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { ViewType, Member, Meeting, Notice, FinancialRecord, AttendanceStatus } from './types';
import { geminiService } from './services/geminiService';

// Initial Data
const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: '김회장', role: '회장', phoneNumber: '010-1234-5678' },
  { id: '2', name: '이총무', role: '총무', phoneNumber: '010-2345-6789' },
  { id: '3', name: '박회원', role: '회원', phoneNumber: '010-3456-7890' },
  { id: '4', name: '최회원', role: '회원', phoneNumber: '010-4567-8901' },
];

const INITIAL_NOTICES: Notice[] = [
  { id: '1', title: '3월 정기 라운딩 안내', content: '이번 3월 정기 라운딩은 OO CC에서 진행됩니다. 많은 참석 부탁드립니다.', date: '2024-03-01', isImportant: true },
  { id: '2', title: '연회비 납부 안내', content: '2024년도 연회비를 기한 내에 납부해주시기 바랍니다.', date: '2024-02-15', isImportant: false },
];

const INITIAL_FINANCES: FinancialRecord[] = [
  { id: '1', date: '2024-03-01', description: '3월 회비 입금', amount: 400000, type: 'INCOME' },
  { id: '2', date: '2024-03-02', description: '그늘집 간식비', amount: 150000, type: 'EXPENSE' },
];

const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'm1',
    date: '2024-03-15',
    location: '해피 골프 CC',
    attendance: { '1': AttendanceStatus.ATTENDING, '2': AttendanceStatus.ATTENDING, '3': AttendanceStatus.PENDING, '4': AttendanceStatus.ABSENT }
  }
];

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('DASHBOARD');
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [finances, setFinances] = useState<FinancialRecord[]>(INITIAL_FINANCES);
  const [meetings, setMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const totalBalance = finances.reduce((acc, curr) => 
    curr.type === 'INCOME' ? acc + curr.amount : acc - curr.amount, 0
  );

  const handleAttendanceChange = (meetingId: string, memberId: string, status: AttendanceStatus) => {
    setMeetings(prev => prev.map(m => 
      m.id === meetingId 
        ? { ...m, attendance: { ...m.attendance, [memberId]: status } } 
        : m
    ));
  };

  const runFinanceAnalysis = async () => {
    setIsAiLoading(true);
    try {
      const summary = await geminiService.analyzeFinances(finances);
      setAiAnalysis(summary || "분석 결과를 가져올 수 없습니다.");
    } catch (e) {
      console.error(e);
      setAiAnalysis("오류가 발생했습니다.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const Navigation = () => {
    const navItems = [
      { id: 'DASHBOARD', label: '대시보드', icon: LayoutDashboard },
      { id: 'ATTENDANCE', label: '참석체크', icon: Calendar },
      { id: 'NOTICES', label: '공지사항', icon: FileText },
      { id: 'FINANCES', label: '회비내역', icon: Wallet },
      { id: 'MEMBERS', label: '회원관리', icon: Users },
    ];

    return (
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveView(item.id as ViewType);
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              activeView === item.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 p-6 sticky top-0 h-screen">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl italic">Z</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">동물원</h1>
        </div>
        <Navigation />
        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="p-4 bg-emerald-50 rounded-2xl">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">현재 잔액</p>
            <p className="text-xl font-bold text-slate-900">{totalBalance.toLocaleString()}원</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold italic">Z</div>
          <h1 className="font-bold text-lg">동물원</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-40 pt-20 px-6">
          <Navigation />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-10 pt-20 lg:pt-10 max-w-7xl mx-auto w-full">
        {activeView === 'DASHBOARD' && (
          <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900">대시보드</h2>
                <p className="text-slate-500 mt-1">오늘의 '동물원' 모임 현황을 확인하세요.</p>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={runFinanceAnalysis}
                  disabled={isAiLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-md disabled:opacity-50"
                >
                  <Sparkles size={18} />
                  <span>AI 재정 분석</span>
                </button>
              </div>
            </header>

            {aiAnalysis && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="text-indigo-600" size={20} />
                  <h3 className="font-bold text-indigo-900">AI 분석 결과</h3>
                </div>
                <p className="text-indigo-800 leading-relaxed whitespace-pre-wrap">{aiAnalysis}</p>
                <button 
                  onClick={() => setAiAnalysis(null)} 
                  className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">예정된 월례회</h3>
                  <Calendar size={18} className="text-emerald-600" />
                </div>
                {meetings.length > 0 ? (
                  <div>
                    <p className="text-lg font-bold text-emerald-700">{meetings[0].date}</p>
                    <p className="text-slate-500 text-sm">{meetings[0].location}</p>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-400">참석 예정</span>
                      <span className="text-sm font-bold text-slate-700">
                        {Object.values(meetings[0].attendance).filter(s => s === AttendanceStatus.ATTENDING).length}명
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm italic">예정된 일정이 없습니다.</p>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">최근 공지</h3>
                  <FileText size={18} className="text-orange-500" />
                </div>
                {notices.length > 0 ? (
                  <div className="space-y-3">
                    {notices.slice(0, 2).map(notice => (
                      <div key={notice.id} className="group cursor-pointer">
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-600 transition truncate">
                          {notice.isImportant && <span className="text-red-500 mr-1">[!]</span>}
                          {notice.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{notice.date}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm italic">공지가 없습니다.</p>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">재정 현황</h3>
                  <Wallet size={18} className="text-blue-500" />
                </div>
                <p className="text-2xl font-black text-slate-900">{totalBalance.toLocaleString()}원</p>
                <div className="mt-4 flex items-center text-xs text-slate-400 space-x-1">
                  <Clock size={12} />
                  <span>마지막 업데이트: {finances[0]?.date || '-'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">회원 목록</h3>
                <button onClick={() => setActiveView('MEMBERS')} className="text-sm text-emerald-600 hover:underline">전체보기</button>
              </div>
              <div className="divide-y divide-slate-50">
                {members.slice(0, 5).map(member => (
                  <div key={member.id} className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                        <p className="text-xs text-slate-400">{member.role}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'ATTENDANCE' && (
          <div className="space-y-8">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900">참석체크</h2>
                <p className="text-slate-500 mt-1">월례회 참석 인원을 관리하세요.</p>
              </div>
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-emerald-700 transition shadow-md">
                <Plus size={18} />
                <span>새 일정 추가</span>
              </button>
            </header>

            {meetings.map(meeting => (
              <div key={meeting.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{meeting.location}</h3>
                    <p className="text-slate-500 font-medium">{meeting.date}</p>
                  </div>
                  <div className="flex space-x-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">참석</p>
                      <p className="text-lg font-bold text-emerald-600">
                        {Object.values(meeting.attendance).filter(s => s === AttendanceStatus.ATTENDING).length}
                      </p>
                    </div>
                    <div className="text-center border-l border-slate-200 pl-4">
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">불참</p>
                      <p className="text-lg font-bold text-red-500">
                        {Object.values(meeting.attendance).filter(s => s === AttendanceStatus.ABSENT).length}
                      </p>
                    </div>
                    <div className="text-center border-l border-slate-200 pl-4">
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">미정</p>
                      <p className="text-lg font-bold text-slate-400">
                        {Object.values(meeting.attendance).filter(s => s === AttendanceStatus.PENDING).length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-400 text-xs uppercase tracking-wider">
                        <th className="px-6 py-3 font-semibold">이름</th>
                        <th className="px-6 py-3 font-semibold">직함</th>
                        <th className="px-6 py-3 font-semibold text-center">상태</th>
                        <th className="px-6 py-3 font-semibold">액션</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {members.map(member => {
                        const status = meeting.attendance[member.id] || AttendanceStatus.PENDING;
                        return (
                          <tr key={member.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-6 py-4 font-semibold text-slate-700">{member.name}</td>
                            <td className="px-6 py-4 text-slate-500 text-sm">{member.role}</td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center">
                                {status === AttendanceStatus.ATTENDING ? (
                                  <span className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-bold">
                                    <CheckCircle2 size={12} />
                                    <span>참석</span>
                                  </span>
                                ) : status === AttendanceStatus.ABSENT ? (
                                  <span className="flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold">
                                    <XCircle size={12} />
                                    <span>불참</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center space-x-1 text-slate-400 bg-slate-50 px-2 py-1 rounded-full text-xs font-bold">
                                    <Clock size={12} />
                                    <span>미정</span>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-1">
                                <button 
                                  onClick={() => handleAttendanceChange(meeting.id, member.id, AttendanceStatus.ATTENDING)}
                                  className={`p-1.5 rounded-md transition ${status === AttendanceStatus.ATTENDING ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleAttendanceChange(meeting.id, member.id, AttendanceStatus.ABSENT)}
                                  className={`p-1.5 rounded-md transition ${status === AttendanceStatus.ABSENT ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600'}`}
                                >
                                  <XCircle size={16} />
                                </button>
                                <button 
                                  onClick={() => handleAttendanceChange(meeting.id, member.id, AttendanceStatus.PENDING)}
                                  className={`p-1.5 rounded-md transition ${status === AttendanceStatus.PENDING ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                >
                                  <Clock size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeView === 'NOTICES' && (
          <div className="space-y-8">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900">공지사항</h2>
                <p className="text-slate-500 mt-1">모임의 새로운 소식을 확인하세요.</p>
              </div>
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-emerald-700 transition shadow-md">
                <Plus size={18} />
                <span>공지 작성</span>
              </button>
            </header>

            <div className="grid gap-4">
              {notices.map(notice => (
                <div key={notice.id} className={`bg-white p-6 rounded-2xl shadow-sm border transition ${notice.isImportant ? 'border-orange-200 bg-orange-50/20' : 'border-slate-100 hover:border-emerald-200'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        {notice.isImportant && (
                          <span className="bg-orange-100 text-orange-600 text-[10px] font-black uppercase px-2 py-0.5 rounded">필독</span>
                        )}
                        <span className="text-xs text-slate-400 font-medium">{notice.date}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{notice.title}</h3>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{notice.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'FINANCES' && (
          <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900">회비 및 재정</h2>
                <p className="text-slate-500 mt-1">투명한 회비 운영을 위해 내역을 공개합니다.</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="px-6 py-2 bg-white border border-slate-200 rounded-xl flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">현재 잔액</p>
                    <p className="text-xl font-black text-emerald-600">{totalBalance.toLocaleString()}원</p>
                  </div>
                </div>
                <button className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition shadow-md">
                  <Plus size={20} />
                </button>
              </div>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 text-xs uppercase tracking-wider font-bold">
                      <th className="px-6 py-4">일자</th>
                      <th className="px-6 py-4">항목</th>
                      <th className="px-6 py-4 text-right">금액</th>
                      <th className="px-6 py-4 text-center">유형</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {finances.map(record => (
                      <tr key={record.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 text-sm text-slate-500">{record.date}</td>
                        <td className="px-6 py-4 font-semibold text-slate-800">{record.description}</td>
                        <td className={`px-6 py-4 text-right font-bold ${record.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {record.type === 'INCOME' ? '+' : '-'}{record.amount.toLocaleString()}원
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${record.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {record.type === 'INCOME' ? '입금' : '출금'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeView === 'MEMBERS' && (
          <div className="space-y-8">
             <header className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900">회원 관리</h2>
                <p className="text-slate-500 mt-1">총 {members.length}명의 회원이 함께하고 있습니다.</p>
              </div>
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-emerald-700 transition shadow-md">
                <Plus size={18} />
                <span>회원 등록</span>
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map(member => (
                <div key={member.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-xl">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800">{member.name}</h3>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        member.role === '회장' ? 'bg-purple-100 text-purple-700' : 
                        member.role === '총무' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{member.phoneNumber}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
