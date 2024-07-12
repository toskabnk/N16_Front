import AbstractApiService from "./abstractApiService";

export class DepartmentService extends AbstractApiService {
    getUrl() {
        return "/department";
    }
}
