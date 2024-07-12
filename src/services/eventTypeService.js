import AbstractApiService from "./abstractApiService";

export class EventTypeService extends AbstractApiService {
    getUrl() {
        return "/event_type";
    }
}