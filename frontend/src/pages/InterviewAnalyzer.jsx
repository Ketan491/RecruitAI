/**
 * Interview Analyzer — webcam preview, speech recording, AI analysis.
 * Uses browser Web Speech API for transcription.
 */
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, Video, VideoOff, Play, Square,
  Loader2, AlertCircle, TrendingUp, ThumbsUp, ThumbsDown, Info
} from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import api from '../utils/api'
import toast from 'react-hot-toast'

const MOCK_QUESTIONS = [
  "Tell me about yourself and your background in software development.",
  "Describe a challenging technical problem you solved recently.",
  "How do you handle tight deadlines and pressure?",
  "What's your experience with agile methodologies?",
  "Where do you see yourself in 5 years?",
  "Explain a project you're most proud of.",
]

export default function InterviewAnalyzer() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [liveText, setLiveText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [camOn, setCamOn] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentQ, setCurrentQ] = useState(0)

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const recognitionRef = useRef(null)
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)

  // Start webcam
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCamOn(true)
      toast.success('Camera ready!')
    } catch {
      toast.error('Camera access denied. Enable it in browser settings.')
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setCamOn(false)
  }

  // Start speech recognition
  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Your browser doesn\'t support speech recognition. Try Chrome.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognitionRef.current = recognition

    let finalTranscript = ''

    recognition.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) finalTranscript += t + ' '
        else interim = t
      }
      setTranscript(finalTranscript)
      setLiveText(interim)
    }

    recognition.onerror = (e) => {
      if (e.error !== 'no-speech') toast.error(`Speech error: ${e.error}`)
    }

    recognition.start()
    setIsRecording(true)
    startTimeRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    toast.success('Recording started — speak now!')
  }

  const stopRecording = () => {
    recognitionRef.current?.stop()
    clearInterval(timerRef.current)
    setIsRecording(false)
    setLiveText('')
  }

  const analyzeInterview = async () => {
    const fullText = transcript.trim()
    if (fullText.length < 20) {
      toast.error('Please record more speech before analyzing.')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/api/interview/analyze', {
        transcript: fullText,
        duration_seconds: duration || 60
      })
      setResult(data.analysis)
      toast.success('Analysis complete! 🎯')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    stopRecording()
    setTranscript('')
    setLiveText('')
    setResult(null)
    setDuration(0)
  }

  const formatDuration = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const getScoreColor = (s) => {
    if (s >= 80) return 'text-emerald-400'
    if (s >= 60) return 'text-brand-400'
    if (s >= 40) return 'text-amber-400'
    return 'text-red-400'
  }

  const getBarColor = (s) => {
    if (s >= 80) return 'from-emerald-600 to-emerald-400'
    if (s >= 60) return 'from-brand-600 to-brand-400'
    if (s >= 40) return 'from-amber-600 to-amber-400'
    return 'from-red-600 to-red-400'
  }

  // Cleanup on unmount — stop camera stream and speech recognition
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
      recognitionRef.current?.stop()
      clearInterval(timerRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl text-white mb-2">Interview Simulator</h1>
        <p className="text-white/40">Practice answering interview questions. Get AI feedback on your delivery.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left — Camera + Controls */}
        <div className="space-y-4">
          {/* Question card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/40 text-xs uppercase tracking-wide">Practice Question {currentQ + 1}/{MOCK_QUESTIONS.length}</span>
              <button onClick={() => setCurrentQ(i => (i + 1) % MOCK_QUESTIONS.length)}
                className="text-brand-400 text-xs hover:text-brand-300 transition-colors">
                Next question →
              </button>
            </div>
            <p className="text-white font-medium leading-relaxed">"{MOCK_QUESTIONS[currentQ]}"</p>
          </motion.div>

          {/* Webcam preview */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass rounded-2xl border border-white/5 overflow-hidden">
            <div className="relative bg-dark-800 aspect-video flex items-center justify-center">
              {camOn ? (
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <Video size={40} className="text-white/10 mx-auto mb-2" />
                  <p className="text-white/30 text-sm">Camera off</p>
                </div>
              )}

              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-400 text-xs font-mono">{formatDuration(duration)}</span>
                </div>
              )}
            </div>

            {/* Controls bar */}
            <div className="flex items-center gap-3 p-4 border-t border-white/5">
              <button
                onClick={camOn ? stopCamera : startCamera}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  camOn ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                        : 'glass text-white/60 border-white/10 hover:text-white'
                }`}
              >
                {camOn ? <><VideoOff size={16} /> Stop Cam</> : <><Video size={16} /> Start Cam</>}
              </button>

              {!isRecording ? (
                <button onClick={startRecording}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium py-2 px-4 rounded-xl transition-all">
                  <Mic size={16} /> Start Recording
                </button>
              ) : (
                <button onClick={stopRecording}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium py-2 px-4 rounded-xl transition-all animate-pulse-glow">
                  <Square size={16} /> Stop Recording
                </button>
              )}
            </div>
          </motion.div>

          {/* Transcript box */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white/60 text-xs uppercase tracking-wide">Live Transcript</h3>
              {transcript && <button onClick={reset} className="text-red-400/60 hover:text-red-400 text-xs transition-colors">Reset</button>}
            </div>
            <div className="bg-dark-700 rounded-xl p-4 min-h-[120px] text-sm leading-relaxed">
              <span className="text-white/70">{transcript}</span>
              {liveText && <span className="text-white/30 italic"> {liveText}</span>}
              {!transcript && !liveText && (
                <span className="text-white/20 italic">Your speech will appear here as you speak...</span>
              )}
            </div>
            {transcript && (
              <div className="flex items-center justify-between mt-3">
                <span className="text-white/30 text-xs">{transcript.split(' ').filter(Boolean).length} words</span>
                <motion.button
                  onClick={analyzeInterview}
                  disabled={loading || isRecording}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary text-sm py-2 px-5 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
                  Analyze My Interview
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right — Analysis Results */}
        <div>
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass rounded-2xl p-12 border border-white/5 flex flex-col items-center gap-5 h-full justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
                <div className="text-center">
                  <p className="text-white font-medium mb-1">Analyzing your interview...</p>
                  <p className="text-white/40 text-sm">Checking filler words, pace, confidence</p>
                </div>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }} className="space-y-4">
                {/* Score overview */}
                <div className="glass rounded-2xl p-6 border border-white/5">
                  <h3 className="font-display font-semibold text-white mb-5">Performance Overview</h3>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    {[
                      { label: 'Confidence', value: result.confidence_score },
                      { label: 'Clarity', value: result.clarity_score },
                    ].map(m => (
                      <div key={m.label} className="text-center">
                        <div className={`text-3xl font-display font-bold mb-1 ${getScoreColor(m.value)}`}>
                          {Math.round(m.value)}%
                        </div>
                        <div className="text-white/40 text-xs">{m.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-white/50">Speech Speed</span>
                        <span className="text-white/70 font-mono">{result.speech_speed_wpm} WPM</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${getBarColor(result.confidence_score)} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((result.speech_speed_wpm / 200) * 100, 100)}%` }}
                          transition={{ delay: 0.3, duration: 0.8 }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-white/50">Filler Words</span>
                        <span className="text-red-400 font-mono">{result.filler_word_count} detected</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(result.filler_words || {}).map(([word, count]) => (
                          <span key={word} className="text-xs px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg font-mono">
                            "{word}" ×{count}
                          </span>
                        ))}
                        {!Object.keys(result.filler_words || {}).length && (
                          <span className="text-emerald-400 text-xs">✓ No filler words!</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strengths */}
                {result.strengths?.length > 0 && (
                  <div className="glass rounded-2xl p-5 border border-emerald-500/10">
                    <h3 className="text-emerald-400 text-sm font-semibold flex items-center gap-2 mb-3">
                      <ThumbsUp size={14} /> Strengths
                    </h3>
                    <ul className="space-y-2">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                          <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {result.improvements?.length > 0 && (
                  <div className="glass rounded-2xl p-5 border border-amber-500/10">
                    <h3 className="text-amber-400 text-sm font-semibold flex items-center gap-2 mb-3">
                      <ThumbsDown size={14} /> Areas to Improve
                    </h3>
                    <ul className="space-y-2">
                      {result.improvements.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                          <span className="text-amber-400 mt-0.5 flex-shrink-0">→</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* General feedback */}
                {result.feedback?.length > 0 && (
                  <div className="glass rounded-2xl p-5 border border-white/5">
                    <h3 className="text-brand-400 text-sm font-semibold flex items-center gap-2 mb-3">
                      <Info size={14} /> AI Feedback
                    </h3>
                    <ul className="space-y-2">
                      {result.feedback.map((s, i) => (
                        <li key={i} className="text-xs text-white/60 leading-relaxed">{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            {!result && !loading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass rounded-2xl p-12 border border-white/5 text-center h-full flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-600/10 flex items-center justify-center">
                  <Mic size={28} className="text-brand-400/50" />
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Ready to practice?</p>
                  <p className="text-white/30 text-sm">Start the camera, record your answer, then click Analyze.</p>
                </div>
                <div className="flex gap-2">
                  {['Chrome recommended', 'Microphone required'].map(t => (
                    <span key={t} className="text-xs text-white/30 bg-white/5 border border-white/10 rounded-lg px-3 py-1">{t}</span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  )
}
