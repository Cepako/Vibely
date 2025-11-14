import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { prepare: true });
const db = drizzle(sql);

const interests = [
    // Technology & Programming
    'Programming',
    'Web Development',
    'Mobile Development',
    'Artificial Intelligence',
    'Machine Learning',
    'Data Science',
    'Cybersecurity',
    'Cloud Computing',
    'DevOps',
    'Blockchain',
    'Gaming',
    'Virtual Reality',
    'Robotics',
    '3D Printing',

    // Arts & Creativity
    'Photography',
    'Digital Art',
    'Traditional Painting',
    'Drawing',
    'Sculpture',
    'Graphic Design',
    'UI/UX Design',
    'Animation',
    'Video Editing',
    'Music Production',
    'Singing',
    'Playing Guitar',
    'Playing Piano',
    'Dancing',
    'Theater',
    'Writing',
    'Poetry',
    'Storytelling',
    'Crafting',
    'Jewelry Making',
    'Pottery',
    'Knitting',
    'Embroidery',

    // Sports & Fitness
    'Football',
    'Basketball',
    'Soccer',
    'Tennis',
    'Baseball',
    'Volleyball',
    'Swimming',
    'Running',
    'Marathon',
    'Cycling',
    'Mountain Biking',
    'Rock Climbing',
    'Hiking',
    'Camping',
    'Skiing',
    'Snowboarding',
    'Surfing',
    'Skateboarding',
    'Martial Arts',
    'Boxing',
    'Yoga',
    'Pilates',
    'CrossFit',
    'Weightlifting',
    'Bodybuilding',
    'Gym',

    // Food & Cooking
    'Cooking',
    'Baking',
    'Grilling',
    'Vegetarian Cooking',
    'Vegan Cooking',
    'Italian Cuisine',
    'Asian Cuisine',
    'Mexican Cuisine',
    'French Cuisine',
    'Mediterranean Cuisine',
    'Wine Tasting',
    'Coffee',
    'Tea',
    'Craft Beer',
    'Mixology',
    'Food Photography',
    'Restaurant Reviews',

    // Travel & Adventure
    'Traveling',
    'Backpacking',
    'Road Trips',
    'Solo Travel',
    'Adventure Travel',
    'Cultural Tourism',
    'Beach Vacations',
    'Mountain Tourism',
    'City Exploration',
    'International Travel',
    'Domestic Travel',
    'Budget Travel',
    'Luxury Travel',
    'Travel Photography',

    // Health & Wellness
    'Meditation',
    'Mindfulness',
    'Mental Health',
    'Nutrition',
    'Healthy Living',
    'Natural Remedies',
    'Alternative Medicine',
    'Fitness',
    'Wellness',
    'Self-Care',
    'Stress Management',

    // Hobbies & Interests
    'Reading',
    'Book Clubs',
    'Science Fiction',
    'Fantasy',
    'Mystery',
    'Romance',
    'Non-Fiction',
    'Biography',
    'History',
    'Philosophy',
    'Psychology',
    'Astronomy',
    'Astrology',
    'Gardening',
    'Indoor Plants',
    'Pet Care',
    'Dogs',
    'Cats',
    'Birds',
    'Fish Keeping',
    'Volunteer Work',
    'Community Service',
    'Environmental Conservation',
    'Sustainability',
    'Zero Waste',
    'Minimalism',

    // Entertainment & Media
    'Movies',
    'TV Series',
    'Documentaries',
    'Netflix',
    'Anime',
    'Manga',
    'Comics',
    'Podcasts',
    'Streaming',
    'YouTube',
    'Social Media',
    'Memes',
    'Stand-up Comedy',
    'Concerts',
    'Music Festivals',
    'Live Music',

    // Music Genres
    'Rock',
    'Pop',
    'Hip Hop',
    'Electronic',
    'Jazz',
    'Classical',
    'Country',
    'Blues',
    'Reggae',
    'Metal',
    'Indie',
    'Alternative',
    'R&B',
    'Folk',
    'World Music',

    // Learning & Education
    'Languages',
    'Spanish',
    'French',
    'German',
    'Japanese',
    'Chinese',
    'Italian',
    'Portuguese',
    'Online Courses',
    'Skill Development',
    'Personal Development',
    'Career Growth',
    'Entrepreneurship',
    'Business',
    'Finance',
    'Investing',
    'Real Estate',
    'Economics',

    // Science & Nature
    'Biology',
    'Chemistry',
    'Physics',
    'Environmental Science',
    'Climate Change',
    'Wildlife',
    'Bird Watching',
    'Nature Photography',
    'Geology',
    'Meteorology',
    'Marine Biology',

    // Social & Community
    'Networking',
    'Public Speaking',
    'Leadership',
    'Team Building',
    'Social Justice',
    'Politics',
    'Religion',
    'Spirituality',
    'Parenting',
    'Family',
    'Relationships',
    'Dating',
    'Marriage',
    'Fashion',
    'Beauty',
    'Makeup',
    'Skincare',
    'Hair Styling',

    // Collecting & Trading
    'Collecting',
    'Coin Collecting',
    'Stamp Collecting',
    'Trading Cards',
    'Vintage Items',
    'Antiques',
    'Art Collecting',
    'Book Collecting',

    // DIY & Home
    'DIY Projects',
    'Home Improvement',
    'Interior Design',
    'Home Decor',
    'Woodworking',
    'Furniture Making',
    'Home Organization',
    'Cleaning',
    'Repair',
    'Renovation',
];

