import React, { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import http from 'src/utils/http'
import { residentApi } from 'src/apis/resident_api/residents.api'
import { apartmentApi } from 'src/apis/apartment_api/apartment_api'
import { toast } from 'react-toastify'
import type { Resident12 } from 'src/types/resident.type'
import type { ApartmentData } from 'src/types/apartment.type'

type ResidentDetailFlat = {
  fullName?: string
  phone?: string
  email?: string | null
}

const relationshipOptions = [
  { value: 'OWNER', label: 'Chủ hộ' },
  { value: 'FAMILY', label: 'Thành viên gia đình' },
  { value: 'TENANT', label: 'Người thuê' }
]

type Props = {
  isOpen: boolean
  onClose: () => void
  resident: Resident12 | null
}

export default function AddResidentToApartmentModal({ isOpen, onClose, resident }: Props) {
  const queryClient = useQueryClient()
  const [apartmentId, setApartmentId] = useState('')
  const [relationship, setRelationship] = useState('FAMILY')
  const [moveInDate, setMoveInDate] = useState(() => new Date().toISOString().split('T')[0])
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  const isUnassigned = resident?.isUnassigned === true
  const profileId = !isUnassigned ? resident?.id : undefined

  const { data: detailRes, isLoading: loadingDetail } = useQuery({
    queryKey: ['resident', profileId],
    queryFn: () => residentApi.getResidentById(profileId!),
    enabled: isOpen && !!profileId && !isUnassigned
  })

  const detail = detailRes?.data?.data as ResidentDetailFlat | undefined

  const { data: aptRes, isLoading: loadingApts } = useQuery({
    queryKey: ['apartments', 'pick-for-resident'],
    queryFn: () => apartmentApi.getAllApartment({ page: 0, size: 500 }),
    enabled: isOpen
  })

  const apartments: ApartmentData[] = aptRes?.data?.data ?? []

  useEffect(() => {
    if (!isOpen) {
      setApartmentId('')
      setRelationship('FAMILY')
      setMoveInDate(new Date().toISOString().split('T')[0])
      setFullName('')
      setPhone('')
      setEmail('')
      return
    }
    if (isUnassigned && resident) {
      setFullName(resident.fullName || '')
      setPhone(resident.phone || '')
      setEmail(resident.email ? String(resident.email) : '')
      return
    }
    if (detail) {
      setFullName(detail.fullName || resident?.fullName || '')
      setPhone(detail.phone || '')
      setEmail(detail.email ? String(detail.email) : '')
    }
  }, [isOpen, detail, resident, isUnassigned])

  const addMutation = useMutation({
    mutationFn: async () => {
      const aid = parseInt(apartmentId, 10)
      if (!Number.isFinite(aid)) throw new Error('INVALID_APT')

      if (isUnassigned && resident?.userId) {
        return residentApi.createResident({
          userId: Number(resident.userId),
          apartmentId: aid,
          relationship,
          moveInDate
        })
      }

      return http.post(`/api/apartments/${aid}/residents`, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        relationship,
        moveInDate
      })
    },
    onSuccess: () => {
      toast.success('Đã thêm cư dân vào căn hộ')
      queryClient.invalidateQueries({ queryKey: ['residents'] })
      onClose()
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Thêm vào căn hộ thất bại'
      toast.error(msg)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!apartmentId) {
      toast.error('Vui lòng chọn căn hộ')
      return
    }
    if (!fullName.trim()) {
      toast.error('Vui lòng nhập họ tên')
      return
    }
    if (!phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại')
      return
    }
    if (!/^(0|\+84)[1-9][0-9]{8}$/.test(phone.trim())) {
      toast.error('Số điện thoại không hợp lệ (VD: 0901234567)')
      return
    }
    if (!moveInDate) {
      toast.error('Vui lòng chọn ngày vào ở')
      return
    }
    addMutation.mutate()
  }

  if (!isOpen || !resident) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isUnassigned ? 'Gán tài khoản vào căn hộ' : 'Thêm cư dân vào căn hộ'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{resident.fullName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {loadingDetail && !isUnassigned && (
            <p className="text-sm text-blue-600">Đang tải thông tin cư dân...</p>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Căn hộ đích *</label>
            <select
              value={apartmentId}
              onChange={(e) => setApartmentId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              disabled={loadingApts}
              required
            >
              <option value="">{loadingApts ? 'Đang tải...' : '— Chọn căn hộ —'}</option>
              {apartments.map((a) => (
                <option key={a.id} value={a.id}>
                  {(a.apartmentCode || a.id) + (a.buildingName ? ` — ${a.buildingName}` : '')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Họ và tên *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Số điện thoại *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Mối quan hệ</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {relationshipOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày vào ở *</label>
              <input
                type="date"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={addMutation.isPending || loadingDetail}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {addMutation.isPending ? 'Đang lưu...' : 'Xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
