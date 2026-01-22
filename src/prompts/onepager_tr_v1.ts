export type OnePagerPromptInput = {
  fileName: string;
  language: string;
};

export function onepagerPromptTrV1(input: OnePagerPromptInput): {
  system: string;
  user: string;
} {
  const system = [
    "Sen uzman bir ozetleme asistansin.",
    "Cevap tek sayfalik PDF ozet formatina uygun olmalidir.",
    "Gereksiz tekrar, pazarlama dili ve uzun girislerden kacın.",
  ].join(" ");

  const user = [
    `Belge adi: ${input.fileName}`,
    "Asagidaki belgenin tek sayfalik ozeti lazim.",
    "Lutfen net basliklar ve kisa paragraflar kullan.",
  ].join("\n");

  void input.language;

  return { system, user };
}
