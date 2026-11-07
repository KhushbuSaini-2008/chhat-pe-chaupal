import asyncio, os, edge_tts

VOICE = "hi-IN-SwaraNeural"
RATE = "+8%"
PITCH = "+20Hz"

LINES = {
    "roomStart": ["चलो जी, चौपाल सज गई!", "नमस्ते! सब आ गए?"],
    "correct": ["वाह! क्या दिमाग पाया है!", "सही जवाब! ताली बजाओ!"],
    "wrong": ["क्लोज़ था, पर दिल के पास!", "अरे! अगली बार एक और कोशिश करना!"],
    "timeUp": ["टाइम खत्म! देखते हैं सही जवाब क्या था!"],
    "nobodyCorrect": ["अरे, किसी को नहीं पता? दादी से पूछो!"],
    "nextRound": ["चलो, अब अगली पहेली!"],
    "winner": ["आज का पहेली चैंपियन मिल गया!"],
    "gameEnd": ["बस? इतनी जल्दी? एक और राउंड खेलते हैं!"],
}

async def main():
    os.makedirs("public/chutki", exist_ok=True)
    for key, lines in LINES.items():
        for i, text in enumerate(lines):
            out = f"public/chutki/{key}_{i}.mp3"
            await edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH).save(out)
            print("made", out)

asyncio.run(main())