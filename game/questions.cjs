// Server-only answer bank. Review with your event host before game day.
const categories = [
  ['Famous Muslims in the United States', [
    [100, 'This Indian-American educator began tutoring his cousin remotely and eventually founded Khan Academy.', 'Who is Salman Khan?'],
    [200, 'This Pakistani-American businessman owns Flex-N-Gate and became the owner of the Jacksonville Jaguars.', 'Who is Shahid Khan?'],
    [300, 'This Muslim American fencer became the first U.S. Olympian to compete while wearing a hijab.', 'Who is Ibtihaj Muhammad?'],
    [400, 'This actor won Academy Awards for his performances in Moonlight and Green Book.', 'Who is Mahershala Ali?'],
    [500, 'This Bangladeshi-American structural engineer developed the bundled-tube system used in the design of Chicago\'s Sears Tower, now called the Willis Tower.', 'Who was Fazlur Rahman Khan?'],
  ]],
  ['Wedding Traditions', [
    [100, 'This required marriage gift is given by the groom to the bride.', 'What is mahr?'],
    [200, 'In many interpretations of Islamic marriage law, this person serves as the bride\'s guardian or representative during the marriage process.', 'Who is the wali?'],
    [300, 'During this North Indian groom\'s ceremony, a sehra—often made of flowers, beads, or pearls—is tied to his turban before the wedding procession.', 'What is sehrabandi?'],
    [400, 'This prayer may be performed before finalizing a marriage proposal when a family seeks divine guidance about the decision.', 'What is Salat al-Istikhara?'],
    [500, 'In some North Indian Muslim families, the recitation of this short Quranic chapter may accompany the formal blessing or acceptance of a marriage proposal before the Nikah.', 'What is Surah Al-Fatiha?'],
  ]],
  ['Food', [
    [100, 'This modern Lucknow street-food creation is served in a crisp edible basket filled with potatoes, yogurt, chutneys, sev, and pomegranate.', 'What is tokri chaat, also called basket chaat?'],
    [200, 'This preparation gets its name from using onions at two different stages of cooking, creating both sweetness and texture.', 'What is do-pyaza?'],
    [300, 'A slow-cooked preparation traditionally made with turnips and meat, especially associated with Kashmiri and Mughal culinary traditions.', 'What is shabdeg?'],
    [400, 'This Bihari mutton preparation is traditionally cooked in a sealed clay handi with mustard oil, whole garlic, onions, and spices.', 'What is ahuna meat, also called Champaran mutton?'],
    [500, 'This rare Awadhi royal pulao is named for the pearl-like dumplings or decorative “pearls” used in some traditional versions.', 'What is moti pulao?'],
  ]],
  ['Culture', [
    [100, 'This Uttar Pradesh city is famous for engraved and decorative brassware.', 'What is Moradabad?'],
    [200, 'This is the literal meaning of the Persian word zardozi.', 'What is gold embroidery?'],
    [300, 'An early literary form of Urdu poetry that blended Persian and Arabic vocabulary with North Indian linguistic traditions.', 'What is Rekhta?'],
    [400, 'In Sufi culture, this refers to a devotional gathering involving spiritually inspired listening, poetry, and sometimes music.', 'What is sama?'],
    [500, 'This Agra craft carefully inlays colored stones into marble, famously seen in Mughal decorative traditions.', 'What is parchinkari?'],
  ]],
  ['Bride and Groom (Test)', [
    [100, 'What is the bride\'s name?', 'Who is Noor?'],
    [200, 'When is Basir & Noor\'s Walima, Insha Allah?', 'What is the evening of October 18?'],
    [300, 'In which state is Basir & Noor\'s Nikah?', 'What is New Hampshire?'],
    [400, 'What is the couple\'s only post-wedding celebration for Basir & Noor?', 'What is Welcome Bride or Qawwali Night?'],
    [500, 'What is the bridesmaids\' primary color for the Walima?', 'What is purple?'],
  ]],
];

const questions = categories.flatMap(([category, clues], column) => clues.map(([value, clue, answer], row) => ({
  id: `${column}-${row}`, category, value, clue, answer,
})));

module.exports = { categories: categories.map(([name]) => name), questions };
