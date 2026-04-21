interface SkillBadgeProps {
  skill: string
}

export default function SkillBadge({ skill }: SkillBadgeProps) {
  return (
    <span className="inline-flex items-center bg-action/10 text-action border border-action/30 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap">
      {skill}
    </span>
  )
}
