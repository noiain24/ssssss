export interface RepairRecord {
  id: string
  date: string
  roomNumber: string
  teacherName: string
  equipmentType: string
  symptom: string
  repairDetails: string
  signature: string
  status: 'pending' | 'repaired' | 'cannot-repair'
  createdAt: string
  updatedAt: string
}

export type EquipmentType = 'PC' | 'Mic' | 'Speaker' | 'TV' | 'Cable' | 'Others'

export const EQUIPMENT_TYPES: EquipmentType[] = ['PC', 'Mic', 'Speaker', 'TV', 'Cable', 'Others']

export const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'repaired', label: 'Repaired' },
  { value: 'cannot-repair', label: 'Cannot Repair' },
] as const

export type StatusType = RepairRecord['status']
