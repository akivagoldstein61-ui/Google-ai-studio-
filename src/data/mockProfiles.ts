import { Profile, Conversation } from '../types';

export const MOCK_PROFILES: Profile[] = [
  {
    id: '1',
    uid: 'user1',
    displayName: 'Noa',
    age: 26,
    gender: 'female',
    city: 'Tel Aviv',
    photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600'],
    bio: 'Looking for someone who values sincerity and a quiet Friday night. I love the beach and deep conversations about history.',
    observance: 'traditional',
    intent: 'serious_relationship',
    prompts: [
      { id: 'p1', question: 'My ideal Friday night', answer: 'A home-cooked meal with family and friends.' },
      { id: 'p2', question: 'A life goal of mine', answer: 'To build a home filled with warmth and kindness.' }
    ],
    isVerified: true,
    isPremium: false,
    tags: ['Traditional', 'History', 'Beach', 'Cooking', 'Introverted', 'Thoughtful'],
    lastActive: '2026-03-22T10:00:00Z'
  },
  {
    id: '2',
    uid: 'user2',
    displayName: 'Amit',
    age: 29,
    gender: 'male',
    city: 'Jerusalem',
    photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600'],
    bio: 'Modern Orthodox, high-tech professional, but I make time for what matters. Looking for my partner for life.',
    observance: 'modern_orthodox',
    intent: 'marriage_minded',
    prompts: [
      { id: 'p3', question: 'My favorite tradition', answer: 'Singing Zemirot at the Shabbat table.' },
      { id: 'p4', question: 'What I value most', answer: 'Honesty and intellectual curiosity.' }
    ],
    isVerified: true,
    isPremium: true,
    tags: ['Modern Orthodox', 'Tech', 'Hiking', 'Jerusalem', 'Analytical', 'Planner'],
    lastActive: '2026-03-22T11:30:00Z'
  },
  {
    id: '3',
    uid: 'user3',
    displayName: 'Maya',
    age: 24,
    gender: 'female',
    city: 'Haifa',
    photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'],
    bio: 'Secular but deeply connected to my roots. I love art, nature, and finding beauty in the small things.',
    observance: 'secular',
    intent: 'serious_relationship',
    prompts: [
      { id: 'p5', question: 'A perfect Sunday', answer: 'Hiking in the Carmel mountains followed by a good coffee.' },
      { id: 'p6', question: 'I am most proud of', answer: 'My resilience and my art collection.' }
    ],
    isVerified: false,
    isPremium: false,
    tags: ['Secular', 'Art', 'Nature', 'Haifa', 'Spontaneous', 'Creative'],
    lastActive: '2026-03-22T09:15:00Z'
  },
  {
    id: '4',
    uid: 'user4',
    displayName: 'Yosef',
    age: 31,
    gender: 'male',
    city: 'Raanana',
    photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600'],
    bio: 'Dati, educator, looking for a serious connection. I value community and growth.',
    observance: 'dati',
    intent: 'marriage_minded',
    prompts: [
      { id: 'p7', question: 'My favorite book', answer: 'Anything by Rabbi Sacks.' },
      { id: 'p8', question: 'What makes me laugh', answer: 'Witty observational humor.' }
    ],
    isVerified: true,
    isPremium: false,
    tags: ['Dati', 'Education', 'Community', 'Growth', 'Structured', 'Extroverted'],
    lastActive: '2026-03-22T12:00:00Z'
  },
  {
    id: '5',
    uid: 'user5',
    displayName: 'Shira',
    age: 27,
    gender: 'female',
    city: 'Tel Aviv',
    photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600'],
    bio: 'Masorti. Dog mom. Product manager who loves to organize weekends away and explore new culinary spots.',
    observance: 'masorti',
    intent: 'serious_relationship',
    prompts: [
      { id: 'p9', question: 'I know it is time to delete this app when', answer: 'We can argue about which Hummus place is best and still laugh.' },
      { id: 'p10', question: 'My simple pleasure', answer: 'A long run on the tayelet.' }
    ],
    isVerified: true,
    isPremium: true,
    tags: ['Masorti', 'Dogs', 'Foodie', 'Running', 'Organized', 'Direct'],
    lastActive: '2026-03-22T14:20:00Z'
  },
  {
    id: '6',
    uid: 'user6',
    displayName: 'Daniel',
    age: 33,
    gender: 'male',
    city: 'Jerusalem',
    photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600'],
    bio: 'Traditional. Writer and amateur chef. Seeking someone who appreciates good literature and deep discussions.',
    observance: 'traditional',
    intent: 'marriage_minded',
    prompts: [
      { id: 'p11', question: 'My most irrational fear', answer: 'Running out of good coffee beans.' },
      { id: 'p12', question: 'A boundary of mine is', answer: 'I need quiet time in the mornings to write.' }
    ],
    isVerified: true,
    isPremium: false,
    tags: ['Traditional', 'Writing', 'Cooking', 'Coffee', 'Introverted', 'Reflective'],
    lastActive: '2026-03-22T15:10:00Z'
  }
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    participants: [MOCK_PROFILES[0]],
    messages: [
      { id: 'm1', senderId: 'user1', text: 'Hi! I really liked your bio about history.', createdAt: '2026-03-21T15:00:00Z' },
      { id: 'm2', senderId: 'me', text: 'Shalom Noa! I appreciate that. What kind of history do you like?', createdAt: '2026-03-21T15:05:00Z' }
    ],
    lastMessage: { id: 'm2', senderId: 'me', text: 'Shalom Noa! I appreciate that. What kind of history do you like?', createdAt: '2026-03-21T15:05:00Z' }
  }
];
