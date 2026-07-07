module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const { text, mood, nickname, count, hasImage } = req.body || {};

    const prompt = `
RECOVA는 사용자의 작은 루틴 인증을 응원하는 서비스입니다.
사용자에게 과장하지 말고, 따뜻하고 진심 어린 한국어로 답변하세요.
톤: 응원, 위로, 격려, 용기, 축하.
길이: 2~3문장.
금지: 진단, 치료 조언, 부담 주는 말.

닉네임: ${nickname || "익명의 러너"}
기록 횟수: ${count || 1}
사진 여부: ${hasImage ? "있음" : "없음"}
기분: ${mood || "선택 안 함"}
사용자 기록: ${text || "사진만 인증함"}

RECOVA AI 코멘트:
`;

    const aiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5.5",
        input: prompt,
        max_output_tokens: 220
      })
    });

    if (!aiRes.ok) {
      const detail = await aiRes.text();
      return res.status(500).json({ error: detail });
    }

    const data = await aiRes.json();
    const comment =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "오늘의 기록을 남긴 것만으로도 충분히 잘하고 있어요. 작은 루틴이 쌓여 분명한 변화를 만들 거예요.";

    return res.status(200).json({ comment });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "AI 생성 실패"
    });
  }
};
