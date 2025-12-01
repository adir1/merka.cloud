import http.cookiejar
import requests
from youtube_transcript_api import YouTubeTranscriptApi

def load_cookies(cookie_file):
    cj = http.cookiejar.MozillaCookieJar(cookie_file)
    cj.load(ignore_discard=True, ignore_expires=True)
    session = requests.Session()
    session.cookies = cj
    return session

print("Cookie loader defined.")
