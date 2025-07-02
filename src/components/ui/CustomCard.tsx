import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './card';

interface ReusableCardProps {
  title?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const ReusableCard: React.FC<ReusableCardProps> = ({ title, header, footer, children, className }) => (
  <Card className={className}>
    {(header || title) && (
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {header}
      </CardHeader>
    )}
    <CardContent>
      {children}
    </CardContent>
    {footer && <CardFooter>{footer}</CardFooter>}
  </Card>
);

export default ReusableCard; 