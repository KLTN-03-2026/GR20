import { apartmentApi } from "./apartment_api";

export const apartmentsApi = {
  getAll: apartmentApi.getAllApartment,
  getById: apartmentApi.getApartmentById,
  create: apartmentApi.createApartment,
  update: apartmentApi.updateApartment,
  delete: apartmentApi.deleteApartment,
};
