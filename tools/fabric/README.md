# Fabric + YouTube Workflow for Podcast Analysis

This guide outlines a workflow for using **Fabric** and `youtube-transcript-api` to extract insights from long-form YouTube podcasts. It focuses on capturing key ideas, analyzing speaker context, and enabling interactive deep dives across single or multiple episodes.

## Prerequisites

1.  **Fabric**: The core AI analysis tool.
    *   Follow installation instructions at the [official Fabric repository](https://github.com/danielmiessler/fabric).
    *   Ensure you have run `fabric --setup` and configured your patterns.

2.  **uv**: An extremely fast Python package installer and resolver.
    *   Install via Homebrew: `brew install uv`
    *   Or via script: `curl -LsSf https://astral.sh/uv/install.sh | sh`

3.  **YouTube Transcript API**: A tool to download transcripts.
    *   Install via uv:
        ```bash
        uv tool install youtube-transcript-api
        ```

4.  **JQ** (Optional): Useful for processing JSON output if needed.
    *   Install via Homebrew (Mac): `brew install jq`

## Workflow: Single Episode Analysis

### 1. Download Transcript
Download the transcript for a specific video ID. We'll save it as a text file.

```bash
# Replace VIDEO_ID with the actual YouTube video ID
youtube_transcript_api VIDEO_ID --format text > transcript.txt
```

*Tip: If you want timestamps for more granular reference, you can omit `--format text` to get JSON, but plain text is usually better for LLM context windows.*

### 2. Analyze & Extract Key Ideas
Pipe the transcript into Fabric using the `extract_wisdom` pattern (or similar) to get high-level takeaways.

```bash
cat transcript.txt | fabric -p extract_wisdom
```

### 3. Speaker Context & Role Analysis
Since standard transcripts often lack speaker labels ("Host" vs "Guest"), use a custom prompt or specific instructions to help the AI infer roles.

**Option A: Ad-hoc Prompting**
```bash
cat transcript.txt | fabric -p summarize --text "Analyze this transcript. Identify the host and the guest based on the questioning style. The host usually asks short questions, and the guest gives long answers. Summarize the guest's key arguments."
```

**Option B: Create a Custom Pattern**
Create a pattern named `analyze_podcast` in your fabric patterns directory:
```markdown
# IDENTITY and PURPOSE
You are an expert podcast analyst. Your goal is to distinguish between the Host and Guest speakers based on context and extract the core philosophy of the Guest.

# STEPS
1. Read the input transcript.
2. Identify speaker changes based on context (Host asks questions/guides flow, Guest answers/elaborates).
3. Extract the Guest's main thesis and supporting arguments.
4. List key quotes attributed to the Guest.

# OUTPUT
- Host/Guest Identification Strategy
- Guest's Core Thesis
- Key Arguments
- Notable Quotes
```

Run it:
```bash
cat transcript.txt | fabric -p analyze_podcast
```

## Interactive Deep Dive
To ask follow-up questions without re-processing the whole text, use Fabric's session mode or pipe context into a chat.

**Interactive Session (if supported by your Fabric version/setup):**
```bash
cat transcript.txt | fabric --stream --pattern ai
```
*Note: "ai" is a generic pattern; you might just want to start a chat session with the context.*

**Manual Context Loading:**
Copy the transcript to your clipboard and start a fresh Fabric session, or use a tool that supports large context windows.

## Workflow: Channel Analysis (Bulk Download)

To download all transcripts from a specific YouTube channel, use the provided `get_channel_transcripts.py` script. This script automatically fetches all videos, creates a directory for the channel, and saves transcripts with the filename format `Title_Duration.txt`.

**Usage:**
```bash
# Using uv to run the script (handles dependencies automatically)
uv run get_channel_transcripts.py @ChannelHandle

# OR using a Channel ID
uv run get_channel_transcripts.py UCxxxxxxxxxxxx
```

## Multi-Episode Analysis
To analyze trends across multiple episodes (e.g., "What is the common theme across these 3 interviews?"):

1.  **Download all transcripts:**
    ```bash
    youtube_transcript_api VIDEO_ID_1 --format text > ep1.txt
    youtube_transcript_api VIDEO_ID_2 --format text > ep2.txt
    youtube_transcript_api VIDEO_ID_3 --format text > ep3.txt
    ```

2.  **Concatenate and Analyze:**
    ```bash
    cat ep1.txt ep2.txt ep3.txt > all_episodes.txt
    cat all_episodes.txt | fabric -p extract_wisdom --text "Identify common themes and contradictions across these three episodes."
    ```

## Additional Tools & Extensions

*   **yt-dlp**: Best-in-class tool for downloading audio/video if you need to generate your own transcripts using Whisper (better accuracy than YouTube auto-generated captions).
    ```bash
    uv tool install yt-dlp
    yt-dlp -x --audio-format mp3 URL
    ```
*   **Mac Whisper**: If you have the audio file, Mac Whisper (or `whisper.cpp`) provides excellent local transcription with speaker diarization (identifying who is speaking), which solves the "Host vs Guest" labeling problem.
