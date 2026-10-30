/**
 * Точка входа приложения и управление темой
 */
document.addEventListener('DOMContentLoaded', () => {
  // Автозагрузка дефолтных слов при первом пуске
  StorageModule.initDefaultWords();

  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = themeToggleBtn.querySelector('.theme-icon');

  // Загрузка темы
  const savedTheme = localStorage.getItem('aura_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

  // Смена темы
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('aura_theme', newTheme);
    themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  });

  window.addEventListener('beforeunload', () => {
  if (typeof SpeechModule !== 'undefined') SpeechModule.cancel();
});
});