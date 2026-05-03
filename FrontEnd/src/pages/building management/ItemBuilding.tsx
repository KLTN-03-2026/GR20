import type { Buildings } from 'src/types/buildings.type'

interface Props {
  building: Buildings
  onEdit?: (building: Buildings) => void
  onDelete?: (building: Buildings) => void
  onReopen?: (building: Buildings) => void
  onManageImages?: (building: Buildings) => void
}

export default function ItemBuilding({ building, onEdit, onDelete, onReopen, onManageImages }: Props) {
  return (
    <tr className='hover:bg-gray-50/50 transition-colors group'>
      {/* Name */}
      <td className='px-6 py-5'>
        <div className='font-bold text-gray-900'>{building.name}</div>
      </td>
      {/* Code */}
      <td className='px-6 py-5 font-mono text-xs text-gray-500'>{building.code}</td>
      {/* Address */}
      <td className='px-6 py-5 text-sm text-gray-500'>{building.address}</td>
      {/* Floors */}
      <td className='px-6 py-5 text-sm text-center font-medium'>
        {building.totalFloors ?? <span className='text-gray-300'>—</span>}
      </td>
      {/* Units */}
      <td className='px-6 py-5 text-sm text-center font-medium'>
        {building.totalApartments ?? <span className='text-gray-300'>—</span>}
      </td>
      {/* Status */}
      <td className='px-6 py-5'>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
            building.status === 'ACTIVE'
              ? 'bg-emerald-50 text-emerald-700'
              : building.status === 'MAINTENANCE'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-red-50 text-red-700'
          }`}
        >
          {building.status}
        </span>
      </td>
      {/* Actions */}
      <td className='px-6 py-5 text-right'>
        <div className='flex items-center justify-end gap-3 text-sm font-medium'>
          <button
            type='button'
            onClick={() => onManageImages && onManageImages(building)}
            className='text-[#0052CC] hover:underline'
          >
            Chi tiết
          </button>
          <button
            type='button'
            onClick={() => onEdit && onEdit(building)}
            className='text-orange-600 hover:underline'
          >
            Sửa
          </button>
          {building.status === 'CLOSED' ? (
            <button
              type='button'
              onClick={() => onReopen && onReopen(building)}
              className='text-emerald-600 hover:underline'
            >
              Mở lại
            </button>
          ) : (
            <button
              type='button'
              onClick={() => onDelete && onDelete(building)}
              className='text-red-600 hover:underline'
            >
              Xóa
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
