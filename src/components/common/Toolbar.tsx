import { useRef, useState } from 'react';
import { useAppContext } from '../../store/AppContext';
import { UnsavedBadge } from './UnsavedBadge';
import { exportToFile, importFromFile } from '../../services/saveFile';
import { ConfirmDialog } from './ConfirmDialog';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  onOpenTrash: () => void;
}

export function Toolbar({ onOpenTrash }: ToolbarProps) {
  const { state, dispatch } = useAppContext();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  async function handleExport() {
    try {
      await exportToFile(state, state.photoBlobs);
      dispatch({ type: 'MARK_EXPORTED', payload: { exportedAt: new Date().toISOString() } });
    } catch {
      // ExportError message is user-readable per contract
    }
  }

  function handleImportChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (importInputRef.current) importInputRef.current.value = '';

    if (state.hasUnsavedChanges) {
      setPendingImportFile(file);
      setShowUnsavedWarning(true);
    } else {
      void doImport(file);
    }
  }

  async function doImport(file: File) {
    setImportError(null);
    try {
      const result = await importFromFile(file);
      dispatch({ type: 'IMPORT_STATE', payload: { state: result.state, blobs: result.blobs } });
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed.');
    }
  }

  return (
    <div data-testid="toolbar" className={styles.toolbar}>
      <div className={styles.toolbarInner}>
        <UnsavedBadge />

        <button
          type="button"
          onClick={() => void handleExport()}
          aria-label="Export save file"
          className={styles.buttonSecondary}
        >
          Export
        </button>

        <input
          ref={importInputRef}
          type="file"
          accept=".zip,.photoalbum.zip,application/zip"
          onChange={handleImportChange}
          className={styles.hiddenInput}
          aria-label="Select save file to import"
        />
        <button
          type="button"
          onClick={() => importInputRef.current?.click()}
          aria-label="Import save file"
          className={styles.buttonSecondary}
        >
          Import
        </button>

        <button
          type="button"
          onClick={onOpenTrash}
          aria-label="Open trash"
          className={styles.buttonSecondary}
        >
          Trash
        </button>

        {importError && (
          <p role="alert" className={styles.errorMessage}>
            {importError}
          </p>
        )}

        {showUnsavedWarning && pendingImportFile && (
          <ConfirmDialog
            title="Unsaved Changes"
            message="You have unsaved changes. Importing will replace all current data. Continue?"
            confirmLabel="Import Anyway"
            onConfirm={() => {
              setShowUnsavedWarning(false);
              void doImport(pendingImportFile);
              setPendingImportFile(null);
            }}
            onCancel={() => {
              setShowUnsavedWarning(false);
              setPendingImportFile(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
