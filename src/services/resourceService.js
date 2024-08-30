import AbstractApiService from "./abstractApiService";

export class ResourceService extends AbstractApiService {
    getUrl() {
        return "/resource";
    }
}