from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import requests
import json
import os
import datetime
from datetime import timedelta
import logging

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Base URL for the API - use environment variable or default
# In production environments, the server runs on port 8080
API_PORT = os.environ.get("API_PORT", "8080" if os.environ.get("NODE_ENV") == "production" else "5000")
API_HOST = os.environ.get("API_HOST", "localhost")
API_BASE_URL = f"http://{API_HOST}:{API_PORT}/api"

# Log the API base URL for debugging
logger.info(f"Using API base URL: {API_BASE_URL}")

# Helper functions for common operations
def get_date_range_from_text(date_range_text):
    """Convert natural language date ranges to actual dates"""
    now = datetime.datetime.now()
    
    if not date_range_text:
        return None, None
    
    date_range_text = date_range_text.lower()
    
    if "today" in date_range_text:
        return now.strftime("%Y-%m-%d"), now.strftime("%Y-%m-%d")
    elif "yesterday" in date_range_text:
        yesterday = now - timedelta(days=1)
        return yesterday.strftime("%Y-%m-%d"), yesterday.strftime("%Y-%m-%d")
    elif "last week" in date_range_text:
        start = now - timedelta(days=7)
        return start.strftime("%Y-%m-%d"), now.strftime("%Y-%m-%d")
    elif "last month" in date_range_text:
        start = now - timedelta(days=30)
        return start.strftime("%Y-%m-%d"), now.strftime("%Y-%m-%d")
    elif "q1" in date_range_text:
        year = now.year
        if "2023" in date_range_text:
            year = 2023
        elif "2024" in date_range_text:
            year = 2024
        elif "2025" in date_range_text:
            year = 2025
        return f"{year}-01-01", f"{year}-03-31"
    elif "q2" in date_range_text:
        year = now.year
        if "2023" in date_range_text:
            year = 2023
        elif "2024" in date_range_text:
            year = 2024
        elif "2025" in date_range_text:
            year = 2025
        return f"{year}-04-01", f"{year}-06-30"
    elif "q3" in date_range_text:
        year = now.year
        if "2023" in date_range_text:
            year = 2023
        elif "2024" in date_range_text:
            year = 2024
        elif "2025" in date_range_text:
            year = 2025
        return f"{year}-07-01", f"{year}-09-30"
    elif "q4" in date_range_text:
        year = now.year
        if "2023" in date_range_text:
            year = 2023
        elif "2024" in date_range_text:
            year = 2024
        elif "2025" in date_range_text:
            year = 2025
        return f"{year}-10-01", f"{year}-12-31"
    elif "this year" in date_range_text:
        return f"{now.year}-01-01", f"{now.year}-12-31"
    elif "next week" in date_range_text:
        start = now + timedelta(days=7)
        return now.strftime("%Y-%m-%d"), start.strftime("%Y-%m-%d")
    elif "tomorrow" in date_range_text:
        tomorrow = now + timedelta(days=1)
        return tomorrow.strftime("%Y-%m-%d"), tomorrow.strftime("%Y-%m-%d")
    
    # Default case - return None
    return None, None

def format_response_message(data, entity_type):
    """Format API response into readable message"""
    if not data or len(data) == 0:
        return f"No {entity_type} data found."
    
    message = f"Found {len(data)} {entity_type}:\n\n"
    
    # Show first 3 items
    for i, item in enumerate(data[:3]):
        item_name = item.get('name', item.get('title', f"Item {i+1}"))
        message += f"- {item_name}\n"
    
    if len(data) > 3:
        message += f"\nAnd {len(data) - 3} more {entity_type}. Check the dashboard for details."
    
    return message

class ActionGetSentimentAnalysis(Action):
    def name(self) -> Text:
        return "action_get_sentiment_analysis"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get slots
        topic = tracker.get_slot('topic')
        platform = tracker.get_slot('platform')
        timeframe = tracker.get_slot('timeframe')
        
        # Default message if no slots are filled
        if not topic and not platform and not timeframe:
            dispatcher.utter_message(text="I need more information to analyze sentiment. Can you tell me the topic, platform, or timeframe you're interested in?")
            return []
        
        try:
            # Build request parameters based on available slots
            params = {}
            if topic:
                params['topic'] = topic
            if platform:
                params['platform'] = platform
            if timeframe:
                params['timeframe'] = timeframe
                
            # Make request to sentiment analysis endpoint
            response = requests.post(
                f"{API_BASE_URL}/nlp/analyze-sentiment",
                json=params
            )
            
            if response.status_code == 200:
                sentiment_data = response.json()
                
                # Format response for user
                message = f"Sentiment analysis for "
                if topic:
                    message += f"topic '{topic}' "
                if platform:
                    message += f"on {platform} "
                if timeframe:
                    message += f"during {timeframe} "
                
                message += f"shows: \n"
                message += f"- Overall sentiment: {sentiment_data.get('overall_sentiment', 'Unknown')}\n"
                message += f"- Positive mentions: {sentiment_data.get('positive_count', 0)}\n"
                message += f"- Negative mentions: {sentiment_data.get('negative_count', 0)}\n"
                message += f"- Neutral mentions: {sentiment_data.get('neutral_count', 0)}"
                
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text="I couldn't retrieve sentiment data at this time. Please try again later.")
                
        except Exception as e:
            dispatcher.utter_message(text=f"I encountered an error analyzing sentiment: {str(e)}")
        
        return []


