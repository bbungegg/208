/* ==========================================================================
   MY ERA — 내용 파일
   이 파일만 고치면 됩니다. (글자는 "따옴표" 안에, 항목 사이엔 쉼표)

   본서사: 1997년 6월 30일, 홍콩 카이탁 → 시드니. 임완청 · 이공팔
   흐름: 오프닝 탑승권 → 절취선 뜯기 → 지도 → 점 누르면 창
   점 하나 = 창 하나 (pages 에 하나씩)
   ========================================================================== */
window.ERA = {

  /* ------------------------------------------------------------------
   * 사이트
   * ------------------------------------------------------------------ */
  site: {
    title: "208 with me",      // 브라우저 탭 제목
    sub: "Hong Kong → Sydney · 30 JUN 1997",
    color: "#a7bfe3",           // 기본 포인트 색 (티켓 파란 띠)
    tiles: "osm",               // 지도: "osm" 또는 "esri" (안 뜨면 바꿔 보기)
    sound: true,                // 티켓 찢는 소리

    // 창 위쪽 줄의 출발지(FROM) = 나 (오프닝 탑승권은 아래 opening.ticket.from)
    passenger: { code: "ERA", name: "에라", en: "@my_era", big: "20↑", small: "INFP" }
  },

  /* 오프닝 — 들어오면 먼저 뜨는 탑승권 (본서사: 1997.06.30 홍콩 → 시드니).
     바코드 부분을 누르거나 당겨 뜯으면 지도로 들어가요.
     show: "session"(브라우저 닫기 전까지 한 번) / "always"(들어올 때마다) / "off"(안 띄움) */
  opening: {
    show: "session",
    ticket: {
      from: { code: "HKG", name: "홍콩", en: "Hong Kong", big: "30 JUN 97", small: "Kai Tak" },
      to: { code: "SYD", name: "시드니", en: "Sydney", big: "01 JUL 97", small: "Kingsford Smith" },
      flight: "208 with me", badge: "One way",             // 가운데 작은 글씨 / 검은 알약
      strip: [["Date", "30.06.97"], ["Boarding", "02:08"], ["Gate", "8"], ["Flight", "208"]],
      info: [["Passenger", "임완청 · 이공팔"], ["Seat", "20A · 20B"], ["Class", "Economy"]]
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
      about: "몽콕 야시장 같은 계정. 아무 말이나 다 받아요.\n지뢰만 피해 주시면 언제든 환영!",
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
      intro: "본서사 — 1997년 6월 30일, 홍콩에서 시드니로.",

      // 페어 하나 = { ... }. a / b 가 두 사람 (티켓의 FROM → TO 처럼 보여요)
      pairs: [
        {
          title: "208",
          work: "본서사",
          badge: "One way",
          color: "#a7bfe3",
          a: { code: "", name: "임완청", en: "", photo: "" },
          b: { code: "", name: "이공팔", en: "", photo: "" },
          flight: "HKG → SYD",
          tagline: "1997년 6월 30일, 홍콩을 떠나 시드니로.",
          keywords: ["1997", "홍콩", "시드니"],
          timeline: [
            ["1997.06.30", "홍콩 카이탁 공항 → 시드니"]
          ]
          // 더 적을 수 있는 칸: views(서로에게) · meters(관계 수치) · quotes(대사) · about(소개)
          //   views: [{ who: "a", call: "부르는 호칭", text: "상대를 어떻게 보는지" }, { who: "b", ... }],
          //   meters: [["완청 → 공팔", 80]],
          //   quotes: [["a", "대사"], ["b", "대사"]],
          //   about: "소개 글"
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
          name: "임완청", en: "", work: "본서사 · 208", photo: "",
          heat: 5, since: "1997.06.30",
          note: "홍콩 → 시드니"
        },
        {
          name: "이공팔", en: "", work: "본서사 · 208", photo: "",
          heat: 5, since: "1997.06.30",
          note: "홍콩 → 시드니"
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
