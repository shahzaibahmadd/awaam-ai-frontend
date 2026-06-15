import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { getToken } from '../lib/auth';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { DocumentTextIcon, MapPinIcon, BellAlertIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const PROCEDURES = [
  "New Passport",
  "CNIC Renewal",
  "Driving License",
  "Family Registration Certificate (FRC)",
  "Domicile Certificate",
  "Vehicle Registration"
];

export default function Tracker() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeChecklists, setActiveChecklists] = useState([]);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) router.push('/login');
  }, [authLoading, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchMyProgress();
    }
  }, [isLoggedIn]);

  const fetchMyProgress = async () => {
    try {
      const token = getToken();
      const res = await api.get('/checklist/my-progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveChecklists(res.data);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  };

  const handleSelectProcedure = async (procedure) => {
    setSelectedProcedure(procedure);
    setLoading(true);
    setChecklist([]);
    setOverallProgress(0);
    setShowToast(false);
    
    try {
      const token = getToken();
      // Simulate network request to see the "Syncing" state
      const res = await api.get(`/checklist/generate/${encodeURIComponent(procedure)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setChecklist(res.data.checklist || []);
      setOverallProgress(res.data.overallProgress || 0);
      
      if (res.data.isFallback) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 6000);
      }
      
      fetchMyProgress();
    } catch (err) {
      console.error('Failed to generate checklist:', err);
    } finally {
      // Simulate quick load if it's instantaneous so user sees animation
      setTimeout(() => setLoading(false), 500);
    }
  };

  const toggleChecklist = async (index) => {
    const updatedChecklist = [...checklist];
    updatedChecklist[index].isCompleted = !updatedChecklist[index].isCompleted;
    setChecklist(updatedChecklist);
    
    const completed = updatedChecklist.filter(t => t.isCompleted).length;
    setOverallProgress(Math.round((completed / updatedChecklist.length) * 100));

    setSaving(true);
    try {
      const token = getToken();
      await api.post('/checklist/save', {
        procedureName: selectedProcedure,
        checklist: updatedChecklist
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMyProgress();
    } catch (err) {
      console.error('Failed to save checklist:', err);
    } finally {
      setSaving(false);
    }
  };

  const resetChecklist = async () => {
    if (!selectedProcedure) return;
    setLoading(true);
    try {
      const token = getToken();
      const res = await api.post('/checklist/reset', {
        procedureName: selectedProcedure
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChecklist(res.data.checklist || []);
      setOverallProgress(0);
      fetchMyProgress();
    } catch (err) {
      console.error('Failed to reset checklist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemindMe = (taskName) => {
    alert(`Reminder set! We will remind you to gather: "${taskName}"`);
  };

  const handleGoogleMapsSearch = () => {
    if (!selectedProcedure) return;
    window.open('https://www.google.com/maps/search/' + encodeURIComponent(selectedProcedure + ' office near me'), '_blank');
  };

  const getBadgeColor = (type) => {
    if (type === 'Original') return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    if (type === 'Photocopy') return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    if (type === 'Digital Scan') return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  if (authLoading || !isLoggedIn) {
    return (
      <Layout>
        <div className="flex-1 grid place-items-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl w-full px-4 py-8 h-full flex flex-col md:flex-row gap-6 relative">
        
        {/* Error Toast Notification */}
        {showToast && (
          <div className="absolute top-0 right-4 z-50 flex items-center gap-2 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-4 py-3 rounded-lg shadow-lg animate-fadeIn">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-medium">Using general legal guidelines for this procedure.</span>
          </div>
        )}

        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="rounded-2xl border border-white/5 bg-gemini-surface/80 backdrop-blur-md p-5 shadow-xl shadow-black/20">
            <h2 className="text-xl font-semibold text-gemini-green mb-4 flex items-center gap-2">
              <DocumentTextIcon className="w-6 h-6" />
              Available Procedures
            </h2>
            <div className="space-y-2">
              {PROCEDURES.map((proc) => {
                const active = activeChecklists.find(a => a.procedureName === proc);
                return (
                  <button
                    key={proc}
                    onClick={() => handleSelectProcedure(proc)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border flex items-center justify-between ${
                      selectedProcedure === proc 
                        ? 'bg-gemini-green/10 border-gemini-green/30 shadow-inner' 
                        : 'bg-gemini-surface/50 border-white/5 hover:bg-gemini-hover hover:border-gemini-green/30'
                    }`}
                  >
                    <span className={`font-medium ${selectedProcedure === proc ? 'text-white' : 'text-gray-300'}`}>
                      {proc}
                    </span>
                    {active && active.overallProgress > 0 && (
                      <span className="text-xs bg-gemini-green/20 text-[#46DBA5] px-2 py-1 rounded-full border border-gemini-green/30">
                        {active.overallProgress}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/3 flex flex-col">
          <div className="rounded-2xl border border-white/5 bg-gemini-surface/80 backdrop-blur-md flex-1 p-6 flex flex-col shadow-xl shadow-black/20 relative overflow-hidden">
            
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-gemini-green/10 rounded-full blur-3xl pointer-events-none"></div>

            {!selectedProcedure ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
                <DocumentTextIcon className="w-20 h-20 text-gemini-green/50 mb-4" />
                <h3 className="text-2xl font-semibold text-gray-200">Select a Procedure</h3>
                <p className="text-gray-400 mt-2 max-w-md">Choose a legal procedure from the menu to generate a smart AI checklist tailored to your requirements.</p>
              </div>
            ) : loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="relative mb-6">
                  <ArrowPathIcon className="w-14 h-14 text-gemini-green animate-spin relative z-10" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gemini-green/30 rounded-full animate-ping"></div>
                </div>
                <h3 className="text-xl font-medium text-gemini-green">Syncing with Official Requirements...</h3>
                <p className="text-gray-400 mt-2">Retrieving structured legal prerequisites.</p>
                
                {/* Pulsing loading bar */}
                <div className="w-64 h-2 bg-[#041B18] rounded-full mt-6 overflow-hidden">
                  <div className="h-full bg-gemini-green w-full animate-pulse-fast"></div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full animate-fadeIn">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-800 pb-6 z-10">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{selectedProcedure}</h2>
                    <p className="text-gray-400 text-sm">Official requirements checklist generated by Awaam AI.</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={handleGoogleMapsSearch}
                      className="flex items-center gap-2 text-sm bg-gemini-green/10 hover:bg-gemini-green/20 text-gemini-green px-4 py-2 rounded-lg border border-gemini-green/30 transition-colors whitespace-nowrap"
                    >
                      <MapPinIcon className="w-4 h-4" /> Office Finder
                    </button>
                    <button 
                      onClick={resetChecklist}
                      className="flex items-center gap-2 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg border border-red-500/30 transition-colors whitespace-nowrap"
                    >
                      <ArrowPathIcon className="w-4 h-4" /> Reset
                    </button>
                  </div>
                </div>

                <div className="mb-8 z-10">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-gray-300">Overall Progress</span>
                    <span className="text-xl font-bold text-gemini-green">{overallProgress}%</span>
                  </div>
                  <div className="w-full h-3 bg-[#041B18] rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-[#46DBA5] to-emerald-400 transition-all duration-700 ease-out relative"
                      style={{ width: `${overallProgress}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[flow_1s_linear_infinite]"></div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 md:overflow-y-auto md:max-h-[60vh] overflow-visible pr-0 md:pr-2 space-y-3 z-10 custom-scrollbar">
                  {checklist.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center mt-10">
                      <div className="relative mb-6">
                        <ArrowPathIcon className="w-14 h-14 text-gemini-green animate-spin relative z-10" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gemini-green/30 rounded-full animate-ping"></div>
                      </div>
                      <h3 className="text-xl font-medium text-gemini-green">Syncing with Official Requirements...</h3>
                    </div>
                  ) : (
                    checklist.map((item, index) => (
                      <div 
                        key={index} 
                        className={`group flex flex-col p-4 rounded-xl border transition-all duration-300 ${
                          item.isCompleted 
                            ? 'bg-gemini-green/10 border-gemini-green/30 shadow-[0_0_15px_rgba(70,219,165,0.05)]' 
                            : 'bg-gemini-surface/40 border-white/5 hover:border-[#46DBA5]/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <button 
                              onClick={() => toggleChecklist(index)}
                              className="mt-0.5 focus:outline-none flex-shrink-0"
                            >
                              {item.isCompleted ? (
                                <CheckCircleIcon className="w-6 h-6 text-gemini-green transition-transform duration-300 scale-110" />
                              ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-gray-500 group-hover:border-gemini-green transition-colors duration-300" />
                              )}
                            </button>
                            <div className="flex flex-col flex-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className={`text-base font-medium transition-colors duration-300 ${item.isCompleted ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
                                  {item.task}
                                </span>
                                {item.type && (
                                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border tracking-wider ${getBadgeColor(item.type)}`}>
                                    {item.type}
                                  </span>
                                )}
                              </div>
                              
                              {item.expiryAlert && (
                                <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-300/80 bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-rose-500/20 w-fit">
                                  <InformationCircleIcon className="w-4 h-4 text-rose-400" />
                                  <span>{item.expiryAlert}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {!item.isCompleted && (
                            <button 
                              onClick={() => handleRemindMe(item.task)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs flex items-center gap-1 text-gemini-green hover:text-[#3bb88b] bg-gemini-green/10 px-3 py-1.5 rounded-lg border border-gemini-green/20 ml-2"
                            >
                              <BellAlertIcon className="w-4 h-4" /> Vault
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 flex justify-end h-4 z-10">
                  {saving && <span className="text-xs text-gray-500 flex items-center gap-1"><ArrowPathIcon className="w-3 h-3 animate-spin" /> Saving progress...</span>}
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes flow {
          0% { background-position: 0 0; }
          100% { background-position: 20px 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-pulse-fast {
          animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5); 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3); 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.5); 
        }
      `}</style>
    </Layout>
  );
}