class ActionGetMediaCoverage(Action):
    def name(self) -> Text:
        return "action_get_media_coverage"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get slots
        topic = tracker.get_slot('topic')
        timeframe = tracker.get_slot('timeframe')
        keyword = tracker.get_slot('keyword')
        
        # Default message if no slots are filled
        if not topic and not timeframe and not keyword:
            dispatcher.utter_message(text="I need more information to check media coverage. Can you specify the topic, keyword, or timeframe?")
            return []
        
        try:
            # Build request parameters based on available slots
            params = {}
            if topic:
                params['topic'] = topic
            if timeframe:
                params['timeframe'] = timeframe
            if keyword:
                params['keyword'] = keyword
                
            # Make request to media coverage endpoint
            response = requests.get(
                f"{API_BASE_URL}/press-releases",
                params=params
            )
            
            if response.status_code == 200:
                coverage_data = response.json()
                
                # Format response for user
                if len(coverage_data) > 0:
                    message = f"Found {len(coverage_data)} media coverage items "
                    if topic:
                        message += f"about '{topic}' "
                    if keyword:
                        message += f"mentioning '{keyword}' "
                    if timeframe:
                        message += f"during {timeframe} "
                    
                    message += "\n\nHere are some highlights:\n"
                    
                    # Show up to 3 coverage items
                    for i, item in enumerate(coverage_data[:3]):
                        message += f"- {item.get('title', 'Untitled')}: {item.get('summary', 'No summary available')[:100]}...\n"
                    
                    if len(coverage_data) > 3:
                        message += f"\nAnd {len(coverage_data) - 3} more items. Check the dashboard for complete results."
                else:
                    message = "I couldn't find any media coverage matching your criteria."
                
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text="I couldn't retrieve media coverage data at this time. Please try again later.")
                
        except Exception as e:
            dispatcher.utter_message(text=f"I encountered an error getting media coverage: {str(e)}")
        
        return []


class ActionGetContentMetrics(Action):
    def name(self) -> Text:
        return "action_get_content_metrics"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get slots
        platform = tracker.get_slot('platform')
        topic = tracker.get_slot('topic')
        timeframe = tracker.get_slot('timeframe')
        
        # Default message if no slots are filled
        if not platform and not topic and not timeframe:
            dispatcher.utter_message(text="I need more information to analyze content metrics. Can you specify the platform, topic, or timeframe?")
            return []
        
        try:
            # Build request parameters based on available slots
            params = {}
            if platform:
                params['platform'] = platform
            if topic:
                params['topic'] = topic
            if timeframe:
                params['timeframe'] = timeframe
                
            # Make request to social posts endpoint for metrics
            response = requests.get(
                f"{API_BASE_URL}/social-posts",
                params=params
            )
            
            if response.status_code == 200:
                posts_data = response.json()
                
                # Calculate some basic metrics
                engagement_total = sum(post.get('engagement', 0) for post in posts_data)
                likes_total = sum(post.get('likes', 0) for post in posts_data)
                shares_total = sum(post.get('shares', 0) for post in posts_data)
                comments_total = sum(post.get('comments', 0) for post in posts_data)
                
                # Format response for user
                message = f"Content metrics "
                if platform:
                    message += f"for {platform} "
                if topic:
                    message += f"on topic '{topic}' "
                if timeframe:
                    message += f"during {timeframe} "
                
                message += f":\n\n"
                message += f"- Total posts: {len(posts_data)}\n"
                message += f"- Total engagement: {engagement_total}\n"
                message += f"- Likes: {likes_total}\n"
                message += f"- Shares: {shares_total}\n"
                message += f"- Comments: {comments_total}\n"
                
                if len(posts_data) > 0:
                    message += f"\nAverage engagement per post: {engagement_total / len(posts_data):.2f}"
                
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text="I couldn't retrieve content metrics at this time. Please try again later.")
                
        except Exception as e:
            dispatcher.utter_message(text=f"I encountered an error analyzing content metrics: {str(e)}")
        
        return []