const eventCategories = [
    // Social Events
    {
        name: 'Parties',
        description: 'Birthday parties, celebrations, and social gatherings',
    },
    {
        name: 'Meetups',
        description: 'Casual social gatherings and networking events',
    },
    {
        name: 'Networking',
        description: 'Professional networking and business connections',
    },
    {
        name: 'Dating',
        description: 'Speed dating, singles events, and romantic meetups',
    },
    {
        name: 'Community',
        description: 'Neighborhood and community building events',
    },
    {
        name: 'Cultural',
        description: 'Cultural celebrations and heritage events',
    },
    {
        name: 'Holiday Celebrations',
        description: 'Seasonal and holiday themed gatherings',
    },

    // Sports & Fitness
    {
        name: 'Sports Events',
        description: 'Competitive sports games and tournaments',
    },
    {
        name: 'Fitness Classes',
        description: 'Group workout sessions and fitness activities',
    },
    {
        name: 'Outdoor Activities',
        description: 'Hiking, camping, and nature-based events',
    },
    {
        name: 'Running Events',
        description: 'Marathons, fun runs, and running clubs',
    },
    { name: 'Team Sports', description: 'Group sports activities and leagues' },
    {
        name: 'Individual Sports',
        description: 'Tennis, golf, and other individual sports',
    },
    {
        name: 'Water Sports',
        description: 'Swimming, surfing, and water-based activities',
    },
    {
        name: 'Winter Sports',
        description: 'Skiing, snowboarding, and cold weather sports',
    },
    {
        name: 'Extreme Sports',
        description: 'Adventure sports and adrenaline activities',
    },

    // Entertainment
    { name: 'Concerts', description: 'Musical performances and live shows' },
    {
        name: 'Theater',
        description: 'Plays, musicals, and theatrical performances',
    },
    { name: 'Comedy Shows', description: 'Stand-up comedy and humor events' },
    {
        name: 'Movie Screenings',
        description: 'Film showings and cinema events',
    },
    {
        name: 'Festivals',
        description: 'Music festivals, art festivals, and celebrations',
    },
    {
        name: 'Art Exhibitions',
        description: 'Gallery openings and art showcases',
    },
    {
        name: 'Gaming',
        description: 'Video game tournaments and board game nights',
    },
    {
        name: 'Dance Events',
        description: 'Dance parties, lessons, and performances',
    },

    // Education & Learning
    {
        name: 'Workshops',
        description: 'Skill-building and educational workshops',
    },
    {
        name: 'Seminars',
        description: 'Professional development and informational sessions',
    },
    {
        name: 'Conferences',
        description: 'Industry conferences and large gatherings',
    },
    {
        name: 'Classes',
        description: 'Educational classes and learning sessions',
    },
    {
        name: 'Book Clubs',
        description: 'Reading groups and literary discussions',
    },
    {
        name: 'Language Exchange',
        description: 'Language learning and practice groups',
    },
    {
        name: 'Tech Meetups',
        description: 'Technology and programming gatherings',
    },

    // Food & Dining
    { name: 'Dining', description: 'Restaurant visits and food experiences' },
    {
        name: 'Cooking Classes',
        description: 'Culinary workshops and cooking lessons',
    },
    {
        name: 'Wine Tasting',
        description: 'Wine appreciation and tasting events',
    },
    {
        name: 'Food Festivals',
        description: 'Food-focused festivals and celebrations',
    },
    { name: 'Potluck', description: 'Shared meal gatherings' },
    { name: 'Bar Events', description: 'Happy hours and bar gatherings' },
    { name: 'Coffee Meetups', description: 'Casual coffee shop gatherings' },

    // Health & Wellness
    {
        name: 'Yoga Classes',
        description: 'Yoga sessions and mindfulness practices',
    },
    {
        name: 'Meditation',
        description: 'Meditation groups and mindfulness events',
    },
    {
        name: 'Wellness Workshops',
        description: 'Health and wellness focused sessions',
    },
    { name: 'Support Groups', description: 'Peer support and therapy groups' },
    {
        name: 'Mental Health',
        description: 'Mental health awareness and support events',
    },

    // Business & Professional
    {
        name: 'Business Events',
        description: 'Corporate events and business gatherings',
    },
    {
        name: 'Career Development',
        description: 'Professional growth and career events',
    },
    {
        name: 'Startup Events',
        description: 'Entrepreneurship and startup focused gatherings',
    },
    {
        name: 'Trade Shows',
        description: 'Industry exhibitions and trade events',
    },
    {
        name: 'Product Launches',
        description: 'New product announcements and demos',
    },

    // Travel & Adventure
    { name: 'Travel Groups', description: 'Group travel and adventure trips' },
    { name: 'Day Trips', description: 'Short local excursions and outings' },
    {
        name: 'Adventure Tours',
        description: 'Guided adventure and exploration trips',
    },
    {
        name: 'Cultural Tours',
        description: 'Heritage and cultural exploration events',
    },

    // Volunteer & Charity
    {
        name: 'Volunteer Work',
        description: 'Community service and volunteer opportunities',
    },
    {
        name: 'Charity Events',
        description: 'Fundraising and charitable gatherings',
    },
    {
        name: 'Environmental',
        description: 'Environmental cleanup and conservation events',
    },
    {
        name: 'Social Causes',
        description: 'Social justice and advocacy events',
    },

    // Family & Kids
    {
        name: 'Family Events',
        description: 'Family-friendly activities and gatherings',
    },
    {
        name: 'Kids Activities',
        description: 'Children-focused events and entertainment',
    },
    {
        name: 'Parenting Groups',
        description: 'Parent support and advice groups',
    },
    {
        name: 'Educational Kids',
        description: 'Learning activities for children',
    },

    // Special Interest
    { name: 'Photography', description: 'Photo walks and photography meetups' },
    { name: 'Book Events', description: 'Author readings and literary events' },
    { name: 'Craft Workshops', description: 'DIY and crafting sessions' },
    { name: 'Gardening', description: 'Garden tours and plant-related events' },
    {
        name: 'Pet Events',
        description: 'Pet-friendly gatherings and animal events',
    },
    { name: 'Fashion', description: 'Fashion shows and style events' },
    { name: 'Beauty', description: 'Makeup workshops and beauty events' },

    // Virtual Events
    {
        name: 'Online Events',
        description: 'Virtual gatherings and digital meetups',
    },
    { name: 'Webinars', description: 'Online educational sessions' },
    {
        name: 'Virtual Conferences',
        description: 'Digital conferences and presentations',
    },
    {
        name: 'Online Gaming',
        description: 'Virtual gaming tournaments and sessions',
    },

    // Seasonal & Holidays
    {
        name: 'Summer Events',
        description: 'Warm weather and summer activities',
    },
    {
        name: 'Winter Events',
        description: 'Cold weather and winter celebrations',
    },
    {
        name: 'Spring Events',
        description: 'Spring-themed activities and gatherings',
    },
    {
        name: 'Fall Events',
        description: 'Autumn activities and harvest celebrations',
    },
    { name: 'New Year', description: 'New Year celebrations and events' },
    { name: "Valentine's Day", description: 'Romance-themed events' },
    { name: 'Halloween', description: 'Costume parties and spooky events' },
    {
        name: 'Christmas',
        description: 'Holiday celebrations and festive gatherings',
    },
    { name: 'Thanksgiving', description: 'Gratitude and harvest celebrations' },

    // Miscellaneous
    {
        name: 'Pop-up Events',
        description: 'Temporary and spontaneous gatherings',
    },
    { name: 'Flash Mobs', description: 'Organized group performances' },
    {
        name: 'Protests & Rallies',
        description: 'Political and social activism events',
    },
    {
        name: 'Religious Events',
        description: 'Faith-based gatherings and ceremonies',
    },
    { name: 'Graduation', description: 'Academic achievement celebrations' },
    { name: 'Weddings', description: 'Wedding ceremonies and receptions' },
    { name: 'Baby Showers', description: 'Baby celebration events' },
    { name: 'Retirement', description: 'Career milestone celebrations' },
    {
        name: 'Memorial Services',
        description: 'Remembrance and tribute events',
    },
];

async function seed() {
    console.log('▶ Seeding dictionaries...\n');

    console.log('→ Inserting INTERESTS...');

    for (const name of interests) {
        await sql`
      INSERT INTO interests (name) 
      VALUES (${name}) 
      ON CONFLICT (name) DO NOTHING;
    `;
    }

    console.log('→ Inserting EVENT CATEGORIES...');

    for (const cat of eventCategories) {
        await sql`
      INSERT INTO event_categories (name, description) 
      VALUES (${cat.name}, ${cat.description}) 
      ON CONFLICT (name) DO NOTHING;
    `;
    }

    console.log('\n✔ DONE — dictionaries seeded successfully!');

    await sql.end();
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
