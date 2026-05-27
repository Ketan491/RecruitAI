"""
Interview speech analysis — filler word detection, speed, confidence estimation.
Works with transcribed text from the frontend's SpeechRecognition API.
"""
import re
from typing import Dict, List, Tuple
from datetime import datetime

# Common filler words to detect
FILLER_WORDS = [
    "um", "uh", "like", "you know", "basically", "literally",
    "actually", "honestly", "right", "so", "i mean", "kind of",
    "sort of", "okay so", "yeah so", "well", "anyway"
]

# Power words that signal confidence
POWER_WORDS = [
    "developed", "built", "designed", "led", "managed", "created",
    "implemented", "achieved", "improved", "optimized", "delivered",
    "launched", "scaled", "collaborated", "coordinated", "analyzed"
]

def count_filler_words(transcript: str) -> Dict[str, int]:
    """Count occurrences of each filler word in the transcript."""
    transcript_lower = transcript.lower()
    filler_count = {}
    
    for filler in FILLER_WORDS:
        # Use word boundary matching
        pattern = r'\b' + re.escape(filler) + r'\b'
        count = len(re.findall(pattern, transcript_lower))
        if count > 0:
            filler_count[filler] = count
    
    return filler_count

def calculate_speech_speed(transcript: str, duration_seconds: int) -> int:
    """Calculate words per minute from transcript and duration."""
    if duration_seconds <= 0:
        return 0
    words = len(transcript.split())
    wpm = int((words / duration_seconds) * 60)
    return wpm

def estimate_confidence(
    transcript: str,
    filler_count: Dict[str, int],
    wpm: int
) -> float:
    """
    Estimate confidence score based on:
    - Filler word ratio (fewer = more confident)
    - Speech speed (ideal: 120-160 WPM)
    - Power word usage
    - Sentence completeness
    """
    total_words = len(transcript.split())
    if total_words == 0:
        return 50.0
    
    # Filler penalty: each filler reduces score
    total_fillers = sum(filler_count.values())
    filler_ratio = total_fillers / total_words
    filler_score = max(0, 100 - (filler_ratio * 400))  # Heavy penalty
    
    # Speed score: ideal range 120-160 WPM
    if 120 <= wpm <= 160:
        speed_score = 100.0
    elif 100 <= wpm < 120 or 160 < wpm <= 180:
        speed_score = 75.0
    elif wpm < 100:
        speed_score = max(40, wpm)  # Too slow
    else:
        speed_score = max(40, 200 - wpm)  # Too fast
    
    # Power word bonus
    power_count = sum(
        1 for word in POWER_WORDS
        if re.search(r'\b' + word + r'\b', transcript.lower())
    )
    power_score = min(100, 50 + (power_count * 10))
    
    # Length score — very short answers indicate nervousness
    length_score = min(100, (total_words / 50) * 100)
    
    confidence = (filler_score * 0.35) + (speed_score * 0.25) + (power_score * 0.25) + (length_score * 0.15)
    return round(min(100, max(0, confidence)), 1)

def calculate_clarity_score(transcript: str) -> float:
    """
    Measure clarity based on sentence structure.
    More complete sentences = higher clarity.
    """
    sentences = re.split(r'[.!?]+', transcript)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
    
    if not sentences:
        return 50.0
    
    # Average sentence length (ideal: 10-25 words)
    avg_length = sum(len(s.split()) for s in sentences) / len(sentences)
    
    if 10 <= avg_length <= 25:
        clarity = 85.0
    elif 5 <= avg_length < 10 or 25 < avg_length <= 35:
        clarity = 65.0
    else:
        clarity = 45.0
    
    return clarity

def generate_interview_feedback(
    confidence: float,
    filler_count: Dict[str, int],
    wpm: int,
    clarity: float
) -> Tuple[List[str], List[str], List[str]]:
    """Generate personalized feedback, strengths, and improvement points."""
    feedback = []
    strengths = []
    improvements = []
    
    # Confidence feedback
    if confidence >= 80:
        strengths.append("Strong, confident delivery throughout your answers.")
        feedback.append("Your overall confidence level is impressive — keep it up!")
    elif confidence >= 60:
        feedback.append("Decent confidence level. A bit more preparation will push you higher.")
        improvements.append("Practice speaking with more conviction and authority.")
    else:
        feedback.append("Work on building your confidence. Practice in front of a mirror or with friends.")
        improvements.append("Record yourself and review — you'll spot patterns to fix.")
    
    # Filler word feedback
    total_fillers = sum(filler_count.values())
    if total_fillers == 0:
        strengths.append("Excellent! Zero filler words detected in your speech.")
    elif total_fillers <= 3:
        strengths.append("Very few filler words — professional communication style.")
    elif total_fillers <= 8:
        top_fillers = sorted(filler_count.items(), key=lambda x: x[1], reverse=True)[:2]
        improvements.append(f"Reduce use of '{top_fillers[0][0]}' ({top_fillers[0][1]}x). Try pausing instead.")
    else:
        improvements.append("High filler word usage detected. Slow down and use intentional pauses.")
        feedback.append("Replace filler words with brief pauses — silence is powerful in interviews.")
    
    # Speed feedback
    if 120 <= wpm <= 160:
        strengths.append(f"Perfect speech speed at {wpm} WPM — easy to follow.")
    elif wpm < 100:
        improvements.append(f"Speech speed ({wpm} WPM) is too slow. Try to be more energetic.")
    elif wpm > 180:
        improvements.append(f"Speech speed ({wpm} WPM) is too fast. Slow down to let ideas land.")
    
    # Clarity feedback
    if clarity >= 80:
        strengths.append("Clear, well-structured responses with good sentence flow.")
    else:
        improvements.append("Work on structuring your answers using the STAR method (Situation, Task, Action, Result).")
    
    # General tips
    feedback.append("Remember to always back up your answers with specific examples from your experience.")
    feedback.append("Maintain good eye contact and sit up straight — body language matters even in online interviews.")
    
    return feedback, strengths, improvements

def analyze_interview(transcript: str, duration_seconds: int = 60) -> dict:
    """
    Main interview analysis function.
    Takes transcript text and returns detailed analysis.
    """
    if not transcript or len(transcript.strip()) < 10:
        return {
            "error": "Transcript too short for meaningful analysis",
            "confidence_score": 0,
            "feedback": ["Please record a longer response for accurate analysis."]
        }
    
    filler_count = count_filler_words(transcript)
    total_fillers = sum(filler_count.values())
    total_words = len(transcript.split())
    filler_ratio = round(total_fillers / max(total_words, 1), 3)
    
    wpm = calculate_speech_speed(transcript, duration_seconds)
    confidence = estimate_confidence(transcript, filler_count, wpm)
    clarity = calculate_clarity_score(transcript)
    
    feedback, strengths, improvements = generate_interview_feedback(
        confidence, filler_count, wpm, clarity
    )
    
    return {
        "transcript": transcript,
        "filler_words": filler_count,
        "filler_word_count": total_fillers,
        "total_words": total_words,
        "filler_ratio": filler_ratio,
        "speech_speed_wpm": wpm,
        "confidence_score": confidence,
        "clarity_score": clarity,
        "feedback": feedback,
        "strengths": strengths,
        "improvements": improvements,
        "duration_seconds": duration_seconds,
        "analyzed_at": datetime.utcnow().isoformat()
    }
