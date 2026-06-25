import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) =>
  <div data-ev-id="ev_ff5fbbfbf4"
  ref={ref}
  className={cn('rounded-xl border border-stone-200 bg-white text-stone-950 shadow-sm', className)}
  {...props} />


);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) =>
  <div data-ev-id="ev_fb0b7f578c" ref={ref} className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />

);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) =>
  <h3 data-ev-id="ev_94045bdc9e" ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />

);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) =>
  <p data-ev-id="ev_1ae6f3c0c8" ref={ref} className={cn('text-sm text-stone-500', className)} {...props} />

);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) =>
  <div data-ev-id="ev_8048c868e0" ref={ref} className={cn('p-6 pt-0', className)} {...props} />

);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) =>
  <div data-ev-id="ev_ac30991d6d" ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />

);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };