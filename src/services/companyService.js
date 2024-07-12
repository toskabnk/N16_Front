import AbstractApiService from "./abstractApiService";

export class CompanyService extends AbstractApiService {
    getUrl() {
        return "/companies";
    }
}