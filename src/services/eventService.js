import AbstractApiService from "./abstractApiService";

export class EventService extends AbstractApiService {
  getUrl() {
    return "/events";
  }

  //index -> getAll
  //find -> find
  //createRepeatedForDateRange -> create
  //update -> update
  //delete -> delete

  /**
   * Como getAll, pero puedes filtrar por fecha y ordenar por profesor.
   * Corresponde a index en EventController.
   * Los queryParams deben ser de esta forma:
   * const queryParams = {
   *  date: '2023-07-15',
   *  by_teacher: '',
   * };
   * @param {*} access_token Token de acceso
   * @param {*} queryParams Parámetros de filtrado y ordenación
   * @returns
   */
  async getEventsWithFilters (access_token, queryParams) {
    try {
      const response = await n16Api.get(this.getUrl(), {
        bearerToken: access_token,
        params: queryParams
      });   
      return response.data;
    } catch (error) {
      console.error("Error during getEvents:", error);
      throw error;
    }
  }

  /**
   * Como getAll, pero filtra los eventos por el profesor que esta logueado.
   * Corresponde a index en EventController.
   * @param {*} access_token Token de acceso
   * @returns 
   */
  async getMyCalendar (access_token) {
    try {
      const response = await n16Api.get(`/my_calendar`, { bearerToken: access_token });
      return response.data;
    } catch (error) {
      console.error("Error during getEvents:", error);
      throw error;
    }
  }

  /**
   * Crea un evento para un dia y hora específicos.
   * Corresponde a createSingleEvent en EventController.
   * @param {*} access_token Token de acceso
   * @param {*} values JSON con los datos del evento
   * @returns 
   */
  async createSingleEvent (access_token, values) {
    try {
      const response = await n16Api.post('/events/create/single', values, { bearerToken: access_token });
      return response.data;
    } catch (error) {
      console.error("Error during createSingleEvent:", error);
      throw error;
    }
  }
  
  /**
   * Actualiza el aula de un evento.
   * Corresponde a updateClassroom en EventController.
   * @param {*} access_token Token de acceso
   * @param {*} id Id del evento a actualizar
   * @param {*} classroomId Id del aula a asignar
   * @returns 
   */
  async updateEventClassroom (access_token, id, classroomId) {
      try {
          const response = await n16Api.post(`/events/update-classroom/${id}/${classroomId}`, " ", { bearerToken: access_token });
          return response.data;
      } catch (error) {
          console.error("Error during updateEventClassroom:", error);
          throw error;
      }
  }

  /**
   * Actualiza el profesor de un evento.
   * Corresponde a updateTeacher en EventController.
   * @param {*} access_token Token de acceso
   * @param {*} id Id del evento a actualizar
   * @param {*} teacherId Id del profesor a asignar
   * @returns 
   */
  async updateEventTeacher (access_token, id, teacherId) {
    try {
        const response = await n16Api.post(`/events/update-teacher/${id}/${teacherId}`, " ", { bearerToken: access_token });
        return response.data;
    } catch (error) {
        console.error("Error during updateEventTeacher:", error);
        throw error;
    }
  }

  /**
   * Actualiza el profesor de un grupo de eventos.
   * Corresponde a updateTeacherForGroup en EventController.
   * @param {*} access_token Token de acceso
   * @param {*} id Id del evento a actualizar
   * @param {*} teacherId Id del profesor a asignar
   * @returns 
   */
  async updateEventTeacherGroup (access_token, id, teacherId) {
    try {
        const response = await n16Api.post(`/events/update-teacher-for-group/${id}/${teacherId}`, " ", { bearerToken: access_token });
        return response.data;
    } catch (error) {
        console.error("Error during updateEventTeacherGroup:", error);
        throw error;
    }
  }

  /**
   * Actualiza los eventos de un grupo.
   * Corresponde a updateEventsForGroup en EventController.
   * @param {*} access_token Token de acceso
   * @param {*} groupId Id del grupo de eventos a actualizar
   * @param {*} values JSON con los datos a actualizar
   * @returns 
   */
  async updateEventsGroup (access_token, groupId, values) {
    try {
        const response = await n16Api.post(`/events/update-events-for-group/${groupId}`, values, { bearerToken: access_token });
        return response.data;
    } catch (error) {
        console.error("Error during updateEventsGroup:", error);
        throw error;
    }
  }

  /**
   * Elimina los eventos de un grupo a partir de un día.
   * Corresponde a deleteEventsForGroup en EventController
   * @param {*} access_token Token de acceso
   * @param {*} groupId Id del grupo de eventos a eliminar
   * @param {*} values JSON con el rango de fecha a partir de las cuales eliminar los eventos
   * @returns 
   */
  async deleteEventsGroup (access_token, groupId, values) {
    try {
        const response = await n16Api.post(`/events/delete-events-for-group/${groupId}`, values, { bearerToken: access_token });
        return response.data;
    } catch (error) {
        console.error("Error during deleteEventsGroup:", error);
        throw error;
    }
  }

  /**
   * Suspende los eventos de un día para una empresa
   * Corresponde a suspendEventsForDayForCompany en EventController
   * @param {*} access_token Token de acceso
   * @param {*} companyId Id de la empresa
   * @param {*} day Fecha a suspender
   * @returns 
   */
  async suspendEventsDayCompany (access_token, companyId, date) {
    try {
        const response = await n16Api.post(`/events/suspend-events/${companyId}/${date}`, " ", { bearerToken: access_token });
        return response.data;
    } catch (error) {
        console.error("Error during suspendEventsDayCompany:", error);
        throw error;
    }
  }

  /**
   * Actualiza la fecha de un evento.
   * Corresponde a updateDates en EventController
   * @param {*} access_token Token de acceso
   * @param {*} id Id del evento a actualizar
   * @param {*} values JSON con el rango de fechas a actualizar
   * @returns 
   */
  async updateEventDate (access_token, id, values) {
    try {
        const response = await n16Api.post(`/events/update-dates/${id}`, values, { bearerToken: access_token });
        return response.data;
    } catch (error) {
        console.error("Error during updateEventTeacher:", error);
        throw error;
    }
  }  

  //ELIMINAR
  async getEventTypes (access_token) {
      try {
          const response = await n16Api.get(`/event-type`, { bearerToken: access_token });
          return response.data;
      } catch (error) {
          console.error("Error during getEventTypes:", error);
          throw error;
      }
  }
}