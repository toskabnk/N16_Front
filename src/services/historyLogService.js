import AbstractApiService from "./abstractApiService";
import n16Api from "./apiServices";

export class HistoryLogService extends AbstractApiService {
    getUrl() {
        return "/history-log";
    }

    /**
     * Devuelve el historial de cambios con filtros aplicados.
     * Corresponde a index en HistoryLogController.
     * @param {*} access_token Token de acceso
     * @param {*} queryParams Parametros de filtrado
     * @returns 
     */
    async getHistoryLog(access_token, queryParams) {
        try {
            const response = await n16Api.get(this.getUrl(), {
                bearerToken: access_token,
                params: queryParams
            });
            return response.data;
        } catch (error) {
            console.error("Error during getHistoryLog:", error);
            throw error;
        }
    }

    /**
     * Devuelve el historial de cambios en eventos con filtros aplicados.
     * Corresponde a event en HistoryLogController
     * @param {*} access_token Token de acceso
     * @param {*} queryParams Parametros de filtrado
     * @returns 
     */
    async getEventLog(access_token, queryParams) {
        try {
            const response = await n16Api.get(`${this.getUrl()}/event`, {
                bearerToken: access_token,
                params: queryParams
            });
            return response.data;
        } catch (error) {
            console.error("Error during getEventLog:", error);
            throw error;
        }
    }
}


export default new HistoryLogService();