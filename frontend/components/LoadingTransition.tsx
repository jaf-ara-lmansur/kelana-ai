type GenerateTripLoadingStateProps = {
  title?: string;
  description?: string;
};

export default function GenerateTripLoadingState({
  title = "Menyusun itinerary terbaik untukmu",
  description = "Kelana AI sedang menganalisis destinasi, durasi, dan anggaran kamu...",
}: GenerateTripLoadingStateProps) {
  return (
    <div
      aria-live="polite"
      aria-label={title}
      className="generate-loading-shell"
      role="status"
    >
      <div className="generate-loading-card">
        <div className="generate-loading-spinner" aria-hidden="true" />

        <div className="generate-skeleton-group" aria-hidden="true">
          <span className="skeleton-line skeleton-line-short" />
          <span className="skeleton-line skeleton-line-medium" />
          <span className="skeleton-line skeleton-line-long" />
        </div>

        <p className="generate-loading-title">{title}</p>
        <p className="generate-loading-description">{description}</p>
      </div>
    </div>
  );
}
