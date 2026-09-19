<div className="hero-krl-visual">
  {/* Decorative orbit */}
  <div className="hero-krl-orbit hero-krl-orbit-1" />
  <div className="hero-krl-orbit hero-krl-orbit-2" />

  {/* Small decorative elements */}
  <span className="hero-krl-dot hero-krl-dot-1" />
  <span className="hero-krl-dot hero-krl-dot-2" />
  <span className="hero-krl-dot hero-krl-dot-3" />

  <span className="hero-krl-label hero-krl-label-krl">
    KRL
  </span>

  <span className="hero-krl-label hero-krl-label-night">
    NIGHT
  </span>

  <span className="hero-krl-star hero-krl-star-1">
    ✦
  </span>

  <span className="hero-krl-star hero-krl-star-2">
    ·
  </span>

  {/* Main KRL illustration */}
  <div className="hero-krl-train">

    <svg
      viewBox="0 0 760 360"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustration of a KRL commuter train"
    >
      {/* Motion lines */}
      <path
        d="M80 245 C180 210 240 205 320 215"
        fill="none"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <path
        d="M120 275 C205 248 250 246 310 252"
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Train shadow */}
      <ellipse
        cx="390"
        cy="304"
        rx="285"
        ry="25"
        fill="rgba(20,20,30,0.18)"
      />

      {/* Train body */}
      <path
        d="
          M150 125
          C150 96 172 76 203 76
          H600
          C641 76 668 101 681 135
          L713 229
          C720 250 704 270 681 270
          H150
          C128 270 111 252 115 229
          Z
        "
        fill="#ffffff"
      />

      {/* Pink upper accent */}
      <path
        d="
          M150 125
          C150 96 172 76 203 76
          H600
          C641 76 668 101 681 135
          L687 154
          H143
          Z
        "
        fill="#ed4f97"
      />

      {/* Front windshield */}
      <path
        d="
          M555 104
          H600
          C625 104 643 119 651 141
          L661 170
          H553
          Z
        "
        fill="#24242d"
      />

      {/* Windshield reflection */}
      <path
        d="M570 110 H596 L620 164 H595 Z"
        fill="rgba(255,255,255,0.22)"
      />

      {/* Main windows */}
      <rect
        x="190"
        y="108"
        width="105"
        height="66"
        rx="8"
        fill="#252631"
      />

      <rect
        x="308"
        y="108"
        width="105"
        height="66"
        rx="8"
        fill="#252631"
      />

      <rect
        x="426"
        y="108"
        width="105"
        height="66"
        rx="8"
        fill="#252631"
      />

      {/* Window reflections */}
      <path
        d="M202 114 H226 L250 168 H225 Z"
        fill="rgba(255,255,255,0.18)"
      />

      <path
        d="M320 114 H344 L368 168 H343 Z"
        fill="rgba(255,255,255,0.18)"
      />

      <path
        d="M438 114 H462 L486 168 H461 Z"
        fill="rgba(255,255,255,0.18)"
      />

      {/* Doors */}
      <rect
        x="205"
        y="181"
        width="66"
        height="68"
        rx="5"
        fill="#f1f1f3"
      />

      <rect
        x="321"
        y="181"
        width="66"
        height="68"
        rx="5"
        fill="#f1f1f3"
      />

      <rect
        x="437"
        y="181"
        width="66"
        height="68"
        rx="5"
        fill="#f1f1f3"
      />

      {/* Door lines */}
      <path
        d="M238 183 V247"
        stroke="#d6d6da"
        strokeWidth="2"
      />

      <path
        d="M354 183 V247"
        stroke="#d6d6da"
        strokeWidth="2"
      />

      <path
        d="M470 183 V247"
        stroke="#d6d6da"
        strokeWidth="2"
      />

      {/* Lower train body */}
      <path
        d="
          M120 249
          H708
          C701 263 693 270 678 270
          H150
          C135 270 125 262 120 249
          Z
        "
        fill="#e9e9ed"
      />

      {/* Pink lower line */}
      <rect
        x="132"
        y="238"
        width="558"
        height="8"
        rx="4"
        fill="#ed4f97"
      />

      {/* Headlight */}
      <circle
        cx="676"
        cy="199"
        r="10"
        fill="#ffffff"
      />

      <circle
        cx="676"
        cy="199"
        r="5"
        fill="#ed4f97"
      />

      {/* Wheels */}
      <circle
        cx="222"
        cy="275"
        r="20"
        fill="#292932"
      />

      <circle
        cx="222"
        cy="275"
        r="8"
        fill="#c9c9cf"
      />

      <circle
        cx="596"
        cy="275"
        r="20"
        fill="#292932"
      />

      <circle
        cx="596"
        cy="275"
        r="8"
        fill="#c9c9cf"
      />

      {/* Track */}
      <path
        d="M95 300 H690"
        stroke="rgba(30,30,40,0.20)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <path
        d="M115 313 H675"
        stroke="rgba(30,30,40,0.12)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>

  </div>

  {/* Bottom decorative pill */}
  <div className="hero-krl-caption">
    <span className="hero-krl-caption-dot" />
    Safe journeys, even after dark
  </div>
</div>