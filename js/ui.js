/**
 * Отрисовка UI и обработка DOM событий
 */
const UIModule = (() => {
  // Вкладки
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Обучение DOM
  const emptyDeckMsg = document.getElementById('empty-deck-msg');
  const startSessionCard = document.getElementById('start-session-card');
  const activeSessionCard = document.getElementById('active-session-card');
  const resultsCard = document.getElementById('results-card');

  const studySpeakBtn   = document.getElementById('study-speak-btn');
const sessionSpeakBtn = document.getElementById('session-speak-btn');

  const startSessionBtn = document.getElementById('start-session-btn');
  const finishSessionBtn = document.getElementById('finish-session-btn');

  const sessionProgressText = document.getElementById('session-progress-text');
  const learnedStar = document.getElementById('learned-star');
  const currentWordElem = document.getElementById('current-word');
  const hardWordBadge = document.getElementById('hard-word-badge');
  const optionsContainer = document.getElementById('options-container');

  // Словарь DOM
  const addWordForm = document.getElementById('add-word-form');
  const inputWord = document.getElementById('input-word');
  const inputTranslation = document.getElementById('input-translation');
  const wordsTableBody = document.getElementById('words-table-body');
  const totalWordsCount = document.getElementById('total-words-count');

  // Словарь DOM выбор элемента
  const dictionarySelect = document.getElementById('dictionary-select');
  const createDictBtn = document.getElementById('create-dict-btn');
  const deleteDictBtn = document.getElementById('delete-dict-btn');

  // Импорт/Экспорт DOM
  const importJsonFile = document.getElementById('import-json-file');
  const exportJsonBtn = document.getElementById('export-json-btn');

  // Отрисовка селектора словарей
  const renderDictionarySelector = () => {
    const dictionaries = StorageModule.getDictionariesList();
    dictionarySelect.innerHTML = '';

    dictionaries.forEach(dict => {
      const option = document.createElement('option');
      option.value = dict.id;
      option.textContent = `${dict.name} (${dict.count} слов)`;
      if (dict.isActive) option.selected = true;
      dictionarySelect.appendChild(option);
    });
  };

  // Переключение словаря в селекте
  dictionarySelect.addEventListener('change', (e) => {
    StorageModule.setActiveDictionary(e.target.value);
    renderDictionary();
  });

  // Создание нового словаря
  createDictBtn.addEventListener('click', () => {
    const name = prompt('Введите название нового словаря:', 'Мой словарь');
    if (name) {
      StorageModule.createDictionary(name);
      renderDictionarySelector();
      renderDictionary();
    }
  });

  // Удаление текущего словаря
  deleteDictBtn.addEventListener('click', () => {
    const activeId = StorageModule.getActiveDictionaryId();
    if (confirm('Вы уверены, что хотите удалить текущий словарь со всеми словами?')) {
      if (StorageModule.deleteDictionary(activeId)) {
        renderDictionarySelector();
        renderDictionary();
      }
    }
  });

  // Общая функция обновления вкладки словаря
  const renderDictionary = () => {
    renderDictionarySelector();
    const words = StorageModule.getWords();
    totalWordsCount.textContent = words.length;
    wordsTableBody.innerHTML = '';

    words.forEach(w => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
                <td><strong>${w.word}</strong></td>
                <td>${w.translation}</td>
                <td>${w.consecutiveCorrect}/5</td>
                <td>${w.isLearned ? '★ Выучено' : 'В процессе'}</td>
                <td><button class="glass-btn secondary-btn" onclick="UIModule.deleteWordHandler('${w.id}')">❌</button></td>
            `;
      wordsTableBody.appendChild(tr);
    });
  };

  // Экспорт словаря в JSON (теперь экспортирует целиком текущий словарь с названием)
  exportJsonBtn.addEventListener('click', () => {
    const dictionaries = StorageModule.getData ? StorageModule.getData() : null; // или через метод
    // Собираем объект текущего активного словаря
    const activeId = StorageModule.getActiveDictionaryId();
    const dictsList = StorageModule.getDictionariesList();
    const currentMeta = dictsList.find(d => d.id === activeId);

    const exportData = {
      name: currentMeta ? currentMeta.name : 'Словарь',
      words: StorageModule.getWords()
    };

    const data = JSON.stringify(exportData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocab_${currentMeta ? currentMeta.name.toLowerCase().replace(/\s+/g, '_') : 'export'}_${Date.now()}.json`;
    a.click();
  });

  // Импорт JSON (теперь создает новый словарь из файла)
  importJsonFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // имя файла без расширения как название словаря
      if (StorageModule.importDictionaryJSON(event.target.result, fileName)) {
        alert('Словарь успешно импортирован и активирован!');
        renderDictionary();
      } else {
        alert('Ошибка при импорте файла JSON.');
      }
    };
    reader.readAsText(file);
  });

  // Переключение вкладок
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {

      SpeechModule.cancel();

      navBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.add('hidden'));

      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.remove('hidden');

      if (btn.dataset.tab === 'dict-tab') renderDictionary();
      if (btn.dataset.tab === 'stats-tab') renderStats();
    });
  });

  // Отрисовка таблицы словаря
  // const renderDictionary = () => {
  //   const words = StorageModule.getWords();
  //   totalWordsCount.textContent = words.length;
  //   wordsTableBody.innerHTML = '';

  //   words.forEach(w => {
  //     const tr = document.createElement('tr');
  //     tr.innerHTML = `
  //               <td><strong>${w.word}</strong></td>
  //               <td>${w.translation}</td>
  //               <td>${w.consecutiveCorrect}/5</td>
  //               <td>${w.isLearned ? '★ Выучено' : 'В процессе'}</td>
  //               <td><button class="glass-btn secondary-btn" onclick="UIModule.deleteWordHandler('${w.id}')">❌</button></td>
  //           `;
  //     wordsTableBody.appendChild(tr);
  //   });
  // };

  // Удаление слова из таблицы
  window.UIModule = {
    deleteWordHandler: (id) => {
      StorageModule.deleteWord(id);
      renderDictionary();
    }
  };

  // Добавление слова
  addWordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (StorageModule.addWord(inputWord.value, inputTranslation.value)) {
      inputWord.value = '';
      inputTranslation.value = '';
      renderDictionary();
    }
  });

  // Озвучить слово, если оно "англоязычное"
