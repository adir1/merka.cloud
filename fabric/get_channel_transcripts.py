# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "yt-dlp",
# ]
# ///

import argparse
import os
import re
import sys
import glob
from datetime import timedelta
import yt_dlp

def sanitize_filename(name):
    """Sanitize string to be safe for filenames."""
    # Remove invalid characters
    name = re.sub(r'[<>:"/\\|?*]', '', name)
    # Replace whitespace with underscores
    name = name.replace(' ', '_')
    return name

def format_duration(seconds):
    """Format seconds into a readable string (e.g., 1h30m)."""
    if not seconds:
        return "0s"
    return str(timedelta(seconds=int(seconds)))

def should_skip_video(title):
    """Check if video should be skipped based on title."""
    if not title:
        return False
    upper_title = title.upper()
    return "PREVIEW" in upper_title or "TEASER" in upper_title or "TRAILER" in upper_title

def clean_vtt_content(vtt_content):
    """Extract raw text from VTT content."""
    lines = vtt_content.splitlines()
    text_lines = []
    seen_lines = set() # To handle potential duplicates if they appear in blocks
    
    for line in lines:
        line = line.strip()
        # Skip empty lines, header, and timestamp lines
        if not line:
            continue
        if line == "WEBVTT":
            continue
        if "-->" in line:
            continue
        # Skip numeric identifiers often found in VTT
        if line.isdigit():
            continue
            
        # Simple deduplication for consecutive identical lines which sometimes happens
        # But for now, just append. TextFormatter usually just appends.
        # Actually, let's just append.
        text_lines.append(line)
        
    return " ".join(text_lines)

def get_channel_videos(channel_url):
    """Fetch all videos from a channel using yt-dlp."""
    ydl_opts = {
        'extract_flat': True,  # Don't download, just extract metadata
        'quiet': True,
        'ignoreerrors': True,
    }
    
    videos = []
    print(f"Fetching video list from {channel_url}...")
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            result = ydl.extract_info(channel_url, download=False)
            
            if 'entries' in result:
                # It's a playlist or channel
                for entry in result['entries']:
                    if entry:
                        videos.append(entry)
            else:
                # It's a single video
                videos.append(result)
                
        except Exception as e:
            print(f"Error fetching channel info: {e}")
            sys.exit(1)
            
    return videos

def download_transcripts(channel_id_or_url):
    # Determine if input is a full URL or just an ID
    if "youtube.com" in channel_id_or_url or "youtu.be" in channel_id_or_url:
        channel_url = channel_id_or_url
        # Try to extract a folder name from the URL if possible, otherwise use a generic one
        folder_name = channel_id_or_url.split('/')[-1]
    else:
        # Assume it's a channel ID or handle
        if channel_id_or_url.startswith('@'):
            channel_url = f"https://www.youtube.com/{channel_id_or_url}"
            folder_name = channel_id_or_url
        else:
            channel_url = f"https://www.youtube.com/channel/{channel_id_or_url}"
            folder_name = channel_id_or_url

    # Create directory
    if not os.path.exists(folder_name):
        os.makedirs(folder_name)
        print(f"Created directory: {folder_name}")
    else:
        print(f"Using existing directory: {folder_name}")

    videos = get_channel_videos(channel_url)
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
        duration = video.get('duration') # seconds
        
        if not video_id:
            continue

        if should_skip_video(title):
            print(f"Skipping (Preview/Teaser): {title}")
            continue

        safe_title = sanitize_filename(title)
        duration_str = format_duration(duration)
        filename = f"{safe_title}_{duration_str}.txt"
        filepath = os.path.join(folder_name, filename)

        if os.path.exists(filepath):
            print(f"Skipping {filename} (already exists)")
            continue

        print(f"Processing: {title}...")

        # Configure yt-dlp to download subtitles
        # We use a temporary template to avoid messing up the final filename logic
        # which is custom (title + duration)
        temp_template = os.path.join(folder_name, f"temp_{video_id}")
        
        ydl_opts = {
            'skip_download': True,
            'writesubtitles': True,
            'writeautomaticsub': True,
            'subtitleslangs': ['en'],
            'subtitlesformat': 'vtt',
            'outtmpl': temp_template,
            'quiet': True,
            'no_warnings': True,
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([f"https://www.youtube.com/watch?v={video_id}"])
            
            # Find the downloaded vtt file
            # yt-dlp appends the language code, e.g., .en.vtt
            downloaded_files = glob.glob(f"{temp_template}*.vtt")
            
            if downloaded_files:
                vtt_file = downloaded_files[0]
                
                with open(vtt_file, 'r', encoding='utf-8') as f:
                    vtt_content = f.read()
                
                clean_text = clean_vtt_content(vtt_content)
                
                if clean_text:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(clean_text)
                    print(f"  -> Saved to {filename}")
                    downloads_this_session += 1
                else:
                    print(f"  -> Transcript empty for {video_id}")
                
                # Cleanup temp file
                os.remove(vtt_file)
            else:
                print(f"  -> No transcript available for {video_id}")

        except Exception as e:
            print(f"  -> Error downloading transcript for {video_id}: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download all transcripts from a YouTube channel.")
    parser.add_argument("channel_id", help="YouTube Channel ID, Handle (e.g. @Handle), or URL")
    
    args = parser.parse_args()
    
    download_transcripts(args.channel_id)
