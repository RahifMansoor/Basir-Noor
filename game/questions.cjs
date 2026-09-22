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
  ['Islamic Culture, Language & History', [
    ['This refined Awadhi cooking method seals the pot so food cooks slowly in its own steam.\nA. Tandoori  B. Bhunao  C. Dum pukht  D. Baghaar', 'What is dum pukht? (C)'],
    ['This early literary form of Urdu poetry blended Persian and Arabic vocabulary with North Indian linguistic traditions.\nA. Dakhni  B. Rekhta  C. Braj Bhasha  D. Hindavi prose', 'What is Rekhta? (B)'],
    ['In Sufi culture, this refers to a devotional gathering involving spiritually inspired listening, poetry, and sometimes music.\nA. Urs  B. Sama  C. Zikr  D. Ijlas', 'What is sama? (B)'],
    ['This distinctive diagonal calligraphic style is traditionally used to write Urdu.\nA. Kufic  B. Devanagari  C. Nastaliq  D. Naskh', 'What is Nastaliq? (C)'],
    ['This Indian Muslim physician led the Indian Medical Mission to the Ottoman Empire in 1912–1913 and later became a prominent nationalist leader.\nA. Dr. M. A. Ansari  B. Dr. Zakir Husain  C. Dr. Homi Bhabha  D. Dr. Bidhan Chandra Roy', 'Who was Dr. M. A. Ansari? (A)'],
    ['This Persian Muslim scholar wrote Kitab al-Hind, an important account of Indian religion, philosophy, science, and society.\nA. Al-Khwarizmi  B. Al-Biruni  C. Ibn Battuta  D. Al-Farabi', 'Who was Al-Biruni? (B)'],
    ['This poet and philosopher wrote the famous patriotic poem “Sare Jahan Se Achha.”\nA. Mirza Ghalib  B. Faiz Ahmed Faiz  C. Muhammad Iqbal  D. Josh Malihabadi', 'Who was Muhammad Iqbal? (C)'],
    ['This legendary musician, closely associated with Varanasi, elevated the shehnai from a ceremonial instrument to the classical concert stage.\nA. Ustad Zakir Hussain  B. Ustad Bismillah Khan  C. Ustad Amjad Ali Khan  D. Ustad Vilayat Khan', 'Who was Ustad Bismillah Khan? (B)'],
  ]],
  ['Food', [
    ['This Kashmiri dish combines turnips and meat in a slow-cooked preparation associated with Kashmiri and Mughal culinary traditions.\nA. Yakhni  B. Shabdeg  C. Qaliya  D. Rista', 'What is shabdeg? (B)'],
    ['These kebabs, associated with the Kakori area near Lucknow, are famous for their delicate, exceptionally tender texture.\nA. Seekh kebabs  B. Kakori kebabs  C. Bihari kebabs  D. Reshmi kebabs', 'What are Kakori kebabs? (B)'],
    ['The Persian word zardozi literally means this type of embroidery.\nA. Silk embroidery  B. Gold embroidery  C. Mirror embroidery  D. Floral embroidery', 'What is gold embroidery? (B)'],
    ['This Kashmiri textile technique uses metallic gold- or silver-colored thread on garments such as pherans.\nA. Tilla work  B. Phulkari  C. Chikankari  D. Aari work', 'What is tilla work? (A)'],
  ]],
  ['Indian Muslim Craft Traditions', [
    ['This Agra craft carefully inlays colored stones into marble, famously seen in Mughal decorative traditions.\nA. Khatamkari  B. Parchinkari  C. Bidriware  D. Minakari', 'What is parchinkari? (B)'],
    ['This Kashmiri papier-mâché craft involves molded paper forms that are hand-painted with floral, geometric, and figurative designs.\nA. Kari-kalamdani  B. Chikankari  C. Parchinkari  D. Tilla-kari', 'What is kari-kalamdani? (A)'],
    ['This traditional Kashmiri floor covering is made from hand-felted wool.\nA. Gabba  B. Namda  C. Dhurrie  D. Dari', 'What is namda? (B)'],
    ['This North Indian city is internationally associated with hand-knotted carpets and is often called India’s carpet capital.\nA. Bhadohi  B. Jaipur  C. Lucknow  D. Amritsar', 'What is Bhadohi? (A)'],
    ['This Uttar Pradesh city is famous for engraved and decorative brassware.\nA. Moradabad  B. Bareilly  C. Kanpur  D. Aligarh', 'What is Moradabad? (A)'],
    ['This Sindhi textile tradition is a patchwork quilt made by piecing and stitching fabric rather than using only surface embroidery.\nA. Rilli  B. Suzani  C. Gota  D. Tilla', 'What is a rilli? (A)'],
  ]],
  ['Pakistani Food', [
    ['This Balochi dish consists of whole lamb, goat, or chicken roasted over an open fire with relatively simple seasoning.\nA. Sajji  B. Nihari  C. Haleem  D. Karahi', 'What is sajji? (A)'],
    ['This simply seasoned salted-meat dish is particularly associated with Pashtun cuisine and Khyber Pakhtunkhwa.\nA. Namkeen gosht  B. Qorma  C. Bhuna gosht  D. Achari gosht', 'What is namkeen gosht? (A)'],
    ['This city is famous for a dense, chewy sweet made with flour, sugar, ghee, and nuts.\nA. Lahore  B. Multan  C. Peshawar  D. Quetta', 'What is Multan? (B)'],
  ]],
  ['Famous Muslims in the United States', [
    ['This Muslim American fencer became the first U.S. Olympian to compete while wearing a hijab.\nA. Ibtihaj Muhammad  B. Dalilah Muhammad  C. Noor Tagouri  D. Hoda Kotb', 'Who is Ibtihaj Muhammad? (A)'],
    ['This Bangladeshi-American structural engineer developed the bundled-tube system used in the design of Chicago’s Sears Tower, now called the Willis Tower.\nA. Fazlur Rahman Khan  B. Ismail al-Jazari  C. Nader Engheta  D. Anousheh Ansari', 'Who was Fazlur Rahman Khan? (A)'],
    ['This Indian-American educator began tutoring his cousin remotely and eventually founded Khan Academy.\nA. Salman Khan  B. Shahid Khan  C. Amir Khan  D. Imran Khan', 'Who is Salman Khan? (A)'],
    ['This actor won Academy Awards for his performances in Moonlight and Green Book.\nA. Riz Ahmed  B. Mahershala Ali  C. Kumail Nanjiani  D. Dev Patel', 'Who is Mahershala Ali? (B)'],
    ['This Pakistani-American businessman owns Flex-N-Gate and became the owner of the Jacksonville Jaguars.\nA. Shahid Khan  B. Hamdi Ulukaya  C. Fareed Zakaria  D. Naveen Selvadurai', 'Who is Shahid Khan? (A)'],
  ]],
];
const addedValues = {
  'Islamic Culture, Language & History': [300, 500, 500, 300, 500, 500, 300, 300],
  Food: [500, 500, 100, 500],
  'Indian Muslim Craft Traditions': [300, 500, 300, 100, 100, 300],
  'Pakistani Food': [100, 300, 300],
  'Famous Muslims in the United States': [300, 500, 100, 300, 300],
};
const questions = categories.flatMap(([category, clues], column) => clues.map(([clue, answer], row) => ({
  id: `${column}-${row}`, category, value: addedValues[category]?.[row] ?? (row + 1) * 100, clue, answer,
})));
module.exports = { categories: categories.map(([name]) => name), questions };
