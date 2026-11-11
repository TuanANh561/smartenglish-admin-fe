import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ClassListView from './components/ClassListView'
import ClassDetailView from './components/ClassDetailView'
import StudentDetailView from './components/StudentDetailView'
import { getClassDetail, getTeacherClasses } from './classApi'

/**
 * Trang Quản lý lớp học của giáo viên:
 * Điều phối giữa 3 view chính:
 * - list: Danh sách các lớp học
 * - detail: Chi tiết một lớp học (Học viên, Bài tập, Bảng điểm)
 * - student: Chi tiết tiến độ và điểm của 1 học viên cụ thể trong lớp
 */
function TeacherClassesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const classIdParam = searchParams.get('classId')

  const [view, setView] = useState('list')
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)

  const selectedClassRef = useRef(null)
  useEffect(() => {
    selectedClassRef.current = selectedClass
  }, [selectedClass])
  const prevClassIdRef = useRef(classIdParam)

  // Mở chi tiết lớp theo classId trên URL; phản hồi về muộn sau khi đã rời trang thì bỏ qua
  useEffect(() => {
    const prevClassId = prevClassIdRef.current
    prevClassIdRef.current = classIdParam

    if (!classIdParam) {
      // Nút Back của trình duyệt xoá classId → về danh sách
      if (prevClassId) {
        setSelectedClass(null)
        setSelectedStudent(null)
        setView('list')
      }
      return undefined
    }

    const current = selectedClassRef.current
    if (current && String(current.id) === String(classIdParam)) return undefined

    let cancelled = false
    const open = (found) => {
      if (cancelled || !found) return
      setSelectedClass(found)
      setView('detail')
    }

    getClassDetail(classIdParam)
      .then(open)
      .catch(() => {
        getTeacherClasses({ size: 100 })
          .then((resList) => {
            const items = resList?.items || resList?.content || (Array.isArray(resList) ? resList : [])
            open(items.find((c) => String(c.id) === String(classIdParam) || c.code === classIdParam))
          })
          .catch(() => {})
      })

    return () => {
      cancelled = true
    }
  }, [classIdParam])

  const handleViewClass = (cls) => {
    setSelectedClass(cls)
    setSelectedStudent(null)
    setView('detail')
    if (cls?.id) {
      setSearchParams({ classId: cls.id })
    }
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
    if (classIdParam) {
      setSearchParams({}, { replace: true })
    }
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
