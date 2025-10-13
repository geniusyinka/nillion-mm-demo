interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function Pagination({ currentPage, totalPages, onPrevious, onNext }: PaginationProps) {
  return (
    <div className="flex items-center justify-between p-2">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentPage <= 1}
        className="px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/30 transition-colors"
      >
        Previous
      </button>

      <div className="text-gray-400 text-sm">
        {currentPage} of {totalPages}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={currentPage >= totalPages}
        className="px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/30 transition-colors"
      >
        Next
      </button>
    </div>
  );
}
