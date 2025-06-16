import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../Dialog';
import { Button } from '../button';

// Prevent scrolling/focus issues in tests
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  window.HTMLElement.prototype.focus = jest.fn();
});

describe('Dialog Component', () => {
  const renderBasicDialog = () =>
    render(
      <Dialog>
        <DialogTrigger data-testid="dialog-trigger">Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogDescription>
              This is a test dialog description
            </DialogDescription>
          </DialogHeader>
          <div data-testid="dialog-content-body">Dialog content here</div>
          <DialogFooter>
            <DialogClose data-testid="dialog-close">Close</DialogClose>
            <Button data-testid="dialog-submit">Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

  test('does not show dialog by default', () => {
    renderBasicDialog();
    expect(screen.queryByText('Test Dialog')).toBeNull();
    expect(screen.queryByTestId('dialog-content-body')).toBeNull();
  });

  test('opens dialog when trigger clicked', async () => {
    renderBasicDialog();
    await userEvent.click(screen.getByTestId('dialog-trigger'));
    expect(await screen.findByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-content-body')).toBeVisible();
    expect(
      screen.getByText('This is a test dialog description')
    ).toBeVisible();
  });

  test('closes dialog when close button clicked', async () => {
    renderBasicDialog();
    await userEvent.click(screen.getByTestId('dialog-trigger'));
    expect(await screen.findByText('Test Dialog')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('dialog-close'));
    await waitFor(() => {
      expect(screen.queryByText('Test Dialog')).toBeNull();
    });
  });

  test('closes dialog on Escape key press', async () => {
    renderBasicDialog();
    await userEvent.click(screen.getByTestId('dialog-trigger'));
    expect(await screen.findByText('Test Dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByText('Test Dialog')).toBeNull();
    });
  });

  test('calls onOpenChange when dialog opens and closes', async () => {
    const onOpenChange = jest.fn();
    render(
      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger data-testid="dialog-trigger">Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogClose data-testid="dialog-close">Close</DialogClose>
        </DialogContent>
      </Dialog>
    );

    await userEvent.click(screen.getByTestId('dialog-trigger'));
    expect(onOpenChange).toHaveBeenCalledWith(true);

    await userEvent.click(screen.getByTestId('dialog-close'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test('respects initialOpen prop', async () => {
    render(
      <Dialog initialOpen>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(await screen.findByText('Test Dialog')).toBeInTheDocument();
  });

  test('has proper accessibility attributes', async () => {
    renderBasicDialog();
    await userEvent.click(screen.getByTestId('dialog-trigger'));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('role', 'dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});
