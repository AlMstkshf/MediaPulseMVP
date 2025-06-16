import { db } from "../server/db";
import { socialPosts } from "../shared/schema";

async function seedAjmanSocialPosts() {
  console.log("Adding realistic Ajman Police social media posts...");

  const ajmanPolicePosts = [
    // Twitter Posts - Arabic and English
    {
      platform: "Twitter",
      content: "شرطة عجمان تطلق حملة توعوية للحفاظ على سلامة المجتمع خلال موسم الأمطار. #سلامتك_أولويتنا #شرطة_عجمان",
      authorName: "محمد الشامسي",
      authorUsername: "m_alshamsi98",
      authorAvatarUrl: "https://randomuser.me/api/portraits/men/22.jpg",
      postUrl: "https://twitter.com/m_alshamsi98/status/1654821576",
      postedAt: new Date(2025, 3, 15, 9, 23, 0),
      sentiment: 75,
      engagement: { likes: 87, shares: 32, comments: 15 },
      keywords: ["شرطة عجمان", "سلامة", "توعية", "أمطار"]
    },
    {
      platform: "Twitter",
      content: "Thank you @AjmanPolice for your quick response to our neighborhood security concerns. The new patrol system is making us feel much safer. #SafeAjman #UAEPolice",
      authorName: "Sara Ahmed",
      authorUsername: "sara_a_uae",
      authorAvatarUrl: "https://randomuser.me/api/portraits/women/28.jpg",
      postUrl: "https://twitter.com/sara_a_uae/status/1654827623",
      postedAt: new Date(2025, 3, 22, 15, 45, 0),
      sentiment: 100,
      engagement: { likes: 124, shares: 45, comments: 22 },
      keywords: ["Ajman Police", "security", "patrol", "neighborhood"]
    },
    {
      platform: "Twitter",
      content: "نشكر شرطة عجمان على تنظيم حركة المرور بشكل فعال خلال ساعات الذروة اليوم. تحسن كبير ملحوظ! #شرطة_عجمان #المرور",
      authorName: "عبدالله النعيمي",
      authorUsername: "abduae_n",
      authorAvatarUrl: "https://randomuser.me/api/portraits/men/45.jpg",
      postUrl: "https://twitter.com/abduae_n/status/1654823478",
      postedAt: new Date(2025, 3, 25, 18, 12, 0),
      sentiment: 90,
      engagement: { likes: 65, shares: 18, comments: 7 },
      keywords: ["شرطة عجمان", "مرور", "ساعات الذروة", "تنظيم"]
    },
    
    // Facebook Posts
    {
      platform: "Facebook",
      content: "Attended the Ajman Police community safety workshop today. Great initiative to bring together residents and law enforcement! The child safety demonstrations were particularly informative. #AjmanPolice #CommunitySafety",
      authorName: "David Williams",
      authorUsername: "david.williams.uae",
      authorAvatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      postUrl: "https://facebook.com/david.williams.uae/posts/1098743",
      postedAt: new Date(2025, 3, 18, 14, 30, 0),
      sentiment: 85,
      engagement: { likes: 78, shares: 23, comments: 15 },
      keywords: ["Ajman Police", "community safety", "workshop", "child safety"]
    },
    {
      platform: "Facebook",
      content: "حادث مروري على طريق الشيخ محمد بن زايد قرب مخرج عجمان. شرطة عجمان متواجدة في الموقع ويرجى من السائقين توخي الحذر وأخذ طرق بديلة. #شرطة_عجمان #حوادث_الطرق #عجمان",
      authorName: "أحمد الهاشمي",
      authorUsername: "ahmed.hashemi.7",
      authorAvatarUrl: "https://randomuser.me/api/portraits/men/67.jpg",
      postUrl: "https://facebook.com/ahmed.hashemi.7/posts/987654",
      postedAt: new Date(2025, 3, 24, 8, 15, 0),
      sentiment: 25,
      engagement: { likes: 12, shares: 56, comments: 31 },
      keywords: ["شرطة عجمان", "حادث مروري", "طريق الشيخ محمد بن زايد", "عجمان"]
    },
    
    // Instagram Posts
    {
      platform: "Instagram",
      content: "زيارة المعرض الأمني لشرطة عجمان اليوم. تقنيات حديثة مذهلة وتجهيزات متطورة تساهم في تعزيز أمن المجتمع. فخورون بكم! 🇦🇪👮‍♂️ #شرطة_عجمان #الأمن_والأمان #عجمان",
      authorName: "مريم الشحي",
      authorUsername: "maryam_alshehhi",
      authorAvatarUrl: "https://randomuser.me/api/portraits/women/42.jpg",
      postUrl: "https://instagram.com/p/CsR7d5G",
      postedAt: new Date(2025, 3, 19, 16, 20, 0),
      sentiment: 95,
      engagement: { likes: 324, shares: 47, comments: 28 },
      keywords: ["شرطة عجمان", "معرض أمني", "تقنيات", "أمن المجتمع"]
    },
    {
      platform: "Instagram",
      content: "The new Ajman Police mobile app is so convenient! Renewed my driving license in just 5 minutes without visiting any center. Great job @ajmanpolice_official 👏 #DigitalTransformation #AjmanPolice #SmartServices",
      authorName: "John Roberts",
      authorUsername: "john_r_uae",
      authorAvatarUrl: "https://randomuser.me/api/portraits/men/92.jpg",
      postUrl: "https://instagram.com/p/Cs76dFg",
      postedAt: new Date(2025, 3, 21, 11, 45, 0),
      sentiment: 90,
      engagement: { likes: 212, shares: 18, comments: 24 },
      keywords: ["Ajman Police", "mobile app", "digital services", "license renewal"]
    },
    
    // TikTok Posts
    {
      platform: "TikTok",
      content: "شاهدوا كيف تتعامل دوريات شرطة عجمان مع المخالفين لقواعد المرور 🚔 #شرطة_عجمان #المرور #سلامة_الطريق #الإمارات",
      authorName: "فهد المحيربي",
      authorUsername: "fahad_m_official",
      authorAvatarUrl: "https://randomuser.me/api/portraits/men/24.jpg",
      postUrl: "https://tiktok.com/@fahad_m_official/video/7189654",
      postedAt: new Date(2025, 3, 17, 19, 30, 0),
      sentiment: 60,
      engagement: { likes: 15870, shares: 2340, comments: 567 },
      keywords: ["شرطة عجمان", "مخالفين", "مرور", "دوريات"]
    },
    
    // News Posts
    {
      platform: "News",
      content: "Ajman Police launch new initiative to reduce traffic accidents by 50% by end of 2025. The comprehensive plan includes increased patrols, smart traffic management systems, and awareness campaigns targeting young drivers. Chief of Ajman Police emphasized that road safety remains a top priority for the emirate.",
      authorName: "Gulf News",
      authorUsername: "gulf_news",
      authorAvatarUrl: "https://example.com/gulf_news_logo.png",
      postUrl: "https://gulfnews.com/uae/ajman-police-road-safety-initiative-1.987654",
      postedAt: new Date(2025, 3, 23, 10, 0, 0),
      sentiment: 75,
      engagement: { likes: 456, shares: 189, comments: 67 },
      keywords: ["Ajman Police", "traffic accidents", "road safety", "initiative"]
    },
    {
      platform: "News",
      content: "شرطة عجمان تكرم موظفيها المتميزين في الحفل السنوي. وأشاد قائد شرطة عجمان بالجهود المبذولة لتعزيز الأمن والأمان في الإمارة، مؤكداً أن التميز المؤسسي يبدأ من الاهتمام بالكادر البشري.",
      authorName: "الخليج اليوم",
      authorUsername: "alkhaleej_today",
      authorAvatarUrl: "https://example.com/alkhaleej_logo.png",
      postUrl: "https://alkhaleej.ae/ajman-police-award-ceremony-2025",
      postedAt: new Date(2025, 3, 20, 14, 15, 0),
      sentiment: 95,
      engagement: { likes: 234, shares: 87, comments: 21 },
      keywords: ["شرطة عجمان", "تكريم", "موظفين متميزين", "الأمن والأمان"]
    }
  ];

  // Add all posts to the database
  for (const post of ajmanPolicePosts) {
    await db.insert(socialPosts).values(post);
  }

  console.log(`Added ${ajmanPolicePosts.length} realistic Ajman Police social media posts.`);
}

// Execute the function
seedAjmanSocialPosts()
  .then(() => {
    console.log("Ajman Police posts seeding completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding Ajman Police posts:", error);
    process.exit(1);
  });