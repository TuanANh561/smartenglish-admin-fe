import { useState } from 'react'
import ClassListView from './components/ClassListView'
import ClassDetailView from './components/ClassDetailView'
import StudentDetailView from './components/StudentDetailView'

/**
 * Trang Quản lý lớp học của giáo viên:
 * Điều phối giữa 3 view chính:
 * - list: Danh sách các lớp học
 * - detail: Chi tiết một lớp học (Học viên, Bài tập, Bảng điểm)
 * - student: Chi tiết tiến độ và điểm của 1 học viên cụ thể trong lớp
 */
function TeacherClassesPage() {
  const [view, setView] = useState('list')
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)

  const handleViewClass = (cls) => {
    setSelectedClass(cls)
    setSelectedStudent(null)
    setView('detail')
  }

  const handleViewStudent = (student, cls) => {
    setSelectedClass(cls)
    setSelectedStudent(student)
    setView('student')
  }

  const handleBackToList = () => {
    setSelectedClass(null)
    setSelectedStudent(null)
    setView('list')
  }

  const handleBackToDetail = () => {
    setSelectedStudent(null)
    setView('detail')
  }

  if (view === 'detail' && selectedClass) {
    return (
      <ClassDetailView
        cls={selectedClass}
        onBack={handleBackToList}
        onViewStudent={handleViewStudent}
      />
    )
  }

  if (view === 'student' && selectedStudent && selectedClass) {
    return (
      <StudentDetailView
        student={selectedStudent}
        cls={selectedClass}
        onBack={handleBackToDetail}
      />
    )
  }

  return <ClassListView onViewClass={handleViewClass} />
}

export default TeacherClassesPage
