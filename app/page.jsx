"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

export default function Page() {
  const [todos, setTodos] = useLocalStorage("todos", []);
  const [filter, setFilter] = useState("all");
  const inputRef = useRef(null);

  const remaining = useMemo(() => todos.filter(t => !t.completed).length, [todos]);

  const filteredTodos = useMemo(() => {
    if (filter === "active") return todos.filter(t => !t.completed);
    if (filter === "completed") return todos.filter(t => t.completed);
    return todos;
  }, [todos, filter]);

  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newTodo = { id: crypto.randomUUID(), text: trimmed, completed: false };
    setTodos(prev => [newTodo, ...prev]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const el = inputRef.current;
    if (!el) return;
    addTodo(el.value);
    el.value = "";
  }

  function toggleTodo(id) {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function deleteTodo(id) {
    setTodos(prev => prev.filter(t => t.id !== id));
  }

  function clearCompleted() {
    setTodos(prev => prev.filter(t => !t.completed));
  }

  function editTodo(id, newText) {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, text: newText } : t)));
  }

  return (
    <main className="container">
      <header className="header">
        <h1>Todos</h1>
        <form onSubmit={handleSubmit} className="addForm">
          <input ref={inputRef} aria-label="Add todo" className="input" placeholder="What needs to be done?" />
          <button type="submit" className="btn primary">Add</button>
        </form>
      </header>

      <section className="controls">
        <div className="filters" role="tablist" aria-label="Filters">
          <button className={filter === "all" ? "tab active" : "tab"} onClick={() => setFilter("all")} role="tab" aria-selected={filter === "all"}>All</button>
          <button className={filter === "active" ? "tab active" : "tab"} onClick={() => setFilter("active")} role="tab" aria-selected={filter === "active"}>Active</button>
          <button className={filter === "completed" ? "tab active" : "tab"} onClick={() => setFilter("completed")} role="tab" aria-selected={filter === "completed"}>Completed</button>
        </div>
        <div className="status">
          <span>{remaining} {remaining === 1 ? "item" : "items"} left</span>
          <button className="btn" onClick={clearCompleted} disabled={todos.every(t => !t.completed)}>Clear completed</button>
        </div>
      </section>

      <ul className="list" aria-live="polite">
        {filteredTodos.map(todo => (
          <TodoItem key={todo.id} todo={todo} onToggle={() => toggleTodo(todo.id)} onDelete={() => deleteTodo(todo.id)} onEdit={text => editTodo(todo.id, text)} />
        ))}
      </ul>

      {todos.length === 0 && (
        <p className="empty">No todos yet. Add one above!</p>
      )}
    </main>
  );
}

function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(todo.text);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onEdit(trimmed);
    setEditing(false);
  }

  return (
    <li className="item">
      <label className="checkbox">
        <input type="checkbox" checked={todo.completed} onChange={onToggle} aria-label={todo.completed ? "Mark as active" : "Mark as completed"} />
        <span className={todo.completed ? "text completed" : "text"}>
          {editing ? (
            <form onSubmit={handleSubmit} className="editForm">
              <input ref={inputRef} value={value} onChange={e => setValue(e.target.value)} onBlur={handleSubmit} className="editInput" aria-label="Edit todo" />
            </form>
          ) : (
            todo.text
          )}
        </span>
      </label>
      <div className="actions">
        <button className="icon" onClick={() => setEditing(v => !v)} aria-label={editing ? "Save" : "Edit"}>
          {editing ? "Save" : "Edit"}
        </button>
        <button className="icon danger" onClick={onDelete} aria-label="Delete">Delete</button>
      </div>
    </li>
  );
}
