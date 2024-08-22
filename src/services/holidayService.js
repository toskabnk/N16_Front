import AbstractApiService from "./abstractApiService";
import n16Api from "./apiServices";

class HolidayService extends AbstractApiService {
    getUrl() {
        return "/holidays";
    }

    /**
     * Devuelve las vacaciones de los usuarios con filtros aplicados (company_id).
     * Corresponde a index en HolidayController
     * @param {*} access_token Token de acceso
     * @param {*} queryParams Parametros de filtrado
     * @returns 
     */
    async getHolidays(access_token, queryParams) {
        try {
            const response = await n16Api.get(this.getUrl(), {
                bearerToken: access_token,
                params: queryParams
            });
            return response.data;
        } catch (error) {
            console.error("Error during getHolidays:", error);
            throw error;
        }
    }

    async acceptHolidayRequest(access_token, holidayId) {
        try {
            const response = await n16Api.get(`${this.getUrl()}/${holidayId}/accept`, {
                bearerToken: access_token
            });
            return response.data;
        } catch (error) {
            console.error("Error during acceptHolidayRequest:", error);
            throw error;
        }
    }

    async rejectHolidayRequest(access_token, holidayId) {
        try {
            const response = await n16Api.get(`${this.getUrl()}/${holidayId}/reject`, {
                bearerToken: access_token
            });
            return response.data;
        } catch (error) {
            console.error("Error during rejectHolidayRequest:", error);
            throw error;
        }
    }

    async revokeHolidayRequest(access_token, holidayId) {
        try {
            const response = await n16Api.get(`${this.getUrl()}/${holidayId}/revoke`, {
                bearerToken: access_token
            });
            return response.data;
        } catch (error) {
            console.error("Error during revokeHolidayRequest:", error);
            throw error;
        }
    }
}

export default new HolidayService();