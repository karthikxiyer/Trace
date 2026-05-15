export default function TagBadge({ tag, onRemove }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: tag.color }}
    >
      {tag.name}
      {onRemove && (
        <button
          onClick={(e) => { e.preventDefault(); onRemove(tag); }}
          className="hover:opacity-70 leading-none"
        >
          ×
        </button>
      )}
    </span>
  );
}
