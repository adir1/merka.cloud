# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "youtube-transcript-api",
#     "google-api-python-client",
# ]
# ///

import argparse
import os
import re
import sys
from datetime import timedelta
from youtube_transcript_api import YouTubeTranscriptApi
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# You'll need to set your YouTube Data API key as an environment variable
# Get one from: https://console.cloud.google.com/apis/credentials
API_KEY = os.environ.get('YOUTUBE_API_KEY')

def sanitize_filename(name):
    """Sanitize string to be safe for filenames."""
    # Remove invalid characters
    name = re.sub(r'[<>:"/\\|?*]', '', name)
    # Replace whitespace with underscores
    name = name.replace(' ', '_')
    return name

def format_duration_minutes(seconds):
    """Convert seconds to total minutes."""
    if not seconds:
        return 0
    return int(seconds / 60)

def should_skip_video(title):
    """Check if video should be skipped based on title."""
    if not title:
        return False
    upper_title = title.upper()
    return "PREVIEW" in upper_title or "TEASER" in upper_title or "TRAILER" in upper_title

def parse_duration(duration_str):
    """Parse ISO 8601 duration string (e.g., PT1H30M15S) to seconds."""
    if not duration_str:
        return 0
    
    # Remove PT prefix
    duration_str = duration_str.replace('PT', '')
    
    hours = 0
    minutes = 0
    seconds = 0
    
    # Extract hours
    if 'H' in duration_str:
        hours = int(duration_str.split('H')[0])
        duration_str = duration_str.split('H')[1]
    
    # Extract minutes
    if 'M' in duration_str:
        minutes = int(duration_str.split('M')[0])
        duration_str = duration_str.split('M')[1]
    
    # Extract seconds
    if 'S' in duration_str:
        seconds = int(duration_str.split('S')[0])
    
    return hours * 3600 + minutes * 60 + seconds

def get_channel_id_from_handle(youtube, handle):
    """Convert a channel handle (@username) to channel ID."""
    try:
        # Remove @ if present
        handle = handle.lstrip('@')
        
        # Search for the channel
        request = youtube.search().list(
            part="snippet",
            q=handle,
            type="channel",
            maxResults=1
        )
        response = request.execute()
        
        if response['items']:
            return response['items'][0]['snippet']['channelId']
        else:
            print(f"Could not find channel for handle: @{handle}")
            return None
    except HttpError as e:
        print(f"Error fetching channel ID: {e}")
        return None

def get_channel_videos(youtube, channel_id):
    """Fetch all videos from a channel using YouTube Data API."""
    videos = []
    
    try:
        # Get uploads playlist ID
        request = youtube.channels().list(
            part="contentDetails",
            id=channel_id
        )
        response = request.execute()
        
        if not response['items']:
            print(f"Channel not found: {channel_id}")
            return videos
        
        uploads_playlist_id = response['items'][0]['contentDetails']['relatedPlaylists']['uploads']
        
        # Fetch all videos from uploads playlist
        next_page_token = None
        
        while True:
            playlist_request = youtube.playlistItems().list(
                part="snippet,contentDetails",
                playlistId=uploads_playlist_id,
                maxResults=50,
                pageToken=next_page_token
            )
            playlist_response = playlist_request.execute()
            
            # Get video IDs for this page
            video_ids = [item['contentDetails']['videoId'] for item in playlist_response['items']]
            
            # Fetch detailed info including duration
            videos_request = youtube.videos().list(
                part="snippet,contentDetails",
                id=','.join(video_ids)
            )
            videos_response = videos_request.execute()
            
            for video in videos_response['items']:
                video_info = {
                    'id': video['id'],
                    'title': video['snippet']['title'],
                    'duration': parse_duration(video['contentDetails']['duration'])
                }
                videos.append(video_info)
            
            next_page_token = playlist_response.get('nextPageToken')
            
            if not next_page_token:
                break
                
    except HttpError as e:
        print(f"Error fetching channel videos: {e}")
        sys.exit(1)
    
    return videos

