import AbstractApiService from "./abstractApiService";

class GroupService extends AbstractApiService {
    getUrl() {
        return "/groups";
    }
}

export default new GroupService();