import { db } from "./db";
import { eq } from "drizzle-orm";
import { 
  users, 
  keywords, 
  tutorials, 
  sentimentReports, 
  faqItems, 
  knowledgeBaseArticles,
  achievementBadges,
  userGamificationStats,
  userAchievements
} from "@shared/schema";

export async function seedDatabase() {
  console.log("Seeding database with initial data...");
  
  // Check if there are any existing users
  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    // Add initial admin user
    await db.insert(users).values({
      username: "admin",
      password: "admin123", // In a real system, this would be hashed
      fullName: "أحمد المنصوري",
      email: "admin@example.com",
      role: "admin",
      avatarUrl: "https://randomuser.me/api/portraits/men/43.jpg",
      language: "ar"
    });
    console.log("Created initial admin user");
  }

  // Check if there are any existing keywords
  const existingKeywords = await db.select().from(keywords);
  if (existingKeywords.length === 0) {
    // Add some initial keywords
    const initialKeywords = [
      { word: "الابتكار", category: "general", isActive: true, alertThreshold: 100, changePercentage: 24 },
      { word: "التنمية المستدامة", category: "environment", isActive: true, alertThreshold: 50, changePercentage: 12 },
      { word: "المنصة الرقمية", category: "technology", isActive: true, alertThreshold: 80, changePercentage: 3 },
      { word: "الذكاء الاصطناعي", category: "technology", isActive: true, alertThreshold: 70, changePercentage: 31 },
      { word: "تجربة المستخدم", category: "design", isActive: true, alertThreshold: 40, changePercentage: -7 }
    ];
    
    await db.insert(keywords).values(initialKeywords);
    console.log("Created initial keywords");
  }

  // Check if there are any existing tutorials
  const existingTutorials = await db.select().from(tutorials);
  if (existingTutorials.length === 0) {
    // Add some initial tutorials
    const initialTutorials = [
      // Arabic tutorials
      {
        title: "كيفية إنشاء تقرير تحليلي",
        description: "تعلم كيفية إنشاء تقارير تحليلية مفصلة باستخدام المنصة",
        videoUrl: "https://example.com/tutorial1.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
        duration: "5:24",
        level: "beginner",
        language: "ar"
      },
      {
        title: "تحليل المشاعر والاتجاهات",
        description: "دليل متكامل لفهم وتحليل مشاعر الجمهور واتجاهات المحتوى",
        videoUrl: "https://example.com/tutorial2.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
        duration: "8:12",
        level: "intermediate"
      },
      {
        title: "إدارة الأزمات الإعلامية",
        description: "استراتيجيات متقدمة للتعامل مع الأزمات الإعلامية وإدارتها بفعالية",
        videoUrl: "https://example.com/tutorial3.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
        duration: "12:45",
        level: "advanced"
      },
      {
        title: "مراقبة الكلمات الرئيسية",
        description: "تعلم كيفية إعداد وتتبع الكلمات الرئيسية لمراقبة المواضيع المهمة لمؤسستك",
        videoUrl: "https://example.com/keywords-tutorial.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1586892478025-2b89464d95f9",
        duration: "6:15",
        level: "beginner"
      },
      {
        title: "مركز الوسائط المتقدم",
        description: "استخدام مركز الوسائط لتنظيم وتصنيف المحتوى الإعلامي الخاص بمؤسستك",
        videoUrl: "https://example.com/media-center-tutorial.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1505236858219-8359eb29e329",
        duration: "9:30",
        level: "intermediate"
      },
      {
        title: "إعداد لوحات المعلومات المخصصة",
        description: "كيفية إنشاء وتخصيص لوحات معلومات تفاعلية لعرض البيانات المهمة لمؤسستك",
        videoUrl: "https://example.com/dashboard-tutorial.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
        duration: "7:50",
        level: "intermediate"
      },
      {
        title: "الإشعارات وتنبيهات المراقبة",
        description: "تكوين نظام الإشعارات للتنبيه الفوري حول المواضيع المهمة في وسائل الإعلام والمنصات الاجتماعية",
        videoUrl: "https://example.com/alerts-tutorial.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1573495627361-d9b87960b12d",
        duration: "4:45",
        level: "beginner"
      },
      {
        title: "تقارير التأثير الإعلامي للمؤسسات الحكومية",
        description: "كيفية إنشاء تقارير متخصصة لقياس تأثير المحتوى الإعلامي للجهات الحكومية",
        videoUrl: "https://example.com/gov-reports-tutorial.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1553877522-43269d4ea984",
        duration: "14:20",
        level: "advanced"
      },
      {
        title: "تحليل المشاعر متعدد اللغات",
        description: "كيفية استخدام نظام تحليل المشاعر للمحتوى باللغتين العربية والإنجليزية",
        videoUrl: "https://example.com/multilingual-sentiment-tutorial.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1493612276216-ee3925520721",
        duration: "10:15",
        level: "advanced"
      },
      {
        title: "تصدير البيانات والتكامل مع الأنظمة الأخرى",
        description: "استخدام واجهات API لتصدير البيانات والتكامل مع أنظمة تحليلية أخرى",
        videoUrl: "https://example.com/api-integration-tutorial.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1532622785990-d2c36a76f5a6",
        duration: "11:30",
        level: "advanced"
      },
      
      // English tutorials
      {
        title: "Creating Analytical Reports",
        description: "Learn how to create detailed analytical reports using the platform",
        videoUrl: "https://example.com/tutorial1-en.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1553877522-43269d4ea984",
        duration: "5:40",
        level: "beginner",
        language: "en"
      },
      {
        title: "Sentiment Analysis and Trends",
        description: "A comprehensive guide to understanding audience sentiment and content trends",
        videoUrl: "https://example.com/tutorial2-en.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
        duration: "8:15",
        level: "intermediate"
      },
      {
        title: "Media Crisis Management",
        description: "Advanced strategies for handling media crises and managing them effectively",
        videoUrl: "https://example.com/tutorial3-en.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1573495627361-d9b87960b12d",
        duration: "12:25",
        level: "advanced"
      },
      {
        title: "Keyword Monitoring",
        description: "Learn how to set up and track keywords to monitor topics important to your organization",
        videoUrl: "https://example.com/keywords-tutorial-en.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1586892478025-2b89464d95f9",
        duration: "6:10",
        level: "beginner"
      },
      {
        title: "Advanced Media Center",
        description: "Using the Media Center to organize and categorize your organization's media content",
        videoUrl: "https://example.com/media-center-tutorial-en.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1505236858219-8359eb29e329",
        duration: "9:45",
        level: "intermediate"
      }
    ];
    
    await db.insert(tutorials).values(initialTutorials);
    console.log("Created initial tutorials");
  }
  else if (existingTutorials.length <= 5) {
    // Add additional tutorials if there are only the initial 3
    const additionalTutorials = [
      {
        title: "مراقبة الكلمات الرئيسية",
        description: "تعلم كيفية إعداد وتتبع الكلمات الرئيسية لمراقبة المواضيع المهمة لمؤسستك",
        videoUrl: "https://example.com/keywords-tutorial.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1586892478025-2b89464d95f9",
        duration: "6:15",
        level: "beginner"
      },
      {
        title: "مركز الوسائط المتقدم",
        description: "استخدام مركز الوسائط لتنظيم وتصنيف المحتوى الإعلامي الخاص بمؤسستك",
        videoUrl: "https://example.com/media-center-tutorial.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1505236858219-8359eb29e329",
        duration: "9:30",
        level: "intermediate"
      },
      {
        title: "إعداد لوحات المعلومات المخصصة",
        description: "كيفية إنشاء وتخصيص لوحات معلومات تفاعلية لعرض البيانات المهمة لمؤسستك",
        videoUrl: "https://example.com/dashboard-tutorial.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
        duration: "7:50",
        level: "intermediate"
      },
      {
        title: "الإشعارات وتنبيهات المراقبة",
        description: "تكوين نظام الإشعارات للتنبيه الفوري حول المواضيع المهمة في وسائل الإعلام والمنصات الاجتماعية",
        videoUrl: "https://example.com/alerts-tutorial.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1573495627361-d9b87960b12d",
        duration: "4:45",
        level: "beginner"
      },
      {
        title: "تقارير التأثير الإعلامي للمؤسسات الحكومية",
        description: "كيفية إنشاء تقارير متخصصة لقياس تأثير المحتوى الإعلامي للجهات الحكومية",
        videoUrl: "https://example.com/gov-reports-tutorial.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1553877522-43269d4ea984",
        duration: "14:20",
        level: "advanced"
      },
      {
        title: "تحليل المشاعر متعدد اللغات",
        description: "كيفية استخدام نظام تحليل المشاعر للمحتوى باللغتين العربية والإنجليزية",
        videoUrl: "https://example.com/multilingual-sentiment-tutorial.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1493612276216-ee3925520721",
        duration: "10:15",
        level: "advanced"
      },
      {
        title: "تصدير البيانات والتكامل مع الأنظمة الأخرى",
        description: "استخدام واجهات API لتصدير البيانات والتكامل مع أنظمة تحليلية أخرى",
        videoUrl: "https://example.com/api-integration-tutorial.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1532622785990-d2c36a76f5a6",
        duration: "11:30",
        level: "advanced"
      },
      {
        title: "Creating Analytical Reports",
        description: "Learn how to create detailed analytical reports using the platform",
        videoUrl: "https://example.com/tutorial1-en.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1553877522-43269d4ea984",
        duration: "5:40",
        level: "beginner"
      },
      {
        title: "Sentiment Analysis and Trends",
        description: "A comprehensive guide to understanding audience sentiment and content trends",
        videoUrl: "https://example.com/tutorial2-en.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
        duration: "8:15",
        level: "intermediate"
      },
      {
        title: "Media Crisis Management",
        description: "Advanced strategies for handling media crises and managing them effectively",
        videoUrl: "https://example.com/tutorial3-en.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1573495627361-d9b87960b12d",
        duration: "12:25",
        level: "advanced"
      },
      {
        title: "Keyword Monitoring",
        description: "Learn how to set up and track keywords to monitor topics important to your organization",
        videoUrl: "https://example.com/keywords-tutorial-en.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1586892478025-2b89464d95f9",
        duration: "6:10",
        level: "beginner"
      },
      {
        title: "Advanced Media Center",
        description: "Using the Media Center to organize and categorize your organization's media content",
        videoUrl: "https://example.com/media-center-tutorial-en.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1505236858219-8359eb29e329",
        duration: "9:45",
        level: "intermediate"
      }
    ];
    
    await db.insert(tutorials).values(additionalTutorials);
    console.log("Added additional tutorials");
  }

  // Check if there are any existing sentiment reports
  const existingSentimentReports = await db.select().from(sentimentReports);
  if (existingSentimentReports.length === 0) {
    // Add initial sentiment report
    await db.insert(sentimentReports).values({
      date: new Date(),
      positive: 42,
      neutral: 35,
      negative: 23,
      keywords: {
        positive: ["الابتكار", "التقدم", "التنمية"],
        neutral: ["المستقبل", "الاستدامة"],
        negative: ["التكنولوجيا", "المجتمع"]
      },
      platform: "all"
    });
    console.log("Created initial sentiment report");
  }

  // Check if there are any existing FAQ items
  const existingFaqItems = await db.select().from(faqItems);
  if (existingFaqItems.length === 0) {
    // Add initial FAQ items
    const initialFaqItems = [
      // General FAQ Items - Arabic
      {
        question: "ما هي منصة المراقبة الإعلامية؟",
        answer: "منصة المراقبة الإعلامية هي نظام متكامل لرصد وتحليل المحتوى الإعلامي والاجتماعي. توفر المنصة تحليلات متقدمة وتقارير ذكية لمساعدة المؤسسات في فهم اتجاهات الرأي العام ومراقبة سمعتها عبر مختلف المنصات.",
        category: "عام",
        isActive: true,
        sortOrder: 1
      },
      {
        question: "ما هي متطلبات النظام لاستخدام المنصة؟",
        answer: "يمكن استخدام المنصة عبر أي متصفح حديث مثل Chrome أو Firefox أو Safari أو Edge. لا توجد متطلبات خاصة للأجهزة، لكن يُفضل استخدام شاشة بدقة لا تقل عن 1366×768 للحصول على تجربة أفضل.",
        category: "عام",
        isActive: true,
        sortOrder: 2
      },
      {
        question: "هل يمكنني استخدام المنصة على الهاتف المحمول؟",
        answer: "نعم، المنصة متوافقة تماماً مع الأجهزة المحمولة وتدعم تصميم متجاوب يعمل على مختلف أحجام الشاشات. يمكنك الوصول إلى جميع الميزات عبر هاتفك الذكي أو الجهاز اللوحي.",
        category: "عام",
        isActive: true,
        sortOrder: 3
      },
      {
        question: "هل يمكنني تغيير لغة واجهة المستخدم؟",
        answer: "نعم، يمكنك تغيير اللغة بسهولة من خلال النقر على زر تبديل اللغة في القائمة العلوية. المنصة تدعم اللغتين العربية والإنجليزية بشكل كامل.",
        category: "عام",
        isActive: true,
        sortOrder: 4
      },

      // Report FAQ Items - Arabic
      {
        question: "كيف يمكنني إنشاء تقرير جديد؟",
        answer: "لإنشاء تقرير جديد، انتقل إلى قسم 'التقارير' في لوحة التحكم، ثم انقر على زر 'إنشاء تقرير جديد'. اختر نوع التقرير والفترة الزمنية المطلوبة والمنصات التي ترغب بتضمينها، ثم انقر على 'إنشاء'.",
        category: "التقارير",
        isActive: true,
        sortOrder: 1
      },
      {
        question: "هل يمكنني تصدير التقارير إلى صيغ مختلفة؟",
        answer: "نعم، يمكنك تصدير التقارير إلى صيغ متعددة مثل PDF أو Excel أو PowerPoint. لتصدير تقرير، افتح التقرير المطلوب وانقر على زر 'تصدير' في الزاوية العليا، ثم اختر الصيغة المناسبة.",
        category: "التقارير",
        isActive: true,
        sortOrder: 2
      },
      {
        question: "هل يمكنني جدولة تقارير دورية؟",
        answer: "نعم، يمكنك جدولة تقارير دورية ليتم إنشاؤها وإرسالها تلقائياً. انتقل إلى قسم 'التقارير المجدولة' ثم 'إضافة جدولة جديدة'، وحدد نوع التقرير والفترة والتكرار (يومي، أسبوعي، شهري) وعناوين البريد الإلكتروني للمستلمين.",
        category: "التقارير",
        isActive: true,
        sortOrder: 3
      },
      {
        question: "كيف يمكنني تخصيص محتوى التقارير؟",
        answer: "يمكنك تخصيص التقارير من خلال اختيار 'تقرير مخصص' عند إنشاء تقرير جديد. ستتمكن من اختيار المؤشرات والرسوم البيانية والأقسام التي تريد تضمينها في التقرير، بالإضافة إلى إمكانية إضافة شعار مؤسستك وتخصيص ألوان التقرير.",
        category: "التقارير",
        isActive: true,
        sortOrder: 4
      },

      // Media Center FAQ Items - Arabic
      {
        question: "ما هي الخدمات المتوفرة في مركز الوسائط؟",
        answer: "يوفر مركز الوسائط خدمات متعددة منها: أرشفة المحتوى الإعلامي، البحث المتقدم عن المحتوى حسب التاريخ أو المصدر أو الكلمات المفتاحية، تنظيم الوسائط في مجلدات، وإمكانية تحليل محتوى الوسائط باستخدام الذكاء الاصطناعي.",
        category: "مركز الوسائط",
        isActive: true,
        sortOrder: 1
      },
      {
        question: "ما هي أنواع الوسائط المدعومة؟",
        answer: "يدعم مركز الوسائط مجموعة واسعة من أنواع الملفات بما في ذلك الصور (JPEG، PNG، GIF)، والفيديو (MP4، AVI، MOV)، والصوت (MP3، WAV)، والمستندات (PDF، DOCX، PPTX، XLSX).",
        category: "مركز الوسائط",
        isActive: true,
        sortOrder: 2
      },
      {
        question: "كيف يمكنني رفع ملفات وسائط متعددة دفعة واحدة؟",
        answer: "يمكنك رفع ملفات متعددة دفعة واحدة عن طريق النقر على زر 'رفع ملفات' في مركز الوسائط، ثم سحب وإفلات الملفات المطلوبة، أو اختيارها من جهازك. يمكنك أيضاً تحديد مجلد الوجهة ووضع العلامات والتصنيفات المناسبة للملفات أثناء عملية الرفع.",
        category: "مركز الوسائط",
        isActive: true,
        sortOrder: 3
      },

      // Social Media Monitoring FAQ Items - Arabic
      {
        question: "ما هي المنصات الاجتماعية المدعومة للمراقبة؟",
        answer: "تدعم المنصة مراقبة المحتوى من Twitter وFacebook وInstagram وLinkedIn وYouTube، بالإضافة إلى المدونات ومواقع الأخبار الرئيسية.",
        category: "المراقبة الاجتماعية",
        isActive: true,
        sortOrder: 1
      },
      {
        question: "كيف يمكنني إعداد تنبيهات للكلمات المفتاحية؟",
        answer: "يمكنك إعداد تنبيهات للكلمات المفتاحية من خلال الانتقال إلى قسم 'إدارة الكلمات المفتاحية' ثم 'إضافة كلمة مفتاحية جديدة'. أدخل الكلمة المفتاحية واختر التصنيف المناسب، ثم حدد عتبة التنبيه ونوع الإشعارات التي ترغب في تلقيها.",
        category: "المراقبة الاجتماعية",
        isActive: true,
        sortOrder: 2
      },

      // Sentiment Analysis FAQ Items - Arabic
      {
        question: "كيف يتم تحليل المشاعر في المنصة؟",
        answer: "تستخدم المنصة تقنيات الذكاء الاصطناعي ومعالجة اللغة الطبيعية لتحليل نص المنشورات والتعليقات وتصنيفها إلى إيجابية أو سلبية أو محايدة. يتم تحليل السياق واللهجة واستخدام الكلمات لتحديد المشاعر العامة تجاه موضوع معين.",
        category: "تحليل المشاعر",
        isActive: true,
        sortOrder: 1
      },
      {
        question: "ما مدى دقة تحليل المشاعر للمحتوى باللغة العربية؟",
        answer: "تم تدريب نظام تحليل المشاعر بشكل خاص على اللغة العربية وتم تحسينه ليتعامل مع اللهجات المختلفة والتعبيرات الثقافية. تبلغ دقة النظام حوالي 85-90% للمحتوى العربي، وهي نسبة مماثلة لدقة تحليل المحتوى باللغة الإنجليزية.",
        category: "تحليل المشاعر",
        isActive: true,
        sortOrder: 2
      },

      // Settings FAQ Items - Arabic
      {
        question: "كيف يمكنني إدارة مفاتيح API؟",
        answer: "يمكنك إدارة مفاتيح API من خلال الانتقال إلى صفحة 'الإعدادات' ثم اختيار تبويب 'مفاتيح API'. هناك يمكنك إنشاء مفاتيح جديدة، وتعطيل المفاتيح الموجودة، وتعيين صلاحيات وفترات انتهاء للمفاتيح.",
        category: "الإعدادات",
        isActive: true,
        sortOrder: 1
      },
      {
        question: "كيف يمكنني تكوين الإشعارات؟",
        answer: "يمكنك تكوين الإشعارات من خلال الانتقال إلى 'الإعدادات' ثم 'تفضيلات الإشعارات'. يمكنك اختيار نوع الإشعارات التي ترغب في تلقيها (بريد إلكتروني، تنبيهات في التطبيق، إشعارات متصفح) وتحديد أهمية وتكرار الإشعارات لكل نوع من أنواع الأحداث.",
        category: "الإعدادات",
        isActive: true,
        sortOrder: 2
      },

      // --------------- English FAQs ---------------

      // General FAQ Items - English
      {
        question: "What is the Media Monitoring Platform?",
        answer: "The Media Monitoring Platform is an integrated system for monitoring and analyzing media and social content. The platform provides advanced analytics and intelligent reports to help organizations understand public opinion trends and monitor their reputation across various platforms.",
        category: "General",
        isActive: true,
        sortOrder: 1
      },
      {
        question: "What are the system requirements for using the platform?",
        answer: "The platform can be accessed through any modern browser such as Chrome, Firefox, Safari, or Edge. There are no specific hardware requirements, but a screen resolution of at least 1366×768 is recommended for the best experience.",
        category: "General",
        isActive: true,
        sortOrder: 2
      },
      {
        question: "Can I use the platform on mobile devices?",
        answer: "Yes, the platform is fully compatible with mobile devices and supports responsive design that works on different screen sizes. You can access all features through your smartphone or tablet.",
        category: "General",
        isActive: true,
        sortOrder: 3
      },
      {
        question: "How can I change the user interface language?",
        answer: "You can easily change the language by clicking on the language toggle button in the top menu. The platform fully supports both Arabic and English languages.",
        category: "General",
        isActive: true,
        sortOrder: 4
      },

      // Report FAQ Items - English
      {
        question: "How do I create a new report?",
        answer: "To create a new report, navigate to the 'Reports' section in your dashboard, then click on the 'Create New Report' button. Select the report type, time period, and platforms you want to include, then click 'Create'.",
        category: "Reports",
        isActive: true,
        sortOrder: 1
      },
      {
        question: "Can I export reports to different formats?",
        answer: "Yes, you can export reports to multiple formats such as PDF, Excel, or PowerPoint. To export a report, open the desired report and click the 'Export' button in the top corner, then choose the appropriate format.",
        category: "Reports",
        isActive: true,
        sortOrder: 2
      },
      {
        question: "Can I schedule periodic reports?",
        answer: "Yes, you can schedule periodic reports to be automatically generated and sent. Go to the 'Scheduled Reports' section and click 'Add New Schedule', then specify the report type, period, frequency (daily, weekly, monthly), and recipient email addresses.",
        category: "Reports",
        isActive: true,
        sortOrder: 3
      },
      {
        question: "How can I customize report content?",
        answer: "You can customize reports by selecting 'Custom Report' when creating a new report. You'll be able to choose which metrics, charts, and sections to include in the report, as well as add your organization's logo and customize report colors.",
        category: "Reports",
        isActive: true,
        sortOrder: 4
      },

      // Media Center FAQ Items - English
      {
        question: "What services are available in the Media Center?",
        answer: "The Media Center provides multiple services including: archiving media content, advanced search for content by date, source, or keywords, organizing media in folders, and the ability to analyze media content using artificial intelligence.",
        category: "Media Center",
        isActive: true,
        sortOrder: 1
      },
      {
        question: "What types of media are supported?",
        answer: "The Media Center supports a wide range of file types including images (JPEG, PNG, GIF), video (MP4, AVI, MOV), audio (MP3, WAV), and documents (PDF, DOCX, PPTX, XLSX).",
        category: "Media Center",
        isActive: true,
        sortOrder: 2
      },
      {
        question: "How can I upload multiple media files at once?",
        answer: "You can upload multiple files at once by clicking the 'Upload Files' button in the Media Center, then dragging and dropping the desired files, or selecting them from your device. You can also specify the destination folder and apply appropriate tags and categories to the files during the upload process.",
        category: "Media Center",
        isActive: true,
        sortOrder: 3
      },

      // Social Media Monitoring FAQ Items - English
      {
        question: "Which social platforms are supported for monitoring?",
        answer: "The platform supports monitoring content from Twitter, Facebook, Instagram, LinkedIn, and YouTube, as well as blogs and major news sites.",
        category: "Social Monitoring",
        isActive: true,
        sortOrder: 1
      },
      {
        question: "How can I set up keyword alerts?",
        answer: "You can set up keyword alerts by going to the 'Keyword Management' section and clicking 'Add New Keyword'. Enter the keyword and choose the appropriate category, then set the alert threshold and the types of notifications you want to receive.",
        category: "Social Monitoring",
        isActive: true,
        sortOrder: 2
      },

      // Sentiment Analysis FAQ Items - English
      {
        question: "How is sentiment analysis performed on the platform?",
        answer: "The platform uses artificial intelligence and natural language processing techniques to analyze the text of posts and comments and classify them as positive, negative, or neutral. Context, tone, and word usage are analyzed to determine the general sentiment toward a particular topic.",
        category: "Sentiment Analysis",
        isActive: true,
        sortOrder: 1
      },
      {
        question: "How accurate is sentiment analysis for Arabic content?",
        answer: "The sentiment analysis system has been specifically trained on Arabic language and optimized to handle different dialects and cultural expressions. The system achieves about 85-90% accuracy for Arabic content, which is comparable to its accuracy for English content.",
        category: "Sentiment Analysis",
        isActive: true,
        sortOrder: 2
      },

      // Settings FAQ Items - English
      {
        question: "How can I manage API keys?",
        answer: "You can manage API keys by going to the 'Settings' page and selecting the 'API Keys' tab. There you can create new keys, disable existing keys, and set permissions and expiration periods for keys.",
        category: "Settings",
        isActive: true,
        sortOrder: 1
      },
      {
        question: "How can I configure notifications?",
        answer: "You can configure notifications by going to 'Settings' and then 'Notification Preferences'. You can choose which types of notifications you want to receive (email, in-app alerts, browser notifications) and specify the importance and frequency of notifications for each type of event.",
        category: "Settings",
        isActive: true,
        sortOrder: 2
      },
      
      // Entity Monitoring FAQ Items - English
      {
        question: "How do I add a new entity to the monitoring system?",
        answer: "To add a new entity, navigate to the Entity Monitoring page via the main sidebar. Click the 'Add Entity' button in the top-right corner. Fill in the required fields including the entity name in both English and Arabic, select the entity type from the dropdown, specify the region, set a priority level, and provide the official website URL. You can also upload an icon for the entity. After creating the entity, you can configure specific keywords for monitoring and set alert thresholds for notifications.",
        category: "Entity Monitoring",
        isActive: true,
        sortOrder: 1
      },
      {
        question: "Can I import multiple entities at once?",
        answer: "Yes, administrators can import multiple entities at once using the CSV import feature. Go to the admin settings section and select 'Entity Management'. Click on 'Import Entities' and upload a CSV file with the required fields. The system will validate the data and add all valid entities to the monitoring system.",
        category: "Entity Monitoring",
        isActive: true,
        sortOrder: 2
      },
      {
        question: "How do I set up keywords for entity monitoring?",
        answer: "After creating an entity or selecting an existing one, click on the entity card to open its details. In the entity details view, navigate to the 'Keywords' section. Here you can add specific keywords related to the entity that the system will use to track mentions across all monitored platforms. Add variations of the entity name, common abbreviations, and related terms to ensure comprehensive coverage.",
        category: "Entity Monitoring",
        isActive: true,
        sortOrder: 3
      },
      {
        question: "What is the purpose of the Debug Mode button in entity monitoring?",
        answer: "The Debug Mode button provides advanced diagnostic features for administrators and developers. When enabled, it displays detailed information about data processing, WebSocket connections, database queries, performance metrics, entity resolution processes, sentiment analysis details, comprehensive error reporting, and cache status. This feature helps in troubleshooting issues, understanding data processing, and optimizing system performance. The Debug Mode button is only visible to users with administrator or developer roles.",
        category: "Entity Monitoring",
        isActive: true,
        sortOrder: 4
      }
    ];
    
    await db.insert(faqItems).values(initialFaqItems);
    console.log("Created initial FAQ items");
  }
  
  // Check if there are any existing Knowledge Base articles
  const existingKnowledgeBase = await db.select().from(knowledgeBaseArticles);
  if (existingKnowledgeBase.length === 0) {
    // Add initial Knowledge Base articles
    const initialKnowledgeBase = [
      // Arabic Knowledge Base Articles
      {
        title: "دليل البدء السريع لمنصة المراقبة الإعلامية",
        content: `<h2>مرحباً بك في منصة المراقبة الإعلامية</h2>
        <p>هذا الدليل سيساعدك في البدء باستخدام المنصة بسرعة وفعالية.</p>
        <h3>الخطوات الأساسية:</h3>
        <ol>
          <li>قم بتسجيل الدخول باستخدام بيانات حسابك</li>
          <li>استكشف لوحة التحكم الرئيسية للحصول على نظرة عامة</li>
          <li>قم بإعداد الكلمات المفتاحية للمراقبة</li>
          <li>جرب إنشاء تقرير بسيط</li>
        </ol>
        <h3>استكشاف الأقسام الرئيسية</h3>
        <p>تتكون المنصة من عدة أقسام رئيسية:</p>
        <ul>
          <li><strong>لوحة المعلومات:</strong> نظرة عامة على البيانات والإحصائيات الرئيسية</li>
          <li><strong>المراقبة الاجتماعية:</strong> متابعة المنشورات والتعليقات عبر منصات التواصل الاجتماعي</li>
          <li><strong>مركز الوسائط:</strong> إدارة وتنظيم الملفات الإعلامية</li>
          <li><strong>التقارير:</strong> إنشاء وتخصيص تقارير تحليلية</li>
          <li><strong>الإعدادات:</strong> تكوين حسابك ومفاتيح API والإشعارات</li>
        </ul>
        <p>للمزيد من المعلومات، يرجى الاطلاع على الأدلة المفصلة أو التواصل مع فريق الدعم.</p>`,
        summary: "دليل شامل للبدء باستخدام منصة المراقبة الإعلامية والاستفادة من مميزاتها الأساسية",
        category: "دليل المستخدم",
        tags: ["بدء الاستخدام", "دليل", "أساسيات"],
        authorId: 1,
        isPublished: true
      },
      {
        title: "تحليل المشاعر وفهم اتجاهات الجمهور",
        content: `<h2>فهم تحليل المشاعر في المنصة</h2>
        <p>تعتبر خاصية تحليل المشاعر من أهم المميزات التي توفرها المنصة لفهم آراء الجمهور.</p>
        <h3>كيف يعمل تحليل المشاعر؟</h3>
        <p>تستخدم المنصة خوارزميات ذكاء اصطناعي متقدمة لتحليل النصوص والتعليقات وتصنيفها إلى:</p>
        <ul>
          <li><strong>إيجابية</strong> (أخضر): التعليقات والمنشورات التي تحمل مشاعر إيجابية وتأييد</li>
          <li><strong>محايدة</strong> (أصفر): التعليقات والمنشورات التي لا تحمل مشاعر واضحة أو تحتوي على آراء متوازنة</li>
          <li><strong>سلبية</strong> (أحمر): التعليقات والمنشورات التي تحمل انتقادات أو مشاعر سلبية</li>
        </ul>
        <h3>الاستفادة من نتائج التحليل</h3>
        <p>يمكنك استخدام هذه البيانات لتحسين استراتيجيتك الإعلامية والتواصل مع الجمهور بشكل أفضل من خلال:</p>
        <ol>
          <li>مراقبة تغيرات المشاعر العامة بمرور الوقت</li>
          <li>تحديد المواضيع والقضايا التي تثير ردود فعل إيجابية أو سلبية</li>
          <li>قياس فعالية الحملات والمبادرات المختلفة</li>
          <li>الاستجابة السريعة للأزمات أو التغيرات المفاجئة في المشاعر</li>
        </ol>
        <h3>تقارير المشاعر المتقدمة</h3>
        <p>توفر المنصة تقارير متقدمة لتحليل المشاعر تشمل:</p>
        <ul>
          <li>رسوم بيانية للاتجاهات عبر الزمن</li>
          <li>مقارنة بين المنصات المختلفة</li>
          <li>تحليل مفصل للكلمات والعبارات المرتبطة بكل نوع من المشاعر</li>
          <li>إمكانية تصدير البيانات بصيغ متعددة</li>
        </ul>`,
        summary: "شرح مفصل لكيفية عمل تحليل المشاعر في المنصة وكيفية الاستفادة من النتائج لتحسين استراتيجيتك الإعلامية",
        category: "تحليلات",
        tags: ["تحليل المشاعر", "الذكاء الاصطناعي", "اتجاهات الجمهور"],
        authorId: 1,
        isPublished: true
      },
      {
        title: "إدارة مفاتيح API والويب هوك",
        content: `<h2>إدارة مفاتيح API والويب هوك في المنصة</h2>
        <p>توفر المنصة إمكانية إدارة مفاتيح API والويب هوك لتكامل أفضل مع الأنظمة والخدمات الخارجية.</p>
        
        <h3>مفاتيح API</h3>
        <p>مفاتيح API تمكنك من الوصول إلى بيانات ووظائف المنصة برمجياً من خلال تطبيقات خارجية.</p>
        <h4>إنشاء مفتاح API جديد:</h4>
        <ol>
          <li>انتقل إلى صفحة "الإعدادات"</li>
          <li>اختر تبويب "مفاتيح API"</li>
          <li>انقر على زر "إنشاء مفتاح جديد"</li>
          <li>أدخل وصفاً للمفتاح وحدد الصلاحيات المطلوبة</li>
          <li>اختر تاريخ انتهاء الصلاحية (اختياري)</li>
          <li>احفظ المفتاح في مكان آمن، حيث لن تتمكن من رؤيته مرة أخرى</li>
        </ol>
        
        <h3>الويب هوك (Webhooks)</h3>
        <p>الويب هوك تسمح للمنصة بإرسال إشعارات تلقائية إلى أنظمتك عند حدوث أحداث محددة.</p>
        <h4>إعداد ويب هوك جديد:</h4>
        <ol>
          <li>انتقل إلى صفحة "الإعدادات"</li>
          <li>اختر تبويب "الويب هوك"</li>
          <li>انقر على زر "إضافة ويب هوك جديد"</li>
          <li>أدخل URL الذي سيتم إرسال البيانات إليه</li>
          <li>حدد الأحداث التي ترغب في تلقي إشعارات عنها</li>
          <li>اختر تنسيق البيانات المرسلة</li>
          <li>قم بتمكين أو تعطيل التشفير حسب الحاجة</li>
        </ol>
        
        <h3>أفضل الممارسات للأمان</h3>
        <ul>
          <li>قم بتدوير (تغيير) مفاتيح API بشكل دوري</li>
          <li>استخدم صلاحيات محدودة لكل مفتاح حسب الاحتياج</li>
          <li>تأكد من استخدام HTTPS لجميع نقاط نهاية الويب هوك</li>
          <li>قم بمراقبة استخدام المفاتيح بانتظام للكشف عن أي نشاط مشبوه</li>
          <li>احتفظ بسجل للمفاتيح والويب هوك النشطة ومجالات استخدامها</li>
        </ul>`,
        summary: "دليل شامل لإدارة مفاتيح API والويب هوك في المنصة، يشمل إنشاء المفاتيح وإعداد الويب هوك وأفضل ممارسات الأمان",
        category: "الإعدادات",
        tags: ["API", "ويب هوك", "أمان", "تكامل"],
        authorId: 1,
        isPublished: true
      },
      {
        title: "مراقبة وسائل التواصل الاجتماعي",
        content: `<h2>مراقبة وسائل التواصل الاجتماعي</h2>
        <p>توفر المنصة أدوات متكاملة لمراقبة وتحليل المحتوى عبر مختلف منصات التواصل الاجتماعي.</p>
        
        <h3>المنصات المدعومة</h3>
        <p>تدعم المنصة مراقبة المحتوى من المنصات التالية:</p>
        <ul>
          <li><strong>Twitter/X:</strong> مراقبة التغريدات والردود والهاشتاغات</li>
          <li><strong>Facebook:</strong> متابعة المنشورات والتعليقات على الصفحات العامة</li>
          <li><strong>Instagram:</strong> تحليل المنشورات والتعليقات والستوري</li>
          <li><strong>LinkedIn:</strong> مراقبة المحتوى المهني والمنشورات الخاصة بالشركات</li>
          <li><strong>YouTube:</strong> تتبع التعليقات على مقاطع الفيديو</li>
        </ul>
        
        <h3>إعداد عمليات المراقبة</h3>
        <p>يمكنك إنشاء عمليات مراقبة مخصصة باستخدام الخطوات التالية:</p>
        <ol>
          <li>انتقل إلى قسم "المراقبة الاجتماعية"</li>
          <li>انقر على "إضافة مراقبة جديدة"</li>
          <li>حدد المنصات التي ترغب في مراقبتها</li>
          <li>أضف الكلمات المفتاحية أو الهاشتاغات أو الحسابات</li>
          <li>قم بتعيين معايير التصفية (اللغة، الموقع، إلخ)</li>
          <li>حدد جدول زمني للمراقبة (مستمر، يومي، أسبوعي)</li>
          <li>اختر نوع الإشعارات التي ترغب في تلقيها</li>
        </ol>`,
        summary: "دليل متكامل لمراقبة وتحليل المحتوى عبر منصات التواصل الاجتماعي المختلفة، مع شرح للمنصات المدعومة وكيفية إعداد عمليات المراقبة",
        category: "المراقبة الاجتماعية",
        tags: ["وسائل التواصل الاجتماعي", "مراقبة", "تحليل"],
        authorId: 1,
        isPublished: true
      },
      
      // Entity Monitoring Knowledge Base Article - Arabic
      {
        title: "دليل مراقبة الجهات الحكومية",
        content: `<h2>دليل مراقبة الجهات الحكومية</h2>
        <p>توفر منصتنا أدوات متقدمة لمراقبة وتحليل التواجد الإعلامي للجهات الحكومية عبر مختلف المنصات.</p>
        
        <h3>إضافة جهة حكومية جديدة للمراقبة</h3>
        <p>يمكنك إضافة جهة حكومية جديدة إلى نظام المراقبة باتباع الخطوات التالية:</p>
        <ol>
          <li><strong>الوصول إلى صفحة مراقبة الجهات:</strong> انتقل إلى صفحة مراقبة الجهات عبر شريط التنقل الرئيسي.</li>
          <li><strong>زر "إضافة جهة":</strong> في الزاوية العلوية اليمنى من الصفحة، انقر على زر "إضافة جهة".</li>
          <li><strong>تعبئة نموذج الجهة:</strong> ستظهر نافذة منبثقة تحتوي على نموذج لإدخال بيانات الجهة الجديدة:
            <ul>
              <li>الاسم (بالإنجليزية): الاسم الرسمي للجهة باللغة الإنجليزية</li>
              <li>الاسم (بالعربية): الاسم الرسمي للجهة باللغة العربية</li>
              <li>نوع الجهة: اختر من القائمة المنسدلة (وزارة، هيئة، مجلس، إلخ)</li>
              <li>المنطقة: المنطقة الجغرافية التي تنتمي إليها الجهة</li>
              <li>الأولوية: قيمة رقمية (0-100) تحدد ترتيب العرض</li>
              <li>رابط الموقع الإلكتروني: الموقع الرسمي للجهة</li>
              <li>رابط الشعار: رابط لشعار أو أيقونة الجهة</li>
              <li>حالة النشاط: تبديل لتحديد ما إذا كانت الجهة قيد المراقبة النشطة</li>
            </ul>
          </li>
          <li><strong>إرسال النموذج:</strong> بعد ملء الحقول المطلوبة، انقر على زر "إنشاء" في أسفل النموذج.</li>
        </ol>
        
        <h3>إعداد كلمات المراقبة</h3>
        <p>بعد إنشاء الجهة، يمكنك تكوين الكلمات المفتاحية التي سيتم استخدامها لمراقبة المحتوى المتعلق بهذه الجهة:</p>
        <ol>
          <li>انقر على بطاقة الجهة التي تمت إضافتها حديثًا للوصول إلى صفحة التفاصيل.</li>
          <li>في قسم "الكلمات المفتاحية"، انقر على "إضافة كلمة مفتاحية جديدة".</li>
          <li>أضف الكلمات المفتاحية المتعلقة بالجهة، بما في ذلك:
            <ul>
              <li>الاسم الرسمي للجهة</li>
              <li>الاختصارات الشائعة</li>
              <li>أسماء الإدارات والبرامج الرئيسية</li>
              <li>أسماء القادة والمسؤولين البارزين</li>
            </ul>
          </li>
          <li>حدد وزن الأهمية لكل كلمة مفتاحية لتحديد مدى ارتباطها بالجهة.</li>
        </ol>
        
        <h3>إعداد إشعارات التنبيه</h3>
        <p>يمكنك تكوين عتبات التنبيه للجهة لتلقي إشعارات عند حدوث ظروف معينة:</p>
        <ol>
          <li>في صفحة تفاصيل الجهة، انتقل إلى قسم "إعدادات التنبيه".</li>
          <li>قم بتعيين عتبات لمختلف المؤشرات:
            <ul>
              <li><strong>تغير المشاعر:</strong> نسبة التغيير في المشاعر التي ستطلق تنبيهًا</li>
              <li><strong>زيادة حجم الذكر:</strong> نسبة الزيادة في عدد الإشارات التي ستطلق تنبيهًا</li>
              <li><strong>موضوعات محددة:</strong> كلمات مفتاحية معينة لها أولوية عالية للمراقبة</li>
            </ul>
          </li>
          <li>اختر طرق الإشعار المفضلة (البريد الإلكتروني، إشعارات التطبيق، الرسائل النصية).</li>
        </ol>
        
        <h3>استيراد جهات متعددة دفعة واحدة</h3>
        <p>للمستخدمين الذين لديهم صلاحيات إدارية، يمكن استيراد جهات متعددة مرة واحدة:</p>
        <ol>
          <li>انتقل إلى "إعدادات المشرف" ثم "إدارة الجهات".</li>
          <li>انقر على "استيراد جهات" وقم بتحميل ملف CSV يحتوي على بيانات الجهات.</li>
          <li>راجع البيانات للتأكد من صحتها قبل الاستيراد النهائي.</li>
        </ol>
        
        <h3>تحليل بيانات الجهات</h3>
        <p>بعد إعداد الجهات، يمكنك الاستفادة من أدوات التحليل المتقدمة في المنصة:</p>
        <ul>
          <li><strong>تحليل المشاعر:</strong> قياس وتتبع المشاعر العامة تجاه الجهة</li>
          <li><strong>مقارنة الجهات:</strong> مقارنة أداء مختلف الجهات في وسائل الإعلام</li>
          <li><strong>تحليل الاتجاهات:</strong> تتبع التغييرات في تصور الجمهور بمرور الوقت</li>
          <li><strong>تحليل المنصات:</strong> فهم كيفية تفاعل الجهة مع مختلف المنصات الإعلامية</li>
        </ul>`,
        summary: "دليل شامل لإضافة وإدارة الجهات الحكومية في نظام المراقبة، يشمل إضافة جهات جديدة، وإعداد كلمات المراقبة، وتكوين التنبيهات، واستيراد بيانات متعددة",
        category: "مراقبة الجهات",
        tags: ["الجهات الحكومية", "المراقبة", "تحليل البيانات"],
        authorId: 1,
        isPublished: true
      },
      
      // English Knowledge Base Articles
      {
        title: "Government Entity Monitoring Guide",
        content: `<h2>Government Entity Monitoring Guide</h2>
        <p>Our platform provides advanced tools for monitoring and analyzing government entities' media presence across various platforms.</p>
        
        <h3>Adding a New Entity for Monitoring</h3>
        <p>You can add a new government entity to the monitoring system by following these steps:</p>
        <ol>
          <li><strong>Access the Entity Monitoring Page:</strong> Navigate to the Entity Monitoring page via the main sidebar navigation.</li>
          <li><strong>"Add Entity" Button:</strong> In the top-right corner of the page, click the button labeled "Add Entity".</li>
          <li><strong>Fill in the Entity Form:</strong> A modal dialog will appear with a form to enter the new entity's details:
            <ul>
              <li>Name (English): The official English name of the entity</li>
              <li>Name (Arabic): The official Arabic name of the entity</li>
              <li>Entity Type: A dropdown to select from predefined types (Ministry, Authority, Council, etc.)</li>
              <li>Region: Geographic region the entity belongs to</li>
              <li>Priority: A numeric value (0-100) that determines display order</li>
              <li>Website URL: Official website of the entity</li>
              <li>Icon URL: Link to the entity's logo or icon</li>
              <li>Active Status: Toggle to set whether the entity is actively monitored</li>
            </ul>
          </li>
          <li><strong>Submit the Form:</strong> After filling in the required fields, click the "Create" button at the bottom of the form.</li>
        </ol>
        
        <h3>Configuring Monitoring Keywords</h3>
        <p>After creating the entity, you can configure the keywords that will be used to monitor content related to this entity:</p>
        <ol>
          <li>Click on the newly added entity card to access its details page.</li>
          <li>In the "Keywords" section, click "Add New Keyword".</li>
          <li>Add keywords related to the entity, including:
            <ul>
              <li>Official entity name</li>
              <li>Common abbreviations</li>
              <li>Names of key departments and programs</li>
              <li>Names of prominent leaders and officials</li>
            </ul>
          </li>
          <li>Set importance weight for each keyword to determine its relevance to the entity.</li>
        </ol>
        
        <h3>Setting Up Alert Notifications</h3>
        <p>You can configure alert thresholds for the entity to receive notifications when certain conditions occur:</p>
        <ol>
          <li>In the entity details page, navigate to the "Alert Settings" section.</li>
          <li>Set thresholds for various indicators:
            <ul>
              <li><strong>Sentiment change:</strong> The percentage change in sentiment that will trigger an alert</li>
              <li><strong>Mention volume increase:</strong> The percentage increase in mentions that will trigger an alert</li>
              <li><strong>Specific topics:</strong> Certain high-priority keywords to monitor</li>
            </ul>
          </li>
          <li>Choose preferred notification methods (email, app notifications, SMS).</li>
        </ol>
        
        <h3>Debug Mode Functions</h3>
        <p>The Entity Monitoring page includes a Debug Mode button at the top of the page that provides advanced diagnostic capabilities. This feature is only available to users with administrator or developer roles.</p>
        
        <p>When enabled, Debug Mode provides the following information:</p>
        <ul>
          <li><strong>Detailed Data Logging:</strong> Shows comprehensive information about entity data processing, including API request details, response times, and data transformation steps.</li>
          <li><strong>WebSocket Connection Status:</strong> Displays real-time information about WebSocket connections, showing when new data is received and processed.</li>
          <li><strong>Query Inspection:</strong> Reveals the actual database queries being executed when filtering and retrieving entity data.</li>
          <li><strong>Performance Metrics:</strong> Shows performance statistics for various components, including loading times, rendering performance, and API response times.</li>
          <li><strong>Entity Resolution Debugging:</strong> Reveals how the system identifies and resolves entity mentions across different platforms and content sources.</li>
          <li><strong>Sentiment Analysis Details:</strong> Displays the detailed scoring process for sentiment analysis, showing how the AI determines sentiment ratings for each mention.</li>
          <li><strong>Error Reporting:</strong> Provides more verbose error messages when issues occur, helping troubleshoot problems with the monitoring system.</li>
          <li><strong>Cache Status:</strong> Shows information about data caching, including cache hits, misses, and expiration times.</li>
        </ul>
        
        <p>To use Debug Mode:</p>
        <ol>
          <li>Click the "Enable Debug Mode" button at the top of the Entity Monitoring page.</li>
          <li>A debug panel will appear showing detailed information about system operations.</li>
          <li>Click on specific sections to expand and view more detailed diagnostic information.</li>
          <li>When finished, click "Disable Debug Mode" to return to the standard view.</li>
        </ol>
        
        <p>Note: Debug Mode is resource-intensive and may slightly impact system performance. It should only be used for troubleshooting purposes and disabled when not needed.</p>
        
        <h3>Importing Multiple Entities in Bulk</h3>
        <p>For users with administrative privileges, multiple entities can be imported at once:</p>
        <ol>
          <li>Go to "Admin Settings" then "Entity Management".</li>
          <li>Click "Import Entities" and upload a CSV file containing entity data.</li>
          <li>Review the data for accuracy before final import.</li>
        </ol>
        
        <h3>Analyzing Entity Data</h3>
        <p>After setting up entities, you can leverage the platform's advanced analytics tools:</p>
        <ul>
          <li><strong>Sentiment analysis:</strong> Measure and track public sentiment toward the entity</li>
          <li><strong>Entity comparison:</strong> Compare the performance of different entities in media</li>
          <li><strong>Trend analysis:</strong> Track changes in public perception over time</li>
          <li><strong>Platform analysis:</strong> Understand how the entity engages with different media platforms</li>
        </ul>`,
        summary: "A comprehensive guide for adding and managing government entities in the monitoring system, including adding new entities, setting up monitoring keywords, configuring alerts, and importing bulk data",
        category: "Entity Monitoring",
        tags: ["government entities", "monitoring", "data analysis", "debugging"],
        authorId: 1,
        isPublished: true
      },
      
      {
        title: "Quick Start Guide to the Media Monitoring Platform",
        content: `<h2>Welcome to the Media Monitoring Platform</h2>
        <p>This guide will help you get started with the platform quickly and effectively.</p>
        <h3>Basic Steps:</h3>
        <ol>
          <li>Log in using your account credentials</li>
          <li>Explore the main dashboard for an overview</li>
          <li>Set up keywords for monitoring</li>
          <li>Try creating a simple report</li>
        </ol>
        <h3>Exploring Main Sections</h3>
        <p>The platform consists of several main sections:</p>
        <ul>
          <li><strong>Dashboard:</strong> Overview of key data and statistics</li>
          <li><strong>Social Monitoring:</strong> Track posts and comments across social media platforms</li>
          <li><strong>Media Center:</strong> Manage and organize media files</li>
          <li><strong>Reports:</strong> Create and customize analytical reports</li>
          <li><strong>Settings:</strong> Configure your account, API keys, and notifications</li>
        </ul>
        <p>For more information, please check the detailed guides or contact our support team.</p>`,
        summary: "A comprehensive guide to getting started with the Media Monitoring Platform and utilizing its core features",
        category: "User Guide",
        tags: ["getting started", "guide", "basics"],
        authorId: 1,
        isPublished: true
      },
      {
        title: "Sentiment Analysis and Understanding Audience Trends",
        content: `<h2>Understanding Sentiment Analysis in the Platform</h2>
        <p>The sentiment analysis feature is one of the most important capabilities provided by the platform for understanding audience opinions.</p>
        <h3>How Does Sentiment Analysis Work?</h3>
        <p>The platform uses advanced artificial intelligence algorithms to analyze texts and comments and classify them into:</p>
        <ul>
          <li><strong>Positive</strong> (green): Comments and posts that carry positive emotions and support</li>
          <li><strong>Neutral</strong> (yellow): Comments and posts that don't carry clear emotions or contain balanced opinions</li>
          <li><strong>Negative</strong> (red): Comments and posts that contain criticism or negative emotions</li>
        </ul>
        <h3>Leveraging Analysis Results</h3>
        <p>You can use this data to improve your media strategy and communicate better with your audience by:</p>
        <ol>
          <li>Monitoring general sentiment changes over time</li>
          <li>Identifying topics and issues that trigger positive or negative reactions</li>
          <li>Measuring the effectiveness of different campaigns and initiatives</li>
          <li>Responding quickly to crises or sudden changes in sentiment</li>
        </ol>
        <h3>Advanced Sentiment Reports</h3>
        <p>The platform provides advanced sentiment analysis reports including:</p>
        <ul>
          <li>Charts for trends over time</li>
          <li>Comparison between different platforms</li>
          <li>Detailed analysis of words and phrases associated with each type of sentiment</li>
          <li>Ability to export data in multiple formats</li>
        </ul>`,
        summary: "Detailed explanation of how sentiment analysis works in the platform and how to benefit from the results to improve your media strategy",
        category: "Analytics",
        tags: ["sentiment analysis", "AI", "audience trends"],
        authorId: 1,
        isPublished: true
      },
      {
        title: "Managing API Keys and Webhooks",
        content: `<h2>Managing API Keys and Webhooks in the Platform</h2>
        <p>The platform provides the ability to manage API keys and webhooks for better integration with external systems and services.</p>
        
        <h3>API Keys</h3>
        <p>API keys enable you to programmatically access platform data and functions through external applications.</p>
        <h4>Creating a New API Key:</h4>
        <ol>
          <li>Navigate to the "Settings" page</li>
          <li>Select the "API Keys" tab</li>
          <li>Click on "Create New Key" button</li>
          <li>Enter a description for the key and specify required permissions</li>
          <li>Choose an expiration date (optional)</li>
          <li>Save the key in a secure location, as you won't be able to see it again</li>
        </ol>
        
        <h3>Webhooks</h3>
        <p>Webhooks allow the platform to send automatic notifications to your systems when specific events occur.</p>
        <h4>Setting Up a New Webhook:</h4>
        <ol>
          <li>Navigate to the "Settings" page</li>
          <li>Select the "Webhooks" tab</li>
          <li>Click on "Add New Webhook" button</li>
          <li>Enter the URL where data will be sent</li>
          <li>Select events you want to receive notifications for</li>
          <li>Choose the format of sent data</li>
          <li>Enable or disable encryption as needed</li>
        </ol>
        
        <h3>Security Best Practices</h3>
        <ul>
          <li>Rotate (change) API keys periodically</li>
          <li>Use limited permissions for each key according to need</li>
          <li>Ensure HTTPS is used for all webhook endpoints</li>
          <li>Regularly monitor key usage to detect any suspicious activity</li>
          <li>Keep a record of active keys and webhooks and their use cases</li>
        </ul>`,
        summary: "A comprehensive guide to managing API keys and webhooks in the platform, including creating keys, setting up webhooks, and security best practices",
        category: "Settings",
        tags: ["API", "webhooks", "security", "integration"],
        authorId: 1,
        isPublished: true
      },
      {
        title: "Social Media Monitoring",
        content: `<h2>Social Media Monitoring</h2>
        <p>The platform provides integrated tools for monitoring and analyzing content across various social media platforms.</p>
        
        <h3>Supported Platforms</h3>
        <p>The platform supports monitoring content from the following platforms:</p>
        <ul>
          <li><strong>Twitter/X:</strong> Monitor tweets, replies, and hashtags</li>
          <li><strong>Facebook:</strong> Track posts and comments on public pages</li>
          <li><strong>Instagram:</strong> Analyze posts, comments, and stories</li>
          <li><strong>LinkedIn:</strong> Monitor professional content and company posts</li>
          <li><strong>YouTube:</strong> Track comments on videos</li>
        </ul>
        
        <h3>Setting Up Monitoring Operations</h3>
        <p>You can create custom monitoring operations using the following steps:</p>
        <ol>
          <li>Go to the "Social Monitoring" section</li>
          <li>Click on "Add New Monitor"</li>
          <li>Select the platforms you want to monitor</li>
          <li>Add keywords, hashtags, or accounts</li>
          <li>Set filtering criteria (language, location, etc.)</li>
          <li>Define a monitoring schedule (continuous, daily, weekly)</li>
          <li>Choose the type of notifications you want to receive</li>
        </ol>`,
        summary: "A comprehensive guide to monitoring and analyzing content across social media platforms, including setting up monitoring operations",
        category: "Social Monitoring",
        tags: ["social media", "monitoring", "analysis"],
        authorId: 1,
        isPublished: true
      }
    ];
    
    await db.insert(knowledgeBaseArticles).values(initialKnowledgeBase);
    console.log("Created initial Knowledge Base articles");
  }

  // Check if there are any existing achievement badges
  try {
    const existingBadges = await db.select().from(achievementBadges);
    if (existingBadges.length === 0) {
      // Add initial achievement badges
      const initialBadges = [
        {
          name: "Welcome Aboard",
          description: "Successfully logged in to the platform for the first time",
          category: "onboarding",
          iconurl: "https://cdn-icons-png.flaticon.com/512/6941/6941697.png",
          level: 1,
          points: 10,
          ishidden: false,
          criteria: { type: "login", count: 1 }
        },
        {
          name: "Active Journalist",
          description: "Created and published 5 media items",
          category: "content",
          iconurl: "https://cdn-icons-png.flaticon.com/512/4696/4696830.png",
          level: 1,
          points: 25,
          ishidden: false,
          criteria: { type: "create_media", count: 5 }
        },
        {
          name: "Media Maven",
          description: "Created and published 25 media items",
          category: "content",
          iconUrl: "https://cdn-icons-png.flaticon.com/512/3588/3588614.png",
          level: 2,
          points: 50,
          isHidden: false,
          criteria: { type: "create_media", count: 25 }
        },
        {
          name: "Research Assistant",
          description: "Created and saved 3 reports",
          category: "analytics",
          iconUrl: "https://cdn-icons-png.flaticon.com/512/3370/3370163.png",
          level: 1,
          points: 20,
          isHidden: false,
          criteria: { type: "create_report", count: 3 }
        },
        {
          name: "Data Analyst",
          description: "Created and saved 10 reports",
          category: "analytics",
          iconUrl: "https://cdn-icons-png.flaticon.com/512/1925/1925044.png",
          level: 2,
          points: 40,
          isHidden: false,
          criteria: { type: "create_report", count: 10 }
        },
        {
          name: "Keyword Watcher",
          description: "Added 5 keywords to monitor",
          category: "monitoring",
          iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972153.png",
          level: 1,
          points: 15,
          isHidden: false,
          criteria: { type: "add_keyword", count: 5 }
        },
        {
          name: "Trend Spotter",
          description: "Identified 3 trending keywords",
          category: "monitoring",
          iconUrl: "https://cdn-icons-png.flaticon.com/512/2082/2082860.png",
          level: 2,
          points: 30,
          isHidden: false,
          criteria: { type: "identify_trend", count: 3 }
        },
        {
          name: "Social Butterfly",
          description: "Connected 3 social media accounts",
          category: "social",
          iconUrl: "https://cdn-icons-png.flaticon.com/512/1968/1968666.png",
          level: 1,
          points: 20,
          isHidden: false,
          criteria: { type: "connect_social", count: 3 }
        },
        {
          name: "Engagement Expert",
          description: "Achieved 1000+ engagement on social posts",
          category: "social",
          iconUrl: "https://cdn-icons-png.flaticon.com/512/7997/7997946.png",
          level: 2,
          points: 45,
          isHidden: false,
          criteria: { type: "social_engagement", count: 1000 }
        },
        {
          name: "Sentiment Sage",
          description: "Analyzed sentiment for 50 posts",
          category: "analysis",
          iconUrl: "https://cdn-icons-png.flaticon.com/512/2000/2000582.png",
          level: 2,
          points: 35,
          isHidden: false,
          criteria: { type: "analyze_sentiment", count: 50 }
        },
        {
          name: "Dedicated User",
          description: "Logged in for 7 consecutive days",
          category: "engagement",
          iconUrl: "https://cdn-icons-png.flaticon.com/512/4301/4301828.png",
          level: 1,
          points: 30,
          isHidden: false,
          criteria: { type: "login_streak", count: 7 }
        },
        {
          name: "Platform Devotee",
          description: "Logged in for 30 consecutive days",
          category: "engagement",
          iconUrl: "https://cdn-icons-png.flaticon.com/512/3176/3176384.png",
          level: 3,
          points: 100,
          isHidden: false,
          criteria: { type: "login_streak", count: 30 }
        },
        {
          name: "Tutorial Master",
          description: "Completed all tutorial videos",
          category: "learning",
          iconUrl: "https://cdn-icons-png.flaticon.com/512/2490/2490396.png",
          level: 2,
          points: 50,
          isHidden: false,
          criteria: { type: "complete_tutorial", count: 10 }
        },
        {
          name: "I18n Explorer",
          description: "Used the platform in both Arabic and English modes",
          category: "localization",
          iconUrl: "https://cdn-icons-png.flaticon.com/512/5652/5652022.png",
          level: 1,
          points: 15,
          isHidden: false,
          criteria: { type: "switch_language", count: 2 }
        },
        {
          name: "Hidden Gem",
          description: "Discover this secret achievement",
          category: "easter_egg",
          iconUrl: "https://cdn-icons-png.flaticon.com/512/4543/4543055.png",
          level: 3,
          points: 75,
          isHidden: true,
          criteria: { type: "discover_secret", count: 1 }
        }
      ];
      
      await db.insert(achievementBadges).values(initialBadges);
      console.log("Created initial achievement badges");
      
      // For the first user, initialize gamification stats
      const firstUser = await db.select().from(users).limit(1);
      if (firstUser.length > 0) {
        // Check if user already has gamification stats
        const existingStats = await db.select()
          .from(userGamificationStats)
          .where(eq(userGamificationStats.userId, firstUser[0].id));
        
        if (existingStats.length === 0) {
          // Create initial gamification stats for the user
          await db.insert(userGamificationStats).values({
            userId: firstUser[0].id,
            level: 1,
            totalPoints: 10,
            streak: 1,
            lastActivityDate: new Date(),
            metrics: {
              logins: 1,
              reportsCreated: 0,
              mediaItemsCreated: 0,
              keywordsAdded: 0
            }
          });
          
          // Unlock the welcome badge for the user
          const welcomeBadge = await db.select()
            .from(achievementBadges)
            .where(eq(achievementBadges.name, "Welcome Aboard"))
            .limit(1);
          
          if (welcomeBadge.length > 0) {
            await db.insert(userAchievements).values({
              userId: firstUser[0].id,
              badgeId: welcomeBadge[0].id,
              isUnlocked: true,
              progress: 1,
              unlockedAt: new Date()
            });
          }
          
          console.log("Created initial gamification data for first user");
        }
      }
    }
  } catch (error) {
    console.log("Skipping gamification setup:", error instanceof Error ? error.message : String(error));
  }

  console.log("Database seeding completed");
}