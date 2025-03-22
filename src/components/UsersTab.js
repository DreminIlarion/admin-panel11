import React, { useEffect, useState, useRef } from "react";
import { Chart, registerables } from "chart.js";
import "./UsersTab.css";
Chart.register(...registerables);

const BOT_API_URL = process.env.REACT_APP_BOT_API_URL;

const UsersTab = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const [dailyMessageStats, setDailyMessageStats] = useState({ labels: [], counts: [] });
  const [userId, setUserId] = useState("");
  const [userMessages, setUserMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const chartRef = useRef(null);
  const limit = 10;

  useEffect(() => {
    fetch(`${BOT_API_URL}/contacts/`)
      .then((response) => response.json())
      .then((data) => {
        setSubscribers(data.contacts);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Ошибка при загрузке данных:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch(`${BOT_API_URL}/chats/count/`)
      .then((response) => response.json())
      .then((data) => {
        setMessageCount(data.count || 0);
      })
      .catch((error) => {
        console.error("Ошибка при загрузке количества сообщений:", error);
      });
  }, []);

  useEffect(() => {
    fetch(`${BOT_API_URL}/chats/per-day-count/`)
      .then((response) => response.json())
      .then((data) => {
        const stats = data.distribution || [];
        const labels = stats.map((entry) => entry.date.split("T")[0]);
        const counts = stats.map((entry) => entry.count);
        setDailyMessageStats({ labels, counts });
      })
      .catch((error) => {
        console.error("Ошибка при загрузке статистики сообщений:", error);
      });
  }, []);

  useEffect(() => {
    const ctx = document.getElementById("messagesChart").getContext("2d");
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: dailyMessageStats.labels,
        datasets: [
          {
            label: "Сообщений за день",
            data: dailyMessageStats.counts,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: "Дата",
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Количество сообщений",
            },
          },
        },
      },
    });
  }, [dailyMessageStats]);

  const fetchUserMessages = async (page = 1) => {
    if (!userId) {
      return;
    }

    setLoadingMessages(true);

    try {
      const response = await fetch(
        `${BOT_API_URL}/chats/${userId}/?is_paginated=true&page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error("Ошибка сети");
      }

      const data = await response.json();

      if (!data.dialogs) {
        throw new Error("Неверный формат ответа API");
      }

      setUserMessages(data.dialogs);
      setCurrentPage(page);

      // Обновляем totalPages на основе данных от API
      const totalMessages = data.total || 0; // Используем 0, если total не указан
      setTotalPages(Math.ceil(totalMessages / limit));
    } catch (error) {
      console.error("Ошибка при загрузке сообщений пользователя:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchUserMessageCount = async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `${BOT_API_URL}/chats/${userId}/count/`
      );

      if (!response.ok) {
        throw new Error("Ошибка сети");
      }

      const data = await response.json();
      setUserMessageCount(data.count || 0);
    } catch (error) {
      console.error("Ошибка при загрузке количества сообщений пользователя:", error);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchUserMessages(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchUserMessages(currentPage + 1);
    }
  };

  const selectUser = (id) => {
    setUserId(id);
    setCurrentPage(1); // Сбрасываем текущую страницу на первую
    setTotalPages(1); // Сбрасываем общее количество страниц
    setUserMessages([]); // Очищаем сообщения
    fetchUserMessages(1); // Загружаем сообщения для первой страницы
    fetchUserMessageCount(); // Загружаем количество сообщений пользователя
  };

  return (
    <div className="users-container">
      <div className="left-panel">
        <h1>Статистика сообщений</h1>
        <div className="message-count-card">
          <h2>Количество сообщений:</h2>
          <p>{messageCount}</p>
        </div>
        <div className="chart-container">
          <h2>Сообщения за дни</h2>
          <canvas id="messagesChart"></canvas>
        </div>
      </div>

      <div className="center-panel">
        <h1>Подписчики</h1>
        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <table className="subscribers-table">
            <thead>
              <tr>
                <th>ID пользователя</th>
                <th>Телефон</th>
                <th>Дата добавления</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.user_id} onClick={() => selectUser(subscriber.user_id)}>
                  <td>{subscriber.user_id}</td>
                  <td>{subscriber.phone_number}</td>
                  <td>{new Date(subscriber.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="right-panel">
        <h1>История сообщений</h1>
        <input
          type="text"
          placeholder="Введите ID пользователя"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="input-field"
        />
        <button
          onClick={() => {
            setCurrentPage(1); // Сбрасываем текущую страницу на первую
            setTotalPages(1); // Сбрасываем общее количество страниц
            setUserMessages([]); // Очищаем сообщения
            fetchUserMessages(1); // Загружаем сообщения для первой страницы
            fetchUserMessageCount(); // Загружаем количество сообщений пользователя
          }}
          className="fetch-button"
        >
          Показать сообщения
        </button>

        {userId && (
          <div className="user-message-count">
            <p>Общее количество сообщений пользователя: <strong>{userMessageCount}</strong></p>
          </div>
        )}

        {loadingMessages ? (
          <p>Загрузка сообщений...</p>
        ) : (
          <div className="message-history">
            {userMessages.length > 0 ? (
              userMessages.map((message, index) => (
                <div key={index} className="message-card">
                  <p><strong>ID пользователя:</strong> {message.user_id}</p>
                  <p><strong>Сообщение пользователя:</strong> {message.user_message}</p>
                  <p><strong>Ответ бота:</strong> {message.bot_message || message.chatbot_message}</p>
                  <p><strong>Дата:</strong> {new Date(message.created_at).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p>Сообщений нет.</p>
            )}
          </div>
        )}

        <div className="pagination">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Назад
          </button>
          <span className="pagination-info">
            Страница {currentPage} из {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Вперед
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersTab;