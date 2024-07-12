import AbstractApiService from "./abstractApiService";

export class TeachingHourService extends AbstractApiService {
    getUrl() {
        return "/teaching-hours";
    }

    /**
     * Devuelve las horas impartidas por profesor con filtros aplicados (company_id).
     * Se puede agrupar por teacher, teacher_and_event_type, teacher_and_departmen y department.
     * Corresponde a data en TeachingHourController.
     * @param {*} access_token Token de acceso
     * @param {*} queryParams Parámetros de filtrado
     * @param {*} values JSON con los valores de fechas y group_by 
     * @returns 
     */
    async getTeachingHours(access_token, queryParams, values) {
        try {
            const response = await n16Api.get(this.getUrl(), values, {
                bearerToken: access_token,
                params: queryParams
            });
            return response.data;
        } catch (error) {
            console.error("Error during getTeachingHours:", error);
            throw error;
        }
    }
}