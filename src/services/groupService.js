import AbstractApiService from "./abstractApiService";

export class GroupService extends AbstractApiService {
    getUrl() {
        return "/groups";
    }
}