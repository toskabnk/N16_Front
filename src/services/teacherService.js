import AbstractApiService from "./abstractApiService";

export class TeacherService extends AbstractApiService {
    getUrl() {
        return "/teacher";
    }

    /**
     * Devuelve los profesores con filtros aplicados. (Actualmente el unico es company_id).
     * @param {*} access_token Token de acceso
     * @param {*} queryParams 
     * @returns 
     */
    async getTeachersWithFilters(access_token, queryParams) {
        try {
            const response = await n16Api.get(this.getUrl(), {
                bearerToken: access_token,
                params: queryParams
            });
            return response.data;
        } catch (error) {
            console.error("Error during getTeachersWithFilters:", error);
            throw error;
        }
    }
}