import AbstractApiService from "./abstractApiService";

class DepartmentService extends AbstractApiService {
    getUrl() {
        return "/department";
    }
}

export default new DepartmentService();