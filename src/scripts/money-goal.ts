import { loadCompass, saveCompass } from './storage';

/** Money-Ziel der Woche auf Ziele; der Power Talk in Affirm setzt es für {ziel} ein. */
const input = document.getElementById('money-goal') as HTMLInputElement;
input.value = loadCompass().fields['affirm.money'] ?? '';
input.addEventListener('input', () => {
  const compass = loadCompass();
  compass.fields['affirm.money'] = input.value;
  saveCompass(compass);
});
