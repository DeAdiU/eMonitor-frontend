'use client'
import { useEffect, useState } from 'react';
import Leetcode from './student/Leetcode/Leetcode'; // Make sure this path is correct
import withAuth from '@/hoc/withAuth'; // Make sure this path is correct
import { CategoryBox } from '@/components/CategoryBox'; // Make sure this path is correct
import { useRouter } from 'next/navigation';
import Codechef from './student/Codechef/CodeChef';
import { Code } from 'lucide-react';
import CodeforcesStats from './student/Codeforces/Codeforces';

const Home = () => {
  const [activeTab, setActiveTab] = useState('LeetCode');
  const router = useRouter();
  // selectedPerson will hold the full person object received from CategoryBox, or null
  const [selectedPerson, setSelectedPerson] = useState(null);

  // This handler receives the full person object (or null) from CategoryBox
  const handlePersonSelect = (person) => {
    console.log("Selected person object in Home:", person); // Optional: for debugging
    setSelectedPerson(person);
  };

  // Determine the ID to pass to Leetcode
  const personIdForLeetcode = selectedPerson ? selectedPerson.id : null;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-900">Dashboard</h1>
          <div className="flex items-center space-x-2">
            {/* Pass the handler to CategoryBox */}
            <CategoryBox onSelect={handlePersonSelect} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          {['LeetCode', 'CodeChef', 'Codeforces', 'GitHub'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 ${
                activeTab === tab
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* --- START: Added Selected Student Info Section --- */}
        {selectedPerson && (
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-indigo-800 mb-2">
              Student Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700">
              <p><span className="font-medium text-gray-900">Name:</span> {selectedPerson.first_name} {selectedPerson.last_name}</p>
              <p><span className="font-medium text-gray-900">Username:</span> {selectedPerson.username}</p>
              <p><span className="font-medium text-gray-900">Email:</span> {selectedPerson.email}</p>
              <p><span className="font-medium text-gray-900">Role:</span> {selectedPerson.role}</p>
              <p><span className="font-medium text-gray-900">Enrollment Year:</span> {selectedPerson.enrollment_year}</p>
              <p><span className="font-medium text-gray-900">Graduation Year:</span> {selectedPerson.graduation_year}</p>
              {/* Add other fields as needed */}
              {/* <p><span className="font-medium text-gray-900">Phone:</span> {selectedPerson.phone_number}</p> */}
              {/* <p><span className="font-medium text-gray-900">Verified:</span> {selectedPerson.is_verified ? 'Yes' : 'No'}</p> */}
            </div>
          </div>
        )}
        {/* --- END: Added Selected Student Info Section --- */}


        {/* Tab Content */}
        {/* Leetcode component still receives only the ID */}
        {activeTab === 'LeetCode' && (
          <>
            <Leetcode id={personIdForLeetcode} />
          </>
        )}

        {activeTab === 'CodeChef' && (
          <>
            <Codechef id={personIdForLeetcode} />
          </>
        )}

        {activeTab === 'Codeforces' && (
          <>
            <CodeforcesStats id={personIdForLeetcode} />
          </>
        )}

        {activeTab === 'GitHub' && (
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-indigo-900 mb-4">GitHub Stats</h2>
             {/* Pass ID if GitHub component needs it */}
            {/* <GitHubComponent id={personIdForLeetcode} /> */}
            <p className="text-gray-600">GitHub data coming soon...</p>
             {/* Display message if no student selected */}
             {!selectedPerson && <p className="text-gray-500 mt-2">Select a student to view GitHub stats.</p>}
          </div>
        )}
      </main>
    </div>
  );
};

export default withAuth(Home);