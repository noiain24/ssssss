'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SignaturePad, { SignaturePadRef } from './SignaturePad'
import { RepairRecord, EQUIPMENT_TYPES, STATUS_OPTIONS } from '@/lib/types'
import { X, Save, PenTool, Camera, Trash2 } from 'lucide-react'

interface RepairFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (record: RepairRecord) => void
  editRecord?: RepairRecord | null
}

const SYMPTOM_PRESETS = [
  'เครื่องเปิดไม่ติด',
  'จอไม่มีสัญญาณ',
  'ไมค์เสียงไม่ดัง/ถ่านหมด',
  'ลำโพงเสียงแตก/ดับ',
  'เน็ตใช้งานไม่ได้',
  'สายต่อชำรุด/หลุด'
]

const REPAIR_PRESETS = [
  'เสียบสายใหม่/ขยับสาย',
  'ขัดทำความสะอาดแรม',
  'เปลี่ยนแบตเตอรี่ใหม่',
  'รีสตาร์ทเครื่อง/อุปกรณ์',
  'ประสานงานส่งซ่อมภายนอก',
  'ทดสอบแล้วปกติ'
]

export default function RepairForm({ isOpen, onClose, onSubmit, editRecord }: RepairFormProps) {
  const signaturePadRef = useRef<SignaturePadRef>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    roomNumber: '',
    teacherName: '',
    equipmentType: '' as string,
    symptom: '',
    repairDetails: '',
    status: 'pending' as RepairRecord['status'],
  })
  const [signature, setSignature] = useState('')
  const [photo, setPhoto] = useState('')

  useEffect(() => {
    if (editRecord) {
      setFormData({
        date: editRecord.date,
        roomNumber: editRecord.roomNumber,
        teacherName: editRecord.teacherName,
        equipmentType: editRecord.equipmentType,
        symptom: editRecord.symptom,
        repairDetails: editRecord.repairDetails,
        status: editRecord.status,
      })
      setSignature(editRecord.signature)
      setPhoto(editRecord.photo || '')
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        roomNumber: '',
        teacherName: '',
        equipmentType: '',
        symptom: '',
        repairDetails: '',
        status: 'pending',
      })
      setSignature('')
      setPhoto('')
    }
  }, [editRecord, isOpen])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxDim = 400
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          const base64 = canvas.toDataURL('image/jpeg', 0.6)
          setPhoto(base64)
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.roomNumber || !formData.teacherName || !formData.symptom) {
      alert('กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน')
      return
    }
    
    // Validate equipment type (since shadcn Select doesn't support native required)
    if (!formData.equipmentType) {
      alert('กรุณาเลือกประเภทของอุปกรณ์')
      return
    }
    
    const finalSignature = signaturePadRef.current?.getSignature() || signature
    
    const record: RepairRecord = {
      id: editRecord?.id || crypto.randomUUID(),
      ...formData,
      signature: finalSignature,
      photo: photo || undefined,
      createdAt: editRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    console.log('[v0] Submitting record:', record)
    onSubmit(record)
    onClose()
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] z-50 overflow-auto"
          >
            <Card className="h-full md:h-auto">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="w-5 h-5" />
                  {editRecord ? 'แก้ไขรายงานแจ้งซ่อม' : 'แจ้งซ่อมอุปกรณ์ใหม่'}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">วันที่ตรวจ</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roomNumber">เลขห้องเรียน</Label>
                      <Input
                        id="roomNumber"
                        placeholder="ตัวอย่างเช่น 304, A101"
                        value={formData.roomNumber}
                        onChange={(e) => handleChange('roomNumber', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="teacherName">ชื่อคุณครูผู้แจ้ง</Label>
                      <Input
                        id="teacherName"
                        placeholder="กรอกชื่อ-นามสกุลของคุณครู"
                        value={formData.teacherName}
                        onChange={(e) => handleChange('teacherName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="equipmentType">ประเภทอุปกรณ์</Label>
                      <Select
                        value={formData.equipmentType}
                        onValueChange={(value) => handleChange('equipmentType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกอุปกรณ์" />
                        </SelectTrigger>
                        <SelectContent>
                          {EQUIPMENT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="symptom">อาการที่พบ</Label>
                    <Textarea
                      id="symptom"
                      placeholder="กรอกอาการขัดข้องหรือปัญหาที่พบ..."
                      value={formData.symptom}
                      onChange={(e) => handleChange('symptom', e.target.value)}
                      rows={2}
                    />
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {SYMPTOM_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            const current = formData.symptom
                            handleChange('symptom', current ? `${current}, ${preset}` : preset)
                          }}
                          className="px-2.5 py-1 text-xs rounded-full border bg-muted/40 hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="repairDetails">รายละเอียดการซ่อม / แนวทางแก้ไข</Label>
                    <Textarea
                      id="repairDetails"
                      placeholder="ระบุรายละเอียดการซ่อมบำรุงหรือแนวทางแก้ไข..."
                      value={formData.repairDetails}
                      onChange={(e) => handleChange('repairDetails', e.target.value)}
                      rows={2}
                    />
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {REPAIR_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            const current = formData.repairDetails
                            handleChange('repairDetails', current ? `${current}, ${preset}` : preset)
                          }}
                          className="px-2.5 py-1 text-xs rounded-full border bg-muted/40 hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {editRecord && (
                    <div className="space-y-2">
                      <Label htmlFor="status">สถานะ</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleChange('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="photo-upload">รูปภาพประกอบ (ถ้ามี)</Label>
                    <div className="flex items-center gap-4">
                      {photo ? (
                        <div className="relative w-28 h-20 rounded-lg border overflow-hidden bg-muted">
                          <img
                            src={photo}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setPhoto('')}
                            className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors animate-in fade-in"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-28 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors cursor-pointer bg-muted/20">
                          <Camera className="w-6 h-6 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground mt-1">ถ่ายรูป / แนบรูป</span>
                          <input
                            type="file"
                            id="photo-upload"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                        </label>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {photo ? 'แนบรูปภาพแล้ว (ถูกบีบอัดสำหรับ Google Sheets)' : 'ถ่ายรูปด้วยมือถือหรือเลือกไฟล์รูปภาพ'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>ลายเซ็นคุณครูผู้แจ้ง / ผู้รับทราบ</Label>
                    <SignaturePad
                      ref={signaturePadRef}
                      onSignatureChange={setSignature}
                      initialSignature={editRecord?.signature}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                      ยกเลิก
                    </Button>
                    <Button type="button" onClick={handleSubmit} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      {editRecord ? 'อัปเดตข้อมูล' : 'บันทึกแจ้งซ่อม'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
