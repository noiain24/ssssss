'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Dashboard from '@/components/Dashboard'
import DataTable from '@/components/DataTable'
import RepairForm from '@/components/RepairForm'
import { RepairRecord } from '@/lib/types'
import { 
  getRecords, 
  addRecord, 
  updateRecord, 
  deleteRecord,
  syncToSheetDB,
  updateSheetDBRecord,
  deleteSheetDBRecord
} from '@/lib/storage'
import { 
  Plus, 
  LayoutDashboard, 
  Table2, 
  Wrench,
  Loader2
} from 'lucide-react'

export default function MaintenanceApp() {
  const [records, setRecords] = useState<RepairRecord[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<RepairRecord | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const loadedRecords = getRecords()
    setRecords(loadedRecords)
    setIsLoading(false)
  }, [])

  const handleSubmit = useCallback(async (record: RepairRecord) => {
    setIsSyncing(true)
    
    if (editingRecord) {
      const updatedRecords = updateRecord(record)
      setRecords(updatedRecords)
      // Update in SheetDB
      await updateSheetDBRecord(record)
    } else {
      const newRecords = addRecord(record)
      setRecords(newRecords)
      // Sync new record to SheetDB
      await syncToSheetDB(record)
    }
    
    setEditingRecord(null)
    setIsSyncing(false)
  }, [editingRecord])

  const handleEdit = useCallback((record: RepairRecord) => {
    setEditingRecord(record)
    setIsFormOpen(true)
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    const updatedRecords = deleteRecord(id)
    setRecords(updatedRecords)
    // Delete from SheetDB
    await deleteSheetDBRecord(id)
  }, [])

  const handleOpenForm = () => {
    setEditingRecord(null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingRecord(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Wrench className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Smart Classroom</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">Maintenance System</p>
              </div>
            </div>
            <Button onClick={handleOpenForm} size="sm" className="gap-2">
              {isSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">New Report</span>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="records" className="gap-2">
              <Table2 className="w-4 h-4" />
              <span>Records</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard records={records} />
            </motion.div>
          </TabsContent>

          <TabsContent value="records" className="mt-0">
            <motion.div
              key="records"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <DataTable 
                records={records} 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Repair Form Modal */}
      <RepairForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        editRecord={editingRecord}
      />

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            Smart Classroom Maintenance System • Powered by React
          </p>
        </div>
      </footer>
    </div>
  )
}
