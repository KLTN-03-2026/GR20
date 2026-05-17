import type { Buildings } from 'src/types/buildings.type'
import {
  buildingHasLinkedData,
  buildingStatusBadgeClass,
  buildingStatusLabel
} from './building-admin-ui'
import {
  ROW_ACTION_BASE,
  ROW_ACTION_DELETE,
  ROW_ACTION_EDIT,
  ROW_ACTION_RESTORE
} from 'src/utils/row-action-buttons'

interface Props {
  building: Buildings
  onEdit?: (building: Buildings) => void
  onDelete?: (building: Buildings) => void
  onReopen?: (building: Buildings) => void
  onManageImages?: (building: Buildings) => void
}

export default function ItemBuilding({ building, onEdit, onDelete, onReopen, onManageImages }: Props) {
  const linked = buildingHasLinkedData(building)
  const statusKey = (building.status || '').toUpperCase()
  const statusText = buildingStatusLabel[statusKey] || building.status

  return (
    <tr className='group border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80'>
      <td className='px-6 py-4'>
        <div className='font-semibold text-slate-900'>{building.name}</div>
        {linked && building.status !== 'CLOSED' && (
          <p className='mt-1 max-w-xs text-xs text-amber-800'>
            Có {Number(building.linkedFloorCount ?? 0)} tầng, {Number(building.linkedApartmentCount ?? 0)} căn — không thể đóng tòa cho đến khi gỡ hết.
          </p>
        )}
      </td>
      <td className='px-6 py-4 font-mono text-xs text-slate-600'>{building.code}</td>
      <td className='px-6 py-4 text-sm text-slate-600'>{building.address}</td>
      <td className='px-6 py-4 text-center text-sm font-medium tabular-nums text-slate-800'>
        {building.totalFloors ?? <span className='text-slate-300'>—</span>}
      </td>
      <td className='px-6 py-4 text-center text-sm font-medium tabular-nums text-slate-800'>
        {building.totalApartments ?? <span className='text-slate-300'>—</span>}
      </td>
      <td className='px-6 py-4'>
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${buildingStatusBadgeClass(building.status)}`}
        >
          {statusText}
        </span>
      </td>
      <td className='px-6 py-4 text-right'>
        <div className='flex flex-wrap items-center justify-end gap-2'>
          <button type='button' className={ROW_ACTION_EDIT} onClick={() => onManageImages && onManageImages(building)}>
            Chi tiết
          </button>
          <button
            type='button'
            className={`${ROW_ACTION_BASE} border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 focus:ring-amber-300`}
            onClick={() => onEdit && onEdit(building)}
          >
            Sửa
          </button>
          {building.status === 'CLOSED' ? (
            <button type='button' className={ROW_ACTION_RESTORE} onClick={() => onReopen && onReopen(building)}>
              Mở lại
            </button>
          ) : (
            <button
              type='button'
              className={ROW_ACTION_DELETE}
              disabled={linked || !onDelete}
              title={
                linked
                  ? 'Gỡ hết tầng và căn hộ (không còn trạng thái hoạt động) trước khi đóng tòa nhà.'
                  : 'Đóng tòa nhà (trạng thái đã đóng)'
              }
              onClick={() => !linked && onDelete && onDelete(building)}
            >
              Đóng tòa
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
