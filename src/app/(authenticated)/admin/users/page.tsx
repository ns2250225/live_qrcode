"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"

interface User {
  id: string
  email: string
  role: string
  points: number
  created_at: string
  _count: {
    codes: number
    invitees: number
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newPoints, setNewPoints] = useState<number | string>("")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      } else {
        toast.error("获取用户失败。权限不足？")
      }
    } catch (error) {
      toast.error("获取用户出错")
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (user: User) => {
    setEditingUser(user)
    setNewPoints(user.points)
    setOpen(true)
  }

  const handleUpdatePoints = async () => {
    if (!editingUser) return

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: Number(newPoints) }),
      })

      if (res.ok) {
        toast.success("用户积分已更新")
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, points: Number(newPoints) } : u))
        setOpen(false)
      } else {
        toast.error("更新积分失败")
      }
    } catch (error) {
      toast.error("更新积分出错")
    }
  }

  if (loading) return <div>加载用户中...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">用户管理</h1>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>邮箱</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>积分</TableHead>
              <TableHead>活码数</TableHead>
              <TableHead>邀请数</TableHead>
              <TableHead>加入时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.points}</TableCell>
                <TableCell>{user._count.codes}</TableCell>
                <TableCell>{user._count.invitees}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(user)}>
                    修改积分
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改用户积分</DialogTitle>
            <DialogDescription>
              更新用户的积分余额：{editingUser?.email}。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="points" className="text-right">
                积分
              </Label>
              <Input
                id="points"
                type="number"
                value={newPoints}
                onChange={(e) => setNewPoints(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button onClick={handleUpdatePoints}>保存更改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
