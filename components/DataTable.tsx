'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { RepairRecord, EQUIPMENT_TYPES, STATUS_OPTIONS } from '@/lib/types'
import { exportToCSV } from '@/lib/storage'
import { 
  Search, 
  Download, 
  Filter, 
  Edit2, 
  Trash2,
  FileSpreadsheet,
  X
} from 'lucide-react'

interface DataTableProps {
  records: RepairRecord[]
  onEdit: (record: RepairRecord) => void
  onDelete: (id: string) => void
}

export default function DataTable({ records, onEdit, onDelete }: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = 
        record.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.symptom.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter
      const matchesEquipment = equipmentFilter === 'all' || record.equipmentType === equipmentFilter

      return matchesSearch && matchesStatus && matchesEquipment
    })
  }, [records, searchQuery, statusFilter, equipmentFilter])

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

  const handleExport = () => {
    exportToCSV(filteredRecords)
  }

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setEquipmentFilter('all')
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || equipmentFilter !== 'all'

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              รายการประวัติการแจ้งซ่อม
            </CardTitle>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              ดาวน์โหลดไฟล์ CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาเลขห้อง, ชื่อครู หรืออาการที่พบ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="สถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกสถานะ</SelectItem>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="อุปกรณ์" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกอุปกรณ์</SelectItem>
                  {EQUIPMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>วันที่ตรวจ</TableHead>
                    <TableHead>ห้องเรียน</TableHead>
                    <TableHead className="hidden md:table-cell">ครูผู้แจ้ง</TableHead>
                    <TableHead>อุปกรณ์</TableHead>
                    <TableHead className="hidden lg:table-cell">อาการที่พบ</TableHead>
                    <TableHead>รูปภาพ</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((record, index) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.02 }}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            {new Date(record.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{record.roomNumber}</TableCell>
                          <TableCell className="hidden md:table-cell">{record.teacherName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.equipmentType}</Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell max-w-[200px] truncate">
                            {record.symptom}
                          </TableCell>
                          <TableCell>
                             {record.photo ? (
                               <img
                                 src={record.photo}
                                 alt="รูปซ่อม"
                                 className="w-8 h-8 object-cover rounded border cursor-pointer hover:scale-105 transition-transform"
                                 onClick={() => setSelectedPhoto(record.photo || null)}
                               />
                             ) : (
                               <span className="text-muted-foreground/40 text-xs">-</span>
                             )}
                          </TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(record)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(record.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          {records.length === 0 
                            ? 'ยังไม่มีประวัติแจ้งซ่อมในระบบ เริ่มแจ้งซ่อมใหม่ได้เลย!'
                            : 'ไม่พบข้อมูลแจ้งซ่อมที่ค้นหา'}
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            แสดงผล {filteredRecords.length} จากทั้งหมด {records.length} รายการ
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>คุณต้องการลบรายงานนี้ใช่หรือไม่?</AlertDialogTitle>
            <AlertDialogDescription>
              การดำเนินการนี้จะไม่สามารถกู้ข้อมูลคืนได้ รายงานการซ่อมนี้จะถูกลบออกอย่างถาวร
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              ยืนยันลบข้อมูล
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Photo Preview Dialog */}
      <AlertDialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex justify-between items-center">
              <span>รูปภาพประกอบ</span>
              <Button variant="ghost" size="icon" onClick={() => setSelectedPhoto(null)} className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </AlertDialogTitle>
            <div className="mt-4 rounded-lg overflow-hidden border bg-muted flex items-center justify-center max-h-[60vh]">
              {selectedPhoto && (
                <img
                  src={selectedPhoto}
                  alt="Full preview"
                  className="w-full h-auto object-contain max-h-[50vh]"
                />
              )}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedPhoto(null)}>ปิด</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
