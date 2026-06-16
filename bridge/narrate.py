# Narrator worker — synthesizes one audio file per lesson sentence with
# Chatterbox Multilingual TTS (MIT, 23 languages incl. Dutch; quality in the
# ElevenLabs class). Run by the bridge as a separate "narrate" job:
#
#     .venv-narrator/bin/python narrate.py --lesson <lesson.json> --out <dir> --lang nl
#
# Protocol: one JSON line per event on stdout —
#     {"loading": true}                          model load started
#     {"done": 3, "total": 45, "file": "..."}    a sentence finished
#     {"ok": true, "total": 45}                  all done (manifest written)
# Errors go to stderr with a non-zero exit.
#
# Files land as <out>/pg<para>_s<sent>.mp3 (wav if ffmpeg is missing), matching
# the app's sentence ids (p<page>-pg<para>-s<sent>). Existing files are kept, so
# an interrupted job resumes where it stopped. Drop a voice-ref.wav next to this
# script to clone that voice as the narrator.

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile

def out(obj):
    print(json.dumps(obj), flush=True)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lesson", required=True, help="path to lesson.json")
    ap.add_argument("--out", required=True, help="directory for audio files")
    ap.add_argument("--lang", default="nl", help="ISO 639-1 language id")
    args = ap.parse_args()

    with open(args.lesson, encoding="utf-8") as f:
        lesson = json.load(f)

    sentences = []  # (key, text)
    for pi, para in enumerate(lesson.get("paragraphs", [])):
        for si, s in enumerate(para.get("sentences", [])):
            text = (s.get("dutch") or "").strip()
            if text:
                sentences.append((f"pg{pi}_s{si}", text))
    total = len(sentences)
    if total == 0:
        out({"ok": True, "total": 0})
        return

    os.makedirs(args.out, exist_ok=True)
    ffmpeg = shutil.which("ffmpeg")
    ext = "mp3" if ffmpeg else "wav"

    # Resume: skip sentences whose file already exists and is non-empty.
    todo = []
    for key, text in sentences:
        path = os.path.join(args.out, f"{key}.{ext}")
        if not (os.path.exists(path) and os.path.getsize(path) > 0):
            todo.append((key, text))

    done = total - len(todo)
    if todo:
        out({"loading": True})
        import torch  # noqa: deferred — heavy import only when there's work
        import torchaudio
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS

        device = "mps" if torch.backends.mps.is_available() else "cpu"
        model = ChatterboxMultilingualTTS.from_pretrained(device=device)

        voice_ref = os.path.join(os.path.dirname(os.path.abspath(__file__)), "voice-ref.wav")
        gen_kwargs = {"language_id": args.lang}
        if os.path.exists(voice_ref):
            gen_kwargs["audio_prompt_path"] = voice_ref

        for key, text in todo:
            wav = model.generate(text, **gen_kwargs)
            final = os.path.join(args.out, f"{key}.{ext}")
            if ffmpeg:
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                    tmp_path = tmp.name
                torchaudio.save(tmp_path, wav, model.sr)
                subprocess.run(
                    [ffmpeg, "-y", "-loglevel", "error", "-i", tmp_path,
                     "-codec:a", "libmp3lame", "-qscale:a", "4", final],
                    check=True,
                )
                os.unlink(tmp_path)
            else:
                torchaudio.save(final, wav, model.sr)
            done += 1
            out({"done": done, "total": total, "file": f"{key}.{ext}"})

    manifest = {
        "voice": "chatterbox-multilingual-v3",
        "lang": args.lang,
        "files": {key: f"{key}.{ext}" for key, _ in sentences},
    }
    with open(os.path.join(args.out, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    out({"ok": True, "total": total})

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
    except Exception as e:  # noqa: surfaced to the bridge via stderr
        print(str(e), file=sys.stderr)
        sys.exit(1)
