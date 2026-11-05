"""Evening schedule film. Requires source captures, Pillow, DejaVu fonts, and ffmpeg."""
from pathlib import Path
from subprocess import Popen,PIPE
import sys
from PIL import Image,ImageDraw,ImageFont
root=Path(sys.argv[1]).resolve()
fonts=Path('/usr/share/fonts/truetype/dejavu')
def font(name,size):return ImageFont.truetype(str(fonts/(name+'.ttf')),size)
label=font('DejaVuSans-Bold',14);headline=font('DejaVuSerif',35);caption=font('DejaVuSans',21)
scenes=[
(0,4,'finish','Pick one finish time: 00:10.\nUse your own tasks and minutes.'),
(4,8,'full','Six minutes to pack, 16 to read, four\nto set out clothes: start at 23:44.'),
(8,12,'change','For the shorter version, change Read\nfrom 16 minutes to zero. Rebuild.'),
(12,16,'short','The new plan starts at 00:00.\nBoth routines finish at 00:10.'),
(16,21,'steps','Six minutes to pack and four to set\nout clothes. Ten minutes in all.')
]
def stamp(sec):return f'00:00:{sec:02}.000'
vtt=[(a,b,t) for a,b,k,t in scenes]

(root/'two-start-times.vtt').write_text('WEBVTT\n\n'+'\n\n'.join(f'{stamp(a)} --> {stamp(b)}\n{t}' for a,b,t in vtt)+'\n')
proc=Popen(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','512x752','-r','6','-i','-','-an','-c:v','libx264','-profile:v','baseline','-level','3.0','-preset','medium','-crf','33','-pix_fmt','yuv420p','-movflags','+faststart',str(root/'two-start-times.mp4')],stdin=PIPE)
for a,b,shot,words in scenes:
    page=Image.open(root/(shot+'.png')).convert('RGB')
    im=Image.new('RGB',(512,752),'#182137');d=ImageDraw.Draw(im)
    d.text((32,18),'SLEEPWARD   /   WEB PLANNER',font=label,fill='#e8bc78')
    d.text((30,43),'One finish, two starts.',font=headline,fill='#fff5dc')
    d.rectangle((30,105,481,570),outline='#b78a8b',width=2);im.paste(page,(32,107))
    for line in words.splitlines():assert d.textlength(line,font=caption)<=449,line
    d.multiline_text((31,588),words,font=caption,fill='#fff5dc',spacing=8)
    d.line((32,688,480,688),fill='#c9aca2',width=1)
    d.text((32,704),'Example routine',font=label,fill='#e8bc78')
    d.text((480,704),'HONEST LITTLE APPS',font=label,fill='#e8bc78',anchor='ra')
    if a==0:im.save(root/'two-start-times-poster.webp',quality=78,method=6)
    for _ in range((b-a)*6):proc.stdin.write(im.tobytes())
proc.stdin.close()
if proc.wait():raise RuntimeError('encoding failed')
