import { useState, useEffect } from 'react';
import api from '../services/axios';

const Comentarios = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedUser = window.localStorage.getItem('loggedUser');
    if (loggedUser) {
      setUser(JSON.parse(loggedUser));
      loadComments();
    }
  }, []);

  const loadComments = async () => {
    try {
      const response = await api.get('/comentarios');
      setComments(response.data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/comments', {
        text: newComment,
        userId: user.id
      });
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="comments-page">
      <h2>Comentarios</h2>
      
      <form onSubmit={handleSubmitComment} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe tu comentario..."
          className="comment-input"
        />
        <button type="submit" className="comment-button">
          Enviar Comentario
        </button>
      </form>

      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-header">
              <strong>{comment.user_name}</strong>
              <span>{new Date(comment.created_at).toLocaleDateString()}</span>
            </div>
            <p>{comment.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comentarios;