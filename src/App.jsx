import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Search,
    Bell,
    Home,
    User,
    Wallet,
    Zap,
    Clock,
    CheckCircle,
    Shield,
    MessageCircle,
    X,
    ArrowUpRight,
    ArrowDownLeft,
    QrCode,
    Loader,
    Eye,
    EyeOff,
    Briefcase,
    BookOpen,
    ArrowRight,
    LogOut,
    Send,
    MoreHorizontal,
    Lock,
    UserCheck,
    Sparkles,
    Wand2,
    ChevronRight,
    Trophy,
    Rocket
} from 'lucide-react';

const CampusGigs = () => {
    // --- STATE MANAGEMENT ---
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // Stores current user ID
    const [loginMode, setLoginMode] = useState('spender'); // Default selection

    // LOGIN FORM STATES
    const [loginId, setLoginId] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [loginError, setLoginError] = useState('');

    const [activeTab, setActiveTab] = useState('feed');
    const [showPostModal, setShowPostModal] = useState(false);
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [showWalletSection, setShowWalletSection] = useState(false);
    const [walletMode, setWalletMode] = useState('withdraw');
    const [userBalance, setUserBalance] = useState(0);
    const [showBalance, setShowBalance] = useState(false);
    const [toast, setToast] = useState(null);

    // SEARCH & FILTER
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // AI FEATURES STATE
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [postDescription, setPostDescription] = useState('');
    const [postTitle, setPostTitle] = useState('');
    const [postPrice, setPostPrice] = useState('');

    // NEGOTIATION
    const [showChatModal, setShowChatModal] = useState(false);
    const [activeChatGig, setActiveChatGig] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');

    // WALLET STATES
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawUpi, setWithdrawUpi] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [addAmount, setAddAmount] = useState('100');

    const myUPI = "campusgigs@upi";

    // --- SHARED DATA (Persists between logins) ---
    const [gigs, setGigs] = useState([
        {
            id: 1,
            title: "Write my Physics Lab Record",
            description: "Need someone to copy 3 experiments into my record. Handwriting must be neat.",
            price: 150,
            isUrgent: true,
            timePosted: "10 mins ago",
            category: "Academic",
            status: "open", // open, accepted, pending_approval, completed
            posterId: "Senior_Dev", // To track who posted
            messages: []
        },
        {
            id: 2,
            title: "Get printouts from Canteen",
            description: "I'm stuck in a lecture. Need 40 pages of PDF printed and brought to Block B.",
            price: 40,
            isUrgent: false,
            timePosted: "25 mins ago",
            category: "Delivery",
            status: "open",
            posterId: "Senior_Dev",
            messages: []
        },
        {
            id: 3,
            title: "Debug my Python Project",
            description: "Getting a syntax error in my ML model. Need help fixing it ASAP.",
            price: 200,
            isUrgent: true,
            timePosted: "1 hour ago",
            category: "Tech Support",
            status: "open",
            posterId: "Senior_Dev",
            messages: []
        }
    ]);

    // --- MOCK CHAT HISTORY (For Chat Tab) ---
    const [chatHistory, setChatHistory] = useState([
        { id: 101, user: "Hostel_Warden", lastMsg: "Please pick up the laundry by 5 PM.", time: "2m ago", unread: 2 },
        { id: 102, user: "Junior_Dev", lastMsg: "Thanks for the notes!", time: "1h ago", unread: 0 },
        { id: 103, user: "Canteen_Guy", lastMsg: "Your order is ready.", time: "Yesterday", unread: 0 }
    ]);

    // --- ACTIONS ---

    const handleLoginSubmit = (e) => {
        e.preventDefault();

        // Basic Validation for Demo
        if (!loginId.trim() || !loginPass.trim()) {
            setLoginError("Please enter ID and Password");
            return;
        }

        setIsProcessing(true);

        // Simulate Authentication Delay
        setTimeout(() => {
            setIsProcessing(false);
            setIsLoggedIn(true);
            setCurrentUser(loginId);

            // CONTEXT AWARE SETUP:
            if (loginMode === 'spender') {
                setUserBalance(2000.00);
                setShowPostModal(true);
                showToast(`Welcome back, ${loginId}!`);
            } else {
                setUserBalance(150.00);
                showToast(`Welcome back, ${loginId}!`);
            }

            // Reset Form
            setLoginId('');
            setLoginPass('');
            setLoginError('');
        }, 1500);
    };

    const handleLogout = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setIsLoggedIn(false);
            setCurrentUser(null);
            setShowPostModal(false);
            setShowWalletSection(false);
            setActiveTab('feed');
            showToast("Logged out successfully");
        }, 800);
    };

    // 1. ACCEPT GIG
    const handleAcceptGig = (gigId) => {
        setGigs(gigs.map(g => {
            if (g.id === gigId) return { ...g, status: 'accepted' };
            return g;
        }));
        showToast("Gig Accepted! Status: In Progress");
        if (showChatModal) setShowChatModal(false);
    };

    // 2. MARK AS DONE
    const handleMarkDone = (gigId) => {
        setGigs(gigs.map(g => {
            if (g.id === gigId) return { ...g, status: 'pending_approval' };
            return g;
        }));
        showToast("Work Submitted! Waiting for Gig Giver approval...");

        setTimeout(() => {
            const gig = gigs.find(g => g.id === gigId);
            if (gig) {
                const earning = gig.price * 0.99;
                setUserBalance(prev => prev + earning);
                setGigs(prevGigs => prevGigs.map(g => {
                    if (g.id === gigId) return { ...g, status: 'completed' };
                    return g;
                }));
                showToast(`Approved! ₹${earning} added to wallet.`);
            }
        }, 4000);
    };

    // NEGOTIATION LOGIC
    const openNegotiation = (gig) => {
        setActiveChatGig(gig);
        setChatMessages(gig.messages.length > 0 ? gig.messages : [
            { sender: 'system', text: `Connecting to ${gig.posterId || 'Poster'}...` },
            { sender: 'other', text: "Hi! Interested in this gig? Ask me anything." }
        ]);
        setShowChatModal(true);
    };

    const sendChatMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const newMessage = { sender: 'me', text: chatInput };
        setChatMessages([...chatMessages, newMessage]);
        setChatInput('');

        setTimeout(() => {
            setChatMessages(prev => [...prev, { sender: 'other', text: "Ok, deal. You can accept it now." }]);
        }, 2000);
    };

    // --- AI FEATURES ---
    const handleAiGenerate = () => {
        if (!postTitle) {
            alert("Please enter a title first so Gemini can understand context!");
            return;
        }
        setIsAiGenerating(true);
        setTimeout(() => {
            setPostDescription(`Here are the details for "${postTitle}":\n\n• Scope: Comprehensive assistance required.\n• Timeline: Urgent (within 24 hours).\n• Deliverables: High-quality output expected.\n\nLooking for someone reliable!`);

            // Smarter Mock Pricing Logic based on keywords
            let suggestedPrice = 150; // Default base
            const lowerTitle = postTitle.toLowerCase();

            if (lowerTitle.includes('video') || lowerTitle.includes('edit') || lowerTitle.includes('animation')) suggestedPrice = 800;
            else if (lowerTitle.includes('code') || lowerTitle.includes('python') || lowerTitle.includes('java') || lowerTitle.includes('debug') || lowerTitle.includes('app') || lowerTitle.includes('website')) suggestedPrice = 500;
            else if (lowerTitle.includes('design') || lowerTitle.includes('logo') || lowerTitle.includes('poster')) suggestedPrice = 350;
            else if (lowerTitle.includes('write') || lowerTitle.includes('essay') || lowerTitle.includes('assignment') || lowerTitle.includes('record') || lowerTitle.includes('lab')) suggestedPrice = 200;
            else if (lowerTitle.includes('print') || lowerTitle.includes('delivery') || lowerTitle.includes('laundry') || lowerTitle.includes('pickup')) suggestedPrice = 60;
            else suggestedPrice = Math.max(100, postTitle.length * 15); // Fallback based on length but higher

            if (!postPrice) setPostPrice(suggestedPrice);
            setIsAiGenerating(false);
        }, 1500);
    };

    const handlePostGig = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newGig = {
            id: Date.now(),
            title: postTitle,
            description: postDescription,
            price: parseInt(postPrice),
            isUrgent: formData.get('isUrgent') === 'on',
            timePosted: "Just now",
            category: "General",
            status: "open",
            posterId: currentUser,
            messages: []
        };

        setGigs([newGig, ...gigs]);
        setShowPostModal(false);

        // Reset fields
        setPostTitle('');
        setPostDescription('');
        setPostPrice('');

        showToast("Gig Posted! Live on feed.");
    };

    const handleWithdraw = (e) => {
        e.preventDefault();
        const amount = parseFloat(withdrawAmount);
        if (!amount || amount <= 0 || amount > userBalance || !withdrawUpi.includes('@')) {
            alert("Invalid details");
            return;
        }
        setIsProcessing(true);
        setTimeout(() => {
            setUserBalance(prev => prev - amount);
            setIsProcessing(false);
            setShowWalletModal(false);
            setWithdrawAmount('');
            setWithdrawUpi('');
            showToast(`₹${amount} sent to ${withdrawUpi}`);
        }, 2000);
    };

    const handleAddFunds = () => {
        setIsProcessing(true);
        setTimeout(() => {
            const amount = parseFloat(addAmount) || 0;
            setUserBalance(prev => prev + amount);
            setIsProcessing(false);
            setShowWalletModal(false);
            showToast(`₹${amount} added to wallet!`);
        }, 2000);
    };

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    // FILTER LOGIC
    const filteredGigs = gigs.filter(gig => {
        const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            gig.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || gig.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All', 'Academic', 'Delivery', 'Tech Support', 'Chores'];

    const UrgencyBadge = () => (
        <div className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold animate-pulse border border-red-200">
            <Zap size={12} fill="currentColor" />
            URGENT
        </div>
    );

    // --- LOGIN SCREEN (UPDATED: Blue/Purple Theme) ---
    if (!isLoggedIn) {
        return (
            <div className="flex justify-center bg-indigo-950 min-h-screen font-sans">
                <div className="w-full max-w-md bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-900 h-screen shadow-2xl flex flex-col relative overflow-hidden p-6 text-white">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

                    <div className="flex-1 flex flex-col justify-center relative z-10">
                        <div className="mb-8 text-center">
                            <div className="flex justify-center mb-4">
                                <span className="bg-yellow-400 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg animate-pulse">
                                    <Trophy size={20} /> Science Fair 2026
                                </span>
                            </div>
                            <h1 className="text-5xl font-black tracking-tighter flex flex-col items-center justify-center gap-0 mb-2 leading-none">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-100">Campus</span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">Gigs</span>
                            </h1>
                            <p className="text-indigo-100 text-sm font-medium mt-4">Where Students Run the Economy</p>
                        </div>

                        {/* MODE SELECTION TABS */}
                        <div className="flex bg-white/10 p-1 rounded-2xl mb-6 backdrop-blur-sm border border-white/20">
                            <button
                                onClick={() => setLoginMode('spender')}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${loginMode === 'spender' ? 'bg-white text-indigo-900 shadow-lg' : 'text-indigo-200 hover:text-white'}`}
                            >
                                <BookOpen size={16} /> I need Help
                            </button>
                            <button
                                onClick={() => setLoginMode('earner')}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${loginMode === 'earner' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg' : 'text-indigo-200 hover:text-white'}`}
                            >
                                <Rocket size={16} /> I want to Earn
                            </button>
                        </div>

                        {/* LOGIN FORM */}
                        <form onSubmit={handleLoginSubmit} className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 space-y-4 shadow-2xl">
                            <div>
                                <label className="block text-xs font-bold text-indigo-100 mb-1 ml-1 uppercase tracking-wider">Student ID</label>
                                <div className="relative">
                                    <UserCheck className="absolute left-3 top-3.5 text-indigo-300" size={18} />
                                    <input
                                        type="text"
                                        value={loginId}
                                        onChange={(e) => setLoginId(e.target.value)}
                                        placeholder="e.g. 21BCE1042"
                                        className="w-full bg-indigo-900/30 border border-indigo-400/30 rounded-xl py-3 pl-10 pr-4 text-white placeholder-indigo-300 focus:outline-none focus:border-yellow-400 transition focus:bg-indigo-900/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-indigo-100 mb-1 ml-1 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 text-indigo-300" size={18} />
                                    <input
                                        type="password"
                                        value={loginPass}
                                        onChange={(e) => setLoginPass(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-indigo-900/30 border border-indigo-400/30 rounded-xl py-3 pl-10 pr-4 text-white placeholder-indigo-300 focus:outline-none focus:border-yellow-400 transition focus:bg-indigo-900/50"
                                    />
                                </div>
                            </div>

                            {loginError && (
                                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-2 text-xs text-red-200 text-center font-bold flex items-center justify-center gap-1">
                                    <Shield size={12} /> {loginError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isProcessing}
                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 ${loginMode === 'earner' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' : 'bg-white text-indigo-900'}`}
                            >
                                {isProcessing ? <Loader className="animate-spin" /> : 'Enter Campus'} <ArrowRight size={20} />
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                                <Sparkles size={10} className="text-yellow-400" />
                                <p className="text-[10px] text-indigo-100 font-medium">Powered by Google Gemini 2.0</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- MAIN APP ---
    return (
        <div className="flex justify-center bg-gray-100 min-h-screen font-sans">
            <div className="w-full max-w-md bg-white h-screen shadow-2xl flex flex-col relative overflow-hidden">

                {/* HEADER (UPDATED GRADIENT) */}
                <div className={`bg-gradient-to-r from-indigo-700 via-purple-700 to-violet-800 text-white rounded-b-3xl shadow-lg z-10 transition-all duration-300 ease-in-out ${showWalletSection ? 'p-4 pt-6 pb-8' : 'p-4 pt-6 pb-6'}`}>
                    <div className="flex justify-between items-center mb-1">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                                CampusGigs
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                            </h1>
                            <p className={`text-indigo-200 text-xs font-medium transition-all duration-300 ${showWalletSection ? 'opacity-100 max-h-10' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                                Welcome, {currentUser}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowWalletSection(!showWalletSection)}
                                className={`p-2 rounded-full transition-colors flex items-center gap-1 text-xs font-bold ${showWalletSection ? 'bg-white text-indigo-800' : 'bg-white/20 text-white hover:bg-white/30'}`}
                            >
                                <Wallet size={20} />
                                {showWalletSection ? 'Hide' : ''}
                            </button>
                            <div className="bg-white/20 p-2 rounded-full relative">
                                <Bell size={20} />
                                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-indigo-600"></div>
                            </div>
                        </div>
                    </div>

                    {/* WALLET SECTION */}
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showWalletSection ? 'max-h-60 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex justify-between items-center shadow-inner">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-indigo-100 text-xs">Available Balance</p>
                                    <button onClick={() => setShowBalance(!showBalance)} className="text-indigo-200 hover:text-white transition focus:outline-none">
                                        {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                                <h2 className="text-3xl font-bold tracking-wide text-white">
                                    {showBalance ? `₹${userBalance.toFixed(2)}` : '₹••••'}
                                </h2>
                            </div>
                            <button onClick={() => { setWalletMode('withdraw'); setShowWalletModal(true); }} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 transition shadow-lg flex items-center gap-2">
                                <ArrowUpRight size={16} /> Action
                            </button>
                        </div>
                    </div>
                </div>

                {/* FEED CONTENT AREA */}
                <div className="flex-1 overflow-y-auto px-4 pb-24 z-0">

                    {/* 1. FEED TAB */}
                    {activeTab === 'feed' && (
                        <div className="space-y-4 pt-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-gray-700 text-lg">Gigs Feed</h3>
                                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md font-bold flex items-center gap-1 border border-indigo-100">
                                    <Shield size={12} /> Verified Zone
                                </span>
                            </div>

                            {gigs.length > 0 ? (
                                gigs.map((gig) => (
                                    <div
                                        key={gig.id}
                                        className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 transition-all hover:shadow-md ${gig.isUrgent ? 'border-l-red-500 ring-1 ring-red-50' : 'border-l-indigo-500 border border-gray-100'} ${gig.status === 'completed' ? 'opacity-50' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex gap-2">
                                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium">
                                                    {gig.category}
                                                </span>
                                                {gig.isUrgent && <UrgencyBadge />}
                                            </div>
                                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                <Clock size={12} /> {gig.timePosted}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">{gig.title}</h3>
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{gig.description}</p>

                                        {/* STATUS-BASED UI */}
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                            <div className="flex items-center gap-2">
                                                <div className="text-right">
                                                    <span className="block font-black text-indigo-600 text-lg">₹{gig.price}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 items-center">
                                                {gig.status === 'open' && (
                                                    <>
                                                        {/* Only show Negotiation/Accept if current user is NOT the poster */}
                                                        {gig.posterId !== currentUser ? (
                                                            <>
                                                                <button
                                                                    onClick={() => openNegotiation(gig)}
                                                                    className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 border border-gray-200"
                                                                    title="Negotiate / Chat"
                                                                >
                                                                    <MessageCircle size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAcceptGig(gig.id)}
                                                                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-indigo-200 shadow-lg hover:bg-indigo-700 active:bg-indigo-800 transition"
                                                                >
                                                                    Accept
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded">You Posted This</span>
                                                        )}
                                                    </>
                                                )}

                                                {gig.status === 'accepted' && (
                                                    <button
                                                        onClick={() => handleMarkDone(gig.id)}
                                                        className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-green-200 shadow-lg hover:bg-green-700 transition flex items-center gap-2"
                                                    >
                                                        <CheckCircle size={16} /> Mark as Done
                                                    </button>
                                                )}

                                                {gig.status === 'pending_approval' && (
                                                    <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
                                                        <Loader size={14} className="animate-spin" /> Waiting Approval...
                                                    </div>
                                                )}

                                                {gig.status === 'completed' && (
                                                    <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
                                                        <CheckCircle size={14} /> Paid
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <p>No gigs available.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. SEARCH TAB */}
                    {activeTab === 'search' && (
                        <div className="space-y-4 pt-4">
                            <h3 className="font-bold text-gray-700 text-lg">Explore & Search</h3>

                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search gigs (e.g., 'Physics')..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                />
                            </div>

                            {/* Category Chips */}
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Results List */}
                            <div className="space-y-3">
                                {filteredGigs.length > 0 ? (
                                    filteredGigs.map(gig => (
                                        <div key={gig.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-sm">{gig.title}</h4>
                                                <p className="text-xs text-gray-500">{gig.category} • ₹{gig.price}</p>
                                            </div>
                                            <button onClick={() => { setActiveTab('feed'); /* Ideally scroll to gig */ }} className="bg-gray-50 p-2 rounded-full text-indigo-600">
                                                <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-gray-400">
                                        <Search size={40} className="mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">No results found for "{searchQuery}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 3. CHAT TAB */}
                    {activeTab === 'chat' && (
                        <div className="space-y-4 pt-4">
                            <h3 className="font-bold text-gray-700 text-lg">Messages</h3>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                                {chatHistory.map(chat => (
                                    <div key={chat.id} className="p-4 flex gap-4 hover:bg-gray-50 transition cursor-pointer" onClick={() => { setActiveChatGig({ id: 0, title: 'Chat with ' + chat.user, price: 0 }); setShowChatModal(true); }}>
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                            {chat.user.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-gray-800 text-sm truncate">{chat.user}</h4>
                                                <span className="text-[10px] text-gray-400">{chat.time}</span>
                                            </div>
                                            <p className={`text-xs truncate mt-0.5 ${chat.unread > 0 ? 'text-gray-800 font-bold' : 'text-gray-500'}`}>{chat.lastMsg}</p>
                                        </div>
                                        {chat.unread > 0 && (
                                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0 mt-2">
                                                {chat.unread}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-center text-xs text-gray-400 mt-4">Encrypted End-to-End</p>
                        </div>
                    )}

                    {/* 4. PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="pt-8 text-center">
                            <div className="w-24 h-24 bg-indigo-100 rounded-full mx-auto flex items-center justify-center mb-4 text-indigo-600 shadow-inner border border-indigo-50">
                                <User size={48} />
                            </div>
                            <h2 className="text-xl font-bold">{currentUser}</h2>
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Shield size={10} /> Verified Student</span>
                                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Top Rated</span>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                    <p className="text-gray-400 text-xs">Total Earned</p>
                                    <p className="text-2xl font-bold text-green-600">₹{userBalance > 1250 ? userBalance.toFixed(0) : '1,250'}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                    <p className="text-gray-400 text-xs">Jobs Done</p>
                                    <p className="text-2xl font-bold text-indigo-600">12</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                disabled={isProcessing}
                                className="mt-8 flex items-center justify-center gap-2 text-red-500 font-bold text-sm w-full py-3 bg-red-50 rounded-xl hover:bg-red-100 transition"
                            >
                                {isProcessing ? <Loader className="animate-spin" size={16} /> : <><LogOut size={16} /> Logout</>}
                            </button>
                        </div>
                    )}
                </div>

                {/* BOTTOM NAV */}
                <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center z-20">
                    <button onClick={() => setActiveTab('feed')} className={`flex flex-col items-center gap-1 ${activeTab === 'feed' ? 'text-indigo-600' : 'text-gray-400'}`}>
                        <Home size={24} strokeWidth={activeTab === 'feed' ? 3 : 2} /> <span className="text-[10px] font-medium">Home</span>
                    </button>
                    <button onClick={() => setActiveTab('search')} className={`flex flex-col items-center gap-1 ${activeTab === 'search' ? 'text-indigo-600' : 'text-gray-400'}`}>
                        <Search size={24} strokeWidth={activeTab === 'search' ? 3 : 2} /> <span className="text-[10px] font-medium">Search</span>
                    </button>
                    <div className="w-8"></div>
                    <button onClick={() => setActiveTab('chat')} className={`flex flex-col items-center gap-1 ${activeTab === 'chat' ? 'text-indigo-600' : 'text-gray-400'}`}>
                        <MessageCircle size={24} strokeWidth={activeTab === 'chat' ? 3 : 2} /> <span className="text-[10px] font-medium">Chat</span>
                    </button>
                    <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-indigo-600' : 'text-gray-400'}`}>
                        <User size={24} strokeWidth={activeTab === 'profile' ? 3 : 2} /> <span className="text-[10px] font-medium">Profile</span>
                    </button>
                </div>

                {/* FAB */}
                <div className="absolute bottom-20 right-4 z-20">
                    <button onClick={() => setShowPostModal(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group border-2 border-white/20">
                        <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* --- MODALS --- */}

                {/* CHAT/NEGOTIATION MODAL */}
                {showChatModal && (
                    <div className="absolute inset-0 bg-indigo-900/40 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm">
                        <div className="bg-white w-full max-w-md h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up flex flex-col">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-3xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                        {activeChatGig?.title?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm line-clamp-1">{activeChatGig?.title}</h3>
                                        {activeChatGig?.price > 0 && <p className="text-xs text-green-600 font-bold">Offer: ₹{activeChatGig.price}</p>}
                                    </div>
                                </div>
                                <button onClick={() => setShowChatModal(false)} className="bg-gray-200 p-2 rounded-full"><X size={18} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {chatMessages.length > 0 ? chatMessages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'me' ? 'bg-indigo-600 text-white rounded-br-none' : msg.sender === 'system' ? 'bg-gray-200 text-gray-500 text-xs text-center w-full' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-center text-gray-400 text-sm mt-10">Start the conversation!</p>
                                )}
                            </div>

                            <div className="p-4 bg-white border-t border-gray-100 rounded-b-3xl">
                                <form onSubmit={sendChatMessage} className="flex gap-2">
                                    <input
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700">
                                        <Send size={20} />
                                    </button>
                                </form>
                                {activeChatGig?.id !== 0 && (
                                    <button onClick={() => handleAcceptGig(activeChatGig.id)} className="w-full mt-3 bg-green-600 text-white py-3 rounded-xl font-bold text-sm">
                                        Accept Deal Now
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* POST MODAL */}
                {showPostModal && (
                    <div className="absolute inset-0 bg-indigo-900/40 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm">
                        <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Post a New Gig</h2>
                                <button onClick={() => setShowPostModal(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handlePostGig} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">TITLE</label>
                                    <input
                                        name="title"
                                        value={postTitle}
                                        onChange={(e) => setPostTitle(e.target.value)}
                                        required
                                        type="text"
                                        placeholder="e.g. Write assignment"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="relative">
                                    <label className="block text-xs font-bold text-gray-500 mb-1 flex justify-between items-center">
                                        DESCRIPTION
                                        <button
                                            type="button"
                                            onClick={handleAiGenerate}
                                            disabled={isAiGenerating}
                                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                                        >
                                            {isAiGenerating ? <Loader size={10} className="animate-spin" /> : <Sparkles size={10} />} Ask Gemini to Write
                                        </button>
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            name="description"
                                            value={postDescription}
                                            onChange={(e) => setPostDescription(e.target.value)}
                                            required
                                            rows="3"
                                            placeholder={isAiGenerating ? "Generating description with Gemini..." : "Details about the task..."}
                                            className={`w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isAiGenerating ? 'opacity-50 blur-[1px]' : ''}`}
                                        ></textarea>
                                        {isAiGenerating && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
                                                    <Wand2 size={12} /> Gemini is writing...
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-500 mb-1 flex justify-between">
                                            OFFER (₹)
                                            {postPrice === '' && postTitle.length > 5 && (
                                                <span className="text-[10px] text-green-600 font-medium flex items-center gap-0.5"><Sparkles size={8} /> AI Suggested</span>
                                            )}
                                        </label>
                                        <input
                                            name="price"
                                            value={postPrice}
                                            onChange={(e) => setPostPrice(e.target.value)}
                                            required
                                            type="number"
                                            placeholder="100"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-800"
                                        />
                                    </div>
                                    <div className="flex-1 flex items-end">
                                        <label className="flex items-center gap-3 bg-red-50 border border-red-100 p-3 rounded-xl w-full cursor-pointer hover:bg-red-100 transition">
                                            <input name="isUrgent" type="checkbox" className="w-5 h-5 text-red-600 rounded focus:ring-red-500 accent-red-600" />
                                            <span className="text-sm font-bold text-red-600 flex items-center gap-1"><Zap size={14} fill="currentColor" /> Urgent?</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition shadow-md">Post Gig</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* WALLET MODAL */}
                {showWalletModal && (
                    <div className="absolute inset-0 bg-indigo-900/40 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                        <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-bounce-in relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-100 rounded-full blur-2xl opacity-50"></div>
                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <h2 className="text-xl font-black text-gray-800 flex items-center gap-2"><Wallet size={24} className="text-indigo-600" /> My Wallet</h2>
                                <button onClick={() => setShowWalletModal(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition"><X size={18} /></button>
                            </div>
                            <div className="flex bg-gray-100 p-1 rounded-xl mb-6 relative z-10">
                                <button onClick={() => setWalletMode('withdraw')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${walletMode === 'withdraw' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>
                                    <ArrowUpRight size={16} /> Withdraw
                                </button>
                                <button onClick={() => setWalletMode('add')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${walletMode === 'add' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400'}`}>
                                    <ArrowDownLeft size={16} /> Add Money
                                </button>
                            </div>
                            {walletMode === 'withdraw' && (
                                <form onSubmit={handleWithdraw} className="space-y-4 relative z-10">
                                    <div className="bg-indigo-50 p-4 rounded-xl text-center border border-indigo-100">
                                        <p className="text-indigo-400 text-xs font-bold uppercase mb-1">Current Balance</p>
                                        <h1 className="text-4xl font-black text-indigo-900">₹{userBalance.toFixed(2)}</h1>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">AMOUNT TO WITHDRAW</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3.5 text-gray-400 font-bold">₹</span>
                                            <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pl-8 text-lg font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">UPI ID (e.g., student@okicici)</label>
                                        <input type="text" value={withdrawUpi} onChange={(e) => setWithdrawUpi(e.target.value)} placeholder="Enter your UPI ID" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <button type="submit" disabled={isProcessing} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg mt-2 flex items-center justify-center gap-2 disabled:opacity-70">
                                        {isProcessing ? <><Loader className="animate-spin" size={20} /> Processing...</> : "Transfer to Bank"}
                                    </button>
                                </form>
                            )}
                            {walletMode === 'add' && (
                                <div className="text-center space-y-4 relative z-10">
                                    <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-200 inline-block">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${myUPI}&pn=CampusGigs&am=${addAmount}&cu=INR`} alt="UPI QR Code" className="rounded-lg mix-blend-multiply opacity-90" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">AMOUNT TO ADD</label>
                                        <div className="flex justify-center gap-2 mb-4">
                                            {[50, 100, 200, 500].map(amt => (
                                                <button key={amt} onClick={() => setAddAmount(amt.toString())} className={`px-3 py-1 rounded-full text-xs font-bold border transition ${addAmount == amt ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-gray-200 text-gray-500'}`}>₹{amt}</button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500">Scan this QR with any UPI App to add funds instantly.</p>
                                    </div>
                                    <button onClick={handleAddFunds} disabled={isProcessing} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2">
                                        {isProcessing ? <Loader className="animate-spin" size={20} /> : "I have paid, Add Funds"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TOAST */}
                {toast && (
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-bounce-in min-w-[300px] justify-center">
                        <CheckCircle size={18} className="text-green-400" />
                        <span className="text-sm font-medium">{toast}</span>
                    </div>
                )}

            </div>
            <style>{`
        @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes bounce-in { 0% { transform: translate(-50%, -20px); opacity: 0; } 60% { transform: translate(-50%, 10px); opacity: 1; } 100% { transform: translate(-50%, 0); } }
        .animate-bounce-in { animation: bounce-in 0.4s ease-out; }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
        </div>
    );
};

export default CampusGigs;