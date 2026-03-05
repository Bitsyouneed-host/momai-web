interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
  'no-show': 'bg-orange-100 text-orange-600',
  pending: 'bg-yellow-100 text-yellow-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  calling: 'bg-blue-100 text-blue-700',
  success: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-600',
  'no-answer': 'bg-orange-100 text-orange-600',
  voicemail: 'bg-purple-100 text-purple-600',
  callback: 'bg-orange-100 text-orange-600',
  active: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-600',
  free: 'bg-gray-100 text-gray-600',
  pro: 'bg-primary/20 text-primary-deep',
  pro_plus: 'bg-accent/20 text-accent',
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const colors = statusColors[status] || 'bg-gray-100 text-gray-600';
  const displayStatus = status.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colors} ${className}`}>
      {displayStatus}
    </span>
  );
}
