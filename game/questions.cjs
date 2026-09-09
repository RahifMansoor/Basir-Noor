// Server-only answer bank. Review with your event host before game day.
const categories = [
  ['Foundations', [
    ['The number of pillars of Islam.', 'What is five?'],
    ['The declaration of faith, the first pillar of Islam.', 'What is the Shahadah?'],
    ['The obligatory charity that is one of the five pillars.', 'What is Zakah (Zakat)?'],
    ['The pilgrimage to Makkah required of Muslims who are able.', 'What is Hajj?'],
    ['The Arabic word for excellence in worship, described as worshipping Allah as though you see Him.', 'What is Ihsan?'],
  ]],
  ['The Quran', [
    ['The opening chapter of the Quran.', 'What is Al-Fatihah?'],
    ['The language in which the Quran was revealed.', 'What is Arabic?'],
    ['The number of surahs in the Quran.', 'What is 114?'],
    ['The longest surah in the Quran.', 'What is Al-Baqarah?'],
    ['The surah named after Mary, the mother of Isa.', 'What is Maryam?'],
  ]],
  ['Prophets', [
    ['The first human and prophet in Islamic belief.', 'Who is Adam?'],
    ['The prophet who built an ark.', 'Who is Nuh (Noah)?'],
    ['The prophet to whom the Tawrah was given.', 'Who is Musa (Moses)?'],
    ['The prophet whose story includes being swallowed by a great fish.', 'Who is Yunus (Jonah)?'],
    ['The prophet who could interpret dreams and became responsible for Egypt’s storehouses.', 'Who is Yusuf (Joseph)?'],
  ]],
  ['Prayer & Worship', [
    ['The number of obligatory daily prayers.', 'What is five?'],
    ['The prayer performed before sunrise.', 'What is Fajr?'],
    ['The direction Muslims face in prayer.', 'What is the Qiblah (toward the Kaaba)?'],
    ['The ritual washing performed before prayer.', 'What is Wudu?'],
    ['The call that announces the time for prayer.', 'What is the Adhan?'],
  ]],
  ['Ramadan & Community', [
    ['The month in which Muslims fast from dawn to sunset.', 'What is Ramadan?'],
    ['The meal that breaks the fast at sunset.', 'What is Iftar?'],
    ['The festival that marks the end of Ramadan.', 'What is Eid al-Fitr?'],
    ['The pre-dawn meal eaten before a day of fasting.', 'What is Suhur (Suhoor)?'],
    ['The night described in Surah Al-Qadr as better than a thousand months.', 'What is Laylat al-Qadr?'],
  ]],
];
const questions = categories.flatMap(([category, clues], column) => clues.map(([clue, answer], row) => ({
  id: `${column}-${row}`, category, value: (row + 1) * 100, clue, answer,
})));
module.exports = { categories: categories.map(([name]) => name), questions };
