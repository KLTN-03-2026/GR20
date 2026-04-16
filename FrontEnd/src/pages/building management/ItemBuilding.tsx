import type { Buildings } from 'src/types/buildings.type'

interface Props {
  building: Buildings
  onEdit?: (building: Buildings) => void
  onDelete?: (building: Buildings) => void
  onReopen?: (building: Buildings) => void
}

export default function ItemBuilding({ building, onEdit, onDelete, onReopen }: Props) {
  return (
    <tr className='hover:bg-gray-50/50 transition-colors group'>
      {/* Name */}
      <td className='px-6 py-5'>
        <div className='flex items-center gap-3'>
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              building.status === 'ACTIVE' ? 'bg-blue-50' : 'bg-gray-100'
            }`}
          >
            <span
              className={`material-symbols-outlined ${building.status === 'ACTIVE' ? 'text-blue-600' : 'text-gray-400'}`}
            >
              domain
            </span>
          </div>
          <span className='font-semibold'>{building.name}</span>
        </div>
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
            building.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {building.status}
        </span>
      </td>
      {/* Actions */}
      <td className='px-6 py-5 text-right'>
        <div className='flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
          <button
            type='button'
            onClick={() => onEdit && onEdit(building)}
            className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all'
          >
            <span className='material-symbols-outlined text-[20px]'>edit</span>
          </button>
          {building.status === 'CLOSED' ? (
            <button
              type='button'
              onClick={() => onReopen && onReopen(building)}
              className='p-2 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all'
            >
              <span className='material-symbols-outlined text-[20px]'>restart_alt</span>
            </button>
          ) : (
            <button
              type='button'
              onClick={() => onDelete && onDelete(building)}
              className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all'
            >
              <span className='material-symbols-outlined text-[20px]'>delete</span>
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
