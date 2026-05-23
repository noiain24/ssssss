import { RepairRecord } from './types'

const STORAGE_KEY = 'classroom-maintenance-records'

export function getRecords(): RepairRecord[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export function saveRecords(records: RepairRecord[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function addRecord(record: RepairRecord): RepairRecord[] {
  const records = getRecords()
  records.unshift(record)
  saveRecords(records)
  return records
}

export function updateRecord(updatedRecord: RepairRecord): RepairRecord[] {
  const records = getRecords()
  const index = records.findIndex(r => r.id === updatedRecord.id)
  if (index !== -1) {
    records[index] = { ...updatedRecord, updatedAt: new Date().toISOString() }
    saveRecords(records)
  }
  return records
}

export function deleteRecord(id: string): RepairRecord[] {
  const records = getRecords().filter(r => r.id !== id)
  saveRecords(records)
  return records
}

// SheetDB Integration
const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/k8tii3oungwkc'

function translateStatusToThai(status: string): string {
  switch (status) {
    case 'repaired':
      return 'ซ่อมเสร็จสิ้น'
    case 'cannot-repair':
      return 'ไม่สามารถซ่อมได้'
    case 'pending':
    default:
      return 'รอดำเนินการ'
  }
}

export async function syncToSheetDB(record: RepairRecord): Promise<boolean> {
  try {
    const totalRecords = getRecords().length
    const response = await fetch(SHEETDB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [{
          'ลำดับ': totalRecords,
          'วันที่ตรวจ': record.date,
          'ห้องเรียน': record.roomNumber,
          'อุปกรณ์ที่พบปัญหา': record.equipmentType,
          'อาการที่พบ': record.symptom,
          'สาเหตุที่พบ': record.repairDetails,
          'ผลการดำเนินการ': translateStatusToThai(record.status),
          'รายละเอียดการซ่อม / แนวทางแก้ไข': record.repairDetails,
          'ชื่อครูผู้ใช้ห้อง / ผู้รับทราบ': record.teacherName,
          'ลายเซ็นต์': record.signature || '',
          'รูปภาพ': record.photo || '',
          'id': record.id,
        }]
      }),
    })
    return response.ok
  } catch (error) {
    console.error('Failed to sync to SheetDB:', error)
    return false
  }
}

export async function updateSheetDBRecord(record: RepairRecord): Promise<boolean> {
  try {
    const response = await fetch(`${SHEETDB_API_URL}/id/${record.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          'วันที่ตรวจ': record.date,
          'ห้องเรียน': record.roomNumber,
          'อุปกรณ์ที่พบปัญหา': record.equipmentType,
          'อาการที่พบ': record.symptom,
          'สาเหตุที่พบ': record.repairDetails,
          'ผลการดำเนินการ': translateStatusToThai(record.status),
          'รายละเอียดการซ่อม / แนวทางแก้ไข': record.repairDetails,
          'ชื่อครูผู้ใช้ห้อง / ผู้รับทราบ': record.teacherName,
          'ลายเซ็นต์': record.signature || '',
          'รูปภาพ': record.photo || '',
        }
      }),
    })
    return response.ok
  } catch (error) {
    console.error('Failed to update SheetDB record:', error)
    return false
  }
}

export async function deleteSheetDBRecord(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${SHEETDB_API_URL}/id/${id}`, {
      method: 'DELETE',
    })
    return response.ok
  } catch (error) {
    console.error('Failed to delete SheetDB record:', error)
    return false
  }
}

// CSV Export with UTF-8 BOM for Thai character support
export function exportToCSV(records: RepairRecord[]): void {
  const BOM = '\uFEFF'
  const headers = ['ID', 'Date', 'Room Number', 'Teacher Name', 'Equipment Type', 'Symptom', 'Repair Details', 'Status', 'Created At', 'Updated At']
  
  const csvContent = records.map(record => [
    record.id,
    record.date,
    record.roomNumber,
    record.teacherName,
    record.equipmentType,
    record.symptom.replace(/"/g, '""'),
    record.repairDetails.replace(/"/g, '""'),
    record.status,
    record.createdAt,
    record.updatedAt,
  ].map(field => `"${field}"`).join(','))
  
  const csv = BOM + [headers.join(','), ...csvContent].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `maintenance-records-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}
