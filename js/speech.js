/**
 * Озвучка слов через встроенный Web Speech API (speechSynthesis)
 */
const SpeechModule = (() => {
  const synth = window.speechSynthesis;
  const supported = 'speechSynthesis' in window;

  // Кэш голосов: в некоторых браузерах список приходит асинхронно
  let voices = [];
  const loadVoices = () => {
    if (!supported) return;
    voices = synth.getVoices();
  };
  if (supported) {
    loadVoices();
    // Chrome грузит голоса асинхронно — подписываемся
    synth.onvoiceschanged = loadVoices;
  }

  // Выбрать лучший голос для нужного языка
  const pickVoice = (lang) => {
    if (!voices.length) loadVoices();
    // 1) точное совпадение (en-US, en-GB)
    let v = voices.find(v => v.lang === lang);
    // 2) любой английский
    if (!v && lang.startsWith('en')) {
      v = voices.find(v => v.lang.startsWith('en'));
    }
    // 3) первый доступный
    return v || null;
  };

  /**
   * Озвучить текст.
   * @param {string} text       — что произносить
   * @param {object} [opts]
   * @param {string} [opts.lang='en-US']  — язык
   * @param {number} [opts.rate=0.95]     — скорость (0.1–10)
   * @param {number} [opts.pitch=1]       — тон (0–2)
   * @param {number} [opts.volume=1]      — громкость (0–1)
   */
  const speak = (text, opts = {}) => {
    if (!supported || !text) return;
    const {
      lang = 'en-US',
      rate = 0.95,
      pitch = 1,
      volume = 1,
    } = opts;

    // Отменяем предыдущую озвучку, чтобы не накладывалось
    synth.cancel();

    const utter = new SpeechSynthesisUtterance(String(text).trim());
    utter.lang = lang;
    utter.rate = rate;
    utter.pitch = pitch;
    utter.volume = volume;

    const voice = pickVoice(lang);
    if (voice) utter.voice = voice;

    // Некоторые браузеры «зависают» при длинных очередях — страхуемся
    utter.onerror = (e) => console.warn('Speech error:', e.error);
    synth.speak(utter);
  };

  const cancel = () => { if (supported) synth.cancel(); };

  /**
   * Определить, нужно ли озвучивать слово.
   * Считаем "англоязычным" всё, что содержит латиницу и не содержит кириллицы.
   */
  const isLatin = (text) => {
    if (!text) return false;
    const hasLatin = /[A-Za-z]/.test(text);
    const hasCyrillic = /[А-Яа-яЁё]/.test(text);
    return hasLatin && !hasCyrillic;
  };

  return { speak, cancel, isLatin, supported };
})();