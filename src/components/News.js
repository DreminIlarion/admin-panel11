import React, { useState, useEffect, useCallback } from "react";
import "./News.css";

const NEWS_API_URL = "https://events-zisi.onrender.com/api/v1";

const News = () => {
  const [news, setNews] = useState([]);
  const [newNews, setNewNews] = useState({
    title: "",
    body: "",
    image: null
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const newsPerPage = 9;
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [expandedBodies, setExpandedBodies] = useState({});

  const toggleBody = (newsId) => {
    setExpandedBodies(prev => ({
      ...prev,
      [newsId]: !prev[newsId]
    }));
  };

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${NEWS_API_URL}/news/get/?is_paginated=true&page=${currentPage}&limit=${newsPerPage}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.status === "success" && data.body) {
        setNews(data.body.news || []);
        setTotalPages(data.body.total_pages || Math.ceil(data.body.total_count / newsPerPage) || 1);
      } else {
        throw new Error("Неверная структура данных в ответе");
      }
    } catch (err) {
      console.error("Ошибка загрузки новостей:", err);
      setError(err.message);
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, newsPerPage]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNews(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewNews(prev => ({ ...prev, image: file }));
  
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  

  const addNews = async () => {
    if (!newNews.title.trim() || !newNews.body.trim()) {
      alert("Заполните обязательные поля: заголовок и текст новости");
      return;
    }
  
    try {
      // Create URL with query parameters
      const url = new URL(`${NEWS_API_URL}/news/add/`);
      url.searchParams.append('title', newNews.title.trim());
      url.searchParams.append('body', newNews.body.trim());
  
      const formData = new FormData();
      // Only append image if it exists
      if (newNews.image && newNews.image instanceof File) {
        formData.append('image', newNews.image);
      }
  
      console.log("Request URL:", url.toString());
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
  
      const response = await fetch(url.toString(), {
        method: "POST",
        body: formData.keys().next().done ? null : formData, // Only send body if formData has content
      });
  
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error("Server error response:", responseData);
        const errorMessage = responseData.detail?.map(error => 
          typeof error === 'string' ? error : `${error.loc?.join('.')}: ${error.msg}`
        ).join('\n') || "Ошибка при добавлении новости";
        
        throw new Error(errorMessage);
      }
  
      console.log("News added successfully:", responseData);
      await fetchNews();
      setNewNews({ title: "", body: "", image: null });
      setImagePreview(null);
      setModalOpen(false);
    } catch (err) {
      console.error("Request failed:", err);
      alert(`Ошибка: ${err.message}`);
    }
  };
  
  

  const deleteNews = async (newsId) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту новость?")) return;

    try {
      const response = await fetch(`${NEWS_API_URL}/news/delete/${newsId}`, { 
        method: "DELETE" 
      });

      if (!response.ok) {
        throw new Error("Ошибка при удалении");
      }

      if (news.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        await fetchNews();
      }
    } catch (err) {
      console.error("Ошибка:", err);
      alert(err.message);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="news-container">
      <h1>Новости</h1>
      <button 
        className="add-news-button" 
        onClick={() => setModalOpen(true)}
      >
        Добавить новость
      </button>

      {/* Модальное окно добавления */}
      {modalOpen && (
        <div className={`modal ${modalOpen ? "open" : ""}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Добавить новость</h2>
              <button className="close-button" onClick={() => setModalOpen(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <label className="label-left">Заголовок</label>
              <input 
                type="text" 
                name="title" 
                value={newNews.title} 
                onChange={handleInputChange} 
                required 
              />
              
              <label className="label-left">Текст новости</label>
              <textarea 
                name="body" 
                value={newNews.body} 
                onChange={handleInputChange} 
                required 
              />
              
              <label className="label-left">Изображение (необязательно)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
              />
              
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Превью" />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setModalOpen(false)}>Отмена</button>
              <button className="save-button" onClick={addNews}>Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {/* Состояние загрузки */}
      {loading && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}

      {/* Ошибка */}
      {error && (
        <div className="error-message">
          Ошибка: {error} <button onClick={fetchNews}>Повторить</button>
        </div>
      )}

      {/* Список новостей */}
      {!loading && !error && (
        <>
          <div className="news-grid">
            {news.length > 0 ? (
              news.map(item => (
                <div key={item.id} className="news-card">
                  {item.image && item.image !== "absent" && (
                    <div className="news-image">
                      <img src={`data:image/jpeg;base64,${item.image}`} alt={item.title} />
                    </div>
                  )}
                  <div className="news-content">
                    <h3>{item.title}</h3>
                    
                    <button 
                      className="show-body-button"
                      onClick={() => toggleBody(item.id)}
                    >
                      {expandedBodies[item.id] ? "Скрыть текст" : "Показать текст"}
                    </button>
                    
                    <div className={`news-body-container ${expandedBodies[item.id] ? 'expanded' : ''}`}>
                      <p className="news-body">{item.body}</p>
                    </div>
                    
                    <p className="news-date">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                    <button 
                      className="delete-button"
                      onClick={() => deleteNews(item.id)}
                    >
                      Удалить
                  </button>
                </div>
              </div>
              
              ))
            ) : (
              <div className="no-news">Новостей не найдено</div>
            )}
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                Назад
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={currentPage === i + 1 ? "active" : ""}
                >
                  {i + 1}
                </button>
              ))}
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                Вперед
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default News;