import React from 'react';
import Skeleton from '../UI/Skeleton';

const ScheduleCardSkeleton = () => (
  <div className='bg-gray-800 border border-gray-700 rounded-lg p-4'>
    {/* Opponent + date */}
    <div className='flex justify-between items-start mb-3'>
      <div className='flex-1 flex flex-col gap-2'>
        <Skeleton className='h-5 w-32' />
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-4 w-28' />
      </div>
      <Skeleton className='h-6 w-16 rounded-full' />
    </div>
    {/* Divider */}
    <div className='border-t border-gray-700 my-3' />
    {/* Buttons row */}
    <div className='flex gap-2'>
      <Skeleton className='h-8 w-24 rounded' />
      <Skeleton className='h-8 w-24 rounded' />
    </div>
  </div>
);

export default ScheduleCardSkeleton;
