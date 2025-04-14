export default function StatsCard({ title, value, change }) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-2xl font-bold text-indigo-900 mt-1">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{change}</p>
      </div>
    );
  }