def get_transcript_text(video_id):
    """Fetch transcript for a video using youtube-transcript-api."""
    try:
        # Try to get the transcript (prefer English)
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        
        # Try to find English transcript (manual or auto-generated)
        try:
            transcript = transcript_list.find_transcript(['en'])
        except:
            # If no English transcript, try to get any available and translate
            transcript = transcript_list.find_generated_transcript(['en'])
        
        # Fetch the actual transcript
        transcript_data = transcript.fetch()
        
        # Extract just the text
        text = ' '.join([entry['text'] for entry in transcript_data])
        
        return text
        
    except Exception as e:
        # No transcript available
        return None

def download_transcripts(channel_id_or_url):
    if not API_KEY:
        print("Error: YOUTUBE_API_KEY environment variable not set.")
        print("Get an API key from: https://console.cloud.google.com/apis/credentials")
        sys.exit(1)
    
    # Initialize YouTube API client
    youtube = build('youtube', 'v3', developerKey=API_KEY)
    
    # Determine if input is a full URL or just an ID
    if "youtube.com" in channel_id_or_url or "youtu.be" in channel_id_or_url:
        # Extract channel ID from URL
        if "/channel/" in channel_id_or_url:
            channel_id = channel_id_or_url.split('/channel/')[-1].split('/')[0]
            folder_name = channel_id
        elif "/@" in channel_id_or_url:
            handle = channel_id_or_url.split('/@')[-1].split('/')[0]
            channel_id = get_channel_id_from_handle(youtube, handle)
            folder_name = f"@{handle}"
        else:
            print("Could not parse channel URL")
            sys.exit(1)
    else:
        # Assume it's a channel ID or handle
        if channel_id_or_url.startswith('@'):
            channel_id = get_channel_id_from_handle(youtube, channel_id_or_url)
            folder_name = channel_id_or_url
        else:
            channel_id = channel_id_or_url
            folder_name = channel_id_or_url

    if not channel_id:
        print("Could not determine channel ID")
        sys.exit(1)

    # Create directory
    if not os.path.exists(folder_name):
        os.makedirs(folder_name)
        print(f"Created directory: {folder_name}")
    else:
        print(f"Using existing directory: {folder_name}")

    print(f"Fetching video list from channel {channel_id}...")
    videos = get_channel_videos(youtube, channel_id)
    print(f"Found {len(videos)} videos. Filtering and starting transcript download...")

    downloads_this_session = 0
    max_downloads_per_session = 10

    for video in videos:
        # Check if we've hit the download limit
        if downloads_this_session >= max_downloads_per_session:
            print(f"\nReached download limit of {max_downloads_per_session} for this session. Stopping.")
            break
            
        video_id = video.get('id')
        title = video.get('title', 'Unknown_Title')
        duration = video.get('duration')  # seconds
        
        if not video_id:
            continue

        if should_skip_video(title):
            print(f"Skipping (Preview/Teaser): {title}")
            continue

        safe_title = sanitize_filename(title)
        duration_mins = format_duration_minutes(duration)
        filename = f"{video_id}_{safe_title}_{duration_mins}_mins.txt"
        filepath = os.path.join(folder_name, filename)

        # Check if any file with this video ID already exists
        existing_files = [f for f in os.listdir(folder_name) if f.startswith(f"{video_id}_")]
        if existing_files:
            print(f"Skipping {filename} (video ID already exists: {existing_files[0]})")
            continue

        print(f"Processing: {title}...")

        try:
            transcript_text = get_transcript_text(video_id)
            
            if transcript_text:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(transcript_text)
                print(f"  -> Saved to {filename}")
                downloads_this_session += 1
            else:
                print(f"  -> No transcript available for {video_id}")

        except Exception as e:
            print(f"  -> Error downloading transcript for {video_id}: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download all transcripts from a YouTube channel.")
    parser.add_argument("channel_id", help="YouTube Channel ID, Handle (e.g. @Handle), or URL")
    
    args = parser.parse_args()
    
    download_transcripts(args.channel_id)
