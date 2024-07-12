import AbstractApiService from "./abstractApiService";

export class ClassroomService extends AbstractApiService {
  getUrl() {
    return "/classroom";
  }
}