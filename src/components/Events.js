import React, { useState, useEffect } from "react";
import "./Events.css";

const EVENTS_API_URL = process.env.REACT_APP_EVENTS_API_URL;

const Events = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    name_event: "",
    description: "",
    date: "",
    time: "",
    location: "",
    limit_people: "",
    points_for_the_event: ""
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${EVENTS_API_URL}/events/get/`);
      if (!response.ok) throw new Error("Ошибка при загрузке мероприятий");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const addEvent = async () => {
    if (!newEvent.name_event || !newEvent.description || !newEvent.date || !newEvent.time || !newEvent.location) {
      return alert("Заполните все обязательные поля");
    }
    try {
      const response = await fetch(`${EVENTS_API_URL}/events/add/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_event: newEvent.name_event,
          date_time: `${newEvent.date}T${newEvent.time}:00.000Z`,
          location: newEvent.location,
          description: newEvent.description,
          limit_people: newEvent.limit_people ? parseInt(newEvent.limit_people, 10) : null,
          points_for_the_event: newEvent.points_for_the_event ? parseInt(newEvent.points_for_the_event, 10) : null
        })
      });
      if (!response.ok) throw new Error("Ошибка при добавлении мероприятия");
      await fetchEvents();
      setNewEvent({ name_event: "", description: "", date: "", time: "", location: "", limit_people: "", points_for_the_event: "" });
      setModalOpen(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      const response = await fetch(`${EVENTS_API_URL}/events/delete/${eventId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Ошибка при удалении мероприятия");
      await fetchEvents();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="events-container">
      <h1>Мероприятия</h1>
      <button className="add-event-button" onClick={() => setModalOpen(true)}>Добавить мероприятие</button>
      {modalOpen && (
        <div className={`modal ${modalOpen ? "open" : ""}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Добавить мероприятие</h2>
              <button className="close-button" onClick={() => setModalOpen(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <label className="label-left">Название мероприятия</label>
              <input type="text" name="name_event" value={newEvent.name_event} onChange={handleInputChange} required />
              <label className="label-left">Описание</label>
              <textarea name="description" value={newEvent.description} onChange={handleInputChange} required />
              <label className="label-left">Дата</label>
              <input type="date" name="date" value={newEvent.date} onChange={handleInputChange} required />
              <label className="label-left">Время</label>
              <input type="time" name="time" value={newEvent.time} onChange={handleInputChange} required />
              <label className="label-left">Место проведения</label>
              <input type="text" name="location" value={newEvent.location} onChange={handleInputChange} required />
              <label className="label-left">Лимит участников (необязательно)</label>
              <input type="number" name="limit_people" value={newEvent.limit_people} onChange={handleInputChange} />
              <label className="label-left">Очки за мероприятие (необязательно)</label>
              <input type="number" name="points_for_the_event" value={newEvent.points_for_the_event} onChange={handleInputChange} />
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setModalOpen(false)}>Отмена</button>
              <button className="save-button" onClick={addEvent}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="events-list">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <h2 className="event-title">{event.name_event}</h2>
              <p className="event-description"><strong>Описание: </strong>{event.description}</p>
              <p className="event-info"><strong>Дата и время:</strong> {new Date(event.date_time).toLocaleString()}</p>
              <p className="event-info"><strong>Место проведения:</strong> {event.location}</p>
              {event.limit_people && <p className="event-info"><strong>Лимит участников:</strong> {event.limit_people}</p>}
              {event.points_for_the_event && <p className="event-info"><strong>Очки за мероприятие:</strong> {event.points_for_the_event}</p>}
              <button className="delete-button" onClick={() => deleteEvent(event.id)}>Удалить</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
