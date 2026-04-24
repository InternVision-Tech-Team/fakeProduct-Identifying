import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

const config = {
  VERIFIED: { cls: 'badge-verified', icon: <CheckCircle2 size={14} />, label: 'VERIFIED' },
  WARNING:  { cls: 'badge-warning',  icon: <AlertTriangle size={14} />, label: 'WARNING'  },
  INVALID:  { cls: 'badge-invalid',  icon: <XCircle size={14} />,       label: 'INVALID'  },
}

export default function StatusBadge({ status }) {
  const c = config[status] || config.INVALID
  return (
    <span className={c.cls}>
      {c.icon}
      {c.label}
    </span>
  )
}
