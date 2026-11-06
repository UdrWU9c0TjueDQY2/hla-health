"""Render an original one-page classroom companion; no external assets or services."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'src/body-unpacked/anatomical-planes-explorer/plane-pair-teaching-card.pdf'
PAGE = 'https://udrwu9c0tjuedqy2.github.io/hla-health/body-unpacked/anatomical-planes-explorer/'
APPLE = 'https://apps.apple.com/us/app/body-unpacked-health-atlas/id6819135509'
SOURCE = 'https://training.seer.cancer.gov/anatomy/body/terminology.html'
FONT = Path('/usr/share/fonts/truetype/dejavu')
pdfmetrics.registerFont(TTFont('Card', str(FONT / 'DejaVuSans.ttf')))
pdfmetrics.registerFont(TTFont('CardBold', str(FONT / 'DejaVuSans-Bold.ttf')))
INK, TEAL, ORANGE = map(HexColor, ['#173d48', '#247378', '#a34024'])
PAPER, LINE = map(HexColor, ['#eff5f4', '#9bb9ba'])
W, H = A4
c = canvas.Canvas(str(OUT), pagesize=A4, pageCompression=1, invariant=1)
c.setTitle('Name the split: three anatomical planes')
c.setAuthor('Honest Little Apps')
c.setSubject('Original general anatomy teaching card; separate Body Unpacked web companion')

def text(x, y, s, size=10, bold=False, color=INK):
    c.setFillColor(color); c.setFont('CardBold' if bold else 'Card', size); c.drawString(x, y, s)

def para(s, x, top, width, size=10, leading=14, color=INK):
    p = Paragraph(s, ParagraphStyle('card', fontName='Card', fontSize=size, leading=leading, textColor=color))
    _, h = p.wrap(width, H)
    p.drawOn(c, x, top-h)
    return top-h

def polygon(points, fill, stroke=INK):
    p=c.beginPath(); p.moveTo(*points[0])
    for pt in points[1:]:p.lineTo(*pt)
    p.close();c.setFillColor(fill);c.setStrokeColor(stroke);c.setLineWidth(1.3);c.drawPath(p,fill=1,stroke=1)

def diagram(x, y, kind):
    point=lambda a,b,z:(x+.7*a+.25*b,y+1.2*z+.18*b)
    polygon([point(0,0,0),point(100,0,0),point(100,100,0),point(100,100,100),point(0,100,100),point(0,0,100)],PAPER,LINE)
    pts = {'sagittal':[(50,0,0),(50,100,0),(50,100,100),(50,0,100)],
           'coronal':[(0,50,0),(100,50,0),(100,50,100),(0,50,100)],
           'transverse':[(0,0,50),(100,0,50),(100,100,50),(0,100,50)]}[kind]
    polygon([point(*p) for p in pts],Color(.98,.77,.64),ORANGE)
    c.setStrokeColor(INK);c.setLineWidth(1)
    for a,b in [((0,0,0),(100,0,0)),((100,0,0),(100,0,100)),((100,0,100),(0,0,100)),((0,0,100),(0,0,0)),((0,0,100),(0,100,100)),((0,100,100),(100,100,100)),((100,0,100),(100,100,100)),((100,0,0),(100,100,0)),((100,100,0),(100,100,100))]:
        c.line(*point(*a),*point(*b))
    text(x-8,y+64,'R',9,True);text(x+76,y+64,'L',9,True)
    text(x+15,y-14,'FRONT',8,True);text(x+70,y+146,'BACK',8,True)

text(36,H-36,'HONEST LITTLE APPS  /  ANATOMY PRACTICE',9,True,TEAL)
text(36,H-79,'Name the split.',32,True)
para('Say the two portions first. Then name the imaginary plane between them.',36,H-97,W-72,11,16)
para('Imagine an upright person inside each box, facing you. R and L mean the person\'s right and left. These original schematics are not scans, organ maps or clinical diagrams.',36,H-130,W-72,9.5,13)

cards=[('01','Left / right','SAGITTAL','sagittal','At the midline: median or midsagittal. A parallel off-center plane is parasagittal.'),
       ('02','Front / back','CORONAL','coronal','Also called frontal. Anterior means front; posterior means back.'),
       ('03','Upper / lower','TRANSVERSE','transverse','Also called axial. In this upright model, the plane runs horizontally.')]
gap=12;cw=(W-72-2*gap)/3;bottom=H-458
for i,(n,pair,name,kind,note) in enumerate(cards):
    x=36+i*(cw+gap)
    c.setFillColor(PAPER);c.setStrokeColor(LINE);c.roundRect(x,bottom,cw,275,7,fill=1,stroke=1)
    text(x+12,bottom+254,n,9,True,TEAL);text(x+12,bottom+233,pair,14,True)
    diagram(x+27,bottom+67,kind)
    text(x+12,bottom+44,name,10,True)
    para(note,x+12,bottom+37,cw-24,8.1,10.5)

text(36,H-488,'Cover the three names. Explain the split.',15,True)
questions=[('A','A horizontal slice across the upright box. What lies on its two sides?'),
           ('B','A vertical plane from front to back, away from the midline. Name it.'),
           ('C','Move a coronal plane forward. Does it become a different plane type?')]
y=H-511
for letter,question in questions:
    text(36,y,letter,10,True,TEAL)
    para(question,56,y+9,W-92,9.7,14)
    c.setStrokeColor(LINE);c.line(56,y-22,W-36,y-22);y-=52
c.setStrokeColor(LINE);c.setDash(3,3);c.line(36,170,W-36,170);c.setDash()
text(36,151,'CHECK TOGETHER',9,True,TEAL)
para('A: Upper and lower portions; transverse. B: Parasagittal, a sagittal plane. C: No. Its position changes; it still divides front and back.',36,140,W-72,9.2,13)
para('Definitions: <link href="'+SOURCE+'" color="#247378">NCI SEER Training - Anatomical Terminology</link> (checked November 5, 2026). Original diagrams and exercise by Honest Little Apps. General education only; not medical-image interpretation or personal advice. Free to print and share intact with credit.',36,103,W-72,8,11)
para('<link href="'+PAGE+'" color="#247378">Open the free plane explorer and complete text edition</link>  |  <link href="'+APPLE+'" color="#247378">Body Unpacked on the App Store</link>',36,55,W-72,8.6,12)
text(36,22,'Separate web companion. Honest Little Apps publishes Body Unpacked. No app install needed.',7.6)
c.showPage();c.save()
print(OUT)