class ActionGenerateKpiReport(Action):
    def name(self) -> Text:
        return "action_generate_kpi_report"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get slots for report customization
        date_range = tracker.get_slot('date_range')
        format = tracker.get_slot('format')
        metric_type = tracker.get_slot('metric_type')
        
        try:
            # Parse date range from text if provided
            start_date, end_date = get_date_range_from_text(date_range)
            
            # Build request parameters
            params = {
                'report_type': 'kpi',
                'format': format or 'pdf'  # Default to PDF if not specified
            }
            
            if start_date and end_date:
                params['start_date'] = start_date
                params['end_date'] = end_date
            
            if metric_type:
                params['metrics'] = metric_type
            
            # Make API request to generate report
            response = requests.post(
                f"{API_BASE_URL}/reports/generate",
                json=params
            )
            
            if response.status_code == 200:
                report_data = response.json()
                report_url = report_data.get('report_url')
                
                if report_url:
                    message = f"Your KPI report has been generated! You can download it here: {report_url}"
                    if format:
                        message += f"\nFormat: {format.upper()}"
                    if date_range:
                        message += f"\nTime period: {date_range}"
                    if metric_type:
                        message += f"\nMetrics included: {metric_type}"
                    
                    dispatcher.utter_message(text=message)
                else:
                    dispatcher.utter_message(text="Your report has been generated and is available in the Reports section of the dashboard.")
            else:
                dispatcher.utter_message(text="I couldn't generate the KPI report at this time. Please try again later or check the Reports section in the dashboard.")
        
        except Exception as e:
            logger.error(f"Error generating KPI report: {str(e)}")
            dispatcher.utter_message(text="I encountered an error while generating your KPI report. Please try again later.")
        
        return []


class ActionSetKeywordAlert(Action):
    def name(self) -> Text:
        return "action_set_keyword_alert"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get slots
        keyword = tracker.get_slot('keyword')
        alert_threshold = tracker.get_slot('alert_threshold')
        category = tracker.get_slot('category')
        
        if not keyword:
            dispatcher.utter_message(text="I need to know which keyword you want to track. Please provide a keyword to set up the alert.")
            return []
        
        try:
            # Build request parameters
            params = {
                'word': keyword,
                'isActive': True
            }
            
            if category:
                params['category'] = category
            
            if alert_threshold:
                params['alertThreshold'] = int(alert_threshold)
            else:
                params['alertThreshold'] = 5  # Default threshold
            
            # Make API request to create keyword alert
            response = requests.post(
                f"{API_BASE_URL}/keywords",
                json=params
            )
            
            if response.status_code in [200, 201]:
                keyword_data = response.json()
                
                message = f"Alert set for keyword '{keyword}'. "
                message += f"You'll be notified when mentions exceed {params['alertThreshold']} occurrences."
                
                if category:
                    message += f"\nCategory: {category}"
                
                message += "\nYou can manage your alerts in the Settings section."
                
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text="I couldn't set up the keyword alert at this time. Please try again later or set it up manually in the Settings section.")
        
        except Exception as e:
            logger.error(f"Error setting keyword alert: {str(e)}")
            dispatcher.utter_message(text="I encountered an error while setting up your alert. Please try again or use the Settings section to create an alert manually.")
        
        return []


class ActionAddJournalistContact(Action):
    def name(self) -> Text:
        return "action_add_journalist_contact"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get slots
        journalist_name = tracker.get_slot('journalist_name')
        journalist_source = tracker.get_slot('journalist_source')
        email = tracker.get_slot('email')
        
        if not journalist_name:
            dispatcher.utter_message(text="I need the journalist's name to add them to your contacts. Please provide a name.")
            return []
        
        try:
            # Build request parameters
            params = {
                'name': journalist_name,
                'isActive': True
            }
            
            if journalist_source:
                params['organization'] = journalist_source
            
            if email:
                params['email'] = email
            
            # Make API request to create journalist contact
            response = requests.post(
                f"{API_BASE_URL}/journalists",
                json=params
            )
            
            if response.status_code in [200, 201]:
                journalist_data = response.json()
                
                message = f"Added journalist '{journalist_name}' to your contacts."
                
                if journalist_source:
                    message += f"\nOrganization: {journalist_source}"
                
                message += "\nYou can view and manage journalist contacts in the Media Center section."
                
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text="I couldn't add the journalist contact at this time. Please try again later or add them manually in the Media Center section.")
        
        except Exception as e:
            logger.error(f"Error adding journalist contact: {str(e)}")
            dispatcher.utter_message(text="I encountered an error while adding the journalist contact. Please try again or add them manually in the Media Center section.")
        
        return []


