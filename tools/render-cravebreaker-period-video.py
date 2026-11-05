"""Original arithmetic illustration, not native-app footage. Run from repo root."""
from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'src/cravebreaker/two-period-spending-comparison'
TMP = ROOT / '.period-video-frames'
TMP.mkdir(exist_ok=True)
BG, INK, MUTED, GREEN, GOLD = '#101f29', '#f7faf7', '#cad8db', '#9de4c3', '#ffe19b'
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

def text(draw, xy, content, size=38, color=INK, bold=False):
    draw.multiline_text(xy, content, fill=color, font=ImageFont.truetype(BOLD if bold else FONT, size), spacing=16)

def frame(n, label, title, body, note):
    im = Image.new('RGB', (720, 960), BG)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((44, 45, 676, 95), 20, fill='#254535')
    text(d, (64, 55), 'HONEST LITTLE APPS', 23, GREEN, True)
    text(d, (48, 132), label, 23, GOLD, True)
    text(d, (48, 196), title, 47, INK, True)
    d.line((48, 395, 672, 395), fill=GREEN, width=3)
    text(d, (48, 440), body, 37)
    text(d, (48, 790), note, 27, MUTED)
    text(d, (48, 902), f'ILLUSTRATED WEB EXAMPLE  /  {n} OF 4', 19, MUTED)
    im.save(TMP / f'{n}.png', optimize=True)
    return im

frames = [
 frame(1, 'SPENDING RECORDS', 'A smaller total.\nA higher daily rate?',
       'Compare the day counts\nbefore comparing the totals.\n\nFictional entries in CAD.',
       'Arithmetic only. No health\nor quitting result is implied.'),
 frame(2, 'DIVIDE EACH TOTAL BY ITS DAYS', 'Make the periods\ncomparable.',
       'Earlier: CAD 84 ÷ 28 days\n= CAD 3 per day\n\nLater: CAD 56 ÷ 14 days\n= CAD 4 per day',
       'Same currency in both records.\nNo currency conversion.'),
 frame(3, 'COMPARE THE DAILY RATES', 'Less in total.\nMore per day.',
       'Later total: CAD 56 < CAD 84\n\nLater daily rate:\nCAD 4 > CAD 3\n\nDifference: + CAD 1 per day',
       'Different-length periods can\nreverse a totals-only comparison.'),
 frame(4, 'TRY THE FREE WEB WORKSHEET', 'Use the records\nyou actually have.',
       'Enter both totals and day counts.\nCompare the daily averages.\n\nA spending difference does not\nexplain why spending changed.',
       'Separate CraveBreaker companion.\nOptional iPhone app linked below.')
]
frames[0].save(OUT / 'period-rates-poster.png', optimize=True)
contact = Image.new('RGB', (720, 960), '#ffffff')
for i, im in enumerate(frames):
    contact.paste(im.resize((360,480)), ((i%2)*360,(i//2)*480))
contact.save(TMP / 'contact.png')
for n in range(1,5):
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-loop','1','-i',str(TMP/f'{n}.png'),'-t','5','-r','24','-c:v','libx264','-tune','stillimage','-pix_fmt','yuv420p','-crf','26',str(TMP/f'{n}.mp4')], check=True)
(TMP/'concat.txt').write_text(''.join(f"file '{n}.mp4'\n" for n in range(1,5)))
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(TMP/'concat.txt'),'-c','copy','-movflags','+faststart',str(OUT/'period-rates.mp4')], check=True)
