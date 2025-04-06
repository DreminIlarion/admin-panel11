import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import './AdminDashboard.css';

Chart.register(...registerables);

// Переменные из .env
const BOT_API_URL = process.env.REACT_APP_BOT_API_URL;
const NOTIFY_API_URL = process.env.REACT_APP_NOTIFY_API_URL;

const AdminDashboard = () => {
  const [recipientType, setRecipientType] = useState('all');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  const [userCount, setUserCount] = useState(0);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [dailyUserGrowth, setDailyUserGrowth] = useState({ labels: [], counts: [] });

  const chartRef = useRef(null);

  useEffect(() => {
    fetch(`${BOT_API_URL}/contacts/count/`)
      .then(res => res.json())
      .then(data => setSubscriberCount(data.count || 0))
      .catch(err => console.error('Ошибка загрузки количества подписчиков:', err));
  }, []);

  useEffect(() => {
    fetch(`${BOT_API_URL}/users/count/`)
      .then(res => res.json())
      .then(data => setUserCount(data.count || 0))
      .catch(err => console.error('Ошибка загрузки количества пользователей:', err));
  }, []);

  useEffect(() => {
    fetch(`${BOT_API_URL}/users/per-day-count/`)
      .then(res => res.json())
      .then(data => {
        const dist = data.distribution || [];
        const labels = dist.map(entry => entry.date.split('T')[0]);
        const counts = dist.map(entry => entry.count);
        setDailyUserGrowth({ labels, counts });
      })
      .catch(err => console.error('Ошибка загрузки статистики за день:', err));
  }, []);

  useEffect(() => {
    const ctx = document.getElementById('userGrowthChart').getContext('2d');

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dailyUserGrowth.labels,
        datasets: [
          {
            label: 'Рост пользователей за день',
            data: dailyUserGrowth.counts,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: 'rgba(75, 192, 192, 1)',
            pointBorderColor: '#fff',
          },
        ],
      },
      options: {
        scales: {
          x: { title: { display: true, text: 'Дата' } },
          y: {
            title: { display: true, text: 'Количество пользователей' },
            beginAtZero: true,
            ticks: { stepSize: 1 },
          },
        },
      },
    });
  }, [dailyUserGrowth]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!message || (recipientType === 'phone' && !phoneNumber)) {
      alert('Пожалуйста, заполните все обязательные поля.');
      return;
    }

    const url =
      recipientType === 'all'
        ? `${NOTIFY_API_URL}/api/v1/notifications/notify-all/`
        : `${NOTIFY_API_URL}/api/v1/notifications/notify-by-phone-number/`;

    const params =
      recipientType === 'all'
        ? { text: message }
        : { text: message, phone_number: phoneNumber };

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        alert('Сообщение успешно отправлено');
        setMessage('');
        setPhoneNumber('');
      })
      .catch((error) => {
        console.error('Ошибка отправки сообщения: ', error);
        alert('Что-то пошло не так. Попробуйте позже.');
      });
  };

  const subscriberPercentage = userCount > 0 ? (subscriberCount / userCount) * 100 : 0;

  return (
    <div className="dashboard-container">
      {/* Левая панель */}
      <div className="left-panel">
        <h2>Статистика Telegram бота</h2>

        <div className="chart-container">
          <canvas id="userGrowthChart"></canvas>
        </div>

        <div className="statistics">
          <div className="stat-card">
            <h3>Количество пользователей:</h3>
            <p>{userCount}</p>
          </div>
          <div className="stat-card">
            <h3>Готовы получать уведомления:</h3>
            <p>{subscriberCount}</p>
          </div>
        </div>

        <div className="progress-bar-container">
          <h3>Процент готовых получать уведомления:</h3>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${subscriberPercentage}%` }}
            />
          </div>
          <p>{subscriberPercentage.toFixed(2)}%</p>
        </div>
      </div>

      {/* Правая панель */}
      <div className="right-panel">
        <h2>Отправка сообщений</h2>
        <form onSubmit={handleSendMessage} className="message-form">
          <div className="recipient-select">
            <select
              value={recipientType}
              onChange={(e) => setRecipientType(e.target.value)}
              className="recipient-dropdown"
            >
              <option value="all">Всем пользователям</option>
              <option value="phone">По номеру телефона</option>
            </select>
          </div>

          {recipientType === 'phone' && (
            <div className="input-group">
              <input
                type="text"
                className="input-field"
                placeholder="7XXXXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          )}

          <div className="input-group">
            <textarea
              className="message-input"
              placeholder="Введите ваше сообщение..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button type="submit" className="send-button">
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
