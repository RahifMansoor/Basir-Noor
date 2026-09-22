// Server-only answer bank. Review with your event host before game day.
const categories = [
  ['Foundations', [
    [100, 'The number of pillars of Islam.', 'What is five?'],
    [200, 'The declaration of faith, the first pillar of Islam.', 'What is the Shahadah?'],
    [300, 'The obligatory charity that is one of the five pillars.', 'What is Zakah (Zakat)?'],
    [400, 'The pilgrimage to Makkah required of Muslims who are able.', 'What is Hajj?'],
    [500, 'The Arabic word for excellence in worship, described as worshipping Allah as though you see Him.', 'What is Ihsan?'],
  ]],
  ['The Quran', [
    [100, 'The opening chapter of the Quran.', 'What is Al-Fatihah?'],
    [200, 'The language in which the Quran was revealed.', 'What is Arabic?'],
    [300, 'The number of surahs in the Quran.', 'What is 114?'],
    [400, 'The longest surah in the Quran.', 'What is Al-Baqarah?'],
    [500, 'The surah named after Mary, the mother of Isa.', 'What is Maryam?'],
  ]],
  ['Prophets', [
    [100, 'The first human and prophet in Islamic belief.', 'Who is Adam?'],
    [200, 'The prophet who built an ark.', 'Who is Nuh (Noah)?'],
    [300, 'The prophet to whom the Tawrah was given.', 'Who is Musa (Moses)?'],
    [400, 'The prophet whose story includes being swallowed by a great fish.', 'Who is Yunus (Jonah)?'],
    [500, 'The prophet who could interpret dreams and became responsible for Egypt’s storehouses.', 'Who is Yusuf (Joseph)?'],
  ]],
  ['Prayer & Worship', [
    [100, 'The number of obligatory daily prayers.', 'What is five?'],
    [200, 'The prayer performed before sunrise.', 'What is Fajr?'],
    [300, 'The direction Muslims face in prayer.', 'What is the Qiblah (toward the Kaaba)?'],
    [400, 'The ritual washing performed before prayer.', 'What is Wudu?'],
    [500, 'The call that announces the time for prayer.', 'What is the Adhan?'],
  ]],
  ['Ramadan & Community', [
    [100, 'The month in which Muslims fast from dawn to sunset.', 'What is Ramadan?'],
    [200, 'The meal that breaks the fast at sunset.', 'What is Iftar?'],
    [300, 'The festival that marks the end of Ramadan.', 'What is Eid al-Fitr?'],
    [400, 'The pre-dawn meal eaten before a day of fasting.', 'What is Suhur (Suhoor)?'],
    [500, 'The night described in Surah Al-Qadr as better than a thousand months.', 'What is Laylat al-Qadr?'],
  ]],
  ['Islamic Culture, Language & History', [
    [300, 'This refined Awadhi cooking method seals the pot so food cooks slowly in its own steam.\nA. Tandoori  B. Bhunao  C. Dum pukht  D. Baghaar', 'What is dum pukht? (C)'],
    [500, 'This early literary form of Urdu poetry blended Persian and Arabic vocabulary with North Indian linguistic traditions.\nA. Dakhni  B. Rekhta  C. Braj Bhasha  D. Hindavi prose', 'What is Rekhta? (B)'],
    [500, 'In Sufi culture, this refers to a devotional gathering involving spiritually inspired listening, poetry, and sometimes music.\nA. Urs  B. Sama  C. Zikr  D. Ijlas', 'What is sama? (B)'],
    [300, 'This distinctive diagonal calligraphic style is traditionally used to write Urdu.\nA. Kufic  B. Devanagari  C. Nastaliq  D. Naskh', 'What is Nastaliq? (C)'],
    [500, 'This Indian Muslim physician led the Indian Medical Mission to the Ottoman Empire in 1912–1913 and later became a prominent nationalist leader.\nA. Dr. M. A. Ansari  B. Dr. Zakir Husain  C. Dr. Homi Bhabha  D. Dr. Bidhan Chandra Roy', 'Who was Dr. M. A. Ansari? (A)'],
    [500, 'This Persian Muslim scholar wrote Kitab al-Hind, an important account of Indian religion, philosophy, science, and society.\nA. Al-Khwarizmi  B. Al-Biruni  C. Ibn Battuta  D. Al-Farabi', 'Who was Al-Biruni? (B)'],
    [300, 'This poet and philosopher wrote the famous patriotic poem “Sare Jahan Se Achha.”\nA. Mirza Ghalib  B. Faiz Ahmed Faiz  C. Muhammad Iqbal  D. Josh Malihabadi', 'Who was Muhammad Iqbal? (C)'],
    [300, 'This legendary musician, closely associated with Varanasi, elevated the shehnai from a ceremonial instrument to the classical concert stage.\nA. Ustad Zakir Hussain  B. Ustad Bismillah Khan  C. Ustad Amjad Ali Khan  D. Ustad Vilayat Khan', 'Who was Ustad Bismillah Khan? (B)'],
  ]],
  ['Food', [
    [500, 'This Kashmiri dish combines turnips and meat in a slow-cooked preparation associated with Kashmiri and Mughal culinary traditions.\nA. Yakhni  B. Shabdeg  C. Qaliya  D. Rista', 'What is shabdeg? (B)'],
    [500, 'These kebabs, associated with the Kakori area near Lucknow, are famous for their delicate, exceptionally tender texture.\nA. Seekh kebabs  B. Kakori kebabs  C. Bihari kebabs  D. Reshmi kebabs', 'What are Kakori kebabs? (B)'],
    [100, 'The Persian word zardozi literally means this type of embroidery.\nA. Silk embroidery  B. Gold embroidery  C. Mirror embroidery  D. Floral embroidery', 'What is gold embroidery? (B)'],
    [500, 'This Kashmiri textile technique uses metallic gold- or silver-colored thread on garments such as pherans.\nA. Tilla work  B. Phulkari  C. Chikankari  D. Aari work', 'What is tilla work? (A)'],
  ]],
  ['Indian Muslim Craft Traditions', [
    [300, 'This Agra craft carefully inlays colored stones into marble, famously seen in Mughal decorative traditions.\nA. Khatamkari  B. Parchinkari  C. Bidriware  D. Minakari', 'What is parchinkari? (B)'],
    [500, 'This Kashmiri papier-mâché craft involves molded paper forms that are hand-painted with floral, geometric, and figurative designs.\nA. Kari-kalamdani  B. Chikankari  C. Parchinkari  D. Tilla-kari', 'What is kari-kalamdani? (A)'],
    [300, 'This traditional Kashmiri floor covering is made from hand-felted wool.\nA. Gabba  B. Namda  C. Dhurrie  D. Dari', 'What is namda? (B)'],
    [100, 'This North Indian city is internationally associated with hand-knotted carpets and is often called India’s carpet capital.\nA. Bhadohi  B. Jaipur  C. Lucknow  D. Amritsar', 'What is Bhadohi? (A)'],
    [100, 'This Uttar Pradesh city is famous for engraved and decorative brassware.\nA. Moradabad  B. Bareilly  C. Kanpur  D. Aligarh', 'What is Moradabad? (A)'],
    [300, 'This Sindhi textile tradition is a patchwork quilt made by piecing and stitching fabric rather than using only surface embroidery.\nA. Rilli  B. Suzani  C. Gota  D. Tilla', 'What is a rilli? (A)'],
  ]],
  ['Pakistani Food', [
    [100, 'This Balochi dish consists of whole lamb, goat, or chicken roasted over an open fire with relatively simple seasoning.\nA. Sajji  B. Nihari  C. Haleem  D. Karahi', 'What is sajji? (A)'],
    [300, 'This simply seasoned salted-meat dish is particularly associated with Pashtun cuisine and Khyber Pakhtunkhwa.\nA. Namkeen gosht  B. Qorma  C. Bhuna gosht  D. Achari gosht', 'What is namkeen gosht? (A)'],
    [300, 'This city is famous for a dense, chewy sweet made with flour, sugar, ghee, and nuts.\nA. Lahore  B. Multan  C. Peshawar  D. Quetta', 'What is Multan? (B)'],
  ]],
  ['Famous Muslims in the United States', [
    [300, 'This Muslim American fencer became the first U.S. Olympian to compete while wearing a hijab.\nA. Ibtihaj Muhammad  B. Dalilah Muhammad  C. Noor Tagouri  D. Hoda Kotb', 'Who is Ibtihaj Muhammad? (A)'],
    [500, 'This Bangladeshi-American structural engineer developed the bundled-tube system used in the design of Chicago’s Sears Tower, now called the Willis Tower.\nA. Fazlur Rahman Khan  B. Ismail al-Jazari  C. Nader Engheta  D. Anousheh Ansari', 'Who was Fazlur Rahman Khan? (A)'],
    [100, 'This Indian-American educator began tutoring his cousin remotely and eventually founded Khan Academy.\nA. Salman Khan  B. Shahid Khan  C. Amir Khan  D. Imran Khan', 'Who is Salman Khan? (A)'],
    [300, 'This actor won Academy Awards for his performances in Moonlight and Green Book.\nA. Riz Ahmed  B. Mahershala Ali  C. Kumail Nanjiani  D. Dev Patel', 'Who is Mahershala Ali? (B)'],
    [300, 'This Pakistani-American businessman owns Flex-N-Gate and became the owner of the Jacksonville Jaguars.\nA. Shahid Khan  B. Hamdi Ulukaya  C. Fareed Zakaria  D. Naveen Selvadurai', 'Who is Shahid Khan? (A)'],
  ]],
];
const questions = categories.flatMap(([category, clues], column) => clues.map(([value, clue, answer], row) => ({
  id: `${column}-${row}`, category, value, clue, answer,
})));
module.exports = { categories: categories.map(([name]) => name), questions };
