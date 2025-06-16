import * as fs from 'fs';
import * as path from 'path';

// Setup paths
const rootDir = path.resolve('.');
const TARGET_EN_PATH = path.join(rootDir, 'client/src/lib/i18n/locales/en.ts');
const TARGET_AR_PATH = path.join(rootDir, 'client/src/lib/i18n/locales/ar.ts');

// Read files
const targetEnContent = fs.readFileSync(TARGET_EN_PATH, 'utf-8');
const targetArContent = fs.readFileSync(TARGET_AR_PATH, 'utf-8');

// Function to add missing translations from attached files
function mergeTranslations() {
  console.log("Starting manual translation merge process...");
  
  // English translations to add
  let updatedEnContent = targetEnContent;
  
  // Extract the supportCenter section from English file if it doesn't exist
  if (!targetEnContent.includes('"supportCenter"')) {
    console.log("Adding supportCenter section to English translations...");
    
    const supportCenterEn = `
  "supportCenter": {
    "title": "Help & Support Center",
    "subtitle": "Find answers, resources, and support for your questions",
    "tabs": {
      "overview": "Overview",
      "resources": "Resources",
      "help": "Get Help"
    },
    "faq": {
      "title": "Frequently Asked Questions",
      "description": "Quick answers to common questions",
      "content": "Browse our FAQ for answers to common questions about the platform features, usage, and troubleshooting.",
      "browseButton": "Browse FAQs"
    },
    "knowledgeBase": {
      "title": "Knowledge Base",
      "description": "Detailed guides and articles",
      "content": "Find in-depth articles and guides about using the platform, best practices, and advanced features.",
      "browseButton": "Browse Knowledge Base"
    },
    "supportTickets": {
      "title": "Support Tickets",
      "description": "Get personalized help from our team",
      "content": "Create support tickets for direct assistance from our team. Track the status of your tickets.",
      "browseButton": "View Tickets"
    },
    "getHelp": {
      "title": "Need more assistance?",
      "description": "Our support team is here to help you with any issues or questions",
      "createTicketButton": "Create Support Ticket",
      "tutorialsButton": "View Tutorials"
    },
    "resources": {
      "title": "Learning Resources",
      "description": "Explore our comprehensive learning materials",
      "documentation": "Documentation",
      "documentationDescription": "Detailed technical documentation for the platform features and APIs",
      "documentationButton": "View Documentation",
      "guides": "User Guides",
      "guidesDescription": "Step-by-step guides to help you use platform features effectively",
      "guidesButton": "View Guides",
      "tutorials": "Video Tutorials",
      "tutorialsDescription": "Watch video tutorials to learn how to use the platform",
      "tutorialsButton": "Watch Tutorials"
    },
    "help": {
      "title": "Get Direct Support",
      "description": "Contact our support team for personalized assistance",
      "content": "If you cannot find the answers in our knowledge base or tutorials, create a support ticket for direct assistance.",
      "createTicketButton": "Create Support Ticket",
      "faqButton": "Check FAQ First"
    },
    "yourTickets": {
      "title": "Your Support Tickets",
      "description": "View and manage your existing support tickets",
      "viewButton": "View Your Tickets"
    },
    "contactUs": {
      "title": "Contact Us",
      "description": "Get in touch with our support team directly",
      "content": "Have a question or need assistance? Contact our support team directly through our contact form.",
      "button": "Contact Us"
    }
  },
  "faq": {
    "title": "Frequently Asked Questions",
    "subtitle": "Find quick answers to common questions about using the platform",
    "backToSupport": "Back to Support",
    "searchPlaceholder": "Search questions...",
    "categoryFilterPlaceholder": "Filter by category",
    "allCategories": "All Categories",
    "frequentlyAskedQuestions": "Frequently Asked Questions",
    "frequentlyAskedQuestionsDescription": "Browse through our commonly asked questions to find quick answers",
    "filteredResults": "{{count}} Results",
    "filteredDescription": "Showing filtered questions based on your search",
    "errorLoading": "Error loading FAQs. Please try again.",
    "noResultsFound": "No FAQs found matching your search criteria.",
    "clearFilters": "Clear filters",
    "needMoreHelp": {
      "title": "Still have questions?",
      "description": "If you couldn\\'t find what you were looking for, we\\'re here to help",
      "createTicket": "Create a Support Ticket",
      "browseKnowledgeBase": "Browse Knowledge Base"
    }
  },
  "knowledgeBase": {
    "title": "Knowledge Base",
    "subtitle": "Explore guides, articles, and resources to help you use the platform effectively",
    "backToSupport": "Back to Support",
    "searchPlaceholder": "Search articles...",
    "categoryFilterPlaceholder": "Category",
    "tagFilterPlaceholder": "Tag",
    "allCategories": "All Categories",
    "allTags": "All Tags",
    "allArticles": "All Articles",
    "filteredResults": "{{count}} Results",
    "errorLoading": "Error loading articles. Please try again.",
    "tryAgain": "Try Again",
    "noResultsFound": "No articles found matching your search criteria.",
    "clearFilters": "Clear Filters",
    "readMore": "Read More",
    "viewAllInCategory": "View All",
    "cantFindAnswer": {
      "title": "Can\\'t find what you\\'re looking for?",
      "description": "Our support team is ready to assist you with your specific questions",
      "createTicket": "Create a Support Ticket",
      "browseFaq": "Browse FAQs"
    }
  },
  "knowledgeArticle": {
    "backToSupport": "Support",
    "knowledgeBase": "Knowledge Base",
    "loading": "Loading article...",
    "invalidId": "Invalid Article ID",
    "invalidIdDescription": "The article ID provided is invalid. Please go back to the knowledge base.",
    "backToKnowledgeBase": "Back to Knowledge Base",
    "errorLoading": "Error loading article. It may have been removed or you may not have permission to view it.",
    "publishedOn": "Published on {{date}}",
    "unknownAuthor": "Team Member",
    "helpfulVotes": "helpful votes",
    "share": "Share",
    "print": "Print",
    "wasThisHelpful": "Was this article helpful?",
    "yes": "Yes",
    "no": "No",
    "relatedTopics": "Related Topics",
    "feedbackThankYou": "Thank you for your feedback",
    "feedbackReceived": "Your feedback helps us improve our knowledge base.",
    "feedbackError": "Error submitting feedback",
    "loginRequired": "Login required",
    "loginRequiredDescription": "Please log in to provide feedback on articles.",
    "linkCopied": "Link copied",
    "linkCopiedDescription": "Article link copied to clipboard",
    "thankYouForFeedback": "Thank you for your feedback",
    "needMoreHelp": {
      "title": "Need more help?",
      "description": "If this article didn\\'t fully resolve your issue, we\\'re here to help",
      "createTicket": "Create a Support Ticket",
      "browseFaq": "Browse FAQs"
    }
  },
  "supportTickets": {
    "title": "Support Tickets",
    "subtitle": "View and manage your support requests",
    "backToSupport": "Back to Support",
    "newTicket": "New Ticket",
    "allTickets": "All Tickets",
    "allTicketsDescription": "View all your support tickets",
    "tabs": {
      "all": "All",
      "open": "Open",
      "inProgress": "In Progress",
      "resolved": "Resolved",
      "closed": "Closed"
    },
    "statusTickets": {
      "open": "Open Tickets",
      "in-progress": "In Progress Tickets",
      "resolved": "Resolved Tickets",
      "closed": "Closed Tickets"
    },
    "statusTicketsDescription": {
      "open": "Newly created tickets awaiting initial response",
      "in-progress": "Tickets currently being worked on by our support team",
      "resolved": "Tickets that have been resolved by our support team",
      "closed": "Tickets that have been closed"
    },
    "status": {
      "open": "Open",
      "in-progress": "In Progress",
      "resolved": "Resolved",
      "closed": "Closed"
    },
    "priority": {
      "low": "Low Priority",
      "medium": "Medium Priority",
      "high": "High Priority"
    },
    "viewDetails": "View Details",
    "errorLoading": "Error loading tickets. Please try again.",
    "tryAgain": "Try Again",
    "noTicketsFound": "You don\\'t have any support tickets yet.",
    "createFirstTicket": "Create Your First Ticket",
    "adminView": "Admin View - Showing all tickets",
    "loginRequired": {
      "title": "Login Required",
      "description": "You need to be logged in to view your support tickets.",
      "loginButton": "Log In"
    },
    "needHelp": {
      "title": "Need help?",
      "description": "Check our FAQs and knowledge base for quick answers to common questions",
      "browseFaq": "Browse FAQs",
      "browseKnowledgeBase": "Browse Knowledge Base"
    }
  },
  "ticketDetail": {
    "backToSupport": "Support",
    "supportTickets": "Tickets",
    "ticket": "Ticket",
    "loading": "Loading ticket...",
    "invalidId": "Invalid Ticket ID",
    "invalidIdDescription": "The ticket ID provided is invalid. Please go back to tickets.",
    "backToTickets": "Back to Tickets",
    "errorLoading": "Error loading ticket. It may have been removed or you may not have permission to view it.",
    "createdOn": "Created on {{date}}",
    "description": "Description",
    "attachments": "Attachments",
    "attachment": "Attachment",
    "status": {
      "label": "Status",
      "selectStatus": "Select a status",
      "open": "Open",
      "in-progress": "In Progress",
      "resolved": "Resolved",
      "closed": "Closed"
    },
    "priority": {
      "low": "Low",
      "medium": "Medium",
      "high": "High"
    },
    "responses": "Responses",
    "noResponses": "No responses yet.",
    "staffResponse": "Staff",
    "supportTeam": "Support Team",
    "you": "You",
    "addResponse": "Add Response",
    "responsePlaceholder": "Type your message here...",
    "attachFilesLabel": "Attachments (optional)",
    "attachFiles": "Attach Files",
    "comingSoon": "Coming soon",
    "sending": "Sending...",
    "sendResponse": "Send Response",
    "closeTicket": "Close Ticket",
    "closing": "Closing...",
    "manageTicket": "Manage Ticket",
    "updateTicketStatus": "Update Ticket Status"
  },`;
    
    // Find the right position to insert - before the last closing brace
    const lastBraceIndex = updatedEnContent.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      updatedEnContent = 
        updatedEnContent.substring(0, lastBraceIndex) + 
        supportCenterEn +
        updatedEnContent.substring(lastBraceIndex);
      
      // Write updated English content
      fs.writeFileSync(TARGET_EN_PATH, updatedEnContent);
      console.log("English translations updated successfully!");
    } else {
      console.error("Could not find a suitable position to insert English translations.");
    }
  } else {
    console.log("supportCenter section already exists in English translations. Skipping...");
  }
  
  // Arabic translations to add
  let updatedArContent = targetArContent;
  
  // Extract the supportCenter section from Arabic file if it doesn't exist
  if (!targetArContent.includes('"supportCenter"')) {
    console.log("Adding supportCenter section to Arabic translations...");
    
    const supportCenterAr = `
  "supportCenter": {
    "title": "مركز المساعدة والدعم",
    "subtitle": "ابحث عن الإجابات والموارد والدعم لأسئلتك",
    "tabs": {
      "overview": "نظرة عامة",
      "resources": "الموارد",
      "help": "الحصول على المساعدة"
    },
    "faq": {
      "title": "الأسئلة الشائعة",
      "description": "إجابات سريعة للأسئلة الشائعة",
      "content": "تصفح الأسئلة الشائعة للحصول على إجابات للأسئلة الشائعة حول ميزات المنصة واستخدامها واستكشاف الأخطاء وإصلاحها.",
      "browseButton": "تصفح الأسئلة الشائعة"
    },
    "knowledgeBase": {
      "title": "قاعدة المعرفة",
      "description": "أدلة ومقالات مفصلة",
      "content": "ابحث عن مقالات وأدلة متعمقة حول استخدام المنصة وأفضل الممارسات والميزات المتقدمة.",
      "browseButton": "تصفح قاعدة المعرفة"
    },
    "supportTickets": {
      "title": "تذاكر الدعم",
      "description": "احصل على مساعدة شخصية من فريقنا",
      "content": "قم بإنشاء تذاكر دعم للحصول على مساعدة مباشرة من فريقنا. تتبع حالة تذاكرك.",
      "browseButton": "عرض التذاكر"
    },
    "getHelp": {
      "title": "هل تحتاج إلى مزيد من المساعدة؟",
      "description": "فريق الدعم لدينا موجود لمساعدتك في أي مشكلات أو أسئلة",
      "createTicketButton": "إنشاء تذكرة دعم",
      "tutorialsButton": "مشاهدة البرامج التعليمية"
    },
    "resources": {
      "title": "موارد التعلم",
      "description": "استكشف مواد التعلم الشاملة لدينا",
      "documentation": "الوثائق",
      "documentationDescription": "وثائق تقنية مفصلة لميزات المنصة وواجهات برمجة التطبيقات",
      "documentationButton": "عرض الوثائق",
      "guides": "أدلة المستخدم",
      "guidesDescription": "أدلة خطوة بخطوة لمساعدتك على استخدام ميزات المنصة بفعالية",
      "guidesButton": "عرض الأدلة",
      "tutorials": "فيديوهات تعليمية",
      "tutorialsDescription": "شاهد الفيديوهات التعليمية لتتعلم كيفية استخدام المنصة",
      "tutorialsButton": "مشاهدة الفيديوهات التعليمية"
    },
    "help": {
      "title": "الحصول على دعم مباشر",
      "description": "اتصل بفريق الدعم لدينا للحصول على مساعدة شخصية",
      "content": "إذا لم تتمكن من العثور على الإجابات في قاعدة المعرفة أو البرامج التعليمية، قم بإنشاء تذكرة دعم للحصول على مساعدة مباشرة.",
      "createTicketButton": "إنشاء تذكرة دعم",
      "faqButton": "تحقق من الأسئلة الشائعة أولاً"
    },
    "yourTickets": {
      "title": "تذاكر الدعم الخاصة بك",
      "description": "عرض وإدارة تذاكر الدعم الحالية",
      "viewButton": "عرض تذاكرك"
    },
    "contactUs": {
      "title": "اتصل بنا",
      "description": "تواصل مع فريق الدعم لدينا مباشرة",
      "content": "هل لديك سؤال أو تحتاج إلى مساعدة؟ اتصل بفريق الدعم لدينا مباشرة من خلال نموذج الاتصال.",
      "button": "اتصل بنا"
    }
  },
  "faq": {
    "title": "الأسئلة الشائعة",
    "subtitle": "ابحث عن إجابات سريعة للأسئلة الشائعة حول استخدام المنصة",
    "backToSupport": "العودة إلى الدعم",
    "searchPlaceholder": "البحث في الأسئلة...",
    "categoryFilterPlaceholder": "تصفية حسب الفئة",
    "allCategories": "جميع الفئات",
    "frequentlyAskedQuestions": "الأسئلة المتكررة",
    "frequentlyAskedQuestionsDescription": "تصفح أسئلتنا الشائعة للعثور على إجابات سريعة",
    "filteredResults": "{{count}} نتيجة",
    "filteredDescription": "عرض الأسئلة المصفاة بناءً على بحثك",
    "errorLoading": "خطأ في تحميل الأسئلة الشائعة. يرجى المحاولة مرة أخرى.",
    "noResultsFound": "لم يتم العثور على أسئلة شائعة تطابق معايير البحث الخاصة بك.",
    "clearFilters": "مسح التصفية",
    "needMoreHelp": {
      "title": "هل لا تزال لديك أسئلة؟",
      "description": "إذا لم تتمكن من العثور على ما كنت تبحث عنه، فنحن هنا للمساعدة",
      "createTicket": "إنشاء تذكرة دعم",
      "browseKnowledgeBase": "تصفح قاعدة المعرفة"
    }
  },
  "knowledgeBase": {
    "title": "قاعدة المعرفة",
    "subtitle": "استكشف الأدلة والمقالات والموارد لمساعدتك على استخدام المنصة بفعالية",
    "backToSupport": "العودة إلى الدعم",
    "searchPlaceholder": "البحث في المقالات...",
    "categoryFilterPlaceholder": "الفئة",
    "tagFilterPlaceholder": "الوسم",
    "allCategories": "جميع الفئات",
    "allTags": "جميع الوسوم",
    "allArticles": "جميع المقالات",
    "filteredResults": "{{count}} نتيجة",
    "errorLoading": "خطأ في تحميل المقالات. يرجى المحاولة مرة أخرى.",
    "tryAgain": "حاول مرة أخرى",
    "noResultsFound": "لم يتم العثور على مقالات تطابق معايير البحث الخاصة بك.",
    "clearFilters": "مسح التصفية",
    "readMore": "قراءة المزيد",
    "viewAllInCategory": "عرض الكل",
    "cantFindAnswer": {
      "title": "لا يمكنك العثور على ما تبحث عنه؟",
      "description": "فريق الدعم لدينا جاهز لمساعدتك في أسئلتك المحددة",
      "createTicket": "إنشاء تذكرة دعم",
      "browseFaq": "تصفح الأسئلة الشائعة"
    }
  },
  "knowledgeArticle": {
    "backToSupport": "الدعم",
    "knowledgeBase": "قاعدة المعرفة",
    "loading": "جاري تحميل المقال...",
    "invalidId": "معرف المقال غير صالح",
    "invalidIdDescription": "معرف المقال المقدم غير صالح. يرجى العودة إلى قاعدة المعرفة.",
    "backToKnowledgeBase": "العودة إلى قاعدة المعرفة",
    "errorLoading": "خطأ في تحميل المقال. ربما تمت إزالته أو ليس لديك إذن لعرضه.",
    "publishedOn": "نُشر في {{date}}",
    "unknownAuthor": "عضو الفريق",
    "helpfulVotes": "أصوات مفيدة",
    "share": "مشاركة",
    "print": "طباعة",
    "wasThisHelpful": "هل كان هذا المقال مفيداً؟",
    "yes": "نعم",
    "no": "لا",
    "relatedTopics": "مواضيع ذات صلة",
    "feedbackThankYou": "شكراً على ملاحظاتك",
    "feedbackReceived": "ملاحظاتك تساعدنا على تحسين قاعدة المعرفة لدينا.",
    "feedbackError": "خطأ في إرسال الملاحظات",
    "loginRequired": "تسجيل الدخول مطلوب",
    "loginRequiredDescription": "يرجى تسجيل الدخول لتقديم ملاحظات على المقالات.",
    "linkCopied": "تم نسخ الرابط",
    "linkCopiedDescription": "تم نسخ رابط المقال إلى الحافظة",
    "thankYouForFeedback": "شكراً على ملاحظاتك",
    "needMoreHelp": {
      "title": "هل تحتاج إلى مزيد من المساعدة؟",
      "description": "إذا لم يحل هذا المقال مشكلتك بالكامل، فنحن هنا للمساعدة",
      "createTicket": "إنشاء تذكرة دعم",
      "browseFaq": "تصفح الأسئلة الشائعة"
    }
  },
  "supportTickets": {
    "title": "تذاكر الدعم",
    "subtitle": "عرض وإدارة طلبات الدعم الخاصة بك",
    "backToSupport": "العودة إلى الدعم",
    "newTicket": "تذكرة جديدة",
    "allTickets": "جميع التذاكر",
    "allTicketsDescription": "عرض جميع تذاكر الدعم الخاصة بك",
    "tabs": {
      "all": "الكل",
      "open": "مفتوح",
      "inProgress": "قيد التنفيذ",
      "resolved": "تم الحل",
      "closed": "مغلق"
    },
    "statusTickets": {
      "open": "التذاكر المفتوحة",
      "in-progress": "التذاكر قيد التنفيذ",
      "resolved": "التذاكر التي تم حلها",
      "closed": "التذاكر المغلقة"
    },
    "statusTicketsDescription": {
      "open": "التذاكر المنشأة حديثاً في انتظار الرد الأولي",
      "in-progress": "التذاكر التي يعمل عليها فريق الدعم حالياً",
      "resolved": "التذاكر التي تم حلها بواسطة فريق الدعم لدينا",
      "closed": "التذاكر التي تم إغلاقها"
    },
    "status": {
      "open": "مفتوح",
      "in-progress": "قيد التنفيذ",
      "resolved": "تم الحل",
      "closed": "مغلق"
    },
    "priority": {
      "low": "أولوية منخفضة",
      "medium": "أولوية متوسطة",
      "high": "أولوية عالية"
    },
    "viewDetails": "عرض التفاصيل",
    "errorLoading": "خطأ في تحميل التذاكر. يرجى المحاولة مرة أخرى.",
    "tryAgain": "حاول مرة أخرى",
    "noTicketsFound": "ليس لديك أي تذاكر دعم حتى الآن.",
    "createFirstTicket": "إنشاء تذكرتك الأولى",
    "adminView": "عرض المسؤول - عرض جميع التذاكر",
    "loginRequired": {
      "title": "تسجيل الدخول مطلوب",
      "description": "تحتاج إلى تسجيل الدخول لعرض تذاكر الدعم الخاصة بك.",
      "loginButton": "تسجيل الدخول"
    },
    "needHelp": {
      "title": "هل تحتاج إلى مساعدة؟",
      "description": "تحقق من الأسئلة الشائعة وقاعدة المعرفة لدينا للحصول على إجابات سريعة للأسئلة الشائعة",
      "browseFaq": "تصفح الأسئلة الشائعة",
      "browseKnowledgeBase": "تصفح قاعدة المعرفة"
    }
  },
  "ticketDetail": {
    "backToSupport": "الدعم",
    "supportTickets": "التذاكر",
    "ticket": "تذكرة",
    "loading": "جاري تحميل التذكرة...",
    "invalidId": "معرف التذكرة غير صالح",
    "invalidIdDescription": "معرف التذكرة المقدم غير صالح. يرجى العودة إلى التذاكر.",
    "backToTickets": "العودة إلى التذاكر",
    "errorLoading": "خطأ في تحميل التذكرة. ربما تمت إزالتها أو ليس لديك إذن لعرضها.",
    "createdOn": "تم الإنشاء في {{date}}",
    "description": "الوصف",
    "attachments": "المرفقات",
    "attachment": "مرفق",
    "status": {
      "label": "الحالة",
      "selectStatus": "اختر حالة",
      "open": "مفتوح",
      "in-progress": "قيد التنفيذ",
      "resolved": "تم الحل",
      "closed": "مغلق"
    },
    "priority": {
      "low": "منخفضة",
      "medium": "متوسطة",
      "high": "عالية"
    },
    "responses": "الردود",
    "noResponses": "لا توجد ردود حتى الآن.",
    "staffResponse": "الموظف",
    "supportTeam": "فريق الدعم",
    "you": "أنت",
    "addResponse": "إضافة رد",
    "responsePlaceholder": "اكتب رسالتك هنا...",
    "attachFilesLabel": "المرفقات (اختياري)",
    "attachFiles": "إرفاق ملفات",
    "comingSoon": "قريباً",
    "sending": "جاري الإرسال...",
    "sendResponse": "إرسال الرد",
    "closeTicket": "إغلاق التذكرة",
    "closing": "جاري الإغلاق...",
    "manageTicket": "إدارة التذكرة",
    "updateTicketStatus": "تحديث حالة التذكرة"
  },`;
    
    // Find the right position to insert - before the last closing brace
    const lastBraceIndex = updatedArContent.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      updatedArContent = 
        updatedArContent.substring(0, lastBraceIndex) + 
        supportCenterAr +
        updatedArContent.substring(lastBraceIndex);
      
      // Write updated Arabic content
      fs.writeFileSync(TARGET_AR_PATH, updatedArContent);
      console.log("Arabic translations updated successfully!");
    } else {
      console.error("Could not find a suitable position to insert Arabic translations.");
    }
  } else {
    console.log("supportCenter section already exists in Arabic translations. Skipping...");
  }

  // Add contextHints section to translations if it doesn't exist
  if (!targetEnContent.includes('"contextHints"')) {
    console.log("Adding contextHints section to English translations...");
    
    const contextHintsEn = `
  "contextHints": {
    "language_context_hints": "Language Context Hints",
    "ai_powered_language_improvement_tool": "AI-powered tool for enhancing language quality",
    "context_hint_generator": "Context Hint Generator",
    "enter_text_for_language_analysis": "Enter text to receive language improvement suggestions",
    "analyzing_text": "Analyzing Text",
    "generating_language_hints": "Generating language context hints...",
    "no_hints_available": "No language hints available",
    "no_suggestions_found": "No suggestions found for this text",
    "minimum_text_required": "Enter at least 5 characters for analysis",
    "analyze_text": "Analyze Text",
    "analyzing": "Analyzing...",
    "select_language": "Select Language",
    "enter_text_here": "Enter your text here...",
    "copied": "Copied",
    "text_copied_to_clipboard": "Text copied to clipboard",
    "applied": "Applied",
    "suggestion_applied": "Suggestion applied to text",
    "original_text": "Original Text",
    "suggested_replacement": "Suggested Replacement",
    "explanation": "Explanation",
    "source": "Source",
    "confidence": "Confidence",
    "copy": "Copy",
    "apply": "Apply",
    "expand": "Expand",
    "collapse": "Collapse",
    "view_details": "View suggestion details",
    "collapse_details": "Hide suggestion details",
    "powered_by_ai": "Powered by Anthropic Claude and OpenAI",
    "about_context_hints": "About Context Hints",
    "how_context_hints_work": "How the AI language suggestions work",
    "context_hints_description": "The Language Context Hint Generator uses advanced AI to improve your writing quality. It analyzes text to identify grammar issues, clarity improvements, tone adjustments, cultural sensitivities, and formality corrections.",
    "supported_hint_types": "Supported Hint Types",
    "grammar": "Grammar",
    "grammar_description": "Corrections for spelling, punctuation, and grammatical errors",
    "clarity": "Clarity",
    "clarity_description": "Suggestions for making text more clear and easy to understand",
    "tone": "Tone",
    "tone_description": "Adjustments to improve the tone and emotional impact",
    "cultural": "Cultural",
    "cultural_description": "Considerations for cultural relevance and sensitivity",
    "formality": "Formality",
    "formality_description": "Adjustments to match appropriate level of formality",
    "suggestion": "Suggestion",
    "suggestions": "Suggestions",
    "example_texts": "Example Texts",
    "try_with_these_examples": "Try analyzing these examples"
  },`;
    
    // Find the right position to insert - before the last closing brace
    const lastBraceIndex = updatedEnContent.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      updatedEnContent = 
        updatedEnContent.substring(0, lastBraceIndex) + 
        contextHintsEn +
        updatedEnContent.substring(lastBraceIndex);
      
      // Write updated English content
      fs.writeFileSync(TARGET_EN_PATH, updatedEnContent);
      console.log("English contextHints section added successfully!");
    }
  }
  
  if (!targetArContent.includes('"contextHints"')) {
    console.log("Adding contextHints section to Arabic translations...");
    
    const contextHintsAr = `
  "contextHints": {
    "language_context_hints": "تلميحات السياق اللغوي",
    "ai_powered_language_improvement_tool": "أداة مدعومة بالذكاء الاصطناعي لتحسين جودة اللغة",
    "context_hint_generator": "مولد تلميحات السياق",
    "enter_text_for_language_analysis": "أدخل النص لتلقي اقتراحات تحسين اللغة",
    "analyzing_text": "جاري تحليل النص",
    "generating_language_hints": "جاري إنشاء تلميحات السياق اللغوي...",
    "no_hints_available": "لا توجد تلميحات لغوية متاحة",
    "no_suggestions_found": "لم يتم العثور على اقتراحات لهذا النص",
    "minimum_text_required": "أدخل 5 أحرف على الأقل للتحليل",
    "analyze_text": "تحليل النص",
    "analyzing": "جاري التحليل...",
    "select_language": "اختر اللغة",
    "enter_text_here": "أدخل النص هنا...",
    "copied": "تم النسخ",
    "text_copied_to_clipboard": "تم نسخ النص إلى الحافظة",
    "applied": "تم التطبيق",
    "suggestion_applied": "تم تطبيق الاقتراح على النص",
    "original_text": "النص الأصلي",
    "suggested_replacement": "الاستبدال المقترح",
    "explanation": "التفسير",
    "source": "المصدر",
    "confidence": "الثقة",
    "copy": "نسخ",
    "apply": "تطبيق",
    "expand": "توسيع",
    "collapse": "طي",
    "view_details": "عرض تفاصيل الاقتراح",
    "collapse_details": "إخفاء تفاصيل الاقتراح",
    "powered_by_ai": "مدعوم بواسطة Anthropic Claude و OpenAI",
    "about_context_hints": "حول تلميحات السياق",
    "how_context_hints_work": "كيف تعمل اقتراحات اللغة بالذكاء الاصطناعي",
    "context_hints_description": "يستخدم مولد تلميحات السياق اللغوي الذكاء الاصطناعي المتقدم لتحسين جودة الكتابة. يحلل النص لتحديد مشكلات القواعد، وتحسينات الوضوح، وتعديلات النبرة، والحساسيات الثقافية، وتصحيحات الرسمية.",
    "supported_hint_types": "أنواع التلميحات المدعومة",
    "grammar": "القواعد",
    "grammar_description": "تصحيحات للإملاء وعلامات الترقيم والأخطاء النحوية",
    "clarity": "الوضوح",
    "clarity_description": "اقتراحات لجعل النص أكثر وضوحًا وسهولة في الفهم",
    "tone": "النبرة",
    "tone_description": "تعديلات لتحسين النبرة والتأثير العاطفي",
    "cultural": "الثقافي",
    "cultural_description": "اعتبارات للصلة الثقافية والحساسية",
    "formality": "الرسمية",
    "formality_description": "تعديلات لتتناسب مع المستوى المناسب من الرسمية",
    "suggestion": "اقتراح",
    "suggestions": "اقتراحات",
    "example_texts": "نصوص مثالية",
    "try_with_these_examples": "جرب تحليل هذه الأمثلة"
  },`;
    
    // Find the right position to insert - before the last closing brace
    const lastBraceIndex = updatedArContent.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      updatedArContent = 
        updatedArContent.substring(0, lastBraceIndex) + 
        contextHintsAr +
        updatedArContent.substring(lastBraceIndex);
      
      // Write updated Arabic content
      fs.writeFileSync(TARGET_AR_PATH, updatedArContent);
      console.log("Arabic contextHints section added successfully!");
    }
  }

  // Add socialMedia section to translations if it doesn't exist
  if (!targetEnContent.includes('"socialMedia": {')) {
    console.log("Adding socialMedia section to English translations...");
    
    const socialMediaEn = `
  "socialMedia": {
    "title": "Social Media Management",
    "dashboard": "Dashboard",
    "accounts": "Official Accounts",
    "publish": "Publish Content",
    "analytics": "Analytics",
    "realTimeUpdates": "Real-Time Monitoring Updates",
    "offlineMode": "Offline Mode",
    "posts": "Posts",
    "engagement": "Engagement",
    "reach": "Reach",
    "connectedPlatforms": "Ajman Police Official Platforms",
    "engagementOverview": "Engagement Overview",
    "lastThirtyDays": "Last 30 Days",
    "trendingTopics": "Trending Topics",
    "realTimeMonitoring": "Monitoring trending topics and hashtags",
    "audienceDemographics": "Audience Demographics",
    "sentimentAnalysis": "Sentiment Analysis",
    "selectTimeframe": "Select Timeframe",
    "timeframe": {
      "day": "Day",
      "week": "Week",
      "month": "Month",
      "quarter": "Quarter"
    },
    "sentimentTrend": "Sentiment Trend",
    "sentimentTrendDescription": "Analysis of sentiment evolution over time",
    "currentSentiment": "Current Sentiment",
    "sentiment": {
      "positive": "Positive",
      "neutral": "Neutral",
      "negative": "Negative"
    },
    "recentPosts": "Recent Posts",
    "noPosts": "No posts available",
    "connectedAccounts": "Connected Accounts",
    "manageYourAccounts": "Manage Ajman Police accounts on social media",
    "connected": "Connected",
    "manage": "Manage",
    "connectNew": "Connect New Account",
    "addAccount": "Add Official Social Media Account",
    "connect": "Connect",
    "createPost": "Create Post",
    "shareAcrossPlatforms": "Share content across social media platforms",
    "whatToShare": "What would you like to share?",
    "addImage": "Add Image",
    "addVideo": "Add Video",
    "addDocument": "Add Document",
    "mention": "Mention",
    "hashtag": "Hashtag",
    "schedule": "Schedule",
    "publishButton": "Publish",
    "scheduledPosts": "Scheduled Posts",
    "noScheduledPosts": "No scheduled posts",
    "scheduleMessage": "Schedule your posts to be published automatically at specific times",
    "detailedAnalytics": "Detailed Analytics",
    "performanceInsights": "Performance insights for Ajman Police accounts",
    "totalEngagement": "Total Engagement",
    "topPerformingPosts": "Top Performing Posts",
    "audienceGrowth": "Audience Growth",
    "followers": "Followers",
    "likes": "Likes",
    "comments": "Comments",
    "shares": "Shares",
    "osintMonitoring": "OSINT Monitoring",
    "contentArchive": "Content Archive",
    "archiveDescription": "Archive of search for relevant content and accounts",
    "searchKeywords": "Search Keywords",
    "searchAccounts": "Search Accounts",
    "saveToArchive": "Save to Archive",
    "archivedContent": "Archived Content",
    "threatLevel": "Threat Level",
    "relevanceScore": "Relevance Score",
    "informationValue": "Information Value",
    "actionNeeded": "Action Needed",
    "monitorOnly": "Monitor Only",
    "escalate": "Escalate",
    "investigate": "Investigate",
    "monitorHash": "Monitor Hashtag",
    "keywordAlert": "Keyword Alert",
    "addFlaggedAccount": "Add Flagged Account",
    "exportOsintReport": "Export OSINT Report",
    "flaggedAccounts": "Flagged Accounts",
    "flaggedContent": "Flagged Content",
    "searchHistory": "Search History",
    "savedSearches": "Saved Searches"
  },`;
    
    // Find the right position to insert - before the last closing brace
    const lastBraceIndex = updatedEnContent.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      updatedEnContent = 
        updatedEnContent.substring(0, lastBraceIndex) + 
        socialMediaEn +
        updatedEnContent.substring(lastBraceIndex);
      
      // Write updated English content
      fs.writeFileSync(TARGET_EN_PATH, updatedEnContent);
      console.log("English socialMedia section added successfully!");
    }
  }

  if (!targetArContent.includes('"socialMedia": {')) {
    console.log("Adding socialMedia section to Arabic translations...");
    
    const socialMediaAr = `
  "socialMedia": {
    "title": "إدارة منصات التواصل الاجتماعي",
    "dashboard": "لوحة التحكم",
    "accounts": "الحسابات الرسمية",
    "publish": "نشر المحتوى",
    "analytics": "التحليلات",
    "realTimeUpdates": "تحديثات المراقبة المباشرة",
    "offlineMode": "وضع عدم الاتصال",
    "posts": "منشورات",
    "engagement": "التفاعل",
    "reach": "الوصول",
    "connectedPlatforms": "المنصات الرسمية لشرطة عجمان",
    "engagementOverview": "نظرة عامة على التفاعل",
    "lastThirtyDays": "آخر 30 يوم",
    "trendingTopics": "المواضيع الشائعة",
    "realTimeMonitoring": "مراقبة المواضيع والهاشتاجات الشائعة",
    "audienceDemographics": "البيانات الديموغرافية للجمهور",
    "sentimentAnalysis": "تحليل المشاعر",
    "selectTimeframe": "اختر الإطار الزمني",
    "timeframe": {
      "day": "يوم",
      "week": "أسبوع",
      "month": "شهر",
      "quarter": "ربع سنة"
    },
    "sentimentTrend": "اتجاه المشاعر",
    "sentimentTrendDescription": "تحليل تطور المشاعر العامة مع مرور الوقت",
    "currentSentiment": "المشاعر الحالية",
    "sentiment": {
      "positive": "إيجابي",
      "neutral": "محايد",
      "negative": "سلبي"
    },
    "recentPosts": "أحدث المنشورات",
    "noPosts": "لا توجد منشورات متاحة",
    "connectedAccounts": "الحسابات المتصلة",
    "manageYourAccounts": "إدارة حسابات شرطة عجمان على وسائل التواصل الاجتماعي",
    "connected": "متصل",
    "manage": "إدارة",
    "connectNew": "ربط حساب جديد",
    "addAccount": "إضافة حساب وسائل التواصل الاجتماعي الرسمي",
    "connect": "ربط",
    "createPost": "إنشاء منشور",
    "shareAcrossPlatforms": "شارك المحتوى عبر منصات التواصل الاجتماعي",
    "whatToShare": "ماذا تريد أن تشارك؟",
    "addImage": "إضافة صورة",
    "addVideo": "إضافة فيديو",
    "addDocument": "إضافة مستند",
    "mention": "إشارة",
    "hashtag": "هاشتاج",
    "schedule": "جدولة",
    "publishButton": "نشر",
    "scheduledPosts": "المنشورات المجدولة",
    "noScheduledPosts": "لا توجد منشورات مجدولة",
    "scheduleMessage": "جدولة منشوراتك لتنشر تلقائيًا في أوقات محددة",
    "detailedAnalytics": "التحليلات التفصيلية",
    "performanceInsights": "رؤى الأداء لحسابات شرطة عجمان",
    "totalEngagement": "إجمالي التفاعل",
    "topPerformingPosts": "أفضل المنشورات أداءً",
    "audienceGrowth": "نمو الجمهور",
    "followers": "المتابعون",
    "likes": "الإعجابات",
    "comments": "التعليقات",
    "shares": "المشاركات",
    "osintMonitoring": "مراقبة المعلومات المفتوحة المصدر",
    "contentArchive": "أرشيف المحتوى",
    "archiveDescription": "أرشيف البحث عن المحتوى والحسابات ذات الصلة",
    "searchKeywords": "كلمات البحث",
    "searchAccounts": "البحث عن الحسابات",
    "saveToArchive": "حفظ في الأرشيف",
    "archivedContent": "المحتوى المؤرشف",
    "threatLevel": "مستوى التهديد",
    "relevanceScore": "درجة الصلة",
    "informationValue": "قيمة المعلومات",
    "actionNeeded": "إجراء مطلوب",
    "monitorOnly": "مراقبة فقط",
    "escalate": "تصعيد",
    "investigate": "تحقيق",
    "monitorHash": "مراقبة هاشتاج",
    "keywordAlert": "تنبيه الكلمات الرئيسية",
    "addFlaggedAccount": "إضافة حساب محدد",
    "exportOsintReport": "تصدير تقرير OSINT",
    "flaggedAccounts": "الحسابات المحددة",
    "flaggedContent": "المحتوى المحدد",
    "searchHistory": "سجل البحث",
    "savedSearches": "عمليات البحث المحفوظة"
  },`;
    
    // Find the right position to insert - before the last closing brace
    const lastBraceIndex = updatedArContent.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      updatedArContent = 
        updatedArContent.substring(0, lastBraceIndex) + 
        socialMediaAr +
        updatedArContent.substring(lastBraceIndex);
      
      // Write updated Arabic content
      fs.writeFileSync(TARGET_AR_PATH, updatedArContent);
      console.log("Arabic socialMedia section added successfully!");
    }
  }

  // Add performance section to translations if it doesn't exist
  if (!targetEnContent.includes('"performance": {')) {
    console.log("Adding performance section to English translations...");
    
    const performanceEn = `
  "performance": {
    "title": "Performance Visualization",
    "description": "Visual analysis of media platforms performance and digital presence",
    "pageDescription": "View key performance indicators, sentiment analysis, and engagement statistics",
    "cardDescription": "Access advanced visualization dashboard with interactive charts and performance metrics",
    "timeRange": "Time Range",
    "oneMonth": "1 Month",
    "threeMonths": "3 Months",
    "sixMonths": "6 Months",
    "oneYear": "1 Year",
    "export": "Export",
    "dataUpdated": "Data Updated",
    "dataUpdateSuccess": "All performance data has been successfully updated.",
    "dataUpdateError": "Data Update Error",
    "dataUpdateErrorDescription": "An error occurred while updating performance data. Please try again.",
    "overviewTab": "Overview",
    "sentimentTab": "Sentiment Analysis",
    "engagementTab": "Engagement",
    "performanceTab": "Organization Performance",
    "change": "Change",
    "mediaVisibility": "Media Visibility",
    "mediaVisibilityTrend": "Visibility rate evolution across media platforms during",
    "mediaVisibilityIndex": "Visibility Index",
    "updatedEvery": "Updated every",
    "hours": "hours",
    "hour": "hour",
    "engagementByPlatform": "Engagement by Platform",
    "engagementCount": "Engagement count across different social platforms",
    "engagement": "Engagement",
    "totalEngagement": "Total Engagement",
    "sentimentDistribution": "Sentiment Distribution",
    "sentimentAnalysis": "Analysis of prevailing sentiments in digital content",
    "sentimentTrends": "Sentiment Trends",
    "sentimentOverTime": "Sentiment changes over time",
    "positive": "Positive",
    "neutral": "Neutral",
    "negative": "Negative",
    "positiveChange": "Change in positive sentiment",
    "detailedEngagement": "Detailed Engagement Analysis",
    "dataShownFor": "This data is shown for",
    "loading": "Loading organizational performance data...",
    "keyPerformanceIndicators": "Key Performance Indicators",
    "measurePerformance": "Measuring organizational performance against strategic objectives",
    "filterResults": "Filter Results",
    "target": "Target",
    "dataUpdatedOn": "Data updated on"
  },`;
    
    // Find the right position to insert - before the last closing brace
    const lastBraceIndex = updatedEnContent.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      updatedEnContent = 
        updatedEnContent.substring(0, lastBraceIndex) + 
        performanceEn +
        updatedEnContent.substring(lastBraceIndex);
      
      // Write updated English content
      fs.writeFileSync(TARGET_EN_PATH, updatedEnContent);
      console.log("English performance section added successfully!");
    }
  }

  if (!targetArContent.includes('"performance": {')) {
    console.log("Adding performance section to Arabic translations...");
    
    const performanceAr = `
  "performance": {
    "title": "عرض الأداء",
    "description": "تحليل بصري لأداء المنصات الإعلامية والتواجد الرقمي",
    "pageDescription": "عرض مؤشرات الأداء الرئيسية وتحليل المشاعر وإحصاءات التفاعل",
    "cardDescription": "الوصول إلى لوحة التحكم المتقدمة للتصور مع رسوم بيانية تفاعلية ومقاييس الأداء",
    "timeRange": "النطاق الزمني",
    "oneMonth": "شهر واحد",
    "threeMonths": "3 أشهر",
    "sixMonths": "6 أشهر",
    "oneYear": "سنة",
    "export": "تصدير",
    "dataUpdated": "تم تحديث البيانات",
    "dataUpdateSuccess": "تم تحديث جميع بيانات الأداء بنجاح.",
    "dataUpdateError": "خطأ في تحديث البيانات",
    "dataUpdateErrorDescription": "حدث خطأ أثناء تحديث بيانات الأداء. يرجى المحاولة مرة أخرى.",
    "overviewTab": "نظرة عامة",
    "sentimentTab": "التحليل العاطفي",
    "engagementTab": "التفاعل",
    "performanceTab": "أداء المؤسسة",
    "change": "التغيير",
    "mediaVisibility": "الظهور الإعلامي",
    "mediaVisibilityTrend": "تطور معدل الظهور عبر المنصات الإعلامية خلال",
    "mediaVisibilityIndex": "مؤشر الظهور",
    "updatedEvery": "تحديث كل",
    "hours": "ساعات",
    "hour": "ساعة",
    "engagementByPlatform": "التفاعل حسب المنصة",
    "engagementCount": "عدد التفاعلات على مختلف المنصات الاجتماعية",
    "engagement": "التفاعل",
    "totalEngagement": "إجمالي التفاعل",
    "sentimentDistribution": "توزيع المشاعر",
    "sentimentAnalysis": "تحليل المشاعر السائدة في المحتوى الرقمي",
    "sentimentTrends": "تطور المشاعر",
    "sentimentOverTime": "تغير المشاعر مع مرور الوقت",
    "positive": "إيجابي",
    "neutral": "محايد",
    "negative": "سلبي",
    "positiveChange": "تغير في المشاعر الإيجابية",
    "detailedEngagement": "تحليل التفاعل المفصل",
    "dataShownFor": "هذه البيانات تعرض خلال",
    "loading": "جاري تحميل بيانات الأداء المؤسسي...",
    "keyPerformanceIndicators": "مؤشرات الأداء الرئيسية",
    "measurePerformance": "قياس أداء المؤسسة مقارنة بالأهداف الاستراتيجية",
    "filterResults": "تصفية النتائج",
    "target": "الهدف",
    "dataUpdatedOn": "تم تحديث البيانات في"
  },`;
    
    // Find the right position to insert - before the last closing brace
    const lastBraceIndex = updatedArContent.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      updatedArContent = 
        updatedArContent.substring(0, lastBraceIndex) + 
        performanceAr +
        updatedArContent.substring(lastBraceIndex);
      
      // Write updated Arabic content
      fs.writeFileSync(TARGET_AR_PATH, updatedArContent);
      console.log("Arabic performance section added successfully!");
    }
  }

  console.log("\nAll translation sections have been successfully merged!");
}

// Run the function
mergeTranslations();