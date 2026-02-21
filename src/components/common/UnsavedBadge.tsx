import { useAppContext } from '../../store/AppContext';

export function UnsavedBadge() {
  const { state } = useAppContext();
  if (!state.hasUnsavedChanges) return null;
  return (
    <span role="status" aria-label="Unsaved changes" title="You have unsaved changes">
      ● Unsaved
    </span>
  );
}