class ActionPublishSocialPost(Action):
    def name(self) -> Text:
        return "action_publish_social_post"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get slots
        post_content = tracker.get_slot('post_content')
        platform = tracker.get_slot('platform')
        
        if not post_content:
            dispatcher.utter_message(text="What would you like to post? Please provide the content for your social media post.")
            return []
        
        if not platform:
            dispatcher.utter_message(text="Which platform would you like to post to? Please specify the social media platform.")
            return []
        
        try:
            # Build request parameters
            params = {
                'content': post_content,
                'platform': platform.lower(),
                'status': 'published'
            }
            
            # Make API request to create social post
            response = requests.post(
                f"{API_BASE_URL}/social-posts",
                json=params
            )
            
            if response.status_code in [200, 201]:
                post_data = response.json()
                
                message = f"Your post has been published to {platform}."
                message += "\nYou can view and manage your posts in the Social Media dashboard."
                
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text="I couldn't publish your post at this time. Please try again later or publish it manually from the Social Media dashboard.")
        
        except Exception as e:
            logger.error(f"Error publishing social post: {str(e)}")
            dispatcher.utter_message(text="I encountered an error while publishing your post. Please try again or publish it manually from the Social Media dashboard.")
        
        return []


class ActionScheduleSocialPost(Action):
    def name(self) -> Text:
        return "action_schedule_social_post"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get slots
        post_content = tracker.get_slot('post_content')
        platform = tracker.get_slot('platform')
        post_schedule_time = tracker.get_slot('post_schedule_time')
        date_range = tracker.get_slot('date_range')  # Used for the date of scheduling
        
        if not post_content:
            dispatcher.utter_message(text="What would you like to schedule for posting? Please provide the content.")
            return []
        
        if not platform:
            dispatcher.utter_message(text="Which platform would you like to schedule the post for? Please specify the social media platform.")
            return []
        
        try:
            # Parse date from date_range
            schedule_date, _ = get_date_range_from_text(date_range)
            schedule_date = schedule_date or datetime.datetime.now().strftime("%Y-%m-%d")
            
            # Combine date and time if provided
            schedule_datetime = schedule_date
            if post_schedule_time:
                schedule_datetime = f"{schedule_date}T{post_schedule_time}"
            
            # Build request parameters
            params = {
                'content': post_content,
                'platform': platform.lower(),
                'status': 'scheduled',
                'scheduledFor': schedule_datetime
            }
            
            # Make API request to create scheduled social post
            response = requests.post(
                f"{API_BASE_URL}/social-posts",
                json=params
            )
            
            if response.status_code in [200, 201]:
                post_data = response.json()
                
                message = f"Your post has been scheduled for publication on {platform}."
                
                if date_range and post_schedule_time:
                    message += f"\nScheduled for: {date_range} at {post_schedule_time}"
                elif date_range:
                    message += f"\nScheduled for: {date_range}"
                
                message += "\nYou can view and manage your scheduled posts in the Social Media dashboard."
                
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text="I couldn't schedule your post at this time. Please try again later or schedule it manually from the Social Media dashboard.")
        
        except Exception as e:
            logger.error(f"Error scheduling social post: {str(e)}")
            dispatcher.utter_message(text="I encountered an error while scheduling your post. Please try again or schedule it manually from the Social Media dashboard.")
        
        return []


class ActionCustomizeReport(Action):
    def name(self) -> Text:
        return "action_customize_report"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get slots for report customization
        report_type = tracker.get_slot('report_type') or "performance"
        date_range = tracker.get_slot('date_range')
        format = tracker.get_slot('format') or "pdf"
        metric_type = tracker.get_slot('metric_type')
        
        try:
            # Parse date range from text if provided
            start_date, end_date = get_date_range_from_text(date_range)
            
            # Build request parameters
            params = {
                'report_type': report_type,
                'format': format
            }
            
            if start_date and end_date:
                params['start_date'] = start_date
                params['end_date'] = end_date
            
            if metric_type:
                params['metrics'] = metric_type
            
            # Make API request to customize report
            response = requests.post(
                f"{API_BASE_URL}/reports/customize",
                json=params
            )
            
            if response.status_code == 200:
                report_data = response.json()
                report_url = report_data.get('report_url')
                
                if report_url:
                    message = f"Your custom report has been generated! You can download it here: {report_url}"
                    message += f"\nFormat: {format.upper()}"
                    if date_range:
                        message += f"\nTime period: {date_range}"
                    if metric_type:
                        message += f"\nMetrics included: {metric_type}"
                    
                    dispatcher.utter_message(text=message)
                else:
                    dispatcher.utter_message(text="Your custom report has been created and is available in the Reports section of the dashboard.")
            else:
                dispatcher.utter_message(text="I couldn't customize the report at this time. Please try again later or use the Reports section in the dashboard to create a custom report.")
        
        except Exception as e:
            logger.error(f"Error customizing report: {str(e)}")
            dispatcher.utter_message(text="I encountered an error while customizing your report. Please try again later or use the Reports section to create one manually.")
        
        return []