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
import { X, Save, PenTool } from 'lucide-react'

interface RepairFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (record: RepairRecord) => void
  editRecord?: RepairRecord | null
}

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
    }
  }, [editRecord, isOpen])

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.roomNumber || !formData.teacherName || !formData.symptom) {
      alert('Please fill in all required fields')
      return
    }
    
    // Validate equipment type (since shadcn Select doesn't support native required)
    if (!formData.equipmentType) {
      alert('Please select an equipment type')
      return
    }
    
    const finalSignature = signaturePadRef.current?.getSignature() || signature
    
    const record: RepairRecord = {
      id: editRecord?.id || crypto.randomUUID(),
      ...formData,
      signature: finalSignature,
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
                  {editRecord ? 'Edit Repair Report' : 'New Repair Report'}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roomNumber">Room Number</Label>
                      <Input
                        id="roomNumber"
                        placeholder="e.g., A101"
                        value={formData.roomNumber}
                        onChange={(e) => handleChange('roomNumber', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="teacherName">Teacher Name</Label>
                      <Input
                        id="teacherName"
                        placeholder="Enter teacher name"
                        value={formData.teacherName}
                        onChange={(e) => handleChange('teacherName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="equipmentType">Equipment Type</Label>
                      <Select
                        value={formData.equipmentType}
                        onValueChange={(value) => handleChange('equipmentType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select equipment" />
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
                    <Label htmlFor="symptom">Symptom</Label>
                    <Textarea
                      id="symptom"
                      placeholder="Describe the issue..."
                      value={formData.symptom}
                      onChange={(e) => handleChange('symptom', e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="repairDetails">Repair Details</Label>
                    <Textarea
                      id="repairDetails"
                      placeholder="What repairs were done..."
                      value={formData.repairDetails}
                      onChange={(e) => handleChange('repairDetails', e.target.value)}
                      rows={2}
                    />
                  </div>

                  {editRecord && (
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
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
                    <Label>Teacher Signature</Label>
                    <SignaturePad
                      ref={signaturePadRef}
                      onSignatureChange={setSignature}
                      initialSignature={editRecord?.signature}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleSubmit} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      {editRecord ? 'Update Report' : 'Submit Report'}
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
