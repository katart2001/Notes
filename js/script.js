"use strict";

//! Всплытие Окна Добавление Заметок

//Подключаем переменные
const btn = document.getElementById('toggle');
const panel = document.getElementById('panel');

//Создаём евент для открытия она при нажатии на кнопку "ADD"
btn.addEventListener('click', () => {
  const isHidden = panel.hasAttribute('hidden');
  if (isHidden) {
    panel.removeAttribute('hidden');
    btn.setAttribute('aria-expanded','true');
  } else {
    panel.setAttribute('hidden','');
    btn.setAttribute('aria-expanded','false');
  }
});

//Создаём евент для закрытия окна при нажатии на кнопку "ADD"
document.addEventListener('click', (e) => {
  if (!e.target.closest('.create_hidden')) {
    panel.setAttribute('hidden','');
    btn.setAttribute('aria-expanded','false');
  }
});

//Создаём евент для закрития окна при нажатии на escape 
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    panel.setAttribute('hidden','');
    btn.setAttribute('aria-expanded','false');
  }
});

//! Подгрузка Заметок с Базы

async function loadNotes() {
  try{
    const res = await fetch("https://6876046e814c0dfa653a3f3e.mockapi.io/Notes"); // Подключаем базу 
    const notes = await res.json(); // Переводив в массив

    for(let i = 0; i < notes.length; i++){ // Цикл для создания  заметок для всех ID из базы

      //Подключаем переменные с классами
      const block = document.querySelector('.block__flex');
      const newElem = document.createElement('div');
      const btnDelete = document.createElement('button');
      const btnChange = document.createElement('button');

      
      newElem.classList.add('note'); //  Подключаем стили 
      newElem.dataset.id = notes[i].id; // Вешаем тригер на ID для удаления и изменения заметки
      block.append(newElem); // Добавляем созданый блок в структуру сайта

      //  Создаём елемент с Title/Подключаем к странице 
      const newElem1 = document.createElement('h3'); 
      newElem1.textContent = notes[i].title;
      newElem.append(newElem1);

      // Создаём елемент с TEXT/Подключаем к странице
      const newElem2 = document.createElement('p');
      newElem2.textContent = notes[i].text;
      newElem.append(newElem2);
      
      // Создаём кнопку удалить/стилизируем/подключаем
      btnDelete.textContent = "DELETE";
      btnDelete.classList.add('note_btn');
      newElem.append(btnDelete);

      // Евент для удаления нужной заметки из страницы/базы данных
      btnDelete.addEventListener('click', async (e) => {
        const card = e.currentTarget.closest('.note'); 
        const id = card.dataset.id; 
        await fetch(`https://6876046e814c0dfa653a3f3e.mockapi.io/Notes/${id}`, { method: 'DELETE' });
        card.remove();
      });

      //Создаём/Стилизируем/Подключаем кнопку для изменения заметок
      btnChange.textContent = "CHANGE";
      btnChange.classList.add('note_btn2');
      newElem.append(btnChange);

    }

  } catch(err){ // На случий ошибок
    console.error(err);
  }
}

loadNotes()

//! Редактор / Удаление заметок

//Подключаем  переменные к классам
const modal = document.getElementById('editModal');
const form = document.getElementById('editForm');
const inputTitle = form.querySelector('.edit-title');
const inputText  = form.querySelector('.edit-text');

//Создаём переменные которые будут нужны в дальнейшем
let currentCard = null; 
let currentId   = null;  
let lastFocus   = null;  

document.querySelector('.block__flex').addEventListener('click', (e) => {
  const btn = e.target.closest('.note_btn2');
  if (!btn) return;

  currentCard = btn.closest('.note');
  currentId   = currentCard.dataset.id;
  lastFocus   = document.activeElement;

  inputTitle.value = currentCard.querySelector('h3')?.textContent ?? '';
  inputText.value  = currentCard.querySelector('p')?.textContent ?? '';

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  inputTitle.focus();
});

function closeModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  form.reset();
  if (lastFocus) lastFocus.focus();
  currentCard = null;
  currentId = null;
}
modal.querySelector('.modal__overlay').addEventListener('click', closeModal);
modal.querySelector('.modal__close').addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    title: inputTitle.value.trim(),
    text:  inputText.value.trim()
  };
  if (!currentId) return;

  try {
    const res = await fetch(`https://6876046e814c0dfa653a3f3e.mockapi.io/Notes/${currentId}`, {
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    currentCard.querySelector('h3').textContent = payload.title;
    currentCard.querySelector('p').textContent  = payload.text;

    closeModal();
  } catch (err) {
    console.error('Update error:', err);
  }
});

// УДАЛЕНИЕ из модалки
modal.querySelector('.btn-delete-in-modal').addEventListener('click', async () => {
  if (!currentId || !currentCard) return;
  try {
    const res = await fetch(`https://6876046e814c0dfa653a3f3e.mockapi.io/Notes/${currentId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    currentCard.remove();
    closeModal();
  } catch (err) {
    console.error('Delete error:', err);
  }
});

//! Сохранение Заметок
async function saveNotes() {
  try{
    // Подключаем  переменные к классам
    const save = document.querySelector('.create_block_btn1');
    const reset = document.querySelector('.create_block_btn2');
    const title = document.querySelector('.create_block_form_title');
    const text = document.querySelector('.create_block_form_text');

    // Евент с сохранением заметок и отправкой в базу
    save.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://6876046e814c0dfa653a3f3e.mockapi.io/Notes", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.value, text: text.value })
      });
        if (!res.ok) throw new Error(`HTTP ${res.status}`); // Проверка
        const data = await res.json();
        console.log('OK:', data);
        title.value = "";
        text.value = "";
        location.reload()
      } catch (err) {
        console.error('POST err:', err);
      }
    });

    // Евент для кнопки "RESET"
    reset.addEventListener('click', function() {
      title.value = "";
      text.value = "";
      console.log('Кнопка нажата!');
    });

  }catch{
    console.error(err);
  }
}

saveNotes()


