import AbstractApiService from "./abstractApiService";

class CompanyService extends AbstractApiService {
    getUrl() {
        return "/companies";
    }
}

export default new CompanyService();