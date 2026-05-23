'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RepairRecord } from '@/lib/types'
import { CheckCircle2, Calendar, ClipboardCheck, Wrench } from 'lucide-react'

interface ScheduleTodoProps {
  records: RepairRecord[]
  onEdit: (record: RepairRecord) => void
}

const THAI_DAYS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']

export default function ScheduleTodo({ records, onEdit }: ScheduleTodoProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [filterMode, setFilterMode] = useState<'all-pending' | 'selected-day'>('all-pending')

  // Generate current week dates
  const weekDates = useMemo(() => {
    const today = new Date()
    const result = []
    const dayOfWeek = today.getDay()
    // adjust when day is Sunday
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) 
    const startOfWeek = new Date(today.setDate(diff))

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      result.push(date)
    }
    return result
  }, [])

  // Check if a date has any records
  const hasRecordsOnDate = (dateStr: string) => {
    return records.some(r => r.date === dateStr)
  }

  // Filter records based on selected date or all pending
  const filteredRecords = useMemo(() => {
    if (filterMode === 'all-pending') {
      return records.filter(r => r.status === 'pending')
    } else {
      return records.filter(r => r.date === selectedDate)
    }
  }, [records, selectedDate, filterMode])

  const getStatusBadge = (status: RepairRecord['status']) => {
    switch (status) {
      case 'repaired':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">ซ่อมเสร็จสิ้น</Badge>
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">รอดำเนินการ</Badge>
      case 'cannot-repair':
        return <Badge className="bg-red-500/10 text-red-600 border-red-200">ไม่สามารถซ่อมได้</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Weekly Calendar Strip */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4 text-primary font-medium">
            <Calendar className="w-5 h-5" />
            <span>ตารางกำหนดการสัปดาห์นี้</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date) => {
              const dateStr = date.toISOString().split('T')[0]
              const isSelected = selectedDate === dateStr
              const isToday = new Date().toISOString().split('T')[0] === dateStr
              const hasDot = hasRecordsOnDate(dateStr)

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    setSelectedDate(dateStr)
                    setFilterMode('selected-day')
                  }}
                  className={`flex flex-col items-center p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : isToday
                      ? 'bg-muted/50 border-primary/40 text-primary font-semibold'
                      : 'bg-background hover:bg-muted/30 border-border'
                  }`}
                >
                  <span className="text-xs opacity-80">{THAI_DAYS[date.getDay()]}</span>
                  <span className="text-lg font-bold mt-1">{date.getDate()}</span>
                  {hasDot && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                        isSelected ? 'bg-primary-foreground' : 'bg-primary'
                      }`}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filter Mode Selector */}
      <div className="flex gap-2">
        <Button
          variant={filterMode === 'all-pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterMode('all-pending')}
          className="rounded-full"
        >
          <ClipboardCheck className="w-4 h-4 mr-2" />
          งานรอดำเนินการทั้งหมด ({records.filter(r => r.status === 'pending').length})
        </Button>
        <Button
          variant={filterMode === 'selected-day' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterMode('selected-day')}
          className="rounded-full"
        >
          <Calendar className="w-4 h-4 mr-2" />
          งานวันที่เลือก ({records.filter(r => r.date === selectedDate).length})
        </Button>
      </div>

      {/* To-Do List Cards */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className="overflow-hidden border hover:border-primary/40 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl font-bold text-primary">ห้อง {record.roomNumber}</span>
                        {getStatusBadge(record.status)}
                        <Badge variant="outline">{record.equipmentType}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">
                        ผู้แจ้ง: {record.teacherName} • วันที่ตรวจ: {new Date(record.date).toLocaleDateString('th-TH', { dateStyle: 'medium' })}
                      </p>
                      <div className="p-3 bg-muted/30 rounded-lg text-sm border-l-4 border-primary/55">
                        <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider mb-1">อาการขัดข้อง</span>
                        <p className="text-foreground">{record.symptom}</p>
                      </div>
                      {record.repairDetails && (
                        <div className="p-3 bg-emerald-50/10 rounded-lg text-sm border-l-4 border-emerald-400">
                          <span className="font-semibold text-emerald-600 block text-xs uppercase tracking-wider mb-1">รายละเอียดซ่อมบำรุง</span>
                          <p className="text-foreground">{record.repairDetails}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex md:flex-col gap-2 justify-end min-w-[120px]">
                      {record.status === 'pending' ? (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 flex-1 cursor-pointer"
                          onClick={() => {
                            // Open form in edit mode, prefilled with status 'repaired'
                            onEdit({
                              ...record,
                              status: 'repaired'
                            })
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>ซ่อมสำเร็จ</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 flex-1 cursor-pointer"
                          onClick={() => onEdit(record)}
                        >
                          <Wrench className="w-4 h-4" />
                          <span>แก้ไขงาน</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-muted-foreground bg-muted/10 rounded-xl border border-dashed"
            >
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-3" />
              <p className="font-medium text-base">ไม่มีรายการงานค้างที่ต้องดำเนินการ</p>
              <p className="text-sm opacity-80 mt-1">การทำงานของคุณเรียบร้อยดีทั้งหมด!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
