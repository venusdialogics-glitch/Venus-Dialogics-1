import React, { useState, useEffect } from 'react';
import { getAppData, saveAppData } from './services/storage';
import { AppData, Comment, Booking } from './types';
import { ADMIN_PASSWORD } from './constants';
import AdminPanel from './components/AdminPanel';
import ChatAssistant from './components/ChatAssistant';
import { Lock, Mail, Phone, MapPin, Calendar, Star, ChevronDown, ChevronUp, MessageCircle, ArrowRight, Clock, Users } from 'lucide-react';

function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [view, setView] = useState<'public' | 'login' | 'admin'>('public');
  const [passwordInput, setPasswordInput] = useState('');
  
  // Public Form States
  const [commentForm, setCommentForm] = useState<{storyId: string, name: string, email: string, text: string} | null>(null);
  const [bookingForm, setBookingForm] = useState({ name: '', email: '', phone: '', date: '', topicId: '' });
  
  // UI States
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());

  // Initial Data Load
  useEffect(() => {
    const loadData = async () => {
      const fetchedData = await getAppData();
      setData(fetchedData);
    };
    loadData();
  }, []);

  const handleUpdateData = async (newData: AppData) => {
    // Optimistic Update: Update UI immediately
    setData(newData);
    // Persist to Database asynchronously
    await saveAppData(newData);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setView('admin');
      setPasswordInput('');
    } else {
      alert('Invalid Password');
    }
  };

  const submitComment = (e: React.FormEvent) => {
      e.preventDefault();
      if(!commentForm || !data) return;

      const newComment: Comment = {
          id: Date.now().toString(),
          name: commentForm.name,
          email: commentForm.email,
          text: commentForm.text,
          date: new Date().toLocaleDateString(),
          isVisible: true 
      };

      const updatedStories = data.stories.map(s => {
          if(s.id === commentForm.storyId) {
              return { ...s, comments: [...s.comments, newComment] };
          }
          return s;
      });

      handleUpdateData({ ...data, stories: updatedStories });
      setCommentForm(null);
      
      // Auto-expand the story to show the new comment
      const newExpanded = new Set(expandedStories);
      newExpanded.add(commentForm.storyId);
      setExpandedStories(newExpanded);

      alert("Comment added successfully!");
  };

  const submitBooking = (e: React.FormEvent) => {
      e.preventDefault();
      if(!data) return;
      
      const newBooking: Booking = {
          id: Date.now().toString(),
          ...bookingForm,
          status: 'pending'
      };

      handleUpdateData({ ...data, bookings: [...data.bookings, newBooking] });
      setBookingForm({ name: '', email: '', phone: '', date: '', topicId: '' });
      alert("Booking request sent! We will contact you shortly.");
  };

  const toggleComments = (id: string) => {
    const newSet = new Set(expandedStories);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedStories(newSet);
  };

  const handleBookTopic = (topicId: string) => {
    setBookingForm(prev => ({ ...prev, topicId }));
    const section = document.getElementById('booking');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!data) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-venus-900"></div></div>;

  // Admin View
  if (view === 'admin') {
    return <AdminPanel data={data} onUpdate={handleUpdateData} onLogout={() => setView('public')} />;
  }

  // Login View
  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-venus-900 text-center">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter Password"
              className="w-full border p-3 rounded"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
            />
            <button type="submit" className="w-full bg-venus-900 text-white p-3 rounded font-bold hover:bg-venus-800 transition">
              Login
            </button>
            <button type="button" onClick={() => setView('public')} className="w-full text-gray-500 text-sm hover:underline">
              Back to Site
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Public View
  return (
    <div className="min-h-screen font-sans">
      {/* Navbar */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-sm z-30 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-venus-900 rounded-tr-xl rounded-bl-xl"></div>
              <span className="text-2xl font-serif font-bold text-venus-900 tracking-tight">VENUS Dialogics</span>
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <a href="#topics" className="text-gray-700 font-medium hover:text-venus-600 transition">Topics</a>
              <a href="#stories" className="text-gray-700 font-medium hover:text-venus-600 transition">Success Stories</a>
              <a href="#booking" className="bg-venus-900 text-white px-6 py-2.5 rounded-full font-bold hover:bg-venus-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">Book Now</a>
            </div>
            <button onClick={() => setView('login')} className="text-gray-400 hover:text-venus-900 transition">
              <Lock size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section 
        className="relative h-screen flex items-center justify-center text-white bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${data.settings.heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <span className="inline-block py-1 px-3 border border-white/30 rounded-full text-sm font-light tracking-widest mb-6 backdrop-blur-sm uppercase">Professional Speaker & Trainer</span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-8 leading-tight drop-shadow-lg">{data.settings.heroTitle}</h1>
          <p className="text-xl md:text-2xl mb-12 font-light text-venus-50 max-w-3xl mx-auto leading-relaxed">{data.settings.heroSubtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#topics" className="bg-white text-venus-900 text-lg font-bold py-4 px-10 rounded-full shadow-lg hover:bg-venus-50 transition-all">
              Explore Topics
            </a>
            <a href="#booking" className="bg-venus-600/90 backdrop-blur text-white text-lg font-bold py-4 px-10 rounded-full shadow-lg hover:bg-venus-600 transition-all border border-venus-400/30">
              Schedule Mr. Venus
            </a>
          </div>
        </div>
        <div className="absolute bottom-10 w-full text-center animate-bounce opacity-70">
            <ChevronDown className="mx-auto text-white" size={40} />
        </div>
      </section>

      {/* Topics */}
      <section id="topics" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-venus-600 font-bold tracking-widest uppercase text-sm">Expertise</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mt-2 mb-6">Training Topics</h2>
            <div className="w-24 h-1.5 bg-venus-500 mx-auto rounded-full"></div>
            <p className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg">Specialized programs tailored for corporate excellence, designed to unlock potential and drive results.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.topics.map((topic) => (
              <div key={topic.id} className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden border border-gray-100 group">
                <div className="relative h-64 overflow-hidden">
                  <img 
                      src={topic.imageUrl} 
                      alt={topic.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-venus-500/90 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider shadow-sm">Training</span>
                        <span className="bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border border-white/20">Certified</span>
                      </div>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow relative">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif group-hover:text-venus-700 transition-colors leading-tight">{topic.title}</h3>
                    
                    {/* Short Information */}
                    <div className="flex items-center gap-4 mb-4 text-xs font-semibold text-gray-500 border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-venus-500" />
                            <span>1-2 Days</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users size={14} className="text-venus-500" />
                            <span>Interactive</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Star size={14} className="text-venus-500" />
                            <span>Pro Level</span>
                        </div>
                    </div>

                    <p className="text-gray-600 text-base mb-8 flex-grow leading-relaxed">
                        {topic.description}
                    </p>
                    
                    <button 
                        onClick={() => handleBookTopic(topic.id)}
                        className="w-full py-4 px-6 bg-venus-900 text-white font-bold rounded-xl hover:bg-venus-800 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group-hover:bg-venus-700"
                    >
                        Book Topic <ArrowRight size={18} />
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="stories" className="py-24 bg-white relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-64 bg-venus-50/50 skew-y-3 transform -translate-y-20"></div>

        <div className="max-w-4xl mx-auto px-4 relative z-10">
           <div className="text-center mb-16">
            <span className="text-venus-600 font-bold tracking-widest uppercase text-sm">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mt-2 mb-6">Success Stories</h2>
            <div className="w-24 h-1.5 bg-venus-500 mx-auto rounded-full"></div>
            <p className="mt-6 text-gray-600">Hear from industry leaders who have transformed their organizations through our dialogue.</p>
          </div>
          
          <div className="space-y-10">
            {data.stories.filter(s => s.isVisible).map((story) => (
                <div key={story.id} className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100 hover:border-venus-100 transition-colors">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-shrink-0">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-venus-900 to-venus-700 flex items-center justify-center text-white font-bold text-3xl font-serif shadow-lg ring-4 ring-venus-50">
                                {story.author[0]}
                            </div>
                        </div>
                        <div className="flex-grow w-full">
                            <div className="mb-6">
                                <h3 className="font-bold text-xl text-gray-900">{story.author}</h3>
                                <p className="text-venus-600 font-medium">{story.role}</p>
                            </div>
                            <blockquote className="text-xl md:text-2xl text-gray-700 italic font-serif leading-relaxed mb-8 relative">
                                <span className="absolute -top-4 -left-2 text-6xl text-venus-100 font-sans font-bold opacity-50">“</span>
                                {story.content}
                                <span className="absolute -bottom-10 right-0 text-6xl text-venus-100 font-sans font-bold opacity-50">”</span>
                            </blockquote>
                            
                            {/* Dropdown for Comments */}
                            <div className="mt-8">
                                <button 
                                    onClick={() => toggleComments(story.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group ${
                                        expandedStories.has(story.id) 
                                        ? 'bg-venus-50 border-venus-200 text-venus-900' 
                                        : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-white hover:border-venus-200 hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 font-semibold">
                                        <div className={`p-2 rounded-full ${expandedStories.has(story.id) ? 'bg-white text-venus-600' : 'bg-white text-gray-400 group-hover:text-venus-500'}`}>
                                            <MessageCircle size={20} />
                                        </div>
                                        <span>
                                            {story.comments.filter(c => c.isVisible).length > 0 
                                                ? `${story.comments.filter(c => c.isVisible).length} Comments`
                                                : 'Leave a comment'}
                                        </span>
                                    </div>
                                    <div className={`transform transition-transform duration-300 ${expandedStories.has(story.id) ? 'rotate-180 text-venus-600' : 'text-gray-400 group-hover:text-venus-500'}`}>
                                         <ChevronDown size={20} />
                                    </div>
                                </button>

                                {expandedStories.has(story.id) && (
                                    <div className="mt-4 bg-gray-50/80 backdrop-blur-sm rounded-xl p-6 border border-venus-100 animate-in slide-in-from-top-2 fade-in duration-300">
                                        <div className="space-y-4 mb-8">
                                            {story.comments.filter(c => c.isVisible).map(comment => (
                                                <div key={comment.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                                {comment.name[0]}
                                                            </div>
                                                            <span className="font-bold text-gray-800 text-sm">{comment.name}</span>
                                                        </div>
                                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                                            <Calendar size={10} /> {comment.date}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm ml-10 leading-relaxed">{comment.text}</p>
                                                </div>
                                            ))}
                                            {story.comments.filter(c => c.isVisible).length === 0 && (
                                                <div className="text-center py-8">
                                                    <MessageCircle size={32} className="mx-auto text-gray-300 mb-2" />
                                                    <p className="text-gray-400 italic">No comments yet. Be the first to share your thoughts!</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Add Comment Form */}
                                        <div className="bg-white p-6 rounded-xl border border-venus-100 shadow-sm">
                                            <h5 className="text-sm font-bold text-venus-900 mb-4 flex items-center gap-2">
                                                <MessageCircle size={16} /> Write a comment
                                            </h5>
                                            <form onSubmit={submitComment} className="space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <input required type="text" placeholder="Name" className="w-full text-sm bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-venus-500 focus:border-venus-500 outline-none transition-all" value={commentForm?.storyId === story.id ? commentForm.name : ''} onChange={e => setCommentForm({storyId: story.id, name: e.target.value, email: commentForm?.email || '', text: commentForm?.text || ''})} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <input required type="email" placeholder="Email (Private)" className="w-full text-sm bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-venus-500 focus:border-venus-500 outline-none transition-all" value={commentForm?.storyId === story.id ? commentForm.email : ''} onChange={e => setCommentForm({storyId: story.id, name: commentForm?.name || '', email: e.target.value, text: commentForm?.text || ''})} />
                                                    </div>
                                                </div>
                                                <textarea required placeholder="Share your experience..." className="w-full text-sm bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-venus-500 focus:border-venus-500 outline-none transition-all resize-none" rows={3} value={commentForm?.storyId === story.id ? commentForm.text : ''} onChange={e => setCommentForm({storyId: story.id, name: commentForm?.name || '', email: commentForm?.email || '', text: e.target.value})}></textarea>
                                                <div className="flex justify-end">
                                                    <button type="submit" className="bg-venus-900 text-white text-sm px-8 py-3 rounded-lg hover:bg-venus-800 font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                                                        Post Comment <ArrowRight size={14} />
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            {data.stories.filter(s => s.isVisible).length === 0 && (
                <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg">Stories are currently being updated. Check back soon!</div>
            )}
          </div>
        </div>
      </section>

      {/* Booking */}
      <section id="booking" className="py-24 bg-venus-900 text-white relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
             <div className="text-center mb-16">
                <span className="text-venus-300 font-bold tracking-widest uppercase text-sm">Reservations</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mt-2 mb-6">Book a Schedule</h2>
                <div className="w-24 h-1.5 bg-venus-500 mx-auto rounded-full"></div>
                <p className="mt-6 text-venus-100 text-lg">Secure Mr. Venus for your next corporate event and start the transformation.</p>
            </div>

            <form onSubmit={submitBooking} className="bg-white text-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl border-4 border-white/10 backdrop-blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-2">
                        <label className="block font-bold text-sm text-gray-700 ml-1">Full Name</label>
                        <input required type="text" placeholder="John Doe" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:border-venus-500 focus:ring-2 focus:ring-venus-200 outline-none transition-all" 
                            value={bookingForm.name} onChange={e => setBookingForm({...bookingForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="block font-bold text-sm text-gray-700 ml-1">Email Address</label>
                        <input required type="email" placeholder="john@company.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:border-venus-500 focus:ring-2 focus:ring-venus-200 outline-none transition-all" 
                            value={bookingForm.email} onChange={e => setBookingForm({...bookingForm, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="block font-bold text-sm text-gray-700 ml-1">Phone Number</label>
                        <input required type="tel" placeholder="+1 (555) 000-0000" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:border-venus-500 focus:ring-2 focus:ring-venus-200 outline-none transition-all" 
                             value={bookingForm.phone} onChange={e => setBookingForm({...bookingForm, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="block font-bold text-sm text-gray-700 ml-1">Preferred Date</label>
                        <input required type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:border-venus-500 focus:ring-2 focus:ring-venus-200 outline-none transition-all" 
                            value={bookingForm.date} onChange={e => setBookingForm({...bookingForm, date: e.target.value})} />
                    </div>
                </div>
                <div className="mb-10 space-y-2">
                    <label className="block font-bold text-sm text-gray-700 ml-1">Select Topic (Required)</label>
                    <div className="relative">
                        <select required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 appearance-none focus:border-venus-500 focus:ring-2 focus:ring-venus-200 outline-none transition-all"
                             value={bookingForm.topicId} onChange={e => setBookingForm({...bookingForm, topicId: e.target.value})}>
                            <option value="">-- Choose a Topic --</option>
                            {data.topics.map(t => (
                                <option key={t.id} value={t.id}>{t.title}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                    </div>
                </div>
                <button type="submit" className="w-full bg-venus-600 text-white font-bold text-xl py-5 rounded-xl hover:bg-venus-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex justify-center items-center gap-2">
                    <Calendar size={24} /> Confirm Booking Request
                </button>
            </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-sm">
            <div>
                <div className="flex items-center gap-2 mb-6 text-white">
                     <div className="w-6 h-6 bg-venus-500 rounded-tr-lg rounded-bl-lg"></div>
                     <h3 className="font-serif font-bold text-2xl tracking-tight">VENUS Dialogics</h3>
                </div>
                <p className="leading-relaxed mb-6">Empowering leaders and organizations through the art of dialogue and strategic training.</p>
                <p className="opacity-60">&copy; {new Date().getFullYear()} Venus Dialogics & Training Unlimited.<br/>All rights reserved.</p>
            </div>
            <div>
                <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Contact Us</h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-3 group">
                        <Mail size={18} className="text-venus-500 mt-1 group-hover:text-venus-400 transition-colors"/> 
                        <span className="group-hover:text-gray-300 transition-colors">{data.settings.contactEmail}</span>
                    </div>
                    <div className="flex items-start gap-3 group">
                        <Phone size={18} className="text-venus-500 mt-1 group-hover:text-venus-400 transition-colors"/> 
                        <span className="group-hover:text-gray-300 transition-colors">{data.settings.contactPhone}</span>
                    </div>
                    <div className="flex items-start gap-3 group">
                        <MapPin size={18} className="text-venus-500 mt-1 group-hover:text-venus-400 transition-colors"/> 
                        <span className="group-hover:text-gray-300 transition-colors">{data.settings.contactAddress}</span>
                    </div>
                </div>
            </div>
            <div>
                <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Administration</h3>
                <p className="mb-4">Access for staff and content managers.</p>
                <button onClick={() => setView('login')} className="flex items-center gap-2 text-venus-500 hover:text-venus-400 transition-colors border border-venus-500/30 hover:border-venus-500/50 px-4 py-2 rounded-lg">
                    <Lock size={16} /> Admin Login
                </button>
            </div>
        </div>
      </footer>

      <ChatAssistant topics={data.topics} />
    </div>
  );
}

export default App;