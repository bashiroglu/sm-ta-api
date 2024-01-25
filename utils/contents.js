const oneLessonRemainedText = `Salam, deyerli telebemiz!\n\nBalansinizda cemi 1 ders qalib.\n\nDerslere davam etmek ucun balansinizi artirin, zehmet olmasa. Eks halda sisteme giris ve ev tapsiriqlarini gormek mumkun olmayacaq.\n\nDavam etmeyeceksinizse, sistemin borc hesablamamasi ucun, xahis edirik, bizi melumatlandirin.`;

const studentPaymentText = (amount) =>
  `Deyerli TIME ACADEMY telebesi,\n\nSizden ${amount} AZN mebleginde odenis qebul olundu.\n\nTesekkur edirik!\n\nOyrenmeyin esl vaxtidir.\nwww.timeacademy.az`;

const salaryText = (amount) =>
  `Deyerli TIME ACADEMY emekdasi,\n\nSize ${amount} AZN odenis heyata kecirilmisdir.\n\nTesekkur edirik!`;

const homeworkText = `Deyerli TIME ACADEMY telebesi,\n\Calismalariniz sizi gozleyir`;

module.exports = {
  oneLessonRemainedText,
  homeworkText,
  studentPaymentText,
  salaryText,
};
