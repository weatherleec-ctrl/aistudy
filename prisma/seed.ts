import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const adminPw = await bcrypt.hash("admin1234!", 10)
  const memberPw = await bcrypt.hash("member1234!", 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@samchully.co.kr" },
    update: {},
    create: {
      email: "admin@samchully.co.kr",
      name: "관리자",
      passwordHash: adminPw,
      role: "ADMIN",
      bio: "AI 학습조직 운영진",
      expertise: '["LLM","RAG","Agent"]',
    },
  })

  const members = await Promise.all([
    prisma.user.upsert({
      where: { email: "chin@samchully.co.kr" },
      update: {},
      create: { email: "chin@samchully.co.kr", name: "진담당", passwordHash: memberPw, expertise: '["Vision","Multimodal"]' },
    }),
    prisma.user.upsert({
      where: { email: "lee@samchully.co.kr" },
      update: {},
      create: { email: "lee@samchully.co.kr", name: "이서연", passwordHash: memberPw, expertise: '["NLP","LLM"]' },
    }),
    prisma.user.upsert({
      where: { email: "park@samchully.co.kr" },
      update: {},
      create: { email: "park@samchully.co.kr", name: "박지호", passwordHash: memberPw, expertise: '["Data","RAG"]' },
    }),
  ])

  await prisma.announcement.createMany({
    data: [
      {
        title: "AI 학습조직 포털 오픈 안내",
        content: "안녕하세요! AI 학습조직 포털이 오픈되었습니다. 다양한 자료와 동향을 공유해 주세요.",
        isPinned: true,
        isImportant: true,
        authorId: admin.id,
      },
      {
        title: "6월 스터디 일정 공지",
        content: "6월 첫째 주 스터디는 **LLM Fine-tuning** 주제로 진행됩니다. 많은 참여 부탁드립니다.",
        isPinned: false,
        isImportant: false,
        authorId: admin.id,
      },
    ],
  })

  await prisma.trend.createMany({
    data: [
      {
        title: "GPT-4o 멀티모달 능력 심층 분석",
        summary: "GPT-4o의 텍스트·이미지·음성 통합 처리 방식과 실무 적용 사례를 정리합니다.",
        content: "## 개요\nGPT-4o는 텍스트, 이미지, 음성을 하나의 모델에서 처리합니다.\n\n## 핵심 특징\n- 실시간 음성 대화\n- 이미지 이해 및 생성\n- 코드 분석",
        sourceUrl: "https://openai.com/gpt-4o",
        category: "LLM",
        tags: '["GPT","OpenAI","Multimodal"]',
        authorId: admin.id,
      },
      {
        title: "RAG 파이프라인 최적화 전략",
        summary: "Retrieval-Augmented Generation의 성능을 높이는 chunking, embedding, reranking 기법을 소개합니다.",
        content: "## RAG란?\n검색 기반 생성 방식으로 LLM의 할루시네이션을 줄입니다.\n\n## 최적화 포인트\n1. Chunk 크기 설정\n2. Embedding 모델 선택\n3. Reranker 적용",
        category: "RESEARCH",
        tags: '["RAG","VectorDB","Embedding"]',
        authorId: members[2].id,
      },
    ],
  })

  await prisma.tool.createMany({
    data: [
      { name: "ChatGPT", description: "OpenAI의 대화형 AI 어시스턴트", url: "https://chat.openai.com", category: "CHATBOT", tags: '["OpenAI","LLM"]', isPaid: false, isFeatured: true, addedById: admin.id },
      { name: "Claude", description: "Anthropic의 안전한 AI 어시스턴트", url: "https://claude.ai", category: "CHATBOT", tags: '["Anthropic","LLM"]', isPaid: false, isFeatured: true, addedById: admin.id },
      { name: "GitHub Copilot", description: "AI 기반 코드 자동 완성 도구", url: "https://copilot.github.com", category: "CODING", tags: '["GitHub","Coding"]', isPaid: true, addedById: admin.id },
      { name: "Midjourney", description: "텍스트로 이미지를 생성하는 AI 도구", url: "https://midjourney.com", category: "IMAGE", tags: '["Image","Generative"]', isPaid: true, addedById: admin.id },
    ],
  })

  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

  await prisma.event.createMany({
    data: [
      {
        title: "LLM Fine-tuning 스터디",
        description: "LoRA와 QLoRA를 이용한 LLM 파인튜닝 실습",
        eventType: "STUDY",
        startAt: new Date(nextWeek.getTime() + 9 * 3600 * 1000),
        endAt: new Date(nextWeek.getTime() + 11 * 3600 * 1000),
        isOnline: true,
        meetingUrl: "https://meet.google.com/example",
        creatorId: admin.id,
      },
      {
        title: "AI 트렌드 세미나",
        description: "2026년 상반기 AI 주요 동향 발표",
        eventType: "SEMINAR",
        startAt: new Date(twoWeeks.getTime() + 14 * 3600 * 1000),
        endAt: new Date(twoWeeks.getTime() + 16 * 3600 * 1000),
        isOnline: false,
        location: "본사 3층 세미나실",
        creatorId: admin.id,
      },
    ],
  })

  console.log("✅ 시드 데이터 완료")
  console.log("관리자 계정: admin@samchully.co.kr / admin1234!")
  console.log("일반 계정:   chin@samchully.co.kr / member1234!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
