import React from 'react';
import Skeleton from '../UI/Skeleton';

const PlayerCardSkeleton = () => (
  <div className='bg-gray-800 border border-gray-600 rounded-lg p-3 sm:p-4 min-h-[200px] flex flex-col'>
    {/* Header */}
    <div className='flex items-center justify-between mb-3'>
      <div className='flex items-center space-x-2'>
        <Skeleton className='w-8 h-8 rounded-full' />
        <div className='flex flex-col gap-1'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-3 w-16' />
        </div>
      </div>
      <Skeleton className='h-6 w-6 rounded' />
    </div>
    {/* Positions */}
    <div className='flex gap-1 mb-3'>
      <Skeleton className='h-5 w-8 rounded-full' />
      <Skeleton className='h-5 w-8 rounded-full' />
    </div>
    {/* Progress bar area */}
    <div className='mt-auto'>
      <div className='flex justify-between mb-1'>
        <Skeleton className='h-3 w-20' />
        <Skeleton className='h-3 w-12' />
      </div>
      <Skeleton className='h-2 w-full rounded-full' />
    </div>
  </div>
);

export default PlayerCardSkeleton;
