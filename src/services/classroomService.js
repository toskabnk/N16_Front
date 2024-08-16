import AbstractApiService from "./abstractApiService";
import n16Api from "./apiServices";

class ClassroomService extends AbstractApiService {
  getUrl() {
    return "/classroom";
  }

  async getClassroomWithFilters (access_token, queryParams) {
    try {
      const response = await n16Api.get(this.getUrl(), {
        bearerToken: access_token,
        params: queryParams
      });   
      return response.data;
    } catch (error) {
      console.error("Error during getClassroomWithFilters:", error);
      throw error;
    }
  }

}

export default new ClassroomService();