export function EmptyState({ title, detail }) {
  return (
    <div className="empty-state">
      <p>{title}</p>
      {detail ? <span>{detail}</span> : null}
    </div>
  );
}
