import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-12 text-center max-w-2xl mx-auto">
      <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">404</p>
      <h1 className="mt-2 text-3xl font-extrabold text-gray-900">Page not found</h1>
      <p className="mt-3 text-gray-500">That page wandered off. Happens to the best routes.</p>
      <Link to="/" className="inline-flex mt-6 px-6 py-3 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
        Back to Home
      </Link>
    </div>
  );
}
