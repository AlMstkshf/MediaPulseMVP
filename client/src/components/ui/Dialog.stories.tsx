import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './Dialog';
import { Button } from './button';
import { useDialog } from '@/hooks/useDialog';

const meta: Meta<typeof Dialog> = {
  title: 'UI/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  argTypes: {
    initialOpen: {
      control: 'boolean',
      description: 'Whether the dialog is initially open',
    },
    onOpenChange: {
      action: 'openChanged',
      description: 'Callback when the dialog open state changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

/**
 * Default Dialog with trigger button
 */
export const Default: Story = {
  args: {
    initialOpen: false,
  },
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Default Dialog</DialogTitle>
          <DialogDescription>
            This is a basic dialog with header, content and footer.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>
            Dialog content goes here. You can put any content inside a dialog.
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Component used in the Controlled story
const ControlledTemplate: React.FC = () => {
  const { open, setOpen, onOpenChange } = useDialog(false);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Button onClick={() => setOpen(true)} disabled={open}>
          Open Dialog
        </Button>
        <Button
          variant="destructive"
          onClick={() => setOpen(false)}
          disabled={!open}
        >
          Force Close
        </Button>
        <div className="ml-auto bg-muted px-4 py-2 rounded text-sm">
          Dialog state: <strong>{open ? 'Open' : 'Closed'}</strong>
        </div>
      </div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled Dialog</DialogTitle>
            <DialogDescription>
              This dialog's open state is controlled externally.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>
              You can programmatically control this dialog using state from
              the useDialog hook.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/**
 * Controlled Dialog with external open state
 */
export const Controlled: Story = {
  render: () => <ControlledTemplate />,
  parameters: {
    controls: { exclude: ['initialOpen', 'onOpenChange'] },
  },
};

/**
 * Dialog with custom header and footer
 */
export const CustomHeaderFooter: Story = {
  args: {
    initialOpen: false,
  },
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button>Custom Dialog</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader className="bg-primary/10 -m-6 mb-2 p-6 rounded-t-lg">
          <DialogTitle className="text-center text-xl text-primary">
            Custom Header Styling
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p>This dialog has a custom styled header and footer.</p>
          <div className="my-4 p-4 bg-muted rounded-md text-sm">
            <strong>Note:</strong> You can customize any part of the dialog with
            regular CSS or Tailwind classes.
          </div>
        </div>

        <DialogFooter className="bg-muted/50 -m-6 mt-2 p-6 pt-4 rounded-b-lg border-t">
          <Button variant="outline">Cancel</Button>
          <Button className="bg-gradient-to-r from-primary to-primary-foreground hover:from-primary-foreground hover:to-primary">
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  parameters: {
    controls: { exclude: ['initialOpen', 'onOpenChange'] },
  },
};
