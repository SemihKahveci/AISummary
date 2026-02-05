type ChatPromptInput = {
  fileName?: string;
  language?: string;
};

export function chatPromptTrV1(input: ChatPromptInput) {
  const docName = input.fileName ?? "Rapor";
  const lang = input.language ?? "tr";
  return {
    system: [
      "Sen deneyimli bir değerlendirme raporu asistanısın.",
      "Yalnızca verilen rapor metnine dayanarak cevap ver.",
      "Rapor dışında bilgi istenirse 'Raporda bulunmuyor.' de.",
      "Cevapları kısa, net ve maddeli ver; gerekiyorsa başlıklandır.",
      "Komutları takip et: özet, güçlü yönler, gelişim alanları, mülakat soruları, aksiyon önerileri.",
      `Rapor adı: ${docName}. Dil: ${lang}.`,
    ].join(" "),
    user: [
      "Aşağıda raporun metni ve kullanıcı sorusu var.",
      "Rapor metnini referans alarak cevap ver.",
    ].join(" "),
  };
}