const speakWord = (text) => {
  if (!SpeechModule.supported) return;
  if (!SpeechModule.isLatin(text)) return;
  SpeechModule.speak(text, { lang: 'en-US', rate: 0.95 });
};

  // Экспорт в JSON
  exportJsonBtn.addEventListener('click', () => {
    const data = JSON.stringify(StorageModule.getWords(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `word_know_backup_${Date.now()}.json`;
    a.click();
  });

  // Импорт из JSON
  importJsonFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (StorageModule.importJSON(event.target.result)) {
        alert('Слова успешно импортированы!');
        renderDictionary();
      } else {
        alert('Ошибка при импорте файла JSON.');
      }
    };
    reader.readAsText(file);
  });

  if (sessionSpeakBtn) {
  sessionSpeakBtn.addEventListener('click', () => {
    const w = SessionModule.getCurrentWord();
    if (w) speakWord(w.word);
  });
}

  // Отрисовка карточки вопроса
  const renderQuestion = () => {
    const word = SessionModule.getCurrentWord();
    const progress = SessionModule.getProgress();

    sessionProgressText.textContent = `${progress.current} / ${progress.total}`;
    currentWordElem.textContent = word.word;

    // Звездочка
    if (word.isLearned || word.consecutiveCorrect >= 5) {
      learnedStar.classList.add('active');
    } else {
      learnedStar.classList.remove('active');
    }

    // Индикатор важного слова
    if (word.errorsCount >= 2) {
      hardWordBadge.classList.remove('hidden');
    } else {
      hardWordBadge.classList.add('hidden');
    }

    // Отрисовка вариантов
    optionsContainer.innerHTML = '';
    const options = SessionModule.generateOptions();

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'glass-btn option-btn';
      btn.textContent = opt;

      btn.addEventListener('click', () => {
        const isCorrect = SessionModule.handleAnswer(opt);

        if (isCorrect) {
          btn.classList.add('correct');
          setTimeout(() => {
            if (SessionModule.nextWord()) {
              renderQuestion();
            } else {
              showResults();
            }
          }, 500);
        } else {
          btn.classList.add('wrong');
          // Допускаем выбор пока не нажмет верный вариант
        }
      });

      optionsContainer.appendChild(btn);
    });
    // Авто-озвучка при показе нового слова
