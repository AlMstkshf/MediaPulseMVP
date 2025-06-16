import Mailjet from 'node-mailjet';
// Use node-fetch for Mailgun HTTP API calls
import fetch from 'node-fetch';

// Email provider types
type EmailProvider = 'mailjet' | 'mailgun';

// Default email provider
const DEFAULT_PROVIDER: EmailProvider = 'mailjet';

// Initialize Mailjet client with API key and secret provided by user
const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY || '6af7f21ddbc71075bc6f604601a991fb',
  apiSecret: process.env.MAILJET_SECRET_KEY || '15ef339d2210da0d717919643a9ffcec'
});

// Mailgun configuration
const mailgunConfig = {
  apiKey: process.env.MAILGUN_API_KEY || '',
  domain: process.env.MAILGUN_DOMAIN || 'mg.yourdomain.com',
  region: process.env.MAILGUN_REGION || 'us', // or 'eu' for EU region
};

console.log("Email clients configured");

// Helper function to check if email services are enabled
const isEmailServiceEnabled = (provider: EmailProvider = DEFAULT_PROVIDER): boolean => {
  if (provider === 'mailjet') {
    return Boolean(process.env.MAILJET_API_KEY || process.env.MAILJET_SECRET_KEY);
  } else if (provider === 'mailgun') {
    return Boolean(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN);
  }
  return false;
}

interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send an email via Mailgun API
 * @param options Email options including to, from, subject, and content
 * @returns Promise that resolves to true if email was sent successfully
 */
async function sendMailgunEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Check if Mailgun is configured
    if (!mailgunConfig.apiKey || !mailgunConfig.domain) {
      console.error('Mailgun is not properly configured');
      return false;
    }
    
    // Create API URL based on region
    const apiUrl = mailgunConfig.region === 'eu'
      ? `https://api.eu.mailgun.net/v3/${mailgunConfig.domain}/messages`
      : `https://api.mailgun.net/v3/${mailgunConfig.domain}/messages`;
    
    // Create form data
    const formData = new URLSearchParams();
    formData.append('from', `Media Intelligence System <${options.from}>`);
    formData.append('to', options.to);
    formData.append('subject', options.subject);
    
    if (options.text) {
      formData.append('text', options.text);
    }
    
    if (options.html) {
      formData.append('html', options.html);
    }
    
    // Encode API key for basic auth
    const auth = Buffer.from(`api:${mailgunConfig.apiKey}`).toString('base64');
    
    // Send request to Mailgun API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mailgun API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`Email sent to ${options.to} successfully via Mailgun`);
    return true;
  } catch (error) {
    console.error('Failed to send email via Mailgun:', error);
    return false;
  }
}

/**
 * Send an email using Mailjet
 * @param options Email options including to, from, subject, and content
 * @returns Promise that resolves to true if email was sent successfully
 */
async function sendMailjetEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Create the email request for Mailjet
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: options.from,
            Name: "Media Intelligence System"
          },
          To: [
            {
              Email: options.to,
              Name: options.to.split('@')[0]  // Use part before @ as name
            }
          ],
          Subject: options.subject,
          TextPart: options.text || "",
          HTMLPart: options.html || ""
        }
      ]
    });
    
    // Send the email
    const response = await request;
    console.log(`Email sent to ${options.to} successfully via Mailjet`);
    return true;
  } catch (error) {
    console.error('Failed to send email via Mailjet:', error);
    return false;
  }
}

/**
 * Send an email using the configured email provider
 * @param options Email options including to, from, subject, and content
 * @param provider Optional email provider to use (defaults to configured default)
 * @returns Promise that resolves to true if email was sent successfully
 */
export async function sendEmail(
  options: EmailOptions, 
  provider: EmailProvider = DEFAULT_PROVIDER
): Promise<boolean> {
  try {
    // Log the email preparation
    console.log("Preparing to send email:", {
      to: options.to,
      from: options.from,
      subject: options.subject,
      provider
    });
    
    // Try the specified provider first
    let success = false;
    
    if (provider === 'mailgun' && isEmailServiceEnabled('mailgun')) {
      success = await sendMailgunEmail(options);
    } else if (provider === 'mailjet' && isEmailServiceEnabled('mailjet')) {
      success = await sendMailjetEmail(options);
    }
    
    // If the specified provider failed, try the other one as fallback
    if (!success) {
      const fallbackProvider = provider === 'mailgun' ? 'mailjet' : 'mailgun';
      console.log(`Primary email provider ${provider} failed, trying ${fallbackProvider}`);
      
      if (fallbackProvider === 'mailgun' && isEmailServiceEnabled('mailgun')) {
        success = await sendMailgunEmail(options);
      } else if (fallbackProvider === 'mailjet' && isEmailServiceEnabled('mailjet')) {
        success = await sendMailjetEmail(options);
      }
    }
    
    // If both providers failed, log an error
    if (!success) {
      console.error('All email providers failed');
    }
    
    return success;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Send a keyword alert notification email
 * @param keyword The keyword that triggered the alert
 * @param postContent The content that contains the keyword
 * @param recipientEmail The email address to send the notification to
 * @param language The preferred language for the email (en or ar)
 * @returns Promise that resolves to true if email was sent successfully
 */
export async function sendKeywordAlertEmail(
  keyword: string,
  postContent: string,
  recipientEmail: string,
  language: string = 'en'
): Promise<boolean> {
  const isArabic = language === 'ar';
  
  const subject = isArabic
    ? `تنبيه للكلمة الرئيسية: ${keyword}`
    : `Keyword Alert: ${keyword}`;
  
  const html = isArabic
    ? `
      <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif;">
        <h2>تنبيه للكلمة الرئيسية</h2>
        <p>تم اكتشاف الكلمة الرئيسية <strong>${keyword}</strong> في المحتوى التالي:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          ${postContent}
        </div>
        <p>يرجى تسجيل الدخول إلى لوحة التحكم للاطلاع على مزيد من التفاصيل.</p>
        <p>مع أطيب التحيات،<br>نظام المراقبة الإعلامية</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif;">
        <h2>Keyword Alert Notification</h2>
        <p>The keyword <strong>${keyword}</strong> has been detected in the following content:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          ${postContent}
        </div>
        <p>Please log in to the dashboard to view more details.</p>
        <p>Best regards,<br>Media Intelligence System</p>
      </div>
    `;
  
  const text = isArabic
    ? `تنبيه للكلمة الرئيسية: ${keyword}\n\nتم اكتشاف الكلمة الرئيسية في المحتوى التالي:\n\n${postContent}\n\nيرجى تسجيل الدخول إلى لوحة التحكم للاطلاع على مزيد من التفاصيل.`
    : `Keyword Alert: ${keyword}\n\nThe keyword has been detected in the following content:\n\n${postContent}\n\nPlease log in to the dashboard to view more details.`;
  
  return sendEmail({
    to: recipientEmail,
    from: process.env.EMAIL_FROM || 'noreply@mediaintelligence.app',
    subject,
    text,
    html,
  });
}

/**
 * Send a sentiment alert notification email
 * @param changes The summary of sentiment changes
 * @param recipientEmail The email address to send the notification to
 * @param language The preferred language for the email (en or ar)
 * @returns Promise that resolves to true if email was sent successfully
 */
export async function sendSentimentAlertEmail(
  changes: string,
  recipientEmail: string,
  language: string = 'en'
): Promise<boolean> {
  const isArabic = language === 'ar';
  
  const subject = isArabic
    ? `تنبيه تغييرات المشاعر على وسائل التواصل الاجتماعي`
    : `Sentiment Shift Alert - Social Media Monitoring`;
  
  const html = isArabic
    ? `
      <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif;">
        <h2>تنبيه: تغييرات مهمة في تحليل المشاعر</h2>
        <p>تم رصد تغييرات مهمة في تحليل المشاعر:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>${changes}</strong></p>
        </div>
        <p>قد يشير هذا التغيير إلى تحول مهم في موقف الجمهور تجاه المواضيع المحددة المراقبة.</p>
        <p>يرجى تسجيل الدخول إلى لوحة التحكم للاطلاع على مزيد من التفاصيل وإجراء تحليل أكثر تفصيلاً.</p>
        <p>مع أطيب التحيات،<br>نظام المراقبة الإعلامية</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif;">
        <h2>Alert: Significant Sentiment Shifts Detected</h2>
        <p>The system has detected significant changes in sentiment analysis:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>${changes}</strong></p>
        </div>
        <p>This shift may indicate an important change in public attitude towards the monitored topics.</p>
        <p>Please log in to the dashboard to view more detailed analysis and take appropriate action.</p>
        <p>Best regards,<br>Media Intelligence System</p>
      </div>
    `;
  
  const text = isArabic
    ? `تنبيه: تغييرات مهمة في تحليل المشاعر\n\nتم رصد تغييرات مهمة في تحليل المشاعر:\n\n${changes}\n\nقد يشير هذا التغيير إلى تحول مهم في موقف الجمهور تجاه المواضيع المحددة المراقبة.\n\nيرجى تسجيل الدخول إلى لوحة التحكم للاطلاع على مزيد من التفاصيل.`
    : `Alert: Significant Sentiment Shifts Detected\n\nThe system has detected significant changes in sentiment analysis:\n\n${changes}\n\nThis shift may indicate an important change in public attitude towards the monitored topics.\n\nPlease log in to the dashboard to view more detailed analysis.`;
  
  return sendEmail({
    to: recipientEmail,
    from: process.env.EMAIL_FROM || 'noreply@mediaintelligence.app',
    subject,
    text,
    html,
  });
}

/**
 * Send a weekly report summary email
 * @param reportData The data to include in the report
 * @param recipientEmail The email address to send the report to
 * @param language The preferred language for the email (en or ar)
 * @returns Promise that resolves to true if email was sent successfully
 */
export async function sendWeeklyReportEmail(
  reportData: any,
  recipientEmail: string,
  language: string = 'en'
): Promise<boolean> {
  const isArabic = language === 'ar';
  
  const subject = isArabic
    ? 'التقرير الأسبوعي للذكاء الإعلامي'
    : 'Weekly Media Intelligence Report';
  
  // Generate sentiment statistics HTML
  const sentimentStatsHtml = isArabic
    ? `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">إيجابي</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${reportData.positive || 0}%</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">محايد</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${reportData.neutral || 0}%</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">سلبي</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${reportData.negative || 0}%</td>
      </tr>
    `
    : `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">Positive</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${reportData.positive || 0}%</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">Neutral</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${reportData.neutral || 0}%</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">Negative</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${reportData.negative || 0}%</td>
      </tr>
    `;
  
  // Generate top keywords HTML
  let topKeywordsHtml = '';
  if (reportData.keywords && Array.isArray(reportData.keywords)) {
    reportData.keywords.forEach((keyword: string) => {
      topKeywordsHtml += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${keyword}</td>
        </tr>
      `;
    });
  }
  
  const html = isArabic
    ? `
      <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif;">
        <h2>التقرير الأسبوعي للذكاء الإعلامي</h2>
        <p>مرحبًا،</p>
        <p>فيما يلي ملخص التقرير الأسبوعي الخاص بك:</p>
        
        <h3>إحصائيات المشاعر</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">المشاعر</th>
              <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">النسبة</th>
            </tr>
          </thead>
          <tbody>
            ${sentimentStatsHtml}
          </tbody>
        </table>
        
        <h3>أهم الكلمات الرئيسية</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">الكلمة الرئيسية</th>
            </tr>
          </thead>
          <tbody>
            ${topKeywordsHtml}
          </tbody>
        </table>
        
        <p style="margin-top: 20px;">يرجى تسجيل الدخول إلى لوحة التحكم للاطلاع على التقرير الكامل.</p>
        <p>مع أطيب التحيات،<br>نظام المراقبة الإعلامية</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif;">
        <h2>Weekly Media Intelligence Report</h2>
        <p>Hello,</p>
        <p>Here is your weekly report summary:</p>
        
        <h3>Sentiment Statistics</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Sentiment</th>
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${sentimentStatsHtml}
          </tbody>
        </table>
        
        <h3>Top Keywords</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Keyword</th>
            </tr>
          </thead>
          <tbody>
            ${topKeywordsHtml}
          </tbody>
        </table>
        
        <p style="margin-top: 20px;">Please log in to the dashboard to view the full report.</p>
        <p>Best regards,<br>Media Intelligence System</p>
      </div>
    `;
  
  const text = isArabic
    ? `التقرير الأسبوعي للذكاء الإعلامي\n\nإحصائيات المشاعر:\nإيجابي: ${reportData.positive || 0}%\nمحايد: ${reportData.neutral || 0}%\nسلبي: ${reportData.negative || 0}%\n\nأهم الكلمات الرئيسية:\n${reportData.keywords ? reportData.keywords.join('\n') : ''}\n\nيرجى تسجيل الدخول إلى لوحة التحكم للاطلاع على التقرير الكامل.`
    : `Weekly Media Intelligence Report\n\nSentiment Statistics:\nPositive: ${reportData.positive || 0}%\nNeutral: ${reportData.neutral || 0}%\nNegative: ${reportData.negative || 0}%\n\nTop Keywords:\n${reportData.keywords ? reportData.keywords.join('\n') : ''}\n\nPlease log in to the dashboard to view the full report.`;
  
  return sendEmail({
    to: recipientEmail,
    from: process.env.EMAIL_FROM || 'noreply@mediaintelligence.app',
    subject,
    text,
    html,
  });
}