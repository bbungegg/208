/* ==========================================================================
   MY ERA — 내용 파일
   이 파일만 고치면 됩니다. (글자는 "따옴표" 안에, 항목 사이엔 쉼표)

   흐름: 오프닝 탑승권 → 절취선 뜯기 → 지도 → 점 누르면 창
   점 하나 = 창 하나 (pages 에 하나씩)
   ========================================================================== */
window.ERA = {

  /* ------------------------------------------------------------------
   * 사이트
   * ------------------------------------------------------------------ */
  site: {
    title: "MY ERA",           // 브라우저 탭 제목
    sub: "Mong Kok — Sham Shui Po, Kowloon",
    color: "#a7bfe3",           // 기본 포인트 색 (티켓 파란 띠)
    tiles: "osm",               // 지도: "osm" 또는 "esri" (안 뜨면 바꿔 보기)
    sound: true,                // 티켓 찢는 소리

    // 탑승권 · 창 위쪽 줄의 출발지(FROM) = 나
    passenger: { code: "ERA", name: "에라", en: "@my_era", big: "20↑", small: "INFP" }
  },

  /* 오프닝 — 들어오면 먼저 뜨는 탑승권. 바코드 부분을 당겨 뜯으면 지도로 들어가요.
     show: "session"(브라우저 닫기 전까지 한 번) / "always"(들어올 때마다) / "off"(안 띄움) */
  opening: {
    show: "session",
    ticket: {
      to: { code: "HKG", name: "홍콩", en: "Hong Kong", big: "02:08 AM", small: "Kai Tak" },
      flight: "208 with me", badge: "Direct",              // 가운데 작은 글씨 / 검은 알약
      strip: [["Boarding", "02:08"], ["Terminal", "1"], ["Gate", "C21"], ["Flight", "ERA208"]],
      info: [["Passenger", "에라"], ["Seat", "15C"], ["Class", "Economy"]]
    }
  },

  /* 체크인 카드 (옛 홍콩 호텔 짐 라벨).
     card: "label" 인 점(기본은 페어)을 누르면 이 카드가 먼저 뜨고,
     카드를 누르면 빨간 도장이 쾅 → 그대로 창이 펼쳐져요.  안 쓰려면 label: null */
  label: {
    src: "assets/label.svg",
    stamp: "CHECKED IN",       // 도장 위쪽 글씨 (비우면 도장 없음)
    date: "1997.06.30"         // 도장 날짜 (비우면 오늘 날짜)
  },

  /* 왼쪽 아래 음악 (유튜브 주소의 v= 뒷부분). 비우면 [] */
  playlist: [
    { id: "PbbUeLkZt74", title: "Cocteau Twins - Cherry-coloured Funk" },
    { id: "W6NcLBQZrU0", title: "回春丹 - 初恋" },
    { id: "AIGIYAwv2kw", title: "The Flying Pickets - Only You" }
  ],

  /* ------------------------------------------------------------------
   * 지도 위 점 = 창
   *   type: "profile"(성향표) / "pairs"(페어 소개) / "chars"(캐릭터 목록) / "note"(글)
   *   label: 점 이름 (지도 · 메뉴 · 창 제목)
   *   lat, lng: 좌표. 지우면 몽콕~삼수이포 안 아무 데나 알아서 찍힙니다.
   *   ticket.to: 창 위쪽 FROM → TO 줄의 도착지 (출발지는 위의 passenger)
   *   없는 칸은 지우면 창에서도 안 보입니다.
   * ------------------------------------------------------------------ */
  pages: [

    /* ---------------- 성향표 ---------------- */
    {
      id: "profile",
      type: "profile",
      label: "성향표",
      lat: 22.3196, lng: 114.1712,
      color: "#a7bfe3",
      ticket: { to: { code: "MKK", name: "몽콕", en: "Mong Kok", big: "09:00 PM", small: "야시장 입구" } },

      photo: "",                         // 이미지 주소. 예) "assets/img/me.jpg" (비우면 실루엣)
      name: "에라",
      en: "@my_era",
      quote: "편하게 말 걸어 주세요!",
      keywords: ["잡식", "소비러", "새벽형"],
      song: { id: "PbbUeLkZt74", title: "Cocteau Twins - Cherry-coloured Funk" },

      basics: [
        ["닉네임", "에라"], ["나이", "성인"], ["MBTI", "INFP"],
        ["주 장르", "작품명"], ["활동", "글 · 소비"], ["연락", "@my_era"]
      ],
      // 성향: [왼쪽, 오른쪽, 0~100]  0이면 완전 왼쪽, 100이면 완전 오른쪽
      traits: [
        ["고정", "잡식", 70],
        ["소비러", "생산러", 35],
        ["조용", "수다", 62],
        ["낮", "밤", 88],
        ["무계획", "계획", 25]
      ],
      // 호불호: [항목, "O" / "△" / "X"]
      checks: [
        ["리버스", "O"], ["드림", "△"], ["AU", "O"],
        ["캐붕", "X"], ["수위", "△"], ["멘션 · 디엠", "O"]
      ],
      // alignment: "혼돈 선",            // (선택) 질서/중립/혼돈 × 선/중립/악 표
      // stats: [["체력", 3], ["끈기", 5]], // (선택) 0~5 칸
      likes: ["쌍방 삽질", "소꿉친구", "재회물", "새벽 감성"],
      dislikes: ["사망 소재", "실존 인물 엮기"],
      about: "몽콕 야시장 같은 계정. 아무 말이나 다 받아요.\n지뢰만 피해 주시면 언제든 환영!\n\n<b>HTML 태그</b>도 쓸 수 있고, <a href=\"#pairs/1\">이렇게</a> 다른 창으로 링크도 돼요.",
      notes: [
        ["소통", "멘션, 디엠 다 편하게. 답이 늦어도 꼭 해요."],
        ["언팔 · 블언블", "자유롭게!"]
      ]
    },

    /* ---------------- 페어 소개 ---------------- */
    {
      id: "pairs",
      type: "pairs",
      label: "페어",
      card: "label",                     // 누르면 체크인 카드 → 도장 → 창 (위의 label)
      lat: 22.3236, lng: 114.1628,
      color: "#c9d3dc",
      ticket: { to: { code: "PRE", name: "프린스 에드워드", en: "Prince Edward", big: "11:40 PM", small: "꽃시장 골목" } },
      intro: "요즘 붙들고 있는 페어. 누르면 자세히 볼 수 있어요.",

      // 페어 하나 = { ... }. a / b 가 두 사람 (티켓의 FROM → TO 처럼 보여요)
      pairs: [
        {
          title: "린준",
          work: "작품명",
          badge: "고정",
          color: "#a7bfe3",
          a: { code: "SRN", name: "서린", en: "Seo Rin", photo: "" },
          b: { code: "HJN", name: "한준", en: "Han Jun", photo: "" },
          flight: "18 years together",
          tagline: "새벽 두 시, 불 켜진 편의점 하나.",
          keywords: ["소꿉친구", "쌍방 삽질", "새벽"],
          song: { id: "AIGIYAwv2kw", title: "The Flying Pickets - Only You" },

          // 서로에게: who = "a" 또는 "b", call = 부르는 호칭, text = 상대를 어떻게 보는지
          views: [
            { who: "a", call: "한준아", text: "제일 편한 사람. 근데 요즘 좀 이상하게 안 편하다." },
            { who: "b", call: "야, 서린", text: "매일 늦게 오는 손님. 오늘은 왜 안 오지." }
          ],
          // 관계 수치: [이름, 0~100]
          meters: [["린 → 준 호감", 72], ["준 → 린 호감", 94], ["주변 답답함", 100]],
          timeline: [
            ["2007", "같은 유치원, 같은 반"],
            ["2016", "서린 이사 · 연락 끊김"],
            ["2024", "새벽 편의점에서 재회"]
          ],
          quotes: [
            ["a", "삼각김밥 하나만 외상 되냐?"],
            ["b", "…저번 거부터 갚아."]
          ],
          about: "어릴 땐 매일 붙어 다녔고, 지금은 매일 새벽에 마주친다. 이 둘이 좋은 이유는…"
        },
        {
          title: "준이안",
          work: "작품명",
          badge: "리버스 OK",
          color: "#d8c3cf",
          a: { code: "HJN", name: "한준", en: "Han Jun", photo: "" },
          b: { code: "RYA", name: "류이안", en: "Ryu Ian", photo: "" },
          flight: "Ferry 8 min",
          tagline: "바다 하나 건너, 정반대.",
          keywords: ["악연", "라이벌"],
          views: [
            { who: "a", call: "류이안 씨", text: "귀찮다. 진짜로." },
            { who: "b", call: "준아~", text: "놀리면 반응이 제일 재밌는 사람." }
          ]
        }
      ]
    },

    /* ---------------- 버닝 캐릭터 목록 ---------------- */
    {
      id: "burning",
      type: "chars",
      label: "버닝 중",
      en: "NOW BURNING",
      lat: 22.3283, lng: 114.1673,
      color: "#d8c3cf",
      ticket: { to: { code: "SSP", name: "삼수이포", en: "Sham Shui Po", big: "02:10 AM", small: "골목 시장" } },
      intro: "지금 제일 뜨거운 애들. 불꽃이 많을수록 위험.",

      // 캐릭터 하나 = { ... }. heat: 불꽃 0~5
      // quote / about / basics / traits 같은 걸 더 적으면 카드를 눌렀을 때 자세히 보기가 열려요.
      chars: [
        {
          name: "서린", en: "Seo Rin", work: "작품명", photo: "",
          heat: 5, since: "2024.03",
          note: "말투 하나에 무너짐. 매일 새로 반함.",
          keywords: ["야행성", "직진"],
          quote: "늦었다고 생각할 때가 제일 늦은 거야. 그러니까 지금 가.",
          about: "처음엔 그냥 시끄러운 애인 줄 알았는데…",
          song: { id: "W6NcLBQZrU0", title: "回春丹 - 初恋" }
        },
        {
          name: "한준", en: "Han Jun", work: "작품명", photo: "",
          heat: 4, since: "2024.05",
          note: "무뚝뚝한 척하는 거 다 보임.",
          keywords: ["츤데레"],
          about: "말수는 적지만 단골 얼굴은 다 외우고 있는 사람."
        },
        {
          name: "류이안", en: "Ryu Ian", work: "작품명", photo: "",
          heat: 3, since: "2025.01",
          note: "보면 볼수록 수상함."
        }
      ]
    }

    /* 점 더 만들기 예시 (앞 칸 끝에 쉼표 찍고 붙여 넣기). 좌표를 안 적으면 알아서 자리 잡아요.
    ,{
      id: "notice",
      type: "note",
      label: "공지",
      ticket: { to: { code: "YMT", name: "야우마테이", en: "Yau Ma Tei" } },
      text: "여기에 자유롭게 글을 쓰면 돼요.\n줄바꿈도, <b>HTML</b>도 됩니다.",
      notes: [["연락", "@my_era"]]
    }
    */
  ]
};
