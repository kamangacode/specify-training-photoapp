import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '../../src/store/AppContext';
import { AlbumForm } from '../../src/components/albums/AlbumForm';
import { AlbumGrid } from '../../src/components/albums/AlbumGrid';

function renderWithProvider(ui: React.ReactElement) {
  return render(<AppProvider>{ui}</AppProvider>);
}

describe('Album creation integration', () => {
  it('renders AlbumForm with album name input', () => {
    renderWithProvider(<AlbumForm onClose={() => {}} />);
    expect(screen.getByLabelText(/album name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^create$/i })).toBeInTheDocument();
  });

  it('submitting AlbumForm with a name dispatches CREATE_ALBUM and shows album in grid', async () => {
    const user = userEvent.setup();

    function Wrapper() {
      const [show, setShow] = React.useState(true);
      return (
        <>
          {show && <AlbumForm onClose={() => setShow(false)} />}
          <AlbumGrid onOpenAlbum={() => {}} onCreateAlbum={() => setShow(true)} />
        </>
      );
    }

    // Need React in scope for JSX
    const React = await import('react');
    renderWithProvider(<Wrapper />);

    await user.type(screen.getByLabelText(/album name/i), 'Trip to Japan');
    await user.click(screen.getByRole('button', { name: /^create$/i }));

    expect(screen.getByText('Trip to Japan')).toBeInTheDocument();
  });

  it('shows validation error when name is empty', async () => {
    const user = userEvent.setup();
    renderWithProvider(<AlbumForm onClose={() => {}} />);

    await user.click(screen.getByRole('button', { name: /^create$/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('cancel button closes the form without creating album', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProvider(<AlbumForm onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
