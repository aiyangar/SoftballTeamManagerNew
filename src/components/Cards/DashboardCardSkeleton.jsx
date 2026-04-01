import React from 'react';
import Skeleton from '../UI/Skeleton';

const DashboardCardSkeleton = () => (
  <div className='bg-surface-800/50 backdrop-blur-sm rounded-lg pt-4 pb-6 px-6 min-h-[18rem] flex flex-col border border-surface-border'>
    <div className='flex items-center justify-between mb-3 h-16'>
      <Skeleton className='h-4 w-28' />
      <Skeleton className='w-12 h-12 rounded flex-shrink-0' />
    </div>
    <div className='w-[95%] mx-auto mb-3 border-t border-surface-border' />
    <div className='flex-1 flex flex-col justify-center gap-3'>
      <Skeleton className='h-8 w-16' />
      <Skeleton className='h-4 w-32' />
      <Skeleton className='h-4 w-24' />
    </div>
  </div>
);

export default DashboardCardSkeleton;
