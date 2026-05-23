export interface RepairRecord {
  id: string
  date: string
  roomNumber: string
  teacherName: string
  equipmentType: string
  symptom: string
  repairDetails: string
  signature: string
  photo?: string
  status: 'pending' | 'repaired' | 'cannot-repair'
  createdAt: string
  updatedAt: string
}

export type EquipmentType = 'PC' | 'Mic' | 'Speaker' | 'TV' | 'Cable' | 'Others'

export const EQUIPMENT_TYPES: EquipmentType[] = ['PC', 'Mic', 'Speaker', 'TV', 'Cable', 'Others']

export const STATUS_OPTIONS = [
  { value: 'pending', label: 'รอดำเนินการ' },
  { value: 'repaired', label: 'ซ่อมเสร็จสิ้น' },
  { value: 'cannot-repair', label: 'ไม่สามารถซ่อมได้' },
] as const

export type StatusType = RepairRecord['status']
