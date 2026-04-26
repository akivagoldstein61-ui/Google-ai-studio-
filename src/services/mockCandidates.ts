import { CandidateProfile } from '../types';

export const mockCandidates: CandidateProfile[] = [
  {
    id: "user_1",
    name: "Yael",
    age: 28,
    city: "Tel Aviv",
    distanceMiles: 2,
    relationshipIntent: "serious_relationship",
    observance: "secular",
    familyPlans: "want_someday",
    verified: true,
    languages: ["Hebrew", "English"],
    bio: "Looking for someone to share good food, long walks, and deep conversations.",
    prompts: [
      { id: "p1", question: "My simple pleasures", answer: "Morning coffee and a good book" }
    ],
    interests: ["Reading", "Coffee", "Hiking"],
    lifestyleTags: ["Non-smoker"],
    lastActiveLabel: "Active today",
    photos: [{ id: "photo_1", url: "https://i.pravatar.cc/300?img=5", order: 0, isPrimary: true }],
    gender: "female"
  },
  {
    id: "user_2",
    name: "Omer",
    age: 30,
    city: "Jerusalem",
    distanceMiles: 40,
    relationshipIntent: "marriage_minded",
    observance: "dati",
    familyPlans: "want_someday",
    verified: true,
    languages: ["Hebrew"],
    bio: "Value-driven, looking to build a meaningful life together.",
    prompts: [
      { id: "p2", question: "A typical weekend", answer: "Shabbat meals with family and friends" }
    ],
    interests: ["Volunteering", "History", "Family"],
    lifestyleTags: ["Kosher"],
    lastActiveLabel: "Active yesterday",
    photos: [{ id: "photo_2", url: "https://i.pravatar.cc/300?img=11", order: 0, isPrimary: true }],
    gender: "male"
  },
  {
    id: "user_3",
    name: "Talia",
    age: 26,
    city: "Ramat Gan",
    distanceMiles: 5,
    relationshipIntent: "serious_relationship",
    observance: "traditional",
    familyPlans: "not_sure_yet",
    verified: false,
    languages: ["Hebrew", "English"],
    bio: "Creative soul, always looking for the next spontaneous adventure.",
    prompts: [
      { id: "p3", question: "I geek out on", answer: "Pottery and indoor plants" }
    ],
    interests: ["Art", "Music", "Plants"],
    lifestyleTags: ["Dog owner"],
    lastActiveLabel: "Active today",
    photos: [{ id: "photo_3", url: "https://i.pravatar.cc/300?img=9", order: 0, isPrimary: true }],
    gender: "female"
  },
  {
    id: "user_4",
    name: "Avraham",
    age: 32,
    city: "Haifa",
    distanceMiles: 60,
    relationshipIntent: "marriage_minded",
    observance: "dati",
    familyPlans: "want_someday",
    verified: true,
    languages: ["Hebrew", "English"],
    bio: "Software engineer by day, amateur chef by night.",
    prompts: [
      { id: "p4", question: "Key to my heart", answer: "A home-cooked meal" }
    ],
    interests: ["Cooking", "Tech", "Cycling"],
    lifestyleTags: ["Active"],
    lastActiveLabel: "Active 2 days ago",
    photos: [{ id: "photo_4", url: "https://i.pravatar.cc/300?img=15", order: 0, isPrimary: true }],
    gender: "male"
  },
  {
    id: "user_5",
    name: "Noa",
    age: 29,
    city: "Tel Aviv",
    distanceMiles: 1,
    relationshipIntent: "serious_relationship",
    observance: "secular",
    familyPlans: "want_someday",
    verified: true,
    languages: ["Hebrew", "English", "Spanish"],
    bio: "Love traveling and exploring new cultures.",
    prompts: [
      { id: "p5", question: "Next trip", answer: "South America" }
    ],
    interests: ["Travel", "Languages", "Yoga"],
    lifestyleTags: ["Vegetarian"],
    lastActiveLabel: "Active just now",
    photos: [{ id: "photo_5", url: "https://i.pravatar.cc/300?img=16", order: 0, isPrimary: true }],
    gender: "female"
  },
  {
    id: "user_6",
    name: "David",
    age: 27,
    city: "Petah Tikva",
    distanceMiles: 8,
    relationshipIntent: "serious_relationship",
    observance: "traditional",
    familyPlans: "want_someday",
    verified: true,
    languages: ["Hebrew", "Russian"],
    bio: "Easy going, sports enthusiast.",
    prompts: [
      { id: "p6", question: "Sunday morning", answer: "Running in the park" }
    ],
    interests: ["Running", "Movies", "Dogs"],
    lifestyleTags: ["Active"],
    lastActiveLabel: "Active 3 days ago",
    photos: [{ id: "photo_6", url: "https://i.pravatar.cc/300?img=12", order: 0, isPrimary: true }],
    gender: "male"
  }
];
