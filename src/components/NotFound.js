import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      textAlign: "center",
      color: "#343a40",
    }}>
      <h1 style={{ fontSize: "5rem", marginBottom: "10px" }}>404</h1>
      <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>Страница не найдена</h2>
      <p style={{ fontSize: "1.2rem", marginBottom: "30px" }}>
        Возможно, она была удалена или вы ошиблись при вводе адреса.
      </p>
      <Link to="/" style={{
        padding: "10px 20px",
        fontSize: "1.2rem",
        color: "#fff",
        backgroundColor: "#007bff",
        textDecoration: "none",
        borderRadius: "5px",
        transition: "background 0.3s",
      }}
      onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
      onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
      >
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFound;
