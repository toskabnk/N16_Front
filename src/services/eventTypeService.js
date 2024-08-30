import AbstractApiService from "./abstractApiService";

class EventTypeService extends AbstractApiService {
    getUrl() {
        return "/event-type";
    }
}

export default new EventTypeService();