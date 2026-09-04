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
            thCross: "\u0c1c\u0c28\u0c4d\u0c2e \u0c28\u0c15\u0c4d\u0c37\u0c24\u0c4d\u0c30\u0c02 \u2794<br>\u1f447 \u0c26\u0c3f\u0c28 \u0c28\u0c15\u0c4d\u0c37\u0c24\u0c4d\u0c30\u0c02",
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
            thCross: "Birth Star \u2794<br>\u1f447 Day Star",
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

    function switchTab(targetView) {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.dynamic-view').forEach(v => v.style.display = 'none');
        if (targetView === 'engine') {
            document.getElementById('tab-engine').classList.add('active');
            document.getElementById('view-calculator').style.display = 'block';
        } else if (targetView === 'grid') {
            document.getElementById('tab-grid').classList.add('active');
            document.getElementById('view-matrix').style.display = 'block';
            const b = parseInt(document.getElementById("birthStarSelect").value);
            const t = parseInt(document.getElementById("targetStarSelect").value);
            setTimeout(() => {
                const exactCell = document.querySelector(`td[data-b="${b}"][data-t="${t}"]`);
                if (exactCell) {
                    exactCell.classList.add("active-cell");
                    exactCell.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }
            }, 50);
        } else if (targetView === 'about') {
            document.getElementById('tab-about').classList.add('active');
            document.getElementById('view-about-content').style.display = 'block';
        }
    }

    function switchLanguage(langCode, evt) {
        currentLang = langCode;
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
        if (evt && evt.target) {
            evt.target.classList.add('active');
        } else {
            const btnIdxMap = { te: 1, en: 2, hi: 3, ta: 4, kn: 5 };
            const matchedBtn = document.querySelector(`.lang-container .lang-btn:nth-child(${btnIdxMap[langCode]})`);
            if (matchedBtn) matchedBtn.classList.add('active');
        }
        const strings = languagesDataset[langCode];
        document.getElementById("ui-app-title").textContent = strings.appTitle;
        document.getElementById("ui-milestone-tag").textContent = strings.milestoneTag;
        document.getElementById("ui-engine-title").textContent = strings.engineTitle;
        document.getElementById("ui-matrix-title").textContent = strings.matrixTitle;
        document.getElementById("ui-label-birth").textContent = strings.labelBirth;
        document.getElementById("ui-label-target").textContent = strings.labelTarget;
        document.getElementById("ui-th-cross").innerHTML = strings.thCross;
        document.getElementById("searchBox").placeholder = strings.searchPlaceholder;
        document.getElementById("ui-out-num").textContent = strings.outNum;
        document.getElementById("ui-out-verdict").textContent = strings.outVerdict;
        document.getElementById("ui-out-summary").textContent = strings.outSummary;
        document.getElementById("ui-out-guidance").textContent = strings.outGuidance;
        document.getElementById("ui-slider-title").textContent = strings.sliderTitle;
        document.getElementById("tab-engine").textContent = strings.tabEngine;
        document.getElementById("tab-grid").textContent = strings.tabGrid;
        document.getElementById("tab-about").textContent = strings.tabAbout;
        document.getElementById("ui-footer-note").innerHTML = `${strings.footerLabel} <a href="mailto:priest.mrk@gmail.com">priest.mrk@gmail.com</a>`;
        repopulateDropdowns();
        rebuildMatrixGrid();
        computeEngine();
    }

    function repopulateDropdowns() {
        const bSel = document.getElementById("birthStarSelect");
        const tSel = document.getElementById("targetStarSelect");
        const prevB = bSel.value || "4";
        const prevT = tSel.value || "5";
        bSel.innerHTML = "";
        tSel.innerHTML = "";
        languagesDataset[currentLang].stars.forEach((starName, i) => {
            bSel.options.add(new Option(`${i + 1}. ${starName}`, i + 1));
            tSel.options.add(new Option(`${i + 1}. ${starName}`, i + 1));
        });
        bSel.value = prevB;
        tSel.value = prevT;
    }

    function calcFormula(b, t) {
        let d = (t - b) + 1;
        if (d <= 0) d += 27;
        let r = d % 9;
        return r === 0 ? 9 : r;
    }

    function computeEngine() {
        const b = parseInt(document.getElementById("birthStarSelect").value);
        const t = parseInt(document.getElementById("targetStarSelect").value);
        const num = calcFormula(b, t);
        const localizedConfig = languagesDataset[currentLang].rules[num];
        const verdicts = languagesDataset[currentLang].verdicts;
        let styleToken = "theme-jagratha";
        let verdictText = verdicts.jagratha;
        if (num === 9) { styleToken = "theme-atyanta"; verdictText = verdicts.atyanta; }
        else if ([2, 4, 6, 8].includes(num)) { styleToken = "theme-anukulam"; verdictText = verdicts.anukulam; }
        else if (num === 7) { styleToken = "theme-naidhana"; verdictText = verdicts.ananukulam; }
        else if (num === 5) { styleToken = "theme-ananukulam"; }
        const panel = document.getElementById("resultPanel");
        panel.className = `result-panel ${styleToken} active`;
        document.getElementById("outTaraName").textContent = localizedConfig.title;
        document.getElementById("outTaraNumber").textContent = num;
        document.getElementById("outVerdict").textContent = verdictText;
        document.getElementById("outSummary").textContent = localizedConfig.summary;
        document.getElementById("outGuidance").textContent = localizedConfig.guidance;
        document.querySelectorAll("#matrixTable td").forEach(c => c.classList.remove("active-cell"));
        const targetCell = document.querySelector(`td[data-b="${b}"][data-t="${t}"]`);
        if (targetCell) targetCell.classList.add("active-cell");
    }

    function rebuildMatrixGrid() {
        const headerRow = document.getElementById("matrixHeader");
        const bodyContainer = document.getElementById("matrixBody");
        while (headerRow.cells.length > 1) headerRow.deleteCell(1);
        bodyContainer.innerHTML = "";
        const currentLangData = languagesDataset[currentLang];
        currentLangData.stars.forEach(s => {
            let th = document.createElement("th");
            th.textContent = s;
            headerRow.appendChild(th);
        });
        currentLangData.stars.forEach((targetStar, ti) => {
            let tr = document.createElement("tr");
            let leadCell = document.createElement("td");
            leadCell.textContent = targetStar;
            tr.appendChild(leadCell);
            currentLangData.stars.forEach((birthStar, bi) => {
                let cell = document.createElement("td");
                let n = calcFormula(bi + 1, ti + 1);
                cell.textContent = currentLangData.rules[n].title.split(" ")[0];
                cell.setAttribute("data-b", bi + 1);
                cell.setAttribute("data-t", ti + 1);
                if (n === 9) cell.className = "grid-atyanta";
                else if ([2, 4, 6, 8].includes(n)) cell.className = "grid-anukulam";
                else if (n === 7) cell.className = "grid-naidhana";
                cell.onclick = function() {
                    document.getElementById("birthStarSelect").value = bi + 1;
                    document.getElementById("targetStarSelect").value = ti + 1;
                    switchTab('engine');
                };
                tr.appendChild(cell);
            });
            bodyContainer.appendChild(tr);
        });
    }

    function filterGridMatrix() {
        const searchInputText = document.getElementById("searchBox").value.toLowerCase();
        const matrixRows = document.querySelectorAll("#matrixBody tr");
        matrixRows.forEach(rowItem => {
            const rowHeaderLabel = rowItem.cells[0].textContent.toLowerCase();
            rowItem.style.display = rowHeaderLabel.includes(searchInputText) ? "" : "none";
        });
    }

    function moveSlide(direction) {
        slideIndex += direction;
        if (slideIndex >= totalSlides) slideIndex = 0;
        if (slideIndex < 0) slideIndex = totalSlides - 1;
        updateSliderPosition();
    }

    function jumpToSlide(index) {
        slideIndex = index;
        updateSliderPosition();
    }

    function updateSliderPosition() {
        const offset = -slideIndex * 100;
        document.getElementById('sliderStrip').style.transform = `translateX(${offset / totalSlides}%)`;
        const dots = document.querySelectorAll('#sliderIndicators .dot');
        dots.forEach(d => d.classList.remove('active'));
        if(dots[slideIndex]) dots[slideIndex].classList.add('active');
    }

    function handleImageError(imageElement) {
        imageElement.style.display = 'none';
        const parentSlide = imageElement.closest('.slide-item');
        if (parentSlide) {
            const fallbackNode = parentSlide.querySelector('.slide-fallback-bg');
            if (fallbackNode) {
                fallbackNode.style.opacity = '1';
                fallbackNode.style.color = '#e2e8f0';
                fallbackNode.style.fontSize = '32px';
                fallbackNode.style.background = '#34495e';
            }
        }
    }

    window.onload = function() {
        const englishBtn = document.querySelector('.lang-container .lang-btn:nth-child(2)');
        switchLanguage('en', { target: englishBtn });
        updateSliderPosition();
    };
