import React, { useState } from 'react';

function TodoForm({ onAddTodo }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('personal');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTodo({
        title,
        description,
        category,
        priority,
        dueDate
      });
      setTitle('');
      setDescription('');
      setCategory('personal');
      setPriority('medium');
      setDueDate('');
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          placeholder="اكتب اسم المهمة..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="input-title"
        />
      </div>

      <div className="form-group">
        <textarea
          placeholder="اكتب وصف المهمة (اختياري)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-description"
          rows="2"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-select"
          >
            <option value="personal">👤 شخصي</option>
            <option value="work">📊 عمل</option>
            <option value="shopping">🛒 تسوق</option>
            <option value="health">🏥 صحي</option>
            <option value="education">📚 تعليم</option>
          </select>
        </div>

        <div className="form-group">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="input-select"
          >
            <option value="low">🟢 منخفضة</option>
            <option value="medium">🟡 متوسطة</option>
            <option value="high">🔴 عالية</option>
          </select>
        </div>

        <div className="form-group">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="input-date"
          />
        </div>
      </div>

      <button type="submit" className="btn-add">➕ إضافة مهمة</button>
    </form>
  );
}

export default TodoForm;
