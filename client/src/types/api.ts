/**
 * استجابة API ناجحة
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  timestamp: string; // ISO string، دائماً موجود
}

/**
 * استجابة API فاشلة
 */
export interface ApiFailureResponse {
  success: false;
  error: string;      // نص الخطأ
  code?: string;      // كود الخطأ إن وجد
  timestamp: string;  // ISO string، دائماً موجود
}

/**
 * أي استجابة من الـ API
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiFailureResponse;

/**
 * بنية إحصائيات المنصات
 */
export interface PlatformStats {
  platform: string;      // اسم المنصة
  count: number;         // إجمالي العدد للفترة الحالية
  trend?: number;        // اتجاه (مثلاً: +10%)
  change?: number;       // الفرق المطلق (مثلاً: +5)
  previousCount?: number;// العدد في الفترة السابقة
}

/**
 * استجابة خطأ مجانية من API (لأغراض خاصة)
 */
export interface ApiError {
  status: number;        // HTTP status code
  message: string;       // نص الرسالة
  code?: string;         // كود داخلي/خارجي للخطأ
  timestamp: string;     // ISO string
}

/**
 * معلمات التصفح (pagination) للطلبات
 */
export interface PaginationParams {
  page: number;          // الصفحة الحالية (1-based)
  limit: number;         // عدد العناصر في الصفحة
  orderBy?: string;      // حقل للترتيب
  orderDir?: 'asc' | 'desc'; // اتجاه الترتيب
}

/**
 * بنية الاستجابة المصفحّة (paginated)
 */
export interface PaginatedResponse<T> {
  items: T[];            // البيانات في الصفحة الحالية
  total: number;         // إجمالي عدد العناصر عبر كل الصفحات
  page: number;          // الصفحة الحالية
  limit: number;         // حجم الصفحة
  totalPages: number;    // إجمالي عدد الصفحات
  hasMore: boolean;      // هل هناك صفحات لاحقة؟
}
