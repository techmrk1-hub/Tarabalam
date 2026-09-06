    let currentLang = 'en';
    let slideIndex = 0;
    const totalSlides = 6;

    // Integrated Five-Language Localized Matrix Schema Registry
    const languagesDataset = {
        te: {
            appTitle: "\u0c24\u0c3e\u0c30\u0c3e\u0c2c\u0c32\u0c02 \u0c17\u0c23\u0c28 \u0c2a\u0c1f\u0c4d\u0c1f\u0c3f\u0c15 \u0c2e\u0c30\u0c3f\u0c2f\u0c41 \u0c38\u0c2e\u0c17\u0c4d\u0c30 \u0c38\u0c42\u0c1a\u0c3f\u0c15",
            milestoneTag: "\u2728 \u0c24\u0c3e\u0c30\u0c3e\u0c2c\u0c32\u0c02 \u0c05\u0c28\u0c47\u0c26\u0c3f \u0c35\u0c48\u0c26\u0c3f\u0c15 \u0c1c\u0c4d\u0c2f\u0c4b\u0c24\u0c3f\u0c37\u0c36\u0c3e\u0c38\u0c4d\u0c24\u0c4d\u0c30\u0c02\u0c32\u0c4b \u0c12\u0c15 \u0c2e\u0c41\u0c16\u0c4d\u0c2f\u0c2e\u0c48\u0c28 \u0c2d\u0c3e\u0c17\u0c2e\u0c41, \u0c07\u0c26\u0c3f \u0c12\u0c15 \u0c35\u0c4d\u0c2f\u0c15\u0c4d\u0c24\u0c3f \u0c2f\u0c4a\u0c15\u0c4d\u0c15 \u0c1c\u0c28\u0c4d\u0c2e \u0c28\u0c15\u0c4d\u0c37\u0c24\u0c4d\u0c30\u0c02 \u0c2e\u0c30\u0c3f\u0c2f\u0c41 \u0c2a\u0c4d\u0c30\u0c38\u0c4d\u0c24\u0c41\u0c24 \u0c30\u0c4b\u0c1c\u0c41 \u0c28\u0c15\u0c4d\u0c37\u0c24\u0c4d\u0c30\u0c02 \u0c2e\u0c27\u0c4d\u0c2f \u0c05\u0c28\u0c41\u0c15\u0c42\u0c32\u0c24\u0c28\u0c41 \u0c32\u0c46\u0c15\u0c4d\u0c15\u0c3f\u0c02\u0c1a\u0c3f \u0c28\u0c42\u0c24\u0c28 \u0c2a\u0c28\u0c41\u0c32\u0c15\u0c41 \u0c36\u0c41\u0c2d \u0c2e\u0c41\u0c39\u0c42\u0c30\u0c4d\u0c24\u0c3e\u0c28\u0c4d\u0c28\u0c3f \u0c28\u0c3f\u0c30\u0c4d\u0c23\u0c2f\u0c3f\u0c02\u0c1a\u0c21\u0c3e\u0c28\u0c3f\u0c15\u0c3f \u0c09\u0c2a\u0c2f\u0c4b\u0c17\u0c2a\u0c21\u0c41\u0c24\u0c41\u0c02\u0c26\u0c3f \u2728",
            engineTitle: "\u0c17\u0c23\u0c28 \u0c2a\u0c4d\u0c30\u0c15\u0c4d\u0c30\u0c3f\u0c2f (Tarabalam Engine)",
            matrixTitle: "\u0c24\u0c3e\u0c30\u0c3e\u0c2c\u0c32\u0c02 \u0c38\u0c2e\u0c17\u0c4d\u0c30 \u0c2a\u0c1f\u0c4d\u0c1f\u0c3f\u0c15",
            sliderTitle: "\u0c35\u0c48\u0c26\u0c3f\u0c15 \u0c1c\u0c4d\u0c2f\u0c4b\u0c24\u0c3f\u0c37\u0c4d\u0c2f \u0c05\u0c02\u0c24\u0c30\u0c4d\u0c26\u0c43\u0c37\u0c4d\u0c1f\u0c41\u0c32\u0c41 & \u0c17\u0c48\u0c21\u0c4d\u200c\u0c32\u0c41",
            labelBirth: "\u0c2e\u0c40 \u0c1c\u0c28\u0c4d\u0c2e \u0c28\u0c15\u0c4d\u0c37\u0c24\u0c4d\u0c30\u0c02 (Janma Nakshatram):",
            labelTarget: "\u0c26\u0c3f\u0c28 / \u0c2e\u0c41\u0c39\u0c42\u0c30\u0c4d\u0c24 \u0c28\u0c15\u0c4d\u0c37\u0c24\u0c4d\u0c30\u0c02 (Target Nakshatram):",
            thCross: "\u0c1c\u0c28\u0c4d\u0c2e \u0c28\u0c15\u0c4d\u0c37\u0c24\u0c4d\u0c30\u0c02 \u2794<br>\ud83d\udc47 \u0c26\u0c3f\u0c28 \u0c28\u0c15\u0c4d\u0c37\u0c24\u0c4d\u0c30\u0c02",
            searchPlaceholder: "\u0c28\u0c15\u0c4d\u0c37\u0c24\u0c4d\u0c30\u0c02 \u0c2a\u0c47\u0c30\u0c41\u0c24\u0c4b \u0c35\u0c46\u0c24\u0c15\u0c02\u0c21\u0c3f (Type Nakshatra Name to Filter)...",
            outNum: "\u0c24\u0c3e\u0c30\u0c3e\u0c2c\u0c32\u0c02 \u0c38\u0c02\u0c16\u0c4d\u0c2f (Tarabalam Number):",
            outVerdict: "\u0c28\u0c3f\u0c30\u0c4d\u0c23\u0c2f\u0c02 / \u0c2b\u0c32\u0c3f\u0c24\u0c02 (Verdict):",
            outSummary: "\u0c38\u0c3e\u0c30\u0c3e\u0c02\u0c36\u0c02 (Summary):",
            outGuidance: "\u0c2a\u0c4d\u0c30\u0c2f\u0c4b\u0c17 \u0c38\u0c42\u0c1a\u0c28 (Guidance):",
            footerLabel: "\u0c2e\u0c30\u0c3f\u0c28\u0c4d\u0c28\u0c3f \u0c35\u0c3f\u0c35\u0c30\u0c3e\u0c32 \u0c15\u0c4b\u0c38\u0c02 \u0c2e\u0c3e \u0c06\u0c1a\u0c3e\u0c30\u0c4d\u0c2f\u0c41\u0c28\u0c3f \u0c38\u0c02\u0d2a\u0d4d\u0d30\u0c26\u0c3f\u0c02\u0c1a\u0c02\u0c21\u0c3f: ",
            tabEngine: "\u0c24\u0c3e\u0c30\u0c3e\u0c2c\u0c32\u0c02 \u0c07\u0c02\u0c1c\u0c28\u0c4d",
            tabGrid: "\u0c24\u0c3e\u0c30\u0c3e\u0c2c\u0c32\u0c02 \u0c2a\u0c1f\u0c4d\u0c1f\u0c3f\u0c15",
            tabAbout: "\u0c17\u0c41\u0c30\u0c3f\u0c02\u0c1a\u0c3f",
            verdicts: { jagratha: "\u0c1c\u0c3e\u0c17\u0c4d\u0c30\u0c24\u0c4d\u0c24", anukulam: "\u0c05\u0c28\u0c41\u0c15\u0c42\u0c32\u0c02", ananukulam: "\u0c05\u0c28\u0c28\u0c41\u0c15\u0c42\u0c32\u0c02", atyanta: "\u0c05\u0c24\u0c4d\u0c2f\u0c02\u0c24 \u0c05\u0c28\u0c41\u0c15\u0c42\u0c32\u0c02" },
            stars: ["\u0c05\u0c36\u0c4d\u0c35\u0c3f\u0c28\u0c3f", "\u0c2d\u0c30\u0c23\u0c3f", "\u0c15\u0c43\u0c24\u0c4d\u0c24\u0c3f\u0c15", "\u0c30\u0c4b\u0c39\u0c3f\u0c23\u0c3f", "\u0c2e\u0c43\u0c17\u0c36\u0c3f\u0c30", "\u0c06\u0c30\u0c41\u0c26\u0c4d\u0c30", "\u0c2a\u0c41\u0c28\u0c30\u0c4d\u0c35\u0c38\u0c41", "\u0c2a\u0c41\u0c37\u0c4d\u0c2f\u0c2e\u0c3f", "\u0c06\u0c36\u0c4d\u0c32\u0c47\u0c37", "\u0c2e\u0c16", "\u0c2a\u0c41\u0c2c\u0c4d\u0c2c", "\u0c09\u0c24\u0c4d\u0c24\u0c30", "\u0c39\u0c38\u0c4d\u0c24", "\u0c1a\u0c3f\u0c24\u0c4d\u0c24", "\u0c38\u0c4d\u0c35\u0c3e\u0c24\u0c3f", "\u0c35\u0c3f\u0c36\u0c3e\u0c16", "\u0c05\u0c28\u0c42\u0c30\u0c3e\u0c27", "\u0c1c\u0c4d\u0c2f\u0c47\u0c37\u0c4d\u0c20", "\u0c2e\u0c42\u0c32", "\u0c2a\u0c42\u0c30\u0c4d\u0c35\u0c3e\u0c37\u0c3e\u0c22", "\u0c09\u0c24\u0c4d\u0c24\u0c30\u0c3e\u0c37\u0c3e\u0c22", "\u0c36\u0c4d\u0c30\u0c35\u0c23\u0c02", "\u0c27\u0c28\u0c3f\u0c37\u0c4d\u0c20", "\u0c36\u0c24\u0c2d\u0c3f\u0c37\u0c02", "\u0c2a\u0c42\u0c30\u0c4d\u0c35\u0c3e\u0c2d\u0c3e\u0c26\u0c4d\u0c30", "\u0c09\u0c24\u0c4d\u0c24\u0c30\u0c3e\u0c2d\u0c3e\u0c26\u0c4d\u0c30", "\u0c30\u0c47\u0c35\u0c24\u0c3f"],
            rules: {
                1: { title: "\u0c1c\u0c28\u0c4d\u0c2e \u0c24\u0c3e\u0c30\u0c3e", summary: "\u0c2e\u0c28\u0c38\u0c4d\u0c38\u0c41/\u0c36\u0c30\u0c40\u0c30 \u0c36\u0c4d\u0c30\u0c2e", guidance: "\u0c38\u0c3e\u0c27\u0c3e\u0c30\u0c23\u0c02\u0c17\u0c3e \u0c36\u0c41\u0c2d\u0c15\u0c3e\u0c30\u0c4d\u0c2f\u0c3e\u0c32\u0c15\u0c41 \u0c28\u0c3f\u0c35\u0c3e\u0c30\u0c3f\u0c02\u0c1a\u0c41\u0c1f \u0c2e\u0c02\u0c1a\u0c3f\u0c26\u0c3f" },
                2: { title: "\u0c38\u0c02\u0c2a\u0c24\u0c4d \u0c24\u0c3e\u0c30\u0c3e", summary: "\u0c32\u0c3e\u0c2d\u0c02/\u0c27\u0c28\u0c02/\u0c35\u0c43\u0c26\u0c4d\u0c27\u0c3f", guidance: "\u0c27\u0c28, \u0c35\u0c4d\u0c2f\u0c3e\u0c2a\u0c3e\u0c30, \u0c2a\u0c4d\u0c30\u0c3e\u0c30\u0c02\u0c2d \u0c15\u0c3e\u0c30\u0c4d\u0c2f\u0c3e\u0c32\u0c15\u0c41 \u0c2e\u0c02\u0c1a\u0c3f\u0c26\u0c3f" },
                3: { title: "\u0c35\u0c3f\u0c2a\u0c24\u0c4d \u0c24\u0c3e\u0c30\u0c3e", summary: "\u0c05\u0c21\u0c4d\u0c21\u0c02\u0c15\u0c41\u0c32\u0c41/\u0c28\u0c37\u0c4d\u0c1f\u0c02", guidance: "\u0c2a\u0c4d\u0c30\u0c2f\u0c3e\u0c23\u0c02 \u0c2e\u0c30\u0c3f\u0c2f\u0c41 \u0c2e\u0c41\u0c16\u0c4d\u0c2f \u0c15\u0c3e\u0c30\u0c4d\u0c2f\u0c3e\u0c32\u0c32\u0c4b \u0c1c\u0c3e\u0c17\u0c4d\u0c30\u0c24\u0c4d\u0c24" },
                4: { title: "\u0c15\u0c4d\u0c37\u0c47\u0c2e \u0c24\u0c3e\u0c30\u0c3e", summary: "\u0c36\u0c3e\u0c02\u0c24\u0c3f/\u0c30\u0c15\u0c4d\u0c37\u0c23/\u0c38\u0c4c\u0c16\u0c4d\u0c2f\u0c02", guidance: "\u0c17\u0c43\u0c39, \u0c15\u0c41\u0c1f\u0c41\u0c02\u0c2c, \u0c06\u0c30\u0c4b\u0c17\u0c4d\u0c2f \u0c38\u0c02\u0c2c\u0c02\u0c27 \u0c15\u0c3e\u0c30\u0c4d\u0c2f\u0c3e\u0c32\u0c15\u0c41 \u0c2e\u0c02\u0c1a\u0c3f\u0c26\u0c3f" },
                5: { title: "\u0c2a\u0c4d\u0c30\u0c24\u0c4d\u0c2f\u0c15\u0c4d \u0c24\u0c3e\u0c30\u0c3e", summary: "\u0c35\u0c4d\u0c2f\u0c24\u0c3f\u0c30\u0c47\u0c15\u0c24/\u0c35\u0c3f\u0c32\u0c02\u0c2c\u0c02", guidance: "\u0c2e\u0c41\u0c16\u0c4d\u0c2f \u0c28\u0c3f\u0c30\u0c4d\u0c23\u0c2f\u0c3e\u0c32\u0c32\u0c4b \u0c06\u0c32\u0c38\u0c4d\u0c2f\u0c02 \u0c32\u0c47\u0c26\u0c3e \u0c35\u0c3f\u0c18\u0c4d\u0c28\u0c3e\u0c32\u0c41 \u0c30\u0c3e\u0c35\u0c1a\u0c4d\u0c1a\u0c41" },
                6: { title: "\u0c38\u0c3e\u0c27\u0c28 \u0c24\u0c3e\u0c30\u0c3e", summary: "\u0c38\u0c3e\u0c27\u0c28/\u0c35\u0c3f\u0c1c\u0c2f\u0c02", guidance: "\u0c35\u0c3f\u0c26\u0c4d\u0c2f, \u0c2e\u0c02\u0c24\u0c4d\u0c30\u0c1c\u0c2a\u0c02, \u0c38\u0c3e\u0c27\u0c28, \u0c2a\u0c4d\u0c30\u0c2f\u0c24\u0c4d\u0c28\u0c3e\u0c32\u0c15\u0c41 \u0c2e\u0c02\u0c1a\u0c3f\u0c26\u0c3f" },
                7: { title: "\u0c28\u0c48\u0c27\u0c28 \u0c24\u0c3e\u0c30\u0c3e", summary: "\u0c39\u0c3e\u0c28\u0c3f/\u0c38\u0c02\u0c15\u0c1f \u0c38\u0c42\u0c1a\u0c28", guidance: "\u0c05\u0c24\u0c4d\u0c2f\u0c02\u0c24 \u0c1c\u0c3e\u0c17\u0c4d\u0c30\u0c24\u0c4d\u0c24; \u0c38\u0c3e\u0c27\u0c4d\u0c2f\u0c2e\u0c48\u0c24\u0c47 \u0c2e\u0c41\u0c16\u0c4d\u0c2f \u0c15\u0c3e\u0c30\u0c4d\u0c2f\u0c3e\u0c32\u0c41 \u0c28\u0c3f\u0c35\u0c3e\u0c30\u0c3f\u0c02\u0c1a\u0c3e\u0c32\u0c3f" },
                8: { title: "\u0c2e\u0c3f\u0c24\u0c4d\u0c30 \u0c24\u0c3e\u0c30\u0c3e", summary: "\u0c38\u0c39\u0c15\u0c3e\u0c30\u0c02/\u0c38\u0c4d\u0c28\u0c47\u0c39\u0c02", guidance: "\u0c38\u0c02\u0c2d\u0c3e\u0c37\u0c23, \u0c38\u0c2e\u0c3e\u0c35\u0c47\u0c36\u0c02, \u0c38\u0c02\u0c2c\u0c02\u0c27\u0c3e\u0c32\u0c15\u0c41 \u0c2e\u0c02\u0c1a\u0c3f\u0c26\u0c3f" },
                9: { title: "\u0c2a\u0c30\u0c2e \u0c2e\u0c3f\u0c24\u0c4d\u0c30 \u0c24\u0c3e\u0c30\u0c3e", summary: "\u0c05\u0c24\u0c4d\u0c2f\u0c41\u0c24\u0c4d\u0c24\u0c2e \u0c38\u0c39\u0c15\u0c3e\u0c30\u0c02", guidance: "\u0c05\u0c28\u0c4d\u0c28\u0c3f \u0c30\u0c15\u0c3e\u0c32 \u0c09\u0c24\u0c4d\u0c24\u0c2e \u0c15\u0c3e\u0c30\u0c4d\u0c2f\u0c2e\u0c41\u0c32\u0c15\u0c41 \u0c05\u0c28\u0c41\u0c15\u0c42\u0c32\u0c2e\u0c48\u0c28\u0c26\u0c3f" }
            }
        },
        en: {
            appTitle: "Tarabalam Mathematical Calculation Table & Matrix",
            milestoneTag: "\u2728 Tarabalam is a concept in Vedic astrology that refers to the \"star strength,\" calculating the daily compatibility between a person's birth star and the current day's stars to pick an auspicious time (Muhurtha) for new beginnings \u2728",
            engineTitle: "Tarabalam Engine Process",
            matrixTitle: "Complete Tarabalam Map",
            sliderTitle: "Vedic Astro Insights & Guides",
            labelBirth: "Select Birth Star (Janma Nakshatram):",
            labelTarget: "Select Day/Muhurtha Star (Target Nakshatram):",
            thCross: "Birth Star \u2794<br>\ud83d\udc47 Day Star",
            searchPlaceholder: "Type Nakshatra name to filter records...",
            outNum: "Tarabalam Index Number:",
            outVerdict: "Final Verdict Status:",
            outSummary: "Astrological Meaning:",
            outGuidance: "Practical Action Guidance:",
            footerLabel: "For more details email our astro expert: ",
            tabEngine: "Tarabalam Engine",
            tabGrid: "Tarabalam Full Map",
            tabAbout: "About",
            verdicts: { jagratha: "Caution (Jagratha)", anukulam: "Auspicious (Anukulam)", ananukulam: "Inauspicious (Ananukulam)", atyanta: "Highly Auspicious" },
            stars: ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"],
            rules: {
                1: { title: "Janma Tara", summary: "Mental/Physical Exertion", guidance: "Avoid for major auspicious beginnings if possible" },
                2: { title: "Sampat Tara", summary: "Prosperity, Wealth & Growth", guidance: "Excellent for financial transactions and business ventures" },
                3: { title: "Vipat Tara", summary: "Obstacles & Unexpected Losses", guidance: "Exercise caution during travel and vital initiatives" },
                4: { title: "K\u1e63ema Tara", summary: "Peace, Protection & Comfort", guidance: "Favorable for domestic, health, and family welfare events" },
                5: { title: "Pratyak Tara", summary: "Opposition, Delays & Resistance", guidance: "Key choices may encounter hurdles or structural friction" },
                6: { title: "Sadhana Tara", summary: "Achievement & Technical Success", guidance: "Highly dynamic for educational pursuits and dedicated practices" },
                7: { title: "Naidhana Tara", summary: "Severe Danger / Conflict Risks", guidance: "Strictly avoid for critical tasks; prioritize safety protocols" },
                8: { title: "Mitra Tara", summary: "Mutual Cooperation & Harmony", guidance: "Auspicious for meetings, negotiations, and partnerships" },
                9: { title: "Parama Mitra Tara", summary: "Supreme Support & Fellowship", guidance: "Universally excellent for all productive milestones" }
            }
        }
    };
