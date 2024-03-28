import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import CourseCard from './CourseCard'; // Create a CourseCard component to represent each course
import { useNavigate } from "react-router-dom";

interface Course {
  id: string; // Assuming 'id' is a required property in your data
  attributes: {
    imageUrl: string;
    localizedMetadata?: {
      name: string;
    }[];
  };
  state?: string; // Define 'state' as an optional property
}

const AllCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();


  useEffect(() => {
    getCoursestoExplore();
  }, []);

  async function getCoursestoExplore() {
    try {
      const token = localStorage.getItem("access_token");
      const config = {
        headers: { Authorization: `oauth ${token}` },
      };
      const response = await axios.get(
        `https://learningmanager.adobe.com/primeapi/v2/learningObjects?page[limit]=20&filter.catalogIds=174313&sort=name&filter.learnerState=notenrolled&filter.ignoreEnhancedLP=true`,
        config
      );
      const result = response?.data?.data;
      setCourses(result);
    } catch (error) {
      console.error("Error fetching learning objects:", error);
    }
  }


  const EnrollHandle = async (cid: string) => {
    const course = (courses as any).find(obj => obj?.id === cid);
    const Iid = course.relationships?.instances?.data?.[0].id;

    console.log("nnnnnnn", course, Iid)
    const token = localStorage.getItem("access_token")
    try {
      const response = await fetch('https://learningmanager.adobe.com/primeapi/v2/enrollments?loId=' + cid + '&loInstanceId=' + encodeURIComponent(Iid), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        navigate('/')
        throw new Error('Failed to enroll');
      } else {
        navigate(`/learning_object/${cid}/instance/${Iid}/isDashboard=false/isCustomer=true/detailspage`);
      }
    } catch (error) {
      console.log(error)
    }

  }
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  const filteredCourses = courses.filter(course =>
    course?.attributes?.localizedMetadata?.[0]?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleGoToExplore = () => {
    navigate('/dashboard')
  }
  return (
    <>
    
      <div className='mb-20'>
            <Header isLogin={true} />
          </div>
    <div className='px-6'>
      <h1 className="text-2xl font-bold mb-4">All Courses</h1>
      <input
        type="text"
        placeholder="Search courses..."
        value={searchQuery}
        onChange={handleSearch}
        className="border border-gray-300 rounded-md px-4 py-2 mb-4"
      />
      <div className="text-blue-500" style={{ float: 'right', marginTop: '-20px' }}>
        <button onClick={handleGoToExplore}>Go To Dashboard</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} EnrollHandle={EnrollHandle} />
        ))}
      </div>
    </div>
    </>
  );
};

export default AllCourses;
