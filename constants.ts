import { AppData } from './types';

export const ADMIN_PASSWORD = "Johen377";

export const INITIAL_DATA: AppData = {
  settings: {
    heroTitle: "Unlocking Potential Through Dialogue",
    heroSubtitle: "Transformative Corporate Training with Mr. Roel Venus",
    heroImage: "https://picsum.photos/1920/1080",
    contactEmail: "info@venusdialogics.com",
    contactPhone: "+1 (555) 123-4567",
    contactAddress: "123 Leadership Way, Metro City"
  },
  topics: [
    {
      id: "t1",
      title: "Strategic Leadership in the AI Era",
      description: "Navigating the complexities of modern management with emotional intelligence and foresight.",
      imageUrl: "https://picsum.photos/800/600?random=1"
    },
    {
      id: "t2",
      title: "Effective Communication Mastery",
      description: "Breaking down barriers and building bridges in corporate environments.",
      imageUrl: "https://picsum.photos/800/600?random=2"
    },
    {
      id: "t3",
      title: "Sales Dynamics & Negotiation",
      description: "Advanced techniques for closing deals and building long-term client relationships.",
      imageUrl: "https://picsum.photos/800/600?random=3"
    },
    {
      id: "t4",
      title: "Team Synergy Workshop",
      description: "Interactive sessions designed to improve collaboration and morale.",
      imageUrl: "https://picsum.photos/800/600?random=4"
    }
  ],
  stories: [
    {
      id: "s1",
      author: "Sarah Jenkins",
      role: "HR Director, TechCorp",
      content: "Mr. Venus transformed our management team. His approach to conflict resolution is unparalleled. We saw a 30% increase in employee retention within 6 months.",
      isVisible: true,
      comments: [
        {
          id: "c1",
          name: "John Doe",
          email: "john@example.com",
          text: "This is inspiring! We need this at our firm.",
          date: "2023-10-15",
          isVisible: true
        }
      ]
    },
    {
      id: "s2",
      author: "Michael Chang",
      role: "CEO, Future Ventures",
      content: "The 'Strategic Leadership' seminar was a game changer for our board. Highly recommended.",
      isVisible: true,
      comments: []
    }
  ],
  bookings: []
};