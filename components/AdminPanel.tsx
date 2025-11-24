import React, { useState } from 'react';
import { AppData, Topic, Story, Booking, SiteSettings } from '../types';
import { Trash2, Eye, EyeOff, Plus, Save, Edit2, CheckCircle, XCircle } from 'lucide-react';

interface AdminPanelProps {
  data: AppData;
  onUpdate: (newData: AppData) => void;
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ data, onUpdate, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'topics' | 'stories' | 'bookings' | 'settings'>('topics');
  
  // Settings State
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(data.settings);

  // Handlers
  const handleDeleteTopic = (id: string) => {
    if(!window.confirm("Delete this topic?")) return;
    const newTopics = data.topics.filter(t => t.id !== id);
    onUpdate({ ...data, topics: newTopics });
  };

  const handleToggleStory = (id: string) => {
    const newStories = data.stories.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s);
    onUpdate({ ...data, stories: newStories });
  };
  
  const handleToggleComment = (storyId: string, commentId: string) => {
     const newStories = data.stories.map(s => {
         if(s.id !== storyId) return s;
         return {
             ...s,
             comments: s.comments.map(c => c.id === commentId ? {...c, isVisible: !c.isVisible} : c)
         }
     });
     onUpdate({...data, stories: newStories});
  };

  const handleSaveSettings = () => {
    onUpdate({ ...data, settings: settingsForm });
    alert('Settings saved!');
  };

  const handleBookingStatus = (id: string, status: Booking['status']) => {
    const newBookings = data.bookings.map(b => b.id === id ? { ...b, status } : b);
    onUpdate({ ...data, bookings: newBookings });
  };
  
  const handleAddTopic = () => {
      const title = prompt("Enter Topic Title:");
      if(!title) return;
      const desc = prompt("Enter Description:");
      if(!desc) return;
      const img = prompt("Enter Image URL:", "https://picsum.photos/800/600");
      
      const newTopic: Topic = {
          id: Date.now().toString(),
          title,
          description: desc || "",
          imageUrl: img || ""
      };
      onUpdate({...data, topics: [...data.topics, newTopic]});
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-venus-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold font-serif">Admin</h2>
          <p className="text-xs text-venus-100">VENUS Dialogics</p>
        </div>
        <nav className="flex-1">
          <button onClick={() => setActiveTab('topics')} className={`w-full text-left p-4 hover:bg-venus-800 ${activeTab === 'topics' ? 'bg-venus-800 border-l-4 border-venus-500' : ''}`}>Topics</button>
          <button onClick={() => setActiveTab('stories')} className={`w-full text-left p-4 hover:bg-venus-800 ${activeTab === 'stories' ? 'bg-venus-800 border-l-4 border-venus-500' : ''}`}>Success Stories</button>
          <button onClick={() => setActiveTab('bookings')} className={`w-full text-left p-4 hover:bg-venus-800 ${activeTab === 'bookings' ? 'bg-venus-800 border-l-4 border-venus-500' : ''}`}>Bookings</button>
          <button onClick={() => setActiveTab('settings')} className={`w-full text-left p-4 hover:bg-venus-800 ${activeTab === 'settings' ? 'bg-venus-800 border-l-4 border-venus-500' : ''}`}>Site Settings</button>
        </nav>
        <button onClick={onLogout} className="p-4 bg-red-900 hover:bg-red-800 text-center">Logout</button>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'topics' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Manage Topics</h2>
              <button onClick={handleAddTopic} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                <Plus size={18} /> Add Topic
              </button>
            </div>
            <div className="grid gap-4">
              {data.topics.map(topic => (
                <div key={topic.id} className="bg-white p-4 rounded shadow flex justify-between items-start">
                  <div className="flex gap-4">
                    <img src={topic.imageUrl} alt={topic.title} className="w-24 h-24 object-cover rounded" />
                    <div>
                      <h3 className="font-bold text-lg">{topic.title}</h3>
                      <p className="text-gray-600 text-sm">{topic.description}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteTopic(topic.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stories' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Success Stories & Comments</h2>
            <div className="space-y-6">
              {data.stories.map(story => (
                <div key={story.id} className="bg-white p-6 rounded shadow border-l-4 border-venus-500">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{story.author} <span className="text-gray-400 font-normal text-sm">| {story.role}</span></h3>
                      <p className="text-gray-700 mt-2 italic">"{story.content}"</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleToggleStory(story.id)}
                        className={`p-2 rounded ${story.isVisible ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}
                      >
                        {story.isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>
                      <button onClick={() => {
                          if(confirm("Delete story?")) {
                              const newStories = data.stories.filter(s => s.id !== story.id);
                              onUpdate({...data, stories: newStories});
                          }
                      }} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={20}/></button>
                    </div>
                  </div>
                  
                  {/* Comments Management */}
                  <div className="mt-4 pl-4 border-l-2 border-gray-200">
                    <h4 className="text-sm font-bold text-gray-500 mb-2">Comments ({story.comments.length})</h4>
                    {story.comments.length === 0 && <p className="text-xs text-gray-400">No comments yet.</p>}
                    <div className="space-y-2">
                        {story.comments.map(comment => (
                            <div key={comment.id} className="bg-gray-50 p-3 rounded text-sm flex justify-between items-center">
                                <div>
                                    <span className="font-semibold">{comment.name}</span> <span className="text-gray-400 text-xs">({comment.email})</span>
                                    <p className="text-gray-600">{comment.text}</p>
                                </div>
                                <button 
                                    onClick={() => handleToggleComment(story.id, comment.id)}
                                    className={`ml-2 text-xs px-2 py-1 rounded border ${comment.isVisible ? 'border-green-500 text-green-600' : 'border-gray-400 text-gray-400'}`}
                                >
                                    {comment.isVisible ? 'Visible' : 'Hidden'}
                                </button>
                            </div>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Booking Requests</h2>
            <div className="bg-white rounded shadow overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Topic</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bookings.map(booking => {
                    const topicName = data.topics.find(t => t.id === booking.topicId)?.title || "Unknown Topic";
                    return (
                      <tr key={booking.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-semibold">{booking.name}</td>
                        <td className="p-4 text-sm">
                          {booking.email}<br/>{booking.phone}
                        </td>
                        <td className="p-4">{topicName}</td>
                        <td className="p-4">{booking.date}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                            booking.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-4 flex gap-2">
                          <button onClick={() => handleBookingStatus(booking.id, 'confirmed')} className="text-green-600 hover:text-green-800"><CheckCircle size={20}/></button>
                          <button onClick={() => handleBookingStatus(booking.id, 'rejected')} className="text-red-600 hover:text-red-800"><XCircle size={20}/></button>
                        </td>
                      </tr>
                    );
                  })}
                  {data.bookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">No booking requests found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Site Settings</h2>
                <button onClick={handleSaveSettings} className="flex items-center gap-2 bg-venus-900 text-white px-4 py-2 rounded hover:bg-venus-800">
                  <Save size={18} /> Save Changes
                </button>
            </div>
            <div className="bg-white p-6 rounded shadow space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-bold mb-1">Hero Title</label>
                <input type="text" className="w-full border p-2 rounded" value={settingsForm.heroTitle} onChange={e => setSettingsForm({...settingsForm, heroTitle: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Hero Subtitle</label>
                <input type="text" className="w-full border p-2 rounded" value={settingsForm.heroSubtitle} onChange={e => setSettingsForm({...settingsForm, heroSubtitle: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Hero Background Image URL</label>
                <div className="flex gap-2">
                    <input type="text" className="w-full border p-2 rounded" value={settingsForm.heroImage} onChange={e => setSettingsForm({...settingsForm, heroImage: e.target.value})} />
                </div>
                {settingsForm.heroImage && <img src={settingsForm.heroImage} alt="Preview" className="h-32 mt-2 rounded object-cover" />}
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Contact Email</label>
                    <input type="text" className="w-full border p-2 rounded" value={settingsForm.contactEmail} onChange={e => setSettingsForm({...settingsForm, contactEmail: e.target.value})} />
                  </div>
                   <div>
                    <label className="block text-sm font-bold mb-1">Contact Phone</label>
                    <input type="text" className="w-full border p-2 rounded" value={settingsForm.contactPhone} onChange={e => setSettingsForm({...settingsForm, contactPhone: e.target.value})} />
                  </div>
              </div>
               <div>
                <label className="block text-sm font-bold mb-1">Address</label>
                <input type="text" className="w-full border p-2 rounded" value={settingsForm.contactAddress} onChange={e => setSettingsForm({...settingsForm, contactAddress: e.target.value})} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
