    let currentLang = 'en';
    let slideIndex = 0;
    const totalSlides = 6;

    // Integrated Five-Language Localized Matrix Schema Registry
    const languagesDataset = {
        te: {
            appTitle: "తారాబలం గణన పట్టిక మరియు సమగ్ర సూచిక",
            milestoneTag: "✨ తారాబలం అనేది వైదిక జ్యోతిషశాస్త్రంలో ఒక ముఖ్యమైన భాగము, ఇది ఒక వ్యక్తి యొక్క జన్మ నక్షత్రం మరియు ప్రస్తుత రోజు నక్షత్రం మధ్య అనుకూలతను లెక్కించి నూతన పనులకు శుభ ముహూర్తాన్ని నిర్ణయించడానికి ఉపయోగపడుతుంది ✨",
            engineTitle: "గణన ప్రక్రియ (Tarabalam Engine)",
            matrixTitle: "తారాబలం సమగ్ర పట్టిక",
            sliderTitle: "వైదిక జ్యోతిష్య అంతర్దృష్టులు & గైడ్‌లు",
            labelBirth: "మీ జన్మ నక్షత్రం (Janma Nakshatram):",
            labelTarget: "దిన / ముహూర్త నక్షత్రం (Target Nakshatram):",
            thCross: "జన్మ నక్షత్రం ➞<br>👇 దిన నక్షత్రం",
            searchPlaceholder: "నక్షత్రం పేరుతో వెతకండి (Type Nakshatra Name to Filter)...",
            outNum: "తారాబలం సంఖ్య (Tarabalam Number):",
            outVerdict: "నిర్ణయం / ఫలితం (Verdict):",
            outSummary: "సారాంశం (Summary):",
            outGuidance: "ప్రయోగ సూచన (Guidance):",
            footerLabel: "మరిన్ని వివరాల కోసం మా ఆచార్యుని సంప్రదించండి: ",
            tabEngine: "తారాబలం ఇంజన్",
            tabGrid: "తారాబలం పట్టిక",
            tabAbout: "గురించి",
            verdicts: { jagratha: "జాగ్రత్త", anukulam: "అనుకూలం", ananukulam: "అననుకూలం", atyanta: "అత్యంత అనుకూలం" },
            stars: ["అశ్విని", "భరణి", "కృత్తిక", "రోహిణి", "మృగశిర", "ఆరుద్ర", "పునర్వసు", "పుష్యమి", "ఆశ్లేష", "మఖ", "పుబ్బ", "ఉత్తర", "హస్త", "చిత్త", "స్వాతి", "విశాఖ", "అనూరాధ", "జ్యేష్ఠ", "మూల", "పూర్వాషాఢ", "ఉత్తరాషాఢ", "శ్రవణం", "ధనిష్ఠ", "శతభిషం", "పూర్వాభాద్ర", "ఉత్తరాభాద్ర", "రేవతి"],
            rules: {
                1: { title: "జన్మ తారా", summary: "మనస్సు/శరీర శ్రమ", guidance: "సాధారణంగా శుభకార్యాలకు నివారించుట మంచిది" },
                2: { title: "సంపత్ తారా", summary: "లాభం/ధనం/వృద్ధి", guidance: "ధన, వ్యాపార, ప్రారంభ కార్యాలకు మంచిది" },
                3: { title: "విపత్ తారా", summary: "అడ్డంకులు/నష్టం", guidance: "ప్రయాణం మరియు ముఖ్య కార్యాలలో జాగ్రత్త" },
                4: { title: "క్షేమ తారా", summary: "శాంతి/రక్షణ/సౌఖ్యం", guidance: "గృహ, కుటుంబ, ఆరోగ్య సంబంధ కార్యాలకు మంచిది" },
                5: { title: "ప్రత్యక్ తారా", summary: "వ్యతిరేకత/విలంబం", guidance: "ముఖ్య నిర్ణయాలలో ఆలస్యం లేదా విఘ్నాలు రావచ్చు" },
                6: { title: "సాధన తారా", summary: "సాధన/విజయం", guidance: "విద్య, మంత్రజపం, సాధన, ప్రయత్నాలకు మంచిది" },
                7: { title: "నైధన తారా", summary: "హాని/సంకట సూచన", guidance: "అత్యంత జాగ్రత్త; సాధ్యమైతే ముఖ్య కార్యాలు నివారించాలి" },
                8: { title: "మిత్ర తారా", summary: "సహకారం/స్నేహం", guidance: "సంభాషణ, సమావేశం, సంబంధాలకు మంచిది" },
                9: { title: "పరమ మిత్ర తారా", summary: "అత్యుత్తమ సహకారం", guidance: "అన్ని రకాల ఉత్తమ కార్యములకు అనుకూలమైనది" }
            }
        },
        en: {
            appTitle: "Tarabalam Mathematical Calculation Table & Matrix",
            milestoneTag: "✨ Tarabalam is a concept in Vedic astrology that refers to the \"star strength,\" calculating the daily compatibility between a person's birth star and the current day's stars to pick an auspicious time (Muhurtha) for new beginnings ✨",
            engineTitle: "Tarabalam Engine Process",
            matrixTitle: "Complete Tarabalam Map",
            sliderTitle: "Vedic Astro Insights & Guides",
            labelBirth: "Select Birth Star (Janma Nakshatram):",
            labelTarget: "Select Day/Muhurtha Star (Target Nakshatram):",
            thCross: "Birth Star ➞<br>👇 Day Star",
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
        },
        hi: {
            appTitle: "\u0924\u093e\u0930\u093e\u092c\u0932\u092e \u0917\u0923\u0928\u093e \u0924\u093e\u0932\u093f\u0915\u093e \u090f\u0935\u0902 \u0938\u0902\u092a\u0942\u0930\u094d\u0923 \u092e\u0948\u091f\u094d\u0930\u093f\u0915\u094d\u0938",
            PLACEHOLDER: "FULL_FILE_CONTINUES"
        }
    };