speakWord(word.word);
  };

  // Старт сеанса
  startSessionBtn.addEventListener('click', () => {
  SpeechModule.cancel(); // на случай, если что-то доигрывало
    if (!SessionModule.initSession()) {
      emptyDeckMsg.classList.remove('hidden');
      startSessionCard.classList.add('hidden');
      return;
    }

    startSessionCard.classList.add('hidden');
    emptyDeckMsg.classList.add('hidden');
    activeSessionCard.classList.remove('hidden');
    renderQuestion();
  });

  // Результаты
  const showResults = () => {

    SpeechModule.cancel();

    activeSessionCard.classList.add('hidden');
    resultsCard.classList.remove('hidden');

    const sessionStats = SessionModule.getSessionStats();
    document.getElementById('session-correct-count').textContent = sessionStats.correct;
    document.getElementById('session-errors-count').textContent = sessionStats.errors;

    const allWords = StorageModule.getWords();
    document.getElementById('global-total-count').textContent = allWords.length;
    document.getElementById('global-learned-count').textContent = allWords.filter(w => w.isLearned).length;
  };

  finishSessionBtn.addEventListener('click', () => {
    resultsCard.classList.add('hidden');
    startSessionCard.classList.remove('hidden');
  });

  // Отрисовка статистики
  const renderStats = () => {
    const words = StorageModule.getWords();
    document.getElementById('stat-total-words').textContent = words.length;
    document.getElementById('stat-learned-words').textContent = words.filter(w => w.isLearned).length;
    document.getElementById('stat-hard-words').textContent = words.filter(w => w.errorsCount >= 2).length;
  };

  // модалка 
  const studyModal = document.getElementById('study-complete-modal');
  const modalContinueBtn = document.getElementById('modal-continue-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');

  // Элементы DOM для режима обучения
  const startStudyBtn = document.getElementById('start-study-btn');
  const studyModeCard = document.getElementById('study-mode-card');
  const studyProgressText = document.getElementById('study-progress-text');
  const studyProgressFill = document.getElementById('study-progress-fill');
  const studyTargetWord = document.getElementById('study-target-word');
  const studyTargetTranslation = document.getElementById('study-target-translation');
  const studyNextBtn = document.getElementById('study-next-btn');

  let studyTimerId = null;
  let studyProgressIntervalId = null;
  const STUDY_DURATION_MS = 20000; // 20 секунд

  // Отрисовка текущего слова в обучении
  const renderStudyWord = () => {
    clearStudyTimers();

    const word = SessionModule.getStudyCurrentWord();
    const progress = SessionModule.getStudyProgress();

    studyProgressText.textContent = `${progress.current} / ${progress.total}`;
    studyTargetWord.textContent = word.word;
    studyTargetTranslation.textContent = word.translation;

      // 🔊 Авто-озвучка при показе нового слова
  speakWord(word.word);

    // Запуск плавной анимации прогресс-бара
    let startTime = Date.now();
    studyProgressFill.style.width = '0%';

    studyProgressIntervalId = setInterval(() => {
      let elapsed = Date.now() - startTime;
      let percent = Math.min((elapsed / STUDY_DURATION_MS) * 100, 100);
      studyProgressFill.style.width = `${percent}%`;
    }, 50);

    // Таймер автоматического перехода через 10 секунд
    studyTimerId = setTimeout(() => {
      handleStudyNextStep();
    }, STUDY_DURATION_MS);
  };

  const clearStudyTimers = () => {
    if (studyTimerId) clearTimeout(studyTimerId);
    if (studyProgressIntervalId) clearInterval(studyProgressIntervalId);
  };

  const handleStudyNextStep = () => {
    clearStudyTimers();

    if (SessionModule.nextStudyWord()) {
      renderStudyWord(); // Показываем следующее слово из порции
    } else {
      // Порция из 5 слов завершена — показываем красивое модальное окно вместо confirm
      studyModal.classList.remove('hidden');
    }
  };

  // Нажатие "Учить ещё 5 слов"
  if (modalContinueBtn) {
    modalContinueBtn.addEventListener('click', () => {
  SpeechModule.cancel(); // старое слово из прошлой порции не должно договаривать
      studyModal.classList.add('hidden');

      if (SessionModule.initStudyDeck()) {
        renderStudyWord();
      } else {
        alert('В словаре больше нет слов!');
        closeStudyMode();
      }
    });
  }

  // Нажатие "В меню"
  if (modalCancelBtn) {
    modalCancelBtn.addEventListener('click', () => {
      studyModal.classList.add('hidden');
      closeStudyMode();
    });
  }

  const closeStudyMode = () => {

    SpeechModule.cancel();

    clearStudyTimers();
    studyModeCard.classList.add('hidden');
    startSessionCard.classList.remove('hidden');
  };

  // Привязка событий
  if (startStudyBtn) {
    startStudyBtn.addEventListener('click', () => {
  SpeechModule.cancel();
      if (!SessionModule.initStudyDeck()) {
        alert('Словарь пуст! Добавьте слова во вкладке "Словарь".');
        return;
      }
      startSessionCard.classList.add('hidden');
      studyModeCard.classList.remove('hidden');
      renderStudyWord();
    });
  }

  if (studyNextBtn) {
  studySpeakBtn.addEventListener('click', () => {
    const w = SessionModule.getStudyCurrentWord();
    if (w) speakWord(w.word);
  });
    studyNextBtn.addEventListener('click', () => {
      handleStudyNextStep(); // Сбрасывает таймер 10 сек и сразу переходит дальше
    });
  }

  return { renderDictionary, renderStats };
})();