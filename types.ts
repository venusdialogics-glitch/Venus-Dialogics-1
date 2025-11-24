export interface Comment {
  id: string;
  name: string;
  email: string;
  text: string;
  date: string;
  isVisible: boolean;
}

export interface Story {
  id: string;
  author: string;
  role: string;
  content: string;
  isVisible: boolean;
  comments: Comment[];
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  topicId: string;
  status: 'pending' | 'confirmed' | 'rejected';
}

export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
}

export interface AppData {
  topics: Topic[];
  stories: Story[];
  bookings: Booking[];
  settings: SiteSettings;
}