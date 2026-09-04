    let currentLang = 'en';
    let slideIndex = 0;
    const totalSlides = 6;

    // Integrated Five-Language Localized Matrix Schema Registry
    const languagesDataset = {
        te: {
            appTitle: "తారాబలం గణన పట్టిక మరి�ం గణన పట్టిక మరియు సమగ్ర సూచిక",
            milestoneTag: "✨ తారాబలం అనేది వైదిక జ్యోతిషశాస్త్రంలో ఒక ముఖ్యమైన భాగము, ఇది ఒక వ్యక్తి యొక్క �ి ఒక వ్యక్తి యొక్క జన్మ నక్షత్రం మరియు ప్రస్తుత రోజు నక్షత్రం మధ్య అనుకూలతను లెక్కించి నూతన పనులకు శుభ ముహూర్తాన్ని నిర్ణయించడానికి ఉపయోగపడుతుంది ✨",
            engineTitle: "గణన ప్రక్రియ (Tarabalam Engine)",
            matrixTitle: "తారాబలం సమగ్ర పట్టిక",
            sliderTitle: "వైదిక జ్యోతిష్య అంతర్దృష్టులు & �ర్దృష్టులు & గైడ్‌లు",
            labelBirth: "మీ జన్మ నక్షత్రం (Janma Nakshatram):",
            labelTarget: "దిన / ము�atram):",
            labelTarget: "దిన / ముహూర్త నక్షత్రం (Target Nakshatram):",
            thCross: "జన్మ నక్షత్రం ➔<br>👇 దిన నక్షత్రం",
            searchPlaceholder: "నక్షత్రం పేరు�Placeholder: "నక్షత్రం పేరుతో వెతకండి (Type Nakshatra Name to Filter)...",
            outNum: "తారాబలం సంఖ్య (Tarabalam Number):",
            outVerdict: "నిర్ణయం / ఫలితం (Verdict):",
            outSummary: "సారాంశం (Summary):",
            outGuidance: "ప్రయోగ సూచన (Guidance):",
            footerLabel: "మరిన్ని వివరాల కోసం మా ఆ�రాల కోసం మా ఆచార్యుని సంప్రదించండి: ",
            tabEngine: "తారాబలం ఇంజన్",
            tabGrid: "తారాబలం పట్టిక",
            tabAbout: "గురించి",
            verdicts: { jagratha: "జాగ్రత్త", anukulam: "అనుకూలం", ananukulam: "అననుకూలం", atyanta: "అత్యంత అనుకూలం" },
            stars: ["అశ్విని", "భరణి", "కృత్తిక", "రోహిణి", "మృగశిర", "ఆరుద్ర", "పునర్�ృగశిర", "ఆరుద్ర", "పునర్వసు", "పుష్యమి", "ఆశ్లేష", "మఖ", "పుబ్బ", "ఉత్తర", "�ఖ", "పుబ్బ", "ఉత్తర", "హస్త", "చిత్త", "స్వాతి", "విశాఖ", "అనూరాధ", "జ్యేష్ఠ", "మూల", "పూర్వా�ేష్ఠ", "మూల", "పూర్వాషాఢ", "ఉత్తరాషాఢ", "శ్రవణం", "ధనిష్ఠ", "శతభి��ం", "పూర్వాభాద్ర", "ఉత్తరా�వణం", "ధనిష్ఠ", "శతభిషం", "పూర్వాభాద్ర", "ఉత్తరాభాద్ర", "రేవతి"],
            rules: {
                1: { title: "జన్మ తారా", summary: "మనస్సు/శరీర శ్రమ", guidance: "సాధారణంగా శుభకార్యాలకు నివారించుట మం�కు నివారించుట మంచిది" },
                2: { title: "సంపత్ తారా", summary: "లాభం/ధనం/వృద్ధి", guidance: "ధన, వ్యాపార, ప్రారంభ కార్యాలకు మంచిది" },
                3: { title: "విపత్ తారా", summary: "అడ్డంకులు/న�: { title: "విపత్ తారా", summary: "అడ్డంకులు/నష్టం", guidance: "ప్రయాణం మరియు ముఖ్య కార్యాలలో జాగ్రత్త" },
                4: { title: "క్షేమ తారా", summary: "శాంతి/రక్షణ/సౌఖ్యం", guidance: "గృహ, కుటుంబ, ఆరోగ్య సంబంధ కార్యాలకు మంచిది" },
                5: { title: "ప్రత్యక్ తారా", summary: "వ్యతిరేకత/విలంబం", guidance: "ముఖ్య నిర్ణయాలలో ��లస్యం లేదా వి� నిర్ణయాలలో ఆలస్యం లేదా విఘ్నాలు రావచ్చు" },
                6: { title: "సాధన తారా", summary: "సాధన/వి��యం", guidance: "విద్య, మంత్ర� { title: "సాధన తారా", summary: "సాధన/విజయం", guidance: "విద్య, మంత్రజపం, సాధన, ప్రయత్నాలకు మంచిది" },
                7: { title: "నైధన తారా", summary: "హాని/సంకట సూచన", guidance: "అత్యంత జాగ్రత్త; సాధ్యమైతే ముఖ్య కార్యాలు నివారించాలి" },
                8: { title: "మిత్ర తారా", summary: "సహకారం/స్నేహం", guidance: "సంభాష�్నేహం", guidance: "సంభాషణ, సమావేశం, సంబంధాలకు మంచిది" },
                9: { title: "పరమ మిత్ర తారా", summary: "అత్యు�మ మిత్ర తారా", summary: "అత్యుత్తమ సహకారం", guidance: "అన్ని రకాల ఉత్తమ కార్యములకు అనుకూ�కాల ఉత్తమ కార్యములకు అనుకూలమైనది" }
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
            thCross: "Birth Star ➔<br>👇 Day Star",
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
                4: { title: "Kṣema Tara", summary: "Peace, Protection & Comfort", guidance: "Favorable for domestic, health, and family welfare events" },
                5: { title: "Pratyak Tara", summary: "Opposition, Delays & Resistance", guidance: "Key choices may encounter hurdles or structural friction" },
                6: { title: "Sadhana Tara", summary: "Achievement & Technical Success", guidance: "Highly dynamic for educational pursuits and dedicated practices" },
                7: { title: "Naidhana Tara", summary: "Severe Danger / Conflict Risks", guidance: "Strictly avoid for critical tasks; prioritize safety protocols" },
                8: { title: "Mitra Tara", summary: "Mutual Cooperation & Harmony", guidance: "Auspicious for meetings, negotiations, and partnerships" },
                9: { title: "Parama Mitra Tara", summary: "Supreme Support & Fellowship", guidance: "Universally excellent for all productive milestones" }
            }
        },
        hi: {
            appTitle: "ताराबलम गणना तालिका एवं संपूर्ण मैट्रिक्स",
            milestoneTag: "✨ वैदिक ज्योतिष में ताराबलम का तात्पर्य \"नक्षत्र बल\" से है, जो किसी व्यक्ति के जन्म नक्षत्र और वर्तमान दिन के नक्षत्र के बीच अनुकूलता की गणना करके नए कार्यों की शुरुआत के लिए एक शुभ समय (मुहूर्त) चुनने में मदद करता है ✨",
            engineTitle: "ताराबलं गणना इंजन",
            matrixTitle: "ताराबलं संपूर्ण मानचित्र",
            sliderTitle: "वैदिक ज्योतिष अंतर्दृष्टि और गाइड",
            labelBirth: "अपना जन्म नक्षत्र चुनें (Janma Nakshatram):",
            labelTarget: "दिन / मुहुर्त नक्षत्र चुनें (Target Nakshatram):",
            thCross: "जन्म नक्षत्र ➔<br>👇 दिन नक्षत्र",
            searchPlaceholder: "नक्षत्र के नाम से खोजें...",
            outNum: "ताराबलं गणना संख्या:",
            outVerdict: "अंतिम निर्णय / परिणाम:",
            outSummary: "तारा का मुख्य सारांश:",
            outGuidance: "व्यावहारिक प्रयोग गाइड:",
            footerLabel: "अधिक जानकारी के लिए हमारे ज्योतिष विशेषज्ञ को ईमेल करें: ",
            tabEngine: "ताराबलं इंजन",
            tabGrid: "ताराबलं तालिका",
            tabAbout: "विवरण",
            verdicts: { jagratha: "सावधान / सतर्क", anukulam: "अनुकूल / शुभ", ananukulam: "प्रतिकूल / अशुभ", atyanta: "अत्यंत अनुकूल" },
            stars: ["अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "आश्लेषा", "मघा", "पूर्वाफाल्गुनी", "उत्तराफाल्गुनी", "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा", "मूल", "पूर्वाषाढ़ा", "उत्तराषाढ़ा", "श्रवण", "धनिष्ठा", "शतभीषा", "पूर्वाभाद्रपद", "उत्तराभाद्रपद", "रेवती"],
            rules: {
                1: { title: "जन्म तारा", summary: "मानसिक और शारीरिक श्रम", guidance: "सामान्यतः महत्वपूर्ण मांगलिक कार्यों के लिए टालना बेहतर है" },
                2: { title: "सम्पत तारा", summary: "लाभ, धन और समृद्धि की वृद्धि", guidance: "वित्तीय लेनदेन, व्यापार and नए उपक्रमों के लिए उत्तम" },
                3: { title: "विपत तारा", summary: "बाधाएं और धन हानि का योग", guidance: "यात्रा और महत्वपूर्ण रणनीतिक कार्यों में अत्यधिक सावधानी रखें" },
                4: { title: "क्षेम तारा", summary: "शांति, सुरक्षा और उत्तम सुख", guidance: "घरेलू, पारिवारिक और स्वास्थ्य संबंधी कार्यों के लिए शुभ" },
                5: { title: "प्रत्यक तारा", summary: "विरोध, रुकावट और विलंब", guidance: "महत्वपूर्ण निर्णयों में देरी या बाधाएं आने की संभावना होती है" },
                6: { title: "साधना तारा", summary: "सिद्धि, साधना और सफलता", guidance: "शिक्षा, मंत्र जाप, तकनीकी प्रयासों के लिए अत्यधिक अनुकूल" },
                7: { title: "निधन तारा", summary: "हानि और गंभीर संकट का संकेत", guidance: "अत्यंत सावधानी बरतें; यदि संभव हो तो शुभ कार्यों को टालें" },
                8: { title: "मित्र तारा", summary: "सहयोग, सौहार्द और मित्रता", guidance: "संवाद, बैठकें और आपसी संबंधों को मजबूत करने के लिए अच्छा" },
                9: { title: "परम मित्र तारा", summary: "सर्वोत्तम सहयोग और पूर्ण फल", guidance: "सभी प्रकार के श्रेष्ठ एवं रचनात्मक कार्यों के लिए सर्वोत्तम" }
            }
        },
        ta: {
            appTitle: "தாராபலம் கணக்கீட்டு அட்டவணை மற்றும் மேட்ரிக்ஸ்",
            milestoneTag: "✨ தாராபலம் என்பது வேத ஜோதிடத்தில் \"நட்சத்திர பலம்\" என்பதைக் குறிக்கிறது, இது ஒரு நபரின் பிறந்த நட்சத்திரத்திற்கும் தற்போதைய நாளின் நட்சத்திரத்திற்கும் இடையிலான பொருத்தத்தைக் கணக்கிட்டு புதிய தொடக்கங்களுக்கான சுப நேரத்தை (முஹூர்த்தம்) தேர்வு செய்ய உதவுகிறது ✨",
            engineTitle: "தாராபலம் கணக்கீட்டு முறைமை",
            matrixTitle: "முழுமையான தாராபலம் 27x27 குறிப்பு வரைபடம்",
            sliderTitle: "வேத ஜோதிட நுண்ணறிவுகள் & வழிகாட்டிகள்",
            labelBirth: "உங்கள் ஜென்ம நட்சத்திரத்தைத் தேர்ந்தெடுக்கவும்:",
            labelTarget: "தினசரி / முஹூர்த்த நட்சத்திரம்:",
            thCross: "ஜென்ம நட்சத்திரம் ➔<br>👇 தினசரி நட்சத்திரம்",
            searchPlaceholder: "நட்சத்திரத்தின் பெயரைத் தட்டச்சு செய்து தேடவும்...",
            outNum: "தாராபலம் கணக்கீட்டு எண்:",
            outVerdict: "இறுதி முடிவு / பலன்:",
            outSummary: "பலன்களின் சுருக்கம்:",
            outGuidance: "பயன்பாட்டு வழிகாட்டுதல்:",
            footerLabel: "மேலும் விவரங்களுக்கு எங்களது ஜோதிட நிபுணரை மின்னஞ்சல் செய்யவும்: ",
            tabEngine: "தாராபலம் கிளையண்ட்",
            tabGrid: "தாரபலம் அட்டவணை",
            tabAbout: "பற்றி",
            verdicts: { jagratha: "எச்சரிக்கை / கவனம்", anukulam: "அனுகூலம் / சாதகம்", ananukulam: "பிரதிகூலம் / சாதகமற்றது", atyanta: "மிகவும் சாதகமானது" },
            stars: ["அஸ்வினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிடம்", "திருவாதிரை", "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்", "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாக்கம்", "அனுஷம்", "கேட்டை", "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்", "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"],
            rules: {
                1: { title: "ஜென்ம தாரை", summary: "மன மற்றும் உடல் ரீதியான உழைப்பு", guidance: "பொதுவாக சுப காரியங்களைத் தவிர்ப்பது நல்லது" },
                2: { title: "சம்பத் தாரை", summary: "செல்வம், லாபம் மற்றும் வளர்ச்சி", guidance: "பணப் பரிவர்த்தனைகள் மற்றும் வணிகத் தொடக்கங்களுக்கு மிக நன்று" },
                3: { title: "விபத் தாரை", summary: "தடைகள் மற்றும் இழப்புகள்", guidance: "பயணங்கள் மற்றும் முக்கிய முயற்சிகளின் போது கவனமாக இருக்கவும்" },
                4: { title: "க்ஷேம தாரை", summary: "அமைதி, பாதுகாப்பு மற்றும் சுகம்", guidance: "குடும்பம், ஆரோக்கியம் சார்ந்த சுப நிகழ்வுகளுக்கு ஏற்றது" },
                5: { title: "பிரத்யக் தாரை", summary: "எதிர்ப்பு மற்றும் காரிய தாமதம்", guidance: "முக்கிய முடிவுகள் எடுப்பதில் தடைகள் அல்லது தாமதங்கள் வரலாம்" },
                6: { title: "சாதன தாரை", summary: "முயற்சி வெற்றி மற்றும் அது சாதனை", guidance: "கல்வி, மந்திர ஜபம் மற்றும் புதிய முயற்சிகளுக்கு மிகவும் உகந்தது" },
                7: { title: "நைதன தாரை", summary: "ஆபத்து மற்றும் பெரும் நஷ்டம்", guidance: "மிகவும் எச்சரிக்கையாக இருக்கவும்; சுப காரியங்களைத் தவிர்த்தல் நன்று" },
                8: { title: "மித்ர தாரை", summary: "ஒத்துழைப்பு மற்றும் நட்பு", guidance: "பேச்சுவார்த்தைகள், சந்திப்புகள் மற்றும் உறவுகளுக்கு நன்று" },
                9: { title: "பரம மித்ர தாரை", summary: "உன்னதமான ஆதரவு மற்றும் உதவி", guidance: "அனைத்து வகையான நற்காரியங்களுக்கும் மிகச் சிறந்த தாரையாகும்" }
            }
        },
        kn: {
            appTitle: "ತಾರಾಬಲಂ ಲೆಕ್ಕಾಚಾರದ ಕೋಷ್ಟಕ ಮತ್ತು ಮ್ಯಾ� ಕೋಷ್ಟಕ ಮತ್ತು ಮ್ಯಾಟ್ರಿಕ್ಸ್",
            milestoneTag: "✨ ತಾರಾಬಲಂ ಎಂಬುದು ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ \"ನಕ್ಷತ್ರ ಬಲ\"ವನ್ನು ಸೂಚಿಸುತ್ತದೆ, ಇದು ವ್ಯಕ್ತಿಯ ಜನ್ಮ ನಕ್ಷತ್ರ ಮತ್ತು ಪ್ರಸ್ತುತ ದಿನದ ನಕ್ಷತ್ರದ ನಡುವಿನ ಹೊಂದಾಣಿಕೆಯನ್ನು ಲೆಕ್ಕಹಾಕಿ ಹೊಸ ಕೆಲಸಗಳ ಆರಂಭಕ್ಕೆ ಶುಭ ಮುಹೂರ್ತವನ್ನು ಆಯ್ಕೆ ಮಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ ✨",
            engineTitle: "ತಾರಾಬಲಂ ಗಣನೆ ಪ್ರಕ್ರಿಯೆ",
            matrixTitle: "ಸಂಪೂರ್ಣ ತಾರಾಬಲಂ 27x27 ಮಾಸ್ಟರ್ ಗ್ರಿಡ್ ನಕ್ಷೆ",
            sliderTitle: "ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಒಳನೋಟಗಳು & ಮಾರ್ಗದರ್ಶಿಗಳು",
            labelBirth: "ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರವನ್ನು �ು",
            labelBirth: "ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ:",
            labelTarget: "ದಿನ / ಮುಹೂರ್ತ ನಕ್ಷತ್ರವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ:",
            thCross: "ಜನ್ಮ ನಕ್ಷತ್ರ ➔<br>👇 ದಿನದ ನಕ್ಷತ್ರ",
            searchPlaceholder: "ನಕ್ಷತ್ರದ ಹೆಸರನ್ನು ಟ�್ರ",
            searchPlaceholder: "ನಕ್ಷತ್ರದ ಹೆಸರನ್ನು ಟೈಪ್ ಮಾಡಿ ಹುಡುಕಿ...",
            outNum: "ತಾರಾಬಲಂ ಗಣನೆ ಸಂಖ್ಯೆ:",
            outVerdict: "ಅಂತಿಮ ತೀರ್ಪು / ಫಲಿ��ಾಂಶ:",
            outSummary: "ಫಲಿತಾಂ�ಅಂತಿಮ ತೀರ್ಪು / ಫಲಿತಾಂಶ:",
            outSummary: "ಫಲಿತಾಂಶದ ಸಾರಾಂಶ:",
            outGuidance: "ಪ್ರಾಯೋಗಿಕ ಸೂಚನೆಗಳು:",
            footerLabel: "ಹೆಚ್� ಸೂಚನೆಗಳು:",
            footerLabel: "ಹೆಚ್ಚಿನ ವಿವರಗಳಿಗಾಗಿ ನಮ್ಮ ಜ್ಯೋತಿಷ್ಯ ತಜ್ಞರನ್ನು ಇಮೇಲ್ ಮಾಡಿ: ",
            tabEngine: "ತಾರಾಬಲಂ ಇಂಜಿನ್",
            tabGrid: "ತಾರಾಬಲಮ್ ಟೇಬಲ್",
            tabAbout: "ಬಗ್ಗೆ",
            verdicts: { jagratha: "ಎಚ್�್",
            tabAbout: "ಬಗ್ಗೆ",
            verdicts: { jagratha: "ಎಚ್ಚರಿಕೆ / ಜಾಗ್ರತೆ", anukulam: "ಅನುಕೂಲ / ಶುಭ", ananukulam: "ಅನನುಕೂಲ / ಅಶುಭ", atyanta: "ಅತ್ಯಂತ ಆನುಕೂಲಕರ" },
            stars: ["ಅಶ್ವಿನಿ", "ಭರಣಿ", "ಕ� },
            stars: ["ಅಶ್ವಿನಿ", "ಭರಣಿ", "ಕೃತಿಕಾ", "ರೋಹಿಣಿ", "ಮೃಗಶಿರ", "ಆರಿದ್ರಾ", "ಪುನರ್ವಸು", "ಪುಷ್ಯ", "ಆಶ್ಲೇಷಾ", "ಮಖಾ", "ಪೂರ್ವಾಫಾಲ್ಗುಣಿ", "ಉತ್ತರಾಫಾಲ್ಗುಣಿ", "ಹಸ್ತಾ", "ಚಿತ್ರಾ", "ಸ್ವಾತಿ", "ವಿಶಾಖಾ", "ಅನುರಾಧಾ", "ಜ್ಯೇಷ್ಠಾ", "ಮೂಲಾ", "ಪೂರ್ವಾಷಾಢ", "ಉತ್ತರಾಷಾಢ", "ಶ್ರವಣ", "ಧನಿಷ್ಠಾ", "ಶತಭಿಷ", "ಪೂರ್ವಾಭಾದ್ರಪದ", "ಉತ್ತರಾಭಾದ್ರಪದ", "ರೇವತಿ"],
            rules: {
                1: { title: "��ನ್ಮ ತಾರಾ", summary: "ಮಾನಸಿಕ ಮತ್ತು ದ��ಹಿಕ ಶ್ರಮ", guidance: "ಸಾಮಾ�ಾದ್ರಪದ", "ರೇವತಿ"],
            rules: {
                1: { title: "ಜನ್ಮ ತಾರಾ", summary: "ಮಾನಸಿಕ ಮತ್ತು ದೈಹಿಕ ಶ್ರಮ", guidance: "ಸಾಮಾನ್ಯವಾಗಿ ಶುಭ ಕಾರ್ಯಗಳಿಗೆ ಇದನ್ನು ವರ್ಜಿಸುವುದು ಉತ್ತಮ" },
                2: { title: "ಸಂಪತ್ ತಾರಾ", summary: "ಲಾಭ, ಧನ ಧಾನ್ಯ ಮತ್ತು ವ�ಾರಾ", summary: "ಲಾಭ, ಧನ ಧಾನ್ಯ ಮತ್ತು ವೃದ್ಧಿ", guidance: "ಹಣಕಾಸು, ವ್ಯಾಪಾರ ಹಾಗೂ ಹೊಸ ಉದ್ಯೋಗ ಆರಂಭಕ್ಕೆ ಉತ್ತಮ" },
                3: { title: "ವಿಪತ್ ತಾರಾ", summary: "ಅಡೆತಡೆಗಳು ಮತ್ತು ನ�: "ಅಡೆತಡೆಗಳು ಮತ್ತು ನಷ್ಟದ ಭೀತಿ", guidance: "ಪ್ರಯಾಣ ಮತ್ತು ಪ್ರಮುಖ ಕಾರ್ಯಗಳನ್ನು ಮಾಡುವಾಗ ಜಾಗರೂಕರಾಗಿರಿ" },
                4: { title: "ಕ್ಷೇಮ ತಾರಾ", summary: "ಶಾಂತಿ, ರಕ್ಷಣೆ ಮತ್ತು ಸೌಖ್ಯ", guidance: "ಗೃ�� ಪ್ರವೇಶ, ಕೌ�ಕ್ಷಣೆ ಮತ್ತು ಸೌಖ್ಯ", guidance: "ಗೃಹ ಪ್ರವೇಶ, ಕೌಟುಂಬಿಕ ಮತ್ತು ಆರೋಗ್ಯ ಸಂಬಂಧಿತ ಕಾರ್ಯಗಳಿಗೆ ಶುಭ" },
                5: { title: "ಪ್ರತ್ಯಕ್ ತಾರಾ", summary: "ವಿರೋಧ ಮತ್ತು ಕೆಲಸದಲ್ಲಿ ವಿಳಂಬ", guidance: "ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳಲ್ಲಿ ಅಡೆತಡೆಗಳು ಎದುರಾಗುವ ಸಾಧ್ಯತೆ ಇರುತ್ತದೆ" },
                6: { title: "ಸಾಧನಾ ತಾರಾ", summary: "ಸಾಧನೆ ಮತ್ತು ನಿರೀಕ್ಷಿತ ಯಶಸ್ಸು", guidance: "ವಿದ್ಯಾಭ್ಯಾಸ, ಮಂತ್ರ ಜಪ ಮತ್ತು ತಾಂತ್ರಿಕ ಪ್ರಯತ್ನಗಳಿ�ತ್ತು ತಾಂತ್ರಿಕ ಪ್ರಯತ್ನಗಳಿಗೆ ಸೂಕ್ತ" },
                7: { title: "ನೈಧನ ತಾರಾ", summary: "ಹಾನಿ ಮತ್ತು ಸಂಕಟದ ಮುನ್ಸೂಚನೆ", guidance: "ಅತ್ಯಂತ ಜಾಗರೂಕರಾಗಿರಿ; ಸಾಧ್ಯವಾದರೆ ಶುಭ ಕಾರ್ಯಗಳನ್ನು ಮುಂದೂಡಿ" },
                8: { title: "ಮಿತ್ರ ತಾರಾ", summary: "ಸಹಕಾರ ಮತ್ತು ಸೌ� "ಮಿತ್ರ ತಾರಾ", summary: "ಸಹಕಾರ ಮತ್ತು ಸೌಹಾರ್ದತೆ", guidance: "ಸಂವಹನ, ಸಭೆಗಳು ಮತ್ತು ಹೊಸ ಸಂಬಂಧಗಳನ್ನು ಬೆಳೆಸಲು ಒಳ್ಳೆಯದು" },
                9: { title: "ಪರಮ ಮಿತ್ರ ತಾರಾ", summary: "ಉತ್ತಮ ಸಹಕಾರ ಮತ್ತು ಪರಿಪೂರ್ಣ ಫಲ", guidance: "ಎಲ್ಲಾ ರೀತಿಯ ಸತ್ಕಾರ್ಯಗಳ ಆರಂಭಕ್ಕೆ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠವಾದದ್ದು" }
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

        // Apply dynamically translated text to tab selectors
        document.getElementById("tab-engine").textContent = strings.tabEngine;
        document.getElementById("tab-grid").textContent = strings.tabGrid;
        document.getElementById("tab-about").textContent = strings.tabAbout;

        // Apply dynamically translated prefix label for footer text
        document.getElementById("ui-footer-note").innerHTML = `${strings.footerLabel} <a href=\"mailto:priest.mrk@gmail.com\">priest.mrk@gmail.com</a>`;

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

    // Slider controls runtime functions
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

    // Handles absolute position transformation
    function updateSliderPosition() {
        const offset = -slideIndex * 100;
        document.getElementById('sliderStrip').style.transform = `translateX(${offset / totalSlides}%)`;
        
        const dots = document.querySelectorAll('#sliderIndicators .dot');
        dots.forEach(d => d.classList.remove('active'));
        if(dots[slideIndex]) dots[slideIndex].classList.add('active');
    }

    // Handles fallback when an image completely fails to resolve natively
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
