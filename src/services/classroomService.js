import AbstractApiService from "./abstractApiService";

class ClassroomService extends AbstractApiService {
  getUrl() {
    return "/classroom";
  }
}

export default new ClassroomService();