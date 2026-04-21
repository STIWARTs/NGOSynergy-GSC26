interface SkillBadgeProps {
  skill: string
}

export default function SkillBadge({ skill }: SkillBadgeProps) {
  return (
    <span className="inline-block bg-action bg-opacity-20 text-action px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
      {skill}
    </span>
  )
}
