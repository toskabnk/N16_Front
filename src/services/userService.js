import AbstractApiService from "./abstractApiService";

export class UserService extends AbstractApiService {
    getUrl() {
        return "/users";
    }

    /**
     * Devuelve los usuarios con filtros aplicados. (company_id y name).
     * Corresponde a listAll en UserController.
     * @param {*} access_token Token de acceso
     * @param {*} queryParams Filtrado por company_id y name
     * @returns 
     */
    async getUsersWithFilters(access_token, queryParams) {
        try {
            const response = await n16Api.get(this.getUrl(), {
                bearerToken: access_token,
                params: queryParams
            });
            return response.data;
        } catch (error) {
            console.error("Error during getUsersWithFilters:", error);
            throw error;
        }
    }

    /**
     * Actualiza la contraseña de un usuario.
     * Corresponde a updatePassword en UserController.
     * @param {*} access_token Token de acceso
     * @param {*} id Id del usuario a actualizar
     * @param {*} values Contraseña nueva
     * @returns 
     */
    async updateUserPassword(access_token, id, values) {
        try {
            const response = await n16Api.post(`/users/${id}/update-password`, values, { bearerToken: access_token });
            return response.data;
        } catch (error) {
            console.error("Error during updateUserPassword:", error);
            throw error;
        }
    }
}