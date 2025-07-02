import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';

interface ReusableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const ReusableDialog: React.FC<ReusableDialogProps> = ({ open, onOpenChange, title, description, children, actions, className }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className={className}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      {children}
      {actions && <div className="mt-4 flex justify-end gap-2">{actions}</div>}
    </DialogContent>
  </Dialog>
);

export default ReusableDialog; 