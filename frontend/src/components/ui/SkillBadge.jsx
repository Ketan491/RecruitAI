export default function SkillBadge({ skill, size = 'md' }) {
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-3 py-1.5',
    lg: 'text-sm px-4 py-2',
  }
  return (
    <span className={`inline-block rounded-lg font-mono font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20 ${sizes[size]}`}>
      {skill}
    </span>
  )
}
