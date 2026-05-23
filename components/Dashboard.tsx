'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { RepairRecord } from '@/lib/types'
import { 
  ClipboardList, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Monitor,
  Building2
} from 'lucide-react'

interface DashboardProps {
  records: RepairRecord[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function Dashboard({ records }: DashboardProps) {
  const totalCases = records.length
  const repairedCases = records.filter(r => r.status === 'repaired').length
  const pendingCases = records.filter(r => r.status === 'pending').length
  const cannotRepairCases = records.filter(r => r.status === 'cannot-repair').length

  // Equipment type data
  const equipmentData = records.reduce((acc, record) => {
    const existing = acc.find(item => item.name === record.equipmentType)
    if (existing) {
      existing.count += 1
    } else {
      acc.push({ name: record.equipmentType, count: 1 })
    }
    return acc
  }, [] as { name: string; count: number }[])

  // Room data
  const roomData = records.reduce((acc, record) => {
    const existing = acc.find(item => item.name === record.roomNumber)
    if (existing) {
      existing.count += 1
    } else {
      acc.push({ name: record.roomNumber, count: 1 })
    }
    return acc
  }, [] as { name: string; count: number }[]).slice(0, 8)

  // Recent activity
  const recentActivity = records.slice(0, 5)

  const getStatusBadge = (status: RepairRecord['status']) => {
    switch (status) {
      case 'repaired':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Repaired</Badge>
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Pending</Badge>
      case 'cannot-repair':
        return <Badge className="bg-red-500/10 text-red-600 border-red-200">Cannot Repair</Badge>
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Cases</p>
                  <p className="text-3xl font-bold text-blue-700">{totalCases}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <ClipboardList className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">Repaired</p>
                  <p className="text-3xl font-bold text-emerald-700">{repairedCases}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-full">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Pending</p>
                  <p className="text-3xl font-bold text-amber-700">{pendingCases}</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-full">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Cannot Repair</p>
                  <p className="text-3xl font-bold text-red-700">{cannotRepairCases}</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Monitor className="w-5 h-5" />
                Cases by Equipment Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              {equipmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={equipmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {equipmentData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5" />
                Cases by Room Number
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roomData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={roomData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {roomData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {record.teacherName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{record.teacherName}</p>
                        <p className="text-sm text-muted-foreground">
                          Room {record.roomNumber} • {record.equipmentType}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(record.status)}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
