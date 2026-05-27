/**
 * Resume Upload page — drag-and-drop PDF upload with live parsing results.
 */
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, CheckCircle, AlertCircle, Loader2,
  Mail, Phone, Briefcase, GraduationCap, Tag,
} from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import SkillBadge from '../components/ui/SkillBadge'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function ResumeUpload() {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)

  const onDrop = useCallback(async (accepted) => {
    if (!accepted.length) return
    const f = accepted[0]
    if (f.type !== 'application/pdf') {
      toast.error('Only PDF files are supported.')
      return
    }
    setFile(f)
    setError(null)
    setResult(null)
    setUploading(true)

    const formData = new FormData()
    formData.append('file', f)

    try {
      const { data } = await api.post('/api/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(data)
      toast.success('Resume analyzed successfully! ✨')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Upload failed. Try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading
  })

  const extracted = result?.extracted_data

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl text-white mb-2">Resume Upload</h1>
        <p className="text-white/40">Upload your PDF resume — our AI will extract skills, experience & more in seconds.</p>
      </div>

      {/* Dropzone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
              : 'border-white/10 bg-white/2 hover:border-brand-500/40 hover:bg-brand-500/5'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input {...getInputProps()} />

          <AnimatePresence mode="wait">
            {uploading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
                  <Loader2 size={28} className="text-brand-400 animate-spin" />
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Analyzing your resume...</p>
                  <p className="text-white/40 text-sm">AI is extracting skills and experience</p>
                </div>
                {/* Fake progress */}
                <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brand-600 to-accent-purple rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '90%' }}
                    transition={{ duration: 3, ease: 'easeInOut' }}
                  />
                </div>
              </motion.div>
            ) : isDragActive ? (
              <motion.div key="drag" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-brand-600/30 border border-brand-500 flex items-center justify-center animate-bounce">
                  <Upload size={28} className="text-brand-400" />
                </div>
                <p className="text-brand-400 font-semibold text-lg">Drop it here!</p>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <FileText size={28} className="text-white/30" />
                </div>
                <div>
                  <p className="text-white font-medium mb-1">
                    {file ? file.name : 'Drag your resume here'}
                  </p>
                  <p className="text-white/40 text-sm">
                    {file ? 'Click to replace' : 'or click to browse — PDF only, max 5MB'}
                  </p>
                </div>
                <span className="text-xs font-mono text-white/20 bg-white/5 border border-white/10 rounded-lg px-3 py-1">
                  PDF · Max 5MB
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Error state */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
          <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {extracted && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Success banner */}
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
              <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-emerald-400 font-medium text-sm">Analysis complete!</p>
                <p className="text-emerald-400/60 text-xs">
                  Found {extracted.skills?.length || 0} skills, {extracted.education?.length || 0} education entries, {extracted.experience?.length || 0} experience records
                </p>
              </div>
            </div>

            {/* Contact info */}
            {(extracted.email || extracted.phone) && (
              <div className="glass rounded-2xl p-6 border border-white/5">
                <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                  <Mail size={16} className="text-brand-400" /> Contact Info
                </h3>
                <div className="flex flex-wrap gap-4">
                  {extracted.email && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Mail size={14} className="text-brand-400" /> {extracted.email}
                    </div>
                  )}
                  {extracted.phone && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Phone size={14} className="text-brand-400" /> {extracted.phone}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skills */}
            {extracted.skills?.length > 0 && (
              <div className="glass rounded-2xl p-6 border border-white/5">
                <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                  <Tag size={16} className="text-purple-400" /> Detected Skills
                  <span className="ml-auto text-white/30 text-sm font-normal">{extracted.skills.length} found</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {extracted.skills.map((skill, i) => (
                    <motion.div key={skill} initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                      <SkillBadge skill={skill} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {extracted.education?.length > 0 && (
              <div className="glass rounded-2xl p-6 border border-white/5">
                <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                  <GraduationCap size={16} className="text-cyan-400" /> Education
                </h3>
                <div className="space-y-3">
                  {extracted.education.map((edu, i) => (
                    <div key={i} className="bg-white/3 rounded-xl p-3 border border-white/5">
                      <p className="text-brand-400 text-sm font-medium">{edu.degree}</p>
                      <p className="text-white/40 text-xs mt-1 line-clamp-2">{edu.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {extracted.experience?.length > 0 && (
              <div className="glass rounded-2xl p-6 border border-white/5">
                <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                  <Briefcase size={16} className="text-pink-400" /> Experience Timeline
                </h3>
                <div className="space-y-3">
                  {extracted.experience.map((exp, i) => (
                    <div key={i} className="bg-white/3 rounded-xl p-3 border border-white/5">
                      <p className="text-pink-400 text-xs font-mono mb-1">{exp.period}</p>
                      <p className="text-white/50 text-xs line-clamp-2">{exp.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            {extracted.keywords?.length > 0 && (
              <div className="glass rounded-2xl p-6 border border-white/5">
                <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                  <Tag size={16} className="text-emerald-400" /> Top Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {extracted.keywords.map(kw => (
                    <span key={kw} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
