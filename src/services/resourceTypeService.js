import AbstractApiService from "./abstractApiService";

export class ResourceTypeService extends AbstractApiService {
    getUrl() {
        return "/resource-type";
    }
}