export default function Loading() {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          {/* Animated Spinner */}
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          
          {/* Loading Text */}
          <p className="text-gray-500 font-medium animate-pulse">
            Fetching secure case files...
          </p>
        </div>
      </div>
    );
  }