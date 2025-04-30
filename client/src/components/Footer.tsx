export default function Footer() {
  return (
    <footer className="bg-gray-100 py-4 border-t border-gray-200">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
        <p>© {new Date().getFullYear()} Meeting Note Summarizer</p>
        <div className="mt-2 md:mt-0">
          <a href="#" className="text-primary hover:text-primary-dark mr-4">Privacy Policy</a>
          <a href="#" className="text-primary hover:text-primary-dark">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
