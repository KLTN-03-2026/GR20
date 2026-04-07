import axios, { AxiosError, HttpStatusCode } from 'axios'
import config from 'src/contexts/config'
import Userimg from 'src/images/image.png'
export function isAxiosError<T>(error: unknown): error is AxiosError<T> {
  return axios.isAxiosError(error)
}

export function isAxiosUnprocessableEntityError<FormError>(error: unknown): error is AxiosError<FormError> {
  return isAxiosError(error) && error.response?.status === HttpStatusCode.UnprocessableEntity
}

export function formatInitCurrency(currenvy: number) {
  return new Intl.NumberFormat('de-DE').format(currenvy) //kiểu đức
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1
  })
    .format(value)
    .replace('.', ',')
}

export const rateSale = (origate: number, sale: number) => {
  return Math.round(((origate - sale) / origate) * 100) + '%'
}

const removeSpecialCharacter = (str: string) =>
  // eslint-disable-next-line no-useless-escape
  str.replace(/\!|\@|\%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|\,|\.|\:|\;|\'|\"|\&|\#|\[|\]|\~|\$|\_|\`|\-|\{|\}|\||\\/g, '')

export const genarateNameID = ({ name, id }: { name: string; id: string }) => {
  return removeSpecialCharacter(name).replace(/\s/g, '-') + `-i,${id}`
}

// export const getIDFormNameid = (nameId: string) => {
//   const arr = nameId.split('-i')
//   return arr[arr.length - 1]
// }
export const getIDFormNameid = (nameId: string) => {
  const arr = nameId.split('-i,')
  return arr[arr.length - 1]
}

// export const getAvatarUrl = (avatarName?: string) => (avatarName ? `${config.BASEURL}images/${avatarName}` : Userimg)
export const getAvatarUrl = (avatar?: string) => {
  if (!avatar) return Userimg
  if (avatar.startsWith('http')) return avatar
  return `${config.BASEURL}images/${avatar}`
}
