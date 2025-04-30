export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-800">Processing your meeting notes...</p>
        <p className="text-sm text-gray-600 mt-2">This might take a few seconds</p>
      </div>
    </div>
  );
}